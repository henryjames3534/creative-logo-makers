import { clmApiFetch } from "@/lib/clm-api";
import { mergeCrmDocuments } from "@/lib/merge-store";

export type VisitorPingInput = {
  visitorKey: string;
  path?: string;
  userAgent?: string;
  language?: string;
  /** Session time on site (ms) from client */
  durationMs?: number;
  /** Time on current page (ms) */
  pageDurationMs?: number;
  /** First ping of this browser tab session */
  isNewSession?: boolean;
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

function excludedIps(base: Dict): Set<string> {
  const list = Array.isArray(base.excludedVisitorIps)
    ? (base.excludedVisitorIps as unknown[])
    : [];
  return new Set(
    list.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean),
  );
}

/**
 * Upsert anonymous website visitor (IP + geo + duration). No email.
 */
export async function upsertVisitorOnServer(input: VisitorPingInput) {
  const now = new Date().toISOString();
  const visitorKey = input.visitorKey.trim();
  if (!visitorKey) {
    return { ok: false as const, error: "visitorKey required" };
  }

  const path = input.path?.trim() || "/";
  const ip = String(input.geo?.ip || "").trim().toLowerCase();

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return {
      ok: false as const,
      error: current.error || "CRM fetch failed",
    };
  }

  const base = current.payload;
  const blocked = excludedIps(base);
  if (ip && blocked.has(ip)) {
    return { ok: true as const, skipped: true as const, reason: "staff_ip" };
  }

  const visitors = Array.isArray(base.visitors)
    ? ([...base.visitors] as Dict[])
    : [];

  // Match by visitorKey only — never by email (emails live in leads/contacts)
  let matchIdx = visitors.findIndex(
    (v) => String(v.visitorKey || "") === visitorKey,
  );

  // Same public IP within 30m → same person (new browser / cleared storage)
  if (matchIdx < 0 && ip) {
    const cutoff = Date.now() - 30 * 60 * 1000;
    matchIdx = visitors.findIndex((v) => {
      const g = v.geo && typeof v.geo === "object" ? (v.geo as Dict) : null;
      const vip = String(g?.ip || "")
        .trim()
        .toLowerCase();
      if (vip !== ip) return false;
      const last = Date.parse(String(v.lastSeenAt || 0));
      return Number.isFinite(last) && last >= cutoff;
    });
  }

  const durationMs = Math.max(0, Number(input.durationMs) || 0);
  const pageDurationMs = Math.max(0, Number(input.pageDurationMs) || 0);
  const isNewSession = Boolean(input.isNewSession);

  let row: Dict;
  if (matchIdx >= 0) {
    row = { ...visitors[matchIdx] };
    row.visitorKey = visitorKey;
    // Strip email from visitor rows — traffic is anonymous
    delete row.email;
    if (!row.name || row.name === String(row.email || "").split("@")[0]) {
      row.name = "Anonymous";
    }
    row.path = path;
    row.lastSeenAt = now;
    row.hits = Number(row.hits || 0) + 1;
    row.source = "page_visit";
    row.signedIn = false;
    if (input.userAgent) row.userAgent = input.userAgent;
    if (input.language) row.language = input.language;

    // Duration: take the higher of stored vs client-reported session time
    const prevDur = Number(row.totalDurationMs || 0);
    if (durationMs > prevDur) row.totalDurationMs = durationMs;

    const sessions = Array.isArray(row.sessions)
      ? ([...(row.sessions as Dict[])] as Dict[])
      : [];
    const pageViews = Array.isArray(row.pageViews)
      ? ([...(row.pageViews as Dict[])] as Dict[])
      : [];
    const prevPath = String(
      (visitors[matchIdx] as Dict).path || pageViews[0]?.path || "",
    );

    const lastSes = sessions[0];
    const gapMs = lastSes
      ? Date.now() -
        Date.parse(String(lastSes.endedAt || lastSes.startedAt || 0))
      : Infinity;
    const openNewSession =
      isNewSession && (!lastSes || !Number.isFinite(gapMs) || gapMs > 30 * 60 * 1000);

    if (openNewSession || sessions.length === 0) {
      if (lastSes && !lastSes.endedAt) {
        lastSes.endedAt = now;
        lastSes.durationMs = Math.max(
          Number(lastSes.durationMs || 0),
          durationMs,
        );
      }
      row.visitCount = Number(row.visitCount || 0) + 1;
      sessions.unshift({
        id: uid("ses"),
        startedAt: now,
        durationMs: durationMs || 0,
        pageCount: 1,
      });
    } else {
      const ses = { ...sessions[0] };
      ses.durationMs = Math.max(Number(ses.durationMs || 0), durationMs);
      if (path && path !== prevPath) {
        ses.pageCount = Number(ses.pageCount || 0) + 1;
      }
      sessions[0] = ses;
    }

    const openPv = pageViews.find(
      (p) => !p.leftAt && String(p.path || "") === path,
    );
    if (openPv) {
      openPv.durationMs = Math.max(
        Number(openPv.durationMs || 0),
        pageDurationMs,
      );
      openPv.leftAt = undefined;
    } else {
      pageViews.unshift({
        id: uid("pv"),
        path,
        enteredAt: now,
        durationMs: pageDurationMs,
        sessionId: String(sessions[0]?.id || uid("ses")),
      });
    }

    row.sessions = sessions.slice(0, 50);
    row.pageViews = pageViews.slice(0, 200);

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
    visitors[matchIdx] = row;
  } else {
    row = {
      id: uid("vis"),
      visitorKey,
      name: "Anonymous",
      source: "page_visit",
      signedIn: false,
      firstSeenAt: now,
      lastSeenAt: now,
      path,
      hits: 1,
      visitCount: 1,
      totalDurationMs: durationMs || pageDurationMs || 0,
      pageViews: [
        {
          id: uid("pv"),
          path,
          enteredAt: now,
          durationMs: pageDurationMs || 0,
          sessionId: uid("ses"),
        },
      ],
      sessions: [
        {
          id: uid("ses"),
          startedAt: now,
          durationMs: durationMs || 0,
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

  const capped = visitors
    .sort(
      (a, b) =>
        Date.parse(String(b.lastSeenAt || 0)) -
        Date.parse(String(a.lastSeenAt || 0)),
    )
    .slice(0, 2000);

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

  const geo = row.geo as Dict | undefined;
  return {
    ok: true as const,
    visitor: {
      id: row.id,
      visitorKey: row.visitorKey,
      ip: geo?.ip,
      country: geo?.country,
      countryCode: geo?.countryCode,
      city: geo?.city,
      region: geo?.region,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      isp: geo?.isp,
      path: row.path,
      hits: row.hits,
      visitCount: row.visitCount,
      totalDurationMs: row.totalDurationMs,
    },
  };
}

/** Register admin/staff IP so pings from that IP are ignored. */
export async function excludeStaffIp(ip: string) {
  const clean = ip.trim().toLowerCase();
  if (!clean) return { ok: false as const, error: "ip required" };

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return {
      ok: false as const,
      error: current.error || "CRM fetch failed",
    };
  }

  const base = current.payload;
  const list = Array.isArray(base.excludedVisitorIps)
    ? (base.excludedVisitorIps as unknown[]).map((x) =>
        String(x || "").trim().toLowerCase(),
      )
    : [];
  if (!list.includes(clean)) list.push(clean);

  const now = new Date().toISOString();
  const visitors = Array.isArray(base.visitors)
    ? (base.visitors as Dict[])
    : [];

  // Soft-delete existing visitor rows that belong to this staff IP
  const toDelete = visitors
    .filter((v) => {
      const g = v.geo && typeof v.geo === "object" ? (v.geo as Dict) : null;
      return String(g?.ip || "")
        .trim()
        .toLowerCase() === clean;
    })
    .map((v) => String(v.id || ""))
    .filter(Boolean);

  const deletedVisitors = Array.from(
    new Set([
      ...((base.deleted as Dict | undefined)?.visitors as string[] | undefined ||
        []),
      ...toDelete,
    ]),
  ).slice(-500);

  const patch = {
    version: 1,
    excludedVisitorIps: list.slice(-200),
    deleted: {
      ...((base.deleted as Dict) || {}),
      visitors: deletedVisitors,
    },
  };

  const merged = mergeCrmDocuments(base, patch);
  const put = await writeCrm(merged, now);
  if (!put.ok) {
    return { ok: false as const, error: put.error || "CRM put failed" };
  }

  return {
    ok: true as const,
    ip: clean,
    purged: toDelete.length,
    excludedCount: list.length,
  };
}

export async function getExcludedVisitorIps(): Promise<string[]> {
  const current = await readCrm();
  if (!current.ok || !current.payload) return [];
  const list = Array.isArray(current.payload.excludedVisitorIps)
    ? (current.payload.excludedVisitorIps as unknown[])
    : [];
  return list.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
}
