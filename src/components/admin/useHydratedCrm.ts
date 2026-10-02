"use client";

import { useEffect, useState } from "react";
import {
  CRM_CHANGED_EVENT,
  CRM_HYDRATED_EVENT,
  loadCrm,
  type CrmState,
} from "@/lib/crm-storage";

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
        const { flushStorePush } = await import("@/lib/db-sync");
        // Land any pending stage moves before pulling remote.
        await flushStorePush("crm");
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

    const onLocal = () => {
      if (!cancelled) setState(loadCrm());
    };
    window.addEventListener(CRM_CHANGED_EVENT, onLocal);
    window.addEventListener(CRM_HYDRATED_EVENT, onLocal);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener(CRM_CHANGED_EVENT, onLocal);
      window.removeEventListener(CRM_HYDRATED_EVENT, onLocal);
    };
  }, [pollMs]);

  return [state, setState] as const;
}
