const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "src", "data", "designers.ts");
let t = fs.readFileSync(p, "utf8");

const broken = (t.match(/"avatar": "https:\/\/creativelogomakers\.com"/g) || [])
  .length;

t = t.replace(
  /"image": "([^"]+)",\s*\n\s*"avatar": "https:\/\/creativelogomakers\.com"/g,
  '"image": "$1",\n    "avatar": "$1"',
);

t = t.replace(
  "/** Imported from Creative Logo Makers.com/designers/search — 319 profiles */",
  "/** Designer catalog — 319 profiles */",
);

const left = (t.match(/"avatar": "https:\/\/creativelogomakers\.com"/g) || [])
  .length;

fs.writeFileSync(p, t);
console.log({ fixedFrom: broken, remaining: left });
