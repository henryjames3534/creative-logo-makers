"use client";

import { useLocale } from "@/components/locale/LocaleProvider";

/** Localize a USD price label (or a full phrase containing $ / US$) */
export function LocalizedPrice({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { formatPrice } = useLocale();
  return <span className={className}>{formatPrice(value)}</span>;
}

/** Prefix + amount helper: "Starting from" + "$175" → localized phrase */
export function LocalizedFromPrice({
  amount,
  prefix = "From",
  className,
}: {
  amount: string;
  prefix?: string;
  className?: string;
}) {
  const phrase = /\$|US\$/i.test(amount)
    ? `${prefix} ${amount}`.replace(/\s+/g, " ").trim()
    : `${prefix} ${amount}`;
  return <LocalizedPrice value={phrase} className={className} />;
}
