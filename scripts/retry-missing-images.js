const fs = require("fs");
const path = require("path");
const https = require("https");

const outDir = path.join(__dirname, "../public/clm/unique");
const mapPath = path.join(__dirname, "_image-map.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));

function u(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=85`;
}

const retries = {
  "ios-app-design": {
    file: "svc-ios-app.jpg",
    ids: [
      "1512941937669-90f1a6a8d7b8",
      "1551650975-87deedd944b5",
      "1601784557576-0a0b0b0b0b0b",
      "1585795990380-4875eb3b0b0b",
      "1555774698-0f1ebbbc3b0b",
      "1483478550801-ce29b508ddc0",
    ],
  },
  illustrations: {
    file: "svc-illustrations.jpg",
    ids: [
      "1513364776573-ba9a6aba91c3",
      "1579783902614-a07461136675",
      "1460664110477-6e5e5c0c0c0c",
      "1452860606245-0b0b0b0b0b0b",
      "1561070791-2526d30994b5",
      "1499781358740-0b0b0b0b0b0b",
      "1607604277080-0b0b0b0b0b0b",
      "1618005182384-a83a8bd57fbe",
    ],
  },
  "wedding-invitation-design": {
    file: "svc-wedding-invite.jpg",
    ids: [
      "1519225421980-715cb0215a07",
      "1464366400600-7168b8af9bc3",
      "1522673607200-164a2e34e0f0",
      "1529636798458-92182e662485",
      "1465495976277-4387d4b0b4a6",
      "1511795409834-ef04bbd61622",
    ],
  },
};

// Use picsum as guaranteed unique fallback per slug
function picsum(slug, dest) {
  const seed = encodeURIComponent(slug);
  return download(`https://picsum.photos/seed/${seed}/1600/1000.jpg`, dest);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/*",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {}
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {}
          return reject(new Error("HTTP " + res.statusCode));
        }
        res.pipe(file);
        file.on("finish", () =>
          file.close(() => resolve(fs.statSync(dest).size)),
        );
      },
    );
    req.on("error", (e) => {
      try {
        file.close();
        fs.unlinkSync(dest);
      } catch {}
      reject(e);
    });
  });
}

(async () => {
  // Prefer known-good Unsplash IDs that already worked in this project for close themes
  const solid = {
    "ios-app-design": ["1511707171634-5f897ff02aa9", "1607252650355-f7fd0460ccdb"],
    illustrations: ["1558655146-9f40138edfeb", "1618005198919-d3d224b25ca0"],
    "wedding-invitation-design": [
      "1513201099705-a9746e1e201f",
      "1464366400600-7168b8af9bc3",
    ],
  };

  for (const [slug, ids] of Object.entries(solid)) {
    if (map[slug]) continue;
    const file = retries[slug].file;
    const dest = path.join(outDir, file);
    let ok = false;
    for (const id of ids) {
      try {
        const size = await download(u(id), dest);
        if (size < 10000) throw new Error("small");
        // rename to unique content: copy with slug-specific name already
        map[slug] = `/clm/unique/${file}`;
        console.log("OK", slug, id, size);
        ok = true;
        break;
      } catch (e) {
        console.log("fail", slug, id, e.message);
      }
    }
    if (!ok) {
      try {
        const size = await picsum(slug + "-v2", dest);
        map[slug] = `/clm/unique/${file}`;
        console.log("OK-picsum", slug, size);
      } catch (e) {
        console.log("FAIL", slug, e.message);
      }
    }
  }

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log("total mapped", Object.keys(map).length);
})();
