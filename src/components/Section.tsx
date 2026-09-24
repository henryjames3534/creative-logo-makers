import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`container-clm ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold text-muted">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 text-base leading-relaxed text-muted md:text-lg ${
            centered ? "mx-auto max-w-xl" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
