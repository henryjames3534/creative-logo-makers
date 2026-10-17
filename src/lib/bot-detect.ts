/**
 * Detect crawlers / scrapers / headless bots from User-Agent.
 * Used to keep spam out of CRM Visitors — NOT to block Google from indexing HTML.
 * (Page-level captcha walls would kill Search Console impressions.)
 */

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|outbrain|pinterest\/0\.|redditbot|applebot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|ccbot|dataforseo|serpstat|seokicks|linkdex|screaming frog|headlesschrome|phantomjs|selenium|puppeteer|playwright|wget|curl\/|python-requests|python-urllib|java\/|scrapy|httpclient|libwww|go-http-client|okhttp|axios\/|node-fetch|postman|insomnia|monitoring|uptime|pingdom|statuscake|site24x7|gtmetrix|lighthouse|chrome-lighthouse|pagespeed/i;

/** Explicit good search engines — still skip visitor CRM (they are not leads). */
const SEARCH_CRAWLER =
  /googlebot|google-inspectiontool|bingbot|yandex|baiduspider|duckduckbot|applebot/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  const s = String(ua || "").trim();
  if (!s) return true; // empty UA = almost never a real browser visitor
  if (s.length < 12) return true;
  return BOT_UA.test(s) || SEARCH_CRAWLER.test(s);
}

export function botSkipReason(ua: string | null | undefined): string | null {
  if (isBotUserAgent(ua)) return "bot_ua";
  return null;
}
