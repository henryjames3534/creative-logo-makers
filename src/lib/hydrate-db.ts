/**
 * Boot-time hydrate: pull CRM / users / chat / brand logo from Postgres.
 */
import { hydrateCrmFromServer } from "@/lib/crm-storage";
import { hydrateUsersFromServer } from "@/lib/auth-storage";
import { hydrateChatFromServer } from "@/lib/live-chat";
import { hydrateSiteLogoFromServer } from "@/lib/site-brand";

let inflight: Promise<void> | null = null;

export function hydrateAllFromDb(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (inflight) return inflight;
  inflight = (async () => {
    await Promise.all([
      hydrateCrmFromServer().catch(() => null),
      hydrateUsersFromServer().catch(() => null),
      hydrateChatFromServer().catch(() => null),
      hydrateSiteLogoFromServer().catch(() => null),
    ]);
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}
