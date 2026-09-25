/** Public site key only — safe for the browser bundle. */
export const RECAPTCHA_SITE_KEY = (
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ??
  "6LdkWc4tAAAAAHBnqjJg_NkR34jb14YLWayrHe_I"
).trim();
