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
    <article className="sb-panel grid gap-4 rounded-2xl p-4 sm:grid-cols-[120px_1fr]">
      <div className="relative h-28 w-full overflow-hidden rounded-xl bg-zinc-100 sm:h-24">
        <Image
          src={resolveImageUrl(item.product.coverImage)}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="120px"
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Link
            href={`/store/${item.product.slug}`}
            className="text-base font-bold text-zinc-900 hover:text-emerald-600"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-zinc-600">
            {formatCurrency(item.unitPrice, item.product.currency)} x {item.quantity}
          </p>
          <p className="text-xs text-zinc-500">
            {item.variant.title ?? item.variant.size}
          </p>
          <p className="text-base font-black text-zinc-900">
            {formatCurrency(item.lineTotal, item.product.currency)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={updateCartItemAction} className="flex items-center gap-2">
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
              className="sb-input w-20 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="sb-btn-secondary rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-200"
            >
              Actualizar
            </button>
          </form>

          <form action={removeCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <button
              type="submit"
              className="sb-btn-danger rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              Quitar
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
