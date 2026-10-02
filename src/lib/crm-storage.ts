/** Local CRM store for /admin — advanced pipeline, leads, contacts, deals, tasks */

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type DealStage =
  | "lead"
  | "qualified"
  | "brief"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "status"
  | "deal"
  | "task"
  | "revision"
  | "payment"
  | "visitor"
  | "lead";

export type CrmOwner = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "success" | "ops";
};

export type CrmCompany = {
  id: string;
  name: string;
  industry: string;
  website?: string;
  size: string;
  country: string;
  ownerId: string;
  createdAt: string;
  notes?: string;
};

export type CrmContact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  companyId?: string;
  ownerId: string;
  tags: string[];
  createdAt: string;
  lastTouchAt: string;
};

export type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  score: number;
  interest: string;
  valueEstimate: number;
  ownerId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  contactId?: string;
};

export type CrmDeal = {
  id: string;
  title: string;
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  contactId?: string;
  companyId?: string;
  leadId?: string;
  /** Internal CRM order/project id — cascade-deleted with the project */
  orderId?: string;
  /** Public ORD-… code */
  orderCode?: string;
  ownerId: string;
  category?: string;
  packageName?: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type CrmTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  ownerId: string;
  /** Primary link — each project has its own tasks */
  projectId?: string;
  /** Assigned marketplace designer */
  designerId?: string;
  designerName?: string;
  relatedType?: "lead" | "deal" | "contact" | "order" | "project";
  relatedId?: string;
  createdAt: string;
  notes?: string;
};

export type ProjectRevisionStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "closed"
  | "rejected";

export type CrmProjectRevision = {
  id: string;
  round: number;
  title: string;
  note: string;
  status: ProjectRevisionStatus;
  requestedBy: "customer" | "admin";
  customerEmail?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
};

/** Thread between designer ↔ client (and admin) on a CRM project */
export type CrmProjectMessage = {
  id: string;
  kind: "remark" | "request" | "reply";
  from: "designer" | "customer" | "admin";
  author: string;
  designerId?: string;
  body: string;
  createdAt: string;
  /** When kind=request: open until client replies / designer closes */
  status?: "open" | "fulfilled" | "closed";
};

export type CrmOrder = {
  id: string;
  orderId: string;
  title?: string;
  customerName: string;
  customerEmail: string;
  categoryName: string;
  packageName: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  designerCount: number;
  revisionLimit: number;
  revisionsUsed: number;
  revisions: CrmProjectRevision[];
  /** Designer remarks + client requests */
  messages?: CrmProjectMessage[];
  serviceId?: string;
  /** Marketplace designers assigned to this project */
  assignedDesignerIds: string[];
};

export type CrmActivity = {
  id: string;
  type: ActivityType;
  title: string;
  body: string;
  createdAt: string;
  ownerId: string;
  relatedType?: "lead" | "deal" | "contact" | "company" | "order" | "project";
  relatedId?: string;
};

export type CrmDesignerNote = {
  designerId: string;
  status: "active" | "vip" | "paused" | "flagged";
  notes: string;
  tags: string[];
  ownerId: string;
  updatedAt: string;
};

export type VisitorSource =
  | "google_onetap"
  | "google_button"
  | "login_form"
  | "signup_form"
  | "remembered"
  | "manual"
  | "page_visit"
  | "portal";

export type CrmGeo = {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  fetchedAt?: string;
};

export type CrmGeoHistory = {
  ip: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  at?: string;
};

export type CrmPageView = {
  id: string;
  path: string;
  enteredAt: string;
  leftAt?: string;
  durationMs: number;
  sessionId: string;
};

export type CrmVisitSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  pageCount: number;
};

export type CrmVisitor = {
  id: string;
  /** Stable anonymous browser id */
  visitorKey: string;
  email?: string;
  name?: string;
  picture?: string;
  source: VisitorSource;
  signedIn: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  path?: string;
  hits: number;
  visitCount: number;
  totalDurationMs: number;
  geo?: CrmGeo;
  /** Previous IPs so a new visit doesn't erase older locations */
  geoHistory?: CrmGeoHistory[];
  pageViews: CrmPageView[];
  sessions: CrmVisitSession[];
  userAgent?: string;
  language?: string;
};

export type InboxKind = "revision" | "message" | "winner" | "like";

export type CrmInboxItem = {
  id: string;
  kind: InboxKind;
  status: "open" | "in_progress" | "resolved";
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceTitle: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  relatedRevisionId?: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

/** Customer review after project done — listed on site only once admin approves */
export type CrmReview = {
  id: string;
  projectId?: string;
  orderId?: string;
  serviceId?: string;
  designerId: string;
  designerName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  categoryName?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  adminNote?: string;
};

export type CrmState = {
  version: 1;
  owners: CrmOwner[];
  companies: CrmCompany[];
  contacts: CrmContact[];
  leads: CrmLead[];
  deals: CrmDeal[];
  tasks: CrmTask[];
  activities: CrmActivity[];
  orders: CrmOrder[];
  designerNotes: CrmDesignerNote[];
  visitors: CrmVisitor[];
  inbox: CrmInboxItem[];
  reviews: CrmReview[];
  /** Public IPs of admin/staff — never shown as website visitors */
  excludedVisitorIps?: string[];
  /** Soft-delete tombstones so merge doesn't resurrect removed rows */
  deleted?: {
    visitors?: string[];
    leads?: string[];
    orders?: string[];
    contacts?: string[];
    inbox?: string[];
    deals?: string[];
  };
};

const CRM_KEY = "clm_crm_v1";
const CRM_UPDATED_KEY = "clm_crm_updated_at";
const ADMIN_SESSION_KEY = "clm_admin_session_v1";
const STAFF_BROWSER_KEY = "clm_staff_browser_v1";
const STAFF_EMAILS_KEY = "clm_staff_emails_v1";
export const CRM_HYDRATED_EVENT = "clm_crm_hydrated";

export const DEAL_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "New lead", color: "#6b6a68" },
  { id: "qualified", label: "Qualified", color: "#2486cb" },
  { id: "brief", label: "Briefing", color: "#834692" },
  { id: "proposal", label: "Proposal", color: "#a5823d" },
  { id: "negotiation", label: "Negotiation", color: "#fe5f50" },
  { id: "won", label: "Won", color: "#00a581" },
  { id: "lost", label: "Lost", color: "#9ca3af" },
];

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

/** Website /contact (and studio/signup form) sources saved by /api/forms/submit */
export function isContactFormLead(lead: { source?: string }) {
  const s = String(lead.source || "").trim().toLowerCase();
  return s === "contact form";
}

export function isWebsiteFormLead(lead: { source?: string }) {
  const s = String(lead.source || "").trim().toLowerCase();
  return (
    s === "contact form" ||
    s === "studio form" ||
    s === "signup" ||
    s === "package brief"
  );
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function isoDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function seed(): CrmState {
  /** Empty CRM shell — real data comes from website forms + admin edits. */
  const owners: CrmOwner[] = [
    {
      id: "own_admin",
      name: "Admin",
      email: "admin@creativelogomakers.com",
      role: "admin",
    },
    {
      id: "own_sara",
      name: "Sara Khan",
      email: "sara@creativelogomakers.com",
      role: "sales",
    },
    {
      id: "own_leo",
      name: "Leo Martins",
      email: "leo@creativelogomakers.com",
      role: "success",
    },
    {
      id: "own_maya",
      name: "Maya Chen",
      email: "maya@creativelogomakers.com",
      role: "ops",
    },
  ];

  return {
    version: 1,
    owners,
    companies: [],
    contacts: [],
    leads: [],
    deals: [],
    tasks: [],
    activities: [],
    orders: [],
    designerNotes: [],
    visitors: [],
    inbox: [],
    reviews: [],
    excludedVisitorIps: [],
  };
}

function readRaw(): CrmState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CRM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrmState;
  } catch {
    return null;
  }
}

function readCrmUpdatedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CRM_UPDATED_KEY);
  } catch {
    return null;
  }
}

