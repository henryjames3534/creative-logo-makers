/** Supported languages + currencies for visitor localization */

export type LocaleCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "ar"
  | "hi"
  | "ur"
  | "zh"
  | "ja"
  | "ko"
  | "tr"
  | "nl"
  | "ru";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "AED"
  | "SAR"
  | "INR"
  | "PKR"
  | "JPY"
  | "CNY"
  | "BRL"
  | "MXN"
  | "TRY"
  | "CHF"
  | "SGD"
  | "NZD";

export type LanguageOption = {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  dir?: "ltr" | "rtl";
};

export type CurrencyOption = {
  code: CurrencyCode;
  label: string;
  symbol: string;
};

export const DEFAULT_LOCALE: LocaleCode = "en";
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const languages: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
];

export const currencies: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
];

/** Approx FX vs USD for display (not live market rates) */
export const usdRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  AED: 3.67,
  SAR: 3.75,
  INR: 83.5,
  PKR: 278,
  JPY: 149,
  CNY: 7.2,
  BRL: 5.1,
  MXN: 17.2,
  TRY: 32.5,
  CHF: 0.88,
  SGD: 1.34,
  NZD: 1.66,
};

/** ISO country code → default language */
export const countryToLocale: Record<string, LocaleCode> = {
  US: "en",
  GB: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  CA: "en",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  FR: "fr",
  BE: "fr",
  CH: "de",
  DE: "de",
  AT: "de",
  PT: "pt",
  BR: "pt",
  IT: "it",
  AE: "ar",
  SA: "ar",
  EG: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  MA: "ar",
  PK: "ur",
  IN: "hi",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  SG: "en",
  JP: "ja",
  KR: "ko",
  TR: "tr",
  NL: "nl",
  RU: "ru",
  UA: "ru",
};

/** ISO country code → default currency */
export const countryToCurrency: Record<string, CurrencyCode> = {
  US: "USD",
  PR: "USD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  IE: "EUR",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  CH: "CHF",
  AE: "AED",
  SA: "SAR",
  QA: "AED",
  KW: "AED",
  BH: "AED",
  OM: "AED",
  IN: "INR",
  PK: "PKR",
  JP: "JPY",
  CN: "CNY",
  HK: "CNY",
  TW: "CNY",
  SG: "SGD",
  BR: "BRL",
  MX: "MXN",
  AR: "USD",
  TR: "TRY",
  RU: "USD",
  EG: "USD",
  ZA: "USD",
};

export function getLanguage(code: string): LanguageOption {
  return languages.find((l) => l.code === code) ?? languages[0];
}

export function getCurrency(code: string): CurrencyOption {
  return currencies.find((c) => c.code === code) ?? currencies[0];
}

export function localeFromCountry(countryCode?: string | null): LocaleCode {
  if (!countryCode) return DEFAULT_LOCALE;
  return countryToLocale[countryCode.toUpperCase()] ?? DEFAULT_LOCALE;
}

export function currencyFromCountry(countryCode?: string | null): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  return countryToCurrency[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}
