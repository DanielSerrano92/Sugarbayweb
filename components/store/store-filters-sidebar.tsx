"use client";

import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";

import {
  APPAREL_GENDERS,
  MEDIA_TYPES,
  STORE_SORT_OPTIONS,
  type StoreCategoryTree,
  type StoreFilters,
} from "@/lib/store/types";

const STORE_APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

type StoreFiltersSidebarProps = {
  categories: StoreCategoryTree[];
  filters: StoreFilters;
  mode?: "panel" | "icon-modal";
};

export default function StoreFiltersSidebar({
  categories,
  filters,
  mode = "panel",
}: StoreFiltersSidebarProps) {
  const isIconMode = mode === "icon-modal";
  const selectedCategory = filters.category
    ? categories.find((category) => category.slug === filters.category)
    : null;
  const availableSubcategories = selectedCategory
    ? selectedCategory.children
    : categories.flatMap((category) => category.children);
  const formClassName = "space-y-4 p-4 text-black store-filters-form";
  const labelClassName = "mb-1.5 block text-sm font-bold text-black store-filters-label";
  const inputClassName = "win-input";
  const selectClassName = "win-input";
  const fieldsetClassName = "store-filters-group space-y-2 border border-black/45 bg-white/25 p-3";
  const legendClassName = "px-1 text-xs font-bold uppercase tracking-[0.08em] text-black";
  const applyClassName = "win-button";
  const resetClassName = "win-button";
  const fieldPrefix = isIconMode ? "store-modal" : "store";
  const categoryFieldId = `${fieldPrefix}-category`;
  const subcategoryFieldId = `${fieldPrefix}-subcategory`;
  const minPriceFieldId = `${fieldPrefix}-min-price`;
  const maxPriceFieldId = `${fieldPrefix}-max-price`;
  const sortFieldId = `${fieldPrefix}-sort`;
  const sizeFieldId = `${fieldPrefix}-size`;
  const genderFieldId = `${fieldPrefix}-gender`;
  const mediaTypeFieldId = `${fieldPrefix}-media-type`;

  const form = (
    <form action="/store" method="get" className={formClassName}>
      <input type="hidden" name="page" value="1" />

      <div className="store-filters-field">
        <label
          htmlFor={categoryFieldId}
          className={labelClassName}
        >
          Categoria
        </label>
        <select
          id={categoryFieldId}
          name="category"
          defaultValue={filters.category ?? ""}
          className={selectClassName}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="store-filters-field">
        <label
          htmlFor={subcategoryFieldId}
          className={labelClassName}
        >
          Subcategoria
        </label>
        <select
          id={subcategoryFieldId}
          name="subcategory"
          defaultValue={filters.subcategory ?? ""}
          className={selectClassName}
        >
          <option value="">Todas</option>
          {availableSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.slug}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      <div className="store-filters-price-grid grid grid-cols-2 gap-2">
        <div className="store-filters-field">
          <label
            htmlFor={minPriceFieldId}
            className={labelClassName}
          >
            Precio min
          </label>
          <input
            id={minPriceFieldId}
            name="minPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={filters.priceMin ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="store-filters-field">
          <label
            htmlFor={maxPriceFieldId}
            className={labelClassName}
          >
            Precio max
          </label>
          <input
            id={maxPriceFieldId}
            name="maxPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={filters.priceMax ?? ""}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="store-filters-field">
        <label
          htmlFor={sortFieldId}
          className={labelClassName}
        >
          Ordenar
        </label>
        <select
          id={sortFieldId}
          name="sort"
          defaultValue={filters.sort}
          className={selectClassName}
        >
          {STORE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>
          Filtros ropa
        </legend>

        <div className="store-filters-field">
          <label
            htmlFor={sizeFieldId}
            className={labelClassName}
          >
            Talla
          </label>
          <select
            id={sizeFieldId}
            name="size"
            defaultValue={filters.size ?? ""}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {STORE_APPAREL_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="store-filters-field">
          <label
            htmlFor={genderFieldId}
            className={labelClassName}
          >
            Genero
          </label>
          <select
            id={genderFieldId}
            name="gender"
            defaultValue={filters.gender ?? ""}
            className={selectClassName}
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

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>
          Filtros media
        </legend>

        <div className="store-filters-field">
          <label
            htmlFor={mediaTypeFieldId}
            className={labelClassName}
          >
            Tipo
          </label>
          <select
            id={mediaTypeFieldId}
            name="mediaType"
            defaultValue={filters.mediaType ?? ""}
            className={selectClassName}
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

      <div className="store-filters-actions flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          className={applyClassName}
        >
          Aplicar
        </button>
        <Link
          href="/store"
          className={resetClassName}
        >
          Limpiar
        </Link>
      </div>
    </form>
  );

  if (isIconMode) {
    return (
      <FilterModalShell
        modalId="store-filters-modal"
        title="Filtros tienda"
        buttonLabel="Abrir filtros de tienda"
      >
        <div className="store-filters-modal-content">{form}</div>
      </FilterModalShell>
    );
  }

  return (
    <aside className="win-window store-filters-window h-fit overflow-hidden">
      <div className="win-titlebar store-filters-titlebar">
        <span>Filtros tienda</span>
      </div>
      <div className="store-filters-modal-content">{form}</div>
    </aside>
  );
}
