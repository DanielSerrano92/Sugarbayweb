import { addToCartAction } from "@/lib/cart/actions";
import {
  getSizeOptions,
  shouldShowSizeSelector,
} from "@/lib/repositories/store";
import type { StoreProductDetail } from "@/lib/store/types";

type StoreProductPurchaseFormProps = {
  product: StoreProductDetail;
};

export default function StoreProductPurchaseForm({
  product,
}: StoreProductPurchaseFormProps) {
  const inStockVariants = product.variants.filter((variant) => variant.stock > 0);

  if (product.variants.length === 0) {
    return (
      <p className="retro-concert-meta-item text-sm font-semibold text-zinc-800">
        Este producto no tiene variantes disponibles en este momento.
      </p>
    );
  }

  if (inStockVariants.length === 0) {
    return (
      <p className="retro-concert-meta-item text-sm font-semibold text-zinc-800">
        Temporalmente sin stock.
      </p>
    );
  }

  const showSizeSelector = shouldShowSizeSelector(product);
  const sizeOptions = getSizeOptions(product);
  const sizeToVariant = new Map(
    inStockVariants.map((variant) => [variant.size, variant] as const),
  );

  const defaultVariant = inStockVariants[0];
  const defaultSizeVariant = sizeOptions
    .map((size) => sizeToVariant.get(size))
    .find((variant): variant is NonNullable<typeof variant> => Boolean(variant));

  return (
    <form action={addToCartAction} className="retro-concert-meta-item space-y-3">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="redirectTo" value="/carrito" />

      {showSizeSelector ? (
        <div>
          <label
            htmlFor="product-variant-id"
            className="retro-concert-meta-label mb-1.5 block"
          >
            Talla
          </label>
          <select
            id="product-variant-id"
            name="productVariantId"
            required
            defaultValue={defaultSizeVariant?.id ?? defaultVariant.id}
            className="win-input"
          >
            {sizeOptions.map((size) => {
              const variant = sizeToVariant.get(size);
              if (!variant) return null;

              return (
                <option key={variant.id} value={variant.id}>
                  {size}
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        <input type="hidden" name="productVariantId" value={defaultVariant.id} />
      )}

      <div>
        <label
          htmlFor="product-quantity"
          className="retro-concert-meta-label mb-1.5 block"
        >
          Cantidad
        </label>
        <input
          id="product-quantity"
          name="quantity"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          className="win-input"
        />
      </div>

      <button
        type="submit"
        className="retro-card-action"
      >
        Anadir al carrito
      </button>
    </form>
  );
}
