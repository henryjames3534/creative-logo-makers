import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefWizard } from "@/components/launch/BriefWizard";
import { getPackageById } from "@/data/briefs";
import {
  getDesignerByHandle,
  getDesignerById,
} from "@/data/designers";
import {
  allServicePaths,
  getCategoryByServicePath,
} from "@/data/serviceRoutes";
import { designerProjectPackages } from "@/lib/designer-rates";
import { pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    package?: string;
    designer?: string;
    hire?: string;
  }>;
};

export function generateStaticParams() {
  return allServicePaths().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { hire, designer: designerParam } = await searchParams;
  const cat = getCategoryByServicePath(slug);
  if (!cat) return { title: "Launch contest" };
  const isDirect = hire === "direct" && Boolean(designerParam);
  return pageMetadata({
    title: isDirect
      ? `Hire for ${cat.productName}`
      : `Launch a ${cat.productName} contest`,
    description: isDirect
      ? `Start a 1-to-1 ${cat.productName} project with your chosen designer.`
      : `Create your visual brief for a ${cat.productName} contest.`,
    path: `/launch/${cat.slug}`,
    noIndex: true, // personalized funnel — keep out of index
  });
}

/** /launch/logo-design?package=gold — contest
 *  /launch/logo-design?package=growth&hire=direct&designer=554690 — 1-to-1 hire */
export default async function LaunchBriefPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const {
    package: packageId,
    designer: designerParam,
    hire,
  } = await searchParams;
  const cat = getCategoryByServicePath(slug);
  if (!cat) notFound();

  const designer = designerParam
    ? getDesignerById(designerParam) || getDesignerByHandle(designerParam)
    : undefined;
  const isDirect = hire === "direct" && Boolean(designer);

  let pkg = getPackageById(packageId, cat.slug);
  if (isDirect && designer) {
    const dPkgs = designerProjectPackages(designer, cat.slug);
    pkg =
      dPkgs.find((p) => p.id === packageId) ??
      dPkgs.find((p) => p.featured) ??
      dPkgs[0] ??
      pkg;
  }

  return (
    <BriefWizard
      category={cat}
      pkg={pkg}
      hireDesigner={isDirect ? designer : undefined}
    />
  );
}
