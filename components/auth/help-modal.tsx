"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
};

const helpSections = [
  {
    title: "1. BIENVENIDA A AYUDA",
    content:
      "Esta guia rapida esta pensada para ayudarte a moverte por la web oficial de Sugarbay y resolver dudas comunes de forma sencilla.",
  },
  {
    title: "2. QUE PUEDES ENCONTRAR AQUI",
    content:
      "En esta web puedes explorar noticias, musica, conciertos, tienda oficial, seccion Bio/Banda y contenido audiovisual del universo Sugarbay.",
  },
  {
    title: "3. NAVEGACION",
    content:
      "Usa el menu principal para cambiar de seccion en cualquier momento. Si buscas algo concreto, empieza por Noticias para lanzamientos, Musica para canciones y Conciertos para fechas en directo.",
  },
  {
    title: "4. MUSICA Y VIDEOS",
    content:
      "En Musica y Media puedes consultar canciones, estrenos, videoclips y piezas promocionales relacionadas con cada etapa creativa de Sugarbay.",
  },
  {
    title: "5. TIENDA",
    content:
      "La Tienda muestra productos oficiales de Sugarbay. Cuando esten disponibles, podras revisar detalles, anadir articulos al carrito y completar la compra.",
  },
  {
    title: "6. PROBLEMAS FRECUENTES",
    content:
      "Si una imagen no carga, prueba a recargar la pagina. Si no encuentras una seccion, vuelve al menu principal. Si tienes problemas con un pedido, revisa la informacion de compra y usa Contacto. Si un modal no se abre, cierra y vuelve a intentarlo. Si necesitas mas contexto sobre un lanzamiento, consulta Noticias o escribenos.",
  },
  {
    title: "7. NECESITAS MAS AYUDA",
    content:
      "Si tu duda no aparece en esta guia, abre la seccion CONTACTO desde el footer y cuentanos tu consulta. El equipo de Sugarbay te respondera lo antes posible.",
  },
] as const;

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  return Array.from(
    container?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [],
  );
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getFocusableElements(dialogRef.current)[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-auth-nested-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6"
    >
      <button
        type="button"
        aria-label="Cerrar ayuda"
        onClick={onClose}
        className="retro-vapor-overlay absolute inset-0 cursor-default"
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="win-window auth-retro-modal relative z-10 flex w-full max-w-4xl min-h-0 flex-col overflow-hidden p-0"
      >
        <div className="win-titlebar flex items-center justify-between gap-3">
          <h2 id={titleId} className="min-w-0 truncate pr-2">
            AYUDA
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ayuda"
            className="win-button retro-win-close"
          >
            X
          </button>
        </div>

        <div className="auth-retro-body min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="auth-retro-form-wrap space-y-4">
            <p className="rounded-none border border-[#7f7f9a] bg-[#ece9f8] p-3 text-sm font-semibold leading-6 text-[#2a2740]">
              Bienvenido a AYUDA. Aqui tienes una guia clara para navegar por la
              web de Sugarbay, encontrar contenido y resolver incidencias
              frecuentes.
            </p>

            <div className="space-y-4">
              {helpSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-none border border-[#8e8e8e] bg-[#e8e4f2] p-3 shadow-[inset_1px_1px_0_#f8f8f8,inset_-1px_-1px_0_#b0b0b0]"
                >
                  <h3 className="font-retro-pixel text-[0.58rem] uppercase tracking-[0.05em] text-[#1f1f2b]">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#38354f]">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
