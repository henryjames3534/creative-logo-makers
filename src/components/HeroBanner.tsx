"use client";

import Image from "next/image";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Section";
import { clm } from "@/data/clm-assets";
import {
  filterSuggestions,
  popularSearchLinks,
  resolveSearch,
  type SearchSuggestion,
} from "@/data/search";

type HeroSlide = {
  brand: string;
  credit: string;
  avatar: string;
  accent: string;
  layers: { src: string; className: string; sizes: string }[];
};

const slides: HeroSlide[] = [
  {
    brand: "Little Danube",
    credit: "Branding by Kamilla Oblakova",
    avatar: clm.hero.danube.avatar,
    accent: "#125867",
    layers: [
      {
        src: clm.hero.danube.bg,
        className: "absolute left-[8%] top-[6%] h-[55%] w-[55%] object-contain",
        sizes: "280px",
      },
      {
        src: clm.hero.danube.main,
        className:
          "absolute right-0 top-[4%] h-[88%] w-[68%] rounded-[1.25rem] object-cover shadow-xl",
        sizes: "420px",
      },
      {
        src: clm.hero.danube.packaging,
        className:
          "absolute bottom-[2%] left-0 h-[72%] w-[48%] object-contain drop-shadow-xl",
        sizes: "280px",
      },
      {
        src: clm.hero.danube.logo,
        className:
          "absolute left-[38%] top-[2%] h-[22%] w-[22%] rounded-full object-contain shadow-md",
        sizes: "100px",
      },
    ],
  },
  {
    brand: "Vegan Jerky Co",
    credit: "Packaging by Mj.vass",
    avatar: clm.hero.vegan.avatar,
    accent: "#fe5f50",
    layers: [
      {
        src: clm.hero.vegan.bg,
        className: "absolute left-0 top-[10%] h-[40%] w-[90%] object-contain",
        sizes: "400px",
      },
      {
        src: clm.hero.vegan.main,
        className:
          "absolute right-0 top-[8%] h-[80%] w-[62%] rounded-[1.25rem] object-cover shadow-xl",
        sizes: "400px",
      },
      {
        src: clm.hero.vegan.packaging,
        className:
          "absolute bottom-0 left-[2%] h-[78%] w-[46%] object-contain drop-shadow-xl",
        sizes: "280px",
      },
    ],
  },
  {
    brand: "Feel Good Tea Co.",
    credit: "Brand Identity by Raveart",
    avatar: clm.hero.tea.avatar,
    accent: "#f9f57b",
    layers: [
      {
        src: clm.hero.tea.main,
        className:
          "absolute right-0 top-[4%] h-[88%] w-[68%] rounded-[1.25rem] object-cover shadow-xl",
        sizes: "420px",
      },
      {
        src: clm.hero.tea.cup,
        className:
          "absolute bottom-[4%] left-0 h-[78%] w-[42%] object-contain drop-shadow-xl",
        sizes: "260px",
      },
      {
        src: clm.hero.tea.card,
        className:
          "absolute bottom-[8%] right-[4%] h-[32%] w-[48%] object-contain drop-shadow-lg",
        sizes: "240px",
      },
      {
        src: clm.hero.tea.logo,
        className:
          "absolute left-[42%] top-[6%] h-[20%] w-[20%] rounded-full object-contain shadow-md",
        sizes: "90px",
      },
    ],
  },
  {
    brand: "The Studio Chicago",
    credit: "Merchandise by illusive trust",
    avatar: clm.hero.studio.avatar,
    accent: "#1b45e3",
    layers: [
      {
        src: clm.hero.studio.art1,
        className: "absolute left-[4%] top-[4%] h-[28%] w-[28%] object-contain",
        sizes: "140px",
      },
      {
        src: clm.hero.studio.art2,
        className: "absolute right-[2%] top-[8%] h-[24%] w-[42%] object-contain",
        sizes: "200px",
      },
      {
        src: clm.hero.studio.main,
        className:
          "absolute right-[4%] top-[18%] h-[72%] w-[58%] rounded-[1.25rem] object-cover shadow-xl",
        sizes: "360px",
      },
      {
        src: clm.hero.studio.shirt,
        className:
          "absolute bottom-0 left-0 h-[78%] w-[48%] object-contain drop-shadow-xl",
        sizes: "280px",
      },
    ],
  },
];

