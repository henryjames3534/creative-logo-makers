"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import {
  levelLabel,
  skillLabel,
  type DesignerProfile,
} from "@/data/designers";
import {
  designerExperience,
  designerProjectPackages,
  designerSkillRates,
  designerStartingRate,
} from "@/lib/designer-rates";
import { categoryLaunchHref } from "@/data/serviceRoutes";
import {
  designerPublicRating,
  getApprovedReviewsForDesigner,
  onReviewsUpdated,
  type CrmReview,
} from "@/lib/crm-storage";
import { safeDesignerImage } from "@/lib/designer-media";

function LevelBadge({ level }: { level: DesignerProfile["level"] }) {
  return (
    <span className="inline-block rounded border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/80">
      {levelLabel(level)}
    </span>
  );
}

export function DesignerProfileView({
  designer: d,
  initialTab = "portfolio",
}: {
  designer: DesignerProfile;
  initialTab?: "portfolio" | "about" | "invite";
}) {
  const [tab, setTab] = useState<"portfolio" | "about" | "invite">(initialTab);
  const [skill, setSkill] = useState(d.skills[0] || "logo-design");
  const [approvedReviews, setApprovedReviews] = useState<CrmReview[]>([]);
  const exp = useMemo(() => designerExperience(d), [d]);
  const skillRates = useMemo(() => designerSkillRates(d), [d]);
  const packages = useMemo(
    () => designerProjectPackages(d, skill),
    [d, skill],
  );
  const cover = d.samples[0] || d.image;
  const rate = designerStartingRate(d);

  useEffect(() => {
    const load = () => setApprovedReviews(getApprovedReviewsForDesigner(d.id));
    load();
    return onReviewsUpdated(load);
  }, [d.id]);

  const publicStats = useMemo(
    () =>
      designerPublicRating(d.id, { rating: d.rating, reviews: d.reviews }),
    [d.id, d.rating, d.reviews, approvedReviews],
  );

  const starDisplay = "★".repeat(
    Math.min(5, Math.max(1, Math.round(publicStats.rating))),
  );

  return (
    <div>
      {/* Cover + identity — 99d profile header */}
      <div className="relative border-b border-line bg-paper-soft">
        <div className="relative h-48 w-full overflow-hidden md:h-64">
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <div className="container-clm relative -mt-10 flex flex-col gap-4 pb-4 md:-mt-12 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md md:h-24 md:w-24">
              <Image
                src={safeDesignerImage(d.avatar, d.image)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
              {d.online ? (
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green" />
              ) : null}
            </span>
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-ink md:text-3xl">{d.name}</h1>
              <div className="mt-1">
                <LevelBadge level={d.level} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-1">
            <Link
              href={`/contact?designer=${encodeURIComponent(d.handle)}`}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink/30"
            >
              Message
            </Link>
            <button
              type="button"
              onClick={() => setTab("invite")}
              className="rounded-full bg-cta px-5 py-2.5 text-sm font-semibold !text-white hover:bg-cta-hover"
            >
              Invite to work
            </button>
          </div>
        </div>

        <div className="container-clm flex flex-wrap items-center justify-between gap-3 border-t border-line">
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 scrollbar-none">
            {(
              [
                ["portfolio", "Portfolio"],
                ["about", "About"],
                ["invite", "Invite to work"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition sm:px-4 ${
                  tab === id
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="pb-2 text-sm font-semibold text-ink md:pb-0">
            <LocalizedPrice value={rate} />
          </p>
        </div>
      </div>

      <div className="container-clm py-10 md:py-12">
        {tab === "portfolio" ? (
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold !text-white">
                All categories
              </span>
              {d.skills.slice(0, 8).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink"
                >
                  {skillLabel(s)}
                </span>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {d.samples.map((src, i) => (
                <figure
                  key={src + i}
                  className="group overflow-hidden rounded-xl border border-line bg-white"
                >
                  <div className="relative aspect-square bg-paper-soft">
                    <Image
                      src={src}
                      alt={d.sampleAlts?.[i] || d.specialty}
                      fill
                      sizes="(max-width:768px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  {d.sampleAlts?.[i] ? (
                    <figcaption className="truncate px-3 py-2 text-xs text-muted">
                      {d.sampleAlts[i]}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "about" ? (
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-ink">About</h2>
            <div className="mt-6 text-center">
              <p className="text-2xl tracking-widest text-coral">{starDisplay}</p>
              <p className="mt-2 text-sm text-muted">
                <span className="font-semibold text-ink">
                  {publicStats.rating.toFixed(2)} stars
                </span>
                {" · "}
                <span className="underline underline-offset-2">
                  {publicStats.reviews} reviews
                </span>
              </p>
              <p className="mt-3 font-medium text-ink">{exp.tagline}</p>
              <p className="mt-2 text-sm text-muted">
                Country: {d.country}. {exp.memberSince}
              </p>
            </div>

            {approvedReviews.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
                  Client reviews
                </h3>
                <ul className="mt-4 space-y-3">
                  {approvedReviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-line bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="tracking-widest text-coral">
                          {"★".repeat(r.rating)}
                          <span className="text-ink/15">
                            {"★".repeat(5 - r.rating)}
                          </span>
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                          {r.categoryName ? ` · ${r.categoryName}` : ""}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink">
                        {r.body}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-muted">
                        — {r.customerName}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <h3 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">
              Experience
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {[
                [exp.contestsWon, "Contests won"],
                [exp.runnerUp, "Runner up"],
                [exp.oneToOne, "1-to-1 Projects"],
                [exp.repeatClients, "Repeat clients"],
                [exp.responseRate, "Responses within 24h"],
              ].map(([value, label]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-line bg-white px-3 py-4 text-center"
                >
                  <p className="text-2xl font-bold text-ink">{value}</p>
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">
              Skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-paper-soft px-3 py-1.5 text-sm text-ink"
                >
                  {skillLabel(s)}
                </span>
              ))}
            </div>

            <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted">
              Starting rates
            </h3>
            <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
              {skillRates.map((row) => (
                <div
                  key={row.skill}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="text-ink">{skillLabel(row.skill)}</span>
                  <span className="font-semibold text-ink">{row.from}</span>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted">
              Languages
            </h3>
            <p className="mt-2 text-sm text-ink">
              {d.languages
                .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
                .join(" · ")}
            </p>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setTab("invite")}
                className="rounded-full bg-cta px-6 py-3 text-sm font-semibold !text-white hover:bg-cta-hover"
              >
                Invite {d.name} to work — <LocalizedPrice value={rate} />
              </button>
            </div>
          </div>
        ) : null}

        {tab === "invite" ? (
          <div>
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold text-ink">
                Invite {d.name} to a 1-to-1 project
              </h2>
              <p className="mt-2 text-ink/70">
                Pick a design category — prices are based on Creative Logo Makers category
                rates for this designer&apos;s level ({levelLabel(d.level)}).
              </p>
            </div>

            <label className="mb-6 block max-w-md">
              <span className="text-xs font-semibold text-muted">
                What type of design do you need?
              </span>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
              >
                {skillRates.map((row) => (
                  <option key={row.skill} value={row.skill}>
                    {skillLabel(row.skill)} — {row.from}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 md:grid-cols-3">
              {packages.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    pkg.featured
                      ? "border-green bg-green/5"
                      : "border-line bg-white"
                  }`}
                >
                  {pkg.featured ? (
                    <span className="mb-2 text-[10px] font-bold uppercase tracking-wide text-green">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="text-lg font-bold text-ink">{pkg.name}</h3>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
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
                  <p className="mt-2 text-sm text-muted">{pkg.blurb}</p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-ink/80">
                        <span className="text-green">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={categoryLaunchHref(skill, pkg.id, {
                      designerId: d.id,
                      hireMode: "direct",
                    })}
                    className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                      pkg.featured
                        ? "bg-cta !text-white hover:bg-cta-hover"
                        : "border border-line bg-paper-soft text-ink hover:border-ink/30"
                    }`}
                  >
                    Continue with {d.name}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
