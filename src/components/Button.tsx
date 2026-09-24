import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  primary:
    "bg-cta !text-white hover:bg-cta-hover hover:!text-white",
  secondary:
    "border border-line bg-white !text-ink hover:border-ink/40 hover:!text-ink",
  ghost: "!text-ink hover:!text-green underline-offset-4 hover:underline",
  lime: "bg-green !text-white hover:bg-green-hover hover:!text-white",
  green: "bg-green !text-white hover:bg-green-hover hover:!text-white",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
