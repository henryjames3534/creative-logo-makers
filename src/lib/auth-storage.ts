import { conceptImages } from "@/data/media";

export type ServiceStatus =
  | "brief_submitted"
  | "designs_incoming"
  | "selecting"
  | "revisions"
  | "completed";

export type ServiceUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  kind: "status" | "design" | "message" | "milestone" | "revision" | "admin";
  from?: "admin" | "designer" | "system" | "you";
};

export type ProgressStep = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  active: boolean;
  at?: string;
};

export type ServiceConcept = {
  id: string;
  designerName: string;
  title: string;
  image: string;
  createdAt: string;
  liked?: boolean;
  selected?: boolean;
};

export type ServiceRevision = {
  id: string;
  note: string;
  status: "pending" | "in_progress" | "delivered" | "closed";
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
};

export type ServiceMessage = {
  id: string;
  from: "admin" | "designer" | "you";
  author: string;
  body: string;
  createdAt: string;
};

export type UserService = {
  id: string;
  orderId: string;
  categorySlug: string;
  categoryName: string;
  packageName: string;
  packagePrice: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  status: ServiceStatus;
  progress: number;
  steps: ProgressStep[];
  designerCount: number;
  conceptCount: number;
  revisionLimit: number;
  revisionsUsed: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  concepts: ServiceConcept[];
  revisions: ServiceRevision[];
  messages: ServiceMessage[];
  updates: ServiceUpdate[];
  /** Direct-hire designer (when known) */
  designerId?: string;
  designerName?: string;
  designerHandle?: string;
  /** Linked CRM review after project completion */
  reviewId?: string;
  reviewStatus?: "pending" | "approved" | "rejected";
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  services: UserService[];
  picture?: string;
  provider?: "email" | "google";
};

export type SessionUser = Omit<AuthUser, "passwordHash">;

const USERS_KEY = "clm_users_v2";
const USERS_KEY_LEGACY = "clm_users_v1";
const USERS_UPDATED_KEY = "clm_users_updated_at";
const SESSION_KEY = "clm_session_v1";
const PENDING_BRIEF_KEY = "clm_pending_brief_v1";
const GOOGLE_ACCOUNTS_KEY = "clm_google_accounts_v1";
export const USERS_HYDRATED_EVENT = "clm_users_hydrated";

export type RememberedGoogleAccount = {
  email: string;
  name: string;
  picture?: string;
  lastUsedAt: string;
};

