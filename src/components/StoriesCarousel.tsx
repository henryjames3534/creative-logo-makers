"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Container } from "@/components/Section";

type Story = {
  quote: string;
  name: string;
  role: string;
  designerCredit: string;
  artwork: string;
  photo1: string;
  photo2: string;
  avatar: string;
  accent: string;
  artStyle: "portrait" | "square" | "wide";
  statLabel: string;
  statValue: string;
  statSuffix: string;
  statKind: "designs" | "connections" | "countries";
  statHint: string;
};


const stories: Story[] = [
  {
    quote:
      "Creative Logo Makers is a platform with a good name and a very good service… where entrepreneurs can easily find the right design for their company. The book cover for us was a very important part of the success of the book. Therefore, we entrusted this to experts and ended up being very happy with the result.",
    name: "Val Racheeva + Maxi Knust",
    role: "Co-authors, Germany",
    designerCredit: "by betiobca",
    artwork: "/showcase/stories/story1-art.png",
    photo1: "/showcase/stories/story1-p1.jpg",
    photo2: "/showcase/stories/story1-p2.jpg",
    avatar: "/showcase/stories/story1-av.jpg",
    accent: "#A5823D",
    artStyle: "portrait",
    statLabel: "Get this: A new design is created on Creative Logo Makers every 2 seconds!",
    statValue: "907,834",
    statSuffix: "designs",
    statKind: "designs",
    statHint: "A new design every 2 seconds",
  },
  {
    quote:
      "We wanted something fun and eye-catching that didn’t look like every other coffee logo out there… There were so many designs to choose from and all of the designers were friendly and willing to change things up based on our preferences. In the end, we went with a design from Wintrygrey that we absolutely love.",
    name: "Juliette Simpkins",
    role: "Owner, Black Ring Coffee. USA",
    designerCredit: "by Wintrygrey",
    artwork: "/showcase/stories/story2-art.png",
    photo1: "/showcase/stories/story2-p1.jpg",
    photo2: "/showcase/stories/story2-p2.jpg",
    avatar: "/showcase/stories/story2-av.jpg",
    accent: "#ED6800",
    artStyle: "square",
    statLabel:
      "Collaboration is the key to creativity, and we love bringing people together.",
    statValue: "697,884",
    statSuffix: "connections",
    statKind: "connections",
    statHint: "Clients + designers collaborating worldwide",
  },
  {
    quote:
      "When it came to developing my own brand, I didn’t really think of other options… I want to make sure I have alignment between who I am and what I am representing. We all gravitated pretty quickly to the design from Steve Hai. He was really responsive and a great designer.",
    name: "Matthew Dellavedova",
    role: "Australian NBA superstar",
    designerCredit: "by Steve Hai",
    artwork: "/showcase/stories/story3-art.png",
    photo1: "/showcase/stories/story3-p1.jpg",
    photo2: "/showcase/stories/story3-p2.jpg",
    avatar: "/showcase/stories/story3-av.jpg",
    accent: "#DB7700",
    artStyle: "square",
    statLabel:
      "Global is good. Our designers challenge and inspire each other with their unique perspectives.",
    statValue: "192",
    statSuffix: "countries",
    statKind: "countries",
    statHint: "Creative talent across every region",
  },
];

