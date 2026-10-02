/**
 * Client helpers: sync browser stores ↔ Postgres via Next.js /api/store.
 */
export type StoreKey = "crm" | "users" | "chat" | "brand" | "geo-block";

export type StoreDocument<T = unknown> = {
  ok: boolean;
  id?: string;
  payload: T | null;
  updatedAt: string | null;
  error?: string;
};

const timers: Partial<Record<StoreKey, ReturnType<typeof setTimeout>>> = {};
const pending: Partial<Record<StoreKey, unknown>> = {};

export async function fetchStoreDocument<T = unknown>(
  key: StoreKey,
): Promise<StoreDocument<T>> {
  try {
    const res = await fetch(`/api/store/${key}`, { cache: "no-store" });
    const data = (await res.json()) as StoreDocument<T>;
    return data;
  } catch (e) {
    return {
      ok: false,
      payload: null,
      updatedAt: null,
      error: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

export async function putStoreDocument<T = unknown>(
  key: StoreKey,
  payload: T,
  updatedAt?: string,
): Promise<StoreDocument<T>> {
  const ts = updatedAt || new Date().toISOString();
  try {
    const res = await fetch(`/api/store/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, updatedAt: ts }),
    });
    return (await res.json()) as StoreDocument<T>;
  } catch (e) {
    return {
      ok: false,
      payload: null,
      updatedAt: null,
      error: e instanceof Error ? e.message : "put failed",
    };
  }
}

/** Debounced push so rapid CRM edits don't spam the bridge. */
export function scheduleStorePush(key: StoreKey, payload: unknown, ms = 600) {
  if (typeof window === "undefined") return;
  pending[key] = payload;
  if (timers[key]) clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    const body = pending[key];
    delete pending[key];
    delete timers[key];
    if (body === undefined) return;
    void putStoreDocument(key, body);
  }, ms);
}

export function flushStorePush(key: StoreKey) {
  if (timers[key]) {
    clearTimeout(timers[key]);
    delete timers[key];
  }
  const body = pending[key];
  delete pending[key];
  if (body === undefined) return Promise.resolve(null);
  return putStoreDocument(key, body);
}

function ts(value: string | null | undefined) {
  if (!value) return 0;
  const n = Date.parse(value);
  return Number.isFinite(n) ? n : 0;
}

function countCrmRows(payload: unknown) {
  if (!payload || typeof payload !== "object") return 0;
  const p = payload as Record<string, unknown>;
  let n = 0;
  for (const key of [
    "leads",
    "visitors",
    "orders",
    "contacts",
    "activities",
    "deals",
  ]) {
    if (Array.isArray(p[key])) n += (p[key] as unknown[]).length;
  }
  return n;
}

/**
 * Pull server doc into localStorage when newer; otherwise push local up.
 * Never push an empty/thin local CRM over a richer server document.
 * CRM: always merge local↔remote so pipeline stage moves aren't wiped.
 */
export async function hydrateStoreKey(opts: {
  key: StoreKey;
  localRaw: string | null;
  localUpdatedAt: string | null;
  writeLocal: (raw: string, updatedAt: string) => void;
}): Promise<"server" | "pushed" | "same" | "empty" | "error"> {
  const remote = await fetchStoreDocument(opts.key);
  if (!remote.ok) return "error";

  const remoteAt = ts(remote.updatedAt);
  const localAt = ts(opts.localUpdatedAt);
  const hasRemote = remote.payload != null;
  const hasLocal = Boolean(opts.localRaw);

  let localPayload: unknown = null;
  if (hasLocal) {
    try {
      localPayload = JSON.parse(opts.localRaw!);
    } catch {
      localPayload = null;
    }
  }

  // CRM: merge both sides so drag-stage / local edits survive poll hydrate.
  if (opts.key === "crm" && hasRemote && localPayload) {
    const { mergeCrmDocuments } = await import("@/lib/merge-store");
    const merged = mergeCrmDocuments(remote.payload, localPayload);
    const mergedAt =
      localAt > remoteAt
        ? opts.localUpdatedAt || new Date().toISOString()
        : remote.updatedAt || new Date().toISOString();
    opts.writeLocal(JSON.stringify(merged), mergedAt);
    // If local had newer edits, push merged back so other browsers see stages.
    if (localAt > remoteAt) {
      try {
        await putStoreDocument("crm", merged, mergedAt);
        return "pushed";
      } catch {
        return "server";
      }
    }
    return "server";
  }

  // Prefer server whenever it has more CRM rows (guards against stale local wipe).
  if (
    opts.key === "crm" &&
    hasRemote &&
    countCrmRows(remote.payload) > countCrmRows(localPayload)
  ) {
    const raw = JSON.stringify(remote.payload);
    opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
    return "server";
  }

  // Prefer server when it has more leads (form submissions must not be wiped
  // by an older localStorage that still carries email delete-tombstones).
  if (opts.key === "crm" && hasRemote && hasLocal && localPayload) {
    const remoteLeads = Array.isArray(
      (remote.payload as { leads?: unknown[] } | null)?.leads,
    )
      ? ((remote.payload as { leads: unknown[] }).leads?.length ?? 0)
      : 0;
    const localLeads = Array.isArray(
      (localPayload as { leads?: unknown[] }).leads,
    )
      ? ((localPayload as { leads: unknown[] }).leads?.length ?? 0)
      : 0;
    if (remoteLeads > localLeads) {
      const raw = JSON.stringify(remote.payload);
      opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
      return "server";
    }
    const remoteVisitors = Array.isArray(
      (remote.payload as { visitors?: unknown[] } | null)?.visitors,
    )
      ? ((remote.payload as { visitors: unknown[] }).visitors?.length ?? 0)
      : 0;
    const localVisitors = Array.isArray(
      (localPayload as { visitors?: unknown[] }).visitors,
    )
      ? ((localPayload as { visitors: unknown[] }).visitors?.length ?? 0)
      : 0;
    if (remoteVisitors > localVisitors) {
      const raw = JSON.stringify(remote.payload);
      opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
      return "server";
    }
  }

  if (hasRemote && remoteAt >= localAt) {
    const raw = JSON.stringify(remote.payload);
    opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
    return "server";
  }

  if (hasLocal && localPayload && (!hasRemote || localAt > remoteAt)) {
    // Don't overwrite a non-empty server CRM with an empty local shell.
    if (
      opts.key === "crm" &&
      hasRemote &&
      countCrmRows(localPayload) === 0 &&
      countCrmRows(remote.payload) > 0
    ) {
      const raw = JSON.stringify(remote.payload);
      opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
      return "server";
    }
    try {
      await putStoreDocument(
        opts.key,
        localPayload,
        opts.localUpdatedAt || new Date().toISOString(),
      );
      return "pushed";
    } catch {
      return "error";
    }
  }

  if (!hasRemote && !hasLocal) return "empty";
  return "same";
}
