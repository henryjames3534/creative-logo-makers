import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import { brand, stats } from "@/data/site";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("about", "/about");

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Grow with great design"
        description="Creative Logo Makers connects businesses with creative experts who make brands look and feel professional. Because good design makes great business."
        image={media.about}
        accent="#834692"
      />
      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <SectionHeading
              title="Because good design makes great business"
              description="From first logos to full brand systems, packaging, and digital products — design that stops the scroll and builds trust."
            />
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-line bg-white p-5 shadow-sm"
                >
                  <p className="text-2xl font-bold text-green">{s.value}</p>
                  <p className="mt-2 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section className="border-t border-line bg-paper-soft py-14">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Talk to us</h2>
            <p className="mt-2 text-muted">
              {brand.phone} · {brand.phoneAlt}
            </p>
            <p className="mt-1 text-muted">{brand.email}</p>
            <p className="mt-1 text-sm text-muted">{brand.addressFull}</p>
          </div>
          <Button href="/contact" variant="primary">
            Contact us
          </Button>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
