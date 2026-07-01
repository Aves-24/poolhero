"use client";

import { useEffect, useRef } from "react";

/**
 * Nie pozwala telefonowi wygasić ekranu, dopóki `active` jest true
 * (np. w trakcie kreatora testu — trzeba czekać na rozpuszczenie tabletki,
 * bez dotykania telefonu). Wake Lock jest automatycznie zwalniany przez
 * przeglądarkę, gdy karta traci widoczność — ponownie go pobieramy po powrocie.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let cancelled = false;

    async function acquire() {
      try {
        lockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // np. niska bateria, brak wsparcia w danym momencie — po prostu bez wake locka
      }
    }

    async function handleVisibility() {
      if (!cancelled && document.visibilityState === "visible" && !lockRef.current) {
        await acquire();
      }
    }

    acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}
