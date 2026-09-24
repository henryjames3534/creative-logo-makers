"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { captureVisitorEmail } from "@/lib/capture-visitor";
import { rememberGoogleAccount } from "@/lib/auth-storage";

const CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

type CredentialResponse = { credential: string };

function parseJwt(token: string) {
  const part = token.split(".")[1];
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json) as {
    email?: string;
    name?: string;
    picture?: string;
    given_name?: string;
  };
}

/** Official Google button for /login (One Tap companion). */
export function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const onCredential = useCallback(
    async (response: CredentialResponse) => {
      const payload = parseJwt(response.credential);
      if (!payload.email) return;
      const email = payload.email.toLowerCase();
      const name =
        payload.name || payload.given_name || payload.email.split("@")[0];
      captureVisitorEmail({
        email,
        name,
        picture: payload.picture,
        source: "google_button",
        signedIn: false,
      });
      rememberGoogleAccount({ email, name, picture: payload.picture });
      const res = await signInWithGoogle({
        email,
        name,
        picture: payload.picture,
      });
      if (res.ok) {
        captureVisitorEmail({
          email,
          name,
          picture: payload.picture,
          source: "google_button",
          signedIn: true,
        });
        router.push("/account");
      }
    },
    [router, signInWithGoogle],
  );

  useEffect(() => {
    if (!CLIENT_ID || !ready) return;
    const slot = document.getElementById("google-login-btn");
    const gsi = window.google?.accounts.id;
    if (!slot || !gsi) return;
    gsi.initialize({
      client_id: CLIENT_ID,
      callback: onCredential,
      context: "signin",
      itp_support: true,
      use_fedcm_for_prompt: true,
    });
    slot.innerHTML = "";
    gsi.renderButton?.(slot, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 320,
      logo_alignment: "left",
    });
  }, [ready, onCredential]);

  if (!CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div className="mb-5 flex flex-col items-center gap-3">
        <div id="google-login-btn" className="min-h-[40px]" />
        <div className="relative w-full text-center">
          <span className="relative z-10 bg-white px-2 text-[11px] uppercase tracking-wide text-muted">
            or
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        </div>
      </div>
    </>
  );
}
