"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { homeCategoryGroups } from "@/data/categories";
import { LocalizedFromPrice } from "@/components/locale/LocalizedPrice";
import { groupImages } from "@/data/media";

/** Creative Logo Makers: “Design for what you need” — single-row carousel */
export function CategoryStrip() {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  function scrollByDir(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-cat-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden py-12 md:py-14">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 70% at 8% 40%, rgba(18, 88, 103, 0.14), transparent 60%),
            radial-gradient(ellipse 45% 60% at 30% 80%, rgba(81, 175, 244, 0.16), transparent 55%),
            radial-gradient(ellipse 50% 65% at 55% 20%, rgba(131, 70, 146, 0.12), transparent 55%),
            radial-gradient(ellipse 45% 60% at 78% 70%, rgba(254, 180, 120, 0.22), transparent 55%),
            radial-gradient(ellipse 40% 50% at 95% 30%, rgba(254, 95, 80, 0.1), transparent 50%),
            linear-gradient(180deg, #f3f2f0 0%, #efece8 50%, #f3f2f0 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(49,48,48,0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="container-clm relative z-10">
        <div className="mb-7 flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="min-w-0 text-[1.65rem] font-medium tracking-tight text-ink md:text-[1.85rem]">
            Design for what you need
          </h2>
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/categories"
              className="text-[15px] font-medium text-ink underline-offset-4 hover:underline max-sm:text-sm"
            >
              View all design categories
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous categories"
                disabled={!canPrev}
                onClick={() => scrollByDir(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:bg-paper-soft disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next categories"
                disabled={!canNext}
                onClick={() => scrollByDir(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:bg-paper-soft disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scroller}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {homeCategoryGroups.map((g) => (
              <Link
                key={g.group}
                data-cat-card
                href={`/categories?group=${g.group}`}
                className="group w-[min(78vw,260px)] shrink-0 snap-start overflow-hidden rounded-xl bg-white/95 shadow-sm backdrop-blur-[2px] transition-shadow hover:shadow-md sm:w-[240px] lg:w-[220px] xl:w-[240px]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-white">
                  <Image
                    src={
                      groupImages[g.imageKey] ??
                      groupImages["logo-branding"]
                    }
                    alt={g.title}
                    fill
                    sizes="240px"
                    quality={85}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="px-3 py-3.5">
                  <h3 className="text-[15px] font-medium leading-snug text-ink">
                    {g.shortTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    <LocalizedFromPrice amount={g.startingPrice} />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile arrows */}
          <div className="mt-4 flex justify-center gap-2 sm:hidden">
            <button
              type="button"
              aria-label="Previous"
              disabled={!canPrev}
              onClick={() => scrollByDir(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white disabled:opacity-35"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={!canNext}
              onClick={() => scrollByDir(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white disabled:opacity-35"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
