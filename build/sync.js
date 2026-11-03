// Copies every tool from its source repo into tools/, then translates it to English.
//   node build/sync.js
// Run by hand ("อัปเดท") and every 30 minutes by .github/workflows/sync.yml.
// For each tool: index.html -> tools/<id>.html with <script src="embed.js"> before </head>,
// files it references under assets/ -> tools/assets/, extra files as-is, and (guide: true)
// the repo's guide.html -> tools/guide-<id>.html with links back to the combined site.
// English guides (build/guides-en, tools/guide-*-en.html) are hand-translated: a changed
// Thai guide is reported as "GUIDE CHANGED" so the English one can be updated.
// To remove a tool, delete it here and from GROUPS in index.html; to add one, add both.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), TOOLS = path.join(ROOT, "tools");

const SOURCES = [
  { id: "check-cntrs",   repo: "Check-cntrs",        guide: true, extra: ["core.js"] },
  { id: "check-dem",     repo: "Check-dem",          guide: true },
  { id: "change-status", repo: "Change-status-mman", guide: true },
  { id: "temp",          repo: "TEMP." },             // guide written for the combined site
  { id: "cut-bl",        repo: "CUT-BL" },            // guide written for the combined site
  { id: "sum-edi",       repo: "Sum-edi" },           // guide written for the combined site
  { id: "do",            repo: "DO",                 guide: true },
];

// the repos' hal-logo.png is blurry: point every logo at the sharp tools/assets/hal-logo-hd.png (kept in this repo)
const sharpLogo = h => h.split('src="assets/hal-logo.png"').join('src="assets/hal-logo-hd.png"');
const raw = (repo, file) => `https://raw.githubusercontent.com/Rattanao/${repo}/HEAD/${file}`;
async function get(repo, file, binary) {
  const r = await fetch(raw(repo, file) + "?t=" + Date.now(), { cache: "no-store" });
  if (!r.ok) return null;
  return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
}
// write only when different, so git sees real changes only
function put(file, data) {
  const p = path.join(TOOLS, file);
  const old = fs.existsSync(p) ? fs.readFileSync(p) : null;
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  if (old && old.equals(buf)) return false;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
  return true;
}
async function assets(repo, text) {
  for (const a of new Set(text.match(/assets\/[\w.-]+\.(png|jpe?g|gif|svg|webp|pdf|ttf|otf|woff2?)/gi) || [])) {
    const b = await get(repo, a, true);
    if (b) { if (put(a, b)) console.log("  updated", a); }
    else console.log("  missing", a);
  }
}

(async () => {
  for (const t of SOURCES) {
    const page = await get(t.repo, "index.html");
    if (!page) { console.log(`SKIP ${t.id}: cannot read ${t.repo}/index.html`); continue; }
    let html = sharpLogo(page).replace("</head>", '<script src="embed.js"></script>\n</head>');
    if (t.guide) html = html.split('href="guide.html"').join(`href="guide-${t.id}.html"`);
    put(`${t.id}.html`, html);   // translated again below, so git only sees real upstream changes
    console.log(`copied ${t.repo} -> ${t.id}.html`);
    await assets(t.repo, page);
    for (const x of t.extra || []) {
      const b = await get(t.repo, x, true);
      if (b && put(x, b)) console.log("  updated", x);
    }
    if (t.guide) {
      const g = await get(t.repo, "guide.html");
      if (!g) { console.log(`  no guide.html in ${t.repo}`); continue; }
      const gh = sharpLogo(g).replace(/href="(\.\/|index\.html)"/g, `href="../#${t.id}"`)
                  .replace("</body>", '<script src="guide-lang.js"></script>\n</body>');
      if (put(`guide-${t.id}.html`, gh)) console.log(`  GUIDE CHANGED: guide-${t.id}.html — update build/guides-en/${t.id}.body and tools/guide-${t.id}-en.html`);
      await assets(t.repo, g);
    }
  }
  // English UI text; prints MISS / LEFT for text that changed upstream (pages still work, that text stays Thai)
  require("./translate-en.js");
})();
