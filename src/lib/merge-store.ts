/**
 * Merge helpers for CRM / users documents so concurrent browsers
 * don't wipe each other's visitors, leads, orders, or accounts.
 */

type Dict = Record<string, unknown>;

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function ts(value: unknown) {
  if (typeof value !== "string" || !value) return 0;
  const n = Date.parse(value);
  return Number.isFinite(n) ? n : 0;
}

function pickNewer<T extends Dict>(a: T, b: T, fields: string[]): T {
  let aScore = 0;
  let bScore = 0;
  for (const f of fields) {
    aScore = Math.max(aScore, ts(a[f]));
    bScore = Math.max(bScore, ts(b[f]));
  }
  if (bScore > aScore) return { ...a, ...b };
  if (aScore > bScore) return { ...b, ...a };
  return { ...a, ...b };
}

/** Merge visitors without wiping IP/geo when one side is missing location. */
function mergeVisitorRow(a: Dict, b: Dict): Dict {
  const newer = pickNewer(a, b, ["lastSeenAt", "updatedAt", "firstSeenAt"]);
  const older = newer === a || (newer.id === a.id && ts(a.lastSeenAt) >= ts(b.lastSeenAt))
    ? b
    : a;

  const aGeo = (a.geo && typeof a.geo === "object" ? a.geo : null) as Dict | null;
  const bGeo = (b.geo && typeof b.geo === "object" ? b.geo : null) as Dict | null;
  const newerGeo = (newer.geo && typeof newer.geo === "object" ? newer.geo : null) as Dict | null;
  const olderGeo = (older.geo && typeof older.geo === "object" ? older.geo : null) as Dict | null;

  // Prefer geo that has an IP; then merge fields
  const geoWithIp = [newerGeo, olderGeo, aGeo, bGeo].find(
    (g) => g && String(g.ip || "").trim(),
  );
  const geoBase = newerGeo || olderGeo || aGeo || bGeo || null;
  const geo = geoWithIp
    ? { ...(geoBase || {}), ...geoWithIp }
    : geoBase
      ? { ...geoBase }
      : undefined;

  // Build IP history from both sides
  const history: Dict[] = [];
  const pushHist = (g: Dict | null | undefined) => {
    if (!g) return;
    const ip = String(g.ip || "").trim();
    if (!ip) return;
    if (history.some((h) => String(h.ip) === ip)) return;
    history.push({
      ip,
      country: g.country,
      countryCode: g.countryCode,
      city: g.city,
      region: g.region,
      at: g.fetchedAt || newer.lastSeenAt || a.lastSeenAt || b.lastSeenAt,
    });
  };
  for (const h of asArray<Dict>(a.geoHistory)) pushHist(h);
  for (const h of asArray<Dict>(b.geoHistory)) pushHist(h);
  pushHist(aGeo);
  pushHist(bGeo);

  const hits = Math.max(Number(a.hits || 0), Number(b.hits || 0));
  const visitCount = Math.max(Number(a.visitCount || 0), Number(b.visitCount || 0));
  const totalDurationMs = Math.max(
    Number(a.totalDurationMs || 0),
    Number(b.totalDurationMs || 0),
  );

  return {
    ...newer,
    geo,
    geoHistory: history.slice(0, 20),
    hits,
    visitCount,
    totalDurationMs,
    email: newer.email || a.email || b.email,
    name:
      newer.name && newer.name !== "Anonymous"
        ? newer.name
        : a.name && a.name !== "Anonymous"
          ? a.name
          : b.name || newer.name,
    pageViews: asArray(newer.pageViews).length
      ? newer.pageViews
      : a.pageViews || b.pageViews,
    sessions: asArray(newer.sessions).length
      ? newer.sessions
      : a.sessions || b.sessions,
  };
}

