import Image from "next/image";

import StoreProductPurchaseForm from "@/components/store/store-product-purchase-form";
import { isPhysicalMediaWithNotes } from "@/lib/repositories/store";
import { resolveImageUrl } from "@/lib/services/imagekit";
import type { StoreProductDetail } from "@/lib/store/types";
import { formatCurrency } from "@/lib/utils";

type StoreProductDetailPanelProps = {
  product: StoreProductDetail;
  compact?: boolean;
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

export default function StoreProductDetailPanel({
  product,
  compact = false,
}: StoreProductDetailPanelProps) {
  const showMediaNotes = isPhysicalMediaWithNotes(product);
  const primaryImage = product.images[0];
  const primaryImageUrl = primaryImage?.imageUrl
    ? resolveImageUrl(primaryImage.imageUrl)
    : null;
  const primaryImageAlt = primaryImage?.altText ?? product.name;
  const imageFrameHeight = compact ? "clamp(320px, 48vh, 420px)" : "420px";

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <article className="retro-concert-card w-full overflow-hidden">
        <div className="retro-concert-header">Producto</div>
        <div className="retro-concert-body">
          <div className="retro-concert-meta-item !p-0 overflow-hidden">
            <div className="relative bg-zinc-100" style={{ height: imageFrameHeight }}>
              {primaryImageUrl ? (
                <Image
                  src={primaryImageUrl}
                  alt={primaryImageAlt}
                  fill
                  unoptimized
                  className="pointer-events-none select-none object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center">
                  <p className="retro-concert-meta-label">Sin imagen</p>
                </div>
              )}
            </div>
          </div>

          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 9).map((image) => (
                <div
                  key={image.id}
                  className="retro-concert-meta-item !p-0 overflow-hidden"
                >
                  <div className="relative h-20 bg-zinc-100">
                    <Image
                      src={resolveImageUrl(image.imageUrl)}
                      alt={image.altText ?? product.name}
                      fill
                      unoptimized
                      className="pointer-events-none select-none object-cover"
                      sizes="120px"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      <article className="retro-concert-card w-full overflow-hidden">
        <div className="retro-concert-header">
          {compact ? "Detalle rapido" : "Detalle de producto"}
        </div>
        <div className="retro-concert-body">
          <div className="retro-concert-title-block">
            <h1 className="retro-concert-title">{product.name}</h1>
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

          <div className="retro-concert-copy">
            <p className="retro-concert-description">
              {product.description ?? "Producto oficial de Sugarbay."}
            </p>
          </div>

          <StoreProductPurchaseForm product={product} />

          {showMediaNotes ? (
            <div className="retro-concert-meta">
              {product.tracklist.length > 0 ? (
                <div className="retro-concert-meta-item">
                  <p className="retro-concert-meta-label">Tracklist</p>
                  <ol className="list-decimal space-y-1 pl-5 text-sm font-semibold text-zinc-800">
                    {product.tracklist.map((track) => (
                      <li key={track}>{track}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {product.linerNotes ? (
                <div className="retro-concert-meta-item">
                  <p className="retro-concert-meta-label">Liner Notes</p>
                  <p className="text-sm font-semibold text-zinc-800">{product.linerNotes}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
