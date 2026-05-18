"use client";

import { useActionState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { dispatchAuthModalOpen } from "@/lib/auth/events";
import { addToCartAction, type AddToCartActionState } from "@/lib/cart/actions";
import { dispatchCartDrawerOpen } from "@/lib/cart/events";

import AddToCartButton from "./add-to-cart-button";

type AddToCartFormProps = {
  productId: string;
  productVariantId?: string;
  quantity?: number;
  redirectTo?: string;
  compact?: boolean;
};

const initialState: AddToCartActionState = { status: "idle" };

export default function AddToCartForm({
  productId,
  productVariantId,
  quantity = 1,
  redirectTo,
  compact,
}: AddToCartFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(addToCartAction, initialState);
  const authRedirectTo = useMemo(() => {
    const currentSearch = searchParams.toString();
    return currentSearch ? `${pathname}?${currentSearch}` : pathname;
  }, [pathname, searchParams]);

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

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="productId" value={productId} />
      {productVariantId ? (
        <input type="hidden" name="productVariantId" value={productVariantId} />
      ) : null}
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <input type="hidden" name="authRedirectTo" value={authRedirectTo} />
      <AddToCartButton compact={compact} />
      {state.status === "auth_required" ? (
        <p className="text-xs text-zinc-600">Abriendo login...</p>
      ) : null}
    </form>
  );
}
