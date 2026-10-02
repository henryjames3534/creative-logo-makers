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
  // serviceId is unique per customer payment/service
  const serviceId = String(o.serviceId || "").trim();
  if (serviceId) return `svc:${serviceId}`;
  const email = String(o.customerEmail || "").toLowerCase().trim();
  const pkg = String(o.packageName || "").toLowerCase().trim();
  const cat = String(o.categoryName || "").toLowerCase().trim();
  // Same client + package + category = one project (stops dual-write dupes)
  if (email && (pkg || cat)) return `em:${email}:${pkg}:${cat}`;
  const orderId = String(o.orderId || "").trim();
  if (orderId) return `ord:${orderId}`;
  const id = String(o.id || "").trim();
  if (id) return `id:${id}`;
  return `em:${email}:${String(o.createdAt || "")}`;
}

function mergeOrderRow(a: Dict, b: Dict): Dict {
  const newer = pickNewer(a, b, ["updatedAt", "createdAt"]);
  const older = newer === a ? b : a;
  const aPaid = String(a.paymentStatus || "") === "paid";
  const bPaid = String(b.paymentStatus || "") === "paid";
  return {
    ...newer,
    id: newer.id || older.id,
    orderId: newer.orderId || older.orderId,
    serviceId: newer.serviceId || older.serviceId,
    paymentStatus: aPaid || bPaid ? "paid" : newer.paymentStatus || older.paymentStatus,
    amount: Math.max(Number(a.amount || 0), Number(b.amount || 0)) || newer.amount,
    revisions: asArray(newer.revisions).length
      ? newer.revisions
      : older.revisions,
    messages: asArray(newer.messages).length
      ? newer.messages
      : older.messages,
    assignedDesignerIds: Array.from(
      new Set([
        ...asArray<string>(a.assignedDesignerIds),
        ...asArray<string>(b.assignedDesignerIds),
      ]),
    ),
    upsells: mergeUpsellRows(a.upsells, b.upsells),
    createdAt:
      ts(a.createdAt) && ts(b.createdAt)
        ? ts(a.createdAt) <= ts(b.createdAt)
          ? a.createdAt
          : b.createdAt
        : newer.createdAt || older.createdAt,
  };
}

function mergeUpsellRows(a: unknown, b: unknown): Dict[] {
  const map = new Map<string, Dict>();
  for (const u of [...asArray<Dict>(a), ...asArray<Dict>(b)]) {
    const id = String(u.id || "").trim();
    if (!id) continue;
    const prev = map.get(id);
    if (!prev) {
      map.set(id, { ...u });
      continue;
    }
    const newer = pickNewer(prev, u, [
      "updatedAt",
      "paidAt",
      "invoicedAt",
      "createdAt",
    ]);
    const paid =
      String(prev.status || "") === "paid" ||
      String(u.status || "") === "paid";
    map.set(id, {
      ...newer,
      status: paid ? "paid" : newer.status || prev.status,
      paidAt: prev.paidAt || u.paidAt || newer.paidAt,
      payToken: newer.payToken || prev.payToken || u.payToken,
      invoicedAt: prev.invoicedAt || u.invoicedAt || newer.invoicedAt,
    });
  }
  return Array.from(map.values());
}

function dealKey(d: Dict) {
  const orderCode = String(d.orderCode || "").trim();
  if (orderCode) return `ord:${orderCode}`;
  const orderId = String(d.orderId || "").trim();
  if (orderId) return `ordid:${orderId}`;
  const leadId = String(d.leadId || "").trim();
  const pkg = String(d.packageName || "").toLowerCase().trim();
  const title = String(d.title || "").toLowerCase().trim();
  if (leadId && (pkg || title)) return `lead:${leadId}:${pkg || title}`;
  if (title && pkg) return `t:${title}:${pkg}`;
  return String(d.id || "");
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
  const e = email.trim().toLowerCase();
  return (
    e.endsWith(".example") ||
    e === "dbsync@example.com" ||
    e.includes("@northwind.") ||
    e.includes("@pulsehealth.") ||
    e.includes("@orbitapps.") ||
    e.includes("@vistaretail.") ||
    e.includes("@indiecafe.") ||
    e.includes("chris@ indiecafe")
  );
}

/** Owner/operator Google accounts — never CRM leads/contacts from site login */
function isStaffLeadEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if (e === "admin@creativelogomakers.com") return true;
  if (e.endsWith("@creativelogomakers.com")) return true;
  return (
    e === "abdulwahibshera@gmail.com" ||
    e === "henry.jamesaws@gmail.com" ||
    e === "henryjames3534@gmail.com"
  );
}

