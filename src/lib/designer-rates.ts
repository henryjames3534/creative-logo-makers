import { ninetyNineDesignPrices, type PackageTier } from "@/data/packages";
import type { DesignerLevel, DesignerProfile } from "@/data/designers-types";

function parseMoney(s: string): number {
  return Number(String(s).replace(/[^0-9]/g, "")) || 249;
}

export function levelRateMultiplier(level: DesignerLevel): number {
  if (level === "top") return 1.35;
  if (level === "mid") return 1.12;
  return 1;
}

/** Unique starting price for a designer + skill (99d category bronze × level). */
export function startingPriceAmount(
  skill: string,
  level: DesignerLevel,
  seed = 0,
): number {
  const tier =
    ninetyNineDesignPrices[skill] ?? ninetyNineDesignPrices["logo-design"];
  const base = parseMoney(tier.bronze);
  const bump = (Math.abs(seed) % 9) * 10;
  return Math.round((base * levelRateMultiplier(level) + bump) / 10) * 10;
}

export function formatFromPrice(amount: number): string {
  return `From $${amount.toLocaleString("en-US")}`;
}

export function designerStartingRate(d: DesignerProfile): string {
  const skill = d.skills[0] || "logo-design";
  const seed = Number(d.profileId || d.id) || d.reviews;
  return formatFromPrice(startingPriceAmount(skill, d.level, seed));
}

export function designerSkillRates(d: DesignerProfile): {
  skill: string;
  from: string;
  amount: number;
}[] {
  const seed = Number(d.profileId || d.id) || d.reviews;
  const skills = d.skills.length ? d.skills : ["logo-design"];
  return [...new Set(skills)].slice(0, 10).map((skill, i) => {
    const amount = startingPriceAmount(skill, d.level, seed + i * 17);
    return { skill, amount, from: formatFromPrice(amount) };
  });
}

/** 1-to-1 packages priced for this designer + selected skill */
export function designerProjectPackages(
  d: DesignerProfile,
  skill?: string,
): PackageTier[] {
  const s = skill && ninetyNineDesignPrices[skill] ? skill : d.skills[0] || "logo-design";
  const tier = ninetyNineDesignPrices[s] ?? ninetyNineDesignPrices["logo-design"];
  const seed = Number(d.profileId || d.id) || d.reviews;
  const mult = levelRateMultiplier(d.level);
  const essential = Math.round((parseMoney(tier.bronze) * mult + (seed % 9) * 10) / 10) * 10;
  const growth = Math.round((parseMoney(tier.silver) * mult + (seed % 7) * 15) / 10) * 10;
  const pro = Math.round((parseMoney(tier.gold) * mult) / 10) * 10;

  return [
    {
      id: "essential",
      name: "Essential Project",
      price: `$${essential.toLocaleString("en-US")}`,
      compareAtPrice: `$${(essential * 2).toLocaleString("en-US")}`,
      blurb: `1-to-1 with ${d.name} — one focused deliverable.`,
      bestFor: "Single assets",
      features: [
        `Work directly with ${d.name}`,
        "1 primary deliverable",
        "2 revision rounds",
        "Milestone-based payments",
        "Private chat collaboration",
      ],
    },
    {
      id: "growth",
      name: "Growth Project",
      price: `$${growth.toLocaleString("en-US")}`,
      compareAtPrice: `$${(growth * 2).toLocaleString("en-US")}`,
      featured: true,
      blurb: "Multi-asset pack with deeper iteration.",
      bestFor: "Launch kits",
      features: [
        `${d.level === "top" ? "Top Level" : d.level === "mid" ? "Mid Level" : "Entry Level"} designer`,
        "Up to 3 related deliverables",
        "Unlimited revisions in scope",
        "Brand consistency check",
        "Source files included",
      ],
    },
    {
      id: "pro",
      name: "Pro Project",
      price: `$${pro.toLocaleString("en-US")}`,
      compareAtPrice: `$${(pro * 2).toLocaleString("en-US")}`,
      blurb: "Senior scope for complex brand or product work.",
      bestFor: "Complex briefs",
      features: [
        "Extended collaboration window",
        "Priority turnaround",
        "Full source + export package",
        "Strategy check-in call",
        "Post-delivery polish pass",
      ],
    },
  ];
}

export function designerExperience(d: DesignerProfile) {
  const seed = Number(d.profileId || d.id) || d.reviews * 13;
  return {
    contestsWon: 8 + (seed % 40),
    runnerUp: 5 + (seed % 35),
    oneToOne: d.projects,
    repeatClients: 10 + (seed % 50),
    responseRate: `${55 + (seed % 40)}%`,
    memberSince: `Member since ${2010 + (seed % 14)}`,
    tagline:
      d.specialty.length > 8
        ? d.specialty.slice(0, 60)
        : `${d.name} — ${d.skills[0]?.replace(/-/g, " ") || "design"} specialist`,
  };
}
