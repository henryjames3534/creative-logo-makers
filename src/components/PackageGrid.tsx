import Link from "next/link";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { PackageTier } from "@/data/packages";
import { categoryLaunchHref } from "@/data/serviceRoutes";

export function PackageGrid({
  packages,
  ctaHref,
  categorySlug,
}: {
  packages: PackageTier[];
  ctaHref?: string;
  categorySlug?: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((pkg) => {
        const href = categorySlug
          ? categoryLaunchHref(categorySlug, pkg.id)
          : (ctaHref ?? "/get-started");
        return (
          <article
            key={pkg.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              pkg.featured
                ? "border-green bg-green/5 shadow-sm"
                : "border-line bg-white"
            }`}
          >
            {pkg.featured && (
              <span className="absolute -top-3 left-6 rounded-full bg-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider !text-white">
                Most popular
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {pkg.bestFor}
            </p>
            <h3 className="mt-2 text-xl font-bold text-ink">{pkg.name}</h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <p className="text-3xl font-bold text-ink">
                <LocalizedPrice value={pkg.price} />
              </p>
              {pkg.compareAtPrice ? (
                <>
                  <p className="text-base text-muted line-through">
                    <LocalizedPrice value={pkg.compareAtPrice} />
                  </p>
                  <span className="rounded bg-coral/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral">
                    50% off
                  </span>
                </>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{pkg.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {pkg.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-ink/80">
                  <span className="text-green">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={href}
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                pkg.featured
                  ? "bg-cta !text-white hover:bg-cta-hover"
                  : "border border-line bg-paper-soft !text-ink hover:border-ink/30"
              }`}
            >
              Select {pkg.name}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
