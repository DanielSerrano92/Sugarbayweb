const DEFAULT_IMAGEKIT_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

function stripSlashes(value: string): string {
  return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

export function resolveImageUrl(path?: string | null): string {
  if (!path) return "/next.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  if (!DEFAULT_IMAGEKIT_ENDPOINT) {
    return `/${stripSlashes(path)}`;
  }

  return `${DEFAULT_IMAGEKIT_ENDPOINT.replace(/\/+$/, "")}/${stripSlashes(path)}`;
}
