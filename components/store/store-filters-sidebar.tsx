import { VariantSize } from "@/app/generated/prisma/client";
import Link from "next/link";

import {
  APPAREL_GENDERS,
  MEDIA_TYPES,
  STORE_SORT_OPTIONS,
  type StoreCategoryTree,
  type StoreFilters,
} from "@/lib/store/types";

type StoreFiltersSidebarProps = {
  categories: StoreCategoryTree[];
  filters: StoreFilters;
};

export default function StoreFiltersSidebar({
  categories,
  filters,
}: StoreFiltersSidebarProps) {
  const selectedCategory = filters.category
    ? categories.find((category) => category.slug === filters.category)
    : null;
  const availableSubcategories = selectedCategory
    ? selectedCategory.children
    : categories.flatMap((category) => category.children);

  return (
    <aside className="sb-panel h-fit rounded-2xl p-4">
      <h2 className="text-base font-bold text-zinc-900">Filtros</h2>

      <form action="/store" method="get" className="mt-4 space-y-4">
        <input type="hidden" name="page" value="1" />

        <div>
          <label
            htmlFor="store-category"
            className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
          >
            Categoria
          </label>
          <select
            id="store-category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="sb-select"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="store-subcategory"
            className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
          >
            Subcategoria
          </label>
          <select
            id="store-subcategory"
            name="subcategory"
            defaultValue={filters.subcategory ?? ""}
            className="sb-select"
          >
            <option value="">Todas</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.slug}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="store-min-price"
              className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
            >
              Precio min
            </label>
            <input
              id="store-min-price"
              name="minPrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={filters.priceMin ?? ""}
              className="sb-input"
            />
          </div>
          <div>
            <label
              htmlFor="store-max-price"
              className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
            >
              Precio max
            </label>
            <input
              id="store-max-price"
              name="maxPrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={filters.priceMax ?? ""}
              className="sb-input"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="store-sort"
            className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
          >
            Ordenar
          </label>
          <select
            id="store-sort"
            name="sort"
            defaultValue={filters.sort}
            className="sb-select"
          >
            {STORE_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2 rounded-xl border border-zinc-300 p-3">
          <legend className="px-1 text-xs font-semibold uppercase text-zinc-600">
            Filtros ropa
          </legend>

          <div>
            <label
              htmlFor="store-size"
              className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
            >
              Talla
            </label>
            <select
              id="store-size"
              name="size"
              defaultValue={filters.size ?? ""}
              className="sb-select"
            >
              <option value="">Todas</option>
              {Object.values(VariantSize)
                .filter((size) => size !== "OS")
                .map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-gender"
              className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
            >
              Genero
            </label>
            <select
              id="store-gender"
              name="gender"
              defaultValue={filters.gender ?? ""}
              className="sb-select"
            >
              <option value="">Todos</option>
              {APPAREL_GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender[0]?.toUpperCase()}
                  {gender.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="space-y-2 rounded-xl border border-zinc-300 p-3">
          <legend className="px-1 text-xs font-semibold uppercase text-zinc-600">
            Filtros media
          </legend>

          <div>
            <label
              htmlFor="store-media-type"
              className="mb-1.5 block text-xs font-semibold uppercase text-zinc-600"
            >
              Tipo
            </label>
            <select
              id="store-media-type"
              name="mediaType"
              defaultValue={filters.mediaType ?? ""}
              className="sb-select"
            >
              <option value="">Todos</option>
              {MEDIA_TYPES.map((mediaType) => (
                <option key={mediaType} value={mediaType}>
                  {mediaType[0]?.toUpperCase()}
                  {mediaType.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
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
    </aside>
  );
}
