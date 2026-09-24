"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { media } from "@/data/media";

const fonts = ["Syne Bold", "Geometric", "Soft Sans", "Display Serif"];
const styles = ["Wordmark", "Monogram", "Icon + type", "Badge"];
const palettes = [
  ["#1c1b1a", "#00a581"],
  ["#ffffff", "#1a1a1a"],
  ["#0f172a", "#38bdf8"],
  ["#1a1a1a", "#f59e0b"],
];

export default function LogoMakerPage() {
  const [name, setName] = useState("Creative Logo Makers");
  const [font, setFont] = useState(fonts[0]);
  const [style, setStyle] = useState(styles[0]);
  const [palette, setPalette] = useState(0);

  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join(""),
    [name],
  );

  const [bg, fg] = palettes[palette];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 60% at 0% 0%, rgba(0,165,129,0.14), transparent 55%),
              linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%)
            `,
          }}
        />
        <Container className="relative z-10 py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
                Free Logo Maker
              </p>
              <h1 className="mt-2 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
                Create your logo design in minutes
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
                Fast, free, and oh-so-easy. The perfect way to get started — or
                use it as inspiration for our designers to level up your
                branding.
              </p>
            </div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] border border-line bg-green shadow-lg">
              <Image
                src={media.logoMaker}
                alt="Logo maker examples"
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
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6 rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Brand name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-ring mt-2 w-full rounded-xl border border-line px-4 py-3 text-base font-semibold outline-none focus:border-green"
                  placeholder="Your brand name"
                />
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Style
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {styles.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        style === s
                          ? "bg-green !text-white"
                          : "border border-line bg-paper-soft hover:border-green"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Type feel
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fonts.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFont(f)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        font === f
                          ? "bg-green !text-white"
                          : "border border-line bg-paper-soft hover:border-green"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Palette
                </p>
                <div className="mt-2 flex gap-3">
                  {palettes.map((p, i) => (
                    <button
                      key={p.join()}
                      type="button"
                      aria-label={`Palette ${i + 1}`}
                      onClick={() => setPalette(i)}
                      className={`flex overflow-hidden rounded-full border-2 ${
                        palette === i ? "border-green" : "border-transparent"
                      }`}
                    >
                      <span className="h-10 w-10" style={{ backgroundColor: p[0] }} />
                      <span className="h-10 w-10" style={{ backgroundColor: p[1] }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button href="/get-started" variant="primary">
                  Level up with a designer
                </Button>
              </div>
            </div>

            <div
              className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-line p-10 shadow-md transition-colors duration-300"
              style={{ backgroundColor: bg, color: fg }}
            >
              {style.includes("Icon") || style === "Monogram" || style === "Badge" ? (
                <div
                  className={`mb-6 flex items-center justify-center text-4xl font-extrabold ${
                    style === "Badge"
                      ? "h-28 w-28 rounded-full border-4"
                      : "h-24 w-24 rounded-3xl"
                  }`}
                  style={{
                    borderColor: fg,
                    backgroundColor: style === "Badge" ? "transparent" : fg,
                    color: style === "Badge" ? fg : bg,
                  }}
                >
                  {initials || "99"}
                </div>
              ) : null}
              <p
                className="text-center text-4xl font-extrabold tracking-tight md:text-5xl"
                style={{
                  letterSpacing: font.includes("Display") ? "0.02em" : "-0.03em",
                  fontWeight: font.includes("Soft") ? 600 : 800,
                }}
              >
                {name || "Your Brand"}
              </p>
              <p className="mt-4 text-sm opacity-60">
                Preview · {style} · {font}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