export function loadCrm(): CrmState {
  const existing = readRaw();
  if (existing?.version === 1) {
    let dirty = false;
    if (!Array.isArray(existing.visitors)) {
      existing.visitors = [];
      dirty = true;
    }
    if (!Array.isArray(existing.inbox)) {
      existing.inbox = [];
      dirty = true;
    }
    if (!Array.isArray(existing.reviews)) {
      existing.reviews = [];
      dirty = true;
    }
    if (!Array.isArray(existing.excludedVisitorIps)) {
      existing.excludedVisitorIps = [];
      dirty = true;
    }
    existing.visitors = existing.visitors.map(normalizeVisitor);
    existing.orders = (existing.orders || []).map((o) => {
      const n = normalizeOrder(o);
      if (
        n.revisionLimit !== o.revisionLimit ||
        !Array.isArray(o.revisions)
      ) {
        dirty = true;
      }
      return n;
    });
    if (dirty) saveCrm(existing);
    return existing;
  }
  const fresh = seed();
  // Persist seed locally ONLY with an old timestamp so hydrate always
  // prefers the server CRM (prevents demo seed wiping real visitors).
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CRM_KEY, JSON.stringify(fresh));
      localStorage.setItem(CRM_UPDATED_KEY, "1970-01-01T00:00:00.000Z");
    } catch {
      /* ignore */
    }
  }
  return fresh;
}

function normalizeVisitor(v: CrmVisitor): CrmVisitor {
  return {
    ...v,
    visitorKey: v.visitorKey || v.id,
    hits: v.hits || 0,
    visitCount: v.visitCount || 1,
    totalDurationMs: v.totalDurationMs || 0,
    pageViews: Array.isArray(v.pageViews) ? v.pageViews : [],
    sessions: Array.isArray(v.sessions) ? v.sessions : [],
    email: v.email?.toLowerCase(),
  };
}

function normalizeOrder(o: CrmOrder): CrmOrder {
  const revisions = Array.isArray(o.revisions) ? o.revisions : [];
  const limit =
    typeof o.revisionLimit === "number" && o.revisionLimit > 0
      ? o.revisionLimit
      : o.packageName?.toLowerCase().includes("platinum")
        ? 5
        : 3;
  return {
    ...o,
    title: o.title || `${o.categoryName} — ${o.customerName}`,
    revisionLimit: limit,
    revisionsUsed: o.revisionsUsed ?? revisions.length,
    revisions,
    messages: Array.isArray(o.messages) ? o.messages : [],
    assignedDesignerIds: Array.isArray(o.assignedDesignerIds)
      ? o.assignedDesignerIds
      : [],
  };
}

export function saveCrm(state: CrmState) {
  if (typeof window === "undefined") return;
  const updatedAt = new Date().toISOString();
  localStorage.setItem(CRM_KEY, JSON.stringify(state));
  localStorage.setItem(CRM_UPDATED_KEY, updatedAt);
  // Lazy-import to avoid circular deps at module init
  void import("@/lib/db-sync").then(({ scheduleStorePush }) => {
    scheduleStorePush("crm", state);
  });
}

/** Pull CRM from Postgres (or push local if server empty / older). */
export async function hydrateCrmFromServer(): Promise<CrmState> {
  if (typeof window === "undefined") return seed();
  const { hydrateStoreKey } = await import("@/lib/db-sync");
  await hydrateStoreKey({
    key: "crm",
    localRaw: localStorage.getItem(CRM_KEY),
    localUpdatedAt: readCrmUpdatedAt(),
    writeLocal: (raw, updatedAt) => {
      localStorage.setItem(CRM_KEY, raw);
      localStorage.setItem(CRM_UPDATED_KEY, updatedAt);
    },
  });
  const state = loadCrm();
  if (dedupeOrdersAndDeals(state)) {
    saveCrm(state);
  }
  emitCrm(CRM_HYDRATED_EVENT, state);
  return state;
}

/** Collapse duplicate projects/deals from client+server dual writes. */
function dedupeOrdersAndDeals(state: CrmState): boolean {
  let dirty = false;

  const orderMap = new Map<string, CrmOrder>();
  for (const o of state.orders || []) {
    const email = (o.customerEmail || "").toLowerCase();
    const pkg = (o.packageName || "").toLowerCase();
    const cat = (o.categoryName || "").toLowerCase();
    const key = o.serviceId
      ? `svc:${o.serviceId}`
      : email && (pkg || cat)
        ? `em:${email}:${pkg}:${cat}`
        : `id:${o.id}`;
    const prev = orderMap.get(key);
    if (!prev) {
      orderMap.set(key, o);
      continue;
    }
    dirty = true;
    const preferNewer =
      Date.parse(o.updatedAt || "") >= Date.parse(prev.updatedAt || "");
    const base = preferNewer ? o : prev;
    const other = preferNewer ? prev : o;
    orderMap.set(key, {
      ...other,
      ...base,
      id: prev.id,
      orderId: base.orderId || other.orderId,
      serviceId: base.serviceId || other.serviceId,
      paymentStatus:
        base.paymentStatus === "paid" || other.paymentStatus === "paid"
          ? "paid"
          : base.paymentStatus || other.paymentStatus,
      amount: Math.max(base.amount || 0, other.amount || 0),
      revisions: (base.revisions || []).length
        ? base.revisions
        : other.revisions,
      messages: (base.messages || []).length ? base.messages : other.messages,
      assignedDesignerIds: Array.from(
        new Set([
          ...(base.assignedDesignerIds || []),
          ...(other.assignedDesignerIds || []),
        ]),
      ),
      createdAt:
        Date.parse(base.createdAt || "") <= Date.parse(other.createdAt || "")
          ? base.createdAt
          : other.createdAt,
    });
  }
  if (dirty) state.orders = [...orderMap.values()];

  const dealMap = new Map<string, CrmDeal>();
  for (const d of state.deals || []) {
    const title = (d.title || "").toLowerCase();
    const pkg = (d.packageName || "").toLowerCase();
    const key = d.orderCode
      ? `ord:${d.orderCode}`
      : d.orderId
        ? `ordid:${d.orderId}`
        : title && pkg
          ? `t:${title}:${pkg}`
          : `id:${d.id}`;
    const prev = dealMap.get(key);
    if (!prev) {
      dealMap.set(key, d);
      continue;
    }
    dirty = true;
    const preferNewer =
      Date.parse(d.updatedAt || "") >= Date.parse(prev.updatedAt || "");
    dealMap.set(key, {
      ...(preferNewer ? prev : d),
      ...(preferNewer ? d : prev),
      id: prev.id,
      probability: Math.max(prev.probability || 0, d.probability || 0),
      value: Math.max(prev.value || 0, d.value || 0),
    });
  }
  if (dealMap.size !== (state.deals || []).length) {
    dirty = true;
    state.deals = [...dealMap.values()];
  }

  return dirty;
}

export function onCrmHydrated(cb: (state: CrmState) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<CrmState>).detail;
    if (detail) cb(detail);
  };
  window.addEventListener(CRM_HYDRATED_EVENT, handler);
  return () => window.removeEventListener(CRM_HYDRATED_EVENT, handler);
}

export function resetCrm() {
  const fresh = seed();
  saveCrm(fresh);
  return fresh;
}

export function getAdminSession(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as { email: string; name: string }) : null;
  } catch {
    return null;
  }
}

export function adminLogin(email: string, password: string) {
  const user = email.trim();
  const pass = password;
  /** Strong admin login — not shown on the sign-in screen */
  const ok =
    user === "CLM.Admin.XR74K9M2" && pass === "Qk8mR2nP7xA4";
  if (!ok) return { ok: false as const, error: "Invalid admin credentials." };
  sessionStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      email: "admin@creativelogomakers.com",
      name: "Admin",
      username: user,
    }),
  );
  try {
    localStorage.setItem(STAFF_BROWSER_KEY, "1");
    localStorage.setItem(
      STAFF_EMAILS_KEY,
      JSON.stringify(["admin@creativelogomakers.com"]),
    );
  } catch {
    /* ignore */
  }
  return { ok: true as const };
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

