import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Logo Maker",
  description:
    "Create a logo in minutes with the free Logo Maker — then level up with professional designers.",
  path: "/logo-maker",
  keywords: ["free logo maker", "logo generator", "create logo online"],
});

export default function LogoMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
