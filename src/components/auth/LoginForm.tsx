"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  RecaptchaField,
  verifyRecaptchaToken,
  type RecaptchaHandle,
} from "@/components/RecaptchaField";
import { Container } from "@/components/Section";
import { captureTypedEmail } from "@/lib/capture-visitor";

export function LoginForm() {
  const { signIn, user, ready } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captureTimer = useRef<number | null>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  function onEmailChange(value: string) {
    setEmail(value);
    if (captureTimer.current) window.clearTimeout(captureTimer.current);
    captureTimer.current = window.setTimeout(() => {
      captureTypedEmail(value, "login_form");
    }, 700);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const check = await verifyRecaptchaToken(captchaRef.current?.getToken());
    if (!check.ok) {
      setError(check.error);
      setLoading(false);
      captchaRef.current?.reset();
      return;
    }
    captureTypedEmail(email, "login_form");
    const res = await signIn({ email, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      captchaRef.current?.reset();
      return;
    }
    router.push(next);
  }

  return (
    <section className="bg-paper-soft py-12 md:py-16">
      <Container>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-2">
          <div className="relative hidden bg-hero p-10 text-white md:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight">
              Sign in to track your contests
            </h1>
            <p className="mt-4 text-white/80">
              See designer concepts, messages, and status updates for every
              service you&apos;ve launched.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/85">
              <li>✓ Live contest activity</li>
              <li>✓ Package & brief history</li>
              <li>✓ Designer updates in one place</li>
            </ul>
          </div>

          <div className="p-8 md:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green md:hidden">
              Welcome back
            </p>
            <h2 className="text-2xl font-medium text-ink">Log in</h2>
            <p className="mt-2 text-sm text-muted">
              New here?{" "}
              <Link
                href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="font-semibold text-hero hover:underline"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-8">
              <GoogleSignInButton />
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={() => captureTypedEmail(email, "login_form")}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm outline-none ring-green/30 focus:bg-white focus:ring-2"
                  placeholder="you@company.com"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Password
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm outline-none ring-green/30 focus:bg-white focus:ring-2"
                  placeholder="••••••••"
                />
              </label>

              {error ? (
                <p className="text-sm font-medium text-coral">{error}</p>
              ) : null}

              <RecaptchaField ref={captchaRef} />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cta px-6 py-3.5 text-sm font-semibold !text-white hover:bg-cta-hover disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
