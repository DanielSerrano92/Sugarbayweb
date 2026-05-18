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

    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const hasNestedModal = () =>
      Boolean(document.querySelector("[data-auth-nested-modal='true']"));

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (hasNestedModal()) return;

      if (event.key === "Escape") onClose();

      const focusableElements = getFocusableElements();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="retro-vapor-overlay absolute inset-0 cursor-default"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby={description ? "auth-modal-description" : undefined}
        className="win-window auth-retro-modal relative z-10 flex w-full max-w-2xl min-h-0 flex-col overflow-hidden p-0"
      >
        <div className="win-titlebar flex items-center justify-between gap-3">
          <h2 id="auth-modal-title" className="min-w-0 truncate pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de autenticacion"
            className="win-button retro-win-close"
          >
            X
          </button>
        </div>

        <div className="auth-retro-body min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {description ? (
            <p id="auth-modal-description" className="auth-retro-description mb-3 text-sm">
              {description}
            </p>
          ) : null}
          <div className="auth-retro-content">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