function mergeByKeys<T extends Dict>(
  remote: T[],
  incoming: T[],
  keyFn: (row: T) => string,
  timeFields: string[],
  mergeRow?: (a: T, b: T) => T,
): T[] {
  const combine =
    mergeRow ||
    ((a: T, b: T) => pickNewer(a, b, timeFields));
  const map = new Map<string, T>();
  for (const row of remote) {
    const k = keyFn(row);
    if (!k) continue;
    map.set(k, row);
  }
  for (const row of incoming) {
    const k = keyFn(row);
    if (!k) continue;
    const prev = map.get(k);
    map.set(k, prev ? combine(prev, row) : row);
  }
  return [...map.values()].sort(
    (a, b) =>
      Math.max(...timeFields.map((f) => ts(b[f]))) -
      Math.max(...timeFields.map((f) => ts(a[f]))),
  );
}

function visitorKey(v: Dict) {
  const email = String(v.email || "").toLowerCase().trim();
  if (email) return `e:${email}`;
  const vk = String(v.visitorKey || "").trim();
  if (vk) return `vk:${vk}`;
  return String(v.id || "");
}

function leadKey(l: Dict) {
  const email = String(l.email || "").toLowerCase().trim();
  if (email) return `e:${email}`;
  return String(l.id || "");
}

function orderKey(o: Dict) {
  const id = String(o.id || "").trim();
  if (id) return `id:${id}`;
  const orderId = String(o.orderId || "").trim();
  if (orderId) return `ord:${orderId}`;
  const email = String(o.customerEmail || "").toLowerCase().trim();
  const created = String(o.createdAt || "");
  return `em:${email}:${created}`;
}

function contactKey(c: Dict) {
  const email = String(c.email || "").toLowerCase().trim();
  if (email) return `e:${email}`;
  return String(c.id || "");
}

function activityKey(a: Dict) {
  return String(a.id || `${a.type}:${a.title}:${a.createdAt}`);
}

function userKey(u: Dict) {
  const email = String(u.email || "").toLowerCase().trim();
  if (email) return `e:${email}`;
  return String(u.id || "");
}

/** Prefer non-demo seed rows when merging conflicting demo IDs. */
function looksLikeSeedEmail(email: string) {
  return (
    email.endsWith(".example") ||
    email === "dbsync@example.com" ||
    email.includes("@northwind.") ||
    email.includes("@pulsehealth.") ||
    email.includes("@orbitapps.") ||
    email.includes("@vistaretail.")
  );
}

