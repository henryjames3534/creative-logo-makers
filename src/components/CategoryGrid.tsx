import Link from "next/link";
import { LocalizedFromPrice } from "@/components/locale/LocalizedPrice";
import type { Category } from "@/data/categories";
import { categories } from "@/data/categories";
import { categoryDetailsHref } from "@/data/serviceRoutes";

export function CategoryGrid({
  limit,
  items,
}: {
  limit?: number;
  items?: Category[];
}) {
  const list = items ?? (limit ? categories.slice(0, limit) : categories);

  return (
    <div className="grid grid-cols-1 border border-[#dad9d7] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((cat) => (
        <Link
          key={cat.slug}
          href={categoryDetailsHref(cat)}
          className="group flex flex-col border-b border-r border-[#dad9d7] bg-white p-5 transition-colors hover:bg-[#faf9f7]"
        >
          <span
            className={`marketing-icon marketing-icon--large marketing-icon--${cat.icon}`}
            aria-hidden
          />
          <h3 className="mt-3 font-semibold text-ink transition-colors group-hover:text-hero">
            {cat.shortTitle}
          </h3>
          <p className="mt-1 text-sm text-muted">
            <LocalizedFromPrice amount={cat.startingPrice} prefix="from" />
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
