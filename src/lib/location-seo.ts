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
  const title = `${label} in ${city.name}, ${city.state} — Contests from ${price}`;
  const description = `Looking for ${cluster.primary} in ${city.name}, ${city.stateName}? Launch a Creative Logo Makers contest or hire a designer 1-to-1. Custom concepts for ${city.name} businesses — from ${price}.`;
  const h1 = `${label} in ${city.name}, ${city.state}`;
  const keywords = [
    primary,
    ...locationKeywords(city, cluster.primary),
    ...cluster.secondary.slice(0, 8),
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
  ];

  const intro = `Creative Logo Makers helps businesses in ${city.name}, ${city.stateName} get professional ${cluster.primary} through design contests or private 1-to-1 projects. Whether you are a local shop in ${city.name} or a growing ${city.stateName} brand, you can compare custom concepts, request revisions, and own the final files.`;

  const why = [
    `Built for US clients — pricing in USD, English support, and remote delivery to ${city.name}.`,
    `Contest mode gives ${city.name} teams multiple creative directions fast.`,
    `1-to-1 projects suit founders who already know the style they want.`,
    `Final files ready for web, print, and social — used by brands across ${city.stateName}.`,
  ];

  return {
    cat,
    cluster,
    label,
    price,
    primary,
    title,
    description,
    h1,
    keywords: [...new Set(keywords)],
    faqs,
    intro,
    why,
  };
}
