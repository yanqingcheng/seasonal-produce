#!/usr/bin/env node
// Builds prototype/data.js from the UK pass-2 corpus in data/uk/.
// Everything the prototype shows about produce comes from here; nothing is authored by hand.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const IN_SEASON = new Set(["P", "I"]);
const WHEEL_COUNT = 21;

// Editorial "well-known in a UK kitchen" tier. It only ranks stickers; it is never shown as a fact.
// The corpus has no popularity field, so Stage 4 should replace this with real purchase or search data.
const STAPLES = new Set([
  "apple", "pear", "strawberry", "raspberry", "blackberry", "blueberry", "cherry", "plum", "rhubarb",
  "potatoes", "new potatoes", "jersey royals", "carrots", "onions", "leeks", "garlic", "cabbage", "cauliflower",
  "broccoli", "brussels sprouts", "kale", "spinach", "peas", "broad beans", "runner beans", "sweetcorn",
  "tomatoes", "cucumber", "courgette", "peppers", "pumpkin & squash", "butternut squash", "parsnips", "swede",
  "beetroot", "celery", "asparagus", "mushrooms (cultivated)",
  "lettuce & salad leaves", "spring onions", "radishes",
]);
const EVERYDAY_CATEGORIES = new Set(["vegetable", "fruit", "salad"]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function fail(msg) {
  console.error(`build-data: ${msg}`);
  process.exit(1);
}

const calendarRows = parseCsv(readFileSync(join(root, "data/uk/produce_calendar.csv"), "utf8"));
const recipeRows = parseCsv(readFileSync(join(root, "data/uk/recipes.csv"), "utf8"));

const items = calendarRows.map((r) => {
  const months = MONTHS.map((m) => r[m]);
  if (months.some((s) => !["P", "I", "T", "."].includes(s))) fail(`bad month state on ${r.item}`);
  const gridPeaks = MONTHS.filter((_, i) => months[i] === "P");
  const listedPeaks = r.peak_months ? r.peak_months.split(/\s+/) : [];
  if (listedPeaks.length && listedPeaks.join() !== gridPeaks.join()) {
    console.warn(`build-data: ${r.item} peak_months differs from grid P cells`);
  }
  return {
    item: r.item,
    category: r.category,
    months,
    peak_months: listedPeaks,
    stored_notes: r.stored_notes ? JSON.parse(r.stored_notes) : null,
    regions_notes: r.regions_notes || null,
    specialist_sources: r.specialist_sources ? r.specialist_sources.split(/;\s*/) : [],
  };
});
if (items.length !== 108) fail(`expected 108 items, got ${items.length}`);
const byName = new Map(items.map((it) => [it.item, it]));
for (const s of STAPLES) if (!byName.has(s)) fail(`staple "${s}" is not a calendar item`);

// Recipe strings use plurals and qualifiers ("blackberries (early)", "early apples").
function resolveIngredient(raw) {
  const qualifier = (raw.match(/\(([^)]*)\)/) || [])[1] || null;
  let name = raw.replace(/\([^)]*\)/g, "").trim().toLowerCase();
  const early = /^early\s+/.test(name);
  name = name.replace(/^early\s+/, "");
  const candidates = [name, name.replace(/ies$/, "y"), name.replace(/s$/, "")];
  const hit = candidates.find((c) => byName.has(c));
  if (!hit) fail(`recipe ingredient "${raw}" does not resolve to a calendar item`);
  return { item: hit, label: raw.trim(), qualifier: qualifier ?? (early ? "early" : null) };
}

const recipes = recipeRows.map((r) => {
  const monthIndex = MONTH_NAMES.findIndex((n) => n.toLowerCase() === r.month);
  if (monthIndex < 0) fail(`bad recipe month ${r.month}`);
  const produce = r.in_season_produce_used.split(/,\s*/).map(resolveIngredient);
  for (const p of produce) {
    const state = byName.get(p.item).months[monthIndex];
    if (!IN_SEASON.has(state)) fail(`${r.recipe}: ${p.item} is "${state}" in ${r.month}, expected P or I`);
  }
  return { month: monthIndex, title: r.recipe, produce, source_name: r.source_name, source_url: r.source_url };
});
if (recipes.length !== 12 || new Set(recipes.map((r) => r.month)).size !== 12) fail("expected one recipe per month");

