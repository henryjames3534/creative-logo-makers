/**
 * Client helpers: sync browser stores ↔ Postgres via Next.js /api/store.
 */
export type StoreKey = "crm" | "users" | "chat" | "brand";

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

/**
 * Pull server doc into localStorage when newer; otherwise push local up.
 * Returns true if localStorage was replaced from server.
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

  if (hasRemote && remoteAt >= localAt) {
    const raw = JSON.stringify(remote.payload);
    opts.writeLocal(raw, remote.updatedAt || new Date().toISOString());
    return "server";
  }

  if (hasLocal && (!hasRemote || localAt > remoteAt)) {
    try {
      const payload = JSON.parse(opts.localRaw!);
      await putStoreDocument(
        opts.key,
        payload,
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
