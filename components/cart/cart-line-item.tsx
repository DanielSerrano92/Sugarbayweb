import Image from "next/image";
import Link from "next/link";

import type { CartItemView } from "@/lib/repositories/cart";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/cart/actions";

type CartLineItemProps = {
  item: CartItemView;
};

export default function CartLineItem({ item }: CartLineItemProps) {
  return (
    <article className="retro-concert-card min-h-0 overflow-hidden">
      <div className="retro-concert-header">Producto</div>
      <div className="retro-concert-body">
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <div className="cart-modal-item-image relative h-28 w-full overflow-hidden sm:h-24">
            <Image
              src={resolveImageUrl(item.product.coverImage)}
              alt={item.product.name}
              fill
              className="object-cover object-center"
              sizes="120px"
            />
          </div>

          <div className="min-w-0 space-y-3">
            <div className="retro-concert-meta-item">
              <Link
                href={`/store/${item.product.slug}`}
                className="cart-modal-item-name block truncate text-base font-black uppercase tracking-[0.03em]"
              >
                {item.product.name}
              </Link>
              <p className="cart-modal-item-meta mt-1 text-xs">
                {item.variant.title ?? item.variant.size}
              </p>
              <p className="cart-modal-item-meta text-xs">
                {formatCurrency(item.unitPrice, item.product.currency)} x {item.quantity}
              </p>
              <p className="cart-modal-item-price mt-1 text-base font-black">
                {formatCurrency(item.lineTotal, item.product.currency)}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <form action={updateCartItemAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="cartItemId" value={item.id} />
                <label htmlFor={`qty-${item.id}`} className="sr-only">
                  Cantidad de {item.product.name}
                </label>
                <input
                  id={`qty-${item.id}`}
                  name="quantity"
                  type="number"
                  min={1}
                  max={Math.max(1, item.variant.stock)}
                  defaultValue={item.quantity}
                  className="win-input h-[2.1rem] w-20 px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="win-button"
                >
                  Actualizar
                </button>
              </form>

              <form action={removeCartItemAction} className="sm:justify-self-end">
                <input type="hidden" name="cartItemId" value={item.id} />
                <button
                  type="submit"
                  className="win-button cart-modal-remove-btn"
                >
                  Quitar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
