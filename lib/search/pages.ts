import { normalizeSearchTerm } from "@/lib/utils";
import type { SearchPageEntry, SearchPageResult } from "@/lib/search/types";

const SEARCH_PAGES: SearchPageEntry[] = [
  {
    id: "home",
    title: "Inicio",
    href: "/",
    description: "Landing oficial de Sugarbay con novedades destacadas.",
    keywords: ["home", "landing", "principal", "inicio"],
  },
  {
    id: "concerts-upcoming",
    title: "Proximos conciertos",
    href: "/concerts/upcoming",
    description: "Agenda futura de conciertos de Sugarbay.",
    keywords: ["conciertos", "agenda", "gira", "proximos", "shows"],
  },
  {
    id: "concerts-past",
    title: "Conciertos anteriores",
    href: "/concerts/past",
    description: "Historico de conciertos de Sugarbay.",
    keywords: ["conciertos", "anteriores", "historico", "cronicas"],
  },
  {
    id: "band-news",
    title: "Noticias de la banda",
    href: "/band/news",
    description: "Ultimas noticias y actualizaciones oficiales.",
    keywords: ["noticias", "novedades", "banda", "news"],
  },
  {
    id: "band-bio",
    title: "Bio de la banda",
    href: "/band/bio",
    description: "Historia de Sugarbay y perfiles del equipo.",
    keywords: ["bio", "biografia", "miembros", "colaboradores", "banda"],
  },
  {
    id: "music",
    title: "Musica",
    href: "/musica",
    description: "Catalogo de canciones y albumes.",
    keywords: ["musica", "canciones", "albumes", "tracks"],
  },
  {
    id: "media",
    title: "Media",
    href: "/media",
    description: "Seccion multimedia con fotos y videos.",
    keywords: ["media", "fotos", "videos", "galeria"],
  },
  {
    id: "media-photos",
    title: "Fotos",
    href: "/media/photos",
    description: "Albumes fotograficos de conciertos y sesiones.",
    keywords: ["fotos", "imagenes", "galeria", "albumes"],
  },
  {
    id: "media-videos",
    title: "Videos",
    href: "/media/videos",
    description: "Colecciones de videos oficiales.",
    keywords: ["videos", "youtube", "directo", "colecciones"],
  },
  {
    id: "store",
    title: "Tienda oficial",
    href: "/store",
    description: "Merchandising y productos oficiales de Sugarbay.",
    keywords: ["tienda", "store", "merch", "productos", "ropa", "accesorios"],
  },
  {
    id: "fanclub",
    title: "Fanclub",
    href: "/fanclub",
    description: "Proximamente: espacio exclusivo para la comunidad.",
    keywords: ["fanclub", "comunidad", "miembros"],
  },
  {
    id: "account",
    title: "Mi cuenta",
    href: "/account",
    description: "Gestiona perfil, pedidos y cuenta personal.",
    keywords: ["cuenta", "perfil", "account", "usuario"],
  },
  {
    id: "cart",
    title: "Carrito",
    href: "/carrito",
    description: "Revisa productos antes de checkout.",
    keywords: ["carrito", "cart", "compra"],
  },
  {
    id: "checkout",
    title: "Checkout",
    href: "/checkout",
    description: "Pago seguro y datos de envio/facturacion.",
    keywords: ["checkout", "pago", "stripe", "envio"],
  },
];

function scorePage(entry: SearchPageEntry, query: string): number {
  const title = normalizeSearchTerm(entry.title);
  const description = normalizeSearchTerm(entry.description);
  const href = normalizeSearchTerm(entry.href);
  const keywords = entry.keywords.map((keyword) => normalizeSearchTerm(keyword));

  if (title === query) return 1000;

  let score = 0;
  if (title.startsWith(query)) score += 250;
  if (title.includes(query)) score += 150;
  if (description.includes(query)) score += 100;
  if (href.includes(query)) score += 90;
  if (keywords.some((keyword) => keyword.startsWith(query))) score += 120;
  if (keywords.some((keyword) => keyword.includes(query))) score += 70;

  return score;
}

export function searchSitePages(rawQuery: string, limit: number): SearchPageResult[] {
  const query = normalizeSearchTerm(rawQuery);

  if (!query) {
    return SEARCH_PAGES.slice(0, limit).map((entry) => ({
      id: entry.id,
      title: entry.title,
      href: entry.href,
      description: entry.description,
    }));
  }

  return SEARCH_PAGES.map((entry) => ({
    entry,
    score: scorePage(entry, query),
  }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.title.localeCompare(right.entry.title),
    )
    .slice(0, limit)
    .map(({ entry }) => ({
      id: entry.id,
      title: entry.title,
      href: entry.href,
      description: entry.description,
    }));
}

