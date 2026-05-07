"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CART_CLEARED_EVENT } from "@/lib/cart/events";

type CheckoutCartSyncProps = {
  checkoutSessionId: string;
  shouldClearCart: boolean;
};

export default function CheckoutCartSync({
  checkoutSessionId,
  shouldClearCart,
}: CheckoutCartSyncProps) {
  const router = useRouter();

  useEffect(() => {
    if (!shouldClearCart) return;

    const refreshKey = `sugarbay.checkout.cart-sync.${checkoutSessionId}`;
    if (window.sessionStorage.getItem(refreshKey)) return;

    window.sessionStorage.setItem(refreshKey, "1");
    window.dispatchEvent(new Event(CART_CLEARED_EVENT));
    router.refresh();
  }, [checkoutSessionId, router, shouldClearCart]);

  return null;
}