export type PendingBrief = {
  categorySlug: string;
  categoryName: string;
  packageName: string;
  packagePrice: string;
  /** Direct 1-to-1 hire from designer profile */
  designerId?: string;
  designerName?: string;
  designerHandle?: string;
  hireMode?: "contest" | "direct";
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function parsePrice(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function hashPassword(
  password: string,
  pepper: "clm" | "legacy" = "clm",
): Promise<string> {
  const prefix = pepper === "legacy" ? "clm-legacy" : "clm";
  // Keep verifying legacy hashes that used the old internal pepper.
  const material =
    pepper === "legacy"
      ? `${String.fromCharCode(57, 57, 100)}:${password}`
      : `${prefix}:${password}`;
  const data = new TextEncoder().encode(material);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function passwordsMatch(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if ((await hashPassword(password, "clm")) === passwordHash) return true;
  if ((await hashPassword(password, "legacy")) === passwordHash) return true;
  return false;
}

function defaultSteps(status: ServiceStatus, createdAt: string): ProgressStep[] {
  const order: ServiceStatus[] = [
    "brief_submitted",
    "designs_incoming",
    "selecting",
    "revisions",
    "completed",
  ];
  const idx = Math.max(0, order.indexOf(status));
  const labels = [
    {
      id: "brief",
      label: "Brief submitted",
      description: "Your brief is live for designers",
    },
    {
      id: "concepts",
      label: "Concepts arriving",
      description: "Designers upload directions for review",
    },
    {
      id: "select",
      label: "Select a winner",
      description: "Shortlist and pick a final concept",
    },
    {
      id: "revisions",
      label: "Revisions",
      description: "Request polish from the winning designer",
    },
    {
      id: "files",
      label: "Files & handover",
      description: "Source files and copyright transfer",
    },
  ];
  return labels.map((l, i) => ({
    ...l,
    done: i < idx || status === "completed",
    active: status === "completed" ? i === labels.length - 1 : i === idx,
    at: i <= idx ? createdAt : undefined,
  }));
}

function progressForStatus(status: ServiceStatus): number {
  switch (status) {
    case "brief_submitted":
      return 18;
    case "designs_incoming":
      return 42;
    case "selecting":
      return 62;
    case "revisions":
      return 82;
    case "completed":
      return 100;
    default:
      return 10;
  }
}

function normalizeService(raw: Partial<UserService> & {
  categorySlug: string;
  categoryName: string;
  packageName: string;
  packagePrice: string;
  status: ServiceStatus;
  createdAt: string;
  updates?: ServiceUpdate[];
  id?: string;
}): UserService {
  const createdAt = raw.createdAt;
  const status = raw.status;
  const amount =
    raw.amountPaid ??
    parsePrice(raw.packagePrice);
  return {
    id: raw.id ?? uid("svc"),
    orderId: raw.orderId ?? `ORD-${(raw.id ?? "X").slice(-6).toUpperCase()}`,
    categorySlug: raw.categorySlug,
    categoryName: raw.categoryName,
    packageName: raw.packageName,
    packagePrice: raw.packagePrice,
    amountPaid: amount,
    currency: raw.currency ?? "USD",
    paymentMethod: raw.paymentMethod ?? "Card",
    paymentStatus: raw.paymentStatus ?? "paid",
    status,
    progress: raw.progress ?? progressForStatus(status),
    steps: raw.steps?.length ? raw.steps : defaultSteps(status, createdAt),
    designerCount: raw.designerCount ?? 0,
    conceptCount: raw.conceptCount ?? raw.concepts?.length ?? 0,
    revisionLimit: raw.revisionLimit ?? 3,
    revisionsUsed: raw.revisionsUsed ?? raw.revisions?.length ?? 0,
    deadline: raw.deadline ?? daysFromNow(7),
    createdAt,
    updatedAt: raw.updatedAt ?? createdAt,
    concepts: raw.concepts ?? [],
    revisions: raw.revisions ?? [],
    messages: raw.messages ?? [],
    updates: raw.updates ?? [],
    designerId: raw.designerId,
    designerName: raw.designerName,
    designerHandle: raw.designerHandle,
    reviewId: raw.reviewId,
    reviewStatus: raw.reviewStatus,
  };
}

function migrateLegacyUsers(): AuthUser[] {
  try {
    const legacy = localStorage.getItem(USERS_KEY_LEGACY);
    if (!legacy) return [];
    const parsed = JSON.parse(legacy) as AuthUser[];
    return parsed.map((u) => ({
      ...u,
      services: (u.services || []).map((s) =>
        normalizeService(s as UserService),
      ),
    }));
  } catch {
    return [];
  }
}

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser[];
      return parsed.map((u) => ({
        ...u,
        services: (u.services || []).map((s) => normalizeService(s)),
      }));
    }
    const migrated = migrateLegacyUsers();
    if (migrated.length) {
      writeUsers(migrated);
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

function writeUsers(users: AuthUser[]) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(USERS_UPDATED_KEY, updatedAt);
  void import("@/lib/db-sync").then(({ scheduleStorePush }) => {
    scheduleStorePush("users", users);
  });
}

/** Sync accounts + customer projects/revisions from Postgres. */
export async function hydrateUsersFromServer(): Promise<AuthUser[]> {
  if (typeof window === "undefined") return [];
  const { hydrateStoreKey } = await import("@/lib/db-sync");
  await hydrateStoreKey({
    key: "users",
    localRaw: localStorage.getItem(USERS_KEY),
    localUpdatedAt: localStorage.getItem(USERS_UPDATED_KEY),
    writeLocal: (raw, updatedAt) => {
      localStorage.setItem(USERS_KEY, raw);
      localStorage.setItem(USERS_UPDATED_KEY, updatedAt);
    },
  });
  const users = readUsers();
  try {
    window.dispatchEvent(
      new CustomEvent(USERS_HYDRATED_EVENT, { detail: users }),
    );
  } catch {
    /* ignore */
  }
  return users;
}

function toSession(user: AuthUser): SessionUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionEmail(email: string | null) {
  if (email) localStorage.setItem(SESSION_KEY, email.toLowerCase());
  else localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): SessionUser | null {
  const email = getSessionEmail();
  if (!email) return null;
  const user = readUsers().find((u) => u.email === email);
  return user ? toSession(user) : null;
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2) return { ok: false, error: "Enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid email." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const user: AuthUser = {
    id: uid("usr"),
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    services: [],
  };

  users.push(user);
  writeUsers(users);
  setSessionEmail(email);
  return { ok: true, user: toSession(user) };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return { ok: false, error: "No account found with this email." };

  if (!(await passwordsMatch(input.password, user.passwordHash))) {
    return { ok: false, error: "Incorrect password." };
  }

  setSessionEmail(email);
  return { ok: true, user: toSession(user) };
}

export function signOut() {
  setSessionEmail(null);
}

export async function signInWithGoogle(profile: {
  name: string;
  email: string;
  picture?: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const email = profile.email.trim().toLowerCase();
  const name = profile.name.trim() || email.split("@")[0];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid Google account email." };
  }

  const users = readUsers();
  const existing = users.find((u) => u.email === email);

  if (existing) {
    existing.name = name || existing.name;
    existing.picture = profile.picture ?? existing.picture;
    existing.provider = "google";
    writeUsers(users);
    setSessionEmail(email);
    rememberGoogleAccount({
      email,
      name: existing.name,
      picture: existing.picture,
    });
    return { ok: true, user: toSession(existing) };
  }

  const user: AuthUser = {
    id: uid("usr"),
    name,
    email,
    passwordHash: await hashPassword(`google:${email}:${uid("g")}`),
    createdAt: new Date().toISOString(),
    services: [],
    picture: profile.picture,
    provider: "google",
  };
  users.push(user);
  writeUsers(users);
  setSessionEmail(email);
  rememberGoogleAccount({
    email,
    name,
    picture: profile.picture,
  });
  return { ok: true, user: toSession(user) };
}

export function rememberGoogleAccount(account: {
  email: string;
  name: string;
  picture?: string;
}) {
  if (typeof window === "undefined") return;
  const email = account.email.trim().toLowerCase();
  const list = listRememberedGoogleAccounts().filter((a) => a.email !== email);
  list.unshift({
    email,
    name: account.name,
    picture: account.picture,
    lastUsedAt: new Date().toISOString(),
  });
  localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(list.slice(0, 6)));
}

export function listRememberedGoogleAccounts(): RememberedGoogleAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
    const remembered = raw
      ? (JSON.parse(raw) as RememberedGoogleAccount[])
      : [];
    const fromUsers = readUsers()
      .filter((u) => u.provider === "google" || u.email.includes("@gmail"))
      .map((u) => ({
        email: u.email,
        name: u.name,
        picture: u.picture,
        lastUsedAt: u.createdAt,
      }));
    const map = new Map<string, RememberedGoogleAccount>();
    for (const a of [...remembered, ...fromUsers]) {
      if (!map.has(a.email)) map.set(a.email, a);
    }
    return Array.from(map.values()).slice(0, 6);
  } catch {
    return [];
  }
}

