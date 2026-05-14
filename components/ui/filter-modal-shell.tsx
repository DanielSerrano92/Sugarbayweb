"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

type FilterModalShellProps = {
  modalId: string;
  title?: string;
  buttonLabel?: string;
  windowClassName?: string;
  titlebarClassName?: string;
  children: ReactNode;
};

export default function FilterModalShell({
  modalId,
  title = "Filtros",
  buttonLabel = "Abrir filtros",
  windowClassName,
  titlebarClassName,
  children,
}: FilterModalShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = `${modalId}-title`;
  const canUseDOM = typeof document !== "undefined";

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

  const modal = isOpen && canUseDOM
    ? createPortal(
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-2 sm:items-center sm:p-4">
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
            className={[
              "win-window retro-filters-modal relative z-[81] w-full overflow-hidden",
              windowClassName,
            ].filter(Boolean).join(" ")}
            onClick={handleContentClick}
          >
            <div
              className={[
                "win-titlebar flex shrink-0 items-center justify-between gap-4",
                titlebarClassName,
              ].filter(Boolean).join(" ")}
            >
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
            <div className="min-h-0 overflow-y-auto">{children}</div>
          </section>
        </div>,
        document.body,
      )
    : null;

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
      {modal}
    </>
  );
}
