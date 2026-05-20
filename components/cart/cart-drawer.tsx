"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { dispatchAuthModalOpen } from "@/lib/auth/events";
import { removeCartItemAction } from "@/lib/cart/actions";
import { resolveImageUrl } from "@/lib/services/imagekit";
import {
  resolveStoreProductImageFitClass,
  resolveStoreProductImageUrl,
} from "@/lib/store/product-image-overrides";
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
    <div className="fixed inset-0 z-50 flex items-start justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="retro-vapor-overlay absolute inset-0"
      />

      <section
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="win-window cart-modal-window relative z-10 flex w-full max-w-4xl min-h-0 flex-col overflow-hidden p-0"
      >
        <header className="shrink-0">
          <div className="win-titlebar flex items-center justify-between gap-3">
            <h2 id="cart-drawer-title" className="min-w-0 truncate pr-2">
              CARRITO
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="win-button retro-win-close"
            >
              X
            </button>
          </div>
          <div className="cart-modal-subheader border-b px-4 py-3 sm:px-5">
            <p className="cart-modal-user text-xs uppercase tracking-[0.18em]">
              {currentUserFirstName ? `Hola ${currentUserFirstName}` : "Sugarbay"}
            </p>
            <p className="cart-modal-caption mt-1 text-xs">
              Resumen rapido de tu pedido
            </p>
          </div>
        </header>

        {!currentUserFirstName ? (
          <div className="cart-modal-guest flex flex-1 flex-col justify-between p-4 sm:p-5">
            <p className="cart-modal-empty text-sm">
              Inicia sesion para ver tu carrito y continuar con checkout.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="win-button cart-modal-action-btn inline-flex w-full items-center justify-center"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  dispatchAuthModalOpen({
                    mode: "login",
                    redirectTo: "/checkout",
                  });
                }}
                className="sb-btn-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-modal-items flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              {!hasItems ? (
                <p className="cart-modal-empty text-sm">
                  Tu carrito esta vacio. Explora la tienda y anade productos.
                </p>
              ) : (
                cartItems.map((item) => {
                  const productImageUrl = resolveStoreProductImageUrl(
                    item.product.slug,
                    item.product.coverImage,
                    item.product.name,
                  );
                  const productImageFitClass = resolveStoreProductImageFitClass(
                    item.product.slug,
                    item.product.name,
                  );

                  return (
                    <article
                      key={item.id}
                      className="cart-modal-item p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="cart-modal-item-image relative h-16 w-16 shrink-0 overflow-hidden">
                          <Image
                            src={resolveImageUrl(productImageUrl)}
                            alt={item.product.name}
                            fill
                            className={productImageFitClass}
                            sizes="64px"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/store/${item.product.slug}`}
                            onClick={onClose}
                            className="cart-modal-item-name block truncate text-sm font-black uppercase tracking-[0.04em]"
                          >
                            {item.product.name}
                          </Link>
                          <p className="cart-modal-item-meta text-xs">
                            {item.variant.title ?? item.variant.size}
                          </p>
                          <p className="cart-modal-item-meta mt-1 text-xs font-semibold">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="cart-modal-item-price text-sm font-black">
                          {formatCurrency(item.lineTotal, item.product.currency)}
                        </p>
                        <form action={removeCartItemAction}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <button
                            type="submit"
                            className="win-button cart-modal-remove-btn"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <footer className="cart-modal-footer space-y-3 border-t px-4 py-4 sm:px-5">
              <div className="cart-modal-total-row flex items-center justify-between text-sm">
                <p className="cart-modal-total-label">Total</p>
                <p className="cart-modal-total-value text-lg font-black">
                  {formatCurrency(cart?.subtotal ?? 0, cart?.currency ?? "EUR")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="win-button cart-modal-action-btn inline-flex w-full items-center justify-center"
                >
                  Volver
                </button>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className={`win-button cart-modal-action-btn inline-flex w-full items-center justify-center ${
                    hasItems
                      ? "cart-modal-checkout-btn"
                      : "cart-modal-action-disabled pointer-events-none"
                  }`}
                  aria-disabled={!hasItems}
                >
                  Checkout
                </Link>
              </div>

              <Link
                href="/store?cart=open"
                onClick={onClose}
                className="cart-modal-full-link inline-flex text-xs font-semibold"
              >
                Ver carrito en tienda
              </Link>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
