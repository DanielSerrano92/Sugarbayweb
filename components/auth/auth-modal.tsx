"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type AuthModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function AuthModal({
  open,
  title,
  description,
  onClose,
  children,
}: AuthModalProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "Tab" && focusableElements.length > 0) {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby={description ? "auth-modal-description" : undefined}
        className="sb-window relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl p-0"
      >
        <div className="sb-titlebar flex items-center justify-between gap-3 px-6 py-2">
          <h2 id="auth-modal-title" className="text-sm font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="sb-btn-secondary px-3 py-1.5 text-xs font-medium text-white transition"
          >
            Cerrar
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4">
            {description ? (
              <p id="auth-modal-description" className="text-sm text-zinc-600">
                {description}
              </p>
            ) : null}
          </div>
          <div>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
