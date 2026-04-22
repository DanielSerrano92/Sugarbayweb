"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CheckoutAddressFields from "@/components/checkout/checkout-address-fields";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";
import {
  checkoutPayloadSchema,
  mapCheckoutIssuesToFieldErrors,
  type CheckoutAddressInput,
  type CheckoutPaymentMethod,
} from "@/lib/validators/checkout";

type CheckoutFlowItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    name: string;
    currency: string;
    coverImage: string | null;
  };
  variant: {
    title: string | null;
    size: string;
  };
};

type CheckoutFlowCart = {
  totalItems: number;
  subtotal: number;
  currency: string;
  items: CheckoutFlowItem[];
};

type CheckoutFlowProps = {
  cart: CheckoutFlowCart;
  initialShipping: CheckoutAddressInput;
  initialBilling: CheckoutAddressInput;
  initialUseSameAddress: boolean;
};

type CheckoutApiError = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

const CHECKOUT_DRAFT_STORAGE_KEY = "sugarbay.checkout.draft.v1";

const addressFieldKeys = [
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "province",
  "region",
  "country",
  "postalCode",
  "phone",
] as const;

function isAddressInput(value: unknown): value is CheckoutAddressInput {
  if (!value || typeof value !== "object") return false;

  return addressFieldKeys.every((key) => typeof (value as Record<string, unknown>)[key] === "string");
}

function mergeAddressInput(
  base: CheckoutAddressInput,
  next: CheckoutAddressInput,
): CheckoutAddressInput {
  return {
    ...base,
    ...next,
  };
}

