"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { removeCartItemAction } from "@/lib/cart/actions";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";

type CartDrawerItem = {
  id: string;
  quantity: number;
  lineTotal: number;
  product: {
    name: string;
    slug: string;
    currency: string;
    coverImage: string | null;
  };
  variant: {
    title: string | null;
    size: string;
  };
};

type CartDrawerCart = {
  currency: string;
  totalItems: number;
  subtotal: number;
  items: CartDrawerItem[];
};

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  currentUserFirstName?: string;
  cart: CartDrawerCart | null;
};

export default function CartDrawer({
  open,
  onClose,
  currentUserFirstName,
  cart,
}: CartDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const focusableElements = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && focusableElements.length > 0) {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const cartItems = cart?.items ?? [];
  const hasItems = cartItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      <section
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="sb-window relative z-10 flex h-full w-full max-w-md flex-col rounded-l-2xl border-l shadow-2xl"
      >
        <header>
          <div className="sb-titlebar rounded-tl-2xl px-5 py-2">Carrito Sugarbay</div>
          <div className="border-b border-zinc-300 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {currentUserFirstName ? `Hola ${currentUserFirstName}` : "Sugarbay"}
          </p>
          <h2 id="cart-drawer-title" className="mt-1 text-2xl font-black text-zinc-900">
            Carrito
          </h2>
          </div>
        </header>

        {!currentUserFirstName ? (
          <div className="flex flex-1 flex-col justify-between p-5">
            <p className="sb-panel-soft rounded-xl px-4 py-3 text-sm text-zinc-700">
              Inicia sesion para ver tu carrito y continuar con checkout.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="sb-btn-secondary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold text-zinc-900"
              >
                Volver
              </button>
              <Link
                href="/login?redirect=/checkout"
                onClick={onClose}
                className="sb-btn-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
              >
                Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {!hasItems ? (
                <p className="sb-panel-soft rounded-xl px-4 py-3 text-sm text-zinc-700">
                  Tu carrito esta vacio. Explora la tienda y anade productos.
                </p>
              ) : (
                cartItems.map((item) => (
                  <article
                    key={item.id}
                    className="sb-panel-soft rounded-2xl p-3"
                  >
                    <div className="flex items-start gap-3">
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
                        <Link
                          href={`/store/${item.product.slug}`}
                          onClick={onClose}
                          className="block truncate text-sm font-semibold text-zinc-900 hover:text-emerald-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-zinc-500">
                          {item.variant.title ?? item.variant.size}
                        </p>
                        <p className="mt-1 text-xs font-medium text-zinc-700">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-zinc-900">
                        {formatCurrency(item.lineTotal, item.product.currency)}
                      </p>
                      <form action={removeCartItemAction}>
                        <input type="hidden" name="cartItemId" value={item.id} />
                        <button
                          type="submit"
                          className="sb-btn-danger rounded-lg px-3 py-1.5 text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              )}
            </div>

            <footer className="space-y-3 border-t border-zinc-300 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-zinc-600">Total</p>
                <p className="text-lg font-black text-zinc-900">
                  {formatCurrency(cart?.subtotal ?? 0, cart?.currency ?? "EUR")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="sb-btn-secondary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold text-zinc-900"
                >
                  Volver
                </button>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                    hasItems
                      ? "sb-btn-primary"
                      : "pointer-events-none border border-zinc-300 bg-zinc-300"
                  }`}
                  aria-disabled={!hasItems}
                >
                  Checkout
                </Link>
              </div>

              <Link
                href="/carrito"
                onClick={onClose}
                className="inline-flex text-xs font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Ver carrito completo
              </Link>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
