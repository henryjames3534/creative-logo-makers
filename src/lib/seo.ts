import type { Metadata } from "next";
import { brand } from "@/data/site";
import {
  allKeywordsForSlug,
  getUsaSeoForSlug,
  USA_SEO_PILLARS,
} from "@/data/usa-seo-keywords";

export const SITE_URL = brand.url.replace(/\/$/, "");
export const SITE_NAME = brand.name;
export const DEFAULT_TITLE = USA_SEO_PILLARS.home.title;
export const DEFAULT_DESCRIPTION = USA_SEO_PILLARS.home.description;

/** Default social / OG image (absolute via metadataBase) */
export const DEFAULT_OG_IMAGE = "/showcase/hero-3.jpg";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

/** Consistent Metadata for marketing pages (en_US) */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const ogImages = [{ url: image, width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: {
      canonical: url,
      languages: { "en-US": url, en: url },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    other: {
      "geo.region": "US",
      "geo.placename": "United States",
    },
  };
}

/** Metadata for /[service]/details from USA keyword map */
export function servicePageMetadata(slug: string, path: string): Metadata {
  const seo = getUsaSeoForSlug(slug);
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path,
    keywords: allKeywordsForSlug(slug, 80),
  });
}

export function pillarPageMetadata(
  key: keyof typeof USA_SEO_PILLARS,
  path: string,
): Metadata {
  const pillar = USA_SEO_PILLARS[key];
  return pageMetadata({
    title: pillar.title,
    description: pillar.description,
    path,
    keywords: [...pillar.keywords],
  });
}
