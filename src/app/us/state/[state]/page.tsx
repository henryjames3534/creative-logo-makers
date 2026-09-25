import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { getCategory } from "@/data/categories";
import { US_CITIES } from "@/data/us-locations";
import {
  STATE_SEO_SERVICES,
  US_STATES,
  getStateBySlug,
  statePath,
  stateServicePath,
} from "@/data/us-states";
import { buildStateServiceSeo } from "@/lib/state-seo";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ state: string }> };

export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return { title: "State" };
  return pageMetadata({
    title: `Design Services in ${state.name} — Logo, Web & App Design (${state.code})`,
    description: `Hire designers for logo design, website design, and mobile app design in ${state.name}. Contests and 1-to-1 projects with Creative Logo Makers — USA remote delivery.`,
    path: statePath(state.slug),
    keywords: [
      `logo design ${state.name}`,
      `website design ${state.name}`,
      `graphic design ${state.name}`,
      `hire designer ${state.name}`,
      `${state.name} design services`,
      `branding ${state.name}`,
    ],
  });
}

export default async function StateHubPage({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();
  const cities = US_CITIES.filter((c) => c.state === state.code).slice(0, 16);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "United States", path: "/us" },
          { name: state.name, path: statePath(state.slug) },
        ]}
      />
      <section className="border-b border-line bg-paper-soft">
        <Container className="py-12 md:py-16">
          <nav className="text-sm text-muted">
            <Link href="/us" className="hover:text-ink">
              United States
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{state.name}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Design services in {state.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            Creative Logo Makers serves {state.name} businesses with logo design,
            website design, mobile app UI, packaging, and branding — contest or
            1-to-1, delivered remotely across the USA.
          </p>
          <div className="mt-8">
            <Button href="/get-started" variant="primary">
              Get started
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-medium text-ink">
            Popular services in {state.name}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STATE_SEO_SERVICES.map((slug) => {
              const cat = getCategory(slug);
              const seo = buildStateServiceSeo(state, slug);
              return (
                <Link
                  key={slug}
                  href={stateServicePath(state.slug, slug)}
                  className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-ink"
                >
                  <h3 className="font-semibold text-ink">
                    {cat?.productName || slug} in {state.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {seo.description}
                  </p>
                  <p className="mt-3 text-sm font-bold text-ink">
                    From {cat?.startingPrice || "$249"}
                  </p>
                </Link>
              );
            })}
          </div>

          {cities.length > 0 && (
            <>
              <h2 className="mt-14 text-2xl font-medium text-ink">
                Cities in {state.name}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {cities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/us/${c.slug}`}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
