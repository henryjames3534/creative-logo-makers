import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import {
  formatBlogDate,
  type BlogPost,
} from "@/lib/blog";

export function BlogArticle({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  return (
    <article className="pb-16">
      <header className="border-b border-line bg-[#f8f7f5]">
        <Container className="py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-wide text-hero">
            Blog · {post.primaryKeyword}
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-ink md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted md:text-lg">
            {post.description}
          </p>
          <p className="mt-4 text-sm text-muted">
            By {post.author} · {formatBlogDate(post.publishAt)} ·{" "}
            {post.readingMinutes} min read
          </p>
        </Container>
        <div className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden border-y border-line md:rounded-2xl md:border">
          <Image
            src={post.coverImage}
            alt={post.heroAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
      </header>

      <Container className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <p className="text-lg leading-relaxed text-ink">{post.intro}</p>

          {post.sections.map((sec) => {
            const id = sec.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
            <section key={sec.heading} id={id} className="mt-10 scroll-mt-24">
              <h2 className="text-2xl font-bold text-ink">{sec.heading}</h2>
              {sec.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="mt-3 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {sec.bullets.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
                  {sec.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
          })}

          <section className="mt-12 rounded-2xl border border-line bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold text-ink">FAQ</h2>
            <div className="mt-4 space-y-5">
              {post.faqs.map((f) => (
                <div key={f.question}>
                  <h3 className="text-base font-semibold text-ink">{f.question}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl bg-ink px-6 py-8 text-white md:px-8">
            <h2 className="text-2xl font-bold">{post.cta.title}</h2>
            <p className="mt-2 text-white/80">{post.cta.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={post.cta.primaryHref} variant="lime">
                {post.cta.primaryLabel}
              </Button>
              <Button
                href={post.cta.secondaryHref}
                variant="secondary"
                className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              >
                {post.cta.secondaryLabel}
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-faint">
              On this page
            </p>
            <nav className="mt-3 space-y-2 text-sm">
              {post.sections.map((sec) => (
                <a
                  key={sec.heading}
                  href={`#${sec.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="block text-muted hover:text-hero"
                >
                  {sec.heading}
                </a>
              ))}
            </nav>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-faint">
              Related services
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href={post.servicePath} className="block font-medium text-hero hover:underline">
                {post.serviceSlug.replace(/-/g, " ")}
              </Link>
              <Link href={post.usaPath} className="block text-muted hover:text-hero">
                USA keyword page
              </Link>
              <Link href="/get-started" className="block text-muted hover:text-hero">
                Start a project
              </Link>
            </div>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <Container className="mt-16">
          <h2 className="text-2xl font-bold text-ink">More from the blog</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={r.coverImage}
                    alt={r.heroAlt}
                    fill
                    sizes="33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-hero">
                    {r.primaryKeyword}
                  </p>
                  <h3 className="mt-1 font-bold text-ink group-hover:text-hero">
                    {r.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
