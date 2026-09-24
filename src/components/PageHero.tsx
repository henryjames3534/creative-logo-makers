import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/Section";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  accent = "#834692",
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 70% at 0% 0%, ${accent}22, transparent 55%),
            radial-gradient(ellipse 45% 55% at 100% 20%, rgba(36,134,203,0.08), transparent 50%),
            linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(49,48,48,0.05) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <Container className="relative z-10 py-14 md:py-20">
        <div
          className={`grid items-center gap-10 ${image ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}
        >
          <div>
            {eyebrow ? (
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 max-w-3xl text-3xl font-medium leading-[1.08] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
              {description}
            </p>
            {children ? <div className="mt-8">{children}</div> : null}
          </div>

          {image ? (
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                className="absolute -inset-3 rounded-[1.75rem] opacity-40 blur-2xl"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_20px_50px_rgba(49,48,48,0.12)]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 90vw, 420px"
                  quality={75}
                  className="object-cover"
                  priority
                />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${accent}99 0%, transparent 55%)`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
