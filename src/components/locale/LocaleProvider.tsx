"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  currencyFromCountry,
  getCurrency,
  getLanguage,
  type CurrencyCode,
  type LocaleCode,
} from "@/data/locales";
import {
  formatPriceLabel,
  readLocalePrefs,
  setGoogleTranslateCookie,
  writeLocalePrefs,
  type LocalePrefs,
} from "@/lib/locale";

type LocaleContextValue = {
  language: LocaleCode;
  currency: CurrencyCode;
  locked: boolean;
  countryCode?: string;
  ready: boolean;
  languageLabel: string;
  currencyLabel: string;
  setLanguage: (code: LocaleCode) => void;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (raw: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

async function fetchCountryCode(): Promise<string | undefined> {
  try {
    const cached = sessionStorage.getItem("clm_visitor_geo_v2");
    if (cached) {
      const geo = JSON.parse(cached) as { countryCode?: string };
      if (geo.countryCode) return geo.countryCode.toUpperCase();
    }
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch("/api/visitor-geo", { cache: "no-store" });
    if (!res.ok) return undefined;
    const geo = (await res.json()) as { countryCode?: string };
    return geo.countryCode?.toUpperCase();
  } catch {
    return undefined;
  }
}

function softReload() {
  const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(url);
}

/**
 * Rules (product):
 * - Site always opens in English by default
 * - Language changes only when the visitor picks it in the switcher
 * - Currency auto-follows visitor location (unless they pick currency manually)
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<LocalePrefs>({
    language: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    currencyLocked: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const stored = readLocalePrefs();
      if (cancelled) return;

      // Language: English by default — only restore if user explicitly chose one
      const language = stored.languageLocked
        ? stored.language || DEFAULT_LOCALE
        : DEFAULT_LOCALE;
      const currencyLocked = Boolean(stored.currencyLocked);

      setPrefs({
        language,
        currency: stored.currency || DEFAULT_CURRENCY,
        languageLocked: Boolean(stored.languageLocked),
        currencyLocked,
        countryCode: stored.countryCode,
      });
      setGoogleTranslateCookie(language);
      setReady(true);

      // Persist cleaned prefs (drops accidental geo-language from older builds)
      writeLocalePrefs({
        language,
        currency: stored.currency || DEFAULT_CURRENCY,
        languageLocked: Boolean(stored.languageLocked),
        currencyLocked,
        countryCode: stored.countryCode,
        detectedAt: stored.detectedAt,
      });

      // Clear leftover Google Translate if we're back on English by default
      if (
        language === "en" &&
        !stored.languageLocked &&
        typeof document !== "undefined" &&
        document.cookie.includes("googtrans=/en/") &&
        !sessionStorage.getItem("clm_locale_en_reset")
      ) {
        sessionStorage.setItem("clm_locale_en_reset", "1");
        softReload();
        return;
      }

      // Currency only from location (skip if user already picked a currency)
      if (currencyLocked) return;

      const countryCode = await fetchCountryCode();
      if (cancelled || !countryCode) return;

      const latest = readLocalePrefs();
      if (latest.currencyLocked) return;

      const geoCurrency = currencyFromCountry(countryCode);
      const next: LocalePrefs = {
        language: latest.languageLocked
          ? latest.language || DEFAULT_LOCALE
          : DEFAULT_LOCALE,
        currency: geoCurrency,
        languageLocked: Boolean(latest.languageLocked),
        currencyLocked: false,
        countryCode,
        detectedAt: new Date().toISOString(),
      };
      setPrefs(next);
      writeLocalePrefs(next);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((code: LocaleCode) => {
    const prev = readLocalePrefs();
    const next: LocalePrefs = {
      ...prev,
      language: code,
      languageLocked: true,
      currencyLocked: Boolean(prev.currencyLocked),
    };
    writeLocalePrefs(next);
    setGoogleTranslateCookie(code);
    setPrefs(next);
    window.setTimeout(softReload, 40);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setPrefs((prev) => {
      const next: LocalePrefs = {
        ...prev,
        currency: code,
        currencyLocked: true,
        languageLocked: Boolean(prev.languageLocked),
      };
      writeLocalePrefs(next);
      return next;
    });
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const language = prefs.language || DEFAULT_LOCALE;
    const currency = prefs.currency || DEFAULT_CURRENCY;
    return {
      language,
      currency,
      locked: Boolean(prefs.currencyLocked || prefs.languageLocked),
      countryCode: prefs.countryCode,
      ready,
      languageLabel: getLanguage(language).nativeLabel,
      currencyLabel: getCurrency(currency).code,
      setLanguage,
      setCurrency,
      formatPrice: (raw: string) => formatPriceLabel(raw, currency),
    };
  }, [prefs, ready, setLanguage, setCurrency]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      language: DEFAULT_LOCALE,
      currency: DEFAULT_CURRENCY,
      locked: false,
      ready: false,
      languageLabel: "English",
      currencyLabel: "USD",
      setLanguage: () => undefined,
      setCurrency: () => undefined,
      formatPrice: (raw: string) => raw,
    } satisfies LocaleContextValue;
  }
  return ctx;
}
