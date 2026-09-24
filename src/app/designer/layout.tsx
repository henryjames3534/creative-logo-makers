import type { Metadata } from "next";
import { DesignerShell } from "@/components/designer/DesignerShell";

export const metadata: Metadata = {
  title: "Designer portal",
  robots: { index: false, follow: false },
};

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesignerShell>{children}</DesignerShell>;
}
