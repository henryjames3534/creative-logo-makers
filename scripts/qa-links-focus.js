/**
 * Focused link QA: navigation + footer + studio + popular CTAs.
 * Also spot-checks every category /details and /launch path.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const BASE = process.env.QA_BASE || "http://127.0.0.1:3000";
const ROOT = path.join(__dirname, "..");

function normalize(h) {
  if (!h || !h.startsWith("/")) return null;
  return h.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
}

function collect() {
  const set = new Set([
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
  ]);

  for (const file of [
    "src/data/navigation.ts",
    "src/data/site.ts",
    "src/data/studio.ts",
    "src/data/categories.ts",
  ]) {
    const t = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const m of t.matchAll(/href:\s*"(\/[^"]+)"/g)) {
      const n = normalize(m[1]);
      if (n) set.add(n);
    }
    for (const m of t.matchAll(/slug:\s*"([^"]+)"/g)) {
      if (file.includes("studio")) set.add(`/studio/${m[1]}`);
      if (file.includes("categories")) {
        set.add(`/${m[1]}/details`);
        set.add(`/launch/${m[1]}`);
      }
    }
  }

  // Footer / Header hardcodes via brand pages already covered
  return [...set].sort();
}

function get(pathname) {
  return new Promise((resolve) => {
    const req = http.get(
      new URL(pathname, BASE),
      { timeout: 60000, headers: { Accept: "text/html" } },
      (res) => {
        res.resume();
        resolve({ path: pathname, status: res.statusCode || 0 });
      },
    );
    req.on("error", (e) => resolve({ path: pathname, status: 0, error: e.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ path: pathname, status: 0, error: "timeout" });
    });
  });
}

(async () => {
  const hrefs = collect();
  console.log("Focus-check", hrefs.length, "links");
  const broken = [];
  const ok = [];
  const queue = [...hrefs];
  async function worker() {
    while (queue.length) {
      const h = queue.shift();
      const r = await get(h);
      if (r.status >= 200 && r.status < 400) {
        ok.push(r);
        process.stdout.write(".");
      } else {
        broken.push(r);
        process.stdout.write("X");
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => worker()));
  console.log("\nOK", ok.length, "BROKEN", broken.length);
  broken
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((b) => console.log(`${b.status || "ERR"}\t${b.path}\t${b.error || ""}`));
  fs.writeFileSync(
    path.join(__dirname, "_link-qa-focus.json"),
    JSON.stringify({ ok: ok.length, broken }, null, 2),
  );
})();