const SEED_DEAL_IDS = new Set([
  "dl_1",
  "dl_2",
  "dl_3",
  "dl_4",
  "dl_5",
  "dl_6",
]);
const SEED_COMPANY_IDS = new Set(["co_1", "co_2", "co_3", "co_4"]);
const SEED_CONTACT_IDS = new Set(["ct_1", "ct_2", "ct_3", "ct_4", "ct_5"]);
const SEED_LEAD_IDS = new Set([
  "ld_1",
  "ld_2",
  "ld_3",
  "ld_4",
  "ld_5",
  "ld_6",
]);
const SEED_ORDER_IDS = new Set(["or_1", "or_2", "or_3"]);
const SEED_TASK_IDS = new Set([
  "tk_1",
  "tk_2",
  "tk_3",
  "tk_5",
  "tk_p1",
  "tk_p2",
  "tk_p3",
  "tk_p4",
]);
const SEED_ACTIVITY_IDS = new Set([
  "ac_1",
  "ac_2",
  "ac_3",
  "ac_4",
  "ac_5",
]);
const SEED_COMPANY_NAMES = new Set([
  "northwind foods",
  "pulse health",
  "orbit apps",
  "vista retail co",
  "indie cafe",
]);

function isSeedDeal(d: Dict) {
  const id = String(d.id || "");
  if (SEED_DEAL_IDS.has(id)) return true;
  const title = String(d.title || "").toLowerCase();
  return (
    title.includes("northwind") ||
    title.includes("pulse health") ||
    title.includes("orbit launch") ||
    title.includes("indie cafe") ||
    title.includes("vista seasonal") ||
    title.includes("abdul brand starter")
  );
}

function isSeedCompany(c: Dict) {
  const id = String(c.id || "");
  if (SEED_COMPANY_IDS.has(id)) return true;
  const name = String(c.name || "").toLowerCase();
  if (SEED_COMPANY_NAMES.has(name)) return true;
  const website = String(c.website || "").toLowerCase();
  return website.endsWith(".example");
}

function isSeedContact(c: Dict) {
  if (SEED_CONTACT_IDS.has(String(c.id || ""))) return true;
  const email = String(c.email || "");
  return looksLikeSeedEmail(email) || isStaffLeadEmail(email);
}

function isSeedLead(l: Dict) {
  if (SEED_LEAD_IDS.has(String(l.id || ""))) return true;
  const email = String(l.email || "");
  if (looksLikeSeedEmail(email) || isStaffLeadEmail(email)) return true;
  const interest = String(l.interest || "").toLowerCase();
  const notes = String(l.notes || "").toLowerCase();
  return (
    interest.includes("site visit") ||
    notes.includes("auto-captured visitor") ||
    notes.includes("email typed from google one tap")
  );
}

