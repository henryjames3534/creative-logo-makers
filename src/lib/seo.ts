import type { Metadata } from "next";
import { brand } from "@/data/site";

export const SITE_URL = brand.url.replace(/\/$/, "");
export const SITE_NAME = brand.name;
export const DEFAULT_TITLE =
  "Logo Design, Web Design & Graphic Design Contests | Creative Logo Makers";
export const DEFAULT_DESCRIPTION =
  "Hire vetted designers for logos, websites, packaging, and branding. Launch a contest or 1-to-1 project — professional design from Creative Logo Makers.";

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

/** Consistent Metadata for marketing pages */
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
    alternates: { canonical: url },
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
  };
}
