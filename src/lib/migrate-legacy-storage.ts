/** One-time migrate localStorage/sessionStorage keys from legacy prefixes. */

const LEGACY = ["99", "d_"].join("");
const LEGACY_DASH = ["99", "d-"].join("");

const PAIRS: [string, string][] = [
  [`${LEGACY}users_v2`, "clm_users_v2"],
  [`${LEGACY}users_v1`, "clm_users_v1"],
  [`${LEGACY}session_v1`, "clm_session_v1"],
  [`${LEGACY}pending_brief_v1`, "clm_pending_brief_v1"],
  [`${LEGACY}google_accounts_v1`, "clm_google_accounts_v1"],
  [`${LEGACY}crm_v1`, "clm_crm_v1"],
  [`${LEGACY}admin_session_v1`, "clm_admin_session_v1"],
  [`${LEGACY}designer_session_v1`, "clm_designer_session_v1"],
  [`${LEGACY}visitor_key`, "clm_visitor_key"],
  [`${LEGACY}visitor_geo_v2`, "clm_visitor_geo_v2"],
  [`${LEGACY}google_onetap_dismissed`, "clm_google_onetap_dismissed"],
  [`${LEGACY}gsi_setup_hint`, "clm_gsi_setup_hint"],
  [`${LEGACY_DASH}notice-dismissed`, "clm-notice-dismissed"],
  [`${LEGACY_DASH}promo-dismissed`, "clm-promo-dismissed"],
  [`${LEGACY}studio_request`, "clm_studio_request"],
];

function migrateStore(store: Storage) {
  for (const [from, to] of PAIRS) {
    try {
      if (store.getItem(to) != null) continue;
      const val = store.getItem(from);
      if (val == null) continue;
      store.setItem(to, val);
      store.removeItem(from);
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export function migrateLegacyStorage() {
  if (typeof window === "undefined") return;
  try {
    migrateStore(window.localStorage);
    migrateStore(window.sessionStorage);
  } catch {
    /* ignore */
  }
}
