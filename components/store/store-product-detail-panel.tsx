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
    <section
      className={
        compact
          ? "grid gap-6 lg:grid-cols-2"
          : "sb-window grid gap-6 rounded-3xl p-6 lg:grid-cols-2"
      }
    >
      <div className="space-y-3">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-zinc-100"
          style={{ height: imageFrameHeight }}
        >
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Sin imagen
              </p>
            </div>
          )}
        </div>

        {product.images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 9).map((image) => (
              <div
                key={image.id}
                className="relative h-20 overflow-hidden rounded-xl bg-zinc-100"
              >
                <Image
                  src={resolveImageUrl(image.imageUrl)}
                  alt={image.altText ?? product.name}
                  fill
                  unoptimized
                  className="pointer-events-none select-none object-cover"
                  sizes="120px"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {product.category.name}
        </p>
        <h1 className={compact ? "text-2xl font-black text-zinc-900" : "text-3xl font-black text-zinc-900"}>
          {product.name}
        </h1>

        {product.compareAtPrice ? (
          <p className="text-sm text-zinc-400 line-through">
            {formatCurrency(product.compareAtPrice, product.currency)}
          </p>
        ) : null}
        <p className={compact ? "text-2xl font-black text-zinc-900" : "text-3xl font-black text-zinc-900"}>
          {formatCurrency(product.price, product.currency)}
        </p>

        <p className="text-sm text-zinc-700">
          {product.description ?? "Producto oficial de Sugarbay."}
        </p>

        <StoreProductPurchaseForm product={product} />

        {showMediaNotes ? (
          <div className="sb-panel-soft space-y-4 rounded-2xl p-4">
            {product.tracklist.length > 0 ? (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                  Tracklist
                </h2>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-800">
                  {product.tracklist.map((track) => (
                    <li key={track}>{track}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {product.linerNotes ? (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                  Liner Notes
                </h2>
                <p className="mt-2 text-sm text-zinc-800">{product.linerNotes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