export function HeroBanner() {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const suggestions = filterSuggestions(query, 6);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setFade(true);
      }, 280);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const slide = slides[index];

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const picked = suggestions[activeIdx];
    if (open && picked && query.trim()) {
      go(picked.href);
      return;
    }
    go(resolveSearch(query));
  }

  function pickSuggestion(s: SearchSuggestion) {
    setQuery(s.label);
    go(s.href);
  }

  function pickPopular(label: string, href: string) {
    setQuery(label);
    go(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function goTo(i: number) {
    setFade(false);
    setTimeout(() => {
      setIndex(i);
      setFade(true);
    }, 200);
  }

  return (
    <section className="relative overflow-hidden bg-white pb-14 pt-8 md:pb-20 md:pt-10">
      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className={`relative aspect-[5/4] transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.layers.map((layer, layerIdx) => (
                <Image
                  key={layer.src}
                  src={layer.src}
                  alt=""
                  width={600}
                  height={600}
                  priority={index === 0 && layerIdx === 0}
                  loading={index === 0 && layerIdx === 0 ? "eager" : "lazy"}
                  quality={layerIdx === 0 ? 75 : 65}
                  sizes={layer.sizes}
                  className={layer.className}
                />
              ))}
              <div
                className="absolute right-[4%] top-[8%] z-30 flex max-w-[min(200px,55%)] items-center gap-2 rounded-full px-2.5 py-1.5 shadow-lg sm:max-w-[250px] sm:px-3 sm:py-2"
                style={{ backgroundColor: slide.accent }}
              >
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/40">
                  <Image
                    src={slide.avatar}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
                <span
                  className={`line-clamp-2 text-[11px] font-medium leading-snug sm:text-xs ${
                    slide.accent === "#f9f57b" ? "text-ink" : "text-white"
                  }`}
                >
                  {slide.credit}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 lg:justify-start">
              {slides.map((s, i) => (
                <button
                  key={s.brand}
                  type="button"
                  aria-label={`Show ${s.brand}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-ink"
                      : "w-2.5 bg-ink/25 hover:bg-ink/50"
                  }`}
                />
              ))}
            </div>
            <p
              className={`mt-2 text-center text-sm text-muted transition-opacity duration-300 lg:text-left ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              Created for{" "}
              <span className="font-semibold text-ink">{slide.brand}</span>
            </p>
          </div>

          <div className="lg:pl-2">
            <h1 className="max-w-xl text-3xl font-medium leading-[1.05] tracking-tight text-hero sm:text-[2.6rem] md:text-6xl lg:text-[4.6rem]">
              Grow with great design
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/80 sm:mt-5 sm:text-[17px]">
              No matter what your business needs, we can connect you with a
              creative expert to make your business look and feel professional.
              Because good design makes great business.
            </p>

            <div ref={wrapRef} className="relative mt-8 max-w-xl">
              <form
                onSubmit={onSearch}
                className="hero-search group flex flex-col overflow-hidden rounded-full border border-line bg-white shadow-[0_8px_28px_rgba(49,48,48,0.08)] transition-[border-color,box-shadow] focus-within:border-hero focus-within:shadow-[0_10px_32px_rgba(131,70,146,0.18)] sm:flex-row sm:items-stretch"
                role="search"
              >
                <label className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted transition-colors group-focus-within:text-hero">
                    <SearchIcon />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setOpen(true);
                      setActiveIdx(0);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="What do you need designed?"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      open && suggestions[activeIdx]
                        ? `${listId}-${activeIdx}`
                        : undefined
                    }
                    className="w-full border-0 bg-transparent py-4 pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-muted"
                  />
                </label>
                <button
                  type="submit"
                  className="focus-ring m-1.5 shrink-0 rounded-full bg-cta px-7 py-3 text-sm font-semibold !text-white transition-colors hover:bg-cta-hover sm:m-1.5"
                >
                  Get a design
                </button>
              </form>

              {open && suggestions.length > 0 ? (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_16px_40px_rgba(49,48,48,0.14)]"
                >
                  {suggestions.map((s, i) => (
                    <li key={s.href + s.label} role="option" aria-selected={i === activeIdx}>
                      <button
                        type="button"
                        id={`${listId}-${i}`}
                        onMouseEnter={() => setActiveIdx(i)}
                        onClick={() => pickSuggestion(s)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                          i === activeIdx
                            ? "bg-hero/10 text-ink"
                            : "text-ink hover:bg-paper-soft"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft text-muted">
                          <SearchIcon />
                        </span>
                        <span className="font-medium">{s.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-medium text-muted">Popular:</span>
              {popularSearchLinks.map((s) => {
                const active =
                  query.toLowerCase() === s.query.toLowerCase() ||
                  query.toLowerCase() === s.label.toLowerCase();
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => pickPopular(s.query, s.href)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm transition-all ${
                      active
                        ? "bg-hero !text-white shadow-md ring-2 ring-hero/25"
                        : "border border-line bg-paper-soft text-ink hover:-translate-y-0.5 hover:border-hero/30 hover:bg-white hover:text-hero hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? "bg-white" : "bg-hero"
                      }`}
                      aria-hidden
                    />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
