import type { Metadata } from "next";
import Link from "next/link";

import CartLineItem from "@/components/cart/cart-line-item";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { requireSession } from "@/lib/auth/dal";
import { clearCartAction } from "@/lib/cart/actions";
import { getCartForUser } from "@/lib/repositories/cart";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa tus productos y prepara el checkout seguro.",
};

const CARRITO_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/carrito.png?tr=w-2400,h-760,cm-extract,fo-top";

export default async function CarritoPage() {
  const session = await requireSession("/carrito");
  const cart = await getCartForUser(session.userId);

  return (
    <PageShell
      eyebrow="Carrito"
      title="Tu seleccion"
      description="Revisa cantidades, ajusta productos y contina al checkout seguro con Stripe."
      headerImageSrc={CARRITO_PAGE_HEADER_IMAGE_SRC}
    >
      {cart.items.length === 0 ? (
        <EmptyState
          title="Tu carrito esta vacio"
          description="Explora la tienda y aade productos para comenzar."
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          <aside className="retro-concert-card h-fit min-h-0 overflow-hidden">
            <div className="retro-concert-header">Resumen</div>
            <div className="retro-concert-body">
              <dl className="cart-modal-total-row space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="cart-modal-total-label">Productos</dt>
                  <dd className="cart-modal-total-value">{cart.totalItems}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="cart-modal-total-label">Subtotal</dt>
                  <dd className="cart-modal-total-value text-base font-black">
                    {formatCurrency(cart.subtotal, cart.currency)}
                  </dd>
                </div>
              </dl>

              <div className="retro-card-actions retro-card-actions-upcoming">
                <Link
                  href="/checkout"
                  className="retro-card-action"
                >
                  Ir al checkout
                </Link>
                <form action={clearCartAction} className="w-full">
                  <button
                    type="submit"
                    className="retro-card-action"
                  >
                    Vaciar carrito
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </section>
      )}
    </PageShell>
  );
}




