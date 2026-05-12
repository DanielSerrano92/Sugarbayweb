import type { Metadata } from "next";

import localFont from "next/font/local";
import { Press_Start_2P } from "next/font/google";

import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

import "./globals.css";

const retroPixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro-pixel",
});

const byteBounceFont = localFont({
  src: "../public/fonts/ByteBounce.ttf",
  variable: "--font-bytebounce",
  display: "swap",
});

const retronoidFont = localFont({
  src: "../public/fonts/Retronoid-BZX3.ttf",
  variable: "--font-retronoid",
  display: "swap",
});

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
      className={`${retroPixelFont.variable} ${byteBounceFont.variable} ${retronoidFont.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-bg-canvas text-zinc-900"
        suppressHydrationWarning
      >
        <div className="relative flex min-h-full flex-col">
          <SiteHeader />
          <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 lg:px-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
