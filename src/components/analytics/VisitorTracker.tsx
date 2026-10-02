"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  endVisitorPage,
  heartbeatVisitorPage,
  isStaffBrowser,
  startVisitorSession,
  updateVisitorGeo,
  type CrmGeo,
} from "@/lib/crm-storage";

const VID_KEY = "clm_visitor_key";
const GEO_KEY = "clm_visitor_geo_v2";
const SESSION_START_KEY = "clm_visitor_session_started";

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
  if (!geo.country && !geo.city && !geo.ip) return false;
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

function sessionStartedAt() {
  try {
    const raw = sessionStorage.getItem(SESSION_START_KEY);
    if (raw) return Number(raw) || Date.now();
    const now = Date.now();
    sessionStorage.setItem(SESSION_START_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

/** Anonymous traffic ping — IP/geo from server headers. No email. */
async function pingServer(input: {
  visitorKey: string;
  path: string;
  durationMs?: number;
  pageDurationMs?: number;
  isNewSession?: boolean;
}) {
  try {
    await fetch("/api/visitors/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorKey: input.visitorKey,
        path: input.path,
        durationMs: input.durationMs,
        pageDurationMs: input.pageDurationMs,
        isNewSession: input.isNewSession,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        language:
          typeof navigator !== "undefined" ? navigator.language : undefined,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * Site-wide anonymous visitor tracking → CRM Visitors (IP + geo + duration).
 * Emails are captured separately via captureVisitorEmail → Leads/Contacts.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const geoDone = useRef(false);
  const pageEnteredAt = useRef<number>(Date.now());
  const sessionNew = useRef(true);

  const skip =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/designer") ||
    (typeof window !== "undefined" &&
      (() => {
        try {
          const host = window.location.hostname.toLowerCase();
          // Local npm run dev — ::1 / 127.0.0.1 must not hit live Visitors
          if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host === "::1" ||
            host.endsWith(".local")
          ) {
            return true;
          }
          if (isStaffBrowser()) return true;
          return (
            !!sessionStorage.getItem("clm_admin_session_v1") ||
            localStorage.getItem("clm_staff_browser_v1") === "1"
          );
        } catch {
          return false;
        }
      })());

  useEffect(() => {
    if (skip) return;
    const visitorKey = getVisitorKey();
    pageEnteredAt.current = Date.now();
    sessionStartedAt();

    if (lastPath.current && lastPath.current !== pathname) {
      endVisitorPage({ visitorKey, path: lastPath.current });
    }

    startVisitorSession({
      visitorKey,
      path: pathname,
      userAgent: navigator.userAgent,
      language: navigator.language,
    });
    lastPath.current = pathname;

    const isNew = sessionNew.current;
    sessionNew.current = false;

    void pingServer({
      visitorKey,
      path: pathname,
      durationMs: Math.max(0, Date.now() - sessionStartedAt()),
      pageDurationMs: 0,
      isNewSession: isNew,
    });

    const beat = window.setInterval(() => {
      heartbeatVisitorPage({ visitorKey, path: pathname });
      void pingServer({
        visitorKey,
        path: pathname,
        durationMs: Math.max(0, Date.now() - sessionStartedAt()),
        pageDurationMs: Math.max(0, Date.now() - pageEnteredAt.current),
        isNewSession: false,
      });
    }, 15000);

    const onHide = () => {
      endVisitorPage({ visitorKey, path: pathname });
      void pingServer({
        visitorKey,
        path: pathname,
        durationMs: Math.max(0, Date.now() - sessionStartedAt()),
        pageDurationMs: Math.max(0, Date.now() - pageEnteredAt.current),
        isNewSession: false,
      });
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
  }, [pathname, skip]);

  // Local geo cache (mirrors server enrichment for faster UI)
  useEffect(() => {
    if (skip || geoDone.current) return;
    const visitorKey = getVisitorKey();
    let cancelled = false;

    const runGeo = async () => {
      if (cancelled || geoDone.current) return;
      try {
        let geo: CrmGeo | null = null;
        try {
          const cached = sessionStorage.getItem(GEO_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as CrmGeo;
            if (isUsefulGeo(parsed)) geo = parsed;
          }
        } catch {
          /* ignore */
        }

        if (!isUsefulGeo(geo)) {
          geo = await fetchGeo();
        }

        if (cancelled || !geo) return;

        if (isUsefulGeo(geo)) {
          sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
          updateVisitorGeo(visitorKey, geo);
          geoDone.current = true;
        }
      } catch {
        /* ignore */
      }
    };

    const t = window.setTimeout(() => void runGeo(), 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [skip, pathname]);

  return null;
}

export function getClientVisitorKey() {
  if (typeof window === "undefined") return "";
  return getVisitorKey();
}
