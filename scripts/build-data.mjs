#!/usr/bin/env node
// Shared country-pack builder. `node scripts/build-data.mjs <id>`
// reads data/<id>/ and writes site/data/<id>.json, site/data/registry.json,
// site/sprites.svg, and site/og.svg.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { archetypeIds, symbolPair } from "../art/draw.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const WHEEL_COUNT = 15;
const QUIET_COUNT = 5;
const ROLES = ["peak", "in", "edge", "out"];

export function parseCsv(text) {
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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fill(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

function escText(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function capital(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** English alias steps from ARCH §4. `byName` keys are lowercase item names. */
export function resolveIngredient(raw, byName, { aliasProfile, aliases }) {
  const original = raw.trim();
  const paren = original.match(/\(([^)]*)\)/);
  let qualifier = paren ? paren[1] : null;
  let name = original.replace(/\([^)]*\)/g, "").trim().toLowerCase();
  if (aliases?.has(name)) {
    const hit = aliases.get(name);
    if (!byName.has(hit)) return null;
    return { item: byName.get(hit), label: original, qualifier };
  }
  if (aliasProfile === "en") {
    const early = /^early\s+/.test(name);
    name = name.replace(/^early\s+/, "");
    if (early && qualifier == null) qualifier = "early";
    const candidates = [name, name.replace(/ies$/, "y"), name.replace(/s$/, "")];
    const hit = candidates.find((c) => byName.has(c));
    if (!hit) return null;
    return { item: byName.get(hit), label: original, qualifier };
  }
  if (!byName.has(name)) return null;
  return { item: byName.get(name), label: original, qualifier };
}

function interleave(list) {
  const buckets = new Map();
  for (const it of list) {
    if (!buckets.has(it.category)) buckets.set(it.category, []);
    buckets.get(it.category).push(it);
  }
  const out = [];
  let pending = true;
  while (pending) {
    pending = false;
    for (const bucket of buckets.values()) {
      if (bucket.length) { out.push(bucket.shift()); pending = true; }
    }
  }
  return out;
}

function rankCandidates(list, score, seasonLength) {
  const byScore = new Map();
  for (const it of list) {
    const s = score(it);
    if (!byScore.has(s)) byScore.set(s, []);
    byScore.get(s).push(it);
  }
  const ranked = [];
  for (const s of [...byScore.keys()].sort((a, b) => b - a)) {
    const byLen = new Map();
    for (const it of byScore.get(s)) {
      const len = seasonLength(it);
      if (!byLen.has(len)) byLen.set(len, []);
      byLen.get(len).push(it);
    }
    for (const len of [...byLen.keys()].sort((a, b) => a - b)) {
      ranked.push(...interleave(byLen.get(len)));
    }
  }
  return ranked;
}

function composeBlurb(month, prev, months, itemsByName, categories, blurb) {
  const total = (m) => m.counts.peak + m.counts.in;
  const totals = months.map(total);
  const change = total(month) - total(prev);
  const threshold = blurb.change_threshold ?? 8;
  let trend;
  if (total(month) === Math.max(...totals)) trend = blurb.fullest;
  else if (total(month) === Math.min(...totals)) trend = blurb.leanest;
  else if (change >= threshold) trend = fill(blurb.filling, { n: change, prev: escText(prev.name) });
  else if (change <= -threshold) trend = fill(blurb.winding, { n: -change, prev: escText(prev.name) });
  else trend = fill(blurb.same, { prev: escText(prev.name) });
  const counts = fill(blurb.counts, {
    month: escText(month.name),
    peak: `<strong>${month.counts.peak}</strong>`,
    in: `<strong>${month.counts.in}</strong>`,
  });
  if (!month.lead) return `${counts} ${trend}`;
  const fruitPeaks = month.peak.filter((n) => itemsByName.get(n).category === "fruit").length;
  const plural = categories.find((c) => c.id === month.lead.category)?.plural ?? month.lead.category;
  const lead = escText(capital(plural));
  const mix = fruitPeaks === 0
    ? fill(blurb.lead_none, { lead, count: month.lead.count, peak: month.counts.peak })
    : fruitPeaks === 1
      ? fill(blurb.lead_fruit_one, { lead, count: month.lead.count, peak: month.counts.peak })
      : fill(blurb.lead_fruit, { lead, count: month.lead.count, peak: month.counts.peak, n: fruitPeaks });
  return `${counts} ${trend} ${mix}`;
}

/**
 * Validate one pack and return the runtime document plus sprite markup.
 * Throws an Error whose message lists every failed check.
 */
export function buildPack(id, { root = repoRoot, packDir } = {}) {
  const dir = packDir ?? join(root, "data", id);
  const errors = [];
  const fail = (msg) => errors.push(msg);
  const manifest = readJson(join(dir, "pack.json"));
  const copy = readJson(join(dir, "copy.json"));
  if (manifest.id !== id) fail(`pack.json id is ${manifest.id}, expected ${id}`);
  if (!Array.isArray(manifest.month_names) || manifest.month_names.length !== 12) fail("month_names must have 12 entries");
  if (!Array.isArray(manifest.seasons) || manifest.seasons.length !== 12) fail("seasons must have 12 entries");
  const roleByLetter = manifest.state_roles ?? {};
  for (const role of Object.values(roleByLetter)) {
    if (!ROLES.includes(role)) fail(`state_roles maps to unknown role ${role}`);
  }
  const categories = manifest.categories ?? [];
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const everyday = new Set(categories.filter((c) => c.everyday).map((c) => c.id));

  const calendarRows = parseCsv(readFileSync(join(dir, "produce_calendar.csv"), "utf8"));
  const seen = new Set();
  const items = [];
  for (const r of calendarRows) {
    if (!r.item) { fail("calendar row missing item"); continue; }
    if (seen.has(r.item)) fail(`duplicate item ${r.item}`);
    seen.add(r.item);
    if (r.item.toLowerCase() === "cranberry") fail("cranberry is not a domestic season and must not be a row");
    if (!categoryById.has(r.category)) fail(`${r.item} has unknown category ${r.category}`);
    const letters = MONTH_KEYS.map((m) => r[m]);
    if (letters.some((s) => !(s in roleByLetter))) fail(`bad month state on ${r.item}`);
    const months = letters.map((s) => roleByLetter[s]);
    const gridPeaks = MONTH_KEYS.filter((_, i) => months[i] === "peak");
    const listedPeaks = r.peak_months ? r.peak_months.split(/\s+/).filter(Boolean) : [];
    if (listedPeaks.length && listedPeaks.join() !== gridPeaks.join()) {
      fail(`${r.item} peak_months disagrees with peak-role cells`);
    }
    if (/no meaningful\s+(uk|domestic)\s+season/i.test(r.regions_notes || "")) {
      fail(`${r.item} regions note says there is no meaningful domestic season`);
    }
    let stored = null;
    if (r.stored_notes) {
      try { stored = JSON.parse(r.stored_notes); }
      catch { fail(`${r.item} stored_notes is not JSON`); }
    }
    items.push({
      item: r.item,
      category: r.category,
      months,
      stored_notes: stored,
      regions_notes: r.regions_notes || null,
      specialist_sources: r.specialist_sources ? r.specialist_sources.split(/;\s*/).filter(Boolean) : [],
    });
  }
  if (manifest.expect_items != null && items.length !== manifest.expect_items) {
    fail(`expected ${manifest.expect_items} items, got ${items.length}`);
  }
  const byName = new Map(items.map((it) => [it.item, it]));
  const byLower = new Map(items.map((it) => [it.item.toLowerCase(), it.item]));

  const staplesPath = join(dir, "staples.txt");
  const staples = new Set();
  if (existsSync(staplesPath)) {
    for (const line of readFileSync(staplesPath, "utf8").split(/\r?\n/)) {
      const name = line.trim();
      if (!name || name.startsWith("#")) continue;
      if (!byName.has(name)) fail(`staple "${name}" is not a calendar item`);
      staples.add(name);
    }
  }
  const exclude = new Set(manifest.sticker_exclude ?? []);
  for (const name of exclude) {
    if (!byName.has(name)) fail(`sticker_exclude "${name}" is not a calendar item`);
  }

  const aliasPath = join(dir, "aliases.csv");
  const aliases = new Map();
  if (existsSync(aliasPath)) {
    for (const row of parseCsv(readFileSync(aliasPath, "utf8"))) {
      const from = (row.from || "").trim().toLowerCase();
      const item = (row.item || "").trim();
      if (!from || !byName.has(item)) fail(`alias "${row.from}" misses calendar item "${row.item}"`);
      else aliases.set(from, item.toLowerCase());
    }
  }

  const recipePath = join(dir, "recipes.csv");
  const recipeRows = existsSync(recipePath) ? parseCsv(readFileSync(recipePath, "utf8")) : [];
  const recipes = [];
  const recipeMonths = new Set();
  for (const r of recipeRows) {
    const monthIndex = manifest.month_names.findIndex((n) => n.toLowerCase() === String(r.month).toLowerCase());
    if (monthIndex < 0) { fail(`bad recipe month ${r.month}`); continue; }
    if (recipeMonths.has(monthIndex)) fail(`more than one recipe for ${r.month}`);
    recipeMonths.add(monthIndex);
    const parts = r.in_season_produce_used ? r.in_season_produce_used.split(/,\s*/) : [];
    const produce = [];
    for (const raw of parts) {
      const resolved = resolveIngredient(raw, byLower, { aliasProfile: manifest.alias_profile, aliases });
      if (!resolved) { fail(`recipe ingredient "${raw}" does not resolve to a calendar item`); continue; }
      const state = byName.get(resolved.item).months[monthIndex];
      if (state !== "peak" && state !== "in") {
        fail(`${r.recipe}: ${resolved.item} is "${state}" in ${r.month}, expected peak or in season`);
      }
      produce.push(resolved);
    }
    recipes.push({
      month: monthIndex,
      title: r.recipe,
      produce,
      source_name: r.source_name,
      source_url: r.source_url,
    });
  }
  if (manifest.recipe_rule === "one_per_month") {
    for (let m = 0; m < 12; m++) {
      if (!recipeMonths.has(m)) fail(`missing recipe for ${manifest.month_names[m]}`);
    }
  }

  const bindingPath = join(root, "art", "bindings", `${id}.json`);
  if (!existsSync(bindingPath)) fail(`missing art bindings art/bindings/${id}.json`);
  const bindings = existsSync(bindingPath) ? readJson(bindingPath) : {};
  const knownArchetypes = new Set(archetypeIds());
  for (const it of items) {
    const binding = bindings[it.item];
    if (!binding) fail(`${it.item} has no archetype binding`);
    else if (!knownArchetypes.has(binding.archetype)) fail(`${it.item} binds unknown archetype ${binding.archetype}`);
  }

  if (errors.length) {
    const error = new Error(errors.map((e) => `build-data: ${e}`).join("\n"));
    error.errors = errors;
    throw error;
  }

  const role = (it, m, offset = 0) => it.months[(m + offset + 12) % 12];
  const seasonLength = (it) => it.months.filter((s) => s === "peak" || s === "in").length;
  const rankedByMonth = [];
  const months = MONTH_KEYS.map((key, m) => {
    const peak = items.filter((it) => role(it, m) === "peak");
    const inSeason = items.filter((it) => role(it, m) === "in");
    const edge = items.filter((it) => role(it, m) === "edge");
    const recipe = recipes.find((r) => r.month === m);
    const stars = (recipe?.produce ?? []).map((p) => byName.get(p.item));
    const score = (it) =>
      (staples.has(it.item) ? 4 : 0) +
      (stars.includes(it) ? 3 : 0) +
      (role(it, m) === "peak" ? 2 : 0) +
      (everyday.has(it.category) ? 1 : 0);
    const pool = [...peak, ...inSeason].filter((it) => !exclude.has(it.item));
    const ranked = rankCandidates(pool, score, seasonLength);
    rankedByMonth.push(ranked);
    const wheel = ranked.slice(0, WHEEL_COUNT);
    for (const star of stars.filter((s) => s && !exclude.has(s.item) && !wheel.includes(s))) {
      const slot = wheel.findLastIndex((it) => !stars.includes(it));
      if (slot >= 0) wheel[slot] = star;
    }
    const arrivals = [...peak, ...inSeason].filter((it) => role(it, m, -1) !== "peak" && role(it, m, -1) !== "in");
    const farewells = [...peak, ...inSeason].filter((it) => {
      const next = role(it, m, 1);
      return next !== "peak" && next !== "in" && !arrivals.includes(it);
    });
    const categoryCounts = new Map();
    for (const it of peak) categoryCounts.set(it.category, (categoryCounts.get(it.category) || 0) + 1);
    let lead = null;
    for (const [category, count] of categoryCounts) {
      if (!lead || count > lead.count) lead = { category, count };
    }
    if (!lead && manifest.require_peak_every_month) {
      throw new Error(`build-data: ${manifest.month_names[m]} has no peak-role item`);
    }
    return {
      key,
      name: manifest.month_names[m],
      counts: { peak: peak.length, in: inSeason.length, edge: edge.length },
      lead,
      wheel: wheel.map((it) => it.item),
      peak: peak.map((it) => it.item),
      in: inSeason.map((it) => it.item),
      edge: edge.map((it) => it.item),
      arrivals: arrivals.slice(0, 4).map((it) => it.item),
      farewells: farewells.slice(0, 4).map((it) => it.item),
    };
  });

  const quietUses = new Map();
  const use = (m, item) => {
    months[m].quiet.push(item);
    quietUses.set(item, (quietUses.get(item) || 0) + 1);
  };
  months.forEach((mo, m) => {
    mo.quiet = [];
    const recipe = recipes.find((r) => r.month === m);
    for (const p of recipe?.produce ?? []) {
      if (exclude.has(p.item) || mo.quiet.includes(p.item) || mo.quiet.length >= QUIET_COUNT) continue;
      use(m, p.item);
    }
  });
  const draftOrder = MONTH_KEYS.map((_, i) => i).sort((a, b) => rankedByMonth[a].length - rankedByMonth[b].length || a - b);
  for (let round = 0; round < QUIET_COUNT; round++) {
    for (const m of draftOrder) {
      const quiet = months[m].quiet;
      if (quiet.length >= QUIET_COUNT) continue;
      const options = rankedByMonth[m].map((it) => it.item).filter((n) => !quiet.includes(n));
      if (!options.length) continue;
      const least = Math.min(...options.map((n) => quietUses.get(n) || 0));
      use(m, options.find((n) => (quietUses.get(n) || 0) === least));
    }
  }
  for (const [m, mo] of months.entries()) {
    const rank = new Map(rankedByMonth[m].map((it, i) => [it.item, i]));
    mo.quiet.sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999));
  }
  const quietRepeats = [...quietUses].filter(([, n]) => n > 1);

  for (let m = 0; m < 12; m++) {
    const prev = months[(m + 11) % 12];
    months[m].blurb = composeBlurb(months[m], prev, months, byName, categories, copy.blurb);
  }

  const pack = {
    id: manifest.id,
    name: manifest.name,
    locale: manifest.locale,
    timezone: manifest.timezone,
    title: manifest.title,
    tagline: manifest.tagline,
    month_names: manifest.month_names,
    seasons: manifest.seasons,
    categories: categories.map(({ id: categoryId, label, one, plural }) => ({ id: categoryId, label, one, plural })),
    attribution: manifest.attribution,
    thin_sheet: manifest.thin_sheet,
    copy,
    items,
    recipes,
    months,
  };
  const symbols = items.map((it) => {
    const binding = bindings[it.item];
    return symbolPair(it.item, binding.archetype, binding.colours);
  });
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" id="sprite-root">\n<defs>\n${symbols.join("\n")}\n</defs>\n</svg>\n`;
  return { pack, sprite, quietRepeats, registryName: manifest.name };
}

