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

const CRM_PROXY = (
  process.env.CRM_STORE_PROXY_URL ||
  "https://www.creativelogomakers.com/api/store/crm"
).trim();

async function readCrm(): Promise<{
  ok: boolean;
  payload: Dict | null;
  error?: string;
}> {
  const current = await clmApiFetch<{
    ok: boolean;
    payload?: unknown;
    error?: string;
  }>("/crm");

  if (current.ok && current.payload && typeof current.payload === "object") {
    return { ok: true, payload: current.payload as Dict };
  }

  if (current.error === "INTERNAL_API_KEY is not set" && CRM_PROXY) {
    try {
      const res = await fetch(CRM_PROXY, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        payload?: unknown;
        error?: string;
      } | null;
      if (json?.ok && json.payload && typeof json.payload === "object") {
        return { ok: true, payload: json.payload as Dict };
      }
      return { ok: false, payload: null, error: json?.error || "CRM proxy failed" };
    } catch (e) {
      return {
        ok: false,
        payload: null,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return {
    ok: false,
    payload: null,
    error: current.error || "CRM fetch failed",
  };
}

async function writeCrm(payload: Dict, updatedAt: string) {
  const put = await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({ payload, updatedAt }),
  });
  if (put.ok) return { ok: true as const };

  if ((put as { error?: string }).error === "INTERNAL_API_KEY is not set" && CRM_PROXY) {
    try {
      const res = await fetch(CRM_PROXY, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, updatedAt }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (res.ok && json?.ok) return { ok: true as const };
      return {
        ok: false as const,
        error: json?.error || `CRM proxy HTTP ${res.status}`,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return {
    ok: false as const,
    error: (put as { error?: string }).error || "CRM put failed",
  };
}

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

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return {
      ok: false as const,
      error: current.error || "CRM fetch failed",
    };
  }

  const base = current.payload;
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
      const prevGeo =
        row.geo && typeof row.geo === "object" ? (row.geo as Dict) : {};
      const prevIp = String(prevGeo.ip || "").trim();
      const nextIp = String(input.geo.ip || "").trim();
      if (prevIp && nextIp && prevIp !== nextIp) {
        const hist = Array.isArray(row.geoHistory)
          ? [...(row.geoHistory as Dict[])]
          : [];
        if (!hist.some((h) => String(h.ip) === prevIp)) {
          hist.unshift({
            ip: prevIp,
            country: prevGeo.country,
            countryCode: prevGeo.countryCode,
            city: prevGeo.city,
            region: prevGeo.region,
            at: prevGeo.fetchedAt || row.lastSeenAt,
          });
        }
        row.geoHistory = hist.slice(0, 20);
      }
      row.geo = {
        ...prevGeo,
        ...Object.fromEntries(
          Object.entries(input.geo as Record<string, unknown>).filter(
            ([, v]) => v !== undefined && v !== null && v !== "",
          ),
        ),
        ip: nextIp || prevIp || undefined,
        fetchedAt: now,
      };
    }
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
      geo: input.geo ? { ...input.geo, fetchedAt: now } : undefined,
      geoHistory: [],
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

  // Patch with the touched visitor first so merge resurrects its tombstones
  // even if older rows are capped out.
  const patch = {
    version: 1,
    visitors: [row, ...capped.filter((v) => v.id !== row.id)].slice(0, 2000),
  };
  const merged = mergeCrmDocuments(base, patch);

  const put = await writeCrm(merged, now);
  if (!put.ok) {
    return {
      ok: false as const,
      error: put.error || "CRM put failed",
    };
  }

  return {
    ok: true as const,
    visitor: {
      id: row.id,
      email: row.email,
      ip: (row.geo as Dict | undefined)?.ip,
      country: (row.geo as Dict | undefined)?.country,
      city: (row.geo as Dict | undefined)?.city,
      region: (row.geo as Dict | undefined)?.region,
      isp: (row.geo as Dict | undefined)?.isp,
      path: row.path,
      hits: row.hits,
    },
  };
}
