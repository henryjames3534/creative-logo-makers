import { getCategory } from "@/data/categories";
import { getUsaSeoForSlug } from "@/data/usa-seo-keywords";
import {
  stateKeywords,
  type UsState,
} from "@/data/us-states";

export function buildStateServiceSeo(state: UsState, serviceSlug: string) {
  const cat = getCategory(serviceSlug);
  const cluster = getUsaSeoForSlug(serviceSlug);
  const label = cat?.productName || cluster.primary;
  const price = cat?.startingPrice || "$249";
  const primary = `${cluster.primary} ${state.name}`;
  const title = `${label} in ${state.name} (${state.code}) — Contests from ${price}`;
  const description = `Professional ${cluster.primary} in ${state.name}. Creative Logo Makers contests and 1-to-1 projects for ${state.name} businesses — custom concepts from ${price}, delivered remotely across the USA.`;
  const h1 = `${label} in ${state.name}`;
  const keywords = [
    primary,
    ...stateKeywords(state, cluster.primary),
    ...cluster.secondary.slice(0, 10),
    ...cluster.longTail.slice(0, 8),
  ];

  const faqs = [
    {
      question: `How much does ${cluster.primary} cost in ${state.name}?`,
      answer: `${label} contests start from ${price}. ${state.name} startups and small businesses usually pick Bronze–Gold based on concept volume and revisions.`,
    },
    {
      question: `Can I hire ${cluster.primary} talent for a ${state.name} company?`,
      answer: `Yes. Run a contest for multiple directions or hire one designer 1-to-1. Mention ${state.name} customers and local competitors in your brief for relevant concepts.`,
    },
    {
      question: `Do designers need to be based in ${state.name}?`,
      answer: `No. Creative Logo Makers is remote-first across the USA. ${state.name} clients brief online, review concepts, request revisions, and download files digitally.`,
    },
    {
      question: `What industries in ${state.name} use Creative Logo Makers?`,
      answer: `Retail, SaaS, restaurants, professional services, e-commerce, and local service brands across ${state.name} use contests for ${cluster.primary} and related creative.`,
    },
  ];

  const intro = `Looking for ${cluster.primary} in ${state.name}? Creative Logo Makers helps ${state.name} (${state.code}) businesses launch design contests or hire designers 1-to-1 — with USD pricing, English support, and remote delivery anywhere in the United States.`;

  const why = [
    `Rank-ready ${cluster.primary} pages tailored for ${state.name} search intent.`,
    `Contest mode gives ${state.name} teams multiple creative directions quickly.`,
    `1-to-1 hire for founders who already know the look they want.`,
    `Final files for web, print, and social — used by brands across ${state.name}.`,
  ];

  const industries = [
    "Startups & SaaS",
    "Restaurants & hospitality",
    "Real estate",
    "Health & fitness",
    "Retail & e-commerce",
    "Professional services",
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
    industries,
  };
}
