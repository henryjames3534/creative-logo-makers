import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactPageClient } from "@/components/ContactPageClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Creative Logo Makers for contests, 1-to-1 projects, Studio branding, or designer applications.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted">Loading…</div>
      }
    >
      <ContactPageClient />
    </Suspense>
  );
}
