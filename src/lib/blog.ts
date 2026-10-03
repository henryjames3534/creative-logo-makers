import postsJson from "@/data/blog/posts.json";

export type BlogFaq = { question: string; answer: string };

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  keywords: string[];
  serviceSlug: string;
  servicePath: string;
  usaPath: string;
  tags: string[];
  author: string;
  publishAt: string;
  dayIndex: number;
  readingMinutes: number;
  heroAlt: string;
  coverImage: string;
  intro: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
  cta: {
    title: string;
    body: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
  };
};

const ALL_POSTS = postsJson as BlogPost[];

/** Pakistan Standard Time (UTC+5) — schedule reference timezone. */
export const BLOG_TZ = "Asia/Karachi";

export function getAllBlogPosts(): BlogPost[] {
  return ALL_POSTS.slice().sort(
    (a, b) =>
      new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime(),
  );
}

export function isBlogPublished(
  post: BlogPost,
  now: Date = new Date(),
): boolean {
  return new Date(post.publishAt).getTime() <= now.getTime();
}

export function getPublishedBlogPosts(now: Date = new Date()): BlogPost[] {
  return getAllBlogPosts().filter((p) => isBlogPublished(p, now));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

export function getRelatedBlogPosts(
  post: BlogPost,
  now: Date = new Date(),
  limit = 3,
): BlogPost[] {
  return getPublishedBlogPosts(now)
    .filter((p) => p.slug !== post.slug)
    .filter(
      (p) =>
        p.serviceSlug === post.serviceSlug ||
        p.tags.some((t) => post.tags.includes(t)),
    )
    .slice(0, limit);
}

export function formatBlogDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BLOG_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
