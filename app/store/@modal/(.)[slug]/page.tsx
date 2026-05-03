import { notFound } from "next/navigation";

import StoreProductDetailPanel from "@/components/store/store-product-detail-panel";
import StoreProductModalShell from "@/components/store/store-product-modal-shell";
import { getStoreProductBySlug } from "@/lib/repositories/store";

type StoreProductModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreProductModalPage({
  params,
}: StoreProductModalPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <StoreProductModalShell title={product.name}>
      <StoreProductDetailPanel product={product} compact />
    </StoreProductModalShell>
  );
}
