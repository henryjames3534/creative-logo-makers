import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Get Started — Logo, Website & App Design USA",
  description:
    "Start a logo design, website design, or mobile app design project in the USA. Choose contest or 1-to-1 and launch your brief today.",
  path: "/get-started",
  keywords: [
    "start logo design",
    "hire web designer",
    "mobile app design project",
    "design contest USA",
  ],
});

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
