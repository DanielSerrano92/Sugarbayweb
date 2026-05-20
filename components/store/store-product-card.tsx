import Image from "next/image";
import Link from "next/link";

import {
  resolveStoreProductImageFitClass,
  resolveStoreProductImageUrl,
} from "@/lib/store/product-image-overrides";
import type { StoreProductCard } from "@/lib/store/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";

type StoreProductCardProps = {
  product: StoreProductCard;
};

function RetroPriceIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M8 1L11 2V6H15V10H11V14L8 15L5 14V10H1V6H5V2L8 1ZM7 3V7H3V9H7V13H9V9H13V7H9V3H7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RetroTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M2 2H9L14 7L7 14L2 9V2ZM4 4V8.2L7 11.2L11.2 7L8.2 4H4ZM6 5.4A1.2 1.2 0 1 1 6 7.8A1.2 1.2 0 0 1 6 5.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function StoreProductCard({ product }: StoreProductCardProps) {
  const productHref = `/store/${product.slug}`;
  const productImageUrl = resolveStoreProductImageUrl(
    product.slug,
    product.coverImageUrl,
    product.name,
  );
  const productImageFitClass = resolveStoreProductImageFitClass(product.slug, product.name);

  return (
    <article className="retro-concert-card w-full overflow-hidden">
      <div className="retro-concert-header">
        {product.category.name}
      </div>

      <div className="retro-concert-body">
        <Link
          href={productHref}
          className="retro-concert-meta-item !p-0 overflow-hidden"
          aria-label={`Ver detalle de ${product.name}`}
        >
          <div className="relative h-60 bg-zinc-100">
            <Image
              src={resolveImageUrl(productImageUrl)}
              alt={product.name}
              fill
              className={productImageFitClass}
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
        </Link>

        <div className="retro-concert-title-block">
          <h2 className="retro-concert-title">{product.name}</h2>
        </div>

        <div className="retro-concert-meta">
          <div className="retro-concert-meta-item">
            <p className="retro-concert-meta-label">Precio</p>
            <div className="retro-concert-row">
              <RetroPriceIcon />
              <span>{formatCurrency(product.price, product.currency)}</span>
            </div>
            {product.compareAtPrice ? (
              <p className="pl-8 text-sm font-semibold text-zinc-600 line-through">
                {formatCurrency(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
          </div>

          <div className="retro-concert-meta-item">
            <p className="retro-concert-meta-label">Categoria</p>
            <div className="retro-concert-row">
              <RetroTagIcon />
              <span>{product.category.name}</span>
            </div>
          </div>
        </div>

        {product.description ? (
          <div className="retro-concert-copy">
            <p className="retro-concert-description line-clamp-2">
              {product.description}
            </p>
          </div>
        ) : null}

        <div className="retro-card-actions retro-card-actions-upcoming">
          <Link
            href={productHref}
            className="retro-card-action"
            aria-label={`Abrir detalle de ${product.name}`}
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
