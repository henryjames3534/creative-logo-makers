import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Page not found",
  description: "The page you requested could not be found on Creative Logo Makers.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        That link may be broken or the page may have moved. Try one of these
        instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="primary">
          Go home
        </Button>
        <Button href="/categories" variant="secondary">
          Browse categories
        </Button>
        <Link
          href="/contact"
          className="inline-flex items-center text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
}
