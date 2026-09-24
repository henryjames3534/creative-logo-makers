"use client";

import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { clm } from "@/data/clm-assets";

/** CTA band — weekend-lounging lady illustration animated */
export function CtaBand({
  title = "Ready to level up your look with a great design?",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-white py-10 md:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-cta-band text-white">
          {/* Soft sun glow behind the scene */}
          <div className="weekend-sun pointer-events-none absolute -right-10 top-[-20%] h-64 w-64 rounded-full bg-[#ffd56a]/25 blur-3xl md:h-80 md:w-80" />
          <div className="weekend-blob pointer-events-none absolute right-[10%] bottom-[-10%] h-40 w-40 rounded-full bg-[#ff7eb3]/20 blur-2xl" />

          <div className="grid items-center md:grid-cols-[1.15fr_1fr]">
            <div className="relative z-10 p-8 md:p-12 lg:p-14">
              <p className="mb-3 text-sm font-medium text-white/70">
                Weekend vibes · great design
              </p>
              <h2 className="max-w-md text-[1.85rem] font-medium leading-tight tracking-tight md:text-[2.35rem]">
                {title}
              </h2>
              <div className="mt-8">
                <Button
                  href="/categories"
                  variant="secondary"
                  className="!border-white !bg-white !text-ink hover:!bg-paper-soft hover:!text-ink"
                >
                  Browse design categories
                </Button>
              </div>
            </div>

            <div className="relative min-h-[220px] overflow-hidden md:min-h-[300px]">
              {/* Floating sparkles / weekend particles */}
              <span className="weekend-sparkle absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-white/90" />
              <span className="weekend-sparkle weekend-sparkle-delay absolute left-[28%] top-[12%] h-1.5 w-1.5 rounded-full bg-[#ffd56a]" />
              <span className="weekend-sparkle weekend-sparkle-delay-2 absolute right-[18%] top-[22%] h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="weekend-sparkle absolute right-[30%] top-[8%] h-2.5 w-2.5 rotate-45 bg-[#ffd56a]" />
              <span className="weekend-leaf absolute right-[8%] top-[12%] text-[#7dce82]">
                <LeafIcon />
              </span>

              {/* Water shimmer lines */}
              <div className="weekend-wave pointer-events-none absolute inset-x-[8%] bottom-[18%] h-8 opacity-40">
                <div className="weekend-wave-line h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="weekend-wave-line weekend-wave-line-2 mt-2 h-px w-[80%] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>

              {/* Sunglasses glint */}
              <div className="weekend-glint pointer-events-none absolute right-[38%] top-[36%] h-3 w-8 rotate-[-18deg] rounded-full bg-white/50 blur-[1px]" />

              {/* Lady illustration — float + gentle sway */}
              <div className="weekend-lady absolute inset-0">
                <Image
                  src={clm.ctaBanner}
                  alt="Illustration by Sasha Wolf — enjoying the weekend"
                  fill
                  sizes="40vw"
                  className="object-contain object-right-bottom md:object-cover md:object-right"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 3.5C12 4 6.5 8.5 6 15c2.5-1 5-1 7.2.2C17.5 10.5 19 6.5 17.5 3.5z" opacity=".9" />
      <path d="M6 15c1.5 3 4 5 7 5-1.5-2-2.5-4-3-6.5C8.5 14 7 14.5 6 15z" />
    </svg>
  );
}