function ogSvg(sprite) {
  const defs = sprite.match(/<defs>[\s\S]*<\/defs>/)?.[0] ?? "<defs></defs>";
  const ids = [...sprite.matchAll(/id="(art-[^"]+)"/g)].map((m) => m[1]);
  const picks = [0, 8, 16, 24, 32, 40].map((i) => ids[i]).filter(Boolean);
  const uses = picks.map((id, i) => {
    const x = 150 + i * 160;
    return `<use href="#${id}" x="${x}" y="180" width="130" height="130"/>`;
  }).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff7e8"/>
  <circle cx="600" cy="250" r="210" fill="#fff3dd" stroke="#2b2340" stroke-width="8"/>
  ${defs}
  ${uses}
  <text x="600" y="500" text-anchor="middle" font-family="Nunito, sans-serif" font-size="54" font-weight="800" fill="#2b2340">The year-wheel</text>
  <text x="600" y="555" text-anchor="middle" font-family="Nunito, sans-serif" font-size="28" font-weight="700" fill="#625879">What's growing, month by month</text>
</svg>
`;
}

function writeOutputs(root, id, built) {
  const dataDir = join(root, "site", "data");
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, `${id}.json`), `${JSON.stringify(built.pack, null, 2)}\n`);
  const registry = [{ id, name: built.registryName, status: "shipped" }];
  writeFileSync(join(dataDir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
  writeFileSync(join(root, "site", "sprites.svg"), built.sprite);
  writeFileSync(join(root, "site", "og.svg"), ogSvg(built.sprite));
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const id = process.argv[2];
  if (!id) {
    console.error("usage: node scripts/build-data.mjs <pack-id>");
    process.exit(1);
  }
  try {
    const built = buildPack(id);
    writeOutputs(repoRoot, id, built);
    const { pack, quietRepeats } = built;
    console.log(`build-data: ${pack.items.length} items, ${pack.recipes.length} recipes -> site/data/${id}.json`);
    for (const mo of pack.months) {
      console.log(`  ${mo.key}: peak ${mo.counts.peak} in ${mo.counts.in} edge ${mo.counts.edge}`);
    }
    console.log(`  quiet-wedge repeats: ${quietRepeats.length ? quietRepeats.map(([n, k]) => `${n} x${k}`).join(", ") : "none"}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
