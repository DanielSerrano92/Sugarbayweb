"use client";

import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

type AppModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  bodyClassName?: string;
  overlayOpacity?: number;
  variant?: "default" | "win95";
  heightMode?: "fixed" | "content";
};

export default function AppModal({
  title,
  onClose,
  children,
  maxWidth = "1220px",
  bodyClassName = "",
  overlayOpacity = 0.3,
  variant = "default",
  heightMode = "fixed",
}: AppModalProps) {
  const titleId = useId();
  const isWin95 = variant === "win95";
  const useFixedHeight = heightMode === "fixed";

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden p-3 sm:p-6"
      style={{ zIndex: 10000 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0"
        style={{
          zIndex: 0,
          backgroundColor: `rgb(0 0 0 / ${overlayOpacity})`,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
        aria-label="Cerrar modal"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex min-h-0 w-full flex-col overflow-hidden shadow-2xl ${
          isWin95 ? "win-window rounded-none" : "sb-window rounded-3xl"
        }`}
        style={{
          height: useFixedHeight ? "min(760px, calc(100dvh - 1.5rem))" : "auto",
          maxHeight: "calc(100dvh - 1.5rem)",
          maxWidth,
          zIndex: 1,
        }}
      >
        <header
          className={`sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 ${
            isWin95
              ? "win-titlebar px-4 py-2"
              : "sb-titlebar px-4 py-3 sm:px-6"
          }`}
        >
          <h2
            id={titleId}
            className={`min-w-0 truncate font-black uppercase tracking-[0.14em] text-white ${
              isWin95 ? "text-xs" : "text-xs sm:text-sm"
            }`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className={`inline-flex shrink-0 items-center justify-center leading-none ${
              isWin95
                ? "win-button px-3 py-1 text-xs"
                : "sb-btn-secondary h-9 w-9 rounded-full p-0 text-xl text-white"
            }`}
          >
            <span aria-hidden="true">{isWin95 ? "Cerrar" : "\u00D7"}</span>
          </button>
        </header>

        <div
          className={`min-h-0 ${useFixedHeight ? "flex-1" : "shrink-0"} touch-pan-y overflow-y-auto overscroll-contain p-4 sm:p-6 ${bodyClassName}`.trim()}
        >
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}
