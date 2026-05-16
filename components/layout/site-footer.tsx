import Image from "next/image";
import Link from "next/link";

import FooterTermsTrigger from "./footer-terms-trigger";

const FOOTER_LOGO_SRC = "https://ik.imagekit.io/gq1enkszp/fotos/logo.png";
const COPYRIGHT_YEAR = 2026;

const primaryLinks = [
  { label: "Tienda", href: "/store" },
  { label: "Conciertos", href: "/concerts/upcoming" },
  { label: "Fanclub", href: "/fanclub" },
  { label: "Mi cuenta", href: "/account" },
] as const;

const legalLinks = [
  { label: "Ayuda", href: "#" },
  { label: "Devoluciones", href: "#" },
  { label: "Creditos", href: "#" },
  { label: "Términos", href: "#" },
  { label: "Privacidad", href: "#" },
  { label: "Accesibilidad", href: "#" },
] as const;

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Spotify", href: "#" },
] as const;

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-10 w-10 sm:h-11 sm:w-11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-10 w-10 sm:h-11 sm:w-11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8.8a2.7 2.7 0 0 0-1.9-1.9C17.5 6.4 12 6.4 12 6.4s-5.5 0-7.1.5A2.7 2.7 0 0 0 3 8.8a28 28 0 0 0 0 6.4 2.7 2.7 0 0 0 1.9 1.9c1.6.5 7.1.5 7.1.5s5.5 0 7.1-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 0-6.4Z" />
      <path d="m10.1 9.6 4.8 2.4-4.8 2.4V9.6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-10 w-10 sm:h-11 sm:w-11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 10.1c2.7-1 5.8-.9 8.3.3" />
      <path d="M8.9 12.6c2.1-.7 4.5-.6 6.4.3" />
      <path d="M9.6 15c1.5-.4 3.2-.4 4.6.2" />
    </svg>
  );
}

