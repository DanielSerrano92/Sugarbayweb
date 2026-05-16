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
      className="fixed inset-0 z-[10000] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6"
    >
      <button
        type="button"
        aria-label="Cerrar términos y condiciones"
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
            Términos y condiciones
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar términos y condiciones"
            className="win-button retro-win-close"
          >
            X
          </button>
        </div>

        <div className="auth-retro-body min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="auth-retro-form-wrap space-y-4">
            <p className="rounded-none border border-[#7f7f9a] bg-[#ece9f8] p-3 text-sm font-semibold leading-6 text-[#2a2740]">
              Lee este resumen legal antes de usar la plataforma. Está redactado
              para una web musical con tienda, contenido multimedia y
              funcionalidades de usuario.
            </p>

            <div className="space-y-4">
              {termsSections.map((section) => (
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