export default function CheckoutFlow({
  cart,
  initialShipping,
  initialBilling,
  initialUseSameAddress,
}: CheckoutFlowProps) {
  const [shipping, setShipping] = useState<CheckoutAddressInput>(initialShipping);
  const [billing, setBilling] = useState<CheckoutAddressInput>(initialBilling);
  const [useSameAddress, setUseSameAddress] = useState(initialUseSameAddress);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawDraft = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      setDraftLoaded(true);
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as {
        shipping?: unknown;
        billing?: unknown;
        useSameAddress?: unknown;
        paymentMethod?: unknown;
      };

      const shippingDraft = parsedDraft.shipping;
      if (isAddressInput(shippingDraft)) {
        setShipping((current) => mergeAddressInput(current, shippingDraft));
      }

      const billingDraft = parsedDraft.billing;
      if (isAddressInput(billingDraft)) {
        setBilling((current) => mergeAddressInput(current, billingDraft));
      }

      if (typeof parsedDraft.useSameAddress === "boolean") {
        setUseSameAddress(parsedDraft.useSameAddress);
      }

      if (
        parsedDraft.paymentMethod === "card" ||
        parsedDraft.paymentMethod === "paypal"
      ) {
        setPaymentMethod(parsedDraft.paymentMethod);
      }
    } catch {
      window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded || typeof window === "undefined") return;

    window.localStorage.setItem(
      CHECKOUT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        shipping,
        billing,
        useSameAddress,
        paymentMethod,
      }),
    );
  }, [shipping, billing, useSameAddress, paymentMethod, draftLoaded]);

  const validationResult = useMemo(() => {
    return checkoutPayloadSchema.safeParse({
      shipping,
      billing,
      useSameAddress,
      paymentMethod,
    });
  }, [shipping, billing, useSameAddress, paymentMethod]);

  const clientFieldErrors = useMemo(() => {
    if (validationResult.success) {
      return {};
    }

    return mapCheckoutIssuesToFieldErrors(validationResult.error.issues);
  }, [validationResult]);

  const mergedFieldErrors = {
    ...clientFieldErrors,
    ...apiFieldErrors,
  };

  const canContinue =
    validationResult.success && paymentMethod === "card" && !isSubmitting;

  async function handleCheckoutSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validationResult.success) {
      setApiError("Revisa los datos marcados antes de continuar.");
      return;
    }

    if (paymentMethod !== "card") {
      setApiError("PayPal estara disponible proximamente. Usa tarjeta.");
      return;
    }

    setApiError(null);
    setApiFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping: validationResult.data.shipping,
          billing: validationResult.data.billing,
          useSameAddress: validationResult.data.useSameAddress,
          paymentMethod: validationResult.data.paymentMethod,
        }),
      });

      const payload = (await response.json()) as CheckoutApiError & { url?: string };

      if (!response.ok) {
        if (payload.fieldErrors) {
          setApiFieldErrors(payload.fieldErrors);
        }
        throw new Error(payload.message ?? "No se pudo iniciar el pago");
      }

      if (!payload.url) {
        throw new Error("Stripe no devolvio una URL de pago");
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
      }

      window.location.assign(payload.url);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el checkout",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCheckoutSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        <CheckoutAddressFields
          section="shipping"
          title="Direccion de envio"
          description="Necesitamos estos datos para preparar el pedido y generar el snapshot."
          values={shipping}
          errors={mergedFieldErrors}
          onFieldChange={(field, value) =>
            setShipping((current) => ({ ...current, [field]: value }))
          }
        />

        <div className="sb-panel rounded-2xl p-4">
          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={(event) => setUseSameAddress(event.target.checked)}
              className="sb-checkbox mt-0.5 h-4 w-4 rounded border-zinc-300"
            />
            <span>
              Usar la misma direccion para facturacion.
            </span>
          </label>
        </div>

        {useSameAddress ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Facturacion usara exactamente la misma direccion de envio.
          </div>
        ) : (
          <CheckoutAddressFields
            section="billing"
            title="Direccion de facturacion"
            description="Estos datos se usaran para la factura del pedido."
            values={billing}
            errors={mergedFieldErrors}
            onFieldChange={(field, value) =>
              setBilling((current) => ({ ...current, [field]: value }))
            }
          />
        )}
      </div>

      <aside className="sb-panel h-fit space-y-4 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-zinc-900">Resumen del pedido</h2>

        <div className="space-y-3">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="sb-panel-soft flex items-center gap-3 rounded-xl p-2"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={resolveImageUrl(item.product.coverImage)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {item.product.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.variant.title ?? item.variant.size}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.quantity} x {formatCurrency(item.unitPrice, item.product.currency)}
                </p>
              </div>
              <p className="text-sm font-bold text-zinc-900">
                {formatCurrency(item.lineTotal, item.product.currency)}
              </p>
            </article>
          ))}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-600">Items</dt>
            <dd className="font-medium text-zinc-900">{cart.totalItems}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-600">Total</dt>
            <dd className="text-xl font-black text-zinc-900">
              {formatCurrency(cart.subtotal, cart.currency)}
            </dd>
          </div>
        </dl>

        <fieldset className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <legend className="text-sm font-semibold text-zinc-800">Metodo de pago</legend>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="radio"
              name="payment-method"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              className="sb-radio h-4 w-4 border-zinc-300"
            />
            Tarjeta (Stripe)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-500">
            <input
              type="radio"
              name="payment-method"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
              className="h-4 w-4 border-zinc-300 text-zinc-400"
            />
            PayPal (proximamente)
          </label>
        </fieldset>

        <div className="space-y-2">
          <button
            type="submit"
            disabled={!canContinue}
            className="sb-btn-primary inline-flex w-full items-center justify-center px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Redirigiendo a Stripe..." : "Continuar a pago seguro"}
          </button>

          {paymentMethod === "paypal" ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              PayPal esta preparado a nivel de interfaz, pero aun no integrado.
            </p>
          ) : null}
        </div>

        {!canContinue ? (
          <p className="text-xs text-amber-700">
            Completa correctamente los formularios de envio y facturacion para continuar.
          </p>
        ) : null}

        {apiError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {apiError}
          </p>
        ) : null}

        <Link
          href="/carrito"
          className="inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-500"
        >
          Volver al carrito
        </Link>
      </aside>
    </form>
  );
}
