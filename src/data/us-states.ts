/**
 * US states (+ DC) for programmatic SEO hubs.
 * Targets phrases like "logo design California", "website design Texas".
 */

export type UsState = {
  slug: string;
  code: string;
  name: string;
  region: string;
};

export const US_STATES: UsState[] = [
  { slug: "alabama", code: "AL", name: "Alabama", region: "South" },
  { slug: "alaska", code: "AK", name: "Alaska", region: "West" },
  { slug: "arizona", code: "AZ", name: "Arizona", region: "West" },
  { slug: "arkansas", code: "AR", name: "Arkansas", region: "South" },
  { slug: "california", code: "CA", name: "California", region: "West" },
  { slug: "colorado", code: "CO", name: "Colorado", region: "West" },
  { slug: "connecticut", code: "CT", name: "Connecticut", region: "Northeast" },
  { slug: "delaware", code: "DE", name: "Delaware", region: "Northeast" },
  { slug: "florida", code: "FL", name: "Florida", region: "South" },
  { slug: "georgia", code: "GA", name: "Georgia", region: "South" },
  { slug: "hawaii", code: "HI", name: "Hawaii", region: "West" },
  { slug: "idaho", code: "ID", name: "Idaho", region: "West" },
  { slug: "illinois", code: "IL", name: "Illinois", region: "Midwest" },
  { slug: "indiana", code: "IN", name: "Indiana", region: "Midwest" },
  { slug: "iowa", code: "IA", name: "Iowa", region: "Midwest" },
  { slug: "kansas", code: "KS", name: "Kansas", region: "Midwest" },
  { slug: "kentucky", code: "KY", name: "Kentucky", region: "South" },
  { slug: "louisiana", code: "LA", name: "Louisiana", region: "South" },
  { slug: "maine", code: "ME", name: "Maine", region: "Northeast" },
  { slug: "maryland", code: "MD", name: "Maryland", region: "Northeast" },
  { slug: "massachusetts", code: "MA", name: "Massachusetts", region: "Northeast" },
  { slug: "michigan", code: "MI", name: "Michigan", region: "Midwest" },
  { slug: "minnesota", code: "MN", name: "Minnesota", region: "Midwest" },
  { slug: "mississippi", code: "MS", name: "Mississippi", region: "South" },
  { slug: "missouri", code: "MO", name: "Missouri", region: "Midwest" },
  { slug: "montana", code: "MT", name: "Montana", region: "West" },
  { slug: "nebraska", code: "NE", name: "Nebraska", region: "Midwest" },
  { slug: "nevada", code: "NV", name: "Nevada", region: "West" },
  { slug: "new-hampshire", code: "NH", name: "New Hampshire", region: "Northeast" },
  { slug: "new-jersey", code: "NJ", name: "New Jersey", region: "Northeast" },
  { slug: "new-mexico", code: "NM", name: "New Mexico", region: "West" },
  { slug: "new-york", code: "NY", name: "New York", region: "Northeast" },
  { slug: "north-carolina", code: "NC", name: "North Carolina", region: "South" },
  { slug: "north-dakota", code: "ND", name: "North Dakota", region: "Midwest" },
  { slug: "ohio", code: "OH", name: "Ohio", region: "Midwest" },
  { slug: "oklahoma", code: "OK", name: "Oklahoma", region: "South" },
  { slug: "oregon", code: "OR", name: "Oregon", region: "West" },
  { slug: "pennsylvania", code: "PA", name: "Pennsylvania", region: "Northeast" },
  { slug: "rhode-island", code: "RI", name: "Rhode Island", region: "Northeast" },
  { slug: "south-carolina", code: "SC", name: "South Carolina", region: "South" },
  { slug: "south-dakota", code: "SD", name: "South Dakota", region: "Midwest" },
  { slug: "tennessee", code: "TN", name: "Tennessee", region: "South" },
  { slug: "texas", code: "TX", name: "Texas", region: "South" },
  { slug: "utah", code: "UT", name: "Utah", region: "West" },
  { slug: "vermont", code: "VT", name: "Vermont", region: "Northeast" },
  { slug: "virginia", code: "VA", name: "Virginia", region: "South" },
  { slug: "washington", code: "WA", name: "Washington", region: "West" },
  { slug: "west-virginia", code: "WV", name: "West Virginia", region: "South" },
  { slug: "wisconsin", code: "WI", name: "Wisconsin", region: "Midwest" },
  { slug: "wyoming", code: "WY", name: "Wyoming", region: "West" },
  { slug: "district-of-columbia", code: "DC", name: "District of Columbia", region: "Northeast" },
];

/** Priority services for every state landing page */
export const STATE_SEO_SERVICES = [
  "logo-design",
  "web-design",
  "mobile-app-design",
  "landing-page-design",
  "full-service-branding",
  "product-packaging-design",
  "business-card-design",
  "social-media-page-design",
  "ios-app-design",
  "android-app-design",
  "brand-guide",
  "flyer-design",
] as const;

export type StateServiceSlug = (typeof STATE_SEO_SERVICES)[number];

export function getStateBySlug(slug: string): UsState | undefined {
  return US_STATES.find((s) => s.slug === slug);
}

export function isStateService(slug: string): slug is StateServiceSlug {
  return (STATE_SEO_SERVICES as readonly string[]).includes(slug);
}

export function statePath(stateSlug: string) {
  return `/us/state/${stateSlug}`;
}

export function stateServicePath(stateSlug: string, serviceSlug: string) {
  return `/us/state/${stateSlug}/${serviceSlug}`;
}

export function allStateServiceParams(): { state: string; service: string }[] {
  const out: { state: string; service: string }[] = [];
  for (const state of US_STATES) {
    for (const service of STATE_SEO_SERVICES) {
      out.push({ state: state.slug, service });
    }
  }
  return out;
}

/** Hot services only at build — remaining state×service pages use on-demand ISR. */
export const BUILD_TIME_STATE_SERVICES = [
  "logo-design",
  "web-design",
  "mobile-app-design",
] as const;

export function priorityStateServiceParams(): {
  state: string;
  service: string;
}[] {
  const out: { state: string; service: string }[] = [];
  for (const state of US_STATES) {
    for (const service of BUILD_TIME_STATE_SERVICES) {
      out.push({ state: state.slug, service });
    }
  }
  return out;
}

export function stateKeywords(state: UsState, serviceLabel: string): string[] {
  const s = serviceLabel.toLowerCase();
  const n = state.name;
  const c = state.code;
  return [
    `${s} ${n}`,
    `${s} in ${n}`,
    `${s} ${c}`,
    `${n} ${s}`,
    `${n} ${s} company`,
    `${n} ${s} services`,
    `best ${s} ${n}`,
    `hire ${s} designer ${n}`,
    `affordable ${s} ${n}`,
    `professional ${s} ${n}`,
    `${s} agency ${n}`,
    `${s} near me ${n}`,
    `custom ${s} ${n}`,
    `${s} for small business ${n}`,
    `${s} ${n} USA`,
  ];
}
