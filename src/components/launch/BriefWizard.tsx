"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import type { Category } from "@/data/categories";
import {
  briefTitle,
  getBriefSteps,
  type BriefField,
  type BriefStep,
} from "@/data/briefs";
import type { DesignerProfile } from "@/data/designers-types";
import type { PackageTier } from "@/data/packages";
import { categoryDetailsHref } from "@/data/serviceRoutes";
import { savePendingBrief, type PendingBrief } from "@/lib/auth-storage";

type Answers = Record<string, string | string[]>;

export function BriefWizard({
  category,
  pkg,
  hireDesigner,
}: {
  category: Category;
  pkg: PackageTier;
  /** When set, payment creates a 1-to-1 CRM project and assigns this designer */
  hireDesigner?: DesignerProfile;
}) {
  const { user, attachBrief } = useAuth();
  const router = useRouter();
  const steps = useMemo(() => getBriefSteps(category.slug), [category.slug]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const isDirectHire = Boolean(hireDesigner);

  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLast = stepIndex === steps.length - 1;

  function setValue(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
  }

  function toggleMulti(id: string, option: string) {
    const current = (answers[id] as string[] | undefined) ?? [];
    const next = current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option];
    setValue(id, next);
  }

  function validate(s: BriefStep): boolean {
    for (const field of s.fields) {
      if (!("required" in field) || !field.required) continue;
      const v = answers[field.id];

      if (field.type === "visual") {
        const arr = (v as string[] | undefined) ?? [];
        if (arr.length < (field.multi ? 2 : 1)) {
          setError(
            field.multi
              ? "Pick at least 2 styles to continue."
              : "Please select an option.",
          );
          return false;
        }
        continue;
      }

      if (field.type === "chips" || field.type === "colors") {
        if (field.multi) {
          const arr = (v as string[] | undefined) ?? [];
          if (arr.length === 0) {
            setError("Please complete the required fields.");
            return false;
          }
        } else if (typeof v !== "string" || !v) {
          setError("Please complete the required fields.");
          return false;
        }
        continue;
      }

      if (typeof v !== "string" || !v.trim()) {
        setError("Please complete the required fields.");
        return false;
      }
    }
    return true;
  }

  function submitBrief() {
    const brief: PendingBrief = {
      categorySlug: category.slug,
      categoryName: category.productName,
      packageName: pkg.name,
      packagePrice: pkg.price,
      ...(hireDesigner
        ? {
            designerId: hireDesigner.id,
            designerName: hireDesigner.name,
            designerHandle: hireDesigner.handle,
            hireMode: "direct" as const,
          }
        : { hireMode: "contest" as const }),
    };

    if (user) {
      attachBrief(brief);
      setNeedsAuth(false);
      setDone(true);
      return;
    }

    savePendingBrief(brief);
    setNeedsAuth(true);
    setDone(true);
  }

  function next() {
    if (!validate(step)) return;
    if (isLast) {
      submitBrief();
      return;
    }
    setStepIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (done) {
    return (
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
              {needsAuth
                ? "Brief saved"
                : isDirectHire
                  ? "Payment confirmed · designer hired"
                  : "Brief submitted"}
            </p>
            <h1 className="mt-3 text-3xl font-medium text-ink">
              {needsAuth
                ? isDirectHire
                  ? "Sign in to complete hire"
                  : "Save your contest updates"
                : isDirectHire
                  ? `${hireDesigner?.name} is on your project`
                  : "You&apos;re almost live"}
            </h1>
            <p className="mt-3 text-muted">
              {isDirectHire ? (
                <>
                  Your 1-to-1 {category.productName.toLowerCase()} project (
                  {pkg.name} · <LocalizedPrice value={pkg.price} />) is live
                  {hireDesigner
                    ? ` with ${hireDesigner.name}`
                    : ""}
                  . They’ll see it in their designer portal right after payment.
                </>
              ) : (
                <>
                  Your {category.productName.toLowerCase()} contest ({pkg.name} ·{" "}
                  <LocalizedPrice value={pkg.price} />) is ready for designers.
                </>
              )}
              {needsAuth
                ? " Create an account or log in to track concepts and status updates."
                : " Track progress anytime from My account."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {needsAuth ? (
                <>
                  <Button href="/signup?next=/account" variant="primary">
                    Sign up to track updates
                  </Button>
                  <Button href="/login?next=/account" variant="secondary">
                    Log in
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/account" variant="primary">
                    View my updates
                  </Button>
                  <Button
                    href={isDirectHire ? "/projects" : "/contests"}
                    variant="secondary"
                  >
                    {isDirectHire ? "View projects" : "View contests"}
                  </Button>
                </>
              )}
            </div>
            {!needsAuth ? (
              <button
                type="button"
                onClick={() => router.push(categoryDetailsHref(category))}
                className="mt-4 text-sm font-medium text-muted hover:text-ink"
              >
                Back to {category.productName}
              </button>
            ) : null}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <div className="min-h-[70vh] bg-paper-soft">
      {/* Top bar + stepped progress */}
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur-md">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Visual brief
            </p>
            <p className="truncate text-sm font-semibold text-ink">
              {isDirectHire
                ? `Hire ${hireDesigner?.name} · ${pkg.name}`
                : briefTitle(category, pkg.name)}
            </p>
            {isDirectHire && hireDesigner ? (
              <p className="truncate text-xs text-muted">
                1-to-1 · @{hireDesigner.handle} · assigned after payment
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <p className="hidden text-sm font-bold tabular-nums text-green sm:block">
              {Math.round(progress)}% complete
            </p>
            <Link
              href={
                hireDesigner
                  ? `/designers/${hireDesigner.id}?tab=invite&skill=${encodeURIComponent(category.slug)}`
                  : `${categoryDetailsHref(category)}#pricing`
              }
              className="text-sm font-medium text-muted hover:text-ink"
            >
              ← Change package
            </Link>
          </div>
        </Container>

        <Container className="pb-4 pt-1">
          {/* Track */}
          <div className="relative">
            <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
              <div
                className="relative h-full rounded-full bg-green transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>

            {/* Step markers */}
            <ol className="scrollbar-none mt-3 flex justify-between gap-0.5 overflow-x-auto pb-1 sm:gap-1">
              {steps.map((s, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={s.id} className="flex min-w-0 flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (i <= stepIndex) {
                          setError(null);
                          setStepIndex(i);
                        }
                      }}
                      disabled={i > stepIndex}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs ${
                        done
                          ? "bg-green !text-white shadow-sm ring-4 ring-green/20"
                          : active
                            ? "scale-110 bg-ink !text-white shadow-md ring-4 ring-ink/15"
                            : "bg-ink/10 text-muted"
                      } ${i <= stepIndex ? "cursor-pointer" : "cursor-not-allowed"}`}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Step ${i + 1}: ${s.title}`}
                    >
                      {done ? (
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                          <path
                            d="M3.5 8.5 6.5 11.5 12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </button>
                    <span
                      className={`mt-1.5 hidden max-w-[7rem] truncate text-center text-[11px] font-semibold sm:block ${
                        active ? "text-ink" : done ? "text-green" : "text-muted"
                      }`}
                    >
                      {s.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          {/* Main step */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm font-semibold tabular-nums text-muted sm:hidden">
                {Math.round(progress)}%
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-medium tracking-tight text-ink md:text-3xl">
              {step.title}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
              {step.description}
            </p>

            <div className="mt-8 space-y-8">
              {step.fields.map((field) => (
                <FieldBlock
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  onText={(v) => setValue(field.id, v)}
                  onToggle={(opt) => {
                    if (field.type === "chips" && !field.multi) {
                      setValue(field.id, opt);
                    } else {
                      toggleMulti(field.id, opt);
                    }
                  }}
                />
              ))}
            </div>

            {error ? (
              <p className="mt-6 text-sm font-medium text-coral">{error}</p>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <button
                type="button"
                onClick={back}
                disabled={stepIndex === 0}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-cta px-7 py-3 text-sm font-semibold !text-white hover:bg-cta-hover"
              >
                {isLast ? "Submit brief" : "Continue"}
              </button>
            </div>
          </div>

          {/* Package summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Your package
              </p>
              <h2 className="mt-2 text-xl font-bold text-ink">{pkg.name}</h2>
              <p className="mt-1 text-2xl font-bold text-ink">
                <LocalizedPrice value={pkg.price} />
              </p>
              <p className="mt-2 text-sm text-muted">{pkg.blurb}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{pkg.bestFor}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink/80">
                    <span className="text-green">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl bg-paper-soft px-4 py-3 text-xs text-muted">
                Category:{" "}
                <span className="font-semibold text-ink">{category.productName}</span>
              </div>
            </div>

            {/* Step list */}
            <ol className="mt-4 space-y-1 rounded-2xl border border-line bg-white p-4">
              {steps.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (i <= stepIndex) setStepIndex(i);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      i === stepIndex
                        ? "bg-green/10 font-semibold text-ink"
                        : i < stepIndex
                          ? "text-ink hover:bg-paper-soft"
                          : "text-muted"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        i < stepIndex
                          ? "bg-green !text-white"
                          : i === stepIndex
                            ? "bg-ink !text-white"
                            : "bg-paper-soft text-muted"
                      }`}
                    >
                      {i < stepIndex ? "✓" : i + 1}
                    </span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function FieldBlock({
  field,
  value,
  onText,
  onToggle,
}: {
  field: BriefField;
  value: string | string[] | undefined;
  onText: (v: string) => void;
  onToggle: (opt: string) => void;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  if (field.type === "text" || field.type === "email" || field.type === "textarea") {
    return (
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {field.label}
          {field.required ? " *" : ""}
        </span>
        {field.type === "textarea" ? (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onText(e.target.value)}
            rows={5}
            placeholder={field.placeholder}
            className="focus-ring mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-hero"
          />
        ) : (
          <input
            type={field.type === "email" ? "email" : "text"}
            value={(value as string) ?? ""}
            onChange={(e) => onText(e.target.value)}
            placeholder={field.placeholder}
            className="focus-ring mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-hero"
          />
        )}
      </label>
    );
  }

  if (field.type === "chips") {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {field.label}
          {field.required ? " *" : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-ink !text-white shadow-sm"
                    : "border border-line bg-paper-soft text-ink hover:border-ink/30"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "visual") {
    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {field.label}
            {field.required ? " *" : ""}
          </p>
          {field.hint ? (
            <p className="text-xs text-muted">{field.hint}</p>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {field.options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggle(opt.id)}
                className={`group overflow-hidden rounded-xl border-2 text-left transition-all ${
                  active
                    ? "border-green shadow-md ring-2 ring-green/20"
                    : "border-line hover:border-ink/25"
                }`}
              >
                <div className="relative aspect-square bg-paper-soft">
                  <Image
                    src={opt.image}
                    alt={opt.label}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {active ? (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green text-xs font-bold !text-white">
                      ✓
                    </span>
                  ) : null}
                </div>
                <p className="px-2.5 py-2 text-xs font-semibold text-ink">
                  {opt.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type !== "colors") return null;

  // colors
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {field.label}
        {field.required ? " *" : ""}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {field.options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                active
                  ? "border-green bg-green/5 shadow-sm"
                  : "border-line hover:border-ink/25"
              }`}
            >
              <div className="flex overflow-hidden rounded-lg">
                {opt.swatches.map((c: string) => (
                  <span
                    key={c}
                    className="h-10 flex-1"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-ink">{opt.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
