"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import {
  RecaptchaField,
  verifyRecaptchaToken,
  type RecaptchaHandle,
} from "@/components/RecaptchaField";
import { submitLeadForm } from "@/lib/submit-lead-form";
import { captureFormLead } from "@/lib/capture-form-lead";

export function StudioRequestForm({ defaultTopic }: { defaultTopic: string }) {
  const search = useSearchParams();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<RecaptchaHandle>(null);

  useEffect(() => {
    if (search.get("sent") === "1") setSent(true);
  }, [search]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const topic = String(fd.get("topic") ?? defaultTopic).trim();
    const message = String(fd.get("message") ?? "").trim();
    const page =
      typeof window !== "undefined" ? window.location.pathname : "/studio";

    try {
      const check = await verifyRecaptchaToken(captchaRef.current?.getToken());
      if (!check.ok) {
        setError(check.error);
        captchaRef.current?.reset();
        return;
      }

      const result = await submitLeadForm(
        {
          form: "studio",
          name,
          email,
          topic,
          message,
          page,
        },
        { nextPath: `${page}?sent=1` },
      );

      if (!result.ok) {
        setError(result.error);
        captchaRef.current?.reset();
        return;
      }

      try {
        captureFormLead({
          form: "studio",
          name,
          email,
          topic,
          message,
          page,
        });
        sessionStorage.setItem(
          "clm_studio_request",
          JSON.stringify({
            name,
            email,
            topic,
            message,
            at: new Date().toISOString(),
          }),
        );
      } catch {
        /* server already saved */
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
        <p className="text-2xl font-bold text-ink">Request received</p>
        <p className="mt-3 text-muted">
          Check your inbox for a confirmation email. A Brand Strategist will be
          in touch soon — usually within one business day.
        </p>
        <div className="mt-6">
          <Button href="/studio" variant="primary">
            Back to Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-4 rounded-2xl border border-line bg-white p-8 shadow-sm"
    >
      <input type="hidden" name="topic" value={defaultTopic} />
      <label className="block text-sm">
        <span className="font-medium text-ink">Name</span>
        <input
          name="name"
          required
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Work email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">What do you need?</span>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Stage of business, timeline, logo already done or not…"
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <RecaptchaField ref={captchaRef} />
      {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="focus-ring inline-flex w-full items-center justify-center rounded-full bg-cta px-7 py-3.5 text-sm font-semibold !text-white transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {loading ? "Sending…" : "Request a call"}
      </button>
      <p className="text-center text-xs text-muted">
        Circlemakers Studio · English & German
      </p>
    </form>
  );
}
