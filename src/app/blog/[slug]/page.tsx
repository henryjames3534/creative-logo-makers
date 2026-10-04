import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/BlogArticle";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  JsonLd,
} from "@/components/seo/JsonLd";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
  isBlogPublished,
} from "@/lib/blog";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** Daily refresh for scheduled posts — avoids 5-minute ISR rewrite churn. */
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Blog" };
  const published = isBlogPublished(post);
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    keywords: post.keywords,
    noIndex: !published,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post || !isBlogPublished(post)) notFound();

  const related = getRelatedBlogPosts(post);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          image: [absoluteUrl(post.coverImage)],
          datePublished: post.publishAt,
          dateModified: post.publishAt,
          author: {
            "@type": "Organization",
            name: post.author,
            url: SITE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/brand/icon-512.png"),
            },
          },
          mainEntityOfPage: url,
          keywords: post.keywords.join(", "),
          inLanguage: "en-US",
        }}
      />
      <FaqJsonLd faqs={post.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <BlogArticle post={post} related={related} />
    </>
  );
}
