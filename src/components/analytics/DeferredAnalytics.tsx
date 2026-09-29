"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const VisitorTracker = dynamic(
  () =>
    import("@/components/analytics/VisitorTracker").then((m) => ({
      default: m.VisitorTracker,
    })),
  { ssr: false },
);

const VisitorCaptureToast = dynamic(
  () =>
    import("@/components/analytics/VisitorCaptureToast").then((m) => ({
      default: m.VisitorCaptureToast,
    })),
  { ssr: false },
);

function onIdle(cb: () => void, timeoutMs: number) {
  if (typeof window === "undefined") return () => undefined;
  const w = window as Window & {
    requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout: timeoutMs });
    return () => w.cancelIdleCallback?.(id);
  }
  const t = globalThis.setTimeout(cb, Math.min(timeoutMs, 2000));
  return () => globalThis.clearTimeout(t);
}

/** Analytics widgets — start quickly so visitors/IP hit the server. */
export function DeferredAnalytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/designer")) {
      return;
    }
    // Fire sooner than before (was 2.5s idle) so bounce traffic still pings
    return onIdle(() => setReady(true), 600);
  }, [pathname]);

  if (
    !ready ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/designer")
  ) {
    return null;
  }

  return (
    <>
      <VisitorTracker />
      <VisitorCaptureToast />
    </>
  );
}
