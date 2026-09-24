"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { LocalizedFromPrice, LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { Container } from "@/components/Section";
import {
  categories,
  categoryBrowseGroups,
  getCategory,
  getPopularCategories,
  type Category,
  type CategoryGroup,
} from "@/data/categories";
import { getDesignerByHandle } from "@/data/designers";
import { categoryImages, groupImages } from "@/data/media";
import { getContestPackages, type PackageTier } from "@/data/packages";
import { categoryDetailsHref, categoryLaunchHref } from "@/data/serviceRoutes";
import {
  designerProjectPackages,
  designerStartingRate,
} from "@/lib/designer-rates";

type Mode = "contest" | "project" | "studio";

function MarketingIcon({ name }: { name: string }) {
  return (
    <span
      className={`marketing-icon marketing-icon--${name} before:!text-[40px]`}
      aria-hidden
    />
  );
}

function PackageCard({
  pkg,
  href,
  selected,
  onSelect,
}: {
  pkg: PackageTier;
  href: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-ink bg-ink !text-white shadow-lg"
          : pkg.featured
            ? "border-green bg-green/5 hover:border-green"
            : "border-line bg-white hover:border-ink/25"
      }`}
    >
      {pkg.featured ? (
        <span
          className={`mb-2 text-[10px] font-bold uppercase tracking-wide ${
            selected ? "text-white/70" : "text-green"
          }`}
        >
          Most popular
        </span>
      ) : null}
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          selected ? "text-white/60" : "text-muted"
        }`}
      >
        {pkg.bestFor}
      </p>
      <h3 className="mt-1 text-lg font-bold">{pkg.name}</h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className="text-2xl font-bold">
          <LocalizedPrice value={pkg.price} />
        </p>
        {pkg.compareAtPrice ? (
          <p
            className={`text-sm line-through ${
              selected ? "text-white/50" : "text-muted"
            }`}
          >
            <LocalizedPrice value={pkg.compareAtPrice} />
          </p>
        ) : null}
        {pkg.compareAtPrice ? (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              selected ? "bg-white/20 text-white" : "bg-coral/15 text-coral"
            }`}
          >
            50% off
          </span>
        ) : null}
      </div>
      <p
        className={`mt-2 text-sm leading-snug ${
          selected ? "text-white/75" : "text-muted"
        }`}
      >
        {pkg.blurb}
      </p>
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className={`mt-5 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold ${
          selected
            ? "bg-white text-ink hover:bg-paper-soft"
            : "bg-cta !text-white hover:bg-cta-hover"
        }`}
      >
        Continue with {pkg.name}
      </Link>
    </button>
  );
}

export function GetStartedExperience({
  initialSkill,
  initialPackage,
  designerHandle,
}: {
  initialSkill?: string;
  initialPackage?: string;
  designerHandle?: string;
}) {
  const router = useRouter();
  const designer = designerHandle
    ? getDesignerByHandle(designerHandle)
    : undefined;

  const initialCat =
    (initialSkill && getCategory(initialSkill)) ||
    getPopularCategories()[0] ||
    categories[0];

  const [mode, setMode] = useState<Mode>(
    designer ? "project" : "contest",
  );
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<CategoryGroup | "all">("all");
  const [selected, setSelected] = useState<Category>(initialCat);
  const [pkgId, setPkgId] = useState(
    initialPackage || (designer ? "growth" : "gold"),
  );

  const packages = useMemo(
    () => getContestPackages(selected.slug),
    [selected.slug],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      if (group !== "all" && c.group !== group) return false;
      if (!q) return true;
      return (
        c.productName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
      );
    });
  }, [query, group]);

  const popular = getPopularCategories().slice(0, 8);

  function pickCategory(cat: Category) {
    startTransition(() => {
      setSelected(cat);
      setPkgId("gold");
    });
    document
      .getElementById("get-started-packages")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function continueLaunch() {
    if (mode === "studio") {
      router.push("/studio/talk-to-strategist");
      return;
    }
    if (mode === "project") {
      if (designer) {
        const dPkgs = designerProjectPackages(designer, selected.slug);
        const hirePkg =
          dPkgs.find((p) => p.id === pkgId)?.id ??
          dPkgs.find((p) => p.featured)?.id ??
          initialPackage ??
          "growth";
        router.push(
          categoryLaunchHref(selected.slug, hirePkg, {
            designerId: designer.id,
            hireMode: "direct",
          }),
        );
        return;
      }
      router.push(
        `/designers/search?skill=${encodeURIComponent(selected.slug)}`,
      );
      return;
    }
    router.push(categoryLaunchHref(selected.slug, pkgId));
  }

  const heroImage =
    categoryImages[selected.slug] ??
    groupImages[selected.group] ??
    categoryImages["logo-design"] ??
    "/clm/unique/svc-logo-mark.jpg";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-[#f3f1ec]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-hero/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-green/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative grid items-center gap-10 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-coral">
              Launch in minutes
            </p>
            <h1 className="mt-3 max-w-xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              What do you need designed?
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink/70">
              Pick how you want to work, choose a category, then lock a package
              — we&apos;ll walk you through a visual brief like Creative Logo Makers.
            </p>

            {/* Work modes */}
            <div className="mt-8 grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
              {(
                [
                  {
                    id: "contest" as const,
                    title: "Design contest",
                    price: "From $249",
                    blurb: "Dozens of concepts",
                  },
                  {
                    id: "project" as const,
                    title: "1-to-1 project",
                    price: "From $499",
                    blurb: "One specialist",
                  },
                  {
                    id: "studio" as const,
                    title: "Studio",
                    price: "Custom",
                    blurb: "Full branding",
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    mode === m.id
                      ? "border-ink bg-ink !text-white shadow-md"
                      : "border-line bg-white text-ink hover:border-ink/30"
                  }`}
                >
                  <p className="text-sm font-bold">{m.title}</p>
                  <p
                    className={`mt-1 text-xs ${
                      mode === m.id ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {m.blurb}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    <LocalizedPrice value={m.price} />
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-xl">
            <Image
              src={heroImage}
              alt={selected.productName}
              fill
              priority
              sizes="420px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
              <p className="text-xs font-semibold uppercase tracking-wide !text-white/70">
                Selected
              </p>
              <p className="text-lg font-bold !text-white">
                {selected.productName}
              </p>
              <p className="text-sm !text-white/80">
                <LocalizedFromPrice
                  amount={selected.startingPrice}
                  prefix="from"
                />
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Designer invite banner */}
      {designer ? (
        <section className="border-b border-line bg-ink">
          <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/20">
                <Image
                  src={designer.avatar}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <div>
                <p className="text-sm font-semibold !text-white">
                  Inviting {designer.name}
                </p>
                <p className="text-xs text-white/65">
                  {designerStartingRate(designer)} · {selected.productName} ·
                  1-to-1 project
                </p>
              </div>
            </div>
            <Button
              href={categoryLaunchHref(
                selected.slug,
                initialPackage ||
                  designerProjectPackages(designer, selected.slug).find(
                    (p) => p.featured,
                  )?.id ||
                  "growth",
                {
                  designerId: designer.id,
                  hireMode: "direct",
                },
              )}
              variant="primary"
            >
              Continue with {designer.name.split(" ")[0]}
            </Button>
          </Container>
        </section>
      ) : null}

      {/* How it works strip */}
      <section className="border-b border-line bg-white py-8">
        <Container>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Choose a path",
                d: "Contest, 1-to-1, or Studio — match the way you like to work.",
              },
              {
                n: "02",
                t: "Pick a category",
                d: "Logo, web, packaging, and 90+ skill sets from the catalog.",
              },
              {
                n: "03",
                t: "Select a package",
                d: "Bronze to Platinum pricing — clear deliverables, no surprises.",
              },
              {
                n: "04",
                t: "Complete the brief",
                d: "Visual quiz + references so designers nail your vibe.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-line bg-paper-soft/60 px-4 py-4"
              >
                <p className="text-[11px] font-bold tracking-[0.16em] text-coral">
                  {s.n}
                </p>
                <p className="mt-1 font-semibold text-ink">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Category picker */}
      <section className="py-12 md:py-16" id="choose-category">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink md:text-3xl">
                Choose a design category
              </h2>
              <p className="mt-2 max-w-xl text-muted">
                Search or filter by group — then lock a package below.
              </p>
            </div>
            <label className="relative block w-full md:max-w-sm">
              <span className="sr-only">Search categories</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search logo, packaging, app…"
                className="w-full rounded-full border border-line bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroup("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                group === "all"
                  ? "bg-ink !text-white"
                  : "border border-line bg-white text-ink hover:border-ink/30"
              }`}
            >
              All
            </button>
            {categoryBrowseGroups.map((g) => (
              <button
                key={g.group}
                type="button"
                onClick={() => setGroup(g.group)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  group === g.group
                    ? "bg-ink !text-white"
                    : "border border-line bg-white text-ink hover:border-ink/30"
                }`}
              >
                {g.shortTitle}
              </button>
            ))}
          </div>

          {/* Popular quick picks */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Popular right now
            </p>
            <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-2">
              {popular.map((cat) => {
                const active = selected.slug === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => pickCategory(cat)}
                    className={`flex min-w-[120px] shrink-0 flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition sm:min-w-[148px] ${
                      active
                        ? "border-ink bg-ink !text-white"
                        : "border-line bg-white hover:border-ink/30"
                    }`}
                  >
                    <MarketingIcon name={cat.icon} />
                    <span className="truncate text-sm font-semibold leading-snug">
                      {cat.productName}
                    </span>
                    <span
                      className={`text-xs ${
                        active ? "text-white/70" : "text-muted"
                      }`}
                    >
                      <LocalizedFromPrice
                        amount={cat.startingPrice}
                        prefix="from"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((cat) => {
              const active = selected.slug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => pickCategory(cat)}
                  className={`group flex gap-3 rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-ink bg-paper-soft shadow-sm ring-1 ring-ink"
                      : "border-line bg-white hover:border-ink/25 hover:shadow-sm"
                  }`}
                >
                  <span className="shrink-0 text-ink">
                    <MarketingIcon name={cat.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-start gap-2">
                      <span className="truncate font-semibold text-ink">
                        {cat.productName}
                      </span>
                      {cat.save ? (
                        <span className="rounded bg-green px-1.5 py-0.5 text-[10px] font-bold !text-white">
                          {cat.save}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      <LocalizedFromPrice
                        amount={cat.startingPrice}
                        prefix="from"
                      />
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs text-muted">
                      {cat.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-8 text-center text-muted">
              No categories match. Try another search.
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-muted">
            Want the full catalog?{" "}
            <Link
              href="/categories"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Browse all categories
            </Link>
          </p>
        </Container>
      </section>

      {/* Packages */}
      <section
        id="get-started-packages"
        className="border-t border-line bg-paper-soft py-12 md:py-16"
      >
        <Container>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                Step 3 · Package
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink md:text-3xl">
                {mode === "studio"
                  ? "Talk to Studio"
                  : mode === "project"
                    ? `Hire for ${selected.productName}`
                    : `${selected.productName} packages`}
              </h2>
              <p className="mt-2 max-w-xl text-muted">
                {mode === "contest"
                  ? "Contest packages mirror Creative Logo Makers pricing — pick a tier and start the brief."
                  : mode === "project"
                    ? designer
                      ? `Continue with ${designer.name}, or switch designers after selecting a skill.`
                      : "Find a matched designer for this skill, then invite them to a 1-to-1."
                    : "Strategist-led branding — we’ll scope identity, launch, and systems with you."}
              </p>
            </div>
            <Link
              href={categoryDetailsHref(selected)}
              className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
            >
              View {selected.productName} details →
            </Link>
          </div>

          {mode === "studio" ? (
            <div className="mt-8 rounded-3xl border border-line bg-white p-8 md:p-10">
              <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-ink">
                    Circlemakers Studio
                  </h3>
                  <p className="mt-3 text-muted">
                    Full-service identity with Brand Strategists — discovery,
                    concepts, guidelines, and launch assets.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-ink/80">
                    <li>✓ Dedicated strategist</li>
                    <li>✓ Identity + brand guide</li>
                    <li>✓ Launch pack (cards, social, web)</li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/studio/talk-to-strategist" variant="primary">
                      Talk to a strategist
                    </Button>
                    <Button href="/studio" variant="secondary">
                      Explore Studio
                    </Button>
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-soft">
                  <Image
                    src="/clm/hires/cat-logo.jpg"
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ) : mode === "project" ? (
            designer ? (
              <>
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {designerProjectPackages(designer, selected.slug).map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      selected={pkgId === pkg.id}
                      onSelect={() => setPkgId(pkg.id)}
                      href={categoryLaunchHref(selected.slug, pkg.id, {
                        designerId: designer.id,
                        hireMode: "direct",
                      })}
                    />
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-white px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">
                      Hiring {designer.name} · assigned after payment
                    </p>
                    <p className="truncate font-semibold text-ink">
                      {selected.productName} ·{" "}
                      {designerProjectPackages(designer, selected.slug).find(
                        (p) => p.id === pkgId,
                      )?.name ??
                        designerProjectPackages(designer, selected.slug).find(
                          (p) => p.featured,
                        )?.name ??
                        "Growth Project"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={continueLaunch}
                    className="w-full rounded-full bg-cta px-6 py-3 text-sm font-semibold !text-white hover:bg-cta-hover sm:w-auto"
                  >
                    Start brief with {designer.name.split(" ")[0]} →
                  </button>
                </div>
              </>
            ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 rounded-3xl border border-line bg-white p-8">
                <h3 className="text-xl font-bold text-ink">
                  1-to-1 for {selected.productName}
                </h3>
                <p className="mt-2 text-muted">
                  Private chat, milestones, and revisions with one designer.
                  Prices adjust to their level and this skill.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    href={`/designers/search?skill=${encodeURIComponent(selected.slug)}`}
                    variant="primary"
                  >
                    Find a designer
                  </Button>
                  <Button
                    href={categoryLaunchHref(selected.slug, "gold")}
                    variant="secondary"
                  >
                    Prefer a contest instead?
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-line bg-ink p-8 !text-white">
                <p className="text-sm text-white/70">Starting around</p>
                <p className="mt-2 text-3xl font-bold">
                  <LocalizedPrice value={selected.startingPrice} />
                </p>
                <p className="mt-3 text-sm text-white/70">
                  Final quote depends on designer level and package.
                </p>
              </div>
            </div>
            )
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={pkgId === pkg.id}
                    onSelect={() => setPkgId(pkg.id)}
                    href={categoryLaunchHref(selected.slug, pkg.id)}
                  />
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-white px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-muted">Ready when you are</p>
                  <p className="truncate font-semibold text-ink">
                    {selected.productName} ·{" "}
                    {packages.find((p) => p.id === pkgId)?.name ?? "Gold"} ·{" "}
                    <LocalizedPrice
                      value={
                        packages.find((p) => p.id === pkgId)?.price ?? "From $499"
                      }
                    />
                  </p>
                </div>
                <button
                  type="button"
                  onClick={continueLaunch}
                  className="w-full rounded-full bg-cta px-6 py-3 text-sm font-semibold !text-white hover:bg-cta-hover sm:w-auto"
                >
                  Start visual brief →
                </button>
              </div>
            </>
          )}
        </Container>
      </section>

      {/* Trust */}
      <section className="border-t border-line bg-white py-12 md:py-14">
        <Container>
          <div className="grid gap-6 rounded-3xl border border-line bg-paper-soft/50 p-8 md:grid-cols-3 md:p-10">
            {[
              {
                t: "Money-back guarantee",
                d: "If you’re not happy with contest results, you’re covered under platform terms.",
              },
              {
                t: "Vetted designers",
                d: "Top, Mid, and Entry levels — rated by real clients after every project.",
              },
              {
                t: "Files you own",
                d: "Source files and commercial rights when you select a winning design.",
              },
            ].map((item) => (
              <div key={item.t}>
                <h3 className="font-bold text-ink">{item.t}</h3>
                <p className="mt-2 text-sm text-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
