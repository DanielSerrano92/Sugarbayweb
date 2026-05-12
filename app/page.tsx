import type { Metadata } from "next";
import Link from "next/link";

import HomeHeaderCarousel, {
  type HomeHeaderCarouselSlide,
} from "@/components/home/home-header-carousel";
import HomeVideosBand from "@/components/home/home-videos-band";
import { getConcertExtraContent } from "@/lib/concerts/content";
import { getHomeVideoBandItems } from "@/lib/repositories/media";
import PageShell from "@/components/ui/page-shell";
import { TICKETMASTER_SUGARBAY_SEARCH_URL } from "@/lib/concerts/ticketmaster";
import { getHomeSnapshot } from "@/lib/repositories/site";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Web oficial de Sugarbay con conciertos, noticias, musica y tienda oficial.",
};

const HOME_CAROUSEL_CONCERT_IMAGE =
  "https://ik.imagekit.io/gq1enkszp/fotos/proximos-conciertos.png?tr=w-1200,h-760,cm-extract,fo-center&updatedAt=1778369713978";
const HOME_CAROUSEL_STORE_IMAGE =
  "https://ik.imagekit.io/gq1enkszp/fotos/tienda.png?tr=w-1200,h-760,cm-extract,fo-center";
const HOME_CAROUSEL_NEWS_IMAGE =
  "https://ik.imagekit.io/gq1enkszp/fotos/noticias.png?tr=w-1200,h-760,cm-extract,fo-center";
const HOME_CAROUSEL_NEWS_OVERRIDES: Record<string, string> = {
  "sugarbay-anuncia-single-y-fecha-madrid":
    "https://ik.imagekit.io/gq1enkszp/fotos/noticia.png",
};
const HOME_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/home.png?tr=w-2400,h-760,cm-extract,fo-top&updatedAt=1778553331693";

function truncateText(value: string, maxLength: number) {
  const compactValue = value.replace(/\s+/g, " ").trim();

  if (compactValue.length <= maxLength) return compactValue;

  return `${compactValue.slice(0, maxLength - 3).trimEnd()}...`;
}

export default async function HomePage() {
  const [{ upcomingConcerts, news, featuredProducts }, homeVideoBandItems] =
    await Promise.all([getHomeSnapshot(), getHomeVideoBandItems()]);
  const heroSlides: HomeHeaderCarouselSlide[] = [];

  const nextConcert = upcomingConcerts[0];
  if (nextConcert) {
    const concertDetail = getConcertExtraContent(nextConcert.slug);

    heroSlides.push({
      id: `home-concert-${nextConcert.id}`,
      kind: "concert",
      windowLabel: "Proximo show",
      meta: `${formatDate(nextConcert.startsAt)} - ${nextConcert.city}`,
      title: nextConcert.title,
      description: `${nextConcert.venueName}. Reserva tu sitio para el siguiente directo de Sugarbay.`,
      href: "/concerts/upcoming",
      ctaLabel: "Ver conciertos",
      imageUrl: concertDetail?.venuePhotoUrl ?? HOME_CAROUSEL_CONCERT_IMAGE,
      imageAlt: `Lugar del evento: ${nextConcert.venueName} (${nextConcert.city})`,
    });
  }

  const featuredProduct = featuredProducts[0];
  if (featuredProduct) {
    heroSlides.push({
      id: `home-store-${featuredProduct.id}`,
      kind: "store",
      windowLabel: "Drop destacado",
      meta: `${featuredProduct.category.name} - ${formatCurrency(featuredProduct.price, featuredProduct.currency)}`,
      title: featuredProduct.name,
      description:
        featuredProduct.description
          ? truncateText(featuredProduct.description, 130)
          : "Merch oficial con estetica Sugarbay para directo, calle y coleccion.",
      href: `/store/${featuredProduct.slug}`,
      ctaLabel: "Ir al producto",
      imageUrl: featuredProduct.coverImageUrl
        ? resolveImageUrl(featuredProduct.coverImageUrl)
        : HOME_CAROUSEL_STORE_IMAGE,
      imageAlt: `Producto destacado: ${featuredProduct.name}`,
    });
  }

  const latestNews = news[0];
  if (latestNews) {
    const latestNewsImage =
      HOME_CAROUSEL_NEWS_OVERRIDES[latestNews.slug] ??
      (latestNews.coverImageUrl
        ? resolveImageUrl(latestNews.coverImageUrl)
        : HOME_CAROUSEL_NEWS_IMAGE);

    heroSlides.push({
      id: `home-news-${latestNews.id}`,
      kind: "news",
      windowLabel: "Ultima noticia",
      meta: latestNews.publishedAt
        ? formatDate(latestNews.publishedAt)
        : formatDate(latestNews.createdAt),
      title: latestNews.title,
      description: truncateText(latestNews.summary ?? latestNews.content, 140),
      href: "/band/news",
      ctaLabel: "Leer noticias",
      imageUrl: latestNewsImage,
      imageAlt: `Noticia destacada: ${latestNews.title}`,
    });
  }

  if (heroSlides.length === 0) {
    heroSlides.push({
      id: "home-fallback-slide",
      kind: "news",
      windowLabel: "Sugarbay",
      meta: "Web oficial",
      title: "Bienvenido al universo Sugarbay",
      description: "Explora conciertos, novedades y la tienda oficial con la nueva identidad retro vaporwave.",
      href: "/store",
      ctaLabel: "Explorar tienda",
      imageUrl: HOME_CAROUSEL_STORE_IMAGE,
      imageAlt: "Vista destacada de la tienda oficial de Sugarbay",
    });
  }

  return (
    <PageShell
      eyebrow="Web oficial"
      title="Sugarbay en directo, en streaming y en tu armario"
      description="Bienvenido al nuevo espacio de Sugarbay. Descubre conciertos, escucha la msica ms reciente y visita la tienda oficial con drops exclusivos."
      headerImageSrc={HOME_PAGE_HEADER_IMAGE_SRC}
      actions={
        <>
          <Link
            href="/concerts/upcoming"
            className="sb-btn-primary px-4 py-2.5 text-sm font-bold"
          >
            Ver Proximos conciertos
          </Link>
          <Link
            href="/store"
            className="sb-btn-secondary px-4 py-2.5 text-sm font-semibold text-zinc-200"
          >
            Ir a la tienda
          </Link>
        </>
      }
      contentClassName="space-y-8"
    >
      <HomeVideosBand items={homeVideoBandItems} />
      <HomeHeaderCarousel slides={heroSlides} />
    </PageShell>
  );
}





