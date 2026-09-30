"use client";

import { useEffect } from "react";

/**
 * Registra `public/sw.js` uma vez, no client. Sem suporte a Service Worker
 * (navegador antigo, contexto não seguro) o componente não faz nada — o app
 * funciona normalmente sem PWA/push.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Progressive enhancement: falha silenciosa não deve afetar o app.
    });
  }, []);
  return null;
}
