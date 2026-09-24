"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  designerBrowseIndustries,
  designerBrowseSections,
  designerCategoryTree,
  designerCertifications,
  designerHeroImage,
  designerLanguages,
  designerLevels,
  designerNeedChips,
  designers,
  filterDesigners,
  getDesignerById,
  levelLabel,
  type DesignerLevel,
  type DesignerProfile,
} from "@/data/designers";
import { safeDesignerImage } from "@/lib/designer-media";

function LevelBadge({ level }: { level: DesignerLevel }) {
  return (
    <span className="inline-block rounded border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/80">
      {levelLabel(level)}
    </span>
  );
}

function FeaturedCard({ d }: { d: DesignerProfile }) {
  const work = d.samples[0] || d.image;
  const alt = d.sampleAlts?.[0] || d.specialty;
  return (
    <Link
      href={`/designers/${d.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-paper-soft">
          <Image src={safeDesignerImage(d.avatar, d.image)} alt="" fill sizes="40px" className="object-cover" />
          {d.online ? (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green" />
          ) : null}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{d.name}</p>
          <div className="mt-0.5">
            <LevelBadge level={d.level} />
          </div>
        </div>
      </div>
      <div className="relative aspect-square bg-paper-soft">
        <Image
          src={work}
          alt={alt}
          fill
          sizes="(max-width:768px) 50vw, 280px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}

function ResultRow({ d }: { d: DesignerProfile }) {
  return (
    <Link
      href={`/designers/${d.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-paper-soft">
          <Image src={safeDesignerImage(d.avatar, d.image)} alt="" fill sizes="56px" className="object-cover" />
          {d.online ? (
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green" />
          ) : null}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{d.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <LevelBadge level={d.level} />
            <span className="text-xs text-muted">
              {d.location}, {d.country}
            </span>
          </div>
        </div>
      </div>
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-2 sm:max-w-none sm:w-[320px]">
        {d.samples.slice(0, 3).map((src, i) => (
          <div
            key={src + i}
            className="relative aspect-square overflow-hidden rounded-lg bg-paper-soft"
          >
            <Image
              src={src}
              alt={d.sampleAlts?.[i] || ""}
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </Link>
  );
}

export function DesignerSearch({
  initialSkill = "all",
}: {
  initialSkill?: string;
}) {
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState(initialSkill);
  const [level, setLevel] = useState<DesignerLevel | "all">("all");
  const [industry, setIndustry] = useState("all");
  const [language, setLanguage] = useState("all");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    "logo-identity": true,
  });
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setSkill(initialSkill || "all");
  }, [initialSkill]);

  useEffect(() => {
    setVisibleCount(24);
  }, [q, skill, level, industry, language]);

  const browsing =
    skill === "all" &&
    level === "all" &&
    industry === "all" &&
    language === "all" &&
    !q.trim();

  const results = useMemo(
    () =>
      filterDesigners({
        q,
        skill,
        level,
        industry,
        language,
        onlineOnly: skill === "online" ? true : undefined,
      }),
    [q, skill, level, industry, language],
  );

  const industryOptions = showAllIndustries
    ? designerBrowseIndustries
    : designerBrowseIndustries.slice(0, 5);

  function clearFilters() {
    setQ("");
    setSkill("all");
    setLevel("all");
    setIndustry("all");
    setLanguage("all");
  }

  const activeCount = [
    skill !== "all",
    level !== "all",
    industry !== "all",
    language !== "all",
    q.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div>
      {/* What do you need designed? */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-ink">
          What do you need designed?
        </p>
        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-2">
          {designerNeedChips.map((chip) => {
            const active = skill === chip.skill;
            return (
              <button
                key={chip.skill}
                type="button"
                onClick={() => setSkill(active ? "all" : chip.skill)}
                className={`flex min-w-[112px] shrink-0 flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition sm:min-w-[140px] ${
                  active
                    ? "border-ink bg-ink !text-white"
                    : "border-line bg-white text-ink hover:border-ink/30"
                }`}
              >
                <span
                  className={`marketing-icon marketing-icon--${chip.icon} !text-[28px] before:!text-[28px] ${
                    active ? "brightness-0 invert" : ""
                  }`}
                  aria-hidden
                />
                <span className="text-sm font-medium leading-snug">
                  {chip.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOpenCats((s) => {
                const allOpen = Object.fromEntries(
                  designerCategoryTree.map((g) => [g.id, true]),
                );
                return allOpen;
              });
              document
                .querySelector("aside")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex min-w-[100px] shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-paper-soft px-4 py-3 text-sm font-semibold text-ink hover:border-ink/40"
          >
            See all
          </button>
        </div>
      </div>

      {/* Search */}
      <label className="relative mb-8 block">
        <span className="sr-only">Search keywords</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          ⌕
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="eg. retro, minimal, bear, mystery"
          className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-ink"
        />
      </label>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters — 99d sidebar */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Categories</h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-coral hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="space-y-1">
              {designerCategoryTree.map((group) => {
                const open = openCats[group.id];
                return (
                  <div key={group.id} className="border-b border-line/70 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCats((s) => ({ ...s, [group.id]: !open }))
                      }
                      className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-ink"
                    >
                      {group.label}
                      <span className="text-muted">{open ? "▴" : "▾"}</span>
                    </button>
                    {open ? (
                      <div className="space-y-1 pb-2 pl-1">
                        {group.children.map((child) => (
                          <label
                            key={child.id}
                            className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink hover:bg-paper-soft"
                          >
                            <input
                              type="checkbox"
                              checked={skill === child.id}
                              onChange={() =>
                                setSkill(skill === child.id ? "all" : child.id)
                              }
                              className="h-4 w-4 shrink-0 rounded border-line"
                            />
                            <span className="min-w-0 truncate">{child.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-ink">Industries</h2>
            <div className="space-y-1">
              {industryOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink hover:bg-paper-soft"
                >
                  <input
                    type="checkbox"
                    checked={industry === opt.id}
                    onChange={() =>
                      setIndustry(industry === opt.id ? "all" : opt.id)
                    }
                    className="h-4 w-4 shrink-0 rounded border-line"
                  />
                  <span className="min-w-0 truncate">{opt.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAllIndustries((v) => !v)}
              className="mt-2 text-sm text-muted underline underline-offset-2 hover:text-ink"
            >
              {showAllIndustries ? "Show less" : "Show more"}
            </button>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-ink">Designer level</h2>
            <div className="space-y-1">
              {designerLevels
                .filter((l) => l.id !== "all")
                .map((l) => (
                  <label
                    key={l.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink hover:bg-paper-soft"
                  >
                    <input
                      type="checkbox"
                      checked={level === l.id}
                      onChange={() =>
                        setLevel(level === l.id ? "all" : (l.id as DesignerLevel))
                      }
                      className="h-4 w-4 rounded border-line"
                    />
                    {l.label}
                  </label>
                ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-ink">Languages</h2>
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {designerLanguages.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-ink hover:bg-paper-soft"
                >
                  <input
                    type="checkbox"
                    checked={language === opt.id}
                    onChange={() =>
                      setLanguage(language === opt.id ? "all" : opt.id)
                    }
                    className="h-4 w-4 rounded border-line"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-ink">Certifications</h2>
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {designerCertifications.map((opt) => (
                <div
                  key={opt.id}
                  className="rounded-md px-1 py-1.5 text-sm text-muted"
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Results / featured */}
        <div>
          {browsing ? (
            <div className="space-y-12">
              {designerBrowseSections.map((section) => {
                const items = section.designerIds
                  .map((id) => getDesignerById(id))
                  .filter(Boolean) as DesignerProfile[];
                if (!items.length) return null;
                return (
                  <section key={section.title}>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                      <h2 className="text-xl font-bold text-ink md:text-2xl">
                        {section.title}
                      </h2>
                      {section.skill ? (
                        <button
                          type="button"
                          onClick={() => setSkill(section.skill)}
                          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
                        >
                          See all results →
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((d) => (
                        <FeaturedCard key={d.id} d={d} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">
                    {results.length.toLocaleString()}
                  </span>{" "}
                  designer{results.length === 1 ? "" : "s"} found
                  {skill !== "all" && skill !== "online" && skill !== "minimal"
                    ? ` for ${skill.replace(/-/g, " ")}`
                    : ""}
                </p>
                <p className="text-xs text-muted">
                  from {designers.length} profiles imported from Creative Logo Makers
                </p>
              </div>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-line bg-paper-soft px-6 py-16 text-center">
                  <p className="text-lg font-semibold text-ink">
                    No designers match
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-coral underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.slice(0, visibleCount).map((d) => (
                    <ResultRow key={d.id} d={d} />
                  ))}
                  {visibleCount < results.length ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((n) =>
                          Math.min(n + 24, results.length),
                        )
                      }
                      className="mt-4 w-full rounded-full border border-line bg-white py-3 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-paper-soft"
                    >
                      Load more ({results.length - visibleCount} remaining)
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

