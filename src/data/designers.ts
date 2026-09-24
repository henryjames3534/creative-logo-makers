import type { DesignerLevel, DesignerProfile } from "./designers-types";
export type { DesignerLevel, DesignerProfile } from "./designers-types";
import { designers } from "./designers-catalog";
export { designers };

export {
  designerBrowseIndustries,
  designerBrowseSections,
  designerCategoryTree,
  designerCertifications,
  designerCountries,
  designerHeroImage,
  designerIndustryFilters,
  designerLanguages,
  designerLevels,
  designerNeedChips,
  designerSkillFilters,
  levelLabel,
  skillLabel,
} from "./designers-meta";

export function filterDesigners(input: {
  q?: string;
  skill?: string;
  level?: DesignerLevel | "all";
  country?: string;
  industry?: string;
  language?: string;
  availableOnly?: boolean;
  onlineOnly?: boolean;
}): DesignerProfile[] {
  const q = (input.q ?? "").trim().toLowerCase();
  const skill = input.skill && input.skill !== "all" && input.skill !== "minimal" && input.skill !== "online" ? input.skill : "";
  const level = input.level && input.level !== "all" ? input.level : "";
  const country =
    input.country && input.country !== "all" ? input.country : "";
  const industry =
    input.industry && input.industry !== "all" ? input.industry : "";
  const language =
    input.language && input.language !== "all" ? input.language : "";

  return designers.filter((d) => {
    if (level && d.level !== level) return false;
    if (country && d.countryCode !== country) return false;
    if (skill && !d.skills.includes(skill)) return false;
    if (industry && !d.industries.includes(industry)) return false;
    if (language && !d.languages.includes(language)) return false;
    if (input.availableOnly && !d.available) return false;
    if (input.onlineOnly && !d.online) return false;
    if (input.skill === "online" && !d.online) return false;
    if (input.skill === "minimal") {
      // approximate "minimal style" using name/specialty keywords
      const hay = (d.specialty + " " + d.bio).toLowerCase();
      if (!/minimal|clean|simple|line|geometric/.test(hay) && d.rating < 4.9)
        return false;
    }
    if (!q) return true;
    const blob = [
      d.name,
      d.handle,
      d.specialty,
      d.location,
      d.country,
      d.bio,
      ...(d.sampleAlts ?? []),
      ...d.skills,
      ...d.industries,
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function getDesignerById(id: string) {
  return designers.find((d) => d.id === id);
}

export function getDesignerByHandle(handle: string) {
  const h = handle.toLowerCase();
  return designers.find(
    (d) =>
      d.handle.toLowerCase() === h ||
      d.name.toLowerCase() === h ||
      d.id === handle,
  );
}


