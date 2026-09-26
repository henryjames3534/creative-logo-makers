/**
 * Top US metros for programmatic SEO location pages.
 * Used by /us/[city]/[service] ranking pages.
 */

export type UsCity = {
  slug: string;
  name: string;
  state: string;
  stateName: string;
  region: string;
};

/** Priority services that get a page in every city */
export const LOCATION_SEO_SERVICES = [
  "logo-design",
  "web-design",
  "mobile-app-design",
  "ios-app-design",
  "android-app-design",
  "landing-page-design",
  "product-packaging-design",
  "business-card-design",
  "social-media-page-design",
  "t-shirt-design",
  "book-cover-design",
  "brand-guide",
  "full-service-branding",
  "wordpress-theme-design",
  "flyer-design",
  "illustrations",
  "app-icon-design",
  "brochure-design",
] as const;

export type LocationServiceSlug = (typeof LOCATION_SEO_SERVICES)[number];

export const US_CITIES: UsCity[] = [
  { slug: "new-york", name: "New York", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "los-angeles", name: "Los Angeles", state: "CA", stateName: "California", region: "West" },
  { slug: "chicago", name: "Chicago", state: "IL", stateName: "Illinois", region: "Midwest" },
  { slug: "houston", name: "Houston", state: "TX", stateName: "Texas", region: "South" },
  { slug: "phoenix", name: "Phoenix", state: "AZ", stateName: "Arizona", region: "West" },
  { slug: "philadelphia", name: "Philadelphia", state: "PA", stateName: "Pennsylvania", region: "Northeast" },
  { slug: "san-antonio", name: "San Antonio", state: "TX", stateName: "Texas", region: "South" },
  { slug: "san-diego", name: "San Diego", state: "CA", stateName: "California", region: "West" },
  { slug: "dallas", name: "Dallas", state: "TX", stateName: "Texas", region: "South" },
  { slug: "san-jose", name: "San Jose", state: "CA", stateName: "California", region: "West" },
  { slug: "austin", name: "Austin", state: "TX", stateName: "Texas", region: "South" },
  { slug: "jacksonville", name: "Jacksonville", state: "FL", stateName: "Florida", region: "South" },
  { slug: "fort-worth", name: "Fort Worth", state: "TX", stateName: "Texas", region: "South" },
  { slug: "columbus", name: "Columbus", state: "OH", stateName: "Ohio", region: "Midwest" },
  { slug: "charlotte", name: "Charlotte", state: "NC", stateName: "North Carolina", region: "South" },
  { slug: "san-francisco", name: "San Francisco", state: "CA", stateName: "California", region: "West" },
  { slug: "indianapolis", name: "Indianapolis", state: "IN", stateName: "Indiana", region: "Midwest" },
  { slug: "seattle", name: "Seattle", state: "WA", stateName: "Washington", region: "West" },
  { slug: "denver", name: "Denver", state: "CO", stateName: "Colorado", region: "West" },
  { slug: "washington-dc", name: "Washington", state: "DC", stateName: "District of Columbia", region: "Northeast" },
  { slug: "boston", name: "Boston", state: "MA", stateName: "Massachusetts", region: "Northeast" },
  { slug: "el-paso", name: "El Paso", state: "TX", stateName: "Texas", region: "South" },
  { slug: "nashville", name: "Nashville", state: "TN", stateName: "Tennessee", region: "South" },
  { slug: "detroit", name: "Detroit", state: "MI", stateName: "Michigan", region: "Midwest" },
  { slug: "oklahoma-city", name: "Oklahoma City", state: "OK", stateName: "Oklahoma", region: "South" },
  { slug: "portland", name: "Portland", state: "OR", stateName: "Oregon", region: "West" },
  { slug: "las-vegas", name: "Las Vegas", state: "NV", stateName: "Nevada", region: "West" },
  { slug: "memphis", name: "Memphis", state: "TN", stateName: "Tennessee", region: "South" },
  { slug: "louisville", name: "Louisville", state: "KY", stateName: "Kentucky", region: "South" },
  { slug: "baltimore", name: "Baltimore", state: "MD", stateName: "Maryland", region: "Northeast" },
  { slug: "milwaukee", name: "Milwaukee", state: "WI", stateName: "Wisconsin", region: "Midwest" },
  { slug: "albuquerque", name: "Albuquerque", state: "NM", stateName: "New Mexico", region: "West" },
  { slug: "tucson", name: "Tucson", state: "AZ", stateName: "Arizona", region: "West" },
  { slug: "fresno", name: "Fresno", state: "CA", stateName: "California", region: "West" },
  { slug: "sacramento", name: "Sacramento", state: "CA", stateName: "California", region: "West" },
  { slug: "mesa", name: "Mesa", state: "AZ", stateName: "Arizona", region: "West" },
  { slug: "kansas-city", name: "Kansas City", state: "MO", stateName: "Missouri", region: "Midwest" },
  { slug: "atlanta", name: "Atlanta", state: "GA", stateName: "Georgia", region: "South" },
  { slug: "miami", name: "Miami", state: "FL", stateName: "Florida", region: "South" },
  { slug: "omaha", name: "Omaha", state: "NE", stateName: "Nebraska", region: "Midwest" },
  { slug: "raleigh", name: "Raleigh", state: "NC", stateName: "North Carolina", region: "South" },
  { slug: "minneapolis", name: "Minneapolis", state: "MN", stateName: "Minnesota", region: "Midwest" },
  { slug: "tampa", name: "Tampa", state: "FL", stateName: "Florida", region: "South" },
  { slug: "orlando", name: "Orlando", state: "FL", stateName: "Florida", region: "South" },
  { slug: "cleveland", name: "Cleveland", state: "OH", stateName: "Ohio", region: "Midwest" },
  { slug: "anaheim", name: "Anaheim", state: "CA", stateName: "California", region: "West" },
  { slug: "honolulu", name: "Honolulu", state: "HI", stateName: "Hawaii", region: "West" },
  { slug: "pittsburgh", name: "Pittsburgh", state: "PA", stateName: "Pennsylvania", region: "Northeast" },
  { slug: "cincinnati", name: "Cincinnati", state: "OH", stateName: "Ohio", region: "Midwest" },
  { slug: "salt-lake-city", name: "Salt Lake City", state: "UT", stateName: "Utah", region: "West" },
  { slug: "st-louis", name: "St. Louis", state: "MO", stateName: "Missouri", region: "Midwest" },
  { slug: "richmond", name: "Richmond", state: "VA", stateName: "Virginia", region: "South" },
  { slug: "new-orleans", name: "New Orleans", state: "LA", stateName: "Louisiana", region: "South" },
  { slug: "brooklyn", name: "Brooklyn", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "manhattan", name: "Manhattan", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "long-island", name: "Long Island", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "orange-county", name: "Orange County", state: "CA", stateName: "California", region: "West" },
  { slug: "silicon-valley", name: "Silicon Valley", state: "CA", stateName: "California", region: "West" },
  { slug: "brooklyn-heights", name: "Brooklyn Heights", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "queens", name: "Queens", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "bronx", name: "Bronx", state: "NY", stateName: "New York", region: "Northeast" },
  { slug: "jersey-city", name: "Jersey City", state: "NJ", stateName: "New Jersey", region: "Northeast" },
  { slug: "newark", name: "Newark", state: "NJ", stateName: "New Jersey", region: "Northeast" },
  { slug: "tampa-bay", name: "Tampa Bay", state: "FL", stateName: "Florida", region: "South" },
  { slug: "fort-lauderdale", name: "Fort Lauderdale", state: "FL", stateName: "Florida", region: "South" },
  { slug: "scottsdale", name: "Scottsdale", state: "AZ", stateName: "Arizona", region: "West" },
  { slug: "plano", name: "Plano", state: "TX", stateName: "Texas", region: "South" },
  { slug: "arlington-tx", name: "Arlington", state: "TX", stateName: "Texas", region: "South" },
  { slug: "irving", name: "Irving", state: "TX", stateName: "Texas", region: "South" },
  { slug: "oakland", name: "Oakland", state: "CA", stateName: "California", region: "West" },
  { slug: "long-beach", name: "Long Beach", state: "CA", stateName: "California", region: "West" },
  { slug: "santa-monica", name: "Santa Monica", state: "CA", stateName: "California", region: "West" },
  { slug: "pasadena", name: "Pasadena", state: "CA", stateName: "California", region: "West" },
  { slug: "boise", name: "Boise", state: "ID", stateName: "Idaho", region: "West" },
  { slug: "des-moines", name: "Des Moines", state: "IA", stateName: "Iowa", region: "Midwest" },
  { slug: "grand-rapids", name: "Grand Rapids", state: "MI", stateName: "Michigan", region: "Midwest" },
  { slug: "madison", name: "Madison", state: "WI", stateName: "Wisconsin", region: "Midwest" },
  { slug: "charleston", name: "Charleston", state: "SC", stateName: "South Carolina", region: "South" },
  { slug: "savannah", name: "Savannah", state: "GA", stateName: "Georgia", region: "South" },
  { slug: "birmingham", name: "Birmingham", state: "AL", stateName: "Alabama", region: "South" },
  { slug: "knoxville", name: "Knoxville", state: "TN", stateName: "Tennessee", region: "South" },
  { slug: "providence", name: "Providence", state: "RI", stateName: "Rhode Island", region: "Northeast" },
  { slug: "buffalo", name: "Buffalo", state: "NY", stateName: "New York", region: "Northeast" },
];

