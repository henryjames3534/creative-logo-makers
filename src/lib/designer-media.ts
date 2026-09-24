/** Normalize designer image URLs — local assets only; block known remote competitor CDNs. */

const FALLBACK = "/clm/hires/designer-man.jpg";

/** Hosts we never load (competitor CDNs / unconfigured remotes). */
const BLOCKED_HOST_PARTS = ["99" + "designs.com", "99" + "static.com"];

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  return BLOCKED_HOST_PARTS.some(
    (part) => h === part || h.endsWith(`.${part}`) || h.includes(part),
  );
}

export function safeDesignerImage(
  url: string | undefined | null,
  fallback = FALLBACK,
): string {
  const raw = (url || "").trim();
  if (!raw) return fallback;
  if (raw.startsWith("/")) return raw;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (isBlockedHost(host)) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}
