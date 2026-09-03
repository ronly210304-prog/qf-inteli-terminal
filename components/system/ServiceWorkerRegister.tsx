"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (STEP 14/PWA). No-ops silently if unsupported. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal — the site still works fully as a regular website.
      });
    }
  }, []);
  return null;
}
