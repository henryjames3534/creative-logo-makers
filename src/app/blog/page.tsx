import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  formatBlogDate,
  getAllBlogPosts,
  getPublishedBlogPosts,
} from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

/** Revalidate often so daily 2 AM PKT publishes go live without redeploy. */
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Design Blog — USA Branding & Logo Guides",
  description:
    "Practical USA-focused guides on logo design, websites, packaging, and branding from Creative Logo Makers. New articles publish daily.",
  path: "/blog",
  keywords: [
    "logo design blog USA",
    "branding tips United States",
    "website design guide",
    "Creative Logo Makers blog",
  ],
});

export default function BlogIndexPage() {
  const published = getPublishedBlogPosts();
  const upcoming = getAllBlogPosts().filter(
    (p) => !published.some((x) => x.slug === p.slug),
  );
  const [featured, ...rest] = published;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <PageHero
        eyebrow="Creative Logo Makers Blog"
        title="USA design guides that help you decide"
        description="High-intent articles on logos, websites, packaging, and branding for United States businesses. One new guide publishes daily at 2:00 AM Pakistan time."
        image={featured?.coverImage ?? "/clm/blog/colors.png"}
        accent="#2486cb"
      >
        <Button href="/get-started" variant="primary">
          Start a project
        </Button>
      </PageHero>

      <section className="py-12 md:py-16">
        <Container>
          {published.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-ink">First article drops soon</h2>
              <p className="mt-2 text-muted">
                We publish daily at 2:00 AM (Pakistan time). Check back shortly —
                {upcoming[0]
                  ? ` next up: “${upcoming[0].title}” on ${formatBlogDate(upcoming[0].publishAt)}.`
                  : null}
              </p>
            </div>
          ) : (
            <>
              {featured ? (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
                    <Image
                      src={featured.coverImage}
                      alt={featured.heroAlt}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <p className="text-xs font-bold uppercase tracking-wide text-hero">
                      Latest · {featured.primaryKeyword}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-ink md:text-3xl group-hover:text-hero">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-muted">{featured.description}</p>
                    <p className="mt-4 text-sm text-faint">
                      {formatBlogDate(featured.publishAt)} · {featured.readingMinutes}{" "}
                      min read
                    </p>
                  </div>
                </Link>
              ) : null}

              {rest.length > 0 ? (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={post.coverImage}
                          alt={post.heroAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-hero">
                          {post.primaryKeyword}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-ink group-hover:text-hero">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {post.description}
                        </p>
                        <p className="mt-3 text-xs text-faint">
                          {formatBlogDate(post.publishAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {upcoming.length > 0 && published.length > 0 ? (
            <p className="mt-10 text-center text-sm text-muted">
              Next scheduled: {upcoming[0].title} ·{" "}
              {formatBlogDate(upcoming[0].publishAt)} (2:00 AM PKT)
            </p>
          ) : null}
        </Container>
      </section>
      <CtaBand title="Want designs, not just articles?" />
    </>
  );
}
