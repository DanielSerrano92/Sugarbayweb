export function formatCurrency(
  amount: number | string,
  currency = "EUR",
  locale = "es-ES",
): string {
  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatDate(
  value: Date | string,
  locale = "es-ES",
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function normalizeSearchTerm(input?: string | null): string {
  if (!input) return "";
  return input.trim().toLowerCase();
}