function mutateUser(
  email: string,
  fn: (user: AuthUser) => AuthUser,
): SessionUser | null {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx < 0) return null;
  users[idx] = fn(users[idx]);
  writeUsers(users);
  return toSession(users[idx]);
}

const CONCEPT_IMAGES = [...conceptImages];

function buildServiceFromBrief(brief: PendingBrief): UserService {
  const now = new Date().toISOString();
  const id = uid("svc");
  const amount = parsePrice(brief.packagePrice);
  const isDirect = brief.hireMode === "direct" && Boolean(brief.designerId);
  return normalizeService({
    id,
    orderId: `ORD-${id.slice(-8).toUpperCase()}`,
    categorySlug: brief.categorySlug,
    categoryName: brief.categoryName,
    packageName: brief.packageName,
    packagePrice: brief.packagePrice,
    amountPaid: amount,
    paymentMethod: "Card · ··4242",
    paymentStatus: "paid",
    status: isDirect ? "designs_incoming" : "brief_submitted",
    progress: isDirect ? 35 : 18,
    designerCount: isDirect ? 1 : 0,
    conceptCount: 0,
    revisionLimit: brief.packageName.toLowerCase().includes("platinum")
      ? 5
      : brief.packageName.toLowerCase().includes("gold")
        ? 4
        : 3,
    deadline: daysFromNow(7),
    createdAt: now,
    updatedAt: now,
    designerId: brief.designerId,
    designerName: brief.designerName,
    designerHandle: brief.designerHandle,
    messages: [
      {
        id: uid("msg"),
        from: "admin",
        author: "Creative Logo Makers Support",
        body: isDirect
          ? `Payment confirmed. ${brief.designerName || "Your designer"} is assigned to this 1-to-1 project.`
          : `Welcome! Your ${brief.categoryName} contest is live. We'll notify you as designers join and upload concepts.`,
        createdAt: now,
      },
    ],
    updates: [
      {
        id: uid("upd"),
        kind: "milestone",
        from: "system",
        title: "Payment confirmed",
        body: `${brief.packagePrice} charged for ${brief.packageName}. Order created.`,
        createdAt: now,
      },
      {
        id: uid("upd"),
        kind: "milestone",
        from: "admin",
        title: isDirect ? "Designer hired" : "Brief submitted",
        body: isDirect
          ? `${brief.designerName} (@${brief.designerHandle}) assigned after payment. Project details are in their designer portal.`
          : `Your ${brief.categoryName} contest (${brief.packageName}) is live. Designers are reviewing your brief.`,
        createdAt: now,
      },
      {
        id: uid("upd"),
        kind: "status",
        from: "system",
        title: isDirect ? "1-to-1 project opened" : "Contest opened",
        body: isDirect
          ? "Private project is live. Revisions and messages will sync with your hired designer."
          : "Your contest is open. Concepts typically start arriving within a few hours.",
        createdAt: now,
      },
    ],
  });
}

