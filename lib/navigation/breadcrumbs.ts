import type { BreadcrumbItem } from "@/components/navigation/retro-breadcrumb";
import type { ConcertPeriod } from "@/lib/concerts/types";
import type { RootStoreCategory } from "@/lib/store/types";

const HOME_ITEM: BreadcrumbItem = { label: "Home", href: "/" };
const MEDIA_ITEM: BreadcrumbItem = { label: "Media", href: "/media" };
const STORE_ITEM: BreadcrumbItem = { label: "Tienda", href: "/store" };
const MUSIC_ITEM: BreadcrumbItem = { label: "Musica", href: "/musica" };

const STORE_CATEGORY_META: Record<
  RootStoreCategory,
  { label: string; href: string }
> = {
  ropa: { label: "Ropa", href: "/store?category=ropa" },
  accesorios: { label: "Accesorios", href: "/store?category=accesorios" },
  media: { label: "Media", href: "/store?category=media" },
};

function isRootStoreCategory(value: string | null | undefined): value is RootStoreCategory {
  return value === "ropa" || value === "accesorios" || value === "media";
}

export function resolveStoreRootCategory(params: {
  categorySlug: string;
  parentCategorySlug?: string | null;
}): RootStoreCategory | undefined {
  if (isRootStoreCategory(params.parentCategorySlug)) {
    return params.parentCategorySlug;
  }

  if (isRootStoreCategory(params.categorySlug)) {
    return params.categorySlug;
  }

  return undefined;
}

export function buildConcertBreadcrumb(period: ConcertPeriod): BreadcrumbItem[] {
  return [
    HOME_ITEM,
    {
      label: period === "upcoming" ? "Proximos conciertos" : "Conciertos anteriores",
    },
  ];
}

export function buildBandNewsBreadcrumb(newsTitle?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [HOME_ITEM, { label: "Noticias", href: "/band/news" }];

  if (newsTitle) {
    items.push({ label: newsTitle });
  } else {
    items[items.length - 1] = { label: "Noticias" };
  }

  return items;
}

export function buildBandBioBreadcrumb(): BreadcrumbItem[] {
  return [HOME_ITEM, { label: "Bio" }];
}

export function buildMusicBreadcrumb(type?: string): BreadcrumbItem[] {
  if (type === "song") {
    return [HOME_ITEM, MUSIC_ITEM, { label: "Canciones" }];
  }

  if (type === "album") {
    return [HOME_ITEM, MUSIC_ITEM, { label: "Albumes" }];
  }

  return [HOME_ITEM, { label: "Musica" }];
}

export function buildMediaPhotosBreadcrumb(collectionTitle?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [HOME_ITEM, MEDIA_ITEM, { label: "Fotos", href: "/media/photos" }];
  if (collectionTitle) {
    items.push({ label: collectionTitle });
  } else {
    items[items.length - 1] = { label: "Fotos" };
  }
  return items;
}

export function buildMediaVideosBreadcrumb(collectionTitle?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [HOME_ITEM, MEDIA_ITEM, { label: "Videos", href: "/media/videos" }];
  if (collectionTitle) {
    items.push({ label: collectionTitle });
  } else {
    items[items.length - 1] = { label: "Videos" };
  }
  return items;
}

export function buildStoreBreadcrumb(params?: {
  category?: RootStoreCategory;
  productName?: string;
}): BreadcrumbItem[] {
  const categoryMeta = params?.category ? STORE_CATEGORY_META[params.category] : null;

  const items: BreadcrumbItem[] = [HOME_ITEM, STORE_ITEM];

  if (categoryMeta) {
    items.push({ label: categoryMeta.label, href: categoryMeta.href });
  }

  if (params?.productName) {
    items.push({ label: params.productName });
    return items;
  }

  if (!categoryMeta) {
    items[items.length - 1] = { label: "Tienda" };
  } else {
    items[items.length - 1] = { label: categoryMeta.label };
  }

  return items;
}
