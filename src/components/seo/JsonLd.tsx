import { brand } from "@/data/site";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}

/** Sitewide Organization + WebSite (+ SearchAction) */
export function SiteJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand/icon-512.png"),
    email: brand.email,
    telephone: brand.phoneTel,
    sameAs: [] as string[],
    address: {
      "@type": "PostalAddress",
      streetAddress: "16192 Coastal Highway",
      addressLocality: "Lewes",
      addressRegion: "DE",
      postalCode: "19958",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: brand.phoneTel,
        contactType: "customer service",
        areaServed: "Worldwide",
        availableLanguage: ["English"],
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: brand.reviews.replace(/,/g, ""),
      bestRating: "5",
      worstRating: "1",
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": orgId },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/designers/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [organization, website],
      }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  path,
  price,
}: {
  name: string;
  description: string;
  path: string;
  price?: string;
}) {
  const amount = price
    ? Number(String(price).replace(/[^0-9.]/g, "")) || undefined
    : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: absoluteUrl(path),
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        areaServed: "Worldwide",
        ...(amount
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: String(amount),
                availability: "https://schema.org/InStock",
                url: absoluteUrl(path),
              },
            }
          : {}),
        image: absoluteUrl(DEFAULT_OG_IMAGE),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
