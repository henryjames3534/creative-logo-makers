import type { Metadata } from "next";
import { AccountDashboard } from "@/components/auth/AccountDashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "My account",
  description:
    "Track purchases, contest progress, designer concepts, revisions, and admin updates.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return <AccountDashboard />;
}
