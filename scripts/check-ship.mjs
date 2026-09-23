#!/usr/bin/env node
// Acceptance checks Stage 5 can automate. See ARCH.md §4 and §7.
import { readFileSync, mkdtempSync, cpSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPack, resolveIngredient } from "./build-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

const exhibit = readFileSync(join(root, "site/exhibit.js"), "utf8");
const html = readFileSync(join(root, "site/index.html"), "utf8");
const uk = JSON.parse(readFileSync(join(root, "site/data/uk.json"), "utf8"));
const registry = JSON.parse(readFileSync(join(root, "site/data/registry.json"), "utf8"));
const packFile = readFileSync(join(root, "data/uk/pack.json"), "utf8");
const built = buildPack("uk", { root });

check(uk.items.length === 107, `uk.json has ${uk.items.length} items, expected 107`);
check(!JSON.stringify(uk).toLowerCase().includes("cranberry"), "uk.json contains cranberry");
check(uk.items.some((it) => it.item === "pak choi"), "pak choi missing");
check(uk.items.some((it) => it.item === "samphire"), "samphire missing");
check(uk.items.some((it) => it.item === "radicchio"), "radicchio missing");
check(uk.id === "uk" && uk.timezone === "Europe/London", "pack id or timezone");
check(uk.recipes.length === 12 && new Set(uk.recipes.map((r) => r.month)).size === 12, "one recipe per month");
check(uk.months.every((m) => m.counts.peak > 0 && m.wheel.length <= 15 && m.quiet.length === 5), "month pools");
check(uk.months[3].counts.peak === 8, `April peak count ${uk.months[3].counts.peak}`);
check(!uk.items.some((it) => "peak_months" in it), "peak_months copied into runtime");
check(JSON.stringify(built.pack) === JSON.stringify(uk), "site/data/uk.json is stale; rerun the build");

const bannedKeys = new Set(["radius", "tint", "bloom", "r_out", "r_out_active"]);
const walk = (value, path) => {
  if (!value || typeof value !== "object") return;
  for (const [k, v] of Object.entries(value)) {
    if (bannedKeys.has(k.toLowerCase())) failures.push(`uk.json key ${path}.${k}`);
    walk(v, `${path}.${k}`);
  }
};
walk(uk, "uk");

check(Array.isArray(registry) && registry.length === 1 && registry[0].id === "uk" && registry[0].status === "shipped", "registry");
check(!exhibit.includes("Europe/London"), "exhibit script contains Europe/London");
check(!exhibit.includes("Gardeners"), "exhibit script contains the footer sentence");
check(!exhibit.includes("cranberry"), "exhibit script contains cranberry");
check(!html.includes("fonts.googleapis.com") && !html.includes("fonts.gstatic.com"), "page requests Google Fonts");
check(!html.includes("country-control") && !exhibit.includes("globe") && !exhibit.includes("GeoJSON"), "country chrome shipped in the source");
check(JSON.parse(packFile).sticker_exclude.length === 0, "sticker_exclude is not empty");
check(JSON.parse(packFile).expect_items === 107, "expect_items");

for (const item of uk.items) {
  const needle = item.item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`\\b${needle}\\b`).test(exhibit)) failures.push(`exhibit script contains item name ${item.item}`);
}

const names = new Map(uk.items.map((it) => [it.item.toLowerCase(), it.item]));
const alias = (raw) => resolveIngredient(raw, names, { aliasProfile: "en", aliases: new Map() });
const expectAlias = (raw, item, qualifier) => {
  const got = alias(raw);
  check(got && got.item === item && got.qualifier === qualifier && got.label === raw.trim(), `${raw} -> ${got && JSON.stringify(got)}`);
};
expectAlias("strawberries", "strawberry", null);
expectAlias("blackberries (early)", "blackberry", "early");
expectAlias("early apples", "apple", "early");
expectAlias("Jersey Royals (peak May-Jun)", "jersey royals", "peak May-Jun");
expectAlias("parsnips (best after first frosts)", "parsnips", "best after first frosts");
expectAlias("damsons", "damson", null);
expectAlias("chestnuts", "chestnut", null);

function expectFail(label, mutate) {
  const dir = mkdtempSync(join(tmpdir(), "pack-"));
  cpSync(join(root, "data/uk"), dir, { recursive: true });
  mutate(dir);
  let failed = false;
  try { buildPack("uk", { root, packDir: dir }); }
  catch { failed = true; }
  check(failed, `${label} should fail the build`);
}

expectFail("cranberry row", (dir) => {
  const file = join(dir, "produce_calendar.csv");
  writeFileSync(file, `${readFileSync(file, "utf8").trimEnd()}\ncranberry,fruit,.,.,.,.,.,.,.,.,.,I,P,P,nov dec,,no meaningful UK season,\n`);
});
expectFail("item count", (dir) => {
  const file = join(dir, "produce_calendar.csv");
  const lines = readFileSync(file, "utf8").trimEnd().split("\n");
  writeFileSync(file, `${lines.slice(0, -1).join("\n")}\n`);
});
expectFail("domestic-season note", (dir) => {
  const file = join(dir, "produce_calendar.csv");
  const text = readFileSync(file, "utf8").replace(
    "Harvest Aug-Nov; stored British apples available to May (controlled-atmosphere storage). Variety-level windows in apple_pear_varieties annex.",
    "no meaningful domestic season",
  );
  writeFileSync(file, text);
});

if (failures.length) {
  console.error(failures.map((f) => `check-ship: ${f}`).join("\n"));
  process.exit(1);
}
console.log("check-ship: ok");
