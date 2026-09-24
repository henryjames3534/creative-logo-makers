"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { LocaleSwitcher } from "@/components/locale/LocaleSwitcher";
import { LocalizedFromPrice, LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { categories, getPopularCategories, homeCategoryGroups } from "@/data/categories";
import { clm } from "@/data/clm-assets";
import { categoryImages, groupImages } from "@/data/media";
import {
  megaBlogCards,
  megaDesignerFaces,
  megaNav,
  type MegaItem,
  type MegaPanel,
} from "@/data/navigation";
import { brand } from "@/data/site";
import { categoryDetailsHref } from "@/data/serviceRoutes";

export function Header() {
  const { user, ready, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navId = useId();

  function openPanel(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(id);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 160);
  }

  function closeNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeNow();
        setMobileOpen(false);
        setAccountOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (!headerRef.current?.contains(e.target as Node)) {
        closeNow();
        setAccountOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const panel = megaNav.find((p) => p.id === active) ?? null;
  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";
  const loggedIn = Boolean(ready && user);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md"
      onMouseLeave={scheduleClose}
    >
      <div className="container-clm-header flex h-14 flex-nowrap items-center justify-between gap-2 overflow-x-clip sm:h-16 sm:gap-3 xl:h-[72px]">
        <div className="flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3 xl:gap-4 2xl:gap-5">
          <BrandLogo
            compact
            className="max-w-[110px] shrink-0 sm:max-w-[132px] xl:max-w-[148px] 2xl:max-w-[158px] [&_img]:!max-h-7 sm:[&_img]:!max-h-8 xl:[&_img]:!max-h-9 2xl:[&_img]:!max-h-10"
          />
          <nav
            className="hidden shrink-0 flex-nowrap items-center xl:flex"
            aria-label="Primary"
          >
            {megaNav.map((item) => {
              const isOpen = active === item.id;
              return (
                <div
                  key={item.id}
                  className="relative shrink-0"
                  onMouseEnter={() => openPanel(item.id)}
                  onFocus={() => openPanel(item.id)}
                >
                  <Link
                    href={item.href}
                    id={`${navId}-${item.id}`}
                    className={`relative inline-flex shrink-0 flex-nowrap items-center gap-0.5 whitespace-nowrap py-2 text-[12px] font-medium transition-colors xl:gap-1 xl:text-[13px] 2xl:gap-1.5 2xl:text-[15px] ${
                      loggedIn
                        ? "px-1 xl:px-1.5 2xl:px-2.5"
                        : "px-1.5 xl:px-2 2xl:px-3"
                    } ${isOpen ? "text-ink" : "text-ink/75 hover:text-ink"}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`${navId}-panel`}
                  >
                    <span className="whitespace-nowrap">{item.label}</span>
                    <Chevron open={isOpen} />
                    <span
                      className={`absolute inset-x-1 -bottom-[14px] h-[3px] rounded-full transition-all xl:inset-x-1.5 xl:-bottom-[18px] 2xl:inset-x-2.5 ${
                        isOpen ? "bg-hero opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2 xl:gap-2.5 2xl:gap-3">
            <LocaleSwitcher
              compact
              placement="down"
              className="hidden sm:inline-flex"
            />
            <Link
              href={`tel:${brand.phoneTel}`}
              className="hidden shrink-0 flex-nowrap items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-ink/75 hover:text-ink 2xl:inline-flex 2xl:text-[14px]"
            >
              <PhoneIcon />
              <span className="whitespace-nowrap">{brand.phone}</span>
            </Link>

          {loggedIn && user ? (
            <div className="relative hidden shrink-0 sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex max-w-full shrink-0 flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-full border border-line py-1 pl-1 pr-2 text-sm font-semibold text-ink hover:border-ink/30"
                aria-expanded={accountOpen}
                aria-label={`Account menu for ${user.name}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-hero text-xs font-bold !text-white">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.picture}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden max-w-[5.5rem] truncate whitespace-nowrap 2xl:inline">
                  {user.name.split(" ")[0]}
                </span>
                <Chevron open={accountOpen} />
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-lg">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-soft"
                  >
                    My account & updates
                  </Link>
                  <Link
                    href="/get-started"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-soft"
                  >
                    Launch a contest
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      signOut();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-coral hover:bg-paper-soft"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden shrink-0 whitespace-nowrap text-[13px] font-medium text-ink/75 hover:text-ink sm:inline xl:text-[14px] 2xl:text-[15px]"
            >
              Log in
            </Link>
          )}

          <Link
            href="/get-started"
            className="shrink-0 whitespace-nowrap rounded-full bg-cta px-3 py-1.5 text-[11px] font-semibold !text-white shadow-sm hover:bg-cta-hover sm:px-3.5 sm:py-2 sm:text-xs xl:px-4 xl:text-sm 2xl:px-5 2xl:py-2.5"
          >
            Get a design
          </Link>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-line px-2.5 py-2 text-ink xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {panel ? (
        <div
          className="mega-backdrop pointer-events-none absolute inset-x-0 top-full hidden h-[100vh] bg-ink/30 xl:block"
          aria-hidden
        />
      ) : null}

      {panel ? (
        <div
          id={`${navId}-panel`}
          role="region"
          aria-labelledby={`${navId}-${panel.id}`}
          className="mega-panel absolute inset-x-0 top-full hidden xl:block"
          onMouseEnter={() => openPanel(panel.id)}
          onMouseLeave={scheduleClose}
        >
          <div className="border-b border-line bg-white shadow-[0_28px_60px_rgba(49,48,48,0.18)]">
            <div className="container-clm py-7 md:py-8">
              {panel.eyebrow ? (
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  {panel.eyebrow}
                </p>
              ) : null}
              <MegaContent panel={panel} onNavigate={closeNow} />
            </div>
            <div className="border-t border-line bg-paper-soft/90">
              <div className="container-clm flex flex-wrap items-center justify-between gap-3 py-3">
                <p className="text-sm text-muted">
                  Need help picking?{" "}
                  <Link
                    href="/contact"
                    onClick={closeNow}
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    Talk to support
                  </Link>
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Link
                    href="/pricing"
                    onClick={closeNow}
                    className="font-medium text-ink hover:underline"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/get-started"
                    onClick={closeNow}
                    className="rounded-full bg-cta px-4 py-2 text-xs font-semibold !text-white hover:bg-cta-hover"
                  >
                    Get a design
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-line bg-white sm:max-h-[calc(100vh-4rem)] xl:hidden">
          <div className="px-5 py-4">
            {megaNav.map((item) => {
              const open = mobileSection === item.id;
              return (
                <div key={item.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    className="flex w-full flex-nowrap items-center justify-between gap-3 py-3.5 text-left text-[15px] font-medium text-ink"
                    onClick={() => setMobileSection(open ? null : item.id)}
                    aria-expanded={open}
                  >
                    <span className="whitespace-nowrap">{item.label}</span>
                    <Chevron open={open} />
                  </button>
                  {open ? (
                    <div className="pb-4">
                      <MegaContent
                        panel={item}
                        onNavigate={() => {
                          setMobileOpen(false);
                          setMobileSection(null);
                        }}
                        compact
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper-soft/60 px-3 py-2.5 sm:hidden">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Language · Currency
                </span>
                <LocaleSwitcher compact placement="down" />
              </div>
              <a
                href={`tel:${brand.phoneTel}`}
                className="text-[15px] font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {brand.phone}
              </a>
              <a
                href={`tel:${brand.phoneAltTel}`}
                className="text-[15px] font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {brand.phoneAlt}
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="text-[15px] font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {brand.email}
              </a>
              <p className="text-sm leading-relaxed text-muted">
                {brand.addressFull}
              </p>
              {ready && user ? (
                <>
                  <Link
                    href="/account"
                    className="rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-ink"
                    onClick={() => setMobileOpen(false)}
                  >
                    My account ({user.name.split(" ")[0]})
                  </Link>
                  <button
                    type="button"
                    className="rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-coral"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in / Sign up
                </Link>
              )}
              <Link
                href="/get-started"
                className="rounded-full bg-cta px-5 py-3 text-center text-sm font-semibold !text-white"
                onClick={() => setMobileOpen(false)}
              >
                Get a design
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MegaContent({
  panel,
  onNavigate,
  compact = false,
}: {
  panel: MegaPanel;
  onNavigate: () => void;
  compact?: boolean;
}) {
  if (panel.kind === "categories") {
    return (
      <CategoriesMega
        onNavigate={onNavigate}
        compact={compact}
        featured={panel.featured}
      />
    );
  }
  if (panel.kind === "how") {
    return <HowMega panel={panel} onNavigate={onNavigate} compact={compact} />;
  }
  if (panel.kind === "designers") {
    return (
      <DesignersMega panel={panel} onNavigate={onNavigate} compact={compact} />
    );
  }
  if (panel.kind === "inspiration") {
    return (
      <InspirationMega panel={panel} onNavigate={onNavigate} compact={compact} />
    );
  }
  return <StudioMega panel={panel} onNavigate={onNavigate} compact={compact} />;
}

function CategoriesMega({
  onNavigate,
  compact,
  featured,
}: {
  onNavigate: () => void;
  compact: boolean;
  featured?: MegaPanel["featured"];
}) {
  const cats = getPopularCategories();
  const groups = homeCategoryGroups;
  if (compact) {
    return (
      <div className="grid gap-2">
        {groups.map((g) => (
          <Link
            key={g.group}
            href={`/categories?group=${g.group}`}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper-soft"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
              <Image
                src={groupImages[g.imageKey] ?? categoryImages["logo-branding"]}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{g.shortTitle}</p>
              <p className="text-xs text-muted">
                <LocalizedFromPrice amount={g.startingPrice} />
              </p>
            </div>
          </Link>
        ))}
        <Link
          href="/categories"
          onClick={onNavigate}
          className="mt-1 px-2 text-sm font-semibold text-hero"
        >
          Browse all {categories.length} categories →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {groups.map((g) => (
            <Link
              key={g.group}
              href={`/categories?group=${g.group}`}
              onClick={onNavigate}
              className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <Image
                  src={groupImages[g.imageKey] ?? categoryImages["logo-branding"]}
                  alt=""
                  fill
                  sizes="180px"
                  quality={85}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-ink">{g.shortTitle}</p>
                <p className="mt-1 text-xs font-semibold text-hero">
                  <LocalizedFromPrice amount={g.startingPrice} />
                </p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
          Popular services
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((cat) => (
            <Link
              key={cat.slug}
              href={categoryDetailsHref(cat)}
              onClick={onNavigate}
              className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink hover:border-ink/25 hover:bg-paper-soft"
            >
              {cat.productName}
              <span className="mt-0.5 block text-xs font-medium text-muted">
                <LocalizedFromPrice amount={cat.startingPrice} />
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/categories"
          onClick={onNavigate}
          className="mt-4 inline-block text-sm font-semibold text-hero hover:underline"
        >
          Browse all {categories.length} categories →
        </Link>
      </div>
      {featured ? (
        <FeaturedCard featured={featured} onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}

function HowMega({
  panel,
  onNavigate,
  compact,
}: {
  panel: MegaPanel;
  onNavigate: () => void;
  compact: boolean;
}) {
  const items = panel.columns?.[0]?.items ?? [];
  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
      }
    >
      <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {items.map((item) => (
          <ModeCard key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {!compact && panel.featured ? (
        <FeaturedCard featured={panel.featured} onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}

function DesignersMega({
  panel,
  onNavigate,
  compact,
}: {
  panel: MegaPanel;
  onNavigate: () => void;
  compact: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "space-y-5"
          : "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
      }
    >
      <div>
        {!compact ? (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-paper-soft/60 px-4 py-3">
            <div className="flex -space-x-3">
              {megaDesignerFaces.map((d) => (
                <div
                  key={d.name}
                  className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm"
                >
                  <Image
                    src={d.src}
                    alt={d.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">85,000+ designers</p>
              <p className="text-xs text-muted">
                Vetted creative experts worldwide
              </p>
            </div>
          </div>
        ) : null}
        <div className={`grid gap-6 ${compact ? "" : "sm:grid-cols-2"}`}>
          {panel.columns?.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                {col.title}
              </p>
              <ul className="mt-3 space-y-0.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="group flex items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-paper-soft"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-hero">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {!compact && panel.featured ? (
        <FeaturedCard featured={panel.featured} onNavigate={onNavigate} />
      ) : null}
    </div>
  );
}

function InspirationMega({
  panel,
  onNavigate,
  compact,
}: {
  panel: MegaPanel;
  onNavigate: () => void;
  compact: boolean;
}) {
  if (compact) {
    return (
      <div className="space-y-2">
        {megaBlogCards.map((post) => (
          <Link
            key={post.title}
            href={post.href}
            onClick={onNavigate}
            className="flex gap-3 rounded-xl px-1 py-2 hover:bg-paper-soft"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug text-ink">
                {post.title}
              </p>
              <p className="mt-1 text-xs text-muted">{post.read}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  const featured = panel.featured;
  const discover = panel.columns?.[0]?.items ?? [];

  return (
    <div className="space-y-5">
      {/* Blog cards — equal height row, no empty gap */}
      <div className="grid gap-4 sm:grid-cols-3">
        {megaBlogCards.map((post) => (
          <Link
            key={post.title}
            href={post.href}
            onClick={onNavigate}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="280px"
                quality={90}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue shadow-sm">
                {post.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              <p className="text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-hero">
                {post.title}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <p className="text-xs text-muted">{post.read}</p>
                <span className="text-xs font-semibold text-hero opacity-0 transition-opacity group-hover:opacity-100">
                  Read →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Discover + CTA — one tight bottom row, fills width */}
      <div className="grid gap-4 rounded-2xl border border-line bg-paper-soft/70 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Discover
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {discover.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-sm transition-all hover:border-blue/30 hover:text-blue"
              >
                {item.label}
                <span className="text-ink/30" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {featured ? (
          <Link
            href={featured.href}
            onClick={onNavigate}
            className="group relative flex w-full min-w-0 items-center gap-4 overflow-hidden rounded-xl px-4 py-3.5 text-white shadow-md sm:min-w-[240px] sm:w-auto"
            style={{
              background: `linear-gradient(135deg, ${featured.accent ?? "#2486cb"} 0%, #1c1b1a 120%)`,
            }}
          >
            {featured.image ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 ring-white/25">
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug !text-white">
                {featured.title}
              </p>
              <p className="mt-0.5 truncate text-xs !text-white/75">
                {featured.description}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-bold !text-ink transition-transform group-hover:scale-[1.03]">
              {featured.cta}
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function StudioMega({
  panel,
  onNavigate,
  compact,
}: {
  panel: MegaPanel;
  onNavigate: () => void;
  compact: boolean;
}) {
  const items = panel.columns?.[0]?.items ?? [];
  const featured = panel.featured;

  if (compact) {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-paper-soft"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/10 text-violet">
              <StudioServiceIcon name={item.icon} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                {item.label}
              </span>
              {item.description ? (
                <span className="block text-xs text-muted">{item.description}</span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-8">
      <Link
        href={featured?.href ?? "/studio"}
        onClick={onNavigate}
        className="group relative overflow-hidden rounded-2xl bg-violet shadow-lg ring-1 ring-violet/20"
      >
        <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[320px] lg:h-full">
          {featured?.image ? (
            <Image
              src={featured.image}
              alt=""
              fill
              sizes="440px"
              quality={90}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3e00cd] via-[#3e00cd]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3e00cd]/80 via-transparent to-[#fe5f50]/25" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold !text-white backdrop-blur-md ring-1 ring-white/25">
            <span className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-white/50">
              <Image
                src={clm.studioLaura}
                alt=""
                fill
                sizes="24px"
                className="object-cover"
              />
            </span>
            Brand Strategist
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
            </span>
          </div>

          <div className="absolute inset-x-4 top-[4.5rem] flex flex-wrap gap-2">
            {["Strategy", "Identity", "Launch"].map((perk) => (
              <span
                key={perk}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide !text-white backdrop-blur-md"
              >
                {perk}
              </span>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] !text-white/70">
              Creative Logo Makers Studio
            </p>
            <p className="mt-1 text-xl font-semibold leading-snug !text-white">
              {featured?.title ?? "Full-service branding"}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed !text-white/80">
              {featured?.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold !text-violet transition-transform group-hover:scale-[1.03]">
              {featured?.cta ?? "Learn more"}
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col">
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Studio services
          </p>
          <Link
            href="/studio"
            onClick={onNavigate}
            className="text-xs font-semibold text-violet hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid flex-1 gap-2.5 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className="group relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-md"
            >
              {item.badge ? (
                <span className="absolute right-3 top-3 rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {item.badge}
                </span>
              ) : null}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet transition-colors group-hover:bg-violet group-hover:!text-white">
                <StudioServiceIcon name={item.icon} />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{item.label}</p>
              {item.description ? (
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {item.description}
                </p>
              ) : null}
              {item.price ? (
                <p className="mt-auto pt-3 text-xs font-bold text-violet">
                  <LocalizedPrice value={item.price} />
                </p>
              ) : null}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-soft/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {megaDesignerFaces.slice(0, 3).map((d) => (
                <span
                  key={d.name}
                  className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white"
                >
                  <Image
                    src={d.src}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">
                Dedicated Brand Strategists
              </p>
              <p className="text-[11px] text-muted">Avg. response under 24h</p>
            </div>
          </div>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="rounded-full bg-cta px-4 py-2 text-xs font-semibold !text-white hover:bg-cta-hover"
          >
            Book a call
          </Link>
        </div>
      </div>
    </div>
  );
}

function StudioServiceIcon({ name }: { name?: MegaItem["icon"] }) {
  if (name === "strategy") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "identity") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === "launch") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 19V5M12 5l-4 4M12 5l4 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 19h14"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "call") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.7c0-.6.4-1 1-1H7c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return <SparkIcon />;
}

function ModeCard({
  item,
  onNavigate,
}: {
  item: MegaItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group relative overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md"
    >
      {item.badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green">
          {item.badge}
        </span>
      ) : null}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-soft text-ink transition-colors group-hover:bg-hero/10 group-hover:text-hero">
        <ModeIcon name={item.icon} />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink">{item.label}</p>
      {item.description ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {item.description}
        </p>
      ) : null}
      {item.price ? (
        <p className="mt-3 text-xs font-bold text-hero">
          <LocalizedPrice value={item.price} />
        </p>
      ) : null}
    </Link>
  );
}

function FeaturedCard({
  featured,
  onNavigate,
  hero = false,
  compact = false,
}: {
  featured: NonNullable<MegaPanel["featured"]>;
  onNavigate: () => void;
  hero?: boolean;
  compact?: boolean;
}) {
  const accent = featured.accent ?? "#834692";
  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white shadow-md"
      style={{
        background: `linear-gradient(155deg, ${accent} 0%, #1c1b1a 115%)`,
      }}
    >
      {featured.image ? (
        <div
          className={`relative ${
            hero
              ? "aspect-[16/11]"
              : compact
                ? "aspect-[16/9]"
                : "aspect-[16/10]"
          }`}
        >
          <Image
            src={featured.image}
            alt=""
            fill
            sizes="320px"
            quality={90}
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${accent}f2 0%, ${accent}66 42%, transparent 72%)`,
            }}
          />
        </div>
      ) : null}
      <div className={compact ? "p-4" : "p-5"}>
        <p
          className={`font-semibold leading-snug ${compact ? "text-base" : "text-lg"}`}
        >
          {featured.title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/80">
          {featured.description}
        </p>
        <Link
          href={featured.href}
          onClick={onNavigate}
          className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold !text-ink transition-colors hover:bg-paper-soft"
        >
          {featured.cta}
        </Link>
      </div>
    </div>
  );
}

function ModeIcon({ name }: { name?: MegaItem["icon"] }) {
  if (name === "contest") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M8 4h8v3a4 4 0 01-8 0V4z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M8 7H5a2 2 0 010-4h3M16 7h3a2 2 0 000-4h-3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 11v4M9 21h6l-1.5-6h-3L9 21z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "project") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M10.5 9.5L13.5 12.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }
  if (name === "studio") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === "maker") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 8v8M8 12h8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return <SparkIcon />;
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.7c0-.6.4-1 1-1H7c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
