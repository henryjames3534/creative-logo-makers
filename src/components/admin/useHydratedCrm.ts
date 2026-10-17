"use client";

import { useEffect, useState } from "react";
import {
  CRM_CHANGED_EVENT,
  CRM_HYDRATED_EVENT,
  loadCrm,
  type CrmState,
} from "@/lib/crm-storage";

/**
 * Load CRM from localStorage immediately, then hydrate from server in background.
 * Keeps admin screens responsive even when /api/store/crm is large/slow.
 */
export function useHydratedCrm(pollMs = 45000) {
  const [state, setState] = useState<CrmState | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return loadCrm();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function refresh(pushFirst = false) {
      try {
        if (pushFirst) {
          const { flushStorePush } = await import("@/lib/db-sync");
          await flushStorePush("crm");
        }
        const { hydrateCrmFromServer } = await import("@/lib/crm-storage");
        await hydrateCrmFromServer();
      } catch {
        /* keep local snapshot */
      }
      if (!cancelled) setState(loadCrm());
    }

    // Local already painted; sync server without blocking first paint.
    void refresh(true);
    const poll = window.setInterval(() => {
      void refresh(false);
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
