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

check(Array.isArray(registry) && registry.map((row) => `${row.id}:${row.status}`).join(",") === "uk:shipped,fr:shipped,es:shipped,on:shipped,it:shipped,fl:shipped,ca:shipped,sc:shipped,sd:shipped,js:shipped,yn:shipped,hi:shipped,xj:shipped,jp:shipped", "registry");
check(!exhibit.includes("Europe/London"), "exhibit script contains Europe/London");
check(!exhibit.includes("Europe/Paris") && !exhibit.includes("Europe/Madrid") && !exhibit.includes("America/Toronto") && !exhibit.includes("Europe/Rome") && !exhibit.includes("America/New_York") && !exhibit.includes("Asia/Shanghai") && !exhibit.includes("Asia/Urumqi") && !exhibit.includes("Asia/Tokyo"), "exhibit script contains a pack timezone");
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
for (const id of ["uk", "fr", "es", "on", "it", "fl", "ca", "sc", "sd", "js", "yn", "hi", "xj", "jp"]) {
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
const it = byId.it;
const fl = byId.fl;
const ca = byId.ca;
check(fr.timezone === "Europe/Paris" && es.timezone === "Europe/Madrid" && on.timezone === "America/Toronto" && it.timezone === "Europe/Rome" && fl.timezone === "America/New_York" && ca.timezone === "America/Los_Angeles", "pack timezones");
check(on.id === "on" && on.name.includes("Ontario") && on.name !== "Canada", "Ontario is not a Canada-national pack");
check(fl.id === "fl" && fl.name === "Florida" && fl.name !== "United States" && fl.name !== "USA", "Florida is not a United States pack");
check(ca.id === "ca" && ca.name === "California" && ca.name !== "United States" && ca.name !== "USA", "California is not a United States pack");
const placeNames = { sc: "Sichuan", sd: "Shandong", js: "Jiangsu", yn: "Yunnan", hi: "Hainan", xj: "Xinjiang", jp: "Japan" };
for (const [id, name] of Object.entries(placeNames)) {
  const place = byId[id];
  check(place.id === id && place.name === name, `${id} id or name`);
  check(place.name !== "China" && place.name !== "USA" && place.name !== "United States", `${id} is not a national pack`);
  check(!place.title.includes("China") && !place.tagline.includes("China") && !place.tagline.includes("USA"), `${id} copy names a nation`);
  check(place.items.every((row) => row.regions_notes && row.regions_notes.startsWith("Harvest months for ")), `${id} region note`);
  check(place.items.every((row) => row.months.every((role) => role === "in" || role === "out")), `${id} invented a peak or edge`);
  check(place.months.every((mo) => !/\bpeak\b/i.test(mo.blurb) && !/does not use|gap|apology/i.test(mo.blurb)), `${id} blurb names a missing peak`);
  check(place.recipes.length === 0, `${id} invented recipes`);
  check(JSON.parse(readFileSync(join(root, "data", id, "pack.json"), "utf8")).alias_profile === "none", `${id} alias profile`);
}
check(byId.sc.timezone === "Asia/Shanghai" && byId.xj.timezone === "Asia/Urumqi" && byId.jp.timezone === "Asia/Tokyo", "Sichuan, Xinjiang, and Japan timezones");
check(byId.hi.id === "hi" && !registry.some((row) => row.id === "hn" || row.id === "cn"), "Hainan id is hi; no national China id");
check(it.id === "it" && it.name === "Italy", "Italy id or name");
check(fr.recipes.length === 0 && es.recipes.length === 0 && on.recipes.length === 0 && it.recipes.length === 0 && fl.recipes.length === 0 && ca.recipes.length === 0, "no invented recipes");
check(fr.items.every((it) => it.months.every((role) => role === "in" || role === "out")), "France invented a peak or edge");
check(on.items.every((it) => it.months.every((role) => role === "in" || role === "out")), "Ontario invented a peak or edge");
check(it.items.every((row) => row.months.every((role) => role === "in" || role === "out")), "Italy invented a peak or edge");
check(fl.items.every((row) => row.months.every((role) => role === "in" || role === "out")), "Florida invented a peak or edge");
check(ca.items.every((row) => row.months.every((role) => role === "in" || role === "out")), "California invented a peak or edge");
check(es.items.every((it) => it.months.every((role) => role !== "edge")) && es.items.some((it) => it.months.includes("peak")) && es.items.some((it) => it.months.includes("in")), "Spain role mapping");
check(es.months.every((mo) => mo.counts.peak > 0), "Spain month missing a mayor-comercialización cell");
check(fr.month_short?.[5] && fr.month_short[5] !== fr.month_short[6], "French June and July short labels collide");
check(JSON.parse(readFileSync(join(root, "data/fr/pack.json"), "utf8")).alias_profile === "none", "fr alias profile");
check(JSON.parse(readFileSync(join(root, "data/es/pack.json"), "utf8")).alias_profile === "none", "es alias profile");
check(JSON.parse(readFileSync(join(root, "data/on/pack.json"), "utf8")).alias_profile === "none", "on alias profile");
check(JSON.parse(readFileSync(join(root, "data/it/pack.json"), "utf8")).alias_profile === "none", "it alias profile");
check(JSON.parse(readFileSync(join(root, "data/fl/pack.json"), "utf8")).alias_profile === "none", "fl alias profile");
check(JSON.parse(readFileSync(join(root, "data/ca/pack.json"), "utf8")).alias_profile === "none", "ca alias profile");

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
check(named(it, "pomodori") && named(it, "arance") && named(it, "meloni") && named(it, "angurie") && !named(it, "kiwi"), "Italy domestic rows; kiwi held for a drawing");
const carciofi = it.items.find((row) => row.item === "carciofi");
check(carciofi && carciofi.months[5] === "out" && carciofi.months.slice(0, 4).every((role) => role === "in"), "Italy dropped the isolated carciofi June shoulder");
check(named(fl, "Orange") && named(fl, "Avocado") && named(fl, "mango") && named(fl, "Watermelon") && named(fl, "Pineberry") && named(fl, "strawberry") && !named(fl, "Peanut") && !named(fl, "Strawberry"), "Florida domestic rows; peanut held for a drawing");
const watermelon = fl.items.find((row) => row.item === "Watermelon");
check(watermelon && watermelon.months[2] === "in" && watermelon.months[6] === "in" && watermelon.months[7] === "out" && watermelon.months[9] === "in", "Florida keeps both watermelon windows");
check(fl.months[7].counts.in === 3 && fl.months[7].in.length === 3, "Florida August is the short calendar month");
check(named(fl, "Kumquat") && !named(fl, "Jujube") && !named(fl, "Pummelo") && !named(fl, "Guava") && !named(fl, "Papaya") && !named(fl, "Passion fruit"), "Florida IFAS kumquat ships; jujube and pummelo stay off the wheel");
const jpPeach = byId.jp.items.find((row) => row.item === "peach");
check(jpPeach && jpPeach.months[4] === "out" && jpPeach.months.slice(5, 9).every((role) => role === "in") && jpPeach.months[9] === "out", "Japan peach is the Yamanashi June–September window");
check(["Tomato", "Carrot", "Bell Pepper", "Taro", "broccoli", "celery", "Peas (Snow)", "Green bean", "Turnip", "Chinese chives", "Shiranui / dekopon"].every((item) => named(byId.jp, item)), "Japan v0.3 rows with stickers");
check(!named(byId.jp, "Okra") && !named(byId.jp, "Ginger") && !named(byId.jp, "Oyster"), "Japan rows without stickers stay off the wheel");
const orange = ca.items.find((row) => row.item === "Orange");
check(orange && orange.months[0] === "in" && orange.months[4] === "in" && orange.months[5] === "out" && orange.months[6] === "out" && orange.months[10] === "in", "California orange keeps the longer navel window");
const broccoli = ca.items.find((row) => row.item === "broccoli");
check(broccoli && broccoli.months[0] === "in" && broccoli.months[2] === "out" && broccoli.months[8] === "in", "California broccoli keeps the longer window");
const tomato = ca.items.find((row) => row.item === "Tomato");
check(tomato && tomato.months[5] === "in" && tomato.months[7] === "in" && tomato.months[8] === "out", "California tomato keeps the first window when the counts tie");
const sweetPotatoes = ca.items.find((row) => row.item === "Sweet Potatoes");
check(sweetPotatoes && sweetPotatoes.months[1] === "out" && sweetPotatoes.months[10] === "in" && sweetPotatoes.months[11] === "in", "California sweet potatoes keep the first window when the counts tie");
const artichoke = ca.items.find((row) => row.item === "Artichoke");
check(artichoke && artichoke.months.every((role) => role === "in"), "California artichoke stays in season all year");
check(named(ca, "Orange") && named(ca, "Grape") && named(ca, "Tomato") && named(ca, "garlic") && named(ca, "fig") && !named(ca, "Almond") && !named(ca, "Walnut") && !named(ca, "Kiwifruit") && !named(ca, "Pistachio") && !named(ca, "Date") && !named(ca, "Olive") && !named(ca, "Pecan"), "California domestic rows; nuts, kiwi, date, and olive held for a drawing");
check(ca.months[6].counts.in === 13, "California July in-season count");
const gaps = readFileSync(join(root, "STICKER_GAPS.md"), "utf8");
check(gaps.includes("plátano") && gaps.includes("Garlic Scapes") && gaps.includes("kiwi") && gaps.includes("Peanut") && gaps.includes("## California (`ca`)") && gaps.includes("### Pistachio") && gaps.includes("### Kiwifruit") && gaps.includes("### Jujube") && gaps.includes("### Pummelo"), "sticker gap list");

check(resolvePackId(null, registry) === "uk", "missing country falls back to uk");
check(resolvePackId("fr", registry) === "fr" && resolvePackId("es", registry) === "es" && resolvePackId("on", registry) === "on" && resolvePackId("it", registry) === "it" && resolvePackId("fl", registry) === "fl" && resolvePackId("ca", registry) === "ca", "shipped country ids");
check(["sc", "sd", "js", "yn", "hi", "xj", "jp"].every((id) => resolvePackId(id, registry) === id), "new place ids");
check(resolvePackId("ontario", registry) === "uk" && resolvePackId("zz", registry) === "uk" && resolvePackId("us", registry) === "uk" && resolvePackId("usa", registry) === "uk" && resolvePackId("us-fl", registry) === "uk" && resolvePackId("california", registry) === "uk" && resolvePackId("cn", registry) === "uk" && resolvePackId("china", registry) === "uk" && resolvePackId("China", registry) === "uk" && resolvePackId("CN", registry) === "uk" && resolvePackId("hn", registry) === "uk", "unknown country falls back to uk");
check(resolvePackId("fr", [{ id: "fr", status: "draft" }, { id: "uk", status: "shipped" }]) === "uk", "draft pack is not selectable");
check(resolvePackId("es", [{ id: "es", status: "ready" }]) === "es", "ready pack is selectable");
check(searchForPack("?country=cz&month=9", "uk") === "month=9", "unknown country stays in the query");
check(searchForPack("?country=cz", "uk") === "", "unknown country query is not cleared");
check(searchForPack("?country=fr&month=9", "fr") === "country=fr&month=9", "known country query");
check(searchForPack("?country=FR", "fr") === "", "mismatched country id is cleared");

const pageCss = readFileSync(join(root, "site/styles.css"), "utf8");
check(!exhibit.includes("thin_sheet") && !exhibit.includes("sheet-foot") && !pageCss.includes("sheet-foot"), "thin-sheet footer still shipped");
check(byId.uk.thin_sheet == null && byId.fr.thin_sheet == null && byId.es.thin_sheet == null && byId.on.thin_sheet == null && byId.it.thin_sheet == null && byId.fl.thin_sheet == null && byId.ca.thin_sheet == null && ["sc", "sd", "js", "yn", "hi", "xj", "jp"].every((id) => byId[id].thin_sheet == null), "thin_sheet still on a pack");
check(byId.uk.attribution === "BBC Good Food, Hubbub, BBC Gardeners’ World, Borough Kitchen, and specialist grower guides. Recipes are from BBC Good Food.", "uk attribution");
check(!/pass-2|research corpus|importée|pas un pic|harvest-date|ficha se queda|fiche s'arrête/i.test([byId.uk, byId.fr, byId.es, byId.on, byId.it, byId.fl].map((p) => p.attribution).join("\n")), "attribution still explains a gap");
check(byId.fr.months.every((mo) => !mo.blurb.includes("aucun pic") && !mo.blurb.includes("<strong>0</strong>")), "France blurb names a missing peak");
check(byId.on.months.every((mo) => !mo.blurb.includes("peak level") && !mo.blurb.includes("does not use") && !mo.blurb.includes("<strong>0</strong>")), "Ontario blurb names a missing peak");
check(byId.it.months.every((mo) => !mo.blurb.includes("picco") && !mo.blurb.includes("<strong>0</strong>")), "Italy blurb names a missing peak");
check(byId.fl.months.every((mo) => !/\bpeak\b/i.test(mo.blurb) && !mo.blurb.includes("does not use") && !mo.blurb.includes("<strong>0</strong>")), "Florida blurb names a missing peak");
check(byId.ca.months.every((mo) => !/\bpeak\b/i.test(mo.blurb) && !/does not use|gap|apology/i.test(mo.blurb) && !mo.blurb.includes("<strong>0</strong>")), "California blurb names a missing peak");
check(byId.fr.months[8].blurb.includes("35"), "France September count");

const jargon = /pass-2|pass-1|research corpus|Instinct|\bannex\b|\bARCH\b|\bINTENT\b|\bStage\b|thin_sheet|only has the month|that's all we show|fiche s'arrête|ficha se queda/;
for (const rel of ["site/exhibit.js", "site/index.html", "site/styles.css", "site/pack-id.js", "site/data/uk.json", "site/data/fr.json", "site/data/es.json", "site/data/on.json", "site/data/it.json", "site/data/fl.json", "site/data/ca.json", "site/data/sc.json", "site/data/sd.json", "site/data/js.json", "site/data/yn.json", "site/data/hi.json", "site/data/xj.json", "site/data/jp.json", "site/data/registry.json"]) {
  check(!jargon.test(readFileSync(join(root, rel), "utf8")), `${rel} has visitor-facing research jargon`);
}

if (failures.length) {
  console.error(failures.map((f) => `check-ship: ${f}`).join("\n"));
  process.exit(1);
}
console.log("check-ship: ok");
