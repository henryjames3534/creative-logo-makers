"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/locale/LocaleProvider";
import type { LocaleCode } from "@/data/locales";

type TranslateApi = {
  translate?: {
    TranslateElement: new (
      opts: Record<string, unknown>,
      id: string,
    ) => void;
  };
};

function googleCode(lang: LocaleCode) {
  return lang === "zh" ? "zh-CN" : lang;
}

function injectTranslateStyles() {
  if (document.getElementById("clm-google-translate-hide")) return;
  const style = document.createElement("style");
  style.id = "clm-google-translate-hide";
  style.textContent = `
    .goog-te-banner-frame,
    .skiptranslate,
    #goog-gt-tt,
    .goog-te-balloon-frame,
    .goog-te-spinner-pos {
      display: none !important;
      visibility: hidden !important;
    }
    body { top: 0 !important; }
    #clm_google_translate_element {
      position: absolute !important;
      left: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    }
    .goog-text-highlight { background: none !important; box-shadow: none !important; }
    font font { background: transparent !important; }
  `;
  document.head.appendChild(style);
}

function trySelectLanguage(lang: LocaleCode) {
  const code = googleCode(lang);
  const select =
    document.querySelector<HTMLSelectElement>(".goog-te-combo") ||
    document.querySelector<HTMLSelectElement>(
      "#clm_google_translate_element select",
    );
  if (!select) return false;
  if (lang === "en") {
    select.value = "en";
  } else {
    // Options are usually like "ur" or "ur|en" depending on widget version
    const opt = Array.from(select.options).find(
      (o) =>
        o.value === code ||
        o.value.startsWith(`${code}|`) ||
        o.value.endsWith(`|${code}`) ||
        o.value === lang,
    );
    if (!opt) return false;
    select.value = opt.value;
  }
  select.dispatchEvent(new Event("change"));
  return true;
}

function loadGoogleTranslate(onReady?: () => void) {
  injectTranslateStyles();

  const w = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: TranslateApi;
  };

  const bootWidget = () => {
    try {
      if (!w.google?.translate?.TranslateElement) return;
      const host = document.getElementById("clm_google_translate_element");
      if (host && host.childElementCount === 0) {
        // eslint-disable-next-line no-new
        new w.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "en,es,fr,de,pt,it,ar,hi,ur,zh-CN,ja,ko,tr,nl,ru",
            autoDisplay: false,
            multilanguagePage: true,
          },
          "clm_google_translate_element",
        );
      }
      onReady?.();
    } catch {
      /* ignore */
    }
  };

  w.googleTranslateElementInit = bootWidget;

  if (document.getElementById("clm-google-translate-script")) {
    // Script already there — widget may still need init
    if (w.google?.translate?.TranslateElement) bootWidget();
    return;
  }

  const script = document.createElement("script");
  script.id = "clm-google-translate-script";
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

/**
 * Google Website Translator — loads for non-English and actively selects the language.
 */
export function PageTranslator() {
  const { language, ready } = useLocale();

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir =
      language === "ar" || language === "ur" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    if (!ready) return;

    if (language === "en") {
      // Clear any leftover translate chrome
      trySelectLanguage("en");
      return;
    }

    // Load immediately (not idle) so language switch feels responsive
    loadGoogleTranslate(() => {
      // Widget select appears shortly after init
      let attempts = 0;
      const tick = () => {
        attempts += 1;
        if (trySelectLanguage(language) || attempts > 25) return;
        window.setTimeout(tick, 200);
      };
      window.setTimeout(tick, 100);
    });
  }, [language, ready]);

  return <div id="clm_google_translate_element" aria-hidden />;
}
