const fs = require("fs");
const path = require("path");

const mediaPath = path.join(__dirname, "../src/data/media.ts");
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_image-map.json"), "utf8"),
);

let media = fs.readFileSync(mediaPath, "utf8");
const start = media.indexOf("export const categoryImages");
const end = media.indexOf("export const groupImages");
if (start < 0 || end < 0) throw new Error("markers not found");

const before = media.slice(0, start);
const after = media.slice(end);

// Parse existing categoryImages entries and merge
const oldBlock = media.slice(start, end);
const catMap = {};
for (const m of oldBlock.matchAll(/"([^"]+)":\s*"(\/[^"]+)"/g)) {
  catMap[m[1]] = m[2];
}
Object.assign(catMap, map);

// Also fix illustrations key without quotes if present as identifier
if (map.illustrations) catMap.illustrations = map.illustrations;

// Build sorted block
const lines = Object.entries(catMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => {
    const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k);
    return `  ${key}: ${JSON.stringify(v)},`;
  });

const block = `export const categoryImages: Record<string, string> = {\n${lines.join("\n")}\n};\n\n`;

// Update groupImages for logo-branding if we have a new hero
let groupAfter = after;
if (map["logo-branding"]) {
  groupAfter = groupAfter.replace(
    /"logo-branding":\s*"[^"]+"/,
    `"logo-branding": ${JSON.stringify(map["logo-branding"])}`,
  );
}

media = before + block + groupAfter;
fs.writeFileSync(mediaPath, media);

// Verify no duplicate paths within categoryImages
const paths = Object.values(catMap);
const byPath = {};
for (const [k, v] of Object.entries(catMap)) {
  (byPath[v] ||= []).push(k);
}
const dups = Object.entries(byPath).filter(([, a]) => a.length > 1);
console.log("categoryImages count", paths.length);
console.log("unique paths", new Set(paths).size);
if (dups.length) {
  console.log("DUPLICATE PATHS STILL:");
  dups.forEach(([p, a]) => console.log(p, "->", a.join(", ")));
} else {
  console.log("No duplicate paths in categoryImages");
}
