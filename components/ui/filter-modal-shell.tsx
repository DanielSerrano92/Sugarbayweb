"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

type FilterModalShellProps = {
  modalId: string;
  title?: string;
  buttonLabel?: string;
  children: ReactNode;
};

export default function FilterModalShell({
  modalId,
  title = "Filtros",
  buttonLabel = "Abrir filtros",
  children,
}: FilterModalShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = `${modalId}-title`;

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleContentClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target;

    if (target instanceof Element && target.closest("a")) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="retro-folder-button"
        aria-label={buttonLabel}
        aria-expanded={isOpen}
        aria-controls={modalId}
        onClick={() => setIsOpen(true)}
      >
        <span className="retro-folder-icon" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="retro-modal-overlay"
            aria-label="Cerrar modal de filtros"
            onClick={() => setIsOpen(false)}
          />

          <section
            id={modalId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="win-window retro-filters-modal relative z-10 w-full max-w-lg overflow-hidden"
            onClick={handleContentClick}
          >
            <div className="win-titlebar flex items-center justify-between gap-4">
              <span id={titleId}>{title}</span>
              <button
                type="button"
                className="win-button retro-win-close"
                aria-label="Cerrar modal de filtros"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>
            {children}
          </section>
        </div>
      ) : null}
    </>
  );
}
