import type { ConcertLink, ConcertMediaItem } from "@/lib/concerts/types";

type ConcertExtraContent = {
  experiences?: string[];
  venuePhotoUrl?: string;
  venueDescription?: string;
  venueWebsiteUrl?: string;
  contacts?: ConcertLink[];
  chronicle?: string;
  tracklist?: string[];
  extraLinks?: ConcertLink[];
  photos?: ConcertMediaItem[];
  videos?: ConcertMediaItem[];
};

const concertContentRegistry: Record<string, ConcertExtraContent> = {
  "sugarbay-live-madrid-2026": {
    experiences: ["Entrada general", "Front stage", "Meet and greet"],
    venuePhotoUrl:
      "https://ik.imagekit.io/sugarbay/venues/sala-riviera-madrid.jpg",
    venueDescription:
      "Sala historica de Madrid con aforo medio, sonido directo y gran visibilidad desde platea y anfiteatro.",
    venueWebsiteUrl: "https://www.salariviera.com",
    contacts: [
      { label: "Instagram", url: "https://instagram.com/salariviera" },
      { label: "Email", url: "mailto:info@salariviera.com" },
    ],
  },
  "sugarbay-sunset-festival-2026": {
    experiences: ["General", "VIP Sunset", "Zona premium"],
    venuePhotoUrl:
      "https://ik.imagekit.io/sugarbay/venues/valencia-arena.jpg",
    venueDescription:
      "Recinto al aire libre con zona premium, accesos por tramos y espacio de restauracion.",
    venueWebsiteUrl: "https://sunsetfestival.example.com",
    contacts: [
      { label: "Web del festival", url: "https://sunsetfestival.example.com" },
    ],
  },
  "sugarbay-barcelona-closing-night-2025": {
    experiences: ["Entrada pista", "Balcon"],
    venuePhotoUrl: "https://ik.imagekit.io/sugarbay/venues/razzmatazz.jpg",
    venueDescription:
      "Razzmatazz fue sede del cierre de gira con escenografia completa y setlist extendido.",
    venueWebsiteUrl: "https://www.salarazzmatazz.com",
    chronicle:
      "La noche de cierre en Barcelona mezclo repertorio clasico y nuevas canciones, con un encore de tres temas y colaboraciones sorpresa.",
    tracklist: [
      "Neon Skyline",
      "Afterglow",
      "City Dream",
      "Midnight Pulse",
      "Tides",
      "Closing Fire",
    ],
    extraLinks: [
      { label: "Cronica completa", url: "https://sugarbaymusic.com/news/closing-night" },
      { label: "Resena prensa", url: "https://musicpress.example.com/sugarbay-barcelona" },
    ],
    photos: [
      {
        title: "Opening lights",
        url: "https://ik.imagekit.io/sugarbay/photos/barcelona-closing-01.jpg",
      },
      {
        title: "Final encore",
        url: "https://ik.imagekit.io/sugarbay/photos/barcelona-closing-02.jpg",
      },
    ],
    videos: [
      {
        title: "Aftermovie oficial",
        url: "https://www.youtube.com/watch?v=sugarbay-closing-night",
      },
      {
        title: "Encore completo",
        url: "https://www.youtube.com/watch?v=sugarbay-encore-live",
      },
    ],
  },
};

export function getConcertExtraContent(slug: string): ConcertExtraContent | null {
  return concertContentRegistry[slug] ?? null;
}
