import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/Section";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalDocument({
  eyebrow,
  title,
  updated,
  intro,
  sections,
  relatedHref,
  relatedLabel,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  relatedHref: string;
  relatedLabel: string;
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 60% at 10% 0%, rgba(36,134,203,0.12), transparent 55%),
              radial-gradient(ellipse 40% 50% at 90% 10%, rgba(232,90,79,0.08), transparent 50%),
              linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%)
            `,
          }}
        />
        <Container className="relative py-14 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-serif)] text-4xl font-bold tracking-tight text-ink md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {intro}
          </p>
          <p className="mt-5 text-sm text-muted">
            Last updated: <span className="font-medium text-ink">{updated}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Related:{" "}
            <Link
              href={relatedHref}
              className="font-medium text-blue underline-offset-2 hover:underline"
            >
              {relatedLabel}
            </Link>
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                On this page
              </p>
              <nav className="mt-3 space-y-1.5" aria-label="Table of contents">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-paper-soft hover:text-ink"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="min-w-0 space-y-10">
              {sections.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28 border-b border-line pb-10 last:border-0 last:pb-0"
                >
                  <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                    {s.title}
                  </h2>
                  <div className="legal-prose mt-4 space-y-3 text-[15px] leading-relaxed text-[#3d3c3a] [&_a]:font-medium [&_a]:text-blue [&_a]:underline-offset-2 hover:[&_a]:underline [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                    {s.content}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
