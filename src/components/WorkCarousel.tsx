"use client";

import Image from "next/image";
import Link from "next/link";
import { heroSlides } from "@/data/content";

export function WorkCarousel() {
  const items = [...heroSlides, ...heroSlides, ...heroSlides];

  return (
    <section className="overflow-hidden border-y border-line bg-white py-8">
      <div className="mb-4 px-5 text-center text-sm text-muted md:px-8">
        Logos, websites, book covers & more…
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee-track px-4">
          {items.map((item, i) => (
            <Link
              key={`${item.brand}-${i}`}
              href="/inspiration"
              className="card-lift relative h-40 w-64 shrink-0 overflow-hidden rounded-xl border border-line bg-paper-soft"
            >
              <Image
                src={item.main}
                alt={item.brand}
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-3">
                <p className="text-xs font-semibold text-white">{item.brand}</p>
                <p className="text-[11px] text-white/80">{item.type}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
