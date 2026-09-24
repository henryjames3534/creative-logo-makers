"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  categories,
  categoryBrowseGroups,
  type Category,
  type CategoryGroup,
} from "@/data/categories";
import { categoryDetailsHref } from "@/data/serviceRoutes";
import { LocalizedFromPrice } from "@/components/locale/LocalizedPrice";

function MarketingIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`marketing-icon marketing-icon--large marketing-icon--${name} ${className}`}
      aria-hidden
    />
  );
}

function CategoryTile({ cat }: { cat: Category }) {
  return (
    <Link
      href={categoryDetailsHref(cat)}
      className="group flex flex-col border-b border-r border-[#dad9d7] bg-white p-5 transition-colors hover:bg-[#faf9f7] md:p-6"
    >
      <div className="flex items-start gap-1">
        <div className="shrink-0 text-[#313030]">
          <MarketingIcon name={cat.icon} />
        </div>
        {cat.save ? (
          <span className="ml-auto rounded bg-[#00a581] px-2 py-0.5 text-[11px] font-semibold !text-white">
            {cat.save}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink group-hover:text-hero">
        {cat.productName}
      </h3>
      <p className="mt-1 text-sm text-muted">
        <LocalizedFromPrice amount={cat.startingPrice} prefix="from" />
      </p>
      {cat.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-snug text-muted">
          {cat.description}
        </p>
      ) : null}
    </Link>
  );
}

export function CategoriesBrowse({
  initialGroup,
  initialQuery = "",
}: {
  initialGroup?: CategoryGroup;
  initialQuery?: string;
}) {
  const router = useRouter();
  const validGroup =
    initialGroup && categoryBrowseGroups.some((g) => g.group === initialGroup)
      ? initialGroup
      : "all";
  const [active, setActive] = useState<CategoryGroup | "all">(validGroup);
  const [query, setQuery] = useState(initialQuery);

  // Keep sidebar filter in sync when header/mega links change ?group=
  useEffect(() => {
    const next =
      initialGroup && categoryBrowseGroups.some((g) => g.group === initialGroup)
        ? initialGroup
        : "all";
    setActive(next);
  }, [initialGroup]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function selectGroup(group: CategoryGroup | "all") {
    setActive(group);
    setQuery("");
    if (group === "all") router.push("/categories", { scroll: false });
    else router.push(`/categories?group=${group}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      if (active !== "all" && c.group !== active) return false;
      if (!q) return true;
      return (
        c.productName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
      );
    });
  }, [active, query]);

  const byGroup = useMemo(() => {
    return categoryBrowseGroups
      .map((g) => ({
        ...g,
        items: filtered.filter((c) => c.group === g.group),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="bg-paper-soft">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What do you need designed?
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Browse every subcategory — same icon tiles as Creative Logo Makers. Pick one to
            see packages and launch a contest.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[260px_1fr]">
        {/* Parent menu */}
        <aside className="border-b border-line bg-[#ecebe8] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="p-3 md:p-4">
            <label className="sr-only" htmlFor="cat-search">
              Search categories
            </label>
            <input
              id="cat-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Logo, website, book..."
              className="mb-3 w-full rounded-md border border-[#dad9d7] bg-white px-3 py-2.5 text-sm text-ink outline-none ring-hero/30 placeholder:text-muted focus:ring-2"
            />

            <button
              type="button"
              onClick={() => selectGroup("all")}
                  className={`mb-2 flex w-full items-center gap-3 rounded-md border-[3px] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                active === "all"
                  ? "border-ink bg-white text-ink"
                  : "border-transparent bg-[#dad9d7] text-ink hover:bg-[#d0cfcb]"
              }`}
            >
              All categories
            </button>

            {categoryBrowseGroups.map((g) => {
              const isActive = active === g.group;
              return (
                <button
                  key={g.group}
                  type="button"
                  onClick={() => selectGroup(g.group)}
                  className={`mb-2 flex w-full items-center gap-3 rounded-md border-[3px] px-2 py-2 text-left transition-colors ${
                    isActive
                      ? "border-ink bg-white"
                      : "border-transparent bg-[#dad9d7] hover:bg-[#d0cfcb]"
                  }`}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                    <Image
                      src={`/clm/parent-categories/${g.parentPrefix}-01.png`}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-ink">
                    {g.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Subcategory tiles */}
        <div className="min-w-0 bg-white">
          {byGroup.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium text-ink">
                No categories match “{query}”
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-hero underline"
                onClick={() => {
                  setQuery("");
                  selectGroup("all");
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            byGroup.map((g) => (
              <section key={g.group} id={g.menuKey} className="scroll-mt-4">
                {(active === "all" || query.trim()) && (
                  <div className="border-b border-line px-5 py-4 md:px-6">
                    <h2 className="font-serif text-xl font-semibold text-ink">
                      {g.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">{g.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 border-l border-t border-[#dad9d7] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {g.items.map((cat) => (
                    <CategoryTile key={cat.slug} cat={cat} />
                  ))}
                </div>
              </section>
            ))
          )}
          <p className="border-t border-line px-5 py-4 text-sm text-muted md:px-6">
            Showing {filtered.length} categor
            {filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>
    </div>
  );
}
