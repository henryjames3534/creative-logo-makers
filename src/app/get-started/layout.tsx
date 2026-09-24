import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Get Started",
  description:
    "Choose contest, 1-to-1, or Studio — pick a category and package, then launch your visual brief.",
  path: "/get-started",
});

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
