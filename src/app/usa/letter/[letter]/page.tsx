import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Section";
import { intentPath, listIndexableUsaIntents } from "@/data/usa-intents";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ letter: string }> };

const LETTERS = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  "other",
] as const;

function normalizeLetter(raw: string) {
  const s = decodeURIComponent(raw).trim().toLowerCase();
  if (s === "other" || s === "#") return "other";
  if (/^[a-z]$/.test(s)) return s.toUpperCase();
  return null;
}

function letterKey(keyword: string) {
  const ch = keyword.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "other";
}

export function generateStaticParams() {
  return LETTERS.map((letter) => ({ letter: letter.toLowerCase() }));
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter: raw } = await params;
  const letter = normalizeLetter(raw);
  if (!letter) return { title: "USA keywords" };
  const label = letter === "other" ? "#" : letter;
  return pageMetadata({
    title: `USA design keywords — ${label}`,
    description: `Browse USA design service keyword pages starting with ${label}.`,
    path: `/usa/letter/${raw.toLowerCase()}`,
  });
}

export default async function UsaLetterPage({ params }: Props) {
  const { letter: raw } = await params;
  const letter = normalizeLetter(raw);
  if (!letter) notFound();

  const pages = listIndexableUsaIntents()
    .filter((p) => letterKey(p.keyword) === letter)
    .sort((a, b) => a.keyword.localeCompare(b.keyword));

  const label = letter === "other" ? "#" : letter;

  return (
    <section className="py-14 md:py-20">
      <Container>
        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/usa" className="hover:text-ink">
            USA keywords
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{label}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl">
          USA keywords — {label}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {pages.length.toLocaleString()} keyword pages in this letter group.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {LETTERS.map((L) => {
            const href = `/usa/letter/${L.toLowerCase()}`;
            const active =
              (letter === "other" && L === "other") ||
              (letter !== "other" && L === letter);
            return (
              <Link
                key={L}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                  active
                    ? "border-ink bg-ink !text-white"
                    : "border-line bg-white text-ink hover:border-ink"
                }`}
              >
                {L === "other" ? "#" : L}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {pages.map((i) => (
            <Link
              key={i.slug}
              href={intentPath(i.slug)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
            >
              {i.keyword}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