/** Advanced stories carousel — artwork collage, stats, accent arrows */
export function StoriesCarousel() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"story" | "stat">("story");
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);

  const story = stories[index];

  const goNext = useCallback(() => {
    setAnimKey((k) => k + 1);
    setMode((m) => {
      if (m === "story") return "stat";
      setIndex((i) => (i + 1) % stories.length);
      return "story";
    });
  }, []);

  const goPrev = useCallback(() => {
    setAnimKey((k) => k + 1);
    setMode((m) => {
      if (m === "stat") return "story";
      setIndex((i) => (i - 1 + stories.length) % stories.length);
      return "stat";
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(goNext, 6000);
    return () => clearInterval(id);
  }, [paused, goNext, index, mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  function jumpTo(i: number) {
    setAnimKey((k) => k + 1);
    setIndex(i);
    setMode("story");
  }

  return (
    <section
      className="relative overflow-hidden bg-white py-16 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ ["--story-accent" as string]: story.accent }}
    >
      {/* World-map dotted field */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: 0.11,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${story.accent}33 0, transparent 42%),
            radial-gradient(circle at 80% 70%, ${story.accent}22 0, transparent 40%),
            radial-gradient(circle, #313030 1.15px, transparent 1.15px)
          `,
          backgroundSize: "auto, auto, 26px 26px",
        }}
      />

      <Container className="relative z-10">
        <div className="relative mx-auto max-w-5xl px-1 md:px-16">
          {/* Arrows */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous story"
            className="absolute left-0 top-1/2 z-30 hidden h-[4.5rem] w-12 -translate-y-1/2 items-center justify-center text-white shadow-md transition-transform hover:scale-105 md:flex"
            style={{ backgroundColor: story.accent }}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next story"
            className="absolute right-0 top-1/2 z-30 hidden h-[4.5rem] w-12 -translate-y-1/2 items-center justify-center text-white shadow-md transition-transform hover:scale-105 md:flex"
            style={{ backgroundColor: story.accent }}
          >
            <Arrow dir="right" />
          </button>

          {/* Mobile arrows */}
          <div className="mb-4 flex justify-between md:hidden">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center text-white"
              style={{ backgroundColor: story.accent }}
            >
              <Arrow dir="left" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center text-white"
              style={{ backgroundColor: story.accent }}
            >
              <Arrow dir="right" />
            </button>
          </div>

          <div
            key={`${index}-${mode}-${animKey}`}
            className="story-fade min-h-[360px] md:min-h-[400px]"
          >
            {mode === "story" ? (
              <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
                {/* Artwork + related photos */}
                <div className="relative mx-auto w-full max-w-[420px]">
                  <div
                    className={`relative mx-auto ${
                      story.artStyle === "portrait"
                        ? "aspect-[3/4] w-[70%]"
                        : story.artStyle === "wide"
                          ? "aspect-[16/11] w-[92%]"
                          : "aspect-square w-[78%]"
                    }`}
                  >
                    <Image
                      src={story.artwork}
                      alt=""
                      fill
                      sizes="320px"
                      className="object-contain drop-shadow-[0_20px_40px_rgba(49,48,48,0.12)]"
                      priority
                    />
                  </div>

                  {/* Related photos — clean L-stack, not overlapping the mark */}
                  <div className="absolute -bottom-2 left-0 flex flex-col gap-3 sm:left-[-4%]">
                    <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-md shadow-[0_10px_28px_rgba(49,48,48,0.18)] ring-2 ring-white sm:h-28 sm:w-28">
                      <Image
                        src={story.photo1}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-10 right-0 sm:bottom-14 sm:right-[-2%]">
                    <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-md shadow-[0_10px_28px_rgba(49,48,48,0.18)] ring-2 ring-white sm:h-28 sm:w-28">
                      <Image
                        src={story.photo2}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <p className="mt-8 text-center text-xs font-medium tracking-wide text-muted">
                    {story.designerCredit}
                  </p>
                </div>

                {/* Quote */}
                <div className="md:pl-2">
                  <span
                    className="mb-3 block text-4xl leading-none sm:text-5xl md:text-6xl"
                    style={{ color: story.accent }}
                    aria-hidden
                  >
                    “
                  </span>
                  <blockquote className="text-[1.05rem] leading-[1.65] text-ink/85 md:text-[1.2rem]">
                    {story.quote}
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3.5">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                      <Image
                        src={story.avatar}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{story.name}</p>
                      <p className="text-sm text-muted">{story.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <StatSlide story={story} />
            )}
          </div>

          {/* Indicators */}
          <div className="mt-12 flex items-center justify-center gap-2.5">
            {stories.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-label={`Story ${i + 1}`}
                onClick={() => jumpTo(i)}
                className="group relative h-2.5 overflow-hidden rounded-full transition-all"
                style={{
                  width: i === index ? 36 : 10,
                  backgroundColor:
                    i === index ? story.accent : "rgba(49,48,48,0.2)",
                }}
              >
                {i === index && !paused ? (
                  <span
                    className="story-progress absolute inset-y-0 left-0 bg-ink/30"
                    key={animKey + mode}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <p className="mt-7 text-center">
            <Link
              href="/designers/search"
              className="text-sm font-semibold text-ink underline-offset-4 transition-colors hover:underline"
            >
              Designers, join now →
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

function StatSlide({ story }: { story: Story }) {
  const faces = [
    story.avatar,
    story.photo1,
    story.photo2,
    "/clm/mosaic/reza.jpg",
    "/clm/mosaic/mad.jpg",
    "/clm/hero/avatar-kamilla.jpg",
  ];

  return (
    <div className="relative mx-auto flex min-h-[380px] max-w-3xl flex-col items-center justify-center px-2 text-center md:min-h-[420px]">
      {/* Accent glow + rings */}
      <div
        className="stat-glow pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:h-[340px] md:w-[340px]"
        style={{ backgroundColor: `${story.accent}33` }}
      />
      <div
        className="stat-ring pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-[280px] md:w-[280px]"
        style={{ borderColor: `${story.accent}40` }}
      />
      <div
        className="stat-ring-delay pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed md:h-[360px] md:w-[360px]"
        style={{ borderColor: `${story.accent}28` }}
      />

      {/* Floating face orbit for connections / shared visual */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {faces.map((src, i) => {
          const angle = (i / faces.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 148;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.72;
          return (
            <div
              key={src + i}
              className="stat-orbit absolute left-1/2 top-1/2 h-11 w-11 overflow-hidden rounded-full shadow-lg ring-2 ring-white"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                animationDelay: `${i * 0.25}s`,
              }}
            >
              <Image src={src} alt="" fill sizes="44px" className="object-cover" />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 rounded-3xl border border-white/60 bg-white/75 px-6 py-10 shadow-[0_20px_50px_rgba(49,48,48,0.08)] backdrop-blur-md md:px-12 md:py-12">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
          style={{ backgroundColor: story.accent }}
        >
          <StatIcon kind={story.statKind} />
          Live community
        </span>

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink/75 md:text-lg">
          {story.statLabel}
        </p>

        <p
          className="mt-7 text-4xl font-semibold tracking-tight tabular-nums drop-shadow-sm sm:text-5xl md:text-7xl"
          style={{ color: story.accent }}
        >
          <AnimatedStat value={story.statValue} />
        </p>
        <p className="mt-2 text-lg font-semibold capitalize text-ink">
          {story.statSuffix}
        </p>
        <p className="mt-3 text-sm text-muted">{story.statHint}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {story.statKind === "designs" && (
            <>
              <Chip>Every 2 seconds</Chip>
              <Chip>Global creatives</Chip>
              <Chip>Always shipping</Chip>
            </>
          )}
          {story.statKind === "connections" && (
            <>
              <Chip>Clients ↔ designers</Chip>
              <Chip>Real collaborations</Chip>
              <Chip>Trusted matches</Chip>
            </>
          )}
          {story.statKind === "countries" && (
            <>
              <Chip>192 countries</Chip>
              <Chip>Local insight</Chip>
              <Chip>Global taste</Chip>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink/80 shadow-sm">
      {children}
    </span>
  );
}

function StatIcon({ kind }: { kind: Story["statKind"] }) {
  if (kind === "designs") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.6 5.7 20.8 8 13.6 2 9.2h7.6L12 2z" />
      </svg>
    );
  }
  if (kind === "countries") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 19c1-3 3-4.5 4-4.5S11 16 12 19M12 19c1-3 3-4.5 4-4.5S19 16 20 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AnimatedStat({ value }: { value: string }) {
  const numeric = value.replace(/,/g, "");
  const isNum = /^\d+$/.test(numeric);
  const [display, setDisplay] = useState(isNum ? "0" : value);

  useEffect(() => {
    if (!isNum) {
      setDisplay(value);
      return;
    }
    const target = parseInt(numeric, 10);
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      setDisplay(current.toLocaleString("en-US"));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isNum, numeric]);

  return <>{display}</>;
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      {dir === "left" ? (
        <path
          d="M11 3.5L5.5 9 11 14.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7 3.5L12.5 9 7 14.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
