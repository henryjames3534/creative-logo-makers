import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import { studioServices, type StudioService } from "@/data/studio";

export function StudioServiceView({ service }: { service: StudioService }) {
  const others = studioServices.filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.title}
        description={service.description}
        image={media.studio}
        accent="#3e00cd"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/studio/talk-to-strategist" variant="primary">
            {service.slug === "talk-to-strategist"
              ? "Request a call"
              : "Talk to a strategist"}
          </Button>
          <p className="text-sm font-semibold text-ink">
            <LocalizedPrice value={service.price} />
            <span className="ml-2 font-normal text-muted">
              · {service.turnaround}
            </span>
          </p>
        </div>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {service.highlights.map((h) => (
              <div
                key={h}
                className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink shadow-sm"
              >
                {h}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="What's included" />
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
            </div>
            <div>
              <SectionHeading title="How it works" />
              <ol className="mt-6 space-y-4">
                {service.process.map((p) => (
                  <li
                    key={p.step}
                    className="rounded-2xl border border-line bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-violet">
                      {p.step}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {p.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {service.faqs.length > 0 ? (
        <section className="border-t border-line py-14 md:py-16">
          <Container>
            <SectionHeading title="FAQs" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {service.faqs.map((f) => (
                <div
                  key={f.q}
                  className="rounded-2xl border border-line bg-white p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading
            title="More Studio services"
            description="Strategy, identity, launch — or book an intro call."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/studio/${s.slug}`}
                className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-violet">
                  <LocalizedPrice value={s.price} />
                </p>
                <h3 className="mt-2 font-semibold text-ink group-hover:text-violet">
                  {s.shortTitle}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {s.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        title={
          service.slug === "talk-to-strategist"
            ? "Request your Studio intro call"
            : "Ready to start with Studio?"
        }
      />
    </>
  );
}
