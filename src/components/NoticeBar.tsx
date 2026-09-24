"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "clm-notice-dismissed";

/** Separate site notice strip (above promo) */
export function NoticeBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="notice-bar relative z-[61] overflow-hidden border-b border-white/10 bg-ink text-white">
      <div className="notice-bar-glow pointer-events-none absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-violet/40 blur-2xl" />
      <div className="notice-bar-glow notice-bar-glow-delay pointer-events-none absolute -right-8 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-blue/35 blur-2xl" />

      <div className="container-clm relative flex flex-nowrap items-center justify-center gap-2 overflow-hidden py-2 pr-10 text-center md:gap-3 md:pr-12">
        <span className="hidden shrink-0 items-center rounded bg-violet px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] !text-white sm:inline-flex">
          Notice
        </span>
        <p className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium !text-white/90 md:text-[13px]">
          New: Studio brand packages now include launch assets + strategy —{" "}
          <Link
            href="/studio"
            className="font-semibold !text-white underline decoration-white/35 underline-offset-2 transition-colors hover:decoration-white"
          >
            explore Studio
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full !text-white/70 transition-colors hover:bg-white/10 hover:!text-white md:right-4"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
