#!/usr/bin/env node
// Acceptance checks the ship can automate.
import { readFileSync, mkdtempSync, cpSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleSite, buildPack, resolveIngredient } from "./build-data.mjs";
import { resolvePackId, searchForPack } from "../site/pack-id.js";

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

check(Array.isArray(registry) && registry.map((row) => `${row.id}:${row.status}`).join(",") === "uk:shipped,fr:shipped,es:shipped,on:shipped", "registry");
check(!exhibit.includes("Europe/London"), "exhibit script contains Europe/London");
check(!exhibit.includes("Europe/Paris") && !exhibit.includes("Europe/Madrid") && !exhibit.includes("America/Toronto"), "exhibit script contains a pack timezone");
check(!exhibit.includes("Gardeners"), "exhibit script contains the footer sentence");
check(!exhibit.includes("cranberry"), "exhibit script contains cranberry");
check(!html.includes("fonts.googleapis.com") && !html.includes("fonts.gstatic.com"), "page requests Google Fonts");
check(!html.includes("country-control") && !exhibit.includes("globe") && !exhibit.includes("GeoJSON"), "globe or hardcoded country chrome shipped");
check(exhibit.includes("resolvePackId"), "country query is not wired");
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
    "Harvest Aug-Nov; stored British apples available to May (controlled-atmosphere storage).",
    "no meaningful domestic season",
  );
  writeFileSync(file, text);
});

const site = assembleSite(root);
check(JSON.stringify(site.registry) === JSON.stringify(registry), "registry is stale; rerun the build");
check(readFileSync(join(root, "site/sprites.svg"), "utf8") === site.sprite, "sprites.svg is stale; rerun the build");
check(readFileSync(join(root, "site/og.svg"), "utf8") === site.og, "og.svg is stale; rerun the build");

const byId = Object.fromEntries(site.built.map((entry) => [entry.id, entry.pack]));
for (const id of ["uk", "fr", "es", "on"]) {
  const manifest = JSON.parse(readFileSync(join(root, "data", id, "pack.json"), "utf8"));
  const file = JSON.parse(readFileSync(join(root, "site/data", `${id}.json`), "utf8"));
  check(JSON.stringify(byId[id]) === JSON.stringify(file), `site/data/${id}.json is stale; rerun the build`);
  check(file.items.length === manifest.expect_items, `${id} has ${file.items.length} items, expected ${manifest.expect_items}`);
  check(file.id === id && file.timezone === manifest.timezone && file.name === manifest.name, `${id} id, name, or timezone`);
  check(file.items.every((it) => it.months.every((role) => ["peak", "in", "edge", "out"].includes(role))), `${id} role outside the four`);
  check(file.items.every((it) => it.months.some((role) => role !== "out")), `${id} row with no domestic month`);
  const roles = new Set(Object.values(manifest.state_roles));
  check([...roles].every((role) => ["peak", "in", "edge", "out"].includes(role)), `${id} state_roles`);
}

const fr = byId.fr;
const es = byId.es;
const on = byId.on;
check(fr.timezone === "Europe/Paris" && es.timezone === "Europe/Madrid" && on.timezone === "America/Toronto", "pack timezones");
check(on.id === "on" && on.name.includes("Ontario") && on.name !== "Canada", "Ontario is not a Canada-national pack");
check(fr.recipes.length === 0 && es.recipes.length === 0 && on.recipes.length === 0, "no invented recipes");
check(fr.items.every((it) => it.months.every((role) => role === "in" || role === "out")), "France invented a peak or edge");
check(on.items.every((it) => it.months.every((role) => role === "in" || role === "out")), "Ontario invented a peak or edge");
check(es.items.every((it) => it.months.every((role) => role !== "edge")) && es.items.some((it) => it.months.includes("peak")) && es.items.some((it) => it.months.includes("in")), "Spain role mapping");
check(es.months.every((mo) => mo.counts.peak > 0), "Spain month missing a mayor-comercialización cell");
check(fr.month_short?.[5] && fr.month_short[5] !== fr.month_short[6], "French June and July short labels collide");
check(JSON.parse(readFileSync(join(root, "data/fr/pack.json"), "utf8")).alias_profile === "none", "fr alias profile");
check(JSON.parse(readFileSync(join(root, "data/es/pack.json"), "utf8")).alias_profile === "none", "es alias profile");
check(JSON.parse(readFileSync(join(root, "data/on/pack.json"), "utf8")).alias_profile === "none", "on alias profile");

