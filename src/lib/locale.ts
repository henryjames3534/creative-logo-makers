import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  getCurrency,
  type CurrencyCode,
  type LocaleCode,
  usdRates,
} from "@/data/locales";

export const LOCALE_STORAGE_KEY = "clm_locale_prefs_v1";

export type LocalePrefs = {
  language: LocaleCode;
  currency: CurrencyCode;
  /**
   * @deprecated Prefer currencyLocked / languageLocked.
   */
  locked?: boolean;
  /** User manually picked language — persist across visits */
  languageLocked?: boolean;
  /** User manually picked currency — don't overwrite with geo */
  currencyLocked?: boolean;
  countryCode?: string;
  detectedAt?: string;
};

export function defaultPrefs(): LocalePrefs {
  return {
    language: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    languageLocked: false,
    currencyLocked: false,
  };
}

export function readLocalePrefs(): LocalePrefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw) as Partial<LocalePrefs> & {
      /** Old builds used a single `locked` for language+currency */
      locked?: boolean;
    };
    const storedLang = (parsed.language as LocaleCode) || DEFAULT_LOCALE;
    // Only keep a non-default language if the user explicitly chose it
    const languageLocked = Boolean(
      parsed.languageLocked ||
        (parsed.locked && storedLang !== DEFAULT_LOCALE),
    );
    const language = languageLocked ? storedLang : DEFAULT_LOCALE;
    // Currency lock ONLY from explicit currencyLocked — never from legacy `locked`,
    // otherwise a past PK visit freezes PKR even after the visitor is in the US.
    const currencyLocked = Boolean(parsed.currencyLocked);
    return {
      language,
      currency: (parsed.currency as CurrencyCode) || DEFAULT_CURRENCY,
      locked: Boolean(parsed.locked),
      languageLocked,
      currencyLocked,
      countryCode: parsed.countryCode,
      detectedAt: parsed.detectedAt,
    };
  } catch {
    return defaultPrefs();
  }
}

export function writeLocalePrefs(prefs: LocalePrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

/** Convert a USD amount into display currency */
export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  const rate = usdRates[currency] ?? 1;
  const converted = amountUsd * rate;
  if (currency === "JPY" || currency === "PKR" || currency === "INR") {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    const c = getCurrency(currency);
    return `${c.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Localize price labels like "$249", "From $1,399", "Starting from $175",
 * "from US$249". Converts every $ / US$ amount in the string.
 */
export function formatPriceLabel(
  raw: string,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  if (!raw) return raw;
  if (currency === "USD") return raw;
  const trimmed = raw.trim();
  if (/^(custom|contact|available|quote|free)$/i.test(trimmed)) return raw;

  return raw.replace(
    /US\$\s*([\d,]+(?:\.\d+)?)|\$\s*([\d,]+(?:\.\d+)?)/gi,
    (full, a?: string, b?: string) => {
      const num = Number((a || b || "").replace(/,/g, ""));
      if (!Number.isFinite(num) || num <= 0) return full;
      return formatAmount(convertFromUsd(num, currency), currency);
    },
  );
}

/** Map our locale codes → Google Translate target codes */
function googleLangCode(lang: LocaleCode): string {
  if (lang === "zh") return "zh-CN";
  return lang;
}

/** Google Translate cookie: /en/es — path-only for localhost reliability */
export function setGoogleTranslateCookie(lang: LocaleCode) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

  const clear = (extra = "") => {
    document.cookie = `googtrans=;path=/;Max-Age=0${extra}`;
  };

  // Always clear first
  clear();
  if (!isLocal) {
    clear(`;domain=${host}`);
    clear(`;domain=.${host}`);
  }

  if (lang === "en") return;

  const value = `/en/${googleLangCode(lang)}`;
  const expire = "expires=Thu, 01 Jan 2099 00:00:00 GMT";
  // Path-only cookie works on localhost and most hosts
  document.cookie = `googtrans=${value};path=/;${expire}`;
  if (!isLocal) {
    document.cookie = `googtrans=${value};domain=${host};path=/;${expire}`;
    document.cookie = `googtrans=${value};domain=.${host};path=/;${expire}`;
  }
}
