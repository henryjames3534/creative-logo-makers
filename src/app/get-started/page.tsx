import { GetStartedExperience } from "@/components/GetStartedExperience";

// Metadata defined in layout.tsx via pageMetadata helper

type Props = {
  searchParams: Promise<{
    designer?: string;
    skill?: string;
    package?: string;
    mode?: string;
  }>;
};

export default async function GetStartedPage({ searchParams }: Props) {
  const sp = await searchParams;
  const skillAliases: Record<string, string> = {
    packaging: "product-packaging-design",
    illustration: "illustrations",
    web: "web-design",
    logo: "logo-design",
  };
  const skill = sp.skill
    ? (skillAliases[sp.skill] ?? sp.skill)
    : undefined;

  return (
    <GetStartedExperience
      initialSkill={skill}
      initialPackage={sp.package}
      designerHandle={sp.designer}
    />
  );
}