/** Browser used for admin CRM — never count as a public website visitor. */
export function isStaffBrowser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY)) return true;
    if (localStorage.getItem(STAFF_BROWSER_KEY) === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isStaffEmail(email?: string | null): boolean {
  const e = (email || "").trim().toLowerCase();
  if (!e) return false;
  if (e === "admin@creativelogomakers.com") return true;
  if (e.endsWith("@creativelogomakers.com")) return true;
  // Owner / operator Google accounts — never website visitors
  if (
    e === "abdulwahibshera@gmail.com" ||
    e === "henry.jamesaws@gmail.com" ||
    e === "henryjames3534@gmail.com"
  ) {
    return true;
  }
  try {
    const owners = stateOwnerEmails();
    if (owners.includes(e)) return true;
    const raw = localStorage.getItem(STAFF_EMAILS_KEY);
    if (raw) {
      const list = JSON.parse(raw) as string[];
      if (Array.isArray(list) && list.map((x) => x.toLowerCase()).includes(e)) {
        return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function rememberStaffEmail(email?: string | null) {
  const e = (email || "").trim().toLowerCase();
  if (!e) return;
  try {
    const raw = localStorage.getItem(STAFF_EMAILS_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const next = Array.from(new Set([...(Array.isArray(list) ? list : []), e]));
    localStorage.setItem(STAFF_EMAILS_KEY, JSON.stringify(next.slice(-50)));
    localStorage.setItem(STAFF_BROWSER_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function updateDealStage(dealId: string, stage: DealStage) {
  const state = loadCrm();
  const deal = state.deals.find((d) => d.id === dealId);
  if (!deal) return state;
  deal.stage = stage;
  deal.probability =
    stage === "won"
      ? 100
      : stage === "lost"
        ? 0
        : Math.min(90, deal.probability + 5);
  deal.updatedAt = new Date().toISOString();
  state.activities.unshift({
    id: uid("ac"),
    type: "deal",
    title: `Deal moved to ${stage}`,
    body: `${deal.title} → ${stage}`,
    createdAt: new Date().toISOString(),
    ownerId: deal.ownerId,
    relatedType: "deal",
    relatedId: deal.id,
  });
  saveCrm(state);
  return state;
}

const VISITOR_EVENT = "clm_crm_visitor";
const INBOX_EVENT = "clm_crm_inbox";
const REVIEW_EVENT = "clm_crm_review";
export const CRM_CHANGED_EVENT = "clm_crm_changed";

function emitCrm(event: string, detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(event, { detail }));
  if (event !== CRM_CHANGED_EVENT) {
    window.dispatchEvent(new CustomEvent(CRM_CHANGED_EVENT, { detail }));
  }
}

function findVisitor(
  state: CrmState,
  opts: { visitorKey?: string; email?: string },
) {
  if (opts.email) {
    const byEmail = state.visitors.find(
      (v) => v.email === opts.email!.toLowerCase(),
    );
    if (byEmail) return byEmail;
  }
  if (opts.visitorKey) {
    return state.visitors.find((v) => v.visitorKey === opts.visitorKey);
  }
  return undefined;
}

export function trackVisitor(input: {
  email?: string;
  visitorKey?: string;
  name?: string;
  picture?: string;
  source: VisitorSource;
  signedIn?: boolean;
  path?: string;
  createLead?: boolean;
  geo?: CrmGeo;
  userAgent?: string;
  language?: string;
}) {
  if (isInternalSitePath(input.path)) return loadCrm();
  if (isStaffBrowser()) return loadCrm();
  const email = input.email?.trim().toLowerCase();
  if (email && isStaffEmail(email)) return loadCrm();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return loadCrm();
  if (!email && !input.visitorKey) return loadCrm();

  const state = loadCrm();
  if (!Array.isArray(state.visitors)) state.visitors = [];
  const now = new Date().toISOString();
  let existing = findVisitor(state, {
    email,
    visitorKey: input.visitorKey,
  });

  // Merge anon visitor into email visitor when email appears
  if (email && input.visitorKey) {
    const anon = state.visitors.find(
      (v) => v.visitorKey === input.visitorKey && !v.email,
    );
    const byEmail = state.visitors.find((v) => v.email === email);
    if (anon && byEmail && anon.id !== byEmail.id) {
      byEmail.pageViews = [...anon.pageViews, ...byEmail.pageViews]
        .sort((a, b) => +new Date(b.enteredAt) - +new Date(a.enteredAt))
        .slice(0, 200);
      byEmail.sessions = [...anon.sessions, ...byEmail.sessions].slice(0, 50);
      byEmail.totalDurationMs += anon.totalDurationMs;
      byEmail.visitCount += anon.visitCount;
      byEmail.hits += anon.hits;
      if (anon.geo && !byEmail.geo?.ip) byEmail.geo = anon.geo;
      state.visitors = state.visitors.filter((v) => v.id !== anon.id);
      existing = byEmail;
    } else if (anon && !byEmail) {
      anon.email = email;
      existing = anon;
    }
  }

  const name =
    input.name?.trim() ||
    existing?.name ||
    (email ? email.split("@")[0] : "Anonymous");

  if (existing) {
    existing.name = name;
    if (email) existing.email = email;
    if (input.visitorKey) existing.visitorKey = input.visitorKey;
    if (input.picture) existing.picture = input.picture;
    existing.source = input.source;
    existing.signedIn = existing.signedIn || Boolean(input.signedIn);
    existing.lastSeenAt = now;
    existing.hits += 1;
    if (input.path) existing.path = input.path;
    if (input.geo) existing.geo = { ...existing.geo, ...input.geo };
    if (input.userAgent) existing.userAgent = input.userAgent;
    if (input.language) existing.language = input.language;
  } else {
    state.visitors.unshift({
      id: uid("vis"),
      visitorKey: input.visitorKey || uid("vk"),
      email,
      name,
      picture: input.picture,
      source: input.source,
      signedIn: Boolean(input.signedIn),
      firstSeenAt: now,
      lastSeenAt: now,
      path: input.path,
      hits: 1,
      visitCount: 0,
      totalDurationMs: 0,
      geo: input.geo,
      pageViews: [],
      sessions: [],
      userAgent: input.userAgent,
      language: input.language,
    });
    state.activities.unshift({
      id: uid("ac"),
      type: "note",
      title: email ? "New visitor email captured" : "New anonymous visitor",
      body: `${email || input.visitorKey} via ${input.source.replace(/_/g, " ")}`,
      createdAt: now,
      ownerId: "own_admin",
      relatedType: "lead",
    });
  }

  if (email && input.createLead !== false) {
    const leadIdx = state.leads.findIndex((l) => l.email === email);
    if (leadIdx < 0) {
      state.leads.unshift({
        id: uid("ld"),
        name: name || email,
        email,
        source:
          input.source === "google_onetap" || input.source === "google_button"
            ? "Google"
            : input.source === "login_form"
              ? "Login form"
              : input.source === "signup_form"
                ? "Signup form"
                : "Visitor",
        status: "new",
        score: input.source.startsWith("google") ? 70 : 45,
        interest: "Site visit / login",
        valueEstimate: 299,
        ownerId: "own_admin",
        notes: `Auto-captured visitor (${input.source})`,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      state.leads[leadIdx].updatedAt = now;
      if (name) state.leads[leadIdx].name = name;
    }
  }

  saveCrm(state);
  emitCrm(VISITOR_EVENT, { email, visitorKey: input.visitorKey });
  return state;
}

export function updateVisitorGeo(
  visitorKey: string,
  geo: CrmGeo,
  email?: string,
) {
  const state = loadCrm();
  const v = findVisitor(state, { visitorKey, email });
  if (!v) return state;
  const prevIp = v.geo?.ip?.trim();
  const nextIp = geo.ip?.trim();
  if (prevIp && nextIp && prevIp !== nextIp) {
    const hist = Array.isArray(v.geoHistory) ? [...v.geoHistory] : [];
    if (!hist.some((h) => h.ip === prevIp)) {
      hist.unshift({
        ip: prevIp,
        country: v.geo?.country,
        countryCode: v.geo?.countryCode,
        city: v.geo?.city,
        region: v.geo?.region,
        at: v.geo?.fetchedAt || v.lastSeenAt,
      });
    }
    v.geoHistory = hist.slice(0, 20);
  }
  // Don't wipe existing IP if new geo has none
  v.geo = {
    ...v.geo,
    ...geo,
    ip: nextIp || v.geo?.ip,
    fetchedAt: new Date().toISOString(),
  };
  v.lastSeenAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

/** Pull remembered Google emails onto EXISTING website guests only — never create staff rows. */
export function syncRememberedGoogleIntoVisitors(
  accounts: { email: string; name: string; picture?: string }[],
) {
  if (!accounts.length) return loadCrm();
  // Admin CRM browser must never invent "visitors" from its own Google accounts
  if (isStaffBrowser()) return loadCrm();

  let state = loadCrm();
  const guests = state.visitors.filter(
    (v) => !v.email && isWebsiteVisitor(v) && Boolean(v.geo?.ip || v.path),
  );
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const acc of accounts) {
    const email = acc.email.trim().toLowerCase();
    if (!email || isStaffEmail(email)) continue;
    const existing = state.visitors.find((v) => v.email === email);
    if (existing) {
      if (acc.name) existing.name = acc.name;
      if (acc.picture) existing.picture = acc.picture;
      existing.lastSeenAt = new Date().toISOString();
      continue;
    }

    // Match guest by name (e.g. user typed "Henry James")
    const byName = guests.find(
      (g) =>
        g.name &&
        g.name !== "Anonymous" &&
        (norm(g.name) === norm(acc.name) ||
          norm(acc.name).includes(norm(g.name)) ||
          norm(g.name).includes(norm(acc.name))),
    );
    if (byName) {
      state = attachVisitorEmail({
        visitorId: byName.id,
        visitorKey: byName.visitorKey,
        email,
        name: acc.name,
      });
      continue;
    }

    // Only attach to newest real website guest — never create a new visitor row
    if (accounts.length === 1 && guests[0]) {
      state = attachVisitorEmail({
        visitorId: guests[0].id,
        visitorKey: guests[0].visitorKey,
        email,
        name: acc.name,
      });
    }
  }

  emitCrm(VISITOR_EVENT);
  return loadCrm();
}

/** Manually attach email shown on Google One Tap (type/paste → CRM) */
export function attachVisitorEmail(input: {
  visitorId?: string;
  visitorKey?: string;
  email: string;
  name?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return loadCrm();

  const state = loadCrm();
  let v =
    (input.visitorId && state.visitors.find((x) => x.id === input.visitorId)) ||
    (input.visitorKey &&
      state.visitors.find((x) => x.visitorKey === input.visitorKey)) ||
    state.visitors.find((x) => !x.email) ||
    state.visitors[0];

  const name =
    input.name?.trim() ||
    email.split("@")[0].replace(/[._]/g, " ") ||
    "Visitor";

  if (!v) {
    return trackVisitor({
      email,
      name,
      source: "manual",
      signedIn: false,
      createLead: true,
    });
  }

  // Merge if another row already has this email
  const byEmail = state.visitors.find((x) => x.email === email && x.id !== v!.id);
  if (byEmail) {
    byEmail.pageViews = [...(v.pageViews || []), ...(byEmail.pageViews || [])]
      .sort((a, b) => +new Date(b.enteredAt) - +new Date(a.enteredAt))
      .slice(0, 200);
    byEmail.sessions = [...(v.sessions || []), ...(byEmail.sessions || [])].slice(
      0,
      50,
    );
    byEmail.totalDurationMs += v.totalDurationMs || 0;
    byEmail.visitCount += v.visitCount || 0;
    byEmail.hits += v.hits || 0;
    if (v.geo && !byEmail.geo?.country) byEmail.geo = v.geo;
    byEmail.name = name;
    byEmail.source = "manual";
    byEmail.lastSeenAt = new Date().toISOString();
    state.visitors = state.visitors.filter((x) => x.id !== v!.id);
    v = byEmail;
  } else {
    v.email = email;
    v.name = name;
    v.source = "manual";
    v.lastSeenAt = new Date().toISOString();
  }

  const leadIdx = state.leads.findIndex((l) => l.email === email);
  if (leadIdx < 0) {
    const now = new Date().toISOString();
    state.leads.unshift({
      id: uid("ld"),
      name,
      email,
      source: "Google One Tap (manual)",
      status: "new",
      score: 75,
      interest: "Site visit",
      valueEstimate: 299,
      ownerId: "own_admin",
      notes: "Email typed from Google One Tap display",
      createdAt: now,
      updatedAt: now,
    });
  }

  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function startVisitorSession(input: {
  visitorKey: string;
  email?: string;
  path: string;
  userAgent?: string;
  language?: string;
}) {
  if (isInternalSitePath(input.path)) return loadCrm();
  if (isStaffBrowser()) return loadCrm();
  if (isStaffEmail(input.email)) return loadCrm();
  const state = loadCrm();
  let v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  const now = new Date().toISOString();
  if (!v) {
    trackVisitor({
      visitorKey: input.visitorKey,
      email: input.email,
      source: "page_visit",
      path: input.path,
      createLead: Boolean(input.email),
      userAgent: input.userAgent,
      language: input.language,
    });
    return loadCrm();
  }

  // Close open page view
  const openPv = v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.leftAt = now;
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
    v.totalDurationMs += openPv.durationMs;
  }

  const lastSession = v.sessions[0];
  const gapMs = lastSession
    ? +new Date(now) - +new Date(lastSession.endedAt || lastSession.startedAt)
    : Infinity;
  const newSession = !lastSession || gapMs > 30 * 60 * 1000;

  let sessionId: string;
  if (newSession) {
    if (lastSession && !lastSession.endedAt) {
      lastSession.endedAt = now;
      lastSession.durationMs = Math.max(
        0,
        +new Date(now) - +new Date(lastSession.startedAt),
      );
    }
    sessionId = uid("ses");
    v.sessions.unshift({
      id: sessionId,
      startedAt: now,
      durationMs: 0,
      pageCount: 1,
    });
    v.visitCount += 1;
  } else {
    sessionId = lastSession.id;
    lastSession.pageCount += 1;
    lastSession.endedAt = undefined;
  }

  v.pageViews.unshift({
    id: uid("pv"),
    path: input.path,
    enteredAt: now,
    durationMs: 0,
    sessionId,
  });
  v.pageViews = v.pageViews.slice(0, 200);
  v.sessions = v.sessions.slice(0, 50);
  v.path = input.path;
  v.lastSeenAt = now;
  v.hits += 1;
  if (input.userAgent) v.userAgent = input.userAgent;
  if (input.language) v.language = input.language;

  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function heartbeatVisitorPage(input: {
  visitorKey: string;
  email?: string;
  path: string;
}) {
  const state = loadCrm();
  const v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  if (!v) return state;
  const now = new Date().toISOString();
  const openPv =
    v.pageViews.find((p) => !p.leftAt && p.path === input.path) ||
    v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
  }
  const ses = v.sessions[0];
  if (ses && !ses.endedAt) {
    ses.durationMs = Math.max(0, +new Date(now) - +new Date(ses.startedAt));
  }
  v.lastSeenAt = now;
  saveCrm(state);
  return state;
}

export function endVisitorPage(input: {
  visitorKey: string;
  email?: string;
  path?: string;
}) {
  const state = loadCrm();
  const v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  if (!v) return state;
  const now = new Date().toISOString();
  const openPv = v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.leftAt = now;
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
    v.totalDurationMs += openPv.durationMs;
  }
  const ses = v.sessions[0];
  if (ses) {
    ses.endedAt = now;
    ses.durationMs = Math.max(0, +new Date(now) - +new Date(ses.startedAt));
  }
  v.lastSeenAt = now;
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function pushCustomerInbox(input: {
  kind: InboxKind;
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceTitle: string;
  body: string;
  relatedRevisionId?: string;
}) {
  const state = loadCrm();
  if (!Array.isArray(state.inbox)) state.inbox = [];
  const now = new Date().toISOString();
  const item: CrmInboxItem = {
    id: uid("inb"),
    kind: input.kind,
    status: "open",
    customerEmail: input.customerEmail.toLowerCase(),
    customerName: input.customerName,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    body: input.body,
    createdAt: now,
    updatedAt: now,
    relatedRevisionId: input.relatedRevisionId,
  };
  state.inbox.unshift(item);
  state.activities.unshift({
    id: uid("ac"),
    type: input.kind === "revision" ? "revision" : input.kind === "message" ? "email" : "note",
    title:
      input.kind === "revision"
        ? "Customer revision request"
        : input.kind === "message"
          ? "Customer portal message"
          : `Customer ${input.kind}`,
    body: `${input.customerEmail}: ${input.body.slice(0, 120)}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: input.serviceId,
  });
  state.tasks.unshift({
    id: uid("tk"),
    title:
      input.kind === "revision"
        ? `Review revision — ${input.customerName}`
        : `Reply to ${input.customerName}`,
    status: "todo",
    priority: input.kind === "revision" ? "high" : "medium",
    dueAt: isoDays(1),
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: input.serviceId,
    createdAt: now,
  });
  saveCrm(state);

  // Attach revision rounds onto the matching project
  if (input.kind === "revision") {
    const project = findOrCreateProjectForCustomer({
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
    });
    addProjectRevision({
      projectId: project.id,
      note: input.body,
      title: `Customer request`,
      requestedBy: "customer",
      customerEmail: input.customerEmail,
      status: "pending",
    });
  } else if (input.kind === "message") {
    const project = findOrCreateProjectForCustomer({
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
    });
    const live = loadCrm();
    const p = live.orders.find((o) => o.id === project.id);
    if (p) {
      if (!Array.isArray(p.messages)) p.messages = [];
      p.messages.unshift({
        id: uid("pmsg"),
        kind: "reply",
        from: "customer",
        author: input.customerName,
        body: input.body,
        createdAt: now,
      });
      // Mark open designer requests as fulfilled when client replies
      for (const m of p.messages) {
        if (m.kind === "request" && m.status === "open") {
          m.status = "fulfilled";
        }
      }
      p.updatedAt = now;
      saveCrm(live);
    }
    emitCrm(INBOX_EVENT);
  } else {
    emitCrm(INBOX_EVENT);
  }
  emitCrm(VISITOR_EVENT);
  return loadCrm();
}

export function updateInboxItem(
  id: string,
  patch: Partial<Pick<CrmInboxItem, "status" | "adminReply">>,
) {
  const state = loadCrm();
  const item = state.inbox.find((i) => i.id === id);
  if (!item) return state;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function onVisitorTracked(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(VISITOR_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(VISITOR_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function onInboxUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(INBOX_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(INBOX_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function formatDuration(ms: number) {
  if (!ms || ms < 1000) return "<1s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function upsertLead(input: Partial<CrmLead> & { name: string; email: string }) {
  const state = loadCrm();
  const now = new Date().toISOString();
  const email = input.email.toLowerCase();
  if (input.id) {
    const i = state.leads.findIndex((l) => l.id === input.id);
    if (i >= 0) {
      state.leads[i] = {
        ...state.leads[i],
        ...input,
        email,
        updatedAt: now,
      };
      saveCrm(state);
      return state;
    }
  }

  // Same email = same lead — update instead of duplicating
  const existingIdx = state.leads.findIndex(
    (l) => (l.email || "").toLowerCase() === email,
  );
  if (existingIdx >= 0) {
    const prev = state.leads[existingIdx];
    state.leads[existingIdx] = {
      ...prev,
      ...input,
      id: prev.id,
      email,
      name: input.name || prev.name,
      notes: input.notes
        ? prev.notes && prev.notes !== input.notes
          ? `${input.notes}\n---\n${prev.notes}`.slice(0, 4000)
          : input.notes
        : prev.notes,
      score: Math.max(prev.score || 0, input.score ?? 0),
      valueEstimate: input.valueEstimate ?? prev.valueEstimate,
      updatedAt: now,
    };
    saveCrm(state);
    return state;
  }

  const lead = {
    id: uid("ld"),
    name: input.name,
    email,
    phone: input.phone,
    company: input.company,
    source: input.source || "Manual",
    status: input.status || ("new" as LeadStatus),
    score: input.score ?? 50,
    interest: input.interest || "Logo design",
    valueEstimate: input.valueEstimate ?? 499,
    ownerId: input.ownerId || "own_admin",
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
  };
  state.leads.unshift(lead);
  if (state.deleted?.leads) {
    state.deleted.leads = state.deleted.leads.filter(
      (id) => id !== lead.id && id !== `e:${lead.email}`,
    );
  }
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "New lead",
    body: `${lead.name} <${lead.email}> · ${lead.source} · ${lead.interest}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "lead",
    relatedId: lead.id,
  });
  saveCrm(state);
  return state;
}

export function deleteLead(id: string) {
  const state = loadCrm();
  const lead = state.leads.find((l) => l.id === id);
  state.leads = state.leads.filter((l) => l.id !== id);

  // Cascade pipeline deals tied to this lead
  const dealIds = state.deals
    .filter((d) => d.leadId === id)
    .map((d) => d.id);
  state.deals = state.deals.filter((d) => d.leadId !== id);

  state.deleted = state.deleted || {};
  state.deleted.leads = Array.from(
    new Set([...(state.deleted.leads || []), id]),
  ).slice(-500);
  if (dealIds.length) {
    state.deleted.deals = Array.from(
      new Set([...(state.deleted.deals || []), ...dealIds]),
    ).slice(-500);
  }
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Lead deleted",
    body: lead
      ? `${lead.name} <${lead.email}>${dealIds.length ? ` · ${dealIds.length} pipeline deal(s) removed` : ""}`
      : id,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "lead",
    relatedId: id,
  });
  saveCrm(state);
  return state;
}

export function deleteVisitor(id: string) {
  return deleteVisitors([id]);
}

export function deleteVisitors(ids: string[]) {
  const state = loadCrm();
  const idSet = new Set(ids.filter(Boolean));
  if (!idSet.size) return state;
  const removed = state.visitors.filter((x) => idSet.has(x.id));
  state.visitors = state.visitors.filter((x) => !idSet.has(x.id));
  state.deleted = state.deleted || {};
  const keys: string[] = [];
  for (const v of removed) {
    // Only tombstone by row id — same browser / IP / email can visit again.
    keys.push(v.id);
  }
  state.deleted.visitors = Array.from(
    new Set([...(state.deleted.visitors || []), ...keys]),
  ).slice(-500);
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: removed.length > 1 ? "Visitors deleted" : "Visitor deleted",
    body:
      removed.length > 1
        ? `${removed.length} website visitors removed`
        : removed[0]
          ? `${removed[0].email || removed[0].name || "Anonymous"} · ${removed[0].geo?.ip || "no IP"}`
          : [...idSet][0],
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
  });
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

/** True for public-site traffic only (exclude admin / designer / staff). */
export function isWebsiteVisitor(v: CrmVisitor): boolean {
  if (isStaffEmail(v.email)) return false;

  const ip = (v.geo?.ip || "").trim().toLowerCase();

  // Staff IP registered via /api/visitors/exclude-staff
  if (ip) {
    try {
      const banned = loadCrm().excludedVisitorIps || [];
      if (banned.some((x) => x.toLowerCase() === ip)) return false;
    } catch {
      /* ignore */
    }
  }

  // Must have a real client IP — form/email rows without geo are not visitors
  if (!ip) return false;

  if (v.source === "remembered" || v.source === "manual") return false;

  const paths = [
    v.path || "",
    ...(v.pageViews || []).map((p) => p.path || ""),
  ].map((p) => p.toLowerCase());

  const isInternal = (p: string) =>
    p.startsWith("/admin") || p.startsWith("/designer");

  const meaningful = paths.filter(Boolean);
  if (meaningful.length === 0) return true; // IP-only ping still counts
  if (meaningful.every(isInternal)) return false;
  return meaningful.some((p) => !isInternal(p));
}

function stateOwnerEmails(): string[] {
  try {
    const state = loadCrm();
    return (state.owners || [])
      .map((o) => (o.email || "").toLowerCase().trim())
      .filter(Boolean);
  } catch {
    return ["admin@creativelogomakers.com"];
  }
}

function isInternalSitePath(path?: string) {
  const p = (path || "").toLowerCase();
  return p.startsWith("/admin") || p.startsWith("/designer");
}

/** Find pipeline deals that belong to a project/order (for cascade delete). */
function dealsLinkedToOrder(state: CrmState, order: CrmOrder): CrmDeal[] {
  const email = (order.customerEmail || "").toLowerCase();
  const name = (order.customerName || "").toLowerCase();
  const expectedTitle = `${order.categoryName} — ${order.customerName}`.toLowerCase();
  const orderTitle = (order.title || "").toLowerCase();
  const orderCreated = Date.parse(order.createdAt || "") || 0;
  const code = order.orderId || "";

  return state.deals.filter((d) => {
    if (d.orderId && d.orderId === order.id) return true;
    if (d.orderCode && code && d.orderCode === code) return true;

    if (d.leadId) {
      const lead = state.leads.find((l) => l.id === d.leadId);
      if (lead?.notes && code && lead.notes.includes(code)) return true;
    }

    const title = (d.title || "").toLowerCase();
    const titleMatch =
      (orderTitle && title === orderTitle) ||
      (expectedTitle && title === expectedTitle) ||
      Boolean(
        name &&
          title.includes(name) &&
          order.categoryName &&
          title.includes(order.categoryName.toLowerCase()),
      );
    if (!titleMatch) return false;

    const pkgOk =
      !d.packageName ||
      !order.packageName ||
      d.packageName === order.packageName;
    if (!pkgOk) return false;

    if (d.leadId) {
      const lead = state.leads.find((l) => l.id === d.leadId);
      if (lead && lead.email?.toLowerCase() === email) return true;
    }
    if (d.contactId) {
      const c = state.contacts.find((x) => x.id === d.contactId);
      if (c && c.email?.toLowerCase() === email) return true;
    }

    const dealCreated = Date.parse(d.createdAt || "") || 0;
    if (
      orderCreated &&
      dealCreated &&
      Math.abs(orderCreated - dealCreated) < 7 * 86400000
    ) {
      return true;
    }

    return false;
  });
}

export function deleteDeal(id: string) {
  const state = loadCrm();
  const deal = state.deals.find((d) => d.id === id);
  state.deals = state.deals.filter((d) => d.id !== id);
  state.deleted = state.deleted || {};
  state.deleted.deals = Array.from(
    new Set([...(state.deleted.deals || []), id]),
  ).slice(-500);
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Deal deleted",
    body: deal ? `${deal.title} · ${money(deal.value)}` : id,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "deal",
    relatedId: id,
  });
  saveCrm(state);
  return state;
}

export function deleteOrder(id: string) {
  const state = loadCrm();
  const o = state.orders.find((x) => x.id === id);
  if (!o) {
    state.orders = state.orders.filter((x) => x.id !== id);
    saveCrm(state);
    return state;
  }

  const linkedDeals = dealsLinkedToOrder(state, o);
  const linkedDealIds = linkedDeals.map((d) => d.id);
  const linkedLeadIds = Array.from(
    new Set(
      linkedDeals
        .map((d) => d.leadId)
        .filter((x): x is string => Boolean(x)),
    ),
  );

  // Also drop leads whose notes mention this ORD code
  const code = o.orderId || "";
  for (const lead of state.leads) {
    if (code && lead.notes?.includes(code) && !linkedLeadIds.includes(lead.id)) {
      linkedLeadIds.push(lead.id);
    }
  }

  state.orders = state.orders.filter((x) => x.id !== id);
  state.tasks = state.tasks.filter((t) => t.projectId !== id);
  state.deals = state.deals.filter((d) => !linkedDealIds.includes(d.id));
  state.leads = state.leads.filter((l) => !linkedLeadIds.includes(l.id));

  // Inbox / reviews tied to this project
  if (Array.isArray(state.inbox)) {
    state.inbox = state.inbox.filter(
      (item) =>
        item.serviceId !== o.serviceId &&
        item.serviceId !== o.id &&
        item.serviceId !== o.orderId,
    );
  }
  if (Array.isArray(state.reviews)) {
    state.reviews = state.reviews.filter(
      (r) =>
        r.projectId !== o.id &&
        r.orderId !== o.orderId &&
        r.serviceId !== o.serviceId,
    );
  }

  state.deleted = state.deleted || {};
  const orderKeys = [id];
  if (o.orderId) orderKeys.push(`ord:${o.orderId}`);
  state.deleted.orders = Array.from(
    new Set([...(state.deleted.orders || []), ...orderKeys]),
  ).slice(-500);
  if (linkedDealIds.length) {
    state.deleted.deals = Array.from(
      new Set([
        ...(state.deleted.deals || []),
        ...linkedDealIds,
        `ordid:${o.id}`,
        ...(o.orderId ? [`ord:${o.orderId}`] : []),
      ]),
    ).slice(-500);
  }
  if (linkedLeadIds.length) {
    state.deleted.leads = Array.from(
      new Set([...(state.deleted.leads || []), ...linkedLeadIds]),
    ).slice(-500);
  }

  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Project deleted",
    body: `${o.orderId} · ${o.customerName} <${o.customerEmail}> · removed ${linkedDealIds.length} deal(s)${linkedLeadIds.length ? `, ${linkedLeadIds.length} lead(s)` : ""}`,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: id,
  });
  saveCrm(state);
  return state;
}

export function deleteContact(id: string) {
  const state = loadCrm();
  const c = state.contacts.find((x) => x.id === id);
  state.contacts = state.contacts.filter((x) => x.id !== id);
  state.deleted = state.deleted || {};
  const keys = [id];
  if (c?.email) keys.push(`e:${c.email.toLowerCase()}`);
  state.deleted.contacts = Array.from(
    new Set([...(state.deleted.contacts || []), ...keys]),
  ).slice(-500);
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Contact deleted",
    body: c ? `${c.name} <${c.email}>` : id,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "contact",
    relatedId: id,
  });
  saveCrm(state);
  return state;
}

export function deleteInboxItem(id: string) {
  const state = loadCrm();
  const item = state.inbox?.find((x) => x.id === id);
  state.inbox = (state.inbox || []).filter((x) => x.id !== id);
  state.deleted = state.deleted || {};
  state.deleted.inbox = Array.from(
    new Set([...(state.deleted.inbox || []), id]),
  ).slice(-500);
  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Inbox entry deleted",
    body: item
      ? `${item.customerName} <${item.customerEmail}> · ${item.serviceTitle || item.kind}`
      : id,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
  });
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function upsertTask(input: Partial<CrmTask> & { title: string }) {
  const state = loadCrm();
  if (input.id) {
    const i = state.tasks.findIndex((t) => t.id === input.id);
    if (i >= 0) state.tasks[i] = { ...state.tasks[i], ...input };
  } else {
    state.tasks.unshift({
      id: uid("tk"),
      title: input.title,
      status: input.status || "todo",
      priority: input.priority || "medium",
      dueAt: input.dueAt || isoDays(2),
      ownerId: input.ownerId || "own_admin",
      projectId: input.projectId,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: input.relatedType || (input.projectId ? "project" : undefined),
      relatedId: input.relatedId || input.projectId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    });
  }
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

/** Assign a marketplace designer to a CRM project */
export function assignDesignerToProject(input: {
  projectId: string;
  designerId: string;
  designerName: string;
  createKickoffTask?: boolean;
}) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return state;
  if (!Array.isArray(project.assignedDesignerIds)) {
    project.assignedDesignerIds = [];
  }
  if (!project.assignedDesignerIds.includes(input.designerId)) {
    project.assignedDesignerIds.unshift(input.designerId);
  }
  project.designerCount = Math.max(
    project.designerCount || 0,
    project.assignedDesignerIds.length,
  );
  project.updatedAt = new Date().toISOString();
  state.activities.unshift({
    id: uid("ac"),
    type: "status",
    title: `Designer assigned — ${project.orderId}`,
    body: `${input.designerName} → ${project.title || project.categoryName}`,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });
  if (input.createKickoffTask !== false) {
    state.tasks.unshift({
      id: uid("tk"),
      title: `Kickoff with ${input.designerName}`,
      status: "todo",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_admin",
      projectId: project.id,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: "project",
      relatedId: project.id,
      notes: `Assigned to project ${project.orderId}`,
      createdAt: new Date().toISOString(),
    });
  }
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function unassignDesignerFromProject(
  projectId: string,
  designerId: string,
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project) return state;
  project.assignedDesignerIds = (project.assignedDesignerIds || []).filter(
    (id) => id !== designerId,
  );
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function assignTaskToDesigner(input: {
  title: string;
  designerId: string;
  designerName: string;
  projectId?: string;
  priority?: TaskPriority;
  dueAt?: string;
  notes?: string;
}) {
  return upsertTask({
    title: input.title,
    designerId: input.designerId,
    designerName: input.designerName,
    projectId: input.projectId,
    priority: input.priority || "medium",
    dueAt: input.dueAt || isoDays(2),
    notes: input.notes,
    status: "todo",
    ownerId: "own_admin",
    relatedType: input.projectId ? "project" : undefined,
    relatedId: input.projectId,
  });
}

export function addProjectRevision(input: {
  projectId: string;
  title?: string;
  note: string;
  requestedBy?: "customer" | "admin";
  customerEmail?: string;
  status?: ProjectRevisionStatus;
}) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return state;
  const now = new Date().toISOString();
  const revs = Array.isArray(project.revisions) ? project.revisions : [];
  if (revs.length >= (project.revisionLimit || 3)) {
    return state;
  }
  const round = revs.length + 1;
  const rev: CrmProjectRevision = {
    id: uid("prv"),
    round,
    title: input.title || `Revision round ${round}`,
    note: input.note,
    status: input.status || "pending",
    requestedBy: input.requestedBy || "admin",
    customerEmail: input.customerEmail || project.customerEmail,
    createdAt: now,
    updatedAt: now,
  };
  project.revisions = [rev, ...revs];
  project.revisionsUsed = project.revisions.length;
  project.status = "revisions";
  project.updatedAt = now;
  state.activities.unshift({
    id: uid("ac"),
    type: "revision",
    title: `${project.orderId} · Round ${round}`,
    body: rev.note.slice(0, 160),
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });
  // Auto task for this revision round
  state.tasks.unshift({
    id: uid("tk"),
    title: `Handle revision R${round} — ${project.customerName}`,
    status: "todo",
    priority: "high",
    dueAt: isoDays(1),
    ownerId: "own_admin",
    projectId: project.id,
    relatedType: "project",
    relatedId: project.id,
    notes: rev.note,
    createdAt: now,
  });
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function updateProjectRevision(
  projectId: string,
  revisionId: string,
  patch: Partial<
    Pick<CrmProjectRevision, "status" | "adminReply" | "title" | "note">
  >,
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project) return state;
  const rev = project.revisions.find((r) => r.id === revisionId);
  if (!rev) return state;
  Object.assign(rev, patch, { updatedAt: new Date().toISOString() });
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

/** Designer portal → remarks or request assets/info from client */
export function postDesignerProjectMessage(input: {
  projectId: string;
  designerId: string;
  designerName: string;
  body: string;
  kind: "remark" | "request";
}) {
  const trimmed = input.body.trim();
  if (trimmed.length < 2) return null;

  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return null;
  if (
    Array.isArray(project.assignedDesignerIds) &&
    project.assignedDesignerIds.length > 0 &&
    !project.assignedDesignerIds.includes(input.designerId)
  ) {
    return null;
  }

  const now = new Date().toISOString();
  if (!Array.isArray(project.messages)) project.messages = [];

  const msg: CrmProjectMessage = {
    id: uid("pmsg"),
    kind: input.kind,
    from: "designer",
    author: input.designerName,
    designerId: input.designerId,
    body: trimmed,
    createdAt: now,
    status: input.kind === "request" ? "open" : undefined,
  };
  project.messages.unshift(msg);
  project.updatedAt = now;

  state.activities.unshift({
    id: uid("ac"),
    type: input.kind === "request" ? "email" : "note",
    title:
      input.kind === "request"
        ? `Designer request — ${project.orderId}`
        : `Designer remark — ${project.orderId}`,
    body: `${input.designerName}: ${trimmed.slice(0, 140)}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });

  if (input.kind === "request") {
    state.tasks.unshift({
      id: uid("tk"),
      title: `Client action needed — ${project.customerName}`,
      status: "todo",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_admin",
      projectId: project.id,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: "project",
      relatedId: project.id,
      notes: trimmed,
      createdAt: now,
    });
    if (!Array.isArray(state.inbox)) state.inbox = [];
    state.inbox.unshift({
      id: uid("inb"),
      kind: "message",
      status: "open",
      customerEmail: project.customerEmail.toLowerCase(),
      customerName: project.customerName,
      serviceId: project.serviceId || project.id,
      serviceTitle: `${project.categoryName} · ${project.packageName}`,
      body: `[Designer request · ${input.designerName}] ${trimmed}`,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveCrm(state);
  emitCrm(INBOX_EVENT);

  // Sync into customer My account portal
  try {
    const { designerMessageToCustomer } = require("@/lib/auth-storage") as typeof import("@/lib/auth-storage");
    designerMessageToCustomer({
      customerEmail: project.customerEmail,
      serviceId: project.serviceId,
      designerName: input.designerName,
      body: trimmed,
      kind: input.kind,
    });
  } catch {
    /* ignore if customer account missing */
  }

  return msg;
}

export function updateProjectMessageStatus(
  projectId: string,
  messageId: string,
  status: "open" | "fulfilled" | "closed",
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project || !Array.isArray(project.messages)) return state;
  const msg = project.messages.find((m) => m.id === messageId);
  if (!msg) return state;
  msg.status = status;
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function findOrCreateProjectForCustomer(input: {
  customerEmail: string;
  customerName: string;
  serviceId?: string;
  serviceTitle?: string;
}) {
  const state = loadCrm();
  const email = input.customerEmail.toLowerCase();
  let project =
    (input.serviceId &&
      state.orders.find((o) => o.serviceId === input.serviceId)) ||
    state.orders.find(
      (o) =>
        o.customerEmail === email &&
        o.status !== "completed" &&
        o.status !== "cancelled",
    ) ||
    state.orders.find((o) => o.customerEmail === email);

  if (!project) {
    const now = new Date().toISOString();
    project = {
      id: uid("or"),
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: input.serviceTitle || `Project — ${input.customerName}`,
      customerName: input.customerName,
      customerEmail: email,
      categoryName: input.serviceTitle?.split("·")[0]?.trim() || "Design",
      packageName: "Gold",
      amount: 499,
      status: "revisions",
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
      designerCount: 0,
      revisionLimit: 3,
      revisionsUsed: 0,
      revisions: [],
      messages: [],
      serviceId: input.serviceId,
      assignedDesignerIds: [],
    };
    state.orders.unshift(project);
    saveCrm(state);
  } else if (input.serviceId && !project.serviceId) {
    project.serviceId = input.serviceId;
    saveCrm(state);
  }
  return project;
}

export function addActivity(
  input: Omit<CrmActivity, "id" | "createdAt"> & { createdAt?: string },
) {
  const state = loadCrm();
  state.activities.unshift({
    ...input,
    id: uid("ac"),
    createdAt: input.createdAt || new Date().toISOString(),
  });
  saveCrm(state);
  return state;
}

export function upsertContact(
  input: Partial<CrmContact> & { name: string; email: string },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  const email = input.email.toLowerCase();
  if (input.id) {
    const i = state.contacts.findIndex((c) => c.id === input.id);
    if (i >= 0) {
      state.contacts[i] = {
        ...state.contacts[i],
        ...input,
        email,
        lastTouchAt: now,
      };
    }
  } else {
    const existing = state.contacts.findIndex(
      (c) => c.email.toLowerCase() === email,
    );
    if (existing >= 0) {
      state.contacts[existing] = {
        ...state.contacts[existing],
        ...input,
        id: state.contacts[existing].id,
        email,
        tags: Array.from(
          new Set([
            ...(state.contacts[existing].tags || []),
            ...(input.tags || []),
          ]),
        ),
        lastTouchAt: now,
      };
    } else {
      state.contacts.unshift({
        id: uid("ct"),
        name: input.name,
        email,
        phone: input.phone,
        title: input.title,
        companyId: input.companyId,
        ownerId: input.ownerId || "own_admin",
        tags: input.tags || [],
        createdAt: now,
        lastTouchAt: now,
      });
    }
  }
  saveCrm(state);
  return state;
}

export function upsertCompany(
  input: Partial<CrmCompany> & { name: string },
) {
  const state = loadCrm();
  if (input.id) {
    const i = state.companies.findIndex((c) => c.id === input.id);
    if (i >= 0) {
      state.companies[i] = { ...state.companies[i], ...input };
    }
  } else {
    state.companies.unshift({
      id: uid("co"),
      name: input.name,
      industry: input.industry || "General",
      website: input.website,
      size: input.size || "1-10",
      country: input.country || "United States",
      ownerId: input.ownerId || "own_admin",
      createdAt: new Date().toISOString(),
      notes: input.notes,
    });
  }
  saveCrm(state);
  return state;
}

export function upsertOrder(
  input: Partial<CrmOrder> & {
    customerName: string;
    customerEmail: string;
    categoryName: string;
    packageName: string;
    amount: number;
  },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  const email = input.customerEmail.toLowerCase();

  if (input.id) {
    const i = state.orders.findIndex((o) => o.id === input.id);
    if (i >= 0) {
      state.orders[i] = {
        ...state.orders[i],
        ...input,
        customerEmail: email,
        updatedAt: now,
      };
      saveCrm(state);
      return state;
    }
  }

  // Dedupe: same ORD code, service, or same email+package brief
  const existingIdx = state.orders.findIndex((o) => {
    if (input.orderId && o.orderId === input.orderId) return true;
    if (input.serviceId && o.serviceId === input.serviceId) return true;
    const sameCustomer = (o.customerEmail || "").toLowerCase() === email;
    const samePkg =
      (o.packageName || "").toLowerCase() ===
      (input.packageName || "").toLowerCase();
    const sameCat =
      (o.categoryName || "").toLowerCase() ===
      (input.categoryName || "").toLowerCase();
    if (!sameCustomer || !samePkg || !sameCat) return false;
    // Collapse recent open duplicates (client+server dual write)
    const age = Date.now() - Date.parse(o.createdAt || "") ;
    return !Number.isFinite(age) || age < 14 * 86400000;
  });

  if (existingIdx >= 0) {
    const prev = state.orders[existingIdx];
    state.orders[existingIdx] = {
      ...prev,
      ...input,
      id: prev.id,
      orderId: input.orderId || prev.orderId,
      customerEmail: email,
      customerName: input.customerName || prev.customerName,
      amount: input.amount || prev.amount,
      paymentStatus:
        input.paymentStatus === "paid" || prev.paymentStatus === "paid"
          ? "paid"
          : input.paymentStatus || prev.paymentStatus,
      serviceId: input.serviceId || prev.serviceId,
      updatedAt: now,
    };
    saveCrm(state);
    return state;
  }

  const orderId =
    input.orderId ||
    `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const order = {
    id: uid("or"),
    orderId,
    title: input.title || `${input.categoryName} — ${input.customerName}`,
    customerName: input.customerName,
    customerEmail: email,
    categoryName: input.categoryName,
    packageName: input.packageName,
    amount: input.amount,
    status: input.status || "in_progress",
    paymentStatus: input.paymentStatus || "paid",
    createdAt: now,
    updatedAt: now,
    designerCount: input.designerCount ?? 1,
    revisionLimit:
      input.revisionLimit ??
      (input.packageName.toLowerCase().includes("platinum") ? 5 : 3),
    revisionsUsed: input.revisionsUsed ?? 0,
    revisions: input.revisions ?? [],
    messages: input.messages ?? [],
    serviceId: input.serviceId,
    assignedDesignerIds: input.assignedDesignerIds ?? [],
  };
  state.orders.unshift(order);
  if (state.deleted?.orders) {
    state.deleted.orders = state.deleted.orders.filter(
      (x) => x !== order.id && x !== `ord:${order.orderId}`,
    );
  }
  const paid = order.paymentStatus === "paid";
  state.activities.unshift({
    id: uid("ac"),
    type: paid ? "payment" : "note",
    title: paid ? "New payment" : "New project",
    body: `${order.orderId} · ${order.customerName} · ${order.packageName} · $${order.amount}${paid ? " paid" : ` (${order.paymentStatus})`}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: order.id,
  });
  saveCrm(state);
  return state;
}

export function upsertDesignerNote(
  input: Partial<CrmDesignerNote> & { designerId: string },
) {
  const state = loadCrm();
  const i = state.designerNotes.findIndex(
    (n) => n.designerId === input.designerId,
  );
  const row: CrmDesignerNote = {
    designerId: input.designerId,
    status: input.status || "active",
    notes: input.notes || "",
    tags: input.tags || [],
    ownerId: input.ownerId || "own_admin",
    updatedAt: new Date().toISOString(),
  };
  if (i >= 0) state.designerNotes[i] = { ...state.designerNotes[i], ...row };
  else state.designerNotes.unshift(row);
  saveCrm(state);
  return state;
}

export function upsertDeal(
  input: Partial<CrmDeal> & { title: string; value: number },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  if (input.id) {
    const i = state.deals.findIndex((d) => d.id === input.id);
    if (i >= 0) {
      state.deals[i] = { ...state.deals[i], ...input, updatedAt: now };
      saveCrm(state);
      return state;
    }
  }

  const existingIdx = state.deals.findIndex((d) => {
    if (input.orderCode && d.orderCode === input.orderCode) return true;
    if (input.orderId && d.orderId === input.orderId) return true;
    if (input.leadId && d.leadId === input.leadId) return true;
    const sameTitle =
      (d.title || "").toLowerCase() === input.title.toLowerCase();
    const samePkg =
      !input.packageName ||
      !d.packageName ||
      d.packageName === input.packageName;
    return sameTitle && samePkg;
  });

  if (existingIdx >= 0) {
    const prev = state.deals[existingIdx];
    state.deals[existingIdx] = {
      ...prev,
      ...input,
      id: prev.id,
      probability: Math.max(prev.probability || 0, input.probability ?? 0),
      value: input.value || prev.value,
      updatedAt: now,
    };
    saveCrm(state);
    return state;
  }

  state.deals.unshift({
    id: uid("dl"),
    title: input.title,
    stage: input.stage || "lead",
    value: input.value,
    currency: input.currency || "USD",
    probability: input.probability ?? 20,
    contactId: input.contactId,
    companyId: input.companyId,
    leadId: input.leadId,
    orderId: input.orderId,
    orderCode: input.orderCode,
    ownerId: input.ownerId || "own_admin",
    category: input.category,
    packageName: input.packageName,
    closeDate: input.closeDate || isoDays(14),
    createdAt: now,
    updatedAt: now,
    notes: input.notes,
  });
  saveCrm(state);
  return state;
}

export function crmStats(state: CrmState) {
  const openDeals = state.deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost",
  );
  const pipeline = openDeals.reduce((s, d) => s + d.value, 0);
  const weighted = openDeals.reduce(
    (s, d) => s + (d.value * d.probability) / 100,
    0,
  );
  const won = state.deals.filter((d) => d.stage === "won");
  const wonValue = won.reduce((s, d) => s + d.value, 0);
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const overdueTasks = state.tasks.filter(
    (t) => t.status !== "done" && new Date(t.dueAt) < new Date(),
  ).length;
  const ordersRevenue = state.orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.amount, 0);

  return {
    pipeline,
    weighted: Math.round(weighted),
    wonValue,
    wonCount: won.length,
    openDeals: openDeals.length,
    newLeads,
    totalLeads: state.leads.length,
    contacts: state.contacts.length,
    companies: state.companies.length,
    overdueTasks,
    openTasks: state.tasks.filter((t) => t.status !== "done").length,
    ordersRevenue,
    ordersCount: state.orders.length,
    visitors: state.visitors?.length ?? 0,
    inboxOpen:
      state.inbox?.filter((i) => i.status === "open" || i.status === "in_progress")
        .length ?? 0,
  };
}

export function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function relativeDay(iso: string) {
  const diff = Math.round(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `In ${diff}d`;
  return `${Math.abs(diff)}d ago`;
}

export function onReviewsUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(REVIEW_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(REVIEW_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function listReviews(status?: ReviewStatus | "all") {
  const reviews = loadCrm().reviews || [];
  if (!status || status === "all") {
    return [...reviews].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }
  return reviews
    .filter((r) => r.status === status)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getApprovedReviewsForDesigner(designerId: string) {
  return listReviews("approved").filter((r) => r.designerId === designerId);
}

export function getReviewForService(serviceId: string) {
  return (loadCrm().reviews || []).find((r) => r.serviceId === serviceId);
}

export function submitProjectReview(input: {
  designerId: string;
  designerName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  projectId?: string;
  orderId?: string;
  serviceId?: string;
  categoryName?: string;
}): CrmReview | null {
  const rating = Math.round(input.rating);
  const body = input.body.trim();
  if (rating < 1 || rating > 5) return null;
  if (body.length < 12) return null;
  if (!input.designerId) return null;

  const state = loadCrm();
  if (!Array.isArray(state.reviews)) state.reviews = [];
  const email = input.customerEmail.toLowerCase();

  // One review per service/project
  const existing = state.reviews.find(
    (r) =>
      (input.serviceId && r.serviceId === input.serviceId) ||
      (input.projectId && r.projectId === input.projectId),
  );
  if (existing && existing.status !== "rejected") {
    return existing;
  }

  const now = new Date().toISOString();
  const review: CrmReview = {
    id: uid("rv"),
    projectId: input.projectId,
    orderId: input.orderId,
    serviceId: input.serviceId,
    designerId: input.designerId,
    designerName: input.designerName,
    customerName: input.customerName,
    customerEmail: email,
    rating,
    body,
    categoryName: input.categoryName,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  if (existing) {
    const i = state.reviews.findIndex((r) => r.id === existing.id);
    const updated = {
      ...review,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    state.reviews[i] = updated;
  } else {
    state.reviews.unshift(review);
  }

  if (input.projectId) {
    const project = state.orders.find((o) => o.id === input.projectId);
    if (project) {
      project.status = "completed";
      project.updatedAt = now;
    }
  } else if (input.serviceId) {
    const project = state.orders.find((o) => o.serviceId === input.serviceId);
    if (project) {
      project.status = "completed";
      project.updatedAt = now;
    }
  }

  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Customer review submitted",
    body: `${input.customerName} rated ${input.designerName} ${rating}/5 — awaiting admin approval`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: input.projectId,
  });

  const saved =
    state.reviews.find(
      (r) =>
        (input.serviceId && r.serviceId === input.serviceId) ||
        (input.projectId && r.projectId === input.projectId),
    ) || state.reviews[0];

  saveCrm(state);
  emitCrm(REVIEW_EVENT, saved);
  emitCrm(INBOX_EVENT);
  return saved;
}

export function setReviewStatus(
  reviewId: string,
  status: ReviewStatus,
  adminNote?: string,
) {
  const state = loadCrm();
  if (!Array.isArray(state.reviews)) state.reviews = [];
  const review = state.reviews.find((r) => r.id === reviewId);
  if (!review) return state;
  const now = new Date().toISOString();
  review.status = status;
  review.updatedAt = now;
  review.reviewedAt = now;
  if (adminNote !== undefined) review.adminNote = adminNote.trim() || undefined;

  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: status === "approved" ? "Review approved" : "Review rejected",
    body: `${review.customerName} → ${review.designerName} (${review.rating}/5)`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: review.projectId,
  });

  saveCrm(state);
  emitCrm(REVIEW_EVENT, review);
  emitCrm(INBOX_EVENT);
  return state;
}

export function designerPublicRating(designerId: string, fallback: {
  rating: number;
  reviews: number;
}) {
  const approved = getApprovedReviewsForDesigner(designerId);
  if (!approved.length) return fallback;
  const sum = approved.reduce((s, r) => s + r.rating, 0);
  const avg =
    (fallback.rating * fallback.reviews + sum) /
    (fallback.reviews + approved.length);
  return {
    rating: Math.round(avg * 100) / 100,
    reviews: fallback.reviews + approved.length,
  };
}
