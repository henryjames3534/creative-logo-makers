import { getCategory } from "@/data/categories";
import { getUsaSeoForSlug } from "@/data/usa-seo-keywords";
import {
  locationKeywords,
  type UsCity,
} from "@/data/us-locations";

export function buildLocationSeo(city: UsCity, serviceSlug: string) {
  const cat = getCategory(serviceSlug);
  const cluster = getUsaSeoForSlug(serviceSlug);
  const label = cat?.productName || cluster.primary;
  const price = cat?.startingPrice || "$249";
  const primary = `${cluster.primary} ${city.name}`;
  const description = `Looking for ${cluster.primary} in ${city.name}, ${city.stateName}? Launch a Creative Logo Makers contest or hire a designer 1-to-1. Custom concepts for ${city.name} businesses — from ${price}.`;
  const h1 = `${label} in ${city.name}, ${city.state}`;
  const keywords = [
    primary,
    ...locationKeywords(city, cluster.primary),
    ...cluster.secondary.slice(0, 12),
    ...cluster.longTail.slice(0, 10),
    `${cluster.primary} near me`,
    `best ${cluster.primary} company ${city.name}`,
    `${city.name} ${cluster.primary} agency`,
  ];
  const faqs = [
    {
      question: `How much does ${cluster.primary} cost in ${city.name}?`,
      answer: `${label} contests on Creative Logo Makers start from ${price}. ${city.name} startups and small businesses typically choose Bronze–Gold packages depending on how many concepts and revisions they need.`,
    },
    {
      question: `Can I hire a ${cluster.primary} designer for a ${city.name} business?`,
      answer: `Yes. You can run a nationwide contest or hire one designer 1-to-1. Briefs often mention ${city.name} audience, local competitors, and ${city.stateName} market tone so concepts feel relevant.`,
    },
    {
      question: `Do I need to meet designers in ${city.name}?`,
      answer: `No. Creative Logo Makers is remote-first. ${city.name} clients brief online, review concepts in their dashboard, request revisions, and download final files — no in-person meeting required.`,
    },
    {
      question: `How fast can I get ${cluster.primary} for my ${city.name} brand?`,
      answer: `Most contests start receiving concepts within a few days. Share your ${city.name} launch deadline in the brief and designers will prioritize accordingly.`,
    },
    {
      question: `Is ${cluster.primary} in ${city.name} good for startups?`,
      answer: `Yes. Many ${city.name} founders use contests to explore directions quickly before locking a brand system. You can start lean and upgrade packages as you grow.`,
    },
    {
      question: `What files do I get for ${cluster.primary} in ${city.name}?`,
      answer: `Completed projects typically include web and print-ready exports plus editable source files so your ${city.name} team can use the work across website, packaging, and ads.`,
    },
  ];

  const intro = `Creative Logo Makers helps businesses in ${city.name}, ${city.stateName} get professional ${cluster.primary} through design contests or private 1-to-1 projects. Whether you are a local shop in ${city.name} or a growing ${city.stateName} brand, you can compare custom concepts, request revisions, and own the final files. Searchers looking for “${cluster.primary} near me” in ${city.name} use our remote contest model to hire vetted US-friendly talent without agency overhead.`;

  const why = [
    `Built for US clients — pricing in USD, English support, and remote delivery to ${city.name}.`,
    `Contest mode gives ${city.name} teams multiple creative directions fast.`,
    `1-to-1 projects suit founders who already know the style they want.`,
    `Final files ready for web, print, and social — used by brands across ${city.stateName}.`,
    `Strong fit for ${city.name} startups, local services, and e-commerce brands competing nationally.`,
  ];

  const relatedSearches = [
    `${cluster.primary} ${city.name}`,
    `${cluster.primary} near me`,
    `hire ${cluster.primary} designer ${city.name}`,
    `best ${cluster.primary} ${city.name}`,
    `affordable ${cluster.primary} ${city.stateName}`,
    `${city.name} ${cluster.primary} company`,
  ];

  const industries = [
    "Local retail & services",
    "Startups & SaaS",
    "Restaurants & hospitality",
    "Real estate & professionals",
    "Health, fitness & wellness",
    "E-commerce & DTC brands",
  ];

  return {
    cat,
    cluster,
    label,
    price,
    primary,
    title: `${label} in ${city.name}, ${city.state} (2026) — Contests from ${price}`,
    description,
    h1,
    keywords: [...new Set(keywords)],
    faqs,
    intro,
    why,
    relatedSearches,
    industries,
  };
}
