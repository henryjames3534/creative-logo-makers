import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioRequestForm } from "@/components/StudioRequestForm";
import { StudioServiceView } from "@/components/StudioServiceView";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { CtaBand } from "@/components/CtaBand";
import { media } from "@/data/media";
import {
  getStudioService,
  studioServices,
  studioStrategists,
} from "@/data/studio";
import Image from "next/image";
import Link from "next/link";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return studioServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getStudioService(slug);
  if (!service) return { title: "Studio" };
  return pageMetadata({
    title: `${service.title} · Studio`,
    description: service.description.slice(0, 160),
    path: `/studio/${service.slug}`,
  });
}

export default async function StudioServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getStudioService(slug);
  if (!service) notFound();

  if (slug === "talk-to-strategist") {
    return (
      <>
        <PageHero
          eyebrow={service.eyebrow}
          title={service.title}
          description={service.description}
          image={media.studio}
          accent="#3e00cd"
        >
          <p className="text-sm font-semibold text-ink">
            <LocalizedPrice value={service.price} />
            <span className="ml-2 font-normal text-muted">
              · {service.turnaround}
            </span>
          </p>
        </PageHero>

        <section className="py-14 md:py-16">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
              <div>
                <SectionHeading title="Request a call" />
                <ul className="mt-6 space-y-3">
                  {service.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-ink"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-4">
                  {studioStrategists.map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-muted">{p.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <StudioRequestForm defaultTopic="Studio intro call" />
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-paper-soft py-14 md:py-16">
          <Container>
            <SectionHeading title="Or browse Studio packages" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {studioServices
                .filter((s) => s.slug !== "talk-to-strategist")
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/studio/${s.slug}`}
                    className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-violet/30"
                  >
                    <p className="text-xs font-bold text-violet">
                      <LocalizedPrice value={s.price} />
                    </p>
                    <h3 className="mt-1 font-semibold text-ink">{s.shortTitle}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {s.description}
                    </p>
                  </Link>
                ))}
            </div>
          </Container>
        </section>

        <CtaBand title="Questions first? Browse Studio services" />
      </>
    );
  }

  return <StudioServiceView service={service} />;
}
