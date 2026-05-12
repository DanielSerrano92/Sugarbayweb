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

        <article className="retro-concert-card checkout-retro-mini-card min-h-0 overflow-hidden">
          <div className="retro-concert-header">Facturacion</div>
          <div className="retro-concert-body">
            <label className="checkout-retro-checkbox flex items-start gap-3 text-sm">
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
        </article>

        {useSameAddress ? (
          <div className="checkout-retro-note text-sm">
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

      <aside className="retro-concert-card checkout-retro-summary h-fit min-h-0 overflow-hidden">
        <div className="retro-concert-header">Resumen del pedido</div>
        <div className="retro-concert-body">

          <div className="space-y-3">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="retro-concert-meta-item checkout-retro-item flex items-center gap-3"
              >
                <div className="checkout-retro-item-image relative h-16 w-16 shrink-0 overflow-hidden">
                  <Image
                    src={resolveImageUrl(item.product.coverImage)}
                    alt={item.product.name}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black uppercase tracking-[0.03em] text-[#171717]">
                    {item.product.name}
                  </p>
                  <p className="checkout-retro-item-meta text-xs">
                    {item.variant.title ?? item.variant.size}
                  </p>
                  <p className="checkout-retro-item-meta text-xs">
                    {item.quantity} x {formatCurrency(item.unitPrice, item.product.currency)}
                  </p>
                </div>
                <p className="checkout-retro-item-price text-sm font-black">
                  {formatCurrency(item.lineTotal, item.product.currency)}
                </p>
              </article>
            ))}
          </div>

          <dl className="checkout-retro-totals space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="checkout-retro-total-label">Items</dt>
              <dd className="checkout-retro-total-value">{cart.totalItems}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="checkout-retro-total-label">Total</dt>
              <dd className="checkout-retro-total-value checkout-retro-total-amount text-xl">
                {formatCurrency(cart.subtotal, cart.currency)}
              </dd>
            </div>
          </dl>

          <fieldset className="checkout-retro-payment space-y-2">
            <legend className="checkout-retro-payment-title">Metodo de pago</legend>
            <label className="checkout-retro-payment-option flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment-method"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="sb-radio h-4 w-4 border-zinc-300"
              />
              Tarjeta (Stripe)
            </label>
            <label className="checkout-retro-payment-option checkout-retro-payment-option-muted flex items-center gap-2 text-sm">
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

          <div className="retro-card-actions retro-card-actions-upcoming">
            <button
              type="submit"
              disabled={!canContinue}
              className={`retro-card-action w-full ${!canContinue ? "is-disabled" : ""}`}
            >
              {isSubmitting ? "Redirigiendo a Stripe..." : "Continuar a pago seguro"}
            </button>

            <Link href="/carrito" className="retro-card-action w-full">
              Volver al carrito
            </Link>
          </div>

          {paymentMethod === "paypal" ? (
            <p className="checkout-retro-alert checkout-retro-alert-warn text-xs">
              PayPal esta preparado a nivel de interfaz, pero aun no integrado.
            </p>
          ) : null}

          {!canContinue ? (
            <p className="checkout-retro-alert checkout-retro-alert-note text-xs">
              Completa correctamente los formularios de envio y facturacion para continuar.
            </p>
          ) : null}

          {apiError ? (
            <p className="checkout-retro-alert checkout-retro-alert-error text-xs">
              {apiError}
            </p>
          ) : null}

        </div>
      </aside>
    </form>
  );
}
