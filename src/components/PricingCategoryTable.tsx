"use client";

import Link from "next/link";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { categories } from "@/data/categories";
import { getContestPackages } from "@/data/packages";
import { categoryDetailsHref } from "@/data/serviceRoutes";

/** Client table so package prices follow visitor currency */
export function PricingCategoryTable() {
  return (
    <div className="scrollbar-none mt-10 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <p className="mb-2 text-xs text-muted sm:hidden">Swipe table →</p>
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-soft/80">
              <th className="px-5 py-3.5 font-semibold text-ink">Category</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Bronze</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Silver</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Gold</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Platinum</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const pkgs = getContestPackages(cat.slug);
              const byId = Object.fromEntries(pkgs.map((p) => [p.id, p.price]));
              return (
                <tr
                  key={cat.slug}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-5 py-4 font-semibold text-ink">
                    {cat.productName}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-ink/80">
                    {byId.bronze ? (
                      <LocalizedPrice value={byId.bronze} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-ink/80">
                    {byId.silver ? (
                      <LocalizedPrice value={byId.silver} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 tabular-nums font-semibold text-ink">
                    {byId.gold ? <LocalizedPrice value={byId.gold} /> : "—"}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-ink/80">
                    {byId.platinum ? (
                      <LocalizedPrice value={byId.platinum} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`${categoryDetailsHref(cat)}#pricing`}
                      className="text-sm font-semibold text-hero hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
