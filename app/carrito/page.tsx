import type { Metadata } from "next";
import Link from "next/link";

import CartLineItem from "@/components/cart/cart-line-item";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import { requireSession } from "@/lib/auth/dal";
import { clearCartAction } from "@/lib/cart/actions";
import { getCartForUser } from "@/lib/repositories/cart";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa tus productos y prepara el checkout seguro.",
};

export default async function CarritoPage() {
  const session = await requireSession("/carrito");
  const cart = await getCartForUser(session.userId);

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Carrito"
          title="Tu seleccion"
          description="Revisa cantidades, ajusta productos y contina al checkout seguro con Stripe."
        />
      )}
    >
      {cart.items.length === 0 ? (
        <EmptyState
          title="Tu carrito esta vacio"
          description="Explora la tienda y aade productos para comenzar."
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          <aside className="sb-panel h-fit rounded-2xl p-5">
            <h2 className="text-lg font-bold text-zinc-900">Resumen</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-600">Productos</dt>
                <dd className="font-medium text-zinc-900">{cart.totalItems}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-600">Subtotal</dt>
                <dd className="text-base font-black text-zinc-900">
                  {formatCurrency(cart.subtotal, cart.currency)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2">
              <Link
                href="/checkout"
                className="sb-btn-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
              >
                Ir al checkout
              </Link>
              <form action={clearCartAction}>
                <button
                  type="submit"
                  className="sb-btn-secondary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-zinc-200"
                >
                  Vaciar carrito
                </button>
              </form>
            </div>
          </aside>
        </section>
      )}
    </PageShell>
  );
}




