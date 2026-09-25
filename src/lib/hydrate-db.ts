/**
 * Boot-time hydrate: pull CRM / users / chat from Postgres into localStorage.
 */
import { hydrateCrmFromServer } from "@/lib/crm-storage";
import { hydrateUsersFromServer } from "@/lib/auth-storage";
import { hydrateChatFromServer } from "@/lib/live-chat";

let inflight: Promise<void> | null = null;

export function hydrateAllFromDb(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (inflight) return inflight;
  inflight = (async () => {
    await Promise.all([
      hydrateCrmFromServer().catch(() => null),
      hydrateUsersFromServer().catch(() => null),
      hydrateChatFromServer().catch(() => null),
    ]);
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}
