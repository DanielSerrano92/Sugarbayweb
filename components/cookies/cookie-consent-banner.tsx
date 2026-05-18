"use client";

import { useEffect, useId, useState } from "react";

import {
  buildCookieConsentPreference,
  COOKIE_CONSENT_OPEN_CONFIG_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentStatus,
  parseCookieConsentPreference,
} from "@/lib/cookies/consent";

function saveCookieConsentPreference(status: CookieConsentStatus) {
  const preference = buildCookieConsentPreference(status);
  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(preference),
  );
}

export default function CookieConsentBanner() {
  const titleId = useId();
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedPreference = parseCookieConsentPreference(
        window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
      );

      setIsVisible(!storedPreference);
      setIsReady(true);
    });

    const handleOpenConfig = () => {
      setIsConfigOpen(true);
      setIsVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_CONFIG_EVENT, handleOpenConfig);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(COOKIE_CONSENT_OPEN_CONFIG_EVENT, handleOpenConfig);
    };
  }, []);

  const applyPreference = (status: CookieConsentStatus) => {
    saveCookieConsentPreference(status);
    setIsConfigOpen(false);
    setIsVisible(false);
  };

  if (!isReady || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
      <div aria-hidden="true" className="retro-vapor-overlay absolute inset-0" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="win-window relative z-10 flex w-full max-w-5xl min-h-0 flex-col overflow-hidden border-2 border-black bg-[#c3c3c3] shadow-[inset_-2px_-2px_0_#777,inset_2px_2px_0_#fff,0_0_20px_rgba(255,77,208,0.24),0_0_30px_rgba(76,214,255,0.18)]"
        style={{ maxHeight: "calc(100dvh - 1rem)" }}
      >
        <header className="win-titlebar flex items-center justify-between gap-2 border-b border-black/30 px-3 py-2 sm:px-4">
          <h2 id={titleId} className="truncate">
            Preferencias de cookies
          </h2>
          <span className="font-retro-pixel text-[0.55rem] uppercase tracking-[0.06em] text-white/90">
            Sugarbay
          </span>
        </header>

        <div className="space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#d7d4e4_0%,#c9c6dc_100%)] p-3 text-[#1f1f2b] sm:p-4">
          <p className="text-xs leading-6 sm:text-sm">
            Usamos cookies necesarias para que funcionen el inicio de sesion, el carrito y
            el checkout. En este momento no se detectan cookies opcionales de analitica o
            marketing cargadas por scripts del proyecto.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreference("accepted")}
              className="win-button min-h-[2.1rem] min-w-[8.5rem] text-[0.66rem] uppercase tracking-[0.06em]"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => applyPreference("rejected")}
              className="win-button min-h-[2.1rem] min-w-[8.5rem] text-[0.66rem] uppercase tracking-[0.06em]"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => setIsConfigOpen((current) => !current)}
              className="win-button min-h-[2.1rem] min-w-[11rem] text-[0.64rem] uppercase tracking-[0.05em]"
              aria-expanded={isConfigOpen}
              aria-controls="cookie-config-panel"
            >
              Configurar cookies
            </button>
          </div>

          {isConfigOpen ? (
            <div
              id="cookie-config-panel"
              className="space-y-3 border border-[#7e7a99] bg-[#ebe9f6] p-3 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#a9a6bf]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border border-[#8d89a9] bg-[#f4f3fb] px-3 py-2">
                <p className="font-retro-pixel text-[0.55rem] uppercase tracking-[0.05em] text-[#2a2840]">
                  Cookies necesarias
                </p>
                <span className="win-button !cursor-default px-2 py-1 text-[0.58rem] uppercase tracking-[0.05em]">
                  Siempre activas
                </span>
              </div>

              <p className="text-xs leading-6 text-[#34314f] sm:text-sm">
                No hay categorias opcionales activas en scripts de analitica o marketing.
                Si en el futuro se anaden, esta configuracion permitira activarlas o
                desactivarlas por separado.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreference("configured")}
                  className="win-button min-h-[2.05rem] min-w-[11rem] text-[0.62rem] uppercase tracking-[0.05em]"
                >
                  Guardar configuracion
                </button>
                <button
                  type="button"
                  onClick={() => applyPreference("accepted")}
                  className="win-button min-h-[2.05rem] min-w-[8.7rem] text-[0.62rem] uppercase tracking-[0.05em]"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={() => applyPreference("rejected")}
                  className="win-button min-h-[2.05rem] min-w-[12rem] text-[0.62rem] uppercase tracking-[0.05em]"
                >
                  Rechazar no necesarias
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}



