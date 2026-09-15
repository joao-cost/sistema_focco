"use client";

import { useEffect } from "react";

/** Registra o service worker (PWA) — silencioso em dev/HTTP, só funciona em produção com HTTPS. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sem HTTPS (dev local) ou navegador sem suporte — sem problema, o
        // app funciona normal, só não fica instalável.
      });
    }
  }, []);

  return null;
}
