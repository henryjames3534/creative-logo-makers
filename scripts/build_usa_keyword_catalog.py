"""Build USA keyword pages catalog (~5k) from Keyword Planner map + existing intents."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"F:\clm-restore")
SRC = ROOT / "src" / "data"
KM = Path(r"F:\creativelogomakers\src\data\seo\keyword-map.json")

# Existing hand-crafted intents (keep as-is / override generated)
INTENTS_PATH = SRC / "usa-intents.ts"

RESERVED = {
    "usa",
    "us",
    "categories",
    "pricing",
    "contact",
    "about",
    "login",
    "signup",
    "studio",
    "designers",
    "contests",
    "projects",
    "inspiration",
    "api",
    "admin",
}

EXCLUDE_RE = re.compile(
    r"\b(free|canva|fiverr|upwork|chatgpt|ai logo|template online|generator online)\b",
    re.I,
)


def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"[^a-z0-9\s-]", "", t)
    t = re.sub(r"\s+", "-", t)
    return re.sub(r"-+", "-", t).strip("-")


def title_case(keyword: str) -> str:
    small = {"a", "an", "and", "for", "in", "of", "on", "the", "to", "with", "near", "me", "vs"}
    words = keyword.split()
    out = []
    for i, w in enumerate(words):
        lw = w.lower()
        if i > 0 and lw in small:
            out.append(lw)
        else:
            out.append(lw[:1].upper() + lw[1:] if lw else w)
    return " ".join(out)


def pick_service(keyword: str) -> str:
    k = keyword.lower()
    if any(x in k for x in ("website", "web design", "web designer", "wordpress", "landing page", "squarespace")):
        if "wordpress" in k:
            return "wordpress-theme-design"
        if "landing" in k:
            return "landing-page-design"
        return "web-design"
    if any(x in k for x in ("app icon",)):
        return "app-icon-design"
    if any(x in k for x in ("ios app", "iphone app")):
        return "ios-app-design"
    if any(x in k for x in ("android app",)):
        return "android-app-design"
    if any(x in k for x in ("mobile app", "app design", "ui ux", "ux design")):
        return "mobile-app-design"
    if any(x in k for x in ("packaging", "product package")):
        return "product-packaging-design"
    if "label" in k:
        return "product-label-design"
    if any(x in k for x in ("business card",)):
        return "business-card-design"
    if "brochure" in k:
        return "brochure-design"
    if "flyer" in k or "leaflet" in k:
        return "flyer-design"
    if "t-shirt" in k or "tshirt" in k or "tee shirt" in k:
        return "t-shirt-design"
    if "book cover" in k:
        return "book-cover-design"
    if "illustration" in k:
        return "illustrations"
    if any(x in k for x in ("social media", "instagram", "facebook cover", "youtube")):
        return "social-media-page-design"
    if any(x in k for x in ("brand guide", "brand guidelines")):
        return "logo-brand-guide"
    if any(x in k for x in ("branding", "brand identity", "full service brand")):
        return "full-service-branding"
    if "stationery" in k:
        return "stationery-design"
    # default logo cluster
    return "logo-design"


def related_for(keyword: str, service: str) -> list[str]:
    base = keyword.lower()
    extras = [
        f"{base} usa",
        f"{base} services",
        f"best {base}",
        f"affordable {base}" if "cheap" not in base and "affordable" not in base else f"professional {base}",
    ]
    if "near me" not in base:
        extras.append(f"{base} near me")
    if service == "logo-design":
        extras.append("custom logo design")
    return extras[:5]


def build_copy(keyword: str, service: str) -> tuple[str, str, str]:
    label = title_case(keyword)
    h1_variants = [
        f"{label} — for US businesses that need real designers",
        f"{label} with contests, revisions, and full file ownership",
        f"Get {label.lower()} without guessing which freelancer to trust",
        f"{label} for startups and growing brands across the USA",
    ]
    # stable pick from keyword hash
    idx = sum(ord(c) for c in keyword.lower()) % len(h1_variants)
    h1 = h1_variants[idx]
    title = f"{label} USA — Creative Logo Makers (2026)"
    description = (
        f"Looking for {keyword.lower()}? Creative Logo Makers runs design contests "
        f"and 1-to-1 projects for US teams — fixed packages, revisions, and commercial files."
    )
    return title, description, h1


# Parse existing intent slugs from TS file (simple)
existing_slugs: set[str] = set()
text = INTENTS_PATH.read_text(encoding="utf-8")
for m in re.finditer(r'slug:\s*"([^"]+)"', text):
    existing_slugs.add(m.group(1))

rows = json.loads(KM.read_text(encoding="utf-8"))
by_slug: dict[str, dict] = {}

for row in rows:
    kw = (row.get("keyword") or "").strip()
    if not kw or EXCLUDE_RE.search(kw):
        continue
    # skip pure city-local paths if they already have /us/ pages — still allow USA keyword page
    slug = slugify(kw)
    if not slug or slug in RESERVED or len(slug) < 3:
        continue
    prev = by_slug.get(slug)
    if not prev:
        by_slug[slug] = row
        continue
    if row.get("source") == "gsc" and prev.get("source") != "gsc":
        by_slug[slug] = row
    elif int(row.get("impressions") or 0) > int(prev.get("impressions") or 0):
        by_slug[slug] = row

pages = []
for slug, row in sorted(by_slug.items(), key=lambda x: x[0]):
    kw = row["keyword"].strip()
    service = pick_service(kw)
    title, description, h1 = build_copy(kw, service)
    pages.append(
        {
            "slug": slug,
            "keyword": kw,
            "related": related_for(kw, service),
            "serviceSlug": service,
            "title": title,
            "description": description,
            "h1": h1,
            "source": row.get("source") or "planner",
            "avg": row.get("avg") or "",
            "handCrafted": slug in existing_slugs,
        }
    )

# Ensure every hand-crafted intent slug exists even if filtered
# (will be overridden at runtime by USA_INTENTS fields when handCrafted)

out = {
    "count": len(pages),
    "pages": pages,
}
(SRC / "usa-keyword-catalog.json").write_text(
    json.dumps(out, ensure_ascii=False) + "\n", encoding="utf-8"
)
print(f"Wrote {len(pages)} keyword pages → usa-keyword-catalog.json")
print(f"Hand-crafted overlap: {sum(1 for p in pages if p['handCrafted'])}")