export function mergeCrmDocuments(
  remote: unknown,
  incoming: unknown,
): Record<string, unknown> {
  const r = (remote && typeof remote === "object" ? remote : {}) as Dict;
  const i = (incoming && typeof incoming === "object" ? incoming : {}) as Dict;

  const visitors = mergeByKeys(
    asArray<Dict>(r.visitors),
    asArray<Dict>(i.visitors),
    visitorKey,
    ["lastSeenAt", "updatedAt", "firstSeenAt"],
    mergeVisitorRow,
  ).filter((v) => {
    const email = String(v.email || "");
    if (looksLikeSeedEmail(email)) return false;
    return true;
  });

  const leads = mergeByKeys(
    asArray<Dict>(r.leads),
    asArray<Dict>(i.leads),
    leadKey,
    ["updatedAt", "createdAt"],
  ).filter((l) => !looksLikeSeedEmail(String(l.email || "")));

  const orders = mergeByKeys(
    asArray<Dict>(r.orders),
    asArray<Dict>(i.orders),
    orderKey,
    ["updatedAt", "createdAt"],
  ).filter((o) => !looksLikeSeedEmail(String(o.customerEmail || "")));

  const contacts = mergeByKeys(
    asArray<Dict>(r.contacts),
    asArray<Dict>(i.contacts),
    contactKey,
    ["updatedAt", "createdAt"],
  );

  const activities = mergeByKeys(
    asArray<Dict>(r.activities),
    asArray<Dict>(i.activities),
    activityKey,
    ["createdAt"],
  ).slice(0, 400);

  const deals = mergeByKeys(
    asArray<Dict>(r.deals),
    asArray<Dict>(i.deals),
    (d) => String(d.id || ""),
    ["updatedAt", "createdAt"],
  );

  const tasks = mergeByKeys(
    asArray<Dict>(r.tasks),
    asArray<Dict>(i.tasks),
    (t) => String(t.id || ""),
    ["updatedAt", "createdAt", "dueAt"],
  );

  const companies = mergeByKeys(
    asArray<Dict>(r.companies),
    asArray<Dict>(i.companies),
    (c) => String(c.id || c.name || ""),
    ["updatedAt", "createdAt"],
  );

  const inbox = mergeByKeys(
    asArray<Dict>(r.inbox),
    asArray<Dict>(i.inbox),
    (m) => String(m.id || ""),
    ["createdAt"],
  ).slice(0, 300);

  const reviews = mergeByKeys(
    asArray<Dict>(r.reviews),
    asArray<Dict>(i.reviews),
    (x) => String(x.id || ""),
    ["updatedAt", "createdAt"],
  );

  const deleted = {
    visitors: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.visitors),
        ...asArray<string>((i.deleted as Dict | undefined)?.visitors),
      ]),
    ).slice(-500),
    leads: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.leads),
        ...asArray<string>((i.deleted as Dict | undefined)?.leads),
      ]),
    ).slice(-500),
    orders: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.orders),
        ...asArray<string>((i.deleted as Dict | undefined)?.orders),
      ]),
    ).slice(-500),
    contacts: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.contacts),
        ...asArray<string>((i.deleted as Dict | undefined)?.contacts),
      ]),
    ).slice(-500),
    inbox: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.inbox),
        ...asArray<string>((i.deleted as Dict | undefined)?.inbox),
      ]),
    ).slice(-500),
  };

  return {
    ...r,
    ...i,
    version: 1,
    visitors: applyDeleted(
      visitors,
      deleted.visitors,
      (v) => [
        String(v.id || ""),
        v.email ? `e:${String(v.email).toLowerCase()}` : "",
        v.visitorKey ? `vk:${String(v.visitorKey)}` : "",
      ],
    ),
    leads: applyDeleted(
      leads,
      deleted.leads,
      (l) => [
        String(l.id || ""),
        l.email ? `e:${String(l.email).toLowerCase()}` : "",
      ],
    ),
    orders: applyDeleted(
      orders,
      deleted.orders,
      (o) => [
        String(o.id || ""),
        o.orderId ? `ord:${String(o.orderId)}` : "",
      ],
    ),
    contacts: applyDeleted(
      contacts,
      deleted.contacts,
      (c) => [
        String(c.id || ""),
        c.email ? `e:${String(c.email).toLowerCase()}` : "",
      ],
    ),
    activities,
    deals,
    tasks,
    companies,
    inbox: applyDeleted(inbox, deleted.inbox, (x) => [String(x.id || "")]),
    reviews,
    owners: asArray(i.owners).length ? i.owners : r.owners,
    deleted,
    // Prefer newer geo-block settings object
    geoBlock: (() => {
      const a = r.geoBlock && typeof r.geoBlock === "object" ? (r.geoBlock as Dict) : null;
      const b = i.geoBlock && typeof i.geoBlock === "object" ? (i.geoBlock as Dict) : null;
      if (!a) return b || undefined;
      if (!b) return a;
      return ts(b.updatedAt) >= ts(a.updatedAt) ? { ...a, ...b } : { ...b, ...a };
    })(),
  };
}

function applyDeleted(
  rows: Dict[],
  tombstones: string[] | undefined,
  keysFn: (row: Dict) => string[],
) {
  if (!tombstones?.length) return rows;
  const ban = new Set(tombstones.filter(Boolean));
  return rows.filter((row) => {
    const keys = keysFn(row).filter(Boolean);
    return !keys.some((k) => ban.has(k));
  });
}

export function mergeUsersDocuments(
  remote: unknown,
  incoming: unknown,
): unknown[] {
  return mergeByKeys(
    asArray<Dict>(remote),
    asArray<Dict>(incoming),
    userKey,
    ["updatedAt", "createdAt"],
  );
}
