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
  { id: "terms", label: "TERMINOS" },
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
      className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
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
      className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
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
      className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
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
  const footerLinkClass =
    "inline-flex items-center rounded-[2px] px-3 py-1.5 leading-none transition-[color,text-shadow,text-decoration-color,transform] duration-200 motion-safe:hover:scale-[1.1] hover:text-[#c000d8] hover:underline hover:decoration-[#e154ef] hover:underline-offset-[3px] hover:[text-shadow:0_0_10px_rgba(255,95,223,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]";

  return (
    <footer className="mt-auto w-full bg-[#bdbdbd] text-[#101010]">
      <div className="w-full border-y border-[#d6d6d6] bg-[#bdbdbd] px-[1px] py-[2px] sm:px-[2px] sm:py-[3px]">
        <div className="w-full border border-[#696969] bg-[linear-gradient(180deg,#d4d4d4_0%,#c6c6c6_100%)] p-[2px] shadow-[inset_1px_1px_0_#f8f8f8,inset_-1px_-1px_0_#878787]">
          <div className="w-full border border-[#737373] bg-[linear-gradient(180deg,#d5d5d5_0%,#c9c9c9_100%)] shadow-[inset_1px_1px_0_#f2f2f2,inset_-1px_-1px_0_#8b8b8b]">
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-2 gap-y-2.5 px-1.5 py-2 sm:gap-x-3 sm:px-2.5 sm:py-2.5 min-[1025px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1025px]:grid-rows-1 min-[1025px]:items-center min-[1025px]:gap-x-6 min-[1025px]:gap-y-0">
              <section className="col-span-2 col-start-1 row-start-1 flex items-center justify-center gap-3 min-[1025px]:hidden">
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
                    sizes="220px"
                    className="h-[74px] w-auto object-contain drop-shadow-[0_0_7px_rgba(255,87,218,0.3)] transition duration-200 motion-safe:group-hover:scale-[1.08] motion-safe:group-hover:brightness-110"
                  />
                </Link>
                {socialLinks.map((link) => (
                  <Link
                    key={`mobile-${link.label}`}
                    href={link.href}
                    aria-label={`${link.label} de Sugarbay`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-[56px] w-[56px] items-center justify-center border border-[#858585] bg-[linear-gradient(180deg,#ededed_0%,#cdcdcd_100%)] p-[3px] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#747474] transition-transform duration-200 motion-safe:hover:-translate-y-[1px] motion-safe:hover:scale-[1.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc]"
                  >
                    <span
                      className={`flex h-full w-full items-center justify-center border border-[#6e6e6e] bg-[linear-gradient(180deg,#ececec_0%,#d6d6d6_100%)] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#949494] transition duration-200 motion-safe:group-hover:brightness-105 ${socialColorClass(link.label)}`}
                    >
                      <SocialIcon label={link.label} />
                    </span>
                  </Link>
                ))}
              </section>

              <section className="hidden col-start-1 row-start-1 min-w-0 items-center gap-2 min-[1025px]:flex min-[1025px]:gap-2.5 min-[1025px]:col-start-1 min-[1025px]:row-start-1 min-[1025px]:pr-2">
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
                    sizes="(max-width: 767px) 250px, (max-width: 1024px) 320px, 430px"
                    className="h-[66px] w-auto object-contain drop-shadow-[0_0_7px_rgba(255,87,218,0.3)] transition duration-200 motion-safe:group-hover:scale-[1.08] motion-safe:group-hover:brightness-110 sm:h-[78px] md:h-[92px] min-[1025px]:h-[128px]"
                  />
                </Link>
              </section>

              <section className="hidden col-start-2 row-start-1 items-center justify-center gap-2 min-[1025px]:flex min-[1025px]:gap-2.5 min-[1025px]:col-start-3 min-[1025px]:row-start-1">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-label={`${link.label} de Sugarbay`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-[50px] w-[50px] items-center justify-center border border-[#858585] bg-[linear-gradient(180deg,#ededed_0%,#cdcdcd_100%)] p-[3px] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#747474] transition-transform duration-200 motion-safe:hover:-translate-y-[1px] motion-safe:hover:scale-[1.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#cccccc] sm:h-[64px] sm:w-[64px] md:h-[70px] md:w-[70px] min-[1025px]:h-[88px] min-[1025px]:w-[88px]"
                  >
                    <span
                      className={`flex h-full w-full items-center justify-center border border-[#6e6e6e] bg-[linear-gradient(180deg,#ececec_0%,#d6d6d6_100%)] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#949494] transition duration-200 motion-safe:group-hover:brightness-105 ${socialColorClass(link.label)}`}
                    >
                      <SocialIcon label={link.label} />
                    </span>
                  </Link>
                ))}
              </section>

              <section className="col-span-2 col-start-1 row-start-2 min-w-0 border-t border-[#8f8f8f] pt-2 sm:pt-2.5 min-[1025px]:col-span-1 min-[1025px]:col-start-2 min-[1025px]:row-start-1 min-[1025px]:border-t-0 min-[1025px]:pt-0">
                <nav aria-label="Enlaces del pie de pagina" className="w-full">
                  <ul className="mx-auto flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-1 font-retro-pixel text-[0.54rem] font-black uppercase tracking-[0.03em] text-[#141414] sm:text-[0.66rem] min-[1025px]:flex-nowrap min-[1025px]:justify-center min-[1025px]:gap-x-1.5 min-[1025px]:text-[0.8rem] xl:text-[0.86rem]">
                    {infoLinks.map((link, index) => (
                      <li
                        key={link.id}
                        className={[
                          "inline-flex items-center",
                          index > 0
                            ? "before:mx-1 before:h-4 before:w-px before:bg-[#bb35ce] before:content-[''] sm:before:mx-1.5"
                            : "",
                        ].join(" ")}
                      >
                        {link.id === "help" ? (
                          <FooterHelpTrigger
                            label={link.label}
                            className={footerLinkClass}
                          />
                        ) : link.id === "terms" ? (
                          <FooterTermsTrigger
                            label={link.label}
                            className={footerLinkClass}
                          />
                        ) : link.id === "cookies" ? (
                          <FooterCookieTrigger
                            label={link.label}
                            className={footerLinkClass}
                          />
                        ) : link.id === "contact" ? (
                          <FooterContactTrigger
                            label={link.label}
                            className={footerLinkClass}
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 hidden text-center font-retro-pixel text-[0.52rem] font-black uppercase tracking-[0.04em] text-[#151515] sm:block sm:text-[0.62rem] min-[1025px]:text-[0.8rem]">
                    @SUGARBAY {FOOTER_YEAR}
                  </p>
                </nav>
              </section>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