export function addServiceFromBrief(
  email: string,
  brief: PendingBrief,
): SessionUser | null {
  const service = buildServiceFromBrief(brief);
  const next = mutateUser(email, (user) => ({
    ...user,
    services: [service, ...user.services],
  }));
  // After payment: CRM order + auto-assign hired designer
  if (typeof window !== "undefined") {
    try {
      const { fulfillDirectHireAfterPayment } = require("@/lib/hire-fulfillment") as typeof import("@/lib/hire-fulfillment");
      const user = next;
      fulfillDirectHireAfterPayment({
        customerEmail: email,
        customerName: user?.name || email.split("@")[0],
        brief,
        serviceId: service.id,
        orderId: service.orderId,
        amount: service.amountPaid,
      });
    } catch {
      /* ignore CRM sync errors */
    }
  }
  return next;
}

/** Seed a realistic in-progress contest so the dashboard isn't empty */
export function seedDemoContest(email: string): SessionUser | null {
  const now = new Date().toISOString();
  const earlier = new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString();
  const mid = new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString();
  const id = uid("svc");

  const concepts: ServiceConcept[] = [
    {
      id: uid("con"),
      designerName: "Mira K.",
      title: "Wordmark — Minimal",
      image: CONCEPT_IMAGES[0],
      createdAt: mid,
      liked: true,
    },
    {
      id: uid("con"),
      designerName: "Jonas V.",
      title: "Emblem — Bold",
      image: CONCEPT_IMAGES[1],
      createdAt: mid,
    },
    {
      id: uid("con"),
      designerName: "Elena P.",
      title: "Icon + type lockup",
      image: CONCEPT_IMAGES[2],
      createdAt: now,
    },
  ];

  const service = normalizeService({
    id,
    orderId: `ORD-${id.slice(-8).toUpperCase()}`,
    categorySlug: "logo-design",
    categoryName: "Logo design",
    packageName: "Gold",
    packagePrice: "$799",
    amountPaid: 799,
    paymentMethod: "Card · ··4242",
    paymentStatus: "paid",
    status: "designs_incoming",
    progress: 48,
    designerCount: 14,
    conceptCount: 3,
    revisionLimit: 4,
    revisionsUsed: 0,
    deadline: daysFromNow(5),
    createdAt: earlier,
    updatedAt: now,
    concepts,
    revisions: [],
    messages: [
      {
        id: uid("msg"),
        from: "admin",
        author: "Contest Manager · Alex",
        body: "Your Gold contest is performing well — 14 designers have joined. Review concepts and leave feedback to guide the pack.",
        createdAt: mid,
      },
      {
        id: uid("msg"),
        from: "designer",
        author: "Mira K.",
        body: "Happy to refine the wordmark — do you prefer sharper corners or a softer geometric feel?",
        createdAt: now,
      },
    ],
    updates: [
      {
        id: uid("upd"),
        kind: "milestone",
        from: "system",
        title: "Payment confirmed",
        body: "$799 charged for Gold package. Order ORD live.",
        createdAt: earlier,
      },
      {
        id: uid("upd"),
        kind: "admin",
        from: "admin",
        title: "Contest manager assigned",
        body: "Alex is monitoring participation and will nudge designers if entries slow.",
        createdAt: earlier,
      },
      {
        id: uid("upd"),
        kind: "design",
        from: "designer",
        title: "3 concepts uploaded",
        body: "New logo directions are ready for review. Like favorites and request changes.",
        createdAt: mid,
      },
      {
        id: uid("upd"),
        kind: "message",
        from: "designer",
        title: "Designer question",
        body: "Mira K. asked about corner sharpness on the wordmark.",
        createdAt: now,
      },
    ],
  });

  return mutateUser(email, (user) => ({
    ...user,
    services: [service, ...user.services],
  }));
}

