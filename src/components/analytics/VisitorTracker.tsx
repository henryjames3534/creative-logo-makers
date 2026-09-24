"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listRememberedGoogleAccounts } from "@/lib/auth-storage";
import { captureVisitorEmail } from "@/lib/capture-visitor";
import {
  endVisitorPage,
  heartbeatVisitorPage,
  startVisitorSession,
  updateVisitorGeo,
  type CrmGeo,
} from "@/lib/crm-storage";

const VID_KEY = "clm_visitor_key";
const GEO_KEY = "clm_visitor_geo_v2";

function getVisitorKey() {
  try {
    let k = localStorage.getItem(VID_KEY);
    if (!k) {
      k = `vk_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      localStorage.setItem(VID_KEY, k);
    }
    return k;
  } catch {
    return `vk_tmp_${Date.now()}`;
  }
}

function isUsefulGeo(geo: CrmGeo | null | undefined) {
  if (!geo) return false;
  if (!geo.country && !geo.city) return false;
  const ip = (geo.ip || "").toLowerCase();
  if (ip === "::1" || ip === "127.0.0.1") return false;
  return true;
}

async function fetchGeo(): Promise<CrmGeo | null> {
  try {
    const res = await fetch("/api/visitor-geo", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CrmGeo;
  } catch {
    return null;
  }
}

/**
 * Site-wide analytics → CRM Visitors:
 * IP/geo, page path, time on page, visit count, email when known.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const lastPath = useRef<string | null>(null);
  const geoDone = useRef(false);

  const skip = pathname.startsWith("/admin");

  useEffect(() => {
    if (!ready || skip) return;
    const visitorKey = getVisitorKey();
    const email = user?.email;

    if (email) {
      captureVisitorEmail({
        email,
        name: user.name,
        picture: user.picture,
        source: "portal",
        signedIn: true,
        silent: true,
      });
    } else {
      // Pull any remembered Google emails into this visitor key / CRM
      try {
        for (const a of listRememberedGoogleAccounts()) {
          captureVisitorEmail({
            email: a.email,
            name: a.name,
            picture: a.picture,
            source: "remembered",
            signedIn: false,
            silent: true,
          });
        }
      } catch {
        /* ignore */
      }
    }

    if (lastPath.current && lastPath.current !== pathname) {
      endVisitorPage({ visitorKey, email, path: lastPath.current });
    }

    startVisitorSession({
      visitorKey,
      email,
      path: pathname,
      userAgent: navigator.userAgent,
      language: navigator.language,
    });
    lastPath.current = pathname;

    const beat = window.setInterval(() => {
      heartbeatVisitorPage({ visitorKey, email, path: pathname });
    }, 20000);

    const onHide = () => {
      endVisitorPage({ visitorKey, email, path: pathname });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(beat);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pathname, ready, skip, user?.email, user?.name, user?.picture]);

  // Geo + public IP — deferred until idle so it doesn't compete with first paint
  useEffect(() => {
    if (!ready || skip || geoDone.current) return;
    const visitorKey = getVisitorKey();
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const runGeo = async () => {
      if (cancelled || geoDone.current) return;
      try {
        let geo: CrmGeo | null = null;
        try {
          const cached = sessionStorage.getItem(GEO_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as CrmGeo;
            if (isUsefulGeo(parsed)) geo = parsed;
            else sessionStorage.removeItem(GEO_KEY);
          }
          sessionStorage.removeItem("clm_visitor_geo_v1");
          try {
            sessionStorage.removeItem(["99", "d_visitor_geo_v1"].join(""));
          } catch {
            /* ignore */
          }
        } catch {
          /* ignore */
        }

        if (!isUsefulGeo(geo)) {
          geo = await fetchGeo();
          if (!isUsefulGeo(geo)) {
            await new Promise((r) => setTimeout(r, 800));
            if (cancelled) return;
            geo = await fetchGeo();
          }
        }

        if (cancelled) return;

        if (isUsefulGeo(geo) && geo) {
          sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
          updateVisitorGeo(visitorKey, geo, user?.email);
          geoDone.current = true;
        } else if (geo) {
          updateVisitorGeo(visitorKey, geo, user?.email);
        }
      } catch {
        /* ignore */
      }
    };

    const schedule = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(() => void runGeo(), { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(() => void runGeo(), 3000);
      }
    };

    timeoutId = window.setTimeout(schedule, 3000);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [ready, skip, user?.email, pathname]);

  return null;
}

export function getClientVisitorKey() {
  if (typeof window === "undefined") return "";
  return getVisitorKey();
}
