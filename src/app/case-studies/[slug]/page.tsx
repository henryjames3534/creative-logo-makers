import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { caseStudies, getCaseStudy } from "@/data/case-studies";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return { title: "Case study" };
  return pageMetadata({
    title: `${c.title} | Case Study`,
    description: c.summary,
    path: `/case-studies/${c.slug}`,
    image: c.afterImage,
    keywords: [
      c.service,
      `${c.industry} branding case study`,
      "before after design",
      c.client,
    ],
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();
  const url = absoluteUrl(`/case-studies/${c.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: c.title,
          description: c.summary,
          image: [absoluteUrl(c.afterImage), absoluteUrl(c.beforeImage)],
          author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          mainEntityOfPage: url,
          about: c.client,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
          { name: c.client, path: `/case-studies/${c.slug}` },
        ]}
      />

      <article>
        <header className="border-b border-line bg-paper-soft">
          <Container className="py-12 md:py-16">
            <p className="text-xs font-bold uppercase tracking-wide text-hero">
              Case study · {c.service}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-ink md:text-5xl">
              {c.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted">{c.summary}</p>
            <p className="mt-3 text-sm text-faint">
              {c.client} · {c.industry} · {c.location}
            </p>
          </Container>
        </header>

        <Container className="py-10">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
              <Image
                src={c.beforeImage}
                alt={c.beforeAlt}
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 rounded bg-black/75 px-2.5 py-1 text-xs font-bold uppercase text-white">
                Before
              </span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
              <Image
                src={c.afterImage}
                alt={c.afterAlt}
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 rounded bg-hero px-2.5 py-1 text-xs font-bold uppercase text-white">
                After
              </span>
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <section>
              <h2 className="text-xl font-bold text-ink">Challenge</h2>
              <p className="mt-3 leading-relaxed text-muted">{c.challenge}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-ink">Approach</h2>
              <p className="mt-3 leading-relaxed text-muted">{c.approach}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-ink">Results</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
                {c.results.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          </div>

          <blockquote className="mt-12 rounded-2xl border border-line bg-white p-6 md:p-8">
            <p className="text-lg leading-relaxed text-ink">“{c.quote}”</p>
            <footer className="mt-4 text-sm">
              <p className="font-bold text-ink">{c.quoteName}</p>
              <p className="text-muted">{c.quoteRole}</p>
            </footer>
          </blockquote>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={c.servicePath} variant="primary">
              View {c.service} packages
            </Button>
            <Button href="/case-studies" variant="secondary">
              All case studies
            </Button>
            <Link
              href="/testimonials"
              className="inline-flex items-center text-sm font-semibold text-hero hover:underline"
            >
              Client testimonials →
            </Link>
          </div>
        </Container>
      </article>
      <CtaBand />
    </>
  );
}
