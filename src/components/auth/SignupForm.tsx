"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/Section";
import { captureTypedEmail } from "@/lib/capture-visitor";

export function SignupForm() {
  const { signUp, user, ready } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captureTimer = useRef<number | null>(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  function onEmailChange(value: string) {
    setEmail(value);
    if (captureTimer.current) window.clearTimeout(captureTimer.current);
    captureTimer.current = window.setTimeout(() => {
      captureTypedEmail(value, "signup_form", name);
    }, 700);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    captureTypedEmail(email, "signup_form", name);
    const res = await signUp({ name, email, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(next);
  }

  return (
    <section className="bg-paper-soft py-12 md:py-16">
      <Container>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-2">
          <div className="relative hidden bg-ink p-10 text-white md:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
              Get started free
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight">
              Create your customer account
            </h1>
            <p className="mt-4 text-white/75">
              Launch contests, follow designer progress, and keep every service
              update in one dashboard.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-medium text-ink">Sign up</h2>
            <p className="mt-2 text-sm text-muted">
              Already have an account?{" "}
              <Link
                href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="font-semibold text-hero hover:underline"
              >
                Log in
              </Link>
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Full name
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm outline-none ring-green/30 focus:bg-white focus:ring-2"
                  placeholder="Alex Rivera"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Work email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={() => captureTypedEmail(email, "signup_form", name)}
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
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-3 text-sm outline-none ring-green/30 focus:bg-white focus:ring-2"
                  placeholder="At least 6 characters"
                />
              </label>

              {error ? (
                <p className="text-sm font-medium text-coral">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cta px-6 py-3.5 text-sm font-semibold !text-white hover:bg-cta-hover disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
