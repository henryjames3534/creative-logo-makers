"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale/LocaleProvider";

const STORAGE_KEY = "clm-promo-dismissed";

const items = [
  {
    badge: "Almost there",
    text: "Finish your brief and get custom designs from creative experts",
    cta: "Continue brief",
    href: "/get-started",
  },
  {
    badge: "Popular",
    text: "Launch a logo contest — dozens of concepts from US$249",
    cta: "Start a contest",
    href: "/contests",
  },
  {
    badge: "Free",
    text: "Try the Logo Maker — create a mark in minutes, no card needed",
    cta: "Make a logo",
    href: "/logo-maker",
  },
  {
    badge: "Studio",
    text: "Full-service branding with dedicated Brand Strategists",
    cta: "Explore Studio",
    href: "/studio",
  },
];

function PromoItem({
  badge,
  text,
  cta,
  href,
}: (typeof items)[number]) {
  const { formatPrice } = useLocale();
  const displayText = formatPrice(text);

  return (
    <span className="inline-flex shrink-0 items-center gap-3 px-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] !text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {badge}
      </span>
      <span className="max-w-[70vw] truncate text-sm font-medium !text-white sm:max-w-none sm:whitespace-nowrap md:text-[15px]">
        {displayText}
      </span>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold !text-promo shadow-sm transition-transform hover:scale-[1.03] md:text-[13px]"
      >
        {cta}
        <span aria-hidden>→</span>
      </Link>
      <span className="mx-2 h-1 w-1 rounded-full bg-white/40" aria-hidden />
    </span>
  );
}

/** Continuous scrolling promo ticker */
export function PromoBar() {
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

  const loop = [...items, ...items];

  return (
    <div className="promo-bar relative z-[60] overflow-hidden bg-promo text-white">
      <div className="promo-bar-shine pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex items-center py-2.5 pr-11 md:py-3 md:pr-14">
        <div className="promo-marquee flex w-max items-center">
          {loop.map((item, i) => (
            <PromoItem key={`${item.badge}-${i}`} {...item} />
          ))}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss promo"
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-promo/80 !text-white/85 backdrop-blur-sm transition-colors hover:bg-white/15 hover:!text-white md:right-4"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
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
