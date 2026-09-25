"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { brand } from "@/data/site";
import { captureVisitorEmail } from "@/lib/capture-visitor";
import {
  listRememberedGoogleAccounts,
  rememberGoogleAccount,
} from "@/lib/auth-storage";

const DISMISS_KEY = "clm_google_onetap_dismissed";
const CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

/** Prevent Strict Mode / remount from firing two FedCM get() calls */
let oneTapLock = false;

type GoogleJwtPayload = {
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
};

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason?: () => string;
              getSkippedReason?: () => string;
              getDismissedReason?: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
          disableAutoSelect?: () => void;
          renderButton?: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

function parseJwt(token: string) {
  const part = token.split(".")[1];
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json) as GoogleJwtPayload;
}

/**
 * Google One Tap — single initialize + prompt (no HTML g_id_onload).
 * Avoids FedCM "Only one navigator.credentials.get request" console errors.
 */
export function GoogleContinuePrompt() {
  const { user, ready, signInWithGoogle } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [gisReady, setGisReady] = useState(false);
  const [setupHint, setSetupHint] = useState(false);
  const signingIn = useRef(false);

  const hideOnAuthPages =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/account");

  const handleCredential = useCallback(
    async (response: CredentialResponse) => {
      let email = "";
      let name = "";
      let picture: string | undefined;
      try {
        const payload = parseJwt(response.credential);
        if (!payload.email) return;
        email = payload.email.toLowerCase();
        name =
          payload.name ||
          payload.given_name ||
          payload.email.split("@")[0];
        picture = payload.picture;
        rememberGoogleAccount({ email, name, picture });
        captureVisitorEmail({
          email,
          name,
          picture,
          source: "google_onetap",
          signedIn: false,
        });
      } catch {
        return;
      }

      if (signingIn.current) return;
      signingIn.current = true;
      try {
        const res = await signInWithGoogle({ email, name, picture });
        if (res.ok) {
          captureVisitorEmail({
            email,
            name,
            picture,
            source: "google_onetap",
            signedIn: true,
            silent: true,
          });
          router.push("/account");
        }
      } finally {
        signingIn.current = false;
      }
    },
    [router, signInWithGoogle],
  );

  useEffect(() => {
    if (!ready || hideOnAuthPages) return;
    try {
      for (const a of listRememberedGoogleAccounts()) {
        captureVisitorEmail({
          email: a.email,
          name: a.name,
          picture: a.picture,
          source: "remembered",
          signedIn: false,
          silent: true,
        });
      }
    } catch {
      /* ignore */
    }
  }, [ready, hideOnAuthPages]);

  useEffect(() => {
    if (!CLIENT_ID || !gisReady || !ready) return;

    if (user || hideOnAuthPages) {
      try {
        window.google?.accounts.id.cancel();
      } catch {
        /* ignore */
      }
      oneTapLock = false;
      return;
    }

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    if (oneTapLock) return;
    oneTapLock = true;

    let cancelled = false;
    let fallbackTimer = 0;

    const showPrompt = (useFedcm: boolean) => {
      if (cancelled) return;
      const gsi = window.google?.accounts.id;
      if (!gsi) return;

      try {
        gsi.cancel();
      } catch {
        /* ignore */
      }

      gsi.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: useFedcm,
      });

      gsi.prompt((notification) => {
        if (cancelled) return;

        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason?.() ?? "unknown";
          // Quiet: avoid console noise that Lighthouse flags as browser errors
          const fedcmBlocked =
            useFedcm &&
            /fedcm|secure|browser|suppressed|opt_out|unknown|issuenotdisplayed/i.test(
              reason,
            );

          if (fedcmBlocked) {
            // Wait until any outstanding FedCM get() settles, then retry classic once
            fallbackTimer = window.setTimeout(() => {
              if (cancelled) return;
              try {
                window.google?.accounts.id.cancel();
              } catch {
                /* ignore */
              }
              window.setTimeout(() => showPrompt(false), 350);
            }, 600);
            return;
          }

          if (
            reason === "suppressed_by_user" ||
            reason === "opt_out_or_no_session" ||
            reason === "unknown"
          ) {
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
          }
        }

        if (notification.isDismissedMoment()) {
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
        }
      });
    };

    // Delay so Strict Mode remount + paint settle; only one FedCM get at a time
    const startTimer = window.setTimeout(() => showPrompt(true), 500);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(fallbackTimer);
      try {
        window.google?.accounts.id.cancel();
      } catch {
        /* ignore */
      }
      oneTapLock = false;
    };
  }, [gisReady, ready, user, hideOnAuthPages, handleCredential]);

  useEffect(() => {
    if (CLIENT_ID || !ready || user || hideOnAuthPages) {
      setSetupHint(false);
      return;
    }
    try {
      if (sessionStorage.getItem("clm_gsi_setup_hint") === "1") return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setSetupHint(true), 600);
    return () => window.clearTimeout(t);
  }, [ready, user, hideOnAuthPages]);

  if (!CLIENT_ID) {
    if (!ready || user || hideOnAuthPages || !setupHint) return null;
    return (
      <div
        className="fixed right-3 top-[5.25rem] z-[100] w-[min(100vw-1.5rem,360px)] md:right-6 md:top-24"
        style={{
          animation: "googlePromptIn 0.38s cubic-bezier(0.2,0.8,0.2,1) both",
        }}
        role="status"
      >
        <div className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white p-4 shadow-[0_12px_40px_rgba(60,64,67,0.28)]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-[#202124]">
              Google One Tap setup
            </p>
            <button
              type="button"
              className="text-[#5f6368] hover:text-[#202124]"
              aria-label="Close"
              onClick={() => {
                setSetupHint(false);
                try {
                  sessionStorage.setItem("clm_gsi_setup_hint", "1");
                } catch {
                  /* ignore */
                }
              }}
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-[#5f6368]">
            Chrome account popup ke liye Google Cloud pe{" "}
            <strong>OAuth Web Client ID</strong> banao, Authorized origins mein{" "}
            <code className="rounded bg-[#f1f3f4] px-1">http://localhost:3000</code>{" "}
            aur{" "}
            <code className="rounded bg-[#f1f3f4] px-1">
              https://www.creativelogomakers.com
            </code>{" "}
            add karo, phir{" "}
            <code className="rounded bg-[#f1f3f4] px-1">.env.local</code> mein:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#f8f9fa] p-2 text-[11px] text-[#202124]">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
          </pre>
          <p className="mt-2 text-[11px] text-[#5f6368]">
            Save → restart. Site khulte hi “Continue as …” aayega ({brand.name}).
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href="/contact"
              className="rounded-full bg-[#1a73e8] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1557b0]"
            >
              Contact support
            </a>
            <Link
              href="/login"
              className="rounded-full border border-[#dadce0] px-3 py-1.5 text-[12px] font-medium text-[#3c4043]"
            >
              Email login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="lazyOnload"
      onLoad={() => setGisReady(true)}
    />
  );
}
