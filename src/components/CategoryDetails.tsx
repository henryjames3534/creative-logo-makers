import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LocalizedFromPrice, LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { Container, SectionHeading } from "@/components/Section";
import {
  categories,
  categoryFaqs,
  type Category,
} from "@/data/categories";
import { categoryImages, groupImages } from "@/data/media";
import { getContestPackages } from "@/data/packages";
import { clm } from "@/data/clm-assets";
import {
  categoryDetailsHref,
  categoryLaunchHref,
} from "@/data/serviceRoutes";

const navItems = [
  { href: "#what-you-get", label: "What you get" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faqs", label: "FAQs" },
];

const contestSteps = [
  {
    n: "01",
    title: "Write a design brief",
    desc: "Tell designers about your brand, audience, and style preferences.",
  },
  {
    n: "02",
    title: "Designers submit concepts",
    desc: "Watch custom concepts roll in from our creative community.",
  },
  {
    n: "03",
    title: "Pick a winning design",
    desc: "Rate entries, leave feedback, then choose your favorite and get the files.",
  },
];

const gallery = [
  { src: "/clm/mosaic/copilot.jpg", by: "Copilot" },
  { src: "/clm/mosaic/wanderlust.jpg", by: "Wanderlust" },
  { src: "/clm/mosaic/megahouse.jpg", by: "Mega House" },
  { src: "/clm/mosaic/bozzi.jpg", by: "Bozzi" },
  { src: "/clm/mosaic/gundog.jpg", by: "DIY Gundog" },
  { src: "/clm/mosaic/fox.jpg", by: "Lone Oak" },
  { src: "/clm/mosaic/fit.jpg", by: "Fit" },
  { src: "/clm/mosaic/nord.jpg", by: "Nord" },
];

const reviews = [
  {
    quote:
      "Great experience and we ended up with a design that was exactly as requested. We had great artists answer our call!",
    author: "agsink7N",
    when: "a month ago",
  },
  {
    quote:
      "Did not expect to receive over 100 designs by the time the competition ended! We were blown away with our experience.",
    author: "bennycatalanov",
    when: "4 months ago",
  },
  {
    quote:
      "Making the contest “blind” allows designers to be more creative — I ended up loving my design.",
    author: "caubte",
    when: "4 months ago",
  },
];

export function CategoryDetails({ cat }: { cat: Category }) {
  const used = new Set<string>();

  function pickImage(slug: string, group: string) {
    const candidates = [
      categoryImages[slug],
      groupImages[group],
      categoryImages["logo-branding"],
      "/clm/unique/concept-a.jpg",
      "/clm/unique/concept-b.jpg",
      "/clm/unique/concept-c.jpg",
      "/clm/unique/concept-d.jpg",
      "/clm/unique/concept-e.jpg",
      "/clm/unique/concept-f.jpg",
      "/clm/unique/concept-g.jpg",
      "/clm/unique/concept-h.jpg",
    ].filter(Boolean) as string[];

    for (const src of candidates) {
      if (!used.has(src)) {
        used.add(src);
        return src;
      }
    }
    return candidates[0] ?? "/clm/unique/concept-a.jpg";
  }

  const image = pickImage(cat.slug, cat.group);
  const related = categories
    .filter((c) => c.slug !== cat.slug && c.group === cat.group)
    .slice(0, 3);
  if (related.length < 3) {
    related.push(
      ...categories
        .filter((c) => c.slug !== cat.slug && !related.includes(c))
        .slice(0, 3 - related.length),
    );
  }
  const relatedImages = related.map((c) => pickImage(c.slug, c.group));

  return (
    <>
      {/* Hero — matches Creative Logo Makers details layout */}
      <section className="border-b border-line bg-white">
        <Container className="py-10 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="relative order-2 aspect-[5/4] overflow-hidden rounded-2xl bg-paper-soft lg:order-1">
              <Image
                src={image}
                alt={`${cat.productName} examples`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
                className="object-cover"
                priority
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
                Winner · Design contest
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Link
                href="/categories"
                className="text-sm font-medium text-muted hover:text-ink"
              >
                ← All categories
              </Link>
              <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink md:text-5xl">
                {cat.productName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold text-ink">
                  ★ {cat.rating}
                  <span className="font-normal text-muted">
                    {" "}
                    ({cat.reviewCount} reviews)
                  </span>
                </span>
                <span className="text-muted">·</span>
                <span className="font-semibold text-ink">
                  <LocalizedFromPrice
                    amount={cat.startingPrice}
                    prefix="Starting from"
                  />
                </span>
              </div>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink/75">
                {cat.longDescription}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#pricing" variant="primary">
                  Select a package
                </Button>
                <Button href={categoryLaunchHref(cat, "gold")} variant="secondary">
                  Start a contest
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Sticky subnav */}
      <nav className="sticky top-[72px] z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <Container>
          <ul className="flex gap-1 overflow-x-auto py-0 scrollbar-none">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex whitespace-nowrap border-b-2 border-transparent px-4 py-3.5 text-sm font-semibold text-ink/65 transition-colors hover:border-ink/20 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* What you get */}
      <section id="what-you-get" className="scroll-mt-36 py-14 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-ink">
                What you get
              </h2>
              <ul className="mt-8 space-y-4">
                {cat.whatYouGet.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] text-ink/85">
                    <span className="mt-0.5 text-green" aria-hidden>
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-paper-soft p-7 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Collaboration method
              </p>
              <h3 className="mt-2 text-2xl font-medium text-ink">Contest</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
                Open your design brief to our entire community. Designers submit
                their ideas and you pick your favorite design.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink/80">
                <li className="flex gap-2">
                  <span className="text-green">✓</span>
                  Creative concepts from multiple designers
                </li>
                <li className="flex gap-2">
                  <span className="text-green">✓</span>
                  Choose a winning design and receive copyright to the files
                </li>
              </ul>
              <Link
                href="/how-it-works"
                className="mt-6 inline-flex text-sm font-semibold text-hero hover:underline"
              >
                Find out more →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-36 border-t border-line bg-paper-soft py-14 md:py-16"
      >
        <Container>
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            How a contest works
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {contestSteps.map((step) => (
              <article
                key={step.n}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <span className="text-3xl font-bold text-green/35">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing — sticky summary + packages */}
      <section id="pricing" className="scroll-mt-36 py-14 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
            <aside className="lg:sticky lg:top-36 lg:self-start">
              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-medium text-ink">
                  {cat.productName}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  ★ {cat.rating} ({cat.reviewCount} reviews)
                </p>
                <p className="mt-4 text-lg font-semibold text-ink">
                  <LocalizedFromPrice
                    amount={cat.startingPrice}
                    prefix="Starting from"
                  />
                </p>
                <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-ink/80">
                  {cat.whatYouGet.slice(0, 4).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-green">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    href={categoryLaunchHref(cat, "gold")}
                    variant="primary"
                    className="w-full"
                  >
                    Select a package
                  </Button>
                </div>
              </div>
            </aside>

            <div>
              <h2 className="text-3xl font-medium tracking-tight text-ink">
                Simple pricing for every budget
              </h2>
              <p className="mt-2 text-muted">
                Choose a package that suits your needs
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {getContestPackages(cat.slug).map((pkg) => (
                  <article
                    key={pkg.id}
                    className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md ${
                      pkg.featured
                        ? "border-green bg-green/5 ring-1 ring-green/20"
                        : "border-line bg-white"
                    }`}
                  >
                    {pkg.featured ? (
                      <span className="absolute -top-3 left-5 rounded-full bg-green px-3 py-1 text-[10px] font-bold uppercase tracking-wide !text-white">
                        Recommended
                      </span>
                    ) : null}
                    <h3 className="text-xl font-bold text-ink">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-muted">{pkg.blurb}</p>
                    <div className="mt-4 flex flex-wrap items-baseline gap-2">
                      <p className="text-3xl font-bold text-ink">
                        <LocalizedPrice value={pkg.price} />
                      </p>
                      {pkg.compareAtPrice ? (
                        <>
                          <p className="text-lg text-muted line-through">
                            <LocalizedPrice value={pkg.compareAtPrice} />
                          </p>
                          <span className="rounded bg-coral/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral">
                            50% off
                          </span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-muted">
                      {pkg.bestFor}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2">
                      {pkg.features.map((f) => (
                        <li
                          key={f}
                          className="flex gap-2 text-sm text-ink/80"
                        >
                          <span className="text-green">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={categoryLaunchHref(cat, pkg.id)}
                      className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                        pkg.featured
                          ? "bg-cta !text-white hover:bg-cta-hover"
                          : "border border-line bg-paper-soft !text-ink hover:border-ink/30"
                      }`}
                    >
                      Select {pkg.name}
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-medium tracking-tight text-ink">
              {cat.productName} created on our platform
            </h2>
            <Link
              href="/inspiration"
              className="text-sm font-semibold text-hero hover:underline"
            >
              See more inspiration →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {gallery.map((g) => (
              <div
                key={g.src + g.by}
                className="group overflow-hidden rounded-xl border border-line bg-white shadow-sm"
              >
                <div className="relative aspect-square">
                  <Image
                    src={g.src}
                    alt={`Design by ${g.by}`}
                    fill
                    sizes="220px"
                    quality={85}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="px-3 py-2.5 text-xs font-medium text-muted">
                  Design by {g.by}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-36 py-14 md:py-16">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-ink">★ {cat.rating} stars</p>
              <p className="mt-1 text-muted">
                From {cat.reviewCount} customer reviews
              </p>
            </div>
            <Link
              href="/inspiration"
              className="text-sm font-semibold text-hero hover:underline"
            >
              See all reviews →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <blockquote
                key={r.author}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-ink">★ ★ ★ ★ ★</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/85">
                  “{r.quote}”
                </p>
                <footer className="mt-5 text-sm text-muted">
                  {r.when} · {r.author}
                </footer>
                <Link
                  href="/contests"
                  className="mt-4 inline-flex text-sm font-semibold text-hero hover:underline"
                >
                  View their contest →
                </Link>
              </blockquote>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section
        id="faqs"
        className="scroll-mt-36 border-t border-line bg-paper-soft py-14 md:py-16"
      >
        <Container>
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {categoryFaqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-line bg-white px-5 py-1 shadow-sm open:shadow-md"
              >
                <summary className="cursor-pointer list-none py-4 text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.q}
                    <span className="text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="border-t border-line pb-4 pt-3 text-sm leading-relaxed text-muted">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* You might also like */}
      <section className="py-14 md:py-16">
        <Container>
          <SectionHeading title="You might also like" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {related.map((c, i) => (
              <Link
                key={c.slug}
                href={categoryDetailsHref(c)}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={relatedImages[i]}
                    alt={c.productName}
                    fill
                    sizes="320px"
                    quality={90}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-ink group-hover:text-hero">
                    {c.productName}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {c.description}
                  </p>
                  <p className="mt-3 text-sm font-bold text-ink">
                    <LocalizedFromPrice amount={c.startingPrice} prefix="from" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA strip */}
      <section className="border-t border-line bg-ink py-10">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/20">
              <Image
                src={clm.avatars.gusz}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold !text-white">
                Ready for your {cat.productName.toLowerCase()}?
              </p>
              <p className="text-sm !text-white/70">
                <LocalizedFromPrice
                  amount={cat.startingPrice}
                  prefix="Start from"
                />{" "}
                · Money-back guarantee
              </p>
            </div>
          </div>
          <Button href={categoryLaunchHref(cat, "gold")} variant="lime">
            Get a design
          </Button>
        </Container>
      </section>
    </>
  );
}
