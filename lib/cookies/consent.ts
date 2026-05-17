export const COOKIE_CONSENT_STORAGE_KEY = "sugarbay-cookie-consent";
export const COOKIE_CONSENT_OPEN_CONFIG_EVENT = "sugarbay-cookie-open-config";

export type CookieConsentStatus = "accepted" | "rejected" | "configured";

export type CookieConsentCategories = {
  necessary: true;
};

export type CookieConsentPreference = {
  version: 1;
  status: CookieConsentStatus;
  categories: CookieConsentCategories;
  updatedAt: string;
};

function isCookieConsentStatus(value: unknown): value is CookieConsentStatus {
  return value === "accepted" || value === "rejected" || value === "configured";
}

function isCookieConsentPreference(value: unknown): value is CookieConsentPreference {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1) return false;
  if (!isCookieConsentStatus(candidate.status)) return false;
  if (!candidate.categories || typeof candidate.categories !== "object") return false;

  const categories = candidate.categories as Record<string, unknown>;
  if (categories.necessary !== true) return false;
  if (typeof candidate.updatedAt !== "string") return false;

  return true;
}

export function parseCookieConsentPreference(
  rawValue: string | null,
): CookieConsentPreference | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!isCookieConsentPreference(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildCookieConsentPreference(
  status: CookieConsentStatus,
): CookieConsentPreference {
  return {
    version: 1,
    status,
    categories: {
      necessary: true,
    },
    updatedAt: new Date().toISOString(),
  };
}
