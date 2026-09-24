const fs = require("fs");
const path = require("path");

const cat = fs.readFileSync(path.join(__dirname, "../src/data/categories.ts"), "utf8");
const media = fs.readFileSync(path.join(__dirname, "../src/data/media.ts"), "utf8");

const slugs = [...new Set([...cat.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];
const start = media.indexOf("categoryImages");
const end = media.indexOf("groupImages");
const block = media.slice(start, end);
const catMap = {};
for (const m of block.matchAll(/"([^"]+)":\s*"(\/[^"]+)"/g)) catMap[m[1]] = m[2];

const missing = slugs.filter((s) => !catMap[s]);
const byPath = {};
for (const [k, v] of Object.entries(catMap)) {
  (byPath[v] ||= []).push(k);
}
const dups = Object.entries(byPath).filter(([, a]) => a.length > 1);

console.log("categories", slugs.length);
console.log("mapped", Object.keys(catMap).length);
console.log("MISSING", missing.length);
missing.forEach((s) => console.log(" -", s));
console.log("DUP PATHS", dups.length);
dups.forEach(([p, a]) => console.log(p, "->", a.join(", ")));
