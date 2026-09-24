"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LiveChatWidget = dynamic(
  () =>
    import("@/components/chat/LiveChatWidget").then((m) => ({
      default: m.LiveChatWidget,
    })),
  { ssr: false },
);

const GoogleContinuePrompt = dynamic(
  () =>
    import("@/components/auth/GoogleContinuePrompt").then((m) => ({
      default: m.GoogleContinuePrompt,
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
  const t = globalThis.setTimeout(cb, Math.min(timeoutMs, 2200));
  return () => globalThis.clearTimeout(t);
}

/** Non-critical widgets — idle-deferred so they don't block first paint / TTI. */
export function DeferredClientWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => onIdle(() => setReady(true), 3500), []);

  if (!ready) return null;

  return (
    <>
      <LiveChatWidget />
      <GoogleContinuePrompt />
    </>
  );
}
