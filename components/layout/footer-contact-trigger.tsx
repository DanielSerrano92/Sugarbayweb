"use client";

import { useState } from "react";

import ContactModal from "@/components/auth/contact-modal";

type FooterContactTriggerProps = {
  label: string;
  className?: string;
};

export default function FooterContactTrigger({
  label,
  className,
}: FooterContactTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir contacto"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={className}
      >
        {label}
      </button>

      <ContactModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

