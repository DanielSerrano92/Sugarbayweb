import Image from "next/image";
import Link from "next/link";

import type { StoreProductCard } from "@/lib/store/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";

type StoreProductCardProps = {
  product: StoreProductCard;
};

export default function StoreProductCard({ product }: StoreProductCardProps) {
  return (
    <article className="sb-panel overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-300">
      <Link href={`/store/${product.slug}`} className="block">
        <div className="relative h-56 w-full overflow-hidden bg-zinc-100">
          <Image
            src={resolveImageUrl(product.coverImageUrl)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {product.category.name}
        </p>

        <Link
          href={`/store/${product.slug}`}
          className="line-clamp-2 text-lg font-bold text-zinc-900 hover:text-emerald-600"
        >
          {product.name}
        </Link>

        {product.compareAtPrice ? (
          <p className="text-xs text-zinc-400 line-through">
            {formatCurrency(product.compareAtPrice, product.currency)}
          </p>
        ) : null}
        <p className="text-lg font-black text-zinc-900">
          {formatCurrency(product.price, product.currency)}
        </p>
      </div>
    </article>
  );
}
