"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { currencies, languages } from "@/data/locales";
import { useLocale } from "@/components/locale/LocaleProvider";

export function LocaleSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  /** @deprecated Modal is always centered — kept for call-site compatibility */
  placement?: "up" | "down" | "auto";
  className?: string;
}) {
  const {
    language,
    currency,
    languageLabel,
    currencyLabel,
    setLanguage,
    setCurrency,
    ready,
  } = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerLabel = `${currencyLabel} · ${languageLabel}`;

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
            role="presentation"
          >
            {/* Backdrop blur + dim */}
            <button
              type="button"
              aria-label="Close language and currency"
              className="absolute inset-0 bg-ink/45 backdrop-blur-md transition-opacity"
              onClick={() => setOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 flex max-h-[min(88vh,40rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_24px_80px_rgba(20,20,20,0.35)] animate-[localeModalIn_180ms_ease-out]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p
                    id={titleId}
                    className="text-lg font-bold tracking-tight text-ink"
                  >
                    Language & currency
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    English by default. Currency follows your location — change
                    either anytime.
                  </p>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:bg-paper-soft"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-line overflow-hidden md:grid-cols-2 md:divide-x md:divide-y-0">
                <section className="flex min-h-0 flex-col overflow-hidden">
                  <p className="shrink-0 px-5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Language
                  </p>
                  <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
                    <div className="grid gap-1">
                      {languages.map((l) => {
                        const active = language === l.code;
                        return (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              if (l.code !== language) setLanguage(l.code);
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              active
                                ? "bg-ink font-semibold !text-white"
                                : "text-ink hover:bg-paper-soft"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate" dir="auto">
                                {l.nativeLabel}
                              </span>
                              <span
                                className={`block text-xs ${
                                  active ? "text-white/70" : "text-muted"
                                }`}
                              >
                                {l.label}
                              </span>
                            </span>
                            {active ? <CheckIcon /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="flex min-h-0 flex-col overflow-hidden">
                  <p className="shrink-0 px-5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Currency
                  </p>
                  <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
                    <div className="grid gap-1">
                      {currencies.map((c) => {
                        const active = currency === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCurrency(c.code);
                              setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              active
                                ? "bg-ink font-semibold !text-white"
                                : "text-ink hover:bg-paper-soft"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate">
                                {c.code}{" "}
                                <span
                                  className={
                                    active ? "text-white/80" : "text-muted"
                                  }
                                >
                                  {c.symbol}
                                </span>
                              </span>
                              <span
                                className={`block text-xs ${
                                  active ? "text-white/70" : "text-muted"
                                }`}
                              >
                                {c.label}
                              </span>
                            </span>
                            {active ? <CheckIcon /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper-soft/70 px-5 py-3 sm:px-6">
                <p className="text-xs text-muted">
                  Current:{" "}
                  <span className="font-semibold text-ink">
                    {currencyLabel} · {languageLabel}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-ink px-4 py-2 text-xs font-semibold !text-white hover:bg-cta"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Language and currency: ${triggerLabel}`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-2.5 py-1.5 text-sm font-medium text-ink shadow-sm transition hover:border-ink/25 hover:bg-white sm:px-3 ${
          !ready ? "opacity-70" : ""
        } ${compact ? "" : ""}`}
      >
        <GlobeIcon />
        <span className="max-w-[9.5rem] truncate whitespace-nowrap sm:max-w-none">
          {triggerLabel}
        </span>
        <Chevron open={open} />
      </button>
      {modal}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 12h18M12 3c2.5 2.8 3.75 5.8 3.75 9S14.5 18.2 12 21c-2.5-2.8-3.75-5.8-3.75-9S9.5 5.8 12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 3l8 8M11 3L3 11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