/** Simulate admin / designer progress on the active contest */
export function refreshServiceUpdates(email: string): SessionUser | null {
  return mutateUser(email, (user) => {
    if (user.services.length === 0) return user;

    const services = user.services.map((svc, i) => {
      if (i > 0) return svc;
      if (svc.status === "completed") return svc;

      const now = new Date().toISOString();
      let next = { ...svc };
      const updates = [...svc.updates];
      const concepts = [...svc.concepts];
      const messages = [...svc.messages];

      if (svc.status === "brief_submitted" || svc.concepts.length < 2) {
        const add = CONCEPT_IMAGES.slice(0, 2).map((img, idx) => ({
          id: uid("con"),
          designerName: idx === 0 ? "Kai T." : "Nora S.",
          title: idx === 0 ? "Concept A — Geometric" : "Concept B — Soft serif",
          image: img,
          createdAt: now,
        }));
        concepts.push(...add);
        updates.unshift({
          id: uid("upd"),
          kind: "design",
          from: "admin",
          title: `${add.length} new concepts from designers`,
          body: "Admin note: participation looks healthy. Review and like the directions you prefer.",
          createdAt: now,
        });
        messages.unshift({
          id: uid("msg"),
          from: "admin",
          author: "Contest Manager · Alex",
          body: "We've pushed a reminder to Mid & Top Level designers. Fresh concepts just landed — take a look.",
          createdAt: now,
        });
        next = {
          ...next,
          status: "designs_incoming",
          progress: Math.max(next.progress, 45),
          designerCount: Math.max(next.designerCount, 11),
          conceptCount: concepts.length,
          concepts,
          messages,
          updates,
          steps: defaultSteps("designs_incoming", svc.createdAt),
          updatedAt: now,
        };
      } else if (svc.status === "designs_incoming") {
        updates.unshift({
          id: uid("upd"),
          kind: "admin",
          from: "admin",
          title: "Progress checkpoint",
          body: "Admin: You're in the concept phase (~50%). Shortlist 2–3 favorites, then move to winner selection.",
          createdAt: now,
        });
        next = {
          ...next,
          progress: Math.min(58, next.progress + 8),
          updates,
          updatedAt: now,
        };
      } else if (svc.status === "selecting" || svc.status === "revisions") {
        updates.unshift({
          id: uid("upd"),
          kind: "admin",
          from: "admin",
          title: "Revision window open",
          body: "Send clear revision notes — designers typically turn around updates within 24–48 hours.",
          createdAt: now,
        });
        next = {
          ...next,
          updates,
          progress: Math.max(next.progress, svc.status === "revisions" ? 85 : 68),
          updatedAt: now,
        };
      }

      return next;
    });

    return { ...user, services };
  });
}

