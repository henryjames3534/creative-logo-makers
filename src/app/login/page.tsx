import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description: "Sign in to track your design contests and service updates.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
