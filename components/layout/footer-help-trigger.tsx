"use client";

import { useState } from "react";

import HelpModal from "@/components/auth/help-modal";

type FooterHelpTriggerProps = {
  label: string;
  className?: string;
};

export default function FooterHelpTrigger({
  label,
  className,
}: FooterHelpTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir ayuda"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={className}
      >
        {label}
      </button>

      <HelpModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