export function requestRevision(
  email: string,
  serviceId: string,
  note: string,
): SessionUser | null {
  const trimmed = note.trim();
  if (trimmed.length < 8) return getCurrentUser();

  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      if (svc.revisionsUsed >= svc.revisionLimit) return svc;
      const now = new Date().toISOString();
      const revision: ServiceRevision = {
        id: uid("rev"),
        note: trimmed,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...svc,
        status: "revisions" as ServiceStatus,
        progress: Math.max(svc.progress, 78),
        steps: defaultSteps("revisions", svc.createdAt),
        revisionsUsed: svc.revisionsUsed + 1,
        revisions: [revision, ...svc.revisions],
        updates: [
          {
            id: uid("upd"),
            kind: "revision" as const,
            from: "you" as const,
            title: "Revision requested",
            body: trimmed,
            createdAt: now,
          },
          ...svc.updates,
        ],
        messages: [
          {
            id: uid("msg"),
            from: "you" as const,
            author: "You",
            body: `Revision request: ${trimmed}`,
            createdAt: now,
          },
          ...svc.messages,
        ],
        updatedAt: now,
      };
    });
    return { ...user, services };
  });
}

export function sendServiceMessage(
  email: string,
  serviceId: string,
  body: string,
): SessionUser | null {
  const trimmed = body.trim();
  if (trimmed.length < 2) return getCurrentUser();
  const now = new Date().toISOString();

  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      return {
        ...svc,
        messages: [
          {
            id: uid("msg"),
            from: "you" as const,
            author: "You",
            body: trimmed,
            createdAt: now,
          },
          ...svc.messages,
        ],
        updates: [
          {
            id: uid("upd"),
            kind: "message" as const,
            from: "you" as const,
            title: "You sent a message",
            body: trimmed,
            createdAt: now,
          },
          ...svc.updates,
        ],
        updatedAt: now,
      };
    });
    return { ...user, services };
  });
}

/** Admin CRM reply → appears in customer portal messages */
export function adminReplyToCustomer(
  customerEmail: string,
  serviceId: string,
  body: string,
): SessionUser | null {
  const trimmed = body.trim();
  if (trimmed.length < 1) return null;
  const now = new Date().toISOString();
  const email = customerEmail.trim().toLowerCase();

  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      return {
        ...svc,
        messages: [
          {
            id: uid("msg"),
            from: "admin" as const,
            author: "Creative Logo Makers Support",
            body: trimmed,
            createdAt: now,
          },
          ...svc.messages,
        ],
        updates: [
          {
            id: uid("upd"),
            kind: "admin" as const,
            from: "admin" as const,
            title: "Support replied",
            body: trimmed,
            createdAt: now,
          },
          ...svc.updates,
        ],
        updatedAt: now,
      };
    });
    return { ...user, services };
  });
}

/** Designer portal remark / client request → customer My account */
export function designerMessageToCustomer(input: {
  customerEmail: string;
  serviceId?: string;
  designerName: string;
  body: string;
  kind: "remark" | "request";
}): SessionUser | null {
  const trimmed = input.body.trim();
  if (trimmed.length < 2) return null;
  const email = input.customerEmail.trim().toLowerCase();
  const now = new Date().toISOString();
  const isRequest = input.kind === "request";
  const displayBody = isRequest ? `Action needed: ${trimmed}` : trimmed;

  return mutateUser(email, (user) => {
    let targetId = input.serviceId;
    if (!targetId || !user.services.some((s) => s.id === targetId)) {
      targetId = user.services[0]?.id;
    }
    if (!targetId) return user;

    return {
      ...user,
      services: user.services.map((svc) => {
        if (svc.id !== targetId) return svc;
        return {
          ...svc,
          messages: [
            {
              id: uid("msg"),
              from: "designer" as const,
              author: input.designerName,
              body: displayBody,
              createdAt: now,
            },
            ...svc.messages,
          ],
          updates: [
            {
              id: uid("upd"),
              kind: "message" as const,
              from: "designer" as const,
              title: isRequest
                ? "Designer needs something from you"
                : `Note from ${input.designerName}`,
              body: trimmed,
              createdAt: now,
            },
            ...svc.updates,
          ],
          updatedAt: now,
        };
      }),
    };
  });
}

