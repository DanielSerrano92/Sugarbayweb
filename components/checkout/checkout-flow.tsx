"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type SavedAddressType = "SHIPPING" | "BILLING";
type SavedAddressLoadStatus = "loading" | "ready" | "empty" | "error";
type AddressInputMode = "saved" | "manual";

type SavedAddressRecord = {
  id: string;
  type: SavedAddressType;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const CHECKOUT_DRAFT_STORAGE_KEY = "sugarbay.checkout.draft.v1";
const REGION_SEPARATOR = " | ";

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

const requiredAddressFieldKeys: Array<keyof CheckoutAddressInput> = [
  "firstName",
  "lastName",
  "address1",
  "city",
  "province",
  "region",
  "country",
  "postalCode",
];

function splitRecipientName(
  recipientName: string | null | undefined,
): { firstName: string; lastName: string } {
  const trimmed = recipientName?.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  const normalizedFirstName = firstName ?? "";
  const normalizedLastName = rest.join(" ").trim();

  return {
    // Las direcciones de cuenta usan "Nombre completo" en un solo campo.
    // Si viene una sola palabra, evitamos bloquear checkout por apellido vacio.
    firstName: normalizedFirstName,
    lastName: normalizedLastName || normalizedFirstName,
  };
}

function splitStoredRegion(value: string | null | undefined): {
  province: string;
  region: string;
} {
  const normalized = value?.trim();
  if (!normalized) {
    return {
      province: "",
      region: "",
    };
  }

  if (!normalized.includes(REGION_SEPARATOR)) {
    return {
      province: normalized,
      region: normalized,
    };
  }

  const [province, region] = normalized.split(REGION_SEPARATOR);

  return {
    province: province?.trim() ?? "",
    region: region?.trim() ?? "",
  };
}

function mapAddressToCheckoutForm(address: SavedAddressRecord): CheckoutAddressInput {
  const recipient = splitRecipientName(address.recipientName);
  const region = splitStoredRegion(address.region);

  return {
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    address1: address.line1,
    address2: address.line2 ?? "",
    city: address.city,
    province: region.province,
    region: region.region,
    country: address.country,
    postalCode: address.postalCode,
    phone: address.phone ?? "",
  };
}

function isAddressInput(value: unknown): value is CheckoutAddressInput {
  if (!value || typeof value !== "object") return false;

  return addressFieldKeys.every(
    (key) => typeof (value as Record<string, unknown>)[key] === "string",
  );
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

function areAddressInputsEquivalent(
  left: CheckoutAddressInput,
  right: CheckoutAddressInput,
): boolean {
  return addressFieldKeys.every((key) => left[key] === right[key]);
}

function isAddressComplete(value: CheckoutAddressInput): boolean {
  return requiredAddressFieldKeys.every((field) => value[field].trim().length > 0);
}

function isSavedAddressComplete(address: SavedAddressRecord): boolean {
  return isAddressComplete(mapAddressToCheckoutForm(address));
}

function pickPreferredSavedAddress(
  addresses: SavedAddressRecord[],
  type: SavedAddressType,
): SavedAddressRecord | null {
  const candidates = addresses.filter((address) => address.type === type);
  if (candidates.length === 0) return null;

  const rankedCandidates = [...candidates].sort((left, right) => {
    const leftComplete = isSavedAddressComplete(left);
    const rightComplete = isSavedAddressComplete(right);

    if (leftComplete !== rightComplete) {
      return leftComplete ? -1 : 1;
    }

    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

  return rankedCandidates[0] ?? null;
}

function formatSavedAddressLine(address: SavedAddressRecord): string {
  return [address.line1, address.line2].filter(Boolean).join(", ");
}

async function fetchSavedAddresses(): Promise<{
  ok: true;
  addresses: SavedAddressRecord[];
} | {
  ok: false;
  message: string;
}> {
  try {
    const response = await fetch("/api/account/addresses", {
      method: "GET",
    });

    const payload = (await response.json()) as {
      message?: string;
      addresses?: SavedAddressRecord[];
    };

    if (!response.ok) {
      return {
        ok: false,
        message: payload.message ?? "No se pudieron cargar las direcciones guardadas.",
      };
    }

    return {
      ok: true,
      addresses: Array.isArray(payload.addresses) ? payload.addresses : [],
    };
  } catch {
    return {
      ok: false,
      message: "No se pudieron cargar las direcciones guardadas.",
    };
  }
}

function SavedAddressSelector({
  section,
  mode,
  selectedAddressId,
  addresses,
  status,
  errorMessage,
  onSelectSavedAddress,
  onSelectManualAddress,
  onRetry,
}: {
  section: "shipping" | "billing";
  mode: AddressInputMode;
  selectedAddressId: string | null;
  addresses: SavedAddressRecord[];
  status: SavedAddressLoadStatus;
  errorMessage: string | null;
  onSelectSavedAddress: (addressId: string) => void;
  onSelectManualAddress: () => void;
  onRetry: () => void;
}) {
  const type = section === "shipping" ? "SHIPPING" : "BILLING";
  const title = section === "shipping" ? "Direcciones de envio guardadas" : "Direcciones de facturacion guardadas";
  const manualLabel =
    section === "shipping"
      ? "Usar otra direccion de envio"
      : "Usar otra direccion de facturacion";
  const sectionAddresses = addresses.filter((address) => address.type === type);

  return (
    <article className="retro-concert-card checkout-retro-mini-card min-h-0 overflow-hidden">
      <div className="retro-concert-header">{title}</div>
      <div className="retro-concert-body">
        {status === "loading" ? (
          <p className="checkout-retro-alert checkout-retro-alert-note text-xs">
            Cargando direcciones guardadas...
          </p>
        ) : null}

        {status === "error" ? (
          <div className="checkout-address-selector-status">
            <p className="checkout-retro-alert checkout-retro-alert-error text-xs">
              {errorMessage ?? "No se pudieron cargar las direcciones guardadas."}
            </p>
            <button type="button" onClick={onRetry} className="win-button w-fit">
              Reintentar
            </button>
          </div>
        ) : null}

        {status === "empty" ? (
          <p className="checkout-retro-alert checkout-retro-alert-note text-xs">
            No tienes direcciones guardadas. Puedes introducirla manualmente.
          </p>
        ) : null}

        {status === "ready" && sectionAddresses.length > 0 ? (
          <div className="checkout-address-selector-list">
            {sectionAddresses.map((address) => {
              const mappedAddress = mapAddressToCheckoutForm(address);
              const isComplete = isAddressComplete(mappedAddress);
              const isSelected = mode === "saved" && selectedAddressId === address.id;

              return (
                <label
                  key={address.id}
                  className={`checkout-address-choice ${
                    isSelected ? "is-selected" : ""
                  } ${!isComplete ? "is-disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name={`${section}-saved-address`}
                    className="sb-radio mt-0.5 h-4 w-4 border-zinc-300"
                    checked={isSelected}
                    disabled={!isComplete}
                    onChange={() => onSelectSavedAddress(address.id)}
                  />
                  <span className="checkout-address-choice-content">
                    <span className="checkout-address-choice-title">
                      {address.label?.trim() || "Direccion guardada"}
                      {address.isDefault ? (
                        <span className="checkout-address-default-tag">Predeterminada</span>
                      ) : null}
                    </span>
                    <span className="checkout-address-choice-line">{address.recipientName}</span>
                    <span className="checkout-address-choice-line">
                      {formatSavedAddressLine(address)}
                    </span>
                    <span className="checkout-address-choice-line">
                      {address.postalCode} · {address.city}
                    </span>
                    <span className="checkout-address-choice-line">
                      {address.country}
                      {address.phone ? ` · ${address.phone}` : ""}
                    </span>
                    {!isComplete ? (
                      <span className="checkout-address-choice-warning">
                        Esta direccion no esta completa para checkout.
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}

        <label className={`checkout-address-choice ${mode === "manual" ? "is-selected" : ""}`}>
          <input
            type="radio"
            name={`${section}-saved-address`}
            className="sb-radio mt-0.5 h-4 w-4 border-zinc-300"
            checked={mode === "manual"}
            onChange={onSelectManualAddress}
          />
          <span className="checkout-address-choice-content">
            <span className="checkout-address-choice-title">{manualLabel}</span>
            <span className="checkout-address-choice-line">
              Introducir direccion manualmente para este checkout.
            </span>
          </span>
        </label>
      </div>
    </article>
  );
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

  const [savedAddressesStatus, setSavedAddressesStatus] =
    useState<SavedAddressLoadStatus>("loading");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRecord[]>([]);
  const [savedAddressesError, setSavedAddressesError] = useState<string | null>(null);
  const [savedAddressSelectionResolved, setSavedAddressSelectionResolved] = useState(false);

  const [shippingMode, setShippingMode] = useState<AddressInputMode>("manual");
  const [billingMode, setBillingMode] = useState<AddressInputMode>("manual");
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(
    null,
  );
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(
    null,
  );

  const loadSavedAddresses = useCallback(async () => {
    setSavedAddressesStatus("loading");
    setSavedAddressesError(null);
    setSavedAddressSelectionResolved(false);

    const response = await fetchSavedAddresses();
    if (!response.ok) {
      setSavedAddresses([]);
      setSavedAddressesStatus("error");
      setSavedAddressesError(response.message);
      return;
    }

    setSavedAddresses(response.addresses);
    setSavedAddressesStatus(response.addresses.length > 0 ? "ready" : "empty");
  }, []);

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
    void loadSavedAddresses();
  }, [loadSavedAddresses]);

  useEffect(() => {
    if (!draftLoaded || savedAddressSelectionResolved) return;
    if (savedAddressesStatus === "loading") return;

    if (savedAddressesStatus === "error" || savedAddressesStatus === "empty") {
      setShippingMode("manual");
      setBillingMode("manual");
      setSelectedShippingAddressId(null);
      setSelectedBillingAddressId(null);
      setSavedAddressSelectionResolved(true);
      return;
    }

    const shippingCandidates = savedAddresses.filter((address) => address.type === "SHIPPING");
    const billingCandidates = savedAddresses.filter((address) => address.type === "BILLING");

    const matchedShipping = shippingCandidates.find(
      (address) =>
        isSavedAddressComplete(address) &&
        areAddressInputsEquivalent(mapAddressToCheckoutForm(address), shipping),
    );

    if (matchedShipping) {
      setShippingMode("saved");
      setSelectedShippingAddressId(matchedShipping.id);
    } else {
      const preferredShipping = pickPreferredSavedAddress(savedAddresses, "SHIPPING");
      if (
        preferredShipping &&
        isSavedAddressComplete(preferredShipping) &&
        !isAddressComplete(shipping)
      ) {
        setShipping(mapAddressToCheckoutForm(preferredShipping));
        setShippingMode("saved");
        setSelectedShippingAddressId(preferredShipping.id);
      } else {
        setShippingMode("manual");
        setSelectedShippingAddressId(null);
      }
    }

    if (!useSameAddress) {
      const matchedBilling = billingCandidates.find(
        (address) =>
          isSavedAddressComplete(address) &&
          areAddressInputsEquivalent(mapAddressToCheckoutForm(address), billing),
      );

      if (matchedBilling) {
        setBillingMode("saved");
        setSelectedBillingAddressId(matchedBilling.id);
      } else {
        const preferredBilling = pickPreferredSavedAddress(savedAddresses, "BILLING");
        if (
          preferredBilling &&
          isSavedAddressComplete(preferredBilling) &&
          !isAddressComplete(billing)
        ) {
          setBilling(mapAddressToCheckoutForm(preferredBilling));
          setBillingMode("saved");
          setSelectedBillingAddressId(preferredBilling.id);
        } else {
          setBillingMode("manual");
          setSelectedBillingAddressId(null);
        }
      }
    } else {
      setBillingMode("manual");
      setSelectedBillingAddressId(null);
    }

    setSavedAddressSelectionResolved(true);
  }, [
    billing,
    draftLoaded,
    savedAddressSelectionResolved,
    savedAddresses,
    savedAddressesStatus,
    shipping,
    useSameAddress,
  ]);

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
    validationResult.success &&
    paymentMethod === "card" &&
    !isSubmitting &&
    (shippingMode === "manual" || selectedShippingAddressId !== null) &&
    (useSameAddress || billingMode === "manual" || selectedBillingAddressId !== null);

  function handleSelectSavedShippingAddress(addressId: string) {
    const selectedAddress = savedAddresses.find(
      (address) => address.id === addressId && address.type === "SHIPPING",
    );
    if (!selectedAddress) return;

    setShipping(mapAddressToCheckoutForm(selectedAddress));
    setSelectedShippingAddressId(addressId);
    setShippingMode("saved");
    setApiError(null);
    setApiFieldErrors({});
  }

  function handleSelectSavedBillingAddress(addressId: string) {
    const selectedAddress = savedAddresses.find(
      (address) => address.id === addressId && address.type === "BILLING",
    );
    if (!selectedAddress) return;

    setBilling(mapAddressToCheckoutForm(selectedAddress));
    setSelectedBillingAddressId(addressId);
    setBillingMode("saved");
    setApiError(null);
    setApiFieldErrors({});
  }

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
        error instanceof Error ? error.message : "No se pudo iniciar el checkout",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCheckoutSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        <SavedAddressSelector
          section="shipping"
          mode={shippingMode}
          selectedAddressId={selectedShippingAddressId}
          addresses={savedAddresses}
          status={savedAddressesStatus}
          errorMessage={savedAddressesError}
          onSelectSavedAddress={handleSelectSavedShippingAddress}
          onSelectManualAddress={() => {
            setShippingMode("manual");
            setSelectedShippingAddressId(null);
          }}
          onRetry={() => {
            void loadSavedAddresses();
          }}
        />

        <CheckoutAddressFields
          section="shipping"
          title="Direccion de envio"
          description={
            shippingMode === "saved"
              ? "Estas usando una direccion guardada. Selecciona 'Usar otra direccion' para editar manualmente."
              : "Necesitamos estos datos para preparar el pedido y generar el snapshot."
          }
          values={shipping}
          errors={mergedFieldErrors}
          disabled={shippingMode === "saved"}
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
              <span>Usar la misma direccion para facturacion.</span>
            </label>
          </div>
        </article>

        {useSameAddress ? (
          <div className="checkout-retro-note text-sm">
            Facturacion usara exactamente la misma direccion de envio.
          </div>
        ) : (
          <>
            <SavedAddressSelector
              section="billing"
              mode={billingMode}
              selectedAddressId={selectedBillingAddressId}
              addresses={savedAddresses}
              status={savedAddressesStatus}
              errorMessage={savedAddressesError}
              onSelectSavedAddress={handleSelectSavedBillingAddress}
              onSelectManualAddress={() => {
                setBillingMode("manual");
                setSelectedBillingAddressId(null);
              }}
              onRetry={() => {
                void loadSavedAddresses();
              }}
            />

            <CheckoutAddressFields
              section="billing"
              title="Direccion de facturacion"
              description={
                billingMode === "saved"
                  ? "Estas usando una direccion guardada. Selecciona 'Usar otra direccion' para editar manualmente."
                  : "Estos datos se usaran para la factura del pedido."
              }
              values={billing}
              errors={mergedFieldErrors}
              disabled={billingMode === "saved"}
              onFieldChange={(field, value) =>
                setBilling((current) => ({ ...current, [field]: value }))
              }
            />
          </>
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

            <Link href="/store?cart=open" className="retro-card-action w-full">
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
