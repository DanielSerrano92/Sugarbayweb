"use client";

import { useActionState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

import { dispatchAuthModalOpen } from "@/lib/auth/events";
import { addToCartAction, type AddToCartActionState } from "@/lib/cart/actions";
import { dispatchCartDrawerOpen } from "@/lib/cart/events";
import type { StoreProductDetail } from "@/lib/store/types";

type StoreProductPurchaseFormProps = {
  product: StoreProductDetail;
};

const initialState: AddToCartActionState = { status: "idle" };

function shouldShowSizeSelector(product: StoreProductDetail): boolean {
  if (product.productType !== "APPAREL") return false;
  return product.variants.some((variant) => variant.size !== "OS");
}

function getSizeOptions(
  product: StoreProductDetail,
): StoreProductDetail["variants"][number]["size"][] {
  const uniqueSizes = new Set<StoreProductDetail["variants"][number]["size"]>();

  for (const variant of product.variants) {
    if (variant.size !== "OS") {
      uniqueSizes.add(variant.size);
    }
  }

  return Array.from(uniqueSizes.values());
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="retro-card-action inline-flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Anadiendo..." : "Anadir al carrito"}
    </button>
  );
}

export default function StoreProductPurchaseForm({
  product,
}: StoreProductPurchaseFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(addToCartAction, initialState);

  const authRedirectTo = useMemo(() => {
    const currentSearch = searchParams.toString();
    return currentSearch ? `${pathname}?${currentSearch}` : pathname;
  }, [pathname, searchParams]);

  const inStockVariants = product.variants.filter(
    (variant) => variant.stock > 0,
  );

  useEffect(() => {
    if (state.status !== "auth_required") return;

    dispatchAuthModalOpen({
      mode: "login",
      redirectTo: state.redirectTo ?? authRedirectTo,
    });
  }, [authRedirectTo, state]);

  useEffect(() => {
    if (state.status !== "success") return;

    router.refresh();
    if (!state.redirectTo) {
      dispatchCartDrawerOpen();
    }
  }, [router, state]);

  if (product.variants.length === 0) {
    return (
      <p className="retro-concert-meta-item text-sm font-semibold text-zinc-800">
        Este producto no tiene variantes disponibles en este momento.
      </p>
    );
  }

  if (inStockVariants.length === 0) {
    return (
      <p className="retro-concert-meta-item text-sm font-semibold text-zinc-800">
        Temporalmente sin stock.
      </p>
    );
  }

  const showSizeSelector = shouldShowSizeSelector(product);
  const sizeOptions = getSizeOptions(product);
  const sizeToVariant = new Map(
    inStockVariants.map((variant) => [variant.size, variant] as const),
  );

  const defaultVariant = inStockVariants[0];
  const defaultSizeVariant = sizeOptions
    .map((size) => sizeToVariant.get(size))
    .find((variant): variant is NonNullable<typeof variant> =>
      Boolean(variant),
    );

  return (
    <form action={formAction} className="retro-concert-meta-item space-y-3">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="redirectTo" value="/store?cart=open" />
      <input type="hidden" name="authRedirectTo" value={authRedirectTo} />

      {showSizeSelector ? (
        <div>
          <label
            htmlFor="product-variant-id"
            className="retro-concert-meta-label mb-1.5 block"
          >
            Talla
          </label>
          <select
            id="product-variant-id"
            name="productVariantId"
            required
            defaultValue={defaultSizeVariant?.id ?? defaultVariant.id}
            className="win-input"
          >
            {sizeOptions.map((size) => {
              const variant = sizeToVariant.get(size);
              if (!variant) return null;

              return (
                <option key={variant.id} value={variant.id}>
                  {size}
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        <input type="hidden" name="productVariantId" value={defaultVariant.id} />
      )}

      <div>
        <label
          htmlFor="product-quantity"
          className="retro-concert-meta-label mb-1.5 block"
        >
          Cantidad
        </label>
        <input
          id="product-quantity"
          name="quantity"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          className="win-input"
        />
      </div>

      <SubmitButton />

      {state.status === "auth_required" ? (
        <p className="text-xs text-zinc-600">Abriendo login...</p>
      ) : null}
    </form>
  );
}