export function toggleConceptLike(
  email: string,
  serviceId: string,
  conceptId: string,
): SessionUser | null {
  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      return {
        ...svc,
        concepts: svc.concepts.map((c) =>
          c.id === conceptId ? { ...c, liked: !c.liked } : c,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    return { ...user, services };
  });
}

export function selectWinningConcept(
  email: string,
  serviceId: string,
  conceptId: string,
): SessionUser | null {
  const now = new Date().toISOString();
  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      const winner = svc.concepts.find((c) => c.id === conceptId);
      return {
        ...svc,
        status: "revisions" as ServiceStatus,
        progress: 80,
        steps: defaultSteps("revisions", svc.createdAt),
        concepts: svc.concepts.map((c) => ({
          ...c,
          selected: c.id === conceptId,
        })),
        updates: [
          {
            id: uid("upd"),
            kind: "milestone" as const,
            from: "you" as const,
            title: "Winner selected",
            body: winner
              ? `You selected “${winner.title}” by ${winner.designerName}. Revision rounds are now open.`
              : "Winner selected. Revision rounds are open.",
            createdAt: now,
          },
          {
            id: uid("upd"),
            kind: "admin" as const,
            from: "admin" as const,
            title: "Admin: handover prep",
            body: "We'll prepare source-file checklist once revisions are approved.",
            createdAt: now,
          },
          ...svc.updates,
        ],
        messages: [
          {
            id: uid("msg"),
            from: "admin" as const,
            author: "Contest Manager · Alex",
            body: "Great pick. Send revision notes anytime — you have remaining rounds on this package.",
            createdAt: now,
          },
          ...svc.messages,
        ],
        updatedAt: now,
      };
    });
    return { ...user, services };
  });
}

/** Mark service completed only after a review was submitted (admin must still approve for public listing). */
export function markServiceCompleted(
  email: string,
  serviceId: string,
  review: {
    reviewId: string;
    reviewStatus: "pending" | "approved" | "rejected";
    designerId?: string;
    designerName?: string;
  },
): SessionUser | null {
  return mutateUser(email, (user) => {
    const services = user.services.map((svc) => {
      if (svc.id !== serviceId) return svc;
      const now = new Date().toISOString();
      return {
        ...svc,
        status: "completed" as ServiceStatus,
        progress: 100,
        steps: defaultSteps("completed", svc.createdAt),
        reviewId: review.reviewId,
        reviewStatus: review.reviewStatus,
        designerId: review.designerId || svc.designerId,
        designerName: review.designerName || svc.designerName,
        updatedAt: now,
        updates: [
          {
            id: uid("upd"),
            kind: "milestone" as const,
            from: "you" as const,
            title: "Project completed — review submitted",
            body: "Thanks! Your rating is pending admin approval before it appears on the designer’s public profile.",
            createdAt: now,
          },
          ...svc.updates,
        ],
      };
    });
    return { ...user, services };
  });
}

export function savePendingBrief(brief: PendingBrief) {
  sessionStorage.setItem(PENDING_BRIEF_KEY, JSON.stringify(brief));
}

export function takePendingBrief(): PendingBrief | null {
  try {
    const raw = sessionStorage.getItem(PENDING_BRIEF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_BRIEF_KEY);
    return JSON.parse(raw) as PendingBrief;
  } catch {
    return null;
  }
}

export const statusLabel: Record<ServiceStatus, string> = {
  brief_submitted: "Brief submitted",
  designs_incoming: "Designs coming in",
  selecting: "Selecting a winner",
  revisions: "Revisions in progress",
  completed: "Completed",
};

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}
