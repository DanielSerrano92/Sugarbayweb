import { addToCartAction } from "@/lib/cart/actions";

import AddToCartButton from "./add-to-cart-button";

type AddToCartFormProps = {
  productId: string;
  productVariantId?: string;
  quantity?: number;
  redirectTo?: string;
  compact?: boolean;
};

export default function AddToCartForm({
  productId,
  productVariantId,
  quantity = 1,
  redirectTo,
  compact,
}: AddToCartFormProps) {
  return (
    <form action={addToCartAction} className="inline-flex">
      <input type="hidden" name="productId" value={productId} />
      {productVariantId ? (
        <input type="hidden" name="productVariantId" value={productVariantId} />
      ) : null}
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <AddToCartButton compact={compact} />
    </form>
  );
}