const named = (pack, item) => pack.items.some((it) => it.item === item);
const lowered = (pack) => pack.items.map((it) => it.item.toLowerCase());
for (const item of ["Ananas", "Avocat", "Banane", "Mangue (importée par avion)", "Mangue (importée par bateau)", "Fruit de la passion", "Champignon (morille crue)"]) {
  check(!lowered(fr).includes(item.toLowerCase()), `France still lists ${item}`);
}
check(named(fr, "melon") && named(fr, "pastèque") && named(fr, "cresson") && named(fr, "tomate"), "France domestic rows");
for (const item of ["plátano", "chirimoya", "kiwi"]) check(!named(es, item), `Spain sticker gap ${item} shipped without a drawing`);
check(named(es, "naranja") && named(es, "aguacate") && named(es, "mango") && named(es, "tomate"), "Spain domestic rows");
check(named(on, "Cranberries") && named(on, "Watermelon") && named(on, "Sweet Potatoes"), "Ontario domestic rows the UK pack does not grow");
check(named(on, "brussels sprouts") && !named(on, "Sprouts"), "Ontario sprouts held for art; Brussels sprouts stay");
check(!named(on, "Bitter Melon/Fuzzy Squash") && !named(on, "Garlic Scapes"), "Ontario sticker gaps shipped");
check(readFileSync(join(root, "STICKER_GAPS.md"), "utf8").includes("plátano") && readFileSync(join(root, "STICKER_GAPS.md"), "utf8").includes("Garlic Scapes"), "sticker gap list");

check(resolvePackId(null, registry) === "uk", "missing country falls back to uk");
check(resolvePackId("fr", registry) === "fr" && resolvePackId("es", registry) === "es" && resolvePackId("on", registry) === "on", "shipped country ids");
check(resolvePackId("ca", registry) === "uk" && resolvePackId("ontario", registry) === "uk" && resolvePackId("zz", registry) === "uk", "unknown country falls back to uk");
check(resolvePackId("fr", [{ id: "fr", status: "draft" }, { id: "uk", status: "shipped" }]) === "uk", "draft pack is not selectable");
check(resolvePackId("es", [{ id: "es", status: "ready" }]) === "es", "ready pack is selectable");
check(searchForPack("?country=cz&month=9", "uk") === "month=9", "unknown country stays in the query");
check(searchForPack("?country=cz", "uk") === "", "unknown country query is not cleared");
check(searchForPack("?country=fr&month=9", "fr") === "country=fr&month=9", "known country query");
check(searchForPack("?country=FR", "fr") === "", "mismatched country id is cleared");

const pageCss = readFileSync(join(root, "site/styles.css"), "utf8");
check(!exhibit.includes("thin_sheet") && !exhibit.includes("sheet-foot") && !pageCss.includes("sheet-foot"), "thin-sheet footer still shipped");
check(byId.uk.thin_sheet == null && byId.fr.thin_sheet == null && byId.es.thin_sheet == null && byId.on.thin_sheet == null, "thin_sheet still on a pack");
check(byId.uk.attribution === "BBC Good Food, Hubbub, BBC Gardeners’ World, Borough Kitchen, and specialist grower guides. Recipes are from BBC Good Food.", "uk attribution");
check(!/pass-2|research corpus|importée|pas un pic|harvest-date|ficha se queda|fiche s'arrête/i.test([byId.uk, byId.fr, byId.es, byId.on].map((p) => p.attribution).join("\n")), "attribution still explains a gap");
check(byId.fr.months.every((mo) => !mo.blurb.includes("aucun pic") && !mo.blurb.includes("<strong>0</strong>")), "France blurb names a missing peak");
check(byId.on.months.every((mo) => !mo.blurb.includes("peak level") && !mo.blurb.includes("does not use") && !mo.blurb.includes("<strong>0</strong>")), "Ontario blurb names a missing peak");
check(byId.fr.months[8].blurb.includes("35"), "France September count");

const jargon = /pass-2|pass-1|research corpus|Instinct|\bannex\b|\bARCH\b|\bINTENT\b|\bStage\b|thin_sheet|only has the month|that's all we show|fiche s'arrête|ficha se queda/;
for (const rel of ["site/exhibit.js", "site/index.html", "site/styles.css", "site/pack-id.js", "site/data/uk.json", "site/data/fr.json", "site/data/es.json", "site/data/on.json", "site/data/registry.json"]) {
  check(!jargon.test(readFileSync(join(root, rel), "utf8")), `${rel} has visitor-facing research jargon`);
}

if (failures.length) {
  console.error(failures.map((f) => `check-ship: ${f}`).join("\n"));
  process.exit(1);
}
console.log("check-ship: ok");
