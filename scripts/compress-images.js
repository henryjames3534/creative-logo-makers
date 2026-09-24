const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, out);
    else if (/\.(jpe?g|png)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

(async () => {
  const roots = ["public/clm", "public/showcase"]
    .map((r) => path.join(process.cwd(), r))
    .filter(fs.existsSync);
  const files = [];
  for (const r of roots) await walk(r, files);

  const heavy = files
    .map((f) => ({ f, size: fs.statSync(f).size }))
    .filter((x) => x.size > 350 * 1024)
    .sort((a, b) => b.size - a.size);

  console.log(`Compressing ${heavy.length} files >350KB...`);
  let saved = 0;
  for (const { f, size } of heavy) {
    const ext = path.extname(f).toLowerCase();
    const tmp = f + ".opt.tmp";
    try {
      let pipeline = sharp(f)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        });
      if (ext === ".png") {
        await pipeline.png({ compressionLevel: 9, quality: 80 }).toFile(tmp);
      } else {
        await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(tmp);
      }
      const newSize = fs.statSync(tmp).size;
      if (newSize < size * 0.95) {
        fs.renameSync(tmp, f);
        saved += size - newSize;
        console.log(
          `OK ${Math.round(size / 1024)}→${Math.round(newSize / 1024)}KB  ${path.relative(process.cwd(), f)}`,
        );
      } else {
        fs.unlinkSync(tmp);
        console.log(`SKIP ${path.relative(process.cwd(), f)}`);
      }
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.log(`FAIL ${path.relative(process.cwd(), f)}: ${e.message}`);
    }
  }
  console.log(`Total saved ~${Math.round(saved / 1024)}KB`);
})();
