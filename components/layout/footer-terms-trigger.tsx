"use client";

import { useState } from "react";

import TermsAndConditionsModal from "@/components/auth/terms-and-conditions-modal";

type FooterTermsTriggerProps = {
  label: string;
  className?: string;
};

export default function FooterTermsTrigger({
  label,
  className,
}: FooterTermsTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir términos y condiciones"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={className}
      >
        {label}
      </button>

      <TermsAndConditionsModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
