export type NavLink = {
  label: string;
  href: string;
};

export type NavItem = NavLink & {
  children?: NavLink[];
};

export const mainNavigation: NavItem[] = [
  { label: "Inicio", href: "/" },
  {
    label: "Conciertos",
    href: "/concerts",
    children: [
      { label: "Proximos", href: "/concerts/upcoming" },
      { label: "Anteriores", href: "/concerts/past" },
    ],
  },
  {
    label: "Banda",
    href: "/band/news",
    children: [
      { label: "Noticias", href: "/band/news" },
      { label: "Bio", href: "/band/bio" },
    ],
  },
  {
    label: "Musica",
    href: "/musica",
    children: [
      { label: "Albumes", href: "/musica?type=album" },
      { label: "Canciones", href: "/musica?type=song" },
    ],
  },
  {
    label: "Media",
    href: "/media",
    children: [
      { label: "Fotos", href: "/media/photos" },
      { label: "Videos", href: "/media/videos" },
    ],
  },
  { label: "Fanclub", href: "/fanclub" },
  {
    label: "Tienda",
    href: "/store",
    children: [
      { label: "Ropa", href: "/store?category=ropa" },
      { label: "Accesorios", href: "/store?category=accesorios" },
      { label: "Media", href: "/store?category=media" },
    ],
  },
];

export const shopSortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "newest", label: "Mas recientes" },
] as const;

export type ShopSortOption = (typeof shopSortOptions)[number]["value"];



