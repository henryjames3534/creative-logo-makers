import { clmApiFetch } from "@/lib/clm-api";
import { mergeCrmDocuments } from "@/lib/merge-store";

export type VisitorPingInput = {
  visitorKey: string;
  path?: string;
  email?: string;
  name?: string;
  userAgent?: string;
  language?: string;
  geo?: {
    ip?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
  };
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

type Dict = Record<string, unknown>;

/**
 * Upsert a live visitor (with IP/geo) into the CRM document admins read.
 */
export async function upsertVisitorOnServer(input: VisitorPingInput) {
  const now = new Date().toISOString();
  const visitorKey = input.visitorKey.trim();
  if (!visitorKey) {
    return { ok: false as const, error: "visitorKey required" };
  }

  const email = input.email?.trim().toLowerCase() || undefined;
  const path = input.path?.trim() || "/";

  const current = await clmApiFetch<{
    ok: boolean;
    payload?: unknown;
    updatedAt?: string | null;
    error?: string;
  }>("/crm");

  if (!current.ok) {
    return {
      ok: false as const,
      error: current.error || "CRM fetch failed",
    };
  }

  const base =
    current.payload && typeof current.payload === "object"
      ? (current.payload as Dict)
      : { version: 1 };

  const visitors = Array.isArray(base.visitors)
    ? ([...base.visitors] as Dict[])
    : [];

  const matchIdx = visitors.findIndex((v) => {
    if (email && String(v.email || "").toLowerCase() === email) return true;
    return String(v.visitorKey || "") === visitorKey;
  });

  let row: Dict;
  if (matchIdx >= 0) {
    row = { ...visitors[matchIdx] };
    row.visitorKey = visitorKey;
    if (email) row.email = email;
    if (input.name) row.name = input.name;
    else if (!row.name) row.name = email ? email.split("@")[0] : "Anonymous";
    row.path = path;
    row.lastSeenAt = now;
    row.hits = Number(row.hits || 0) + 1;
    if (input.userAgent) row.userAgent = input.userAgent;
    if (input.language) row.language = input.language;
    if (input.geo) {
      row.geo = {
        ...((row.geo as Dict) || {}),
        ...input.geo,
        fetchedAt: now,
      };
    }
    // Prefer page_visit unless already a stronger source
    if (!row.source || row.source === "page_visit") {
      row.source = email ? "portal" : "page_visit";
    }
    visitors[matchIdx] = row;
  } else {
    row = {
      id: uid("vis"),
      visitorKey,
      email,
      name: input.name || (email ? email.split("@")[0] : "Anonymous"),
      source: email ? "portal" : "page_visit",
      signedIn: Boolean(email),
      firstSeenAt: now,
      lastSeenAt: now,
      path,
      hits: 1,
      visitCount: 1,
      totalDurationMs: 0,
      pageViews: [
        {
          id: uid("pv"),
          path,
          enteredAt: now,
          durationMs: 0,
        },
      ],
      sessions: [
        {
          id: uid("ses"),
          startedAt: now,
          durationMs: 0,
          pageCount: 1,
        },
      ],
      geo: input.geo
        ? { ...input.geo, fetchedAt: now }
        : undefined,
      userAgent: input.userAgent,
      language: input.language,
    };
    visitors.unshift(row);
  }

  // Cap list size
  const capped = visitors
    .sort(
      (a, b) =>
        Date.parse(String(b.lastSeenAt || 0)) -
        Date.parse(String(a.lastSeenAt || 0)),
    )
    .slice(0, 2000);

  const patch = { version: 1, visitors: capped };
  const merged = mergeCrmDocuments(base, patch);

  const put = await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({ payload: merged, updatedAt: now }),
  });

  if (!put.ok) {
    return {
      ok: false as const,
      error: (put as { error?: string }).error || "CRM put failed",
    };
  }

  return {
    ok: true as const,
    visitor: {
      id: row.id,
      email: row.email,
      ip: (row.geo as Dict | undefined)?.ip,
      country: (row.geo as Dict | undefined)?.country,
      path: row.path,
      hits: row.hits,
    },
  };
}
