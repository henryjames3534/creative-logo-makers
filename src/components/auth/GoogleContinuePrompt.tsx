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
 * Official Google One Tap — same UX as Creative Logo Makers:
 * page load → Chrome’s signed-in Google account bubble (“Continue as …”).
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID (Web OAuth client).
 */
export function GoogleContinuePrompt() {
  const { user, ready, signInWithGoogle } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [gisReady, setGisReady] = useState(false);
  const [setupHint, setSetupHint] = useState(false);
  const prompted = useRef(false);
  const signingIn = useRef(false);

  const hideOnAuthPages =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/account");

  const handleCredential = useCallback(
    async (response: CredentialResponse) => {
      // Parse + CRM first — never block capture on sign-in
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

  // Sync any remembered Google emails into CRM on load
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

  // Native One Tap prompt
  useEffect(() => {
    if (!CLIENT_ID || !gisReady || !ready) return;
    if (user || hideOnAuthPages) {
      window.google?.accounts.id.cancel();
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    if (prompted.current) return;
    prompted.current = true;

    const run = (useFedcm: boolean) => {
      window.google?.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: useFedcm,
        // Shown in the official bubble: “Sign in to {origin} with google.com”
      });

      window.google?.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason?.() ?? "unknown";
          console.info("[Google One Tap] not displayed:", reason);
          // FedCM blocked → retry classic One Tap once
          if (useFedcm && /fedcm|secure|browser/i.test(reason)) {
            prompted.current = false;
            window.setTimeout(() => {
              if (!prompted.current) {
                prompted.current = true;
                run(false);
              }
            }, 400);
            return;
          }
          if (
            reason === "suppressed_by_user" ||
            reason === "opt_out_or_no_session"
          ) {
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
          }
        }
        if (notification.isSkippedMoment()) {
          console.info(
            "[Google One Tap] skipped:",
            notification.getSkippedReason?.(),
          );
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

    // Small delay so layout/paint settles (matches 99d feel on first paint)
    const t = window.setTimeout(() => run(true), 280);
    return () => window.clearTimeout(t);
  }, [gisReady, ready, user, hideOnAuthPages, handleCredential]);

  // Reset prompt flag when user logs out so it can show again next visit
  useEffect(() => {
    if (!user) prompted.current = false;
  }, [user]);

  // No Client ID → gentle one-time setup card (dev only feel)
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

  if (!ready || user || hideOnAuthPages) {
    return CLIENT_ID ? (
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisReady(true)}
      />
    ) : null;
  }

  return (
    <>
      {CLIENT_ID ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGisReady(true)}
        />
      ) : null}

      {/* Hidden hook for Google — keeps GIS warm */}
      {CLIENT_ID ? (
        <div
          id="g_id_onload"
          data-client_id={CLIENT_ID}
          data-auto_select="true"
          data-itp_support="true"
          data-use_fedcm_for_prompt="true"
          data-context="signin"
          className="hidden"
          aria-hidden
        />
      ) : null}

      {!CLIENT_ID && setupHint ? (
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
              <code className="rounded bg-[#f1f3f4] px-1">
                http://localhost:3000
              </code>{" "}
              aur{" "}
              <code className="rounded bg-[#f1f3f4] px-1">
                https://creativelogomakers.com
              </code>{" "}
              add karo, phir{" "}
              <code className="rounded bg-[#f1f3f4] px-1">.env.local</code> mein:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[#f8f9fa] p-2 text-[11px] text-[#202124]">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
            </pre>
            <p className="mt-2 text-[11px] text-[#5f6368]">
              Save → <code className="rounded bg-[#f1f3f4] px-1">npm run dev</code>{" "}
              restart. Site khulte hi “Continue as …” aayega ({brand.name}).
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
      ) : null}
    </>
  );
}
