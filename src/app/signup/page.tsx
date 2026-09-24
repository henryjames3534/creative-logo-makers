import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign up",
  description: "Create a customer account to launch contests and get updates.",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted">Loading…</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
