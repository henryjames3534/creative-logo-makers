import Link from "next/link";
import { nap, napAddressLine } from "@/data/nap";

/**
 * Consistent Name–Address–Phone block for city / location SEO pages.
 * Does not invent local street addresses — HQ NAP + service area only.
 */
export function NapBlock({
  serviceArea,
  className = "",
}: {
  /** e.g. "New York, NY" or "Texas" */
  serviceArea: string;
  className?: string;
}) {
  return (
    <aside
      className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}
      aria-label="Business contact information"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-faint">
        Business details (NAP)
      </p>
      <p className="mt-2 text-lg font-bold text-ink">{nap.name}</p>
      <p className="mt-1 text-sm text-muted">
        Serving {serviceArea} remotely · Headquarters below
      </p>
      <address className="mt-4 not-italic text-sm leading-relaxed text-ink/80">
        {napAddressLine()}
        <br />
        {nap.addressLocality}, {nap.addressRegion} {nap.postalCode}
        <br />
        {nap.addressCountryName}
      </address>
      <div className="mt-3 space-y-1 text-sm">
        <p>
          <Link
            href={`tel:${nap.phoneTel}`}
            className="font-semibold text-hero hover:underline"
          >
            {nap.phoneDisplay}
          </Link>
        </p>
        <p>
          <a
            href={`mailto:${nap.email}`}
            className="font-semibold text-ink hover:underline"
          >
            {nap.email}
          </a>
        </p>
        <p>
          <Link href="/contact" className="text-muted hover:text-hero">
            Contact page →
          </Link>
        </p>
      </div>
    </aside>
  );
}
