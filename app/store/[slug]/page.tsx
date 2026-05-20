import type { Metadata } from "next";
import { notFound } from "next/navigation";

import StoreProductDetailPanel from "@/components/store/store-product-detail-panel";
import StoreProductCard from "@/components/store/store-product-card";
import PageShell from "@/components/ui/page-shell";
import {
  buildStoreBreadcrumb,
  resolveStoreRootCategory,
} from "@/lib/navigation/breadcrumbs";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
} from "@/lib/repositories/store";

const STORE_DETAIL_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/tienda.png?tr=w-2400,h-760,cm-extract,fo-top&updatedAt=1778429706881";

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
  const rootStoreCategory = resolveStoreRootCategory({
    categorySlug: product.category.slug,
    parentCategorySlug: product.category.parentSlug,
  });

  return (
    <PageShell
      eyebrow="Store"
      title={product.name}
      description={
        product.description ??
        `Producto oficial de Sugarbay en la categoria ${product.category.name}.`
      }
      breadcrumbItems={buildStoreBreadcrumb({
        category: rootStoreCategory,
        productName: product.name,
      })}
      headerImageSrc={STORE_DETAIL_HEADER_IMAGE_SRC}
      contentClassName="space-y-8 store-detail-page-content"
    >
      <StoreProductDetailPanel product={product} />

      {relatedProducts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-zinc-900">Tambien te puede gustar</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {relatedProducts.map((relatedProduct) => (
              <StoreProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
