import Link from "next/link";

import type { ProductCategory } from "@/app/generated/prisma/client";
import type { ShopSortOption } from "@/lib/services/navigation";
import { shopSortOptions } from "@/lib/services/navigation";

type ProductFiltersProps = {
  categories: (ProductCategory & { children: ProductCategory[] })[];
  selectedCategory?: string;
  selectedSort?: ShopSortOption;
  query?: string;
};

export default function ProductFilters({
  categories,
  selectedCategory,
  selectedSort,
  query,
}: ProductFiltersProps) {
  return (
    <form
      action="/store"
      method="get"
      className="sb-panel grid gap-3 rounded-2xl p-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
    >
      <div>
        <label htmlFor="shop-q" className="mb-1 block text-xs font-semibold uppercase">
          Buscar
        </label>
        <input
          id="shop-q"
          name="q"
          defaultValue={query}
          placeholder="Camiseta, vinilo, pster..."
          className="sb-input"
        />
      </div>

      <div>
        <label
          htmlFor="shop-categoria"
          className="mb-1 block text-xs font-semibold uppercase"
        >
          categoria
        </label>
        <select
          id="shop-categoria"
          name="categoria"
          defaultValue={selectedCategory ?? ""}
          className="sb-select"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              <option value={category.slug}>{category.name}</option>
              {category.children.map((child) => (
                <option key={child.id} value={child.slug}>
                  {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shop-sort" className="mb-1 block text-xs font-semibold uppercase">
          Ordenar
        </label>
        <select
          id="shop-sort"
          name="orden"
          defaultValue={selectedSort ?? "featured"}
          className="sb-select"
        >
          {shopSortOptions.map((sortOption) => (
            <option key={sortOption.value} value={sortOption.value}>
              {sortOption.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="sb-btn-primary px-4 py-2 text-sm font-semibold"
        >
          Aplicar
        </button>
        <Link
          href="/store"
          className="sb-btn-secondary px-4 py-2 text-sm font-medium text-zinc-200"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}


