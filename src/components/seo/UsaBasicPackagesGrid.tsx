import Link from "next/link";
import { Button } from "@/components/Button";
import { categories, type Category } from "@/data/categories";
import { categoryLaunchHref, categoryDetailsHref } from "@/data/serviceRoutes";
import { getContestPackages, PACKAGE_DISCOUNT_PERCENT } from "@/data/packages";

type Props = {
  /** Highlight this category’s Bronze package first */
  highlightSlug?: string;
  /** How many category bronze cards before browse more */
  limit?: number;
};

function bronzeFor(cat: Category) {
  const packs = getContestPackages(cat.slug);
  return packs.find((p) => p.id === "bronze") ?? packs[0];
}

/** Basic (Bronze) package cards across categories + browse more. */
export function UsaBasicPackagesGrid({
  highlightSlug = "logo-design",
  limit = 12,
}: Props) {
  const highlighted =
    categories.find((c) => c.slug === highlightSlug) ??
    categories.find((c) => c.slug === "logo-design")!;

  const rest = categories
    .filter((c) => c.slug !== highlighted.slug)
    .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));

  const shown = [highlighted, ...rest].slice(0, limit);

  return (
    <section className="border-y border-line bg-paper-soft py-14">
      <div className="container-clm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
              Packages · {PACKAGE_DISCOUNT_PERCENT}% off
            </p>
            <h2 className="mt-2 text-2xl font-medium text-ink md:text-3xl">
              Basic (Bronze) packages by category
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-ink/70">
              Every category below shows the starter Bronze contest package —
              same sitewide {PACKAGE_DISCOUNT_PERCENT}% off. Open any card to
              launch, or browse the full catalog.
            </p>
          </div>
          <span className="inline-flex self-start rounded-full bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            {PACKAGE_DISCOUNT_PERCENT}% off packages
          </span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((cat) => {
            const bronze = bronzeFor(cat);
            const isHit = cat.slug === highlighted.slug;
            return (
              <article
                key={cat.slug}
                className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                  isHit ? "border-ink ring-2 ring-ink/10" : "border-line"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    {cat.shortTitle}
                  </p>
                  {isHit && (
                    <span className="text-[10px] font-bold uppercase text-green">
                      Best match
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-ink">
                  {bronze.name} · {cat.productName}
                </h3>
                <p className="mt-1 text-xs text-muted">{bronze.blurb}</p>
                <div className="mt-4">
                  {bronze.compareAtPrice && (
                    <p className="text-sm text-muted line-through">
                      {bronze.compareAtPrice}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-ink">
                    {bronze.price}
                    <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[0.12em] text-green">
                      {PACKAGE_DISCOUNT_PERCENT}% off
                    </span>
                  </p>
                </div>
                <ul className="mt-4 flex-1 space-y-1.5 text-xs text-ink/70">
                  {bronze.features.slice(0, 4).map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-col gap-2">
                  <Button
                    href={categoryLaunchHref(cat, "bronze")}
                    variant="primary"
                    className="w-full text-center text-[11px]"
                  >
                    Get this package
                  </Button>
                  <Link
                    href={categoryDetailsHref(cat)}
                    className="text-center text-xs font-semibold text-ink underline"
                  >
                    View all tiers
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/categories" variant="primary">
            Browse more packages
          </Button>
          <Button href="/pricing" variant="secondary">
            Full pricing table
          </Button>
        </div>
      </div>
    </section>
  );
}