function isSeedOrder(o: Dict) {
  if (SEED_ORDER_IDS.has(String(o.id || ""))) return true;
  return looksLikeSeedEmail(String(o.customerEmail || ""));
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

  const incomingLeads = asArray<Dict>(i.leads);
  const remoteLeads = asArray<Dict>(r.leads);

  const leads = mergeByKeys(
    remoteLeads,
    incomingLeads,
    leadKey,
    ["updatedAt", "createdAt"],
  ).filter((l) => !isSeedLead(l));

  const orders = mergeByKeys(
    asArray<Dict>(r.orders),
    asArray<Dict>(i.orders),
    orderKey,
    ["updatedAt", "createdAt"],
    mergeOrderRow,
  ).filter((o) => !isSeedOrder(o));

  const contacts = mergeByKeys(
    asArray<Dict>(r.contacts),
    asArray<Dict>(i.contacts),
    contactKey,
    ["updatedAt", "createdAt"],
  ).filter((c) => !isSeedContact(c));

  const activities = mergeByKeys(
    asArray<Dict>(r.activities),
    asArray<Dict>(i.activities),
    activityKey,
    ["createdAt"],
  )
    .filter((a) => !SEED_ACTIVITY_IDS.has(String(a.id || "")))
    .slice(0, 400);

  const deals = mergeByKeys(
    asArray<Dict>(r.deals),
    asArray<Dict>(i.deals),
    dealKey,
    ["updatedAt", "createdAt"],
  ).filter((d) => !isSeedDeal(d));

  const tasks = mergeByKeys(
    asArray<Dict>(r.tasks),
    asArray<Dict>(i.tasks),
    (t) => String(t.id || ""),
    ["updatedAt", "createdAt", "dueAt"],
  ).filter((t) => !SEED_TASK_IDS.has(String(t.id || "")));

  const companies = mergeByKeys(
    asArray<Dict>(r.companies),
    asArray<Dict>(i.companies),
    (c) => String(c.id || c.name || ""),
    ["updatedAt", "createdAt"],
  ).filter((c) => !isSeedCompany(c));

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
  ).filter((x) => !looksLikeSeedEmail(String(x.customerEmail || "")) && String(x.id || "") !== "rv_seed_1");

  // Incoming leads (e.g. contact form) clear their tombstones so a deleted
  // email can submit again and still appear in the admin dashboard.
  const resurrectLeadKeys = new Set<string>();
  for (const l of incomingLeads) {
    const id = String(l.id || "");
    const email = String(l.email || "").trim().toLowerCase();
    // Never resurrect staff / junk site-visit leads
    if (isStaffLeadEmail(email) || isSeedLead(l)) continue;
    if (id) resurrectLeadKeys.add(id);
    if (email) resurrectLeadKeys.add(`e:${email}`);
  }

  // Incoming / backfilled deals clear tombstones so pipeline cards can return
  // after an order/deal delete (same orderCode / orderId).
  const resurrectDealKeys = new Set<string>();
  for (const d of asArray<Dict>(i.deals)) {
    const id = String(d.id || "").trim();
    const orderCode = String(d.orderCode || "").trim();
    const orderId = String(d.orderId || "").trim();
    if (id) resurrectDealKeys.add(id);
    if (orderCode) resurrectDealKeys.add(`ord:${orderCode}`);
    if (orderId) resurrectDealKeys.add(`ordid:${orderId}`);
  }

  // Incoming visitors (live pings) clear id / visitorKey / email / IP tombstones
  // so a deleted visitor can return from the same browser or IP.
  const incomingVisitors = asArray<Dict>(i.visitors);
  const resurrectVisitorKeys = new Set<string>();
  for (const v of incomingVisitors) {
    const id = String(v.id || "");
    const email = String(v.email || "").trim().toLowerCase();
    const vk = String(v.visitorKey || "").trim();
    const ip = String(
      (v.geo && typeof v.geo === "object"
        ? (v.geo as Dict).ip
        : "") || "",
    )
      .trim()
      .toLowerCase();
    if (id) resurrectVisitorKeys.add(id);
    if (email) resurrectVisitorKeys.add(`e:${email}`);
    if (vk) resurrectVisitorKeys.add(`vk:${vk}`);
    if (ip) resurrectVisitorKeys.add(`ip:${ip}`);
  }

  const deleted = {
    // Drop legacy vk:/e:/ip: tombstones — deletes are id-only so the same
    // browser or IP can visit again after an admin removes a row.
    visitors: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.visitors),
        ...asArray<string>((i.deleted as Dict | undefined)?.visitors),
      ]),
    )
      .filter((t) => !resurrectVisitorKeys.has(t))
      .filter((t) => {
        const s = String(t);
        return (
          !s.startsWith("vk:") && !s.startsWith("e:") && !s.startsWith("ip:")
        );
      })
      .slice(-500),
    leads: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.leads),
        ...asArray<string>((i.deleted as Dict | undefined)?.leads),
      ]),
    )
      .filter((t) => !resurrectLeadKeys.has(t))
      .slice(-500),
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
    deals: Array.from(
      new Set([
        ...asArray<string>((r.deleted as Dict | undefined)?.deals),
        ...asArray<string>((i.deleted as Dict | undefined)?.deals),
      ]),
    )
      .filter((t) => {
        // Incoming deals resurrect matching tombstones (id / ord / ordid)
        const s = String(t);
        if (resurrectDealKeys.has(s)) return false;
        return true;
      })
      .slice(-500),
  };

  return {
    ...r,
    ...i,
    version: 1,
    visitors: applyDeleted(
      visitors,
      deleted.visitors,
      (v) => {
        const geo =
          v.geo && typeof v.geo === "object" ? (v.geo as Dict) : null;
        const ip = String(geo?.ip || "")
          .trim()
          .toLowerCase();
        return [
          String(v.id || ""),
          v.email ? `e:${String(v.email).toLowerCase()}` : "",
          v.visitorKey ? `vk:${String(v.visitorKey)}` : "",
          ip ? `ip:${ip}` : "",
        ];
      },
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
    deals: applyDeleted(deals, deleted.deals, (d) => [
      String(d.id || ""),
      d.orderId ? `ordid:${String(d.orderId)}` : "",
      d.orderCode ? `ord:${String(d.orderCode)}` : "",
    ]),
    tasks,
    companies,
    inbox: applyDeleted(inbox, deleted.inbox, (x) => [String(x.id || "")]),
    reviews,
    owners: asArray(i.owners).length ? i.owners : r.owners,
    deleted,
    // Admin/staff IPs never count as public visitors
    excludedVisitorIps: Array.from(
      new Set([
        ...asArray<string>(r.excludedVisitorIps).map((x) =>
          String(x).trim().toLowerCase(),
        ),
        ...asArray<string>(i.excludedVisitorIps).map((x) =>
          String(x).trim().toLowerCase(),
        ),
      ]),
    )
      .filter(Boolean)
      .slice(-200),
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
