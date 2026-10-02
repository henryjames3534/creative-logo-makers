"use client";

import { useEffect, useState } from "react";
import { loadCrm, type CrmState } from "@/lib/crm-storage";

/**
 * Load CRM from localStorage after hydrating from the server store.
 * Keeps admin screens on the same source of truth across browsers.
 */
export function useHydratedCrm(pollMs = 20000) {
  const [state, setState] = useState<CrmState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const { hydrateCrmFromServer } = await import("@/lib/crm-storage");
        await hydrateCrmFromServer();
      } catch {
        /* keep local snapshot */
      }
      if (!cancelled) setState(loadCrm());
    }

    void refresh();
    const poll = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [pollMs]);

  return [state, setState] as const;
}
