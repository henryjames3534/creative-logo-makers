import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LocaleSwitcher } from "@/components/locale/LocaleSwitcher";
import { brand, footerColumns } from "@/data/site";

const pressOutlets = [
  { name: "The Wall Street Journal", src: "/press/wsj.svg", w: 140, h: 18 },
  { name: "TechCrunch", src: "/press/techcrunch.svg", w: 120, h: 16 },
  { name: "Entrepreneur", src: "/press/entrepreneur.svg", w: 110, h: 20 },
  { name: "The New York Times", src: "/press/nyt.svg", w: 140, h: 20 },
  { name: "Forbes", src: "/press/forbes.svg", w: 90, h: 22 },
];

const socials = [
  { label: "X", href: "/contact", icon: "x" },
  { label: "Instagram", href: "/contact", icon: "ig" },
  { label: "Facebook", href: "/contact", icon: "fb" },
  { label: "LinkedIn", href: "/contact", icon: "in" },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-x-hidden text-ink">
      {/* Layered atmospheric background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 0% 0%, rgba(36, 134, 203, 0.1), transparent 55%),
            radial-gradient(ellipse 60% 45% at 100% 20%, rgba(131, 70, 146, 0.09), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(0, 165, 129, 0.08), transparent 55%),
            linear-gradient(180deg, #ebe9e5 0%, #f3f2f0 28%, #f7f6f4 70%, #efede9 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(49,48,48,0.05) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Press / as seen in */}
      <div className="relative z-10 border-b border-ink/10">
        <div className="container-clm py-10 md:py-12">
          <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            As seen in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
            {pressOutlets.map((item) => (
              <Link
                key={item.name}
                href="/about"
                title={item.name}
                className="opacity-45 grayscale transition-all hover:opacity-80 hover:grayscale-0"
              >
                <Image
                  src={item.src}
                  alt={item.name}
                  width={item.w}
                  height={item.h}
                  className="brightness-0"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative z-10">
        <div className="container-clm py-14 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
            {/* Brand column */}
            <div>
              <BrandLogo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#5c5b59]">
                Logos, websites, packaging & more — connect with creative
                experts you can trust.
              </p>
              <div className="mt-5 space-y-2 text-sm">
                <Link
                  href={`tel:${brand.phoneTel}`}
                  className="inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-hero"
                >
                  <PhoneIcon />
                  {brand.phone}
                </Link>
                <div>
                  <Link
                    href={`tel:${brand.phoneAltTel}`}
                    className="inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-hero"
                  >
                    <PhoneIcon />
                    {brand.phoneAlt}
                  </Link>
                </div>
                <a
                  href={`mailto:${brand.email}`}
                  className="block font-semibold text-ink transition-colors hover:text-hero"
                >
                  {brand.email}
                </a>
                <p className="max-w-xs leading-relaxed text-[#5c5b59]">
                  {brand.addressFull}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                {socials.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white/60 text-ink/70 shadow-sm backdrop-blur-sm transition-all hover:border-ink/25 hover:bg-white hover:text-ink"
                  >
                    <span className="sr-only">{s.label}</span>
                    <SocialIcon name={s.icon} />
                  </Link>
                ))}
              </div>
              <Link
                href="/get-started"
                className="mt-7 inline-flex rounded-full bg-cta px-6 py-2.5 text-sm font-semibold !text-white hover:bg-cta-hover"
              >
                Get a design
              </Link>
            </div>

            {/* Link columns */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="text-sm font-bold tracking-tight text-ink">
                    {col.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-[#5c5b59] transition-colors hover:text-ink"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-ink/10 bg-white/40 backdrop-blur-sm">
        <div className="container-clm flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-[#5c5b59]">
              © {new Date().getFullYear()} {brand.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5c5b59]">
            <Link href="/terms" className="hover:text-ink">
              Terms and Conditions
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/categories" className="hover:text-ink">
              Sitemap
            </Link>
            <LocaleSwitcher placement="up" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.7c0-.6.4-1 1-1H7c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function SocialIcon({ name }: { name: "x" | "ig" | "fb" | "in" }) {
  if (name === "x") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    );
  }
  if (name === "ig") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "fb") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 9.5A2.5 2.5 0 1 1 6.5 4.5a2.5 2.5 0 0 1 0 5zM4.5 20.5v-9h4v9h-4zM13.5 11.5c1.1-1.2 2.6-1.5 4-1.2 2 .4 3.5 2.1 3.5 4.5v5.7h-4v-5.2c0-1.1-.6-2-1.7-2.1-1.1 0-1.8.8-1.8 2.1v5.2h-4v-9h4v1z" />
    </svg>
  );
}
