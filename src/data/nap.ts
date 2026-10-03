/**
 * Canonical Name / Address / Phone for citations, schema, and city pages.
 * Keep this identical everywhere (GBP, directories, footer, LocalBusiness).
 */
export const nap = {
  name: "Creative Logo Makers",
  legalName: "Creative Logo Makers",
  streetAddress: "16192 Coastal Highway",
  addressLocality: "Lewes",
  addressRegion: "DE",
  postalCode: "19958",
  addressCountry: "US",
  addressCountryName: "USA",
  /** Primary display phone (US formatting) — highlight everywhere */
  phoneDisplay: "+1 (469) 754-1570",
  phoneTel: "+14697541570",
  /** Secondary line */
  phoneAltDisplay: "+1 (469) 851-5003",
  phoneAltTel: "+14698515003",
  email: "info@creativelogomakers.com",
  url: "https://www.creativelogomakers.com",
} as const;

export function napAddressLine(): string {
  return `${nap.streetAddress}, ${nap.addressLocality}, ${nap.addressRegion} ${nap.postalCode}`;
}

/** Matches historic site copy used in footer / contact */
export function napAddressFull(): string {
  return `${nap.addressCountryName}: ${napAddressLine()}`;
}

export function napPostalAddress() {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: nap.streetAddress,
    addressLocality: nap.addressLocality,
    addressRegion: nap.addressRegion,
    postalCode: nap.postalCode,
    addressCountry: nap.addressCountry,
  };
}
