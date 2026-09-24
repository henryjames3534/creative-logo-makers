/**
 * QA: crawl static internal links from src + key data, hit localhost, report broken.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const BASE = process.env.QA_BASE || "http://127.0.0.1:3000";

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (["node_modules", ".next", ".git", "public"].includes(ent.name)) continue;
      walk(p, out);
    } else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function normalize(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"))
    return null;
  if (href.includes("${") || href.includes("[") || href.includes("`")) return null;
  let h = href.split("?")[0].split("#")[0];
  if (!h.startsWith("/")) return null;
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h || "/";
}

function collectHrefs() {
  const hrefs = new Set();
  const files = walk(path.join(ROOT, "src"));
  const reList = [
    /href=["'](\/[^"'#?]*)/g,
    /href:\s*["'](\/[^"'#?]*)/g,
    /router\.push\(\s*["'](\/[^"'#?]*)/g,
    /destination:\s*["'](\/[^"'#?]*)/g,
    /canonical:\s*["'](\/[^"'#?]*)/g,
  ];
  for (const f of files) {
    const t = fs.readFileSync(f, "utf8");
    for (const re of reList) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(t))) {
        const n = normalize(m[1]);
        if (n) hrefs.add(n);
      }
    }
  }

  // Explicit data catalogs
  try {
    const { categories } = require(path.join(ROOT, "src/data/categories.ts"));
  } catch {
    /* strip-types may fail; parse slugs */
  }
  const catSrc = fs.readFileSync(path.join(ROOT, "src/data/categories.ts"), "utf8");
  for (const m of catSrc.matchAll(/slug:\s*"([^"]+)"/g)) {
    hrefs.add(`/${m[1]}/details`);
    hrefs.add(`/launch/${m[1]}`);
  }
  const studioSrc = fs.readFileSync(path.join(ROOT, "src/data/studio.ts"), "utf8");
  for (const m of studioSrc.matchAll(/slug:\s*"([^"]+)"/g)) {
    hrefs.add(`/studio/${m[1]}`);
  }
  const navSrc = fs.readFileSync(path.join(ROOT, "src/data/navigation.ts"), "utf8");
  for (const m of navSrc.matchAll(/href:\s*"(\/[^"]+)"/g)) {
    const n = normalize(m[1]);
    if (n) hrefs.add(n);
  }
  const siteSrc = fs.readFileSync(path.join(ROOT, "src/data/site.ts"), "utf8");
  for (const m of siteSrc.matchAll(/href:\s*"(\/[^"]+)"/g)) {
    const n = normalize(m[1]);
    if (n) hrefs.add(n);
  }

  // Core pages
  [
    "/",
    "/categories",
    "/how-it-works",
    "/inspiration",
    "/contests",
    "/projects",
    "/pricing",
    "/studio",
    "/logo-maker",
    "/get-started",
    "/contact",
    "/about",
    "/login",
    "/signup",
    "/account",
    "/designers",
    "/designers/search",
  ].forEach((h) => hrefs.add(h));

  return [...hrefs].sort();
}

function request(pathname) {
  return new Promise((resolve) => {
    const url = new URL(pathname, BASE);
    const req = http.get(
      url,
      { timeout: 45000, headers: { Accept: "text/html" } },
      (res) => {
        // drain
        res.resume();
        resolve({ path: pathname, status: res.statusCode || 0 });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ path: pathname, status: 0, error: "timeout" });
    });
    req.on("error", (e) => resolve({ path: pathname, status: 0, error: e.message }));
  });
}

async function main() {
  const hrefs = collectHrefs();
  console.log("Checking", hrefs.length, "links against", BASE);
  const broken = [];
  const ok = [];
  // concurrency 8
  const queue = [...hrefs];
  async function worker() {
    while (queue.length) {
      const h = queue.shift();
      const r = await request(h);
      if (r.status >= 200 && r.status < 400) {
        ok.push(r);
        process.stdout.write(".");
      } else {
        broken.push(r);
        process.stdout.write("X");
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, () => worker()));
  console.log("\n");
  console.log("OK", ok.length);
  console.log("BROKEN", broken.length);
  broken.sort((a, b) => a.path.localeCompare(b.path));
  for (const b of broken) {
    console.log(`${b.status || "ERR"}\t${b.path}${b.error ? "\t" + b.error : ""}`);
  }
  fs.writeFileSync(
    path.join(__dirname, "_link-qa.json"),
    JSON.stringify({ ok: ok.length, broken }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
