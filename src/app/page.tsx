import dynamic from "next/dynamic";
import { CategoryStrip } from "@/components/CategoryStrip";
import { HeroBanner } from "@/components/HeroBanner";

function SectionSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-paper-soft ${className}`}
      aria-hidden
    />
  );
}

const DeservesSection = dynamic(
  () =>
    import("@/components/DeservesSection").then((m) => ({
      default: m.DeservesSection,
    })),
  { loading: () => <SectionSkeleton className="h-72" /> },
);

const LogoPathsSection = dynamic(
  () =>
    import("@/components/LogoPathsSection").then((m) => ({
      default: m.LogoPathsSection,
    })),
  { loading: () => <SectionSkeleton className="h-80" /> },
);

const ExpertsMosaicSection = dynamic(
  () =>
    import("@/components/ExpertsMosaicSection").then((m) => ({
      default: m.ExpertsMosaicSection,
    })),
  { loading: () => <SectionSkeleton className="h-96" /> },
);

const RatingStrip = dynamic(
  () =>
    import("@/components/RatingStrip").then((m) => ({
      default: m.RatingStrip,
    })),
  { loading: () => <SectionSkeleton className="h-24" /> },
);

const StoriesCarousel = dynamic(
  () =>
    import("@/components/StoriesCarousel").then((m) => ({
      default: m.StoriesCarousel,
    })),
  { loading: () => <SectionSkeleton className="h-[28rem]" /> },
);

const StudioBlogSection = dynamic(
  () =>
    import("@/components/StudioBlogSection").then((m) => ({
      default: m.StudioBlogSection,
    })),
  { loading: () => <SectionSkeleton className="h-96" /> },
);

const CtaBand = dynamic(
  () =>
    import("@/components/CtaBand").then((m) => ({ default: m.CtaBand })),
  { loading: () => <SectionSkeleton className="h-40" /> },
);

const HelpFab = dynamic(() =>
  import("@/components/HelpFab").then((m) => ({ default: m.HelpFab })),
);

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryStrip />
      <DeservesSection />
      <LogoPathsSection />
      <ExpertsMosaicSection />
      <RatingStrip />
      <StoriesCarousel />
      <StudioBlogSection />
      <CtaBand />
      <HelpFab />
    </>
  );
}
