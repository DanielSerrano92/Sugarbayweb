"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import FilterModalShell from "@/components/ui/filter-modal-shell";
import {
  isSubcategoryInCategory,
  resolveStoreCategoryScope,
  shouldShowApparelFilters,
  shouldShowMediaFilters,
} from "@/lib/store/filter-scope";

import {
  APPAREL_GENDERS,
  MEDIA_TYPES,
  STORE_SORT_OPTIONS,
  type StoreCategoryTree,
  type StoreFilters,
  type StoreSortOption,
} from "@/lib/store/types";

const STORE_APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const FILTER_QUERY_KEYS = [
  "category",
  "subcategory",
  "minPrice",
  "maxPrice",
  "size",
  "gender",
  "mediaType",
  "sort",
  "page",
] as const;

type StoreFilterFormValues = {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  gender: string;
  mediaType: string;
  sort: StoreSortOption;
};

function createInitialFormValues(filters: StoreFilters): StoreFilterFormValues {
  return {
    category: filters.category ?? "",
    subcategory: filters.subcategory ?? "",
    minPrice: typeof filters.priceMin === "number" ? String(filters.priceMin) : "",
    maxPrice: typeof filters.priceMax === "number" ? String(filters.priceMax) : "",
    size: filters.size ?? "",
    gender: filters.gender ?? "",
    mediaType: filters.mediaType ?? "",
    sort: filters.sort,
  };
}

function parsePriceInput(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, parsed);
}

function sanitizeFormValues(
  values: StoreFilterFormValues,
  categories: StoreCategoryTree[],
): StoreFilterFormValues {
  const sanitized: StoreFilterFormValues = { ...values };

  if (
    sanitized.category &&
    sanitized.subcategory &&
    !isSubcategoryInCategory(sanitized.subcategory, sanitized.category, categories)
  ) {
    sanitized.subcategory = "";
  }

  const scopeCategory = resolveStoreCategoryScope(
    {
      category: sanitized.category || undefined,
      subcategory: sanitized.subcategory || undefined,
    },
    categories,
  );

  if (scopeCategory && scopeCategory !== "ropa") {
    sanitized.size = "";
    sanitized.gender = "";
  }

  if (scopeCategory && scopeCategory !== "media") {
    sanitized.mediaType = "";
  }

  return sanitized;
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState<StoreFilterFormValues>(() =>
    createInitialFormValues(filters),
  );
  const isIconMode = mode === "icon-modal";

  const selectedCategory = useMemo(
    () =>
      formValues.category
        ? categories.find((category) => category.slug === formValues.category)
        : null,
    [categories, formValues.category],
  );
  const availableSubcategories = useMemo(
    () =>
      selectedCategory
        ? selectedCategory.children
        : categories.flatMap((category) => category.children),
    [categories, selectedCategory],
  );
  const activeScopeCategory = useMemo(
    () =>
      resolveStoreCategoryScope(
        {
          category: formValues.category || undefined,
          subcategory: formValues.subcategory || undefined,
        },
        categories,
      ),
    [categories, formValues.category, formValues.subcategory],
  );
  const showApparelFilterFields = shouldShowApparelFilters(activeScopeCategory);
  const showMediaFilterFields = shouldShowMediaFilters(activeScopeCategory);
  const formClassName = "space-y-4 p-4 text-black store-filters-form";
  const labelClassName = "mb-1.5 block text-sm font-bold text-black store-filters-label";
  const inputClassName = "win-input";
  const selectClassName = "win-input";
  const fieldsetClassName = "store-filters-group space-y-2 border border-black/45 bg-white/25 p-3";
  const legendClassName = "px-1 text-xs font-bold uppercase tracking-[0.08em] text-black";
  const fieldPrefix = isIconMode ? "store-modal" : "store";
  const categoryFieldId = `${fieldPrefix}-category`;
  const subcategoryFieldId = `${fieldPrefix}-subcategory`;
  const minPriceFieldId = `${fieldPrefix}-min-price`;
  const maxPriceFieldId = `${fieldPrefix}-max-price`;
  const sortFieldId = `${fieldPrefix}-sort`;
  const sizeFieldId = `${fieldPrefix}-size`;
  const genderFieldId = `${fieldPrefix}-gender`;
  const mediaTypeFieldId = `${fieldPrefix}-media-type`;

  const updateFilters = (nextValues: StoreFilterFormValues) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const key of FILTER_QUERY_KEYS) {
      params.delete(key);
    }

    if (nextValues.category) params.set("category", nextValues.category);
    if (nextValues.subcategory) params.set("subcategory", nextValues.subcategory);

    const minPrice = parsePriceInput(nextValues.minPrice);
    const maxPrice = parsePriceInput(nextValues.maxPrice);

    if (typeof minPrice === "number") {
      params.set("minPrice", String(minPrice));
    }
    if (typeof maxPrice === "number" && (typeof minPrice !== "number" || minPrice <= maxPrice)) {
      params.set("maxPrice", String(maxPrice));
    }

    if (nextValues.size) params.set("size", nextValues.size);
    if (nextValues.gender) params.set("gender", nextValues.gender);
    if (nextValues.mediaType) params.set("mediaType", nextValues.mediaType);
    if (nextValues.sort) params.set("sort", nextValues.sort);

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const handleFieldChange = (field: keyof StoreFilterFormValues) => {
    return (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLSelectElement>,
    ) => {
      const nextRawValues = {
        ...formValues,
        [field]: event.target.value,
      };
      const nextValues = sanitizeFormValues(nextRawValues, categories);

      setFormValues(nextValues);
      updateFilters(nextValues);
    };
  };

  const form = (
    <form
      action="/store"
      method="get"
      className={formClassName}
      onSubmit={(event) => {
        event.preventDefault();
        updateFilters(sanitizeFormValues(formValues, categories));
      }}
    >

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
          value={formValues.category}
          onChange={handleFieldChange("category")}
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
          value={formValues.subcategory}
          onChange={handleFieldChange("subcategory")}
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
            value={formValues.minPrice}
            onChange={handleFieldChange("minPrice")}
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
            value={formValues.maxPrice}
            onChange={handleFieldChange("maxPrice")}
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
          value={formValues.sort}
          onChange={handleFieldChange("sort")}
          className={selectClassName}
        >
          {STORE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showApparelFilterFields ? (
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
              value={formValues.size}
              onChange={handleFieldChange("size")}
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
              value={formValues.gender}
              onChange={handleFieldChange("gender")}
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
      ) : null}

      {showMediaFilterFields ? (
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
              value={formValues.mediaType}
              onChange={handleFieldChange("mediaType")}
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
      ) : null}
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
