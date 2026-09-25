/**
 * Client for Verpex HTTPS → localhost PostgreSQL API bridge.
 * Never connects to Postgres directly from Vercel.
 */

const DEFAULT_BASE = "https://payment.creativelogomakers.com/clm-api";

function apiBase() {
  return (process.env.CLM_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function apiKey() {
  return (process.env.INTERNAL_API_KEY || "").trim();
}

export type ClmApiResult<T = unknown> = {
  ok: boolean;
  error?: string;
  detail?: string;
} & T;

export async function clmApiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<ClmApiResult<T>> {
  const key = apiKey();
  if (!key) {
    return { ok: false, error: "INTERNAL_API_KEY is not set" } as ClmApiResult<T>;
  }

  const url = `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({
    ok: false,
    error: `Invalid JSON (${res.status})`,
  }))) as ClmApiResult<T>;

  if (!res.ok && data.ok !== false) {
    return { ...data, ok: false, error: data.error || `HTTP ${res.status}` };
  }
  return data;
}

export async function clmDbHealth() {
  return clmApiFetch<{
    service?: string;
    db?: string;
    postgres?: string | boolean;
    time?: string;
  }>("/health");
}

export async function clmDbMigrate() {
  return clmApiFetch<{ migrated?: boolean; schema_version?: number }>(
    "/migrate",
    { method: "POST", body: "{}" },
  );
}

export async function clmUpsertVisitor(input: {
  id?: string;
  email?: string;
  name?: string;
  country?: string;
  city?: string;
  ip?: string;
  path?: string;
  meta?: Record<string, unknown>;
}) {
  return clmApiFetch<{ item?: Record<string, unknown> }>("/visitors", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function clmCreateLead(input: {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  message?: string;
  source?: string;
  status?: string;
  meta?: Record<string, unknown>;
}) {
  return clmApiFetch<{ item?: Record<string, unknown> }>("/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function clmGetDocument(key: "crm" | "users" | "chat" | string) {
  return clmApiFetch<{
    id?: string;
    payload?: unknown;
    updatedAt?: string | null;
  }>(`/${key}`);
}

export async function clmPutDocument(
  key: "crm" | "users" | "chat" | string,
  payload: unknown,
  updatedAt?: string,
) {
  return clmApiFetch<{
    id?: string;
    payload?: unknown;
    updatedAt?: string | null;
  }>(`/${key}`, {
    method: "PUT",
    body: JSON.stringify({
      payload,
      updatedAt: updatedAt || new Date().toISOString(),
    }),
  });
}
