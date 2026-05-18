import Image from "next/image";
import Link from "next/link";

import FooterCookieTrigger from "./footer-cookie-trigger";
import FooterHelpTrigger from "./footer-help-trigger";
import FooterContactTrigger from "./footer-contact-trigger";
import FooterTermsTrigger from "./footer-terms-trigger";

const FOOTER_LOGO_SRC = "https://ik.imagekit.io/gq1enkszp/fotos/logo2.png?updatedAt=1779020800274";
const FOOTER_YEAR = 2026;

const infoLinks = [
  { id: "help", label: "AYUDA" },
  { id: "terms", label: "TERMINOS Y CONDICIONES" },
  { id: "cookies", label: "COOKIES" },
  { id: "contact", label: "CONTACTO" },
] as const;

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sugarbaystudios?igsh=ZzM2dGFyeTNuaXVk",
  },
  { label: "YouTube", href: "https://www.youtube.com/@SugarBayStudios" },
  {
    label: "Spotify",
    href: "https://open.spotify.com/intl-es/artist/4nutTW6L6naDtwQ7cW2zi1",
  },
] as const;

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-11 w-11 sm:h-12 sm:w-12 md:h-[3.1rem] md:w-[3.1rem] xl:h-[3.35rem] xl:w-[3.35rem]"
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
      className="h-11 w-11 sm:h-12 sm:w-12 md:h-[3.1rem] md:w-[3.1rem] xl:h-[3.35rem] xl:w-[3.35rem]"
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
      className="h-11 w-11 sm:h-12 sm:w-12 md:h-[3.1rem] md:w-[3.1rem] xl:h-[3.35rem] xl:w-[3.35rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
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

function socialColorClass(label: (typeof socialLinks)[number]["label"]): string {
  if (label === "Instagram") return "text-[#ff56d8]";
  if (label === "YouTube") return "text-[#ff3030]";
  return "text-[#4dff9a]";
}

export default function SiteFooter() {
  return (
    <footer className="mt-auto w-full bg-[#bdbdbd] text-[#101010]">
      <div className="w-full border-y border-[#d6d6d6] bg-[#bdbdbd] px-2 py-2.5 sm:px-3 sm:py-3">
        <div className="w-full border border-[#696969] bg-[linear-gradient(180deg,#d4d4d4_0%,#c6c6c6_100%)] p-1 shadow-[inset_1px_1px_0_#f8f8f8,inset_-1px_-1px_0_#878787]">
          <div className="w-full border border-[#737373] bg-[linear-gradient(180deg,#d5d5d5_0%,#c9c9c9_100%)] shadow-[inset_1px_1px_0_#f2f2f2,inset_-1px_-1px_0_#8b8b8b]">
            <div className="grid min-h-[132px] w-full grid-cols-1 xl:min-h-[146px] xl:grid-cols-[auto_minmax(0,1fr)_auto]">
              <section className="flex min-w-0 items-center justify-center gap-3.5 border-b border-[#878787] px-4 py-4 sm:gap-4 sm:px-5 xl:justify-start xl:border-b-0 xl:border-r xl:pr-6">
                <Link
                  href="/"
                  aria-label="Ir al inicio de Sugarbay"
                  className="group inline-flex shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#62ddff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                >
                  <Image
                    src={FOOTER_LOGO_SRC}
                    alt="Sugarbay logo"
                    width={520}
                    height={180}
                    sizes="(max-width: 1023px) 190px, 250px"
                    className="h-[64px] w-auto object-contain drop-shadow-[0_0_8px_rgba(255,87,218,0.32)] transition duration-200 motion-safe:group-hover:brightness-110 sm:h-[74px] md:h-[80px] xl:h-[88px]"
                  />
                </Link>
                <p className="truncate font-retro-pixel text-[1.02rem] font-black uppercase tracking-[0.05em] text-[#121212] sm:text-[1.15rem] md:text-[1.3rem] xl:text-[1.48rem]">
                  SUGARBAY
                </p>
              </section>

              <section className="flex min-w-0 items-center justify-center border-b border-[#878787] px-4 py-3.5 xl:border-b-0 xl:px-5">
                <nav aria-label="Enlaces del pie de pagina" className="w-full">
                  <ul className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center justify-center gap-x-2 gap-y-2 font-retro-pixel text-[0.74rem] font-black uppercase tracking-[0.03em] text-[#141414] sm:text-[0.84rem] md:text-[0.9rem] lg:gap-x-2.5 lg:text-[0.96rem] xl:text-[1.03rem]">
                    {infoLinks.map((link, index) => (
                      <li
                        key={link.id}
                        className={[
                          "inline-flex items-center whitespace-nowrap",
                          index > 0
                            ? "before:mx-2 before:h-5 before:w-px before:bg-[#bb35ce] before:content-['']"
                            : "",
                        ].join(" ")}
                      >
                        {link.id === "help" ? (
                          <FooterHelpTrigger
                            label={link.label}
                            className="leading-none transition-[color,text-shadow] duration-200 hover:text-[#9a00b0] hover:[text-shadow:0_0_8px_rgba(255,95,223,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                          />
                        ) : link.id === "terms" ? (
                          <FooterTermsTrigger
                            label={link.label}
                            className="leading-none transition-[color,text-shadow] duration-200 hover:text-[#9a00b0] hover:[text-shadow:0_0_8px_rgba(255,95,223,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                          />
                        ) : link.id === "cookies" ? (
                          <FooterCookieTrigger
                            label={link.label}
                            className="leading-none transition-[color,text-shadow] duration-200 hover:text-[#9a00b0] hover:[text-shadow:0_0_8px_rgba(255,95,223,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                          />
                        ) : link.id === "contact" ? (
                          <FooterContactTrigger
                            label={link.label}
                            className="leading-none transition-[color,text-shadow] duration-200 hover:text-[#9a00b0] hover:[text-shadow:0_0_8px_rgba(255,95,223,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-center font-retro-pixel text-[0.74rem] font-black uppercase tracking-[0.03em] text-[#151515] sm:text-[0.84rem] md:text-[0.9rem] lg:text-[0.96rem] xl:text-[1.03rem]">
                    @SUGARBAY {FOOTER_YEAR}
                  </p>
                </nav>
              </section>

              <section className="flex items-center justify-center gap-3.5 px-4 py-4 xl:border-l xl:border-[#878787] xl:pl-5 xl:pr-5">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-label={`${link.label} de Sugarbay`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-[70px] w-[70px] items-center justify-center border border-[#858585] bg-[linear-gradient(180deg,#ededed_0%,#cdcdcd_100%)] p-[4px] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#747474] transition-transform duration-200 motion-safe:hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc] sm:h-[78px] sm:w-[78px] md:h-[84px] md:w-[84px] xl:h-[92px] xl:w-[92px]"
                  >
                    <span
                      className={`flex h-full w-full items-center justify-center border border-[#6e6e6e] bg-[linear-gradient(180deg,#ececec_0%,#d6d6d6_100%)] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#949494] transition duration-200 motion-safe:group-hover:brightness-105 ${socialColorClass(link.label)}`}
                    >
                      <SocialIcon label={link.label} />
                    </span>
                  </Link>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
