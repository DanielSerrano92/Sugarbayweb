const STORE_PRODUCT_IMAGE_OVERRIDES: Record<string, string> = {
  "sugarbay-neon-pin-set": "https://ik.imagekit.io/gq1enkszp/fotos/pin-set.png",
  "neon-coastline-cd-deluxe": "https://ik.imagekit.io/gq1enkszp/fotos/cd.png",
  "sugarbay-tour-tee-black":
    "https://ik.imagekit.io/gq1enkszp/fotos/camiseta_black_neon?updatedAt=1777406425075",
};

const STORE_PRODUCT_IMAGE_OVERRIDES_BY_NAME: Record<string, string> = {
  "sugarbay neon pin set": "https://ik.imagekit.io/gq1enkszp/fotos/pin-set.png",
  "neon coastline cd deluxe": "https://ik.imagekit.io/gq1enkszp/fotos/cd.png",
  "sugarbay tour tee black":
    "https://ik.imagekit.io/gq1enkszp/fotos/camiseta_black_neon?updatedAt=1777406425075",
};

const STORE_PRODUCT_IMAGE_FIT: Record<string, string> = {
  "sugarbay-neon-pin-set": "object-contain object-center",
  "neon-coastline-cd-deluxe": "object-contain object-center",
  "sugarbay-tour-tee-black": "object-contain object-center",
};

function normalizeProductName(name: string | null | undefined): string {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

function resolveStoreProductImageOverrideByName(name: string | null | undefined): string | null {
  const normalized = normalizeProductName(name);
  if (!normalized) return null;
  return STORE_PRODUCT_IMAGE_OVERRIDES_BY_NAME[normalized] ?? null;
}

export function resolveStoreProductImageUrl(
  slug: string | null | undefined,
  fallback: string | null,
  productName?: string | null,
): string | null {
  if (slug && STORE_PRODUCT_IMAGE_OVERRIDES[slug]) {
    return STORE_PRODUCT_IMAGE_OVERRIDES[slug];
  }

  const overrideByName = resolveStoreProductImageOverrideByName(productName);
  if (overrideByName) return overrideByName;

  return fallback;
}

export function resolveStoreProductImageFitClass(
  slug: string | null | undefined,
  productName?: string | null,
): string {
  if (slug && STORE_PRODUCT_IMAGE_FIT[slug]) {
    return STORE_PRODUCT_IMAGE_FIT[slug];
  }

  const hasNameOverride = Boolean(resolveStoreProductImageOverrideByName(productName));
  return hasNameOverride ? "object-contain object-center" : "object-cover object-center";
}
