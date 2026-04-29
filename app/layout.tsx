import type { Metadata } from "next";

import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sugarbay",
    template: "%s | Sugarbay",
  },
  description:
    "Web oficial de Sugarbay: conciertos, noticias, musica y tienda oficial.",
  openGraph: {
    title: "Sugarbay",
    description:
      "Web oficial de Sugarbay: conciertos, noticias, musica y tienda oficial.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-bg-canvas text-zinc-900">
        <div className="relative flex min-h-full flex-col">
          <SiteHeader />
          <main className="relative z-10 flex w-full flex-1 flex-col">
           {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

