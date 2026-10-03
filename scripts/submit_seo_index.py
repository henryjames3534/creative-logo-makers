"""
Submit all SEO URLs to IndexNow + ping Google/Bing sitemap endpoints.
Run after deploy: python scripts/submit_seo_index.py
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from xml.etree import ElementTree as ET

SITE = "https://www.creativelogomakers.com"
INDEXNOW_KEY = "364a66f2a2ad406aac05f82dcd4388c0"
KEY_LOCATION = f"{SITE}/{INDEXNOW_KEY}.txt"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def fetch(url: str, data: bytes | None = None, headers: dict | None = None):
    req = urllib.request.Request(
        url,
        data=data,
        headers=headers or {},
        method="POST" if data is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body


def collect_urls_from_sitemap(sitemap_url: str) -> list[str]:
    status, body = fetch(sitemap_url)
    if status != 200:
        raise SystemExit(f"sitemap fetch failed {status}: {body[:200]}")
    root = ET.fromstring(body)
    tag = root.tag.lower()
    urls: list[str] = []

    # Sitemap index
    if tag.endswith("sitemapindex"):
        for sm in root.findall("sm:sitemap", NS) or root.findall("sitemap"):
            loc = sm.findtext("sm:loc", default="", namespaces=NS) or sm.findtext(
                "loc", default=""
            )
            if loc:
                urls.extend(collect_urls_from_sitemap(loc.strip()))
        return urls

    for u in root.findall("sm:url", NS) or root.findall("url"):
        loc = u.findtext("sm:loc", default="", namespaces=NS) or u.findtext(
            "loc", default=""
        )
        if loc:
            urls.append(loc.strip())
    return urls


def submit_indexnow(urls: list[str]) -> None:
    host = "www.creativelogomakers.com"
    batch_size = 1000
    for i in range(0, len(urls), batch_size):
        batch = urls[i : i + batch_size]
        payload = json.dumps(
            {
                "host": host,
                "key": INDEXNOW_KEY,
                "keyLocation": KEY_LOCATION,
                "urlList": batch,
            }
        ).encode()
        status, body = fetch(
            "https://api.indexnow.org/IndexNow",
            data=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
        ok = status in (200, 202)
        print(
            f"IndexNow batch {i // batch_size + 1}: status={status} count={len(batch)} ok={ok}"
        )
        if body.strip():
            print(" ", body[:300])
        if not ok and status not in (200, 202):
            # 422 sometimes if recently submitted — continue
            print("  continuing despite non-OK")
        time.sleep(1)


def ping_sitemaps() -> None:
    sitemap = f"{SITE}/sitemap.xml"
    pings = [
        f"https://www.google.com/ping?sitemap={urllib.parse.quote(sitemap, safe='')}",
        f"https://www.bing.com/ping?sitemap={urllib.parse.quote(sitemap, safe='')}",
        f"https://www.bing.com/indexnow?url={urllib.parse.quote(SITE + '/', safe='')}&key={INDEXNOW_KEY}",
    ]
    for url in pings:
        try:
            status, body = fetch(url)
            print(f"Ping {url.split('?')[0]} -> {status}")
            if body.strip():
                print(" ", body[:200].replace("\n", " "))
        except Exception as e:
            print(f"Ping failed: {e}")


def main() -> None:
    print("Collecting sitemap URLs…")
    urls: list[str] = []
    for candidate in (
        f"{SITE}/sitemap.xml",
        f"{SITE}/api/sitemap-index",
    ):
        try:
            urls = collect_urls_from_sitemap(candidate)
            if urls:
                print(f"Loaded from {candidate}")
                break
        except SystemExit as e:
            print(f"Skip {candidate}: {e}")
    if not urls:
        # Fallback: chunked API sitemaps
        for i in range(0, 20):
            try:
                part = collect_urls_from_sitemap(f"{SITE}/api/sitemap/{i}")
            except SystemExit:
                break
            if not part:
                break
            urls.extend(part)
    # de-dupe preserve order
    seen = set()
    unique = []
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        unique.append(u)
    print(f"URLs: {len(unique)}")
    if not unique:
        raise SystemExit("No sitemap URLs found")
    # Prefer USA + discount pages first
    priority = [
        u for u in unique if "/usa/" in u or u.rstrip("/").endswith("/usa")
    ]
    rest = [u for u in unique if u not in set(priority)]
    ordered = priority + rest
    print(f"Priority (/usa*): {len(priority)}")
    submit_indexnow(ordered)
    ping_sitemaps()
    print(
        "Done. In Google Search Console > Sitemaps, resubmit "
        f"{SITE}/sitemap.xml"
    )


if __name__ == "__main__":
    main()