function roundRobinByCategory(list) {
  const buckets = new Map();
  for (const it of list) {
    if (!buckets.has(it.category)) buckets.set(it.category, []);
    buckets.get(it.category).push(it);
  }
  const out = [];
  while (out.length < list.length) {
    for (const b of buckets.values()) if (b.length) out.push(b.shift());
  }
  return out;
}

const months = MONTHS.map((key, m) => {
  const state = (it, offset = 0) => it.months[(m + offset + 12) % 12];
  const peak = items.filter((it) => state(it) === "P");
  const inSeason = items.filter((it) => state(it) === "I");
  const edge = items.filter((it) => state(it) === "T");
  const recipe = recipes.find((r) => r.month === m);
  const stars = recipe.produce.map((p) => byName.get(p.item));

  // Wheel stickers put common, popular produce first (see DESIGN.md, "Busy active segment").
  // Items whose corpus note says UK supply is mostly imported never become stickers.
  const seasonLength = (it) => it.months.filter((s) => IN_SEASON.has(s)).length;
  const importFlagged = (it) => /import/i.test(it.regions_notes || "");
  const score = (it) =>
    (STAPLES.has(it.item) ? 4 : 0) +
    (stars.includes(it) ? 3 : 0) +
    (state(it) === "P" ? 2 : 0) +
    (EVERYDAY_CATEGORIES.has(it.category) ? 1 : 0);
  const buckets = new Map();
  for (const it of [...peak, ...inSeason].filter((x) => !importFlagged(x))) {
    const s = score(it);
    if (!buckets.has(s)) buckets.set(s, []);
    buckets.get(s).push(it);
  }
  const ranked = [...buckets.keys()].sort((a, b) => b - a).flatMap((s) =>
    roundRobinByCategory(buckets.get(s).sort((a, b) => seasonLength(a) - seasonLength(b))),
  );
  const wheel = ranked.slice(0, WHEEL_COUNT);
  for (const star of stars.filter((s) => !wheel.includes(s))) {
    const slot = wheel.findLastIndex((it) => !stars.includes(it));
    wheel[slot] = star;
  }

  const arrivals = [...peak, ...inSeason].filter((it) => !IN_SEASON.has(state(it, -1)));
  const farewells = [...peak, ...inSeason].filter((it) => !IN_SEASON.has(state(it, 1)) && !arrivals.includes(it));

  const categoryCounts = {};
  for (const it of peak) categoryCounts[it.category] = (categoryCounts[it.category] || 0) + 1;
  const [leadCategory, leadCount] = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    key,
    name: MONTH_NAMES[m],
    counts: { peak: peak.length, in: inSeason.length, edge: edge.length },
    lead: { category: leadCategory, count: leadCount },
    wheel: wheel.map((it) => it.item),
    peak: roundRobinByCategory(peak).map((it) => it.item),
    in: roundRobinByCategory(inSeason).map((it) => it.item),
    edge: edge.map((it) => it.item),
    arrivals: arrivals.slice(0, 4).map((it) => it.item),
    farewells: farewells.slice(0, 4).map((it) => it.item),
  };
});

const out = {
  generated_from: "data/uk (UK pass-2 corpus, 19 Sep 2026)",
  states: { P: "peak season", I: "in season (UK-grown available)", T: "edge of season or single-source", ".": "out of UK season" },
  monthKeys: MONTHS,
  items,
  recipes,
  months,
};

writeFileSync(
  join(root, "prototype/data.js"),
  `// Generated by scripts/build-data.mjs from data/uk/. Do not edit by hand.\nwindow.UK_WHEEL = ${JSON.stringify(out)};\n`,
);
console.log(`build-data: ${items.length} items, ${recipes.length} recipes, 12 months -> prototype/data.js`);
for (const mo of months) console.log(`  ${mo.key}: P${mo.counts.peak} I${mo.counts.in} T${mo.counts.edge} wheel=${mo.wheel.slice(0, 5).join(", ")} | ${mo.wheel.slice(5).join(", ")}`);
