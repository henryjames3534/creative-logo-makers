import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { clm } from "@/data/clm-assets";

const posts = [
  {
    title:
      "Celebrating Queer Art: reimagining iconic logos in the style of renowned queer artists",
    read: "23 minute read",
    tag: "Brand",
    image: clm.blog.queer,
  },
  {
    title: "Colors and emotions: how colors make you feel",
    read: "9 minute read",
    tag: "Tips",
    image: clm.blog.colors,
  },
  {
    title:
      "26 bad packaging design examples (and ideas for how to improve them)",
    read: "15 minute read",
    tag: "Packaging",
    image: clm.blog.packaging,
  },
];

const studioPerks = [
  "Brand strategy",
  "Full identity",
  "Launch packages",
];

/** Advanced Studio + blog side-by-side */
export function StudioBlogSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 60% at 10% 30%, rgba(62, 0, 205, 0.06), transparent 55%),
            radial-gradient(ellipse 45% 50% at 90% 70%, rgba(36, 134, 203, 0.07), transparent 55%),
            linear-gradient(180deg, #ffffff 0%, #f8f7f5 50%, #ffffff 100%)
          `,
        }}
      />

      <Container className="relative z-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Studio */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet">
              Creative Logo Makers Studio
            </p>
            <h2 className="mt-2 text-[1.45rem] font-medium tracking-tight text-ink md:text-[1.65rem]">
              Work with our branding agency
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/75">
              Our experienced Brand Strategists offer full-service packages so
              you can look established for launch and get setup for a decade.
            </p>

            <Link
              href="/studio"
              className="group relative mt-6 block overflow-hidden rounded-2xl bg-ink shadow-lg ring-1 ring-ink/5 transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={clm.studio}
                  alt="Brand Strategist"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  quality={90}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                <div className="studio-badge absolute left-4 top-4 flex items-center gap-2 rounded-full bg-violet px-3 py-1.5 text-xs font-semibold !text-white shadow-md">
                  <span className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-white/40">
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

                <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                  {studioPerks.map((perk) => (
                    <span
                      key={perk}
                      className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium !text-white backdrop-blur-md"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/studio" variant="primary">
                Learn more
              </Button>
              <Link
                href="/contact"
                className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
              >
                Talk to a strategist →
              </Link>
            </div>
          </div>

          {/* Blog */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue">
              From the blog
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h2 className="text-[1.45rem] font-medium tracking-tight text-ink md:text-[1.65rem]">
                Tips, trends and tons of inspiration
              </h2>
            </div>

            <ul className="mt-6 space-y-3">
              {posts.map((post, i) => (
                <li key={post.title}>
                  <Link
                    href="/inspiration"
                    className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white/70 p-3 shadow-sm ring-1 ring-ink/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-line hover:bg-white hover:shadow-md"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl md:h-20 md:w-20">
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex rounded-full bg-paper-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                        {post.tag}
                      </span>
                      <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-hero">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{post.read}</p>
                    </div>
                    <span className="hidden shrink-0 text-ink/30 transition-all group-hover:translate-x-0.5 group-hover:text-hero sm:block">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/inspiration"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:border-ink/30 hover:shadow-md"
            >
              Take me to the blog!
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
