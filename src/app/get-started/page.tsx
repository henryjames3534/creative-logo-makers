import { Suspense } from "react";
import { GetStartedExperience } from "@/components/GetStartedExperience";

// Metadata defined in layout.tsx via pageMetadata helper

/** Static HTML for crawl — ?skill / ?package / ?designer apply client-side. */
export const revalidate = 86400;

export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStartedExperience />
    </Suspense>
  );
}
