import { SITE_URL } from "@/lib/seo";

/** Public IndexNow key hosted at /{key}.txt */
export const INDEXNOW_KEY = "364a66f2a2ad406aac05f82dcd4388c0";

export function indexNowKeyLocation() {
  return `${SITE_URL}/${INDEXNOW_KEY}.txt`;
}

/**
 * Notify IndexNow (Bing + participating engines) about URL updates.
 * https://www.indexnow.org/documentation
 */
export async function submitIndexNow(urls: string[]): Promise<{
  ok: boolean;
  status: number;
  body: string;
}> {
  const host = new URL(SITE_URL).host;
  const urlList = [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(
    0,
    10000,
  );
  if (!urlList.length) {
    return { ok: false, status: 400, body: "No URLs" };
  }

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(),
      urlList,
    }),
  });

  const body = await res.text().catch(() => "");
  return { ok: res.ok || res.status === 202, status: res.status, body };
}
