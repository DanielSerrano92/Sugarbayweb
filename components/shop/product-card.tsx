import StoreProductCard from "@/components/store/store-product-card";
import type { ShopProduct } from "@/lib/repositories/shop";

type ProductCardProps = {
  product: ShopProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  return <StoreProductCard product={product} />;
}
