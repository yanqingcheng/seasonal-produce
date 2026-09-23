#!/usr/bin/env node
// Review-only. Checks art/bindings/{fr,es,on}.json against the vendored month grids in
// data/<id>/source/ and writes prototype/multi-pack.js for prototype/selector.html and
// prototype/stickers-fr-es-on.html. It is not the pack build: month lists here are a mock
// ordering from the grids, and nothing it writes is published from site/.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { archetypeIds, symbolPair } from "../art/draw.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const NEW_ARCHETYPES = ["slice", "grapes", "citrus", "banana", "avocado", "kiwi", "mango", "walnut"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SEASONS = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];

function csv(path) {
  const [head, ...lines] = readFileSync(join(root, path), "utf8").trim().split(/\r?\n/);
  const cols = head.split(",");
  return lines.map((line) => Object.fromEntries(line.split(",").map((v, i) => [cols[i], v])));
}

const fold = (s) => s.normalize("NFD").replace(/\p{M}/gu, "");
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s(/•-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());

// Each source becomes rows of { key, label, group, months[12] } where a month is "peak", "in" or null.
const SOURCES = {
  fr: () => {
    const rows = new Map();
    for (const r of csv("data/fr/source/fr_months.csv")) {
      const key = r.item_source_label.toLowerCase();
      if (!rows.has(key)) rows.set(key, { key, label: r.item_source_label, group: r.source_category, months: Array(12).fill(null) });
      if (r.is_in_season === "1") rows.get(key).months[Number(r.month) - 1] = "in";
    }
    return [...rows.values()];
  },
  es: () => {
    const rows = new Map();
    for (const r of csv("data/es/source/es_months.csv")) {
      const key = r.item.toLowerCase();
      if (!rows.has(key)) rows.set(key, { key, label: titleCase(r.item), group: r.grupo, months: Array(12).fill(null) });
      if (r.in_source_matrix === "1") rows.get(key).months[Number(r.month) - 1] = r.temporada_level === "MAYOR" ? "peak" : "in";
    }
    return [...rows.values()];
  },
  on: () => {
    const rows = new Map();
    for (const r of csv("data/on/source/on_months.csv")) {
      const key = r.produce_item.toLowerCase();
      if (!rows.has(key)) rows.set(key, { key, label: r.produce_item, group: r.produce_group, months: Array(12).fill(null) });
      if (r.available === "1") rows.get(key).months[MONTHS_EN.indexOf(r.month)] = "in";
    }
    return [...rows.values()];
  },
};

const PACK_META = {
  uk: { name: "United Kingdom", short: "UK", code: "UK", timezone: "Europe/London", scope: "Grown in the UK · UK pass-2 research corpus" },
  fr: { name: "France", short: "France", code: "FR", timezone: "Europe/Paris", scope: "Grown in France · ADEME Impact CO2 seasonal calendar" },
  es: { name: "Spain", short: "Spain", code: "ES", timezone: "Europe/Madrid", scope: "Grown in Spain · MAPA temporada calendars" },
  on: { name: "Canada – Ontario", short: "Ontario", code: "ON", timezone: "America/Toronto", scope: "Grown in Ontario, Canada · Foodland Ontario availability guide" },
};

const known = new Set(archetypeIds());
const problems = [];
const symbols = [];
const packs = {};
const bindingsById = {};

// UK: the shipped pack, unchanged.
{
  const uk = readJson("site/data/uk.json");
  const bindings = readJson("art/bindings/uk.json");
  bindingsById.uk = bindings;
  const names = {};
  for (const it of uk.items) {
    const b = bindings[it.item];
    symbols.push(symbolPair(it.item, b.archetype, b.colours));
    names[it.item] = { id: it.item, label: it.item[0].toUpperCase() + it.item.slice(1) };
  }
  packs.uk = {
    ...PACK_META.uk, id: "uk", title: uk.title, tagline: uk.tagline,
    months: uk.months.map((mo) => ({ name: mo.name, wheel: mo.wheel, quiet: mo.quiet, count: mo.counts.peak, countLabel: "at peak" })),
    names,
  };
}

for (const id of ["fr", "es", "on"]) {
  const rows = SOURCES[id]();
  const bindings = readJson(`art/bindings/${id}.json`);
  bindingsById[id] = bindings;
  const byKey = new Map(rows.map((r) => [r.key, r]));
  for (const [key, b] of Object.entries(bindings)) {
    if (!byKey.has(key)) problems.push(`${id}: binding "${key}" matches no source row`);
    if (!known.has(b.archetype)) problems.push(`${id}: "${key}" binds unknown archetype ${b.archetype}`);
  }
  const unbound = rows.filter((r) => !bindings[r.key]).map((r) => r.label);
  console.log(`${id}: ${rows.length} source rows, ${rows.length - unbound.length} bound; not bound (held or awaiting a drawing): ${unbound.join(", ") || "none"}`);

  const names = {};
  const live = rows.filter((r) => bindings[r.key]);
  for (const r of live) {
    const symbolName = `${id} ${fold(r.key)}`;
    symbols.push(symbolPair(symbolName, bindings[r.key].archetype, bindings[r.key].colours));
    names[symbolName] = { id: symbolName, label: r.label };
  }
  const idOf = (r) => `${id} ${fold(r.key)}`;
  const run = (r) => r.months.filter(Boolean).length;
  const ranked = MONTHS_EN.map((_, m) => live
    .filter((r) => r.months[m])
    .map((r, i) => ({ r, i, score: r.months[m] === "peak" ? 1 : 0 }))
    .sort((a, b) => b.score - a.score || run(a.r) - run(b.r) || a.i - b.i)
    .map(({ r }) => idOf(r)));

  // Same draft shape as DESIGN.md's quiet wedges: thinnest month first, one pick per turn, no repeats while possible.
  const quiet = ranked.map(() => []);
  const used = new Set();
  const order = [...ranked.keys()].sort((a, b) => ranked[a].length - ranked[b].length);
  for (let round = 0; round < 5; round++) {
    for (const m of order) {
      const pick = ranked[m].find((n) => !used.has(n) && !quiet[m].includes(n)) ?? ranked[m].find((n) => !quiet[m].includes(n));
      if (pick) { quiet[m].push(pick); used.add(pick); }
    }
  }
  packs[id] = {
    ...PACK_META[id], id, title: `The ${PACK_META[id].short} Year-Wheel`, tagline: "Spin through what's growing, month by month.",
    months: MONTHS_EN.map((name, m) => ({ name, wheel: ranked[m].slice(0, 15), quiet: quiet[m], count: ranked[m].length, countLabel: "in season" })),
    names,
  };
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const sheet = NEW_ARCHETYPES.map((kind) => ({
  kind,
  uses: ["fr", "es", "on"].flatMap((id) => Object.entries(bindingsById[id])
    .filter(([, b]) => b.archetype === kind)
    .map(([key]) => ({ pack: id, id: `${id} ${fold(key)}`, label: packs[id].names[`${id} ${fold(key)}`].label }))),
}));

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute"><defs>${symbols.join("").replace(/\s+/g, " ")}</defs></svg>`;
const out = `// Generated by scripts/build-mock-art.mjs. Review mock only; not a pack.\nwindow.MULTI = ${JSON.stringify({ sprite, seasons: SEASONS, order: ["uk", "fr", "es", "on"], packs, sheet })};\n`;
writeFileSync(join(root, "prototype", "multi-pack.js"), out);
console.log(`wrote prototype/multi-pack.js (${symbols.length / 1} symbol pairs, ${(out.length / 1024).toFixed(0)} KB)`);