export function getCityBySlug(slug: string): UsCity | undefined {
  return US_CITIES.find((c) => c.slug === slug);
}

export function isLocationService(slug: string): slug is LocationServiceSlug {
  return (LOCATION_SEO_SERVICES as readonly string[]).includes(slug);
}

export function allLocationParams(): { city: string; service: string }[] {
  const out: { city: string; service: string }[] = [];
  for (const city of US_CITIES) {
    for (const service of LOCATION_SEO_SERVICES) {
      out.push({ city: city.slug, service });
    }
  }
  return out;
}

/** Hot services pre-rendered at build (rest = on-demand ISR). */
export const BUILD_TIME_LOCATION_SERVICES = [
  "logo-design",
  "web-design",
  "mobile-app-design",
] as const;

/**
 * Small build-time set so Vercel deploy stays small.
 * Sitemap still lists every city × service URL; others generate on first request.
 */
export function priorityLocationParams(): { city: string; service: string }[] {
  const topCities = US_CITIES.slice(0, 12);
  const out: { city: string; service: string }[] = [];
  for (const city of topCities) {
    for (const service of BUILD_TIME_LOCATION_SERVICES) {
      out.push({ city: city.slug, service });
    }
  }
  return out;
}

export function locationPath(citySlug: string, serviceSlug: string) {
  return `/us/${citySlug}/${serviceSlug}`;
}

export function cityPath(citySlug: string) {
  return `/us/${citySlug}`;
}

/** Keyword phrases for a city × service combo */
export function locationKeywords(
  city: UsCity,
  serviceLabel: string,
): string[] {
  const s = serviceLabel.toLowerCase();
  const c = city.name;
  const st = city.state;
  return [
    `${s} ${c}`,
    `${s} ${c} ${st}`,
    `${s} in ${c}`,
    `${s} near me`,
    `${s} near me ${c}`,
    `${c} ${s}`,
    `${c} ${s} company`,
    `${c} ${s} services`,
    `${c} ${s} agency`,
    `best ${s} ${c}`,
    `top ${s} ${c}`,
    `hire ${s} designer ${c}`,
    `hire a ${s} designer in ${c}`,
    `affordable ${s} ${c}`,
    `cheap ${s} ${c}`,
    `professional ${s} ${c}`,
    `professional ${s} ${city.stateName}`,
    `${s} ${city.stateName}`,
    `custom ${s} ${c}`,
    `${s} for small business ${c}`,
    `${s} for startups ${c}`,
    `${s} freelancers ${c}`,
    `${s} contest ${c}`,
    `${s} ${c} USA`,
    `${c} graphic design`,
  ];
}
