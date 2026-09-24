import Image from "next/image";
import { testimonials } from "@/data/content";

export function Testimonials({ limit = 3 }: { limit?: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {testimonials.slice(0, limit).map((t) => (
        <blockquote
          key={t.name}
          className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative aspect-[16/10] bg-paper-soft">
            <Image
              src={t.projectImage ?? t.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              quality={90}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <p className="text-base leading-relaxed text-ink/90">
              “{t.quote}”
            </p>
            <footer className="mt-5">
              <p className="font-bold text-ink">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </footer>
          </div>
        </blockquote>
      ))}
    </div>
  );
}
