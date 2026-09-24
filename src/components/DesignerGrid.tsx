import Image from "next/image";
import Link from "next/link";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { designers, levelLabel } from "@/data/designers";
import { designerStartingRate } from "@/lib/designer-rates";

/** Compact grid for projects / homepage embeds — never render the full catalog. */
export function DesignerGrid({ limit = 8 }: { limit?: number }) {
  const items = designers.slice(0, Math.min(limit, 48));

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((d) => (
        <article
          key={d.id}
          className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lg"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-paper-soft">
            <Image
              src={d.image}
              alt={d.name}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              quality={90}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold !text-white backdrop-blur-sm">
                  {levelLabel(d.level)}
                </span>
              </div>
            </div>
            {d.available ? (
              <span className="absolute left-3 top-3 rounded-full bg-green px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide !text-white shadow-sm">
                Available
              </span>
            ) : (
              <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide !text-white">
                Busy
              </span>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-bold text-ink">{d.name}</h3>
            <p className="mt-1 text-sm text-muted">{d.specialty}</p>
            <p className="mt-1 text-xs text-muted">
              {d.location}, {d.country}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">★ {d.rating}</span>
              <span className="text-muted">{d.projects} projects</span>
            </div>
            <Link
              href={`/designers/${d.id}`}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-cta py-2.5 text-sm font-semibold !text-white transition-colors hover:bg-cta-hover"
            >
              <LocalizedPrice value={designerStartingRate(d)} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