function SocialIcon({ label }: { label: (typeof socialLinks)[number]["label"] }) {
  if (label === "Instagram") return <InstagramIcon />;
  if (label === "YouTube") return <YouTubeIcon />;
  return <SpotifyIcon />;
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M4 2.6 16.2 10 4 17.4V2.6Z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="crispEdges"
    >
      <path d="M3 10h4l5-4v12l-5-4H3v-4Z" />
      <path d="M16 9c1.2.8 2 1.9 2 3s-.8 2.2-2 3" />
      <path d="M18.6 7c1.9 1.4 3 3.2 3 5s-1.1 3.6-3 5" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="crispEdges"
    >
      <rect x="3" y="4" width="18" height="12" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function socialColorClass(label: (typeof socialLinks)[number]["label"]): string {
  if (label === "Instagram") return "text-[#ff56d8]";
  if (label === "YouTube") return "text-[#ff5f8f]";
  return "text-[#4dff9a]";
}

function socialGlowClass(label: (typeof socialLinks)[number]["label"]): string {
  if (label === "Instagram") {
    return "[filter:drop-shadow(0_0_7px_rgba(255,86,216,0.92))_drop-shadow(0_0_13px_rgba(255,86,216,0.62))]";
  }
  if (label === "YouTube") {
    return "[filter:drop-shadow(0_0_7px_rgba(255,95,143,0.92))_drop-shadow(0_0_13px_rgba(255,95,143,0.62))]";
  }
  return "[filter:drop-shadow(0_0_7px_rgba(77,255,154,0.94))_drop-shadow(0_0_13px_rgba(77,255,154,0.64))]";
}

export default function SiteFooter() {
  return (
    <footer className="mt-auto w-full overflow-hidden bg-[linear-gradient(180deg,#07031a_0%,#03010f_100%)] text-zinc-100">
      <div aria-hidden="true" className="h-[2px] w-full bg-gradient-to-r from-[#ff4ed0] via-[#7f5cff] to-[#42d7ff]" />

      <div className="w-full px-0 pb-0 pt-0">
        <div className="w-full border-2 border-[#d7d7d7] bg-[#b8b8b8] p-1 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#4a4a4a,0_0_16px_rgba(255,80,214,0.38),0_0_24px_rgba(68,214,255,0.22)]">
          <div className="border border-[#6d6d6d] bg-[#c8c8c8] p-1 shadow-[inset_1px_1px_0_#ededed,inset_-1px_-1px_0_#696969]">
            <div className="grid gap-1 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
              <section className="h-full border border-[#6f6f6f] bg-[#090327] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2),inset_-1px_-1px_0_rgba(45,20,95,0.9)]">
                <div className="flex h-full items-center justify-center border border-[#8a76cc] bg-[#0f0733] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.18),inset_-1px_-1px_0_rgba(20,12,56,0.95),0_0_12px_rgba(255,79,213,0.25)]">
                  <Link
                    href="/"
                    aria-label="Ir al inicio de Sugarbay"
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#62ddff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0733]"
                  >
                    <Image
                      src={FOOTER_LOGO_SRC}
                      alt="Logo de Sugarbay"
                      width={520}
                      height={180}
                      sizes="(max-width: 1023px) 165px, 190px"
                      className="mx-auto h-[64px] w-auto max-w-full object-contain drop-shadow-[0_0_10px_rgba(255,87,218,0.48)] transition duration-200 motion-safe:group-hover:-translate-y-0.5 group-hover:brightness-110 group-hover:drop-shadow-[0_0_14px_rgba(103,232,249,0.6)] sm:h-[72px] lg:h-[78px]"
                    />
                  </Link>
                </div>
              </section>

              <section className="h-full border border-[#6f6f6f] bg-[#090327] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2),inset_-1px_-1px_0_rgba(45,20,95,0.9)]">
                <div className="relative isolate flex h-full flex-col justify-center overflow-hidden border border-[#7e6ec3] bg-[#0d0630] px-2 py-1.5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.18),inset_-1px_-1px_0_rgba(25,14,73,0.92)] before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-[#67e7ff]/25 before:to-transparent before:opacity-0 before:animate-[sb-footer-sheen_5.8s_ease-in-out_infinite] motion-reduce:before:animate-none sm:px-4">
                  <nav aria-label="Navegacion principal del pie de pagina" className="sr-only">
                    <ul>
                      {primaryLinks.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href}>{link.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <nav aria-label="Enlaces legales del pie de pagina" className="flex justify-center">
                    <ul className="mx-auto flex w-full max-w-[58rem] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[#f4f0ff] sm:text-[0.82rem] lg:justify-between lg:gap-x-4">
                      {legalLinks.map((link) => (
                        <li key={link.label} className="flex min-h-[1.7rem] items-center justify-center">
                          <span
                            className="mr-1.5 h-1.5 w-1.5 bg-[#ff55cf] shadow-[0_0_8px_rgba(255,85,207,0.9)]"
                            aria-hidden="true"
                          />
                          {link.label === "Términos" ? (
                            <FooterTermsTrigger
                              label={link.label}
                              className="leading-none transition-[color,text-shadow,transform] duration-200 [text-shadow:0_0_9px_rgba(255,96,220,0.22)] motion-safe:hover:-translate-y-[1px] hover:text-[#ff9de7] hover:[text-shadow:0_0_10px_rgba(255,104,218,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0630]"
                            />
                          ) : (
                            <Link
                              href={link.href}
                              className="leading-none transition-[color,text-shadow,transform] duration-200 [text-shadow:0_0_9px_rgba(255,96,220,0.22)] motion-safe:hover:-translate-y-[1px] hover:text-[#ff9de7] hover:[text-shadow:0_0_10px_rgba(255,104,218,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0630]"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>

                </div>
              </section>

              <section className="h-full border border-[#6f6f6f] bg-[#090327] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2),inset_-1px_-1px_0_rgba(45,20,95,0.9)]">
                <div className="flex h-full items-center border border-[#7e6ec3] bg-[#0d0630] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.18),inset_-1px_-1px_0_rgba(25,14,73,0.92)]">
                  <div className="flex w-full items-center justify-between gap-1">
                    {socialLinks.map((link, index) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        aria-label={`${link.label} de Sugarbay`}
                        className="group inline-flex h-[56px] w-[56px] items-center justify-center border border-[#858585] bg-[linear-gradient(180deg,#e6e6e6_0%,#c8c8c8_100%)] p-[3px] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#7a7a7a] transition-transform duration-200 motion-safe:hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0630] sm:h-[62px] sm:w-[62px]"
                      >
                        <span
                          className={`flex h-full w-full items-center justify-center border border-[#4b3f7c] bg-[linear-gradient(180deg,#150747_0%,#090327_100%)] shadow-[inset_1px_1px_0_rgba(176,146,255,0.5),inset_-1px_-1px_0_rgba(16,8,52,0.96),0_0_8px_rgba(126,92,255,0.35)] transition-[filter,transform,box-shadow] duration-200 motion-safe:animate-[sb-footer-icon-breathe_4.8s_ease-in-out_infinite] motion-reduce:animate-none motion-safe:group-hover:scale-[1.06] motion-safe:group-hover:brightness-110 ${socialColorClass(link.label)} ${socialGlowClass(link.label)}`}
                          style={{ animationDelay: `${index * 140}ms` }}
                        >
                          <SocialIcon label={link.label} />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-1.5 border-t border-[#757575] pt-1.5">
              <div className="grid gap-1.5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
              <div className="border border-[#767676] bg-[linear-gradient(180deg,#e0e0e0_0%,#cdcdcd_100%)] p-1 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#858585]">
                <Link
                  href="/"
                  className="flex min-h-[2.5rem] items-center justify-center border border-[#7f7f7f] bg-[linear-gradient(180deg,#efefef_0%,#d4d4d4_100%)] px-2 py-0.5 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#9a9a9a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff]"
                  aria-label="Inicio Sugarbay"
                >
                  <span className="font-retro-pixel text-[0.62rem] font-black uppercase tracking-[0.08em] text-[#ff45cf] [text-shadow:0_0_7px_rgba(255,69,207,0.72),0_0_13px_rgba(186,118,255,0.55)] sm:text-[0.68rem]">
                    &copy; {COPYRIGHT_YEAR} Sugarbay
                  </span>
                </Link>
              </div>

              <div className="border border-[#6d6d6d] bg-[#0b0330] p-1 shadow-[inset_1px_1px_0_rgba(255,255,255,0.18),inset_-1px_-1px_0_rgba(31,14,79,0.92)]">
                <div className="flex min-h-[2.5rem] items-center justify-between gap-3 border border-[#7864c3] bg-[#120640] px-2.5">
                  <div aria-hidden="true" className="flex items-end gap-1">
                    {[8, 12, 16, 10, 20, 12, 17, 9].map((height, index) => (
                      <span
                        key={`eq-${index}`}
                        className="w-1 bg-gradient-to-t from-[#3fa9ff] via-[#8f5eff] to-[#ff57d0]"
                        style={{ height }}
                      />
                    ))}
                  </div>
                  <p className="min-w-0 truncate text-center font-retro-pixel text-[0.64rem] uppercase tracking-[0.08em] sm:text-[0.7rem]">
                    <span className="text-[#ff79dd] [text-shadow:0_0_8px_rgba(255,121,221,0.75),0_0_14px_rgba(255,85,207,0.55)]">
                      Now playing:
                    </span>{" "}
                    <span className="text-[#b986ff] [text-shadow:0_0_8px_rgba(185,134,255,0.8),0_0_14px_rgba(129,88,255,0.6)]">
                      Midnight Frequency
                    </span>
                  </p>
                  <span className="text-[#b986ff]" aria-hidden="true">
                    <PlayIcon />
                  </span>
                </div>
              </div>

              <div className="border border-[#767676] bg-[linear-gradient(180deg,#e0e0e0_0%,#cdcdcd_100%)] p-1 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#858585]">
                <div className="grid min-h-[2.5rem] grid-cols-[1fr_1fr_auto] items-center border border-[#7f7f7f] bg-[linear-gradient(180deg,#efefef_0%,#d4d4d4_100%)] px-2 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#9a9a9a]">
                  <span className="inline-flex items-center justify-center text-[#262626]" aria-hidden="true">
                    <SpeakerIcon />
                  </span>
                  <span className="inline-flex items-center justify-center text-[#1f2e5f]" aria-hidden="true">
                    <ScreenIcon />
                  </span>
                  <span className="pl-1 font-retro-pixel text-[0.72rem] uppercase tracking-[0.08em] text-[#111]">
                    23:45
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
