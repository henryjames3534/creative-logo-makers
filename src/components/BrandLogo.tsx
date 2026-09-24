"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_LOGO,
  getSiteLogo,
  onSiteLogoChange,
} from "@/lib/site-brand";

/** Creative Logo Makers — live from admin upload or default asset */
export function BrandLogo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const width = compact ? 150 : 190;
  const height = compact ? 50 : 64;
  const [src, setSrc] = useState(DEFAULT_SITE_LOGO);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSrc(getSiteLogo().src);
    setReady(true);
    return onSiteLogoChange((logo) => setSrc(logo.src || DEFAULT_SITE_LOGO));
  }, []);

  const isData = src.startsWith("data:");

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="Creative Logo Makers"
    >
      {ready && isData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Creative Logo Makers"
          width={width}
          height={height}
          className={`h-auto w-auto object-contain object-left ${
            compact ? "max-h-10" : "max-h-12"
          }`}
        />
      ) : (
        <Image
          src={src.startsWith("data:") ? DEFAULT_SITE_LOGO : src}
          alt="Creative Logo Makers"
          width={width}
          height={height}
          priority
          unoptimized
          className={`h-auto w-auto object-contain object-left ${
            compact ? "max-h-10" : "max-h-12"
          }`}
        />
      )}
    </Link>
  );
}
