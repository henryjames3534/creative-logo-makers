/**
 * Download unique hi-res images — one distinct Unsplash photo ID per slug.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const outDir = path.join(__dirname, "../public/clm/unique");
fs.mkdirSync(outDir, { recursive: true });

function u(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=85`;
}

/** slug → [filename, photoId] — every photoId unique */
const jobs = [
  ["logo-design", "svc-logo-mark.jpg", "1572044162444-ad11245c7c3e"],
  ["brand-starter-pack", "svc-brand-starter.jpg", "1556761175-b413da4baf72"],
  ["brand-launch-pack", "svc-brand-launch.jpg", "1542744173-8e7e53415bb0"],
  ["logo-website-squarespace", "svc-logo-website.jpg", "1498050108023-c5249f4df085"],
  ["brand-guide", "svc-brand-guide.jpg", "1561070791-2526d30994b5"],
  ["full-service-branding", "svc-full-branding.jpg", "1552664730-d307ca884978"],
  ["website-builders", "svc-website-builders.jpg", "1517694712202-14dd9538aa97"],
  ["website-redesign", "svc-website-redesign.jpg", "1547658719-da2b51169166"],
  ["blog-design", "svc-blog-design.jpg", "1499750310107-5fef28a66643"],
  ["app-icon-design", "svc-app-icon.jpg", "1511707171634-5f897ff02aa9"],
  ["website-icon-design", "svc-web-icons.jpg", "1558655146-d09347e92766"],
  ["form-design", "svc-form-design.jpg", "1555421689-491a97ff2040"],
  ["ios-app-design", "svc-ios-app.jpg", "1512941937669-90f1a6a8d7b8"],
  ["android-app-design", "svc-android-app.jpg", "1607252650355-f7fd0460ccdb"],
  ["twitter-design", "svc-twitter.jpg", "1611605698335-8b1569810432"],
  ["youtube-channel-design", "svc-youtube.jpg", "1611162616475-46b635cb6868"],
  ["leaflet-design", "svc-leaflet.jpg", "1544716278-ca5e3f4abd8c"],
  ["direct-mail-design", "svc-direct-mail.jpg", "1563986768609-322da13575f3"],
  ["flyer-design", "svc-flyer.jpg", "1558618666-fcd25c85cd64"],
  ["booklet-design", "svc-booklet.jpg", "1495446815901-a7297e633e8d"],
  ["pamphlet-design", "svc-pamphlet.jpg", "1481627834876-b7833e8f5570"],
  ["billboard-design", "svc-billboard.jpg", "1470229722913-7c0e2dbbafd3"],
  ["trade-show-banner-design", "svc-trade-banner.jpg", "1540575467063-178a50c2df87"],
  ["banner-design", "svc-banner.jpg", "1521737711867-e3b97375f902"],
  ["email-newsletter-design", "svc-newsletter.jpg", "1596526131083-e8c633c948d2"],
  ["website-header-design", "svc-web-header.jpg", "1507238691740-187a5b1d37b8"],
  ["resume-design", "svc-resume.jpg", "1454165804606-c3d57bc86b40"],
  ["word-template-design", "svc-word-template.jpg", "1484480974693-6ca0a78fb36b"],
  ["trade-show-booth-design", "svc-trade-booth.jpg", "1505373877841-8d25f7d46678"],
  ["jersey-design", "svc-jersey.jpg", "1522778119026-d647f0596c20"],
  ["bag-tote-design", "svc-tote.jpg", "1590874103328-eac38a683ce7"],
  ["cap-design", "svc-cap.jpg", "1588850561407-ed78c282e89b"],
  ["shopping-bag-design", "svc-shopping-bag.jpg", "1607083206968-13611e3d76db"],
  ["illustrations", "svc-illustrations.jpg", "1513364776573-ba9a6aba91c3"],
  ["business-illustration", "svc-biz-illustration.jpg", "1558655146-9f40138edfeb"],
  ["website-illustration-design", "svc-web-illustration.jpg", "1618005198919-d3d224b25ca0"],
  ["book-illustration", "svc-book-illustration.jpg", "1512820790803-83ca734da794"],
  ["pattern-design", "svc-pattern.jpg", "1550684848-fac1c5b4e853"],
  ["invitation-design", "svc-invitation-card.jpg", "1464366400600-7168b8af9bc3"],
  ["greeting-card-design", "svc-greeting-card.jpg", "1513201099705-a9746e1e201f"],
  ["wedding-invitation-design", "svc-wedding-invite.jpg", "1519225421980-715cb0215a07"],
  ["3d-architectural-rendering", "svc-3d-arch.jpg", "1486406146926-c627a92ad1ab"],
  ["food-packaging-design", "svc-food-pack.jpg", "1606313564200-e75d5e30476c"],
  ["retail-packaging-design", "svc-retail-pack.jpg", "1607082348824-0a96f2a4b9da"],
  ["cosmetics-packaging-design", "svc-cosmetics-pack.jpg", "1596462502278-27bfdd403348"],
  ["box-design", "svc-box-design.jpg", "1566576912321-d58ddd7a6088"],
  ["food-label-design", "svc-food-label.jpg", "1604719312566-8912e9227c6a"],
  ["beverage-label-design", "svc-beverage-label.jpg", "1551538827-9c037cb4f32a"],
  ["beer-label-design", "svc-beer-label.jpg", "1608270586620-248524c67de9"],
  ["wine-label-design", "svc-wine-label.jpg", "1510812431401-41d2bd2722f3"],
  ["interior-book-design", "svc-interior-book.jpg", "1524995997940-a1407bee4e8d"],
  ["ebook-cover-design", "svc-ebook-cover.jpg", "1544947950-fa07a98d237f"],
  ["book-layout-design", "svc-book-layout.jpg", "1507003211169-0a1dd7228f2d"],
  ["logo-branding", "svc-logo-branding-hero.jpg", "1626785774573-4b7993143493"],
  ["brand-identity-pack", "svc-brand-identity.jpg", "1600880292203-757bb62b4baf"],
  ["logo-business-card-design", "svc-logo-bizcard.jpg", "1586281380349-632531db7ed4"],
  ["logo-brand-guide", "svc-logo-brand-guide.jpg", "1618005182384-a83a8bd57fbe"],
  ["stationery", "svc-stationery-desk.jpg", "1450101499163-c8848ffced27"],
  ["business-card-design", "svc-business-card-alt.jpg", "1589939705384-5185137a7f0f"],
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try { fs.unlinkSync(dest); } catch {}
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          try { fs.unlinkSync(dest); } catch {}
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () =>
          file.close(() => resolve(fs.statSync(dest).size)),
        );
      },
    );
    req.setTimeout(45000, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", (err) => {
      try { file.close(); fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

(async () => {
  const ids = jobs.map((j) => j[2]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) {
    console.error("DUPLICATE PHOTO IDS", [...new Set(dup)]);
    process.exit(1);
  }

  const results = {};
  let ok = 0;
  let fail = 0;
  for (const [slug, file, id] of jobs) {
    const dest = path.join(outDir, file);
    try {
      const size = await download(u(id), dest);
      if (size < 10000) throw new Error(`small ${size}`);
      results[slug] = `/clm/unique/${file}`;
      ok++;
      console.log("OK", slug, size);
    } catch (e) {
      fail++;
      console.log("FAIL", slug, e.message);
    }
  }
  fs.writeFileSync(
    path.join(__dirname, "_image-map.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("DONE ok=", ok, "fail=", fail);
})();
