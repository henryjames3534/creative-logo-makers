"use client";

import Link from "next/link";

export function HelpFab() {
  return (
    <Link
      href="/contact"
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full bg-cta px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs">
        ?
      </span>
      Help
    </Link>
  );
}
