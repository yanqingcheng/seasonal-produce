#!/usr/bin/env node
// Contact sheet for sticker review. Renders every food in art/ARCHETYPES.md at
// wheel size and fact-sheet size, beside existing stickers from the bindings.
// Usage: [COMPARE=pack:item,...] [COLS=8] node scripts/sticker-sheet.mjs [out.png] [filter-regex]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { symbolPair, slug } from "../art/draw.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [out = "/opt/cursor/artifacts/screenshots/sticker-sheet.png", filter = ""] = process.argv.slice(2);

const md = readFileSync(join(root, "art/ARCHETYPES.md"), "utf8");
const entries = JSON.parse(md.match(/```json\n([\s\S]*?)\n```/)[1])
  .filter((e) => !e.existing && new RegExp(filter, "i").test(`${e.food} ${e.archetype}`));

const COMPARE = process.env.COMPARE
  ? process.env.COMPARE.split(",").map((pair) => pair.split(":"))
  : [["uk", "cucumber"], ["uk", "courgette"], ["uk", "plum"], ["uk", "apple"], ["uk", "cobnuts"], ["uk", "chestnut"],
    ["uk", "raspberry"], ["uk", "strawberry"], ["uk", "asparagus"], ["uk", "onions"], ["uk", "potatoes"], ["uk", "chillies"]];
const COLS = Number(process.env.COLS) || 8;
const existing = COMPARE.map(([pack, item]) => {
  const b = JSON.parse(readFileSync(join(root, "art/bindings", `${pack}.json`), "utf8"))[item];
  return { food: `${item} (existing)`, archetype: b.archetype, colours: b.colours };
});

const all = [...existing, ...entries].map((e, i) => ({ ...e, id: `s${i}-${slug(e.food)}` }));
const symbols = all.map((e) => symbolPair(e.id, e.archetype, e.colours)).join("\n");
const sticker = (id, px) => `<svg class="sticker" width="${px}" height="${px}" viewBox="-8 -8 116 116"><use href="#cut-${id}" class="sh"/><use href="#cut-${id}" class="cut"/><use href="#art-${id}"/></svg>`;
const cell = (e) => `<figure class="${e.food.includes("(existing)") ? "old" : ""}">${sticker(e.id, 180)}<div class="small">${sticker(e.id, 48)}${sticker(e.id, 28)}</div><figcaption>${e.food}<br><small>${e.archetype}</small></figcaption></figure>`;

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#fff7e8;font:14px/1.2 system-ui,sans-serif;color:#2b2340}
.grid{display:grid;grid-template-columns:repeat(${COLS},1fr);gap:14px}
figure{margin:0;background:#fffdf6;border:3px solid #2b2340;border-radius:14px;padding:8px;text-align:center}
figure.old{background:#e9e4f5}
.small{display:flex;justify-content:center;align-items:center;gap:10px;height:56px}
.sticker{overflow:visible}.sh{color:rgba(43,35,64,.2);transform:translate(0,5px)}.cut{color:#fff}
figcaption{font-weight:700}small{font-weight:400;color:#625879}
</style><svg width="0" height="0" style="position:absolute"><defs>${symbols}</defs></svg>
<div class="grid">${all.map(cell).join("")}</div>`;

const htmlPath = "/tmp/sticker-sheet.html";
writeFileSync(htmlPath, html);
mkdirSync(dirname(out), { recursive: true });
const rows = Math.ceil(all.length / COLS);
const res = spawnSync("node", [join(root, "scripts/shoot.mjs"), `file://${htmlPath}`, out, String(Math.round((1800 * COLS) / 8)), String(80 + rows * 300), "", "800"], { stdio: "inherit" });
process.exit(res.status ?? 1);
