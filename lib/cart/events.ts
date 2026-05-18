export const CART_CLEARED_EVENT = "sugarbay:cart-cleared";
export const CART_DRAWER_OPEN_EVENT = "sugarbay:cart-drawer-open";

export function dispatchCartDrawerOpen(): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(CART_DRAWER_OPEN_EVENT));
}
