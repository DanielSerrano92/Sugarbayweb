"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type TermsAndConditionsModalProps = {
  open: boolean;
  onClose: () => void;
};

const termsSections = [
  {
    title: "1. Introducción",
    content:
      "Estos términos regulan el acceso y uso de la web oficial de Sugarbay, incluyendo el registro de usuarios, la tienda online, el contenido multimedia y las funcionalidades relacionadas con conciertos, noticias y comunidad.",
  },
  {
    title: "2. Objeto de la plataforma",
    content:
      "La plataforma permite consultar información de la banda, acceder a contenidos musicales y audiovisuales, gestionar una cuenta de usuario, guardar productos en el carrito y realizar compras de merchandising u otros artículos oficiales cuando estén disponibles.",
  },
  {
    title: "3. Registro de usuario",
    content:
      "Para crear una cuenta, el usuario debe facilitar datos veraces, mantener la confidencialidad de sus credenciales y aceptar estos términos. La cuenta es personal e intransferible. Sugarbay puede bloquear cuentas con datos falsos, uso abusivo o actividad que comprometa la seguridad de la plataforma.",
  },
  {
    title: "4. Uso permitido de la web",
    content:
      "El usuario se compromete a utilizar la web de forma lícita, respetuosa y conforme a su finalidad. No está permitido intentar acceder a zonas privadas, alterar el funcionamiento técnico, suplantar identidades, automatizar acciones abusivas ni publicar contenido ofensivo o fraudulento.",
  },
  {
    title: "5. Compras, pagos y pedidos",
    content:
      "Las compras se procesan mediante proveedores de pago externos seguros. El usuario debe revisar los datos del pedido antes de confirmarlo. Los importes, impuestos, gastos de envío y condiciones aplicables se mostrarán durante el proceso de checkout cuando proceda.",
  },
  {
    title: "6. Productos físicos y digitales",
    content:
      "Los productos físicos pueden estar sujetos a disponibilidad, plazos de preparación y transporte. Los productos digitales o accesos multimedia, cuando existan, se facilitarán según las condiciones indicadas en cada ficha. Las imágenes y descripciones buscan representar fielmente el producto, aunque pueden existir pequeñas variaciones.",
  },
  {
    title: "7. Contenido multimedia",
    content:
      "La web puede incluir fotografías, vídeos, textos, canciones, portadas, crónicas y otros materiales relacionados con Sugarbay. Este contenido se ofrece para uso personal e informativo, sin autorización para su descarga, redistribución o explotación comercial salvo permiso expreso.",
  },
  {
    title: "8. Propiedad intelectual",
    content:
      "La marca Sugarbay, sus diseños, textos, composiciones, imágenes, logotipos y materiales audiovisuales pertenecen a sus titulares o se utilizan con autorización. El uso de la plataforma no concede derechos de propiedad intelectual sobre dichos contenidos.",
  },
  {
    title: "9. Protección de datos",
    content:
      "Los datos personales se utilizarán para gestionar la cuenta, pedidos, carrito, comunicaciones necesarias y seguridad de la plataforma. El tratamiento se realizará conforme a la normativa aplicable y no se solicitarán más datos de los necesarios para prestar el servicio.",
  },
  {
    title: "10. Responsabilidad del usuario",
    content:
      "El usuario es responsable de la exactitud de los datos introducidos, del uso de su cuenta y de cualquier actividad realizada con sus credenciales. Si detecta un acceso no autorizado, debe comunicarlo lo antes posible para proteger la cuenta.",
  },
  {
    title: "11. Limitación de responsabilidad",
    content:
      "Sugarbay trabaja para mantener la web disponible y segura, pero no puede garantizar la ausencia absoluta de interrupciones, errores técnicos o incidencias externas. La plataforma no se responsabiliza de fallos imputables a terceros, proveedores de pago, transporte o servicios externos enlazados.",
  },
  {
    title: "12. Modificaciones de los términos",
    content:
      "Estos términos pueden actualizarse para adaptarse a cambios legales, técnicos o funcionales. Cuando los cambios sean relevantes, se procurará informar al usuario de forma clara antes de que sigan aplicándose al uso de la plataforma.",
  },
  {
    title: "13. Contacto",
    content:
      "Para consultas sobre cuentas, pedidos, contenido o estos términos, el usuario puede contactar con el equipo de Sugarbay mediante los canales oficiales publicados en la web.",
  },
];

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  return Array.from(
    container?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [],
  );
}

export default function TermsAndConditionsModal({
  open,
  onClose,
}: TermsAndConditionsModalProps) {
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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <button
        type="button"
        aria-label="Cerrar términos y condiciones"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sb-window relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl"
      >
        <header className="sb-titlebar flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <h2
            id={titleId}
            className="min-w-0 truncate text-xs font-black uppercase tracking-[0.14em] text-white sm:text-sm"
          >
            Términos y condiciones
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar términos y condiciones"
            className="sb-btn-secondary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 text-xl leading-none text-white"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm leading-6 text-zinc-800 sm:p-6">
          <p className="rounded-2xl border border-emerald-300/40 bg-emerald-100/40 p-4 text-zinc-900">
            Lee este resumen legal antes de crear tu cuenta. Está redactado para
            una web musical con tienda, contenido multimedia y funcionalidades de
            usuario.
          </p>

          <div className="mt-5 space-y-5">
            {termsSections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-zinc-300/70 bg-zinc-50/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-zinc-900">
                  {section.title}
                </h3>
                <p className="mt-2 text-zinc-700">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="sticky bottom-0 mt-6 flex justify-end border-t border-zinc-300/70 bg-[#15112f]/95 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="sb-btn-primary px-4 py-2.5 text-sm font-semibold"
            >
              Volver al registro
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
