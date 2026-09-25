import type { Metadata } from "next";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("logo-maker", "/logo-maker");

export default function LogoMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
