"use client";

import { useEffect, useState } from "react";

const TOAST_EVENT = "clm_visitor_captured_toast";

export function notifyVisitorCaptured(email: string, name?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { email, name } }),
  );
  window.dispatchEvent(
    new CustomEvent("clm_crm_visitor", { detail: { email, name } }),
  );
}

/** Brief confirmation when Google / login email hits CRM */
export function VisitorCaptureToast() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<{ email: string }>).detail;
      if (!detail?.email) return;
      setEmail(detail.email);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!email) return;
    const t = window.setTimeout(() => setEmail(null), 4500);
    return () => window.clearTimeout(t);
  }, [email]);

  if (!email) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[300] w-[min(100vw-1.5rem,420px)] -translate-x-1/2"
      style={{
        animation: "googlePromptIn 0.35s cubic-bezier(0.2,0.8,0.2,1) both",
      }}
      role="status"
    >
      <div className="rounded-2xl border border-[#00a581]/40 bg-[#0f1115] px-4 py-3 shadow-2xl">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#00a581]">
          CRM · Visitor captured
        </p>
        <p className="mt-1 text-sm font-medium text-white">{email}</p>
        <p className="mt-0.5 text-[11px] text-white/45">
          Saved to Admin → Visitors (even without finishing account setup)
        </p>
      </div>
    </div>
  );
}
