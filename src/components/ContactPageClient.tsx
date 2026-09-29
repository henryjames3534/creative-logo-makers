"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import {
  RecaptchaField,
  verifyRecaptchaToken,
  type RecaptchaHandle,
} from "@/components/RecaptchaField";
import { Container } from "@/components/Section";
import { media } from "@/data/media";
import { brand } from "@/data/site";
import { submitLeadForm } from "@/lib/submit-lead-form";
import { captureFormLead } from "@/lib/capture-form-lead";

export function ContactPageClient() {
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
    // Capture before any await — React nulls currentTarget after yield
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const topic = String(fd.get("topic") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    try {
      const check = await verifyRecaptchaToken(captchaRef.current?.getToken());
      if (!check.ok) {
        setError(check.error);
        captchaRef.current?.reset();
        return;
      }

      const result = await submitLeadForm(
        {
          form: "contact",
          name,
          email,
          topic,
          message,
          page: "/contact",
        },
        { nextPath: "/contact?sent=1" },
      );

      if (!result.ok) {
        setError(result.error);
        captchaRef.current?.reset();
        return;
      }

      try {
        captureFormLead({
          form: "contact",
          name,
          email,
          topic,
          message,
          page: "/contact",
        });
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

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 60% at 0% 0%, rgba(131,70,146,0.12), transparent 55%),
              linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%)
            `,
          }}
        />
        <Container className="relative z-10 py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-hero">
                Support
              </p>
              <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink md:text-5xl">
                Contact Creative Logo Makers
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink/70">
                Questions about packages, contests, Studio, or designer
                applications — we&apos;re here.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <p>
                  <span className="text-muted">Phone </span>
                  <a
                    href={`tel:${brand.phoneTel}`}
                    className="font-semibold text-ink hover:text-hero"
                  >
                    {brand.phone}
                  </a>
                  <span className="text-muted"> · </span>
                  <a
                    href={`tel:${brand.phoneAltTel}`}
                    className="font-semibold text-ink hover:text-hero"
                  >
                    {brand.phoneAlt}
                  </a>
                </p>
                <p>
                  <span className="text-muted">Email </span>
                  <a
                    href="mailto:reply@creativelogomakers.com"
                    className="font-semibold text-ink hover:text-hero"
                  >
                    reply@creativelogomakers.com
                  </a>
                </p>
                <p>
                  <span className="text-muted">Address </span>
                  <span className="font-semibold">{brand.addressFull}</span>
                </p>
              </div>
            </div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] border border-line shadow-lg">
              <Image
                src={media.contact}
                alt=""
                fill
                sizes="480px"
                quality={90}
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 shadow-sm">
            {sent ? (
              <div className="py-10 text-center">
                <p className="text-2xl font-bold">Message received</p>
                <p className="mt-3 text-muted">
                  Thanks — check your inbox for a confirmation email. Our team
                  will reply within one business day.
                </p>
                <div className="mt-6">
                  <Button href="/" variant="primary">
                    Back to home
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Name
                  </span>
                  <input
                    required
                    name="name"
                    className="focus-ring mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-hero"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="focus-ring mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-hero"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Topic
                  </span>
                  <select
                    name="topic"
                    className="focus-ring mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-hero"
                  >
                    <option>General question</option>
                    <option>Contest help</option>
                    <option>1-to-1 project</option>
                    <option>Studio inquiry</option>
                    <option>Become a designer</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Message
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="focus-ring mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 outline-none focus:border-hero"
                  />
                </label>
                <RecaptchaField ref={captchaRef} />
                {error ? (
                  <p className="text-sm font-medium text-coral">{error}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="focus-ring w-full rounded-full bg-cta py-3.5 text-sm font-semibold !text-white hover:bg-cta-hover disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
