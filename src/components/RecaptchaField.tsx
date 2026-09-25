"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-config";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
        },
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

export type RecaptchaHandle = {
  getToken: () => string | null;
  reset: () => void;
};

type Props = {
  onChange?: (token: string | null) => void;
  className?: string;
};

export const RecaptchaField = forwardRef<RecaptchaHandle, Props>(
  function RecaptchaField({ onChange, className }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);
    const onChangeRef = useRef(onChange);
    const [scriptReady, setScriptReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const uid = useId().replace(/:/g, "");

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const renderWidget = useCallback(() => {
      if (!RECAPTCHA_SITE_KEY || !hostRef.current || !window.grecaptcha) return;
      if (widgetId.current !== null) return;

      window.grecaptcha.ready(() => {
        if (!hostRef.current || widgetId.current !== null) return;
        try {
          hostRef.current.innerHTML = "";
          widgetId.current = window.grecaptcha!.render(hostRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (token) => {
              setError(null);
              onChangeRef.current?.(token);
            },
            "expired-callback": () => onChangeRef.current?.(null),
            "error-callback": () => {
              setError("reCAPTCHA failed to load. Refresh and try again.");
              onChangeRef.current?.(null);
            },
            theme: "light",
            size: "normal",
          });
        } catch {
          setError("reCAPTCHA could not render.");
        }
      });
    }, []);

    useEffect(() => {
      if (scriptReady) renderWidget();
    }, [scriptReady, renderWidget]);

    useImperativeHandle(ref, () => ({
      getToken: () => {
        if (widgetId.current === null || !window.grecaptcha) return null;
        const t = window.grecaptcha.getResponse(widgetId.current);
        return t || null;
      },
      reset: () => {
        if (widgetId.current === null || !window.grecaptcha) return;
        window.grecaptcha.reset(widgetId.current);
        onChangeRef.current?.(null);
      },
    }));

    if (!RECAPTCHA_SITE_KEY) {
      return (
        <p className="text-sm text-coral">
          reCAPTCHA site key missing. Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
        </p>
      );
    }

    return (
      <div className={className}>
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
        <div
          ref={hostRef}
          id={`recaptcha-${uid}`}
          className="min-h-[78px] overflow-x-auto"
        />
        {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
      </div>
    );
  },
);

/** Verify token with our API route. */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!token) {
    return { ok: false, error: "Please complete the reCAPTCHA." };
  }
  try {
    const res = await fetch("/api/recaptcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || "reCAPTCHA verification failed.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not verify reCAPTCHA. Try again." };
  }
}
