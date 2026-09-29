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

function mergeByKeys<T extends Dict>(
  remote: T[],
  incoming: T[],
  keyFn: (row: T) => string,
  timeFields: string[],
): T[] {
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
    map.set(k, prev ? pickNewer(prev, row, timeFields) : row);
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
  ).filter((v) => {
    // Drop empty anonymous seed-like ghosts with no activity
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

  return {
    ...r,
    ...i,
    version: 1,
    visitors,
    leads,
    orders,
    contacts,
    activities,
    deals,
    tasks,
    companies,
    inbox,
    reviews,
    owners: asArray(i.owners).length ? i.owners : r.owners,
  };
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
