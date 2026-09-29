"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
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

/** Authoritative server write — IP comes from request headers. */
async function pingServer(input: {
  visitorKey: string;
  path: string;
  email?: string;
  name?: string;
}) {
  try {
    await fetch("/api/visitors/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorKey: input.visitorKey,
        path: input.path,
        email: input.email,
        name: input.name,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        language: typeof navigator !== "undefined" ? navigator.language : undefined,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore — local CRM still updated */
  }
}

/**
 * Site-wide analytics → CRM Visitors (local + server IP ping).
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const lastPath = useRef<string | null>(null);
  const geoDone = useRef(false);

  const skip =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/designer") ||
    (typeof window !== "undefined" &&
      (() => {
        try {
          return (
            !!sessionStorage.getItem("clm_admin_session_v1") ||
            localStorage.getItem("clm_staff_browser_v1") === "1"
          );
        } catch {
          return false;
        }
      })());

  // Local session + immediate server ping (with IP)
  useEffect(() => {
    if (!ready || skip) return;
    const visitorKey = getVisitorKey();
    const email = user?.email;

    // Never treat admin/staff Google as a website visitor
    if (email?.toLowerCase().endsWith("@creativelogomakers.com")) return;

    if (email) {
      captureVisitorEmail({
        email,
        name: user.name,
        picture: user.picture,
        source: "portal",
        signedIn: true,
        silent: true,
      });
    }
    // Do NOT auto-import remembered Google accounts — that was injecting
    // the admin's own Gmail into Visitors whenever CRM was opened.

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

    // Server-side CRM write with real IP — don't wait for idle
    void pingServer({
      visitorKey,
      path: pathname,
      email,
      name: user?.name,
    });

    const beat = window.setInterval(() => {
      heartbeatVisitorPage({ visitorKey, email, path: pathname });
    }, 20000);

    // Re-ping every 60s while tab is open so "live" visitors stay fresh
    const livePing = window.setInterval(() => {
      void pingServer({
        visitorKey,
        path: pathname,
        email,
        name: user?.name,
      });
    }, 60000);

    const onHide = () => {
      endVisitorPage({ visitorKey, email, path: pathname });
      void pingServer({
        visitorKey,
        path: pathname,
        email,
        name: user?.name,
      });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(beat);
      window.clearInterval(livePing);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pathname, ready, skip, user?.email, user?.name, user?.picture]);

  // Local geo cache (optional enrichment)
  useEffect(() => {
    if (!ready || skip || geoDone.current) return;
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
          updateVisitorGeo(visitorKey, geo, user?.email);
          geoDone.current = true;
        }
      } catch {
        /* ignore */
      }
    };

    const t = window.setTimeout(() => void runGeo(), 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [ready, skip, user?.email, pathname]);

  return null;
}

export function getClientVisitorKey() {
  if (typeof window === "undefined") return "";
  return getVisitorKey();
}
