import type { Metadata } from "next";
import { notFound } from "next/navigation";

import StoreProductDetailPanel from "@/components/store/store-product-detail-panel";
import StoreProductCard from "@/components/store/store-product-card";
import PageShell from "@/components/ui/page-shell";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
} from "@/lib/repositories/store";

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

  return (
    <PageShell
      eyebrow="Store"
      title={product.name}
      description={
        product.description ??
        `Producto oficial de Sugarbay en la categoria ${product.category.name}.`
      }
      contentClassName="space-y-8"
    >
      <StoreProductDetailPanel product={product} />

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
    </PageShell>
  );
}
