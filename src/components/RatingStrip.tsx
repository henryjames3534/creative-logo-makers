import Link from "next/link";
import { brand } from "@/data/site";

const TP_GREEN = "#00B67A";

/** Trustpilot-inspired rating strip */
export function RatingStrip() {
  return (
    <section className="relative overflow-hidden border-y border-line py-12 md:py-14">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 182, 122, 0.12), transparent 60%),
            linear-gradient(180deg, #ffffff 0%, #f4fbf8 50%, #ffffff 100%)
          `,
        }}
      />

      <div className="container-clm relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00B67A]/25 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
            <TrustpilotMark />
            <span className="text-xs font-semibold tracking-wide text-[#191919]">
              Trustpilot
            </span>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-[#191919] md:text-3xl">
            Excellent
          </p>

          <div className="mt-4 flex items-center gap-1.5" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] shadow-sm md:h-10 md:w-10"
                style={{ backgroundColor: TP_GREEN }}
              >
                <StarIcon />
              </span>
            ))}
          </div>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#4b4b4b] md:text-base">
            Folks think we&apos;re pretty rad. We&apos;re rated{" "}
            <Link
              href="/inspiration"
              className="font-bold text-[#191919] underline decoration-[#00B67A]/40 underline-offset-2 hover:decoration-[#00B67A]"
            >
              {brand.rating}
            </Link>{" "}
            from{" "}
            <span className="font-semibold text-[#191919]">
              {brand.reviews}
            </span>{" "}
            customer reviews.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TP_GREEN }}
              />
              Based on verified reviews
            </span>
            <Link
              href="/inspiration"
              className="font-medium text-[#191919] underline-offset-2 hover:underline"
            >
              Read reviews →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.4 6.5L12 16.9 5.99 20.3l1.4-6.5L2.5 9.3l6.6-.7L12 2.5z"
      />
    </svg>
  );
}

function TrustpilotMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="4" fill={TP_GREEN} />
      <path
        fill="#fff"
        d="M12 4.2l1.85 4.1 4.45.45-3.35 3.05.95 4.4L12 14.2l-3.9 1.95.95-4.4-3.35-3.05 4.45-.45L12 4.2z"
      />
    </svg>
  );
}
