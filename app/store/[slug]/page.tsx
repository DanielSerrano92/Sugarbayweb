import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import StoreProductPurchaseForm from "@/components/store/store-product-purchase-form";
import StoreProductCard from "@/components/store/store-product-card";
import { resolveImageUrl } from "@/lib/services/imagekit";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
  isPhysicalMediaWithNotes,
} from "@/lib/repositories/store";
import { formatCurrency } from "@/lib/utils";

type StoreProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StoreProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto",
      description: "Detalle de producto de la tienda Sugarbay.",
    };
  }

  return {
    title: product.name,
    description:
      product.description ?? `Producto oficial de Sugarbay en la categoria ${product.category.name}.`,
  };
}

export default async function StoreProductPage({ params }: StoreProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedStoreProducts(
    product.category.slug,
    product.id,
  );
  const showMediaNotes = isPhysicalMediaWithNotes(product);

  return (
    <div className="space-y-8">
      <section className="sb-window grid gap-6 rounded-3xl p-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative h-[420px] overflow-hidden rounded-2xl bg-zinc-100">
            <Image
              src={resolveImageUrl(product.images[0]?.imageUrl)}
              alt={product.images[0]?.altText ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
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
                    className="object-cover"
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
          <h1 className="text-3xl font-black text-zinc-900">{product.name}</h1>

          {product.compareAtPrice ? (
            <p className="text-sm text-zinc-400 line-through">
              {formatCurrency(product.compareAtPrice, product.currency)}
            </p>
          ) : null}
          <p className="text-3xl font-black text-zinc-900">
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

      {relatedProducts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-zinc-900">Tambien te puede gustar</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <StoreProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
