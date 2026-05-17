"use client";

import { COOKIE_CONSENT_OPEN_CONFIG_EVENT } from "@/lib/cookies/consent";

type FooterCookieTriggerProps = {
  label: string;
  className?: string;
};

export default function FooterCookieTrigger({
  label,
  className,
}: FooterCookieTriggerProps) {
  const handleClick = () => {
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_CONFIG_EVENT));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Abrir configuracion de cookies"
      aria-haspopup="dialog"
      className={className}
    >
      {label}
    </button>
  );
}
