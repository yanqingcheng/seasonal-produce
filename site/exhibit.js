// Shared year-wheel. One screen, painted from a country pack.
import { resolvePackId, searchForPack } from "./pack-id.js";

const TINTS = ["#cfe0ff", "#ddd3ff", "#d3f2c4", "#c2ecad", "#e2f59c", "#fff09a", "#ffe07a", "#ffcf7a", "#ffbd7e", "#ffab88", "#f6b3aa", "#dccff2"];
const LEGEND = {
  vegetable: "#3bb273",
  fruit: "#ff5a4e",
  herb: "#2f7d74",
  salad: "#a8e05a",
  nut: "#b0703f",
  "foraged/wild": "#8e4dd6",
};
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const lerp = (a, b, t) => a + (b - a) * t;
const R_IN = 150, R_OUT = 442, R_OUT_ACTIVE = 690, R_LABEL = 478, R_LABEL_ACTIVE = 728;
const HW = 15, LABEL_GROW = 34 / 30;
const REACH_FULL = 4, REACH_NONE = 16;
const QUIET_SLOTS = [[215, 0, 92], [300, -0.547, 76], [300, 0.547, 76], [388, -0.533, 88], [388, 0.533, 88]];
const ACTIVE_ROWS = [
  { r: 222, n: 1, spread: 0, size: 84 }, { r: 302, n: 2, spread: 0.5, size: 72 }, { r: 386, n: 2, spread: 0.52, size: 88 },
  { r: 470, n: 3, spread: 0.62, size: 72 }, { r: 555, n: 3, spread: 0.64, size: 84 }, { r: 640, n: 4, spread: 0.7, size: 72 },
];
const ROW_PENALTY = [0.1, 0.05, 0, 0.1, 0.2, 0.35];
const ACTIVE_SLOTS = ACTIVE_ROWS.flatMap(({ r, n, spread, size }, row) =>
  Array.from({ length: n }, (_, k) => [r, n === 1 ? 0 : lerp(-spread, spread, k / (n - 1)), size, row]))
  .sort((a, b) => Math.abs(a[1]) + ROW_PENALTY[a[3]] - (Math.abs(b[1]) + ROW_PENALTY[b[3]]));
const SPRINGS = { spin: [8, 0.62, 0.8], grow: [11, 0.7] };
const INTRO_SPRINGS = { spin: [4.6, 0.78, 0.78], grow: [7, 0.8] };

const $ = (sel, root = document) => root.querySelector(sel);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
};
const f1 = (v) => v.toFixed(1);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fillTpl = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sticker(item, attrs = "") {
  const id = slug(item);
  return `<svg class="sticker" viewBox="-8 -8 116 116" ${attrs} aria-hidden="true"><use href="#cut-${id}" class="sticker-shadow"/><use href="#cut-${id}" class="sticker-cut"/><use href="#art-${id}"/></svg>`;
}

function wedge(c, hw, rOut) {
  const a0 = c - hw + 0.7, a1 = c + hw - 0.7;
  const [x0, y0] = polar(rOut, a0), [x1, y1] = polar(rOut, a1);
  const [x2, y2] = polar(R_IN, a1), [x3, y3] = polar(R_IN, a0);
  return `M${f1(x0)} ${f1(y0)}A${rOut} ${rOut} 0 0 1 ${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}A${R_IN} ${R_IN} 0 0 0 ${f1(x3)} ${f1(y3)}Z`;
}

function scallops(r, bumps, depth) {
  let d = "";
  for (let i = 0; i <= bumps * 4; i++) {
    const deg = (i / (bumps * 4)) * 360;
    const rr = r + depth * Math.cos((i / 4) * 2 * Math.PI);
    const [x, y] = polar(rr, deg);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

function reach(c) {
  const off = Math.abs(((c % 360) + 540) % 360 - 180);
  const u = Math.min(1, Math.max(0, (REACH_NONE - off) / (REACH_NONE - REACH_FULL)));
  return u * u * (3 - 2 * u);
}

function monthInZone(timeZone, date = new Date()) {
  const month = new Intl.DateTimeFormat("en-US", { timeZone, month: "numeric" }).format(date);
  return Number(month) - 1;
}

function monthFromSearch(search) {
  const raw = new URLSearchParams(search).get("month");
  if (raw == null || raw === "") return null;
  const m = Number(raw);
  return Number.isInteger(m) && m >= 1 && m <= 12 ? m - 1 : null;
}

export async function loadPack(id) {
  const res = await fetch(new URL(`data/${id}.json`, import.meta.url));
  if (!res.ok) throw new Error(`pack ${id} is not published`);
  return res.json();
}

async function loadRegistry() {
  const res = await fetch(new URL("data/registry.json", import.meta.url));
  if (!res.ok) return [];
  return res.json();
}

const session = {
  pack: null,
  byName: new Map(),
  recipeByMonth: new Map(),
  today: 0,
  selected: 0,
  segEls: [],
  layout: { ext: [], start: 0 },
  tween: null,
  goal: null,
  springs: SPRINGS,
  spinZeta: 0.62,
  vel: 0,
  extVel: Array(12).fill(0),
  lastFrame: 0,
  hubMonth: null,
  pendingBurst: false,
  sheetReturn: null,
  suppressReturn: false,
  openItem: null,
  urlReady: false,
  pendingQueryItem: null,
  onSettle: null,
};

function shortName(m) {
  return session.pack.month_short?.[m] ?? session.pack.month_names[m].slice(0, 3);
}

function monthHeadline(mo, copy) {
  if (mo.counts.peak === 0 && copy.hub_when_no_peak) return fillTpl(copy.hub_when_no_peak, { n: mo.counts.in });
  return fillTpl(copy.at_peak_short, { n: mo.counts.peak });
}

function displayName(name) {
  const proper = session.pack.copy.proper ?? {};
  const words = name.split(" ").map((w) => proper[w] || w);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ");
}

function catOf(id) {
  return session.pack.categories.find((c) => c.id === id);
}

function catColour(id) {
  return LEGEND[id] ?? "#8e4dd6";
}

function countOf(n, id) {
  const cat = catOf(id);
  const word = n === 1 ? (cat?.one || cat?.plural || id) : (cat?.plural || id);
  return `${n} ${word}`;
}

function roleLabel(role) {
  return session.pack.copy.state_labels[role] ?? role;
}

function slotRecord(el) {
  return {
    el,
    q: el.dataset.q === "-1" ? null : QUIET_SLOTS[el.dataset.q],
    a: el.dataset.a === "-1" ? null : ACTIVE_SLOTS[el.dataset.a],
  };
}

function wantedNames(m) {
  const mo = session.pack.months[m];
  const showActive = m === session.selected || session.layout.ext[m] > 0.02;
  return showActive ? [...new Set([...mo.quiet, ...mo.wheel])] : [...mo.quiet];
}

function slotMarkup(item, mo, m, i) {
  return `<g class="slot" data-q="${mo.quiet.indexOf(item)}" data-a="${mo.wheel.indexOf(item)}"><g class="pop" style="--i:${i};--m:${(m - session.today + 12) % 12}"><g class="bob" style="--d:${(i * 0.37 + m * 0.21) % 2}s"><g class="jig" data-item="${esc(item)}">${sticker(item, `x="-50" y="-50" width="100" height="100"`)}</g></g></g></g>`;
}

// Active-only stickers exist on a wedge while it is selected or still extended.
// Quiet wedges keep their five.
function syncStickers() {
  session.segEls.forEach((s, m) => {
    const mo = session.pack.months[m];
    const want = wantedNames(m);
    const wantSet = new Set(want);
    for (const el of [...s.g.querySelectorAll(".slot")]) {
      if (!wantSet.has(el.querySelector(".jig")?.dataset.item)) el.remove();
    }
    const have = new Set([...s.g.querySelectorAll(".slot")].map((el) => el.querySelector(".jig").dataset.item));
    want.forEach((item, i) => {
      if (have.has(item)) return;
      const holder = document.createElement("div");
      holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${slotMarkup(item, mo, m, i)}</svg>`;
      s.label.before(holder.querySelector(".slot"));
    });
    s.slots = [...s.g.querySelectorAll(".slot")].map(slotRecord);
  });
}

function buildWheel() {
  const { pack } = session;
  const wheel = $("#wheel");
  wheel.setAttribute("aria-label", pack.copy.wheel_label);
  const segs = pack.months.map((mo, m) => {
    const items = wantedNames(m);
    const stickers = items.map((item, i) => slotMarkup(item, mo, m, i)).join("");
    const isToday = m === session.today;
    const label = isToday
      ? `<g class="sun"><circle r="40" class="sun-rays"/></g><rect x="-44" y="-22" width="88" height="44" rx="22" class="today-pill"/><text class="seg-label" y="2">${shortName(m).toUpperCase()}</text>`
      : `<text class="seg-label" y="2">${shortName(m).toUpperCase()}</text>`;
    const headline = monthHeadline(mo, pack.copy);
    const extra = mo.counts.peak === 0 && pack.copy.hub_when_no_peak ? "" : `, ${fillTpl(pack.copy.more_in_season, { n: mo.counts.in })}`;
    const aria = `${mo.name}: ${headline}${extra}${isToday ? ` (${pack.copy.hub_this_month})` : ""}`;
    return `<g class="seg${isToday ? " is-today" : ""}" data-m="${m}" tabindex="0" role="button" aria-label="${esc(aria)}" style="--tint:${TINTS[m]}">
      <path class="seg-bg"/>
      ${isToday ? `<path class="today-halo"/>` : ""}
      ${stickers}
      <g class="label">${label}</g>
    </g>`;
  }).join("");

  wheel.innerHTML = `
    <path class="plate-rim" d="${scallops(508, 48, 7)}"/>
    <circle class="plate-inner" r="${R_OUT + 4}"/>
    <g id="spin">${segs}</g>
    <circle class="hub-ring" r="${R_IN - 8}"/>
    <g class="hub" id="hub"></g>
    <g class="pointer"><path d="M-26 -136L0 -178L26 -136Z"/><circle cx="0" cy="-150" r="5" class="pointer-dot"/></g>
    <g id="burst"></g>`;
  session.segEls = [...wheel.querySelectorAll(".seg")].map((g) => ({
    g,
    bg: $(".seg-bg", g),
    halo: $(".today-halo", g),
    slots: [...g.querySelectorAll(".slot")].map(slotRecord),
    label: $(".label", g),
  }));
}

function draw({ ext, start }) {
  session.segEls.forEach((s, m) => {
    const c = start + m * 30;
    const e = ext[m] * reach(c);
    const rOut = lerp(R_OUT, R_OUT_ACTIVE, e);
    const d = wedge(c, HW, rOut);
    s.bg.setAttribute("d", d);
    if (s.halo) s.halo.setAttribute("d", d);
    const squash = (rOut - R_IN) / (R_OUT_ACTIVE - R_IN);
    s.slots.forEach(({ el, q, a }) => {
      const [r, frac, size] = q && a ? [lerp(q[0], a[0], e), lerp(q[1], a[1], e), lerp(q[2], a[2], e)]
        : a ? [R_IN + (a[0] - R_IN) * squash, a[1], a[2] * e]
        : [q[0], q[1], q[2] * (1 - e)];
      if (size < 2) { el.setAttribute("display", "none"); return; }
      el.removeAttribute("display");
      const [x, y] = polar(r, c + frac * HW);
      el.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${(size / 100).toFixed(3)})`);
    });
    const [lx, ly] = polar(lerp(R_LABEL, R_LABEL_ACTIVE, e), c);
    s.label.setAttribute("transform", `translate(${f1(lx)} ${f1(ly)}) scale(${lerp(1, LABEL_GROW, e).toFixed(3)})`);
  });
  syncHub(start);
}

function syncHub(start) {
  const m = ((Math.round(-start / 30) % 12) + 12) % 12;
  if (m === session.hubMonth) return;
  session.hubMonth = m;
  const landed = m === session.selected;
  renderHub(m, landed);
  if (landed && session.pendingBurst) {
    session.pendingBurst = false;
    burst();
  }
}

function targetLayout(m) {
  return { ext: session.pack.months.map((_, k) => (k === m ? 1 : 0)), start: -m * 30 };
}

function animateTo(target, withSprings = SPRINGS) {
  const delta = ((((target.start - session.layout.start) % 360) + 540) % 360) - 180;
  session.goal = { ext: target.ext, start: session.layout.start + delta };
  session.springs = withSprings;
  const [, zNear, zFar] = withSprings.spin;
  session.spinZeta = lerp(zNear, zFar, Math.min(1, Math.max(0, (Math.abs(delta) - 30) / 150)));
    if (reducedMotion.matches) {
      if (session.tween) cancelAnimationFrame(session.tween);
      session.tween = null;
      session.vel = 0;
      session.extVel.fill(0);
      session.layout = { ext: [...session.goal.ext], start: session.goal.start };
      syncStickers();
      draw(session.layout);
      const done = session.onSettle;
      session.onSettle = null;
      if (done) done();
      return;
    }
  if (!session.tween) {
    session.lastFrame = performance.now();
    session.tween = requestAnimationFrame(tick);
  }
}

function tick(now) {
  const dt = Math.min(0.05, Math.max(0, (now - session.lastFrame) / 1000));
  session.lastFrame = now;
  const [ws] = session.springs.spin;
  const [wg, zg] = session.springs.grow;
  let { start } = session.layout;
  const ext = [...session.layout.ext];
  const steps = Math.ceil(dt / (1 / 240));
  for (let i = 0; i < steps; i++) {
    const h = dt / steps;
    session.vel += (-ws * ws * (start - session.goal.start) - 2 * session.spinZeta * ws * session.vel) * h;
    start += session.vel * h;
    for (let k = 0; k < 12; k++) {
      session.extVel[k] += (-wg * wg * (ext[k] - session.goal.ext[k]) - 2 * zg * wg * session.extVel[k]) * h;
      ext[k] += session.extVel[k] * h;
    }
  }
  const settled = Math.abs(start - session.goal.start) < 0.02 && Math.abs(session.vel) < 0.2
    && ext.every((x, k) => Math.abs(x - session.goal.ext[k]) < 0.002 && Math.abs(session.extVel[k]) < 0.02);
    if (settled) {
      session.layout = { ext: [...session.goal.ext], start: session.goal.start };
      session.vel = 0;
      session.extVel.fill(0);
      session.tween = null;
      syncStickers();
      const done = session.onSettle;
      session.onSettle = null;
      draw(session.layout);
      if (done) done();
  } else {
    session.layout = { ext, start };
    session.tween = requestAnimationFrame(tick);
    draw(session.layout);
  }
}

function renderHub(m, landed) {
  const mo = session.pack.months[m];
  const copy = session.pack.copy;
  $("#hub").innerHTML = `<g class="${landed ? "hub-pop" : "hub-tick"}">
    <text class="hub-season" y="-52">${esc(session.pack.seasons[m].toUpperCase())}</text>
    <text class="hub-month" y="12">${esc(mo.name)}</text>
    <text class="hub-count" y="56">${esc(monthHeadline(mo, copy))}</text>
    ${m === session.today ? `<text class="hub-today" y="88">${esc(copy.hub_this_month)}</text>` : ""}
  </g>`;
}

function burst() {
  if (reducedMotion.matches) return;
  const g = $("#burst");
  const colours = ["#ff5a4e", "#ffc93c", "#3bb273", "#8e4dd6", "#4f6df5", "#ff86a8"];
  let dots = "";
  for (let i = 0; i < 14; i++) {
    const a = (-90 + (i - 6.5) * 13 + (Math.random() - 0.5) * 8) * (Math.PI / 180);
    const dist = 70 + Math.random() * 70;
    const shape = i % 3 === 0
      ? `<path d="M0 -9L2.6 -2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6 -2.6Z"/>`
      : `<circle r="${5 + Math.random() * 5}"/>`;
    dots += `<g transform="translate(0 -${R_OUT_ACTIVE + 8})"><g class="burst-dot" style="--dx:${(Math.cos(a) * dist).toFixed(0)}px;--dy:${(Math.sin(a) * dist).toFixed(0)}px;fill:${colours[i % colours.length]}">${shape}</g></g>`;
  }
  g.innerHTML = dots;
}

function itemChip(name, extra = "") {
  return `<button type="button" class="chip" data-item="${esc(name)}">${sticker(name)}<span>${esc(displayName(name))}${extra}</span></button>`;
}

function tile(name, i, recipeItems) {
  const it = session.byName.get(name);
  const role = it.months[session.selected];
  const month = session.pack.months[session.selected].name;
  const label = `${displayName(name)}, ${fillTpl(session.pack.copy.in_month, { state: roleLabel(role).toLowerCase(), month })}. ${session.pack.copy.open_fact_sheet}`;
  return `<li style="--i:${i}"><button type="button" class="tile" data-item="${esc(name)}" aria-label="${esc(label)}">
    <span class="tile-art">${sticker(name)}</span>
    <span class="tile-name">${esc(displayName(name))}</span>
    ${recipeItems.has(name) ? `<span class="tile-badge">${esc(session.pack.copy.recipe_badge)}</span>` : ""}
  </button></li>`;
}

function mixBar(mo) {
  const counts = {};
  for (const n of [...mo.peak, ...mo.in]) {
    const c = session.byName.get(n).category;
    counts[c] = (counts[c] || 0) + 1;
  }
  const parts = session.pack.categories.map((c) => c.id).filter((c) => counts[c]);
  const label = fillTpl(session.pack.copy.mix_label, { list: parts.map((c) => countOf(counts[c], c)).join(", ") });
  return `<div class="mix" role="img" aria-label="${esc(label)}">
    <div class="mix-bar">${parts.map((c) => `<span style="flex:${counts[c]};background:${catColour(c)}" title="${esc(countOf(counts[c], c))}"></span>`).join("")}</div>
    <ul class="mix-key">${parts.map((c) => `<li><i style="background:${catColour(c)}"></i>${esc(countOf(counts[c], c))}</li>`).join("")}</ul>
  </div>`;
}

function recipeCard(m) {
  const r = session.recipeByMonth.get(m);
  if (!r) return "";
  const plateItems = r.produce.map((p) => p.item);
  const copy = session.pack.copy;
  return `<section class="recipe" aria-labelledby="recipe-title">
    <div class="plate" aria-hidden="true">
      <div class="plate-inner-ring"></div>
      ${plateItems.map((n, i) => `<span class="plate-item p${plateItems.length}-${i}" data-item="${esc(n)}">${sticker(n)}</span>`).join("")}
    </div>
    <div class="recipe-body">
      <p class="eyebrow">${esc(fillTpl(copy.months_recipe, { month: session.pack.months[m].name }))}</p>
      <h3 id="recipe-title">${esc(r.title)}</h3>
      <p class="recipe-uses">${esc(copy.made_with)} ${r.produce.map((p) => itemChip(p.item, p.qualifier ? ` <em>(${esc(p.qualifier)})</em>` : "")).join(" ")}</p>
      <a class="chunky-btn small" href="${esc(r.source_url)}" target="_blank" rel="noopener">${esc(fillTpl(copy.cook_it_on, { name: r.source_name }))} <span aria-hidden="true">↗</span></a>
    </div>
  </section>`;
}

function renderPanel(animate) {
  const m = session.selected;
  const mo = session.pack.months[m];
  const copy = session.pack.copy;
  const recipe = session.recipeByMonth.get(m);
  const recipeItems = new Set((recipe?.produce ?? []).map((p) => p.item));
  const panel = $("#panel");
  panel.style.setProperty("--tint", TINTS[m]);
  const now = m === session.today ? `<span class="now-tag">${esc(copy.this_month)}</span>` : "";
  panel.innerHTML = `
    <article class="month-card${animate ? " enter" : ""}">
      <header class="month-head">
        <p class="eyebrow">${esc(session.pack.seasons[m])} · ${m + 1} of 12 ${now}</p>
        <h2>${esc(mo.name)}</h2>
        <p class="blurb">${mo.blurb}</p>
        ${mixBar(mo)}
        ${mo.arrivals.length ? `<div class="flow"><span class="flow-label new">${esc(copy.new_in)}</span>${mo.arrivals.map((n) => itemChip(n)).join("")}</div>` : ""}
        ${mo.farewells.length ? `<div class="flow"><span class="flow-label bye">${esc(copy.last_call)}</span>${mo.farewells.map((n) => itemChip(n)).join("")}</div>` : ""}
      </header>
      ${recipeCard(m)}
      ${mo.counts.peak ? `<section class="shelf">
        <h3><span class="state-dot peak"></span>${esc(copy.at_peak)} <small>${mo.counts.peak}</small></h3>
        <ul class="tiles">${mo.peak.map((n, i) => tile(n, i, recipeItems)).join("")}</ul>
      </section>` : ""}
      ${mo.counts.in ? `<section class="shelf">
        <h3><span class="state-dot in"></span>${esc(copy.also_in_season)} <small>${mo.counts.in}</small></h3>
        <ul class="tiles">${mo.in.map((n, i) => tile(n, i, recipeItems)).join("")}</ul>
      </section>` : ""}
      ${mo.edge.length ? `<details class="edge">
        <summary><span class="state-dot edge"></span>${esc(copy.on_the_edge)} <small>${mo.counts.edge}</small><span class="edge-why">${esc(copy.edge_why)}</span></summary>
        <div class="edge-chips">${mo.edge.map((n) => itemChip(n)).join("")}</div>
      </details>` : ""}
    </article>`;
}

function renderRail() {
  const rail = $("#month-rail");
  const keep = document.activeElement?.closest?.("#month-rail button");
  const keepMonth = keep ? Number(keep.dataset.m) : null;
  rail.setAttribute("aria-label", session.pack.copy.months_nav);
  rail.innerHTML = session.pack.months.map((mo, m) => `<button type="button" data-m="${m}" aria-pressed="${m === session.selected}" style="--tint:${TINTS[m]}" class="${m === session.today ? "is-today" : ""}">
    <span>${esc(shortName(m))}</span>${m === session.today ? `<i aria-label="${esc(session.pack.copy.hub_this_month)}"></i>` : ""}</button>`).join("");
  if (keepMonth !== null) rail.querySelector(`button[data-m="${keepMonth}"]`)?.focus();
}

function renderTodayButton() {
  const btn = $("#today-btn");
  btn.hidden = session.selected === session.today;
  btn.textContent = fillTpl(session.pack.copy.back_to, { month: session.pack.month_names[session.today] });
}

function replaceSearch(next) {
  const current = location.search.replace(/^\?/, "");
  if (next === current) return;
  history.replaceState(null, "", next ? `?${next}` : location.pathname);
}

function stripUnknownCountry(packId) {
  replaceSearch(searchForPack(location.search, packId));
}

function syncQuery() {
  if (!session.urlReady || !session.pack) return;
  const params = new URLSearchParams(searchForPack(location.search, session.pack.id));
  params.set("month", String(session.selected + 1));
  if (session.openItem) params.set("item", session.openItem);
  else params.delete("item");
  replaceSearch(params.toString());
}

function select(m, { intro = false, onSettle = null } = {}) {
  const changed = m !== session.selected || intro;
  session.selected = m;
  session.onSettle = onSettle;
  const seg = session.segEls[m];
  const refocus = document.activeElement === seg.g;
  session.segEls.forEach((s, k) => s.g.classList.toggle("is-selected", k === m));
  $("#spin").appendChild(seg.g);
  if (refocus) seg.g.focus({ preventScroll: true });
  session.pendingBurst = changed && !intro;
  if (session.hubMonth === m) session.hubMonth = null;
  syncStickers();
  animateTo(targetLayout(m), intro ? INTRO_SPRINGS : SPRINGS);
  renderRail();
  renderTodayButton();
  if (changed) renderPanel(!intro);
  syncQuery();
}

function monthRanges(indices) {
  if (indices.length === 12) return session.pack.copy.all_year;
  const set = new Set(indices);
  const starts = indices.filter((i) => !set.has((i + 11) % 12));
  return starts.map((s) => {
    let e = s;
    while (set.has((e + 1) % 12)) e = (e + 1) % 12;
    return s === e ? shortName(s) : `${shortName(s)}–${shortName(e)}`;
  }).join(", ");
}

function seasonRing(it) {
  const cat = catColour(it.category);
  const r0 = 58, r1 = 100;
  const cells = it.months.map((role, m) => {
    const a0 = m * 30 - 15 + 1.5, a1 = m * 30 + 15 - 1.5;
    const p = (r, a) => polar(r, a).map((v) => v.toFixed(1)).join(" ");
    const d = `M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
    const [tx, ty] = polar(118, m * 30);
    const fill = role === "peak" ? cat : role === "in" ? `color-mix(in srgb, ${cat} 45%, white)` : role === "edge" ? "url(#edge-hatch)" : "#f1ece2";
    return `<path d="${d}" fill="${fill}" class="ring-cell${m === session.selected ? " is-sel" : ""}"><title>${esc(session.pack.months[m].name)}: ${esc(roleLabel(role))}</title></path>
      <text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" class="ring-label${m === session.selected ? " is-sel" : ""}">${esc(shortName(m)[0])}</text>`;
  }).join("");
  const described = fillTpl(session.pack.copy.season_label, {
    list: it.months.map((role, m) => `${shortName(m)} ${roleLabel(role)}`).join(", "),
  });
  return `<svg class="season-ring" viewBox="-136 -136 272 272" role="img" aria-label="${esc(described)}">
    <defs><pattern id="edge-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#fffaf0"/><rect width="4" height="10" fill="${cat}" opacity=".55"/></pattern></defs>
    ${cells}
    <g class="ring-center">${sticker(it.item, `x="-50" y="-50" width="100" height="100"`)}</g>
  </svg>`;
}

function openSheet(name, { fromQuery = false, opener = null } = {}) {
  const it = session.byName.get(name);
  if (!it) return;
  const copy = session.pack.copy;
  const cat = catOf(it.category);
  const inSeason = it.months.map((role, m) => (role === "peak" || role === "in" ? m : -1)).filter((m) => m >= 0);
  const edge = it.months.map((role, m) => (role === "edge" ? m : -1)).filter((m) => m >= 0);
  const peaks = it.months.map((role, m) => (role === "peak" ? m : -1)).filter((m) => m >= 0);
  const recipes = session.pack.recipes.filter((r) => r.produce.some((p) => p.item === name));
  const stored = it.stored_notes ? Object.entries(it.stored_notes) : [];
  const nowRole = it.months[session.selected];
  const ring = copy.ring_key;
  const roles = session.roles ?? new Set();
  const ringKeys = ["peak", "in", "edge", "out"].filter((role) => roles.has(role));

  const sheet = $("#sheet");
  sheet.style.setProperty("--cat", catColour(it.category));
  sheet.innerHTML = `<div class="sheet-inner">
    <button type="button" class="sheet-close" aria-label="${esc(copy.close_sheet)}">×</button>
    <div class="sheet-top">
      ${seasonRing(it)}
      <div class="sheet-title">
        <p class="eyebrow"><span class="cat-pill">${esc(cat?.label ?? it.category)}</span></p>
        <h2 id="sheet-title">${esc(displayName(it.item))}</h2>
        <p class="sheet-now"><span class="state-dot ${nowRole}"></span>${esc(fillTpl(copy.in_month, { state: roleLabel(nowRole), month: session.pack.months[session.selected].name }))}</p>
        <ul class="ring-key">
          ${ringKeys.map((role) => `<li><i class="k-${role}"></i>${esc(ring[role])}</li>`).join("")}
        </ul>
      </div>
    </div>
    <dl class="facts">
      <div><dt>${esc(copy.fact_in_season)}</dt><dd>${esc(inSeason.length ? monthRanges(inSeason) : copy.no_in_season)}</dd></div>
      ${roles.has("peak") ? `<div><dt>${esc(copy.fact_peak)}</dt><dd>${esc(peaks.length ? monthRanges(peaks) : copy.no_peak)}</dd></div>` : ""}
      ${edge.length ? `<div><dt>${esc(copy.fact_edge)}</dt><dd>${esc(monthRanges(edge))}</dd></div>` : ""}
      ${stored.length ? `<div class="wide"><dt>${esc(copy.stored_notes)}</dt><dd class="notes-chips">${stored.map(([k, v]) => `<span><b>${esc(shortName(MONTH_KEYS.indexOf(k)))}</b> ${esc(v)}</span>`).join("")}</dd></div>` : ""}
      ${it.regions_notes ? `<div class="wide"><dt>${esc(copy.regions)}</dt><dd>${esc(it.regions_notes)}</dd></div>` : ""}
      ${recipes.length ? `<div class="wide"><dt>${esc(copy.recipe)}</dt><dd>${recipes.map((r) => `<button type="button" class="link-btn" data-goto="${r.month}">${esc(r.title)} <small>(${esc(session.pack.months[r.month].name)})</small></button>`).join("<br>")}</dd></div>` : ""}
      ${it.specialist_sources.length ? `<div class="wide"><dt>${esc(copy.specialist_sources)}</dt><dd class="sources">${it.specialist_sources.map((s) => `<span>${esc(s)}</span>`).join("")}</dd></div>` : ""}
    </dl>
  </div>`;
  session.openItem = name;
  session.sheetReturn = fromQuery
    ? { kind: "rail", month: session.selected }
    : { kind: "node", el: opener instanceof Element ? opener : document.activeElement };
  if (!sheet.open) sheet.showModal();
  $(".sheet-close", sheet).focus();
  syncQuery();
}

const PLACE_FLAGS = {
  uk: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  on: "🇨🇦",
  it: "🇮🇹",
  fl: "🇺🇸",
  sc: "🇨🇳",
  sd: "🇨🇳",
  js: "🇨🇳",
  yn: "🇨🇳",
  hi: "🇨🇳",
  xj: "🇨🇳",
  jp: "🇯🇵",
};

const PLACE_CONTINENTS = [
  ["Europe", ["uk", "fr", "es", "it"]],
  ["North America", ["on", "fl"]],
  ["Asia", ["sc", "sd", "js", "yn", "hi", "xj", "jp"]],
];

function flagForPlace(id) {
  return PLACE_FLAGS[id] ?? "";
}

function maybeCountryControl(registry) {
  document.querySelector(".country-control")?.remove();
  const shipped = (registry ?? []).filter((row) => row.status === "shipped" || row.status === "ready");
  if (shipped.length < 2) return;
  const nav = document.createElement("nav");
  nav.className = "country-control";
  const label = document.createElement("label");
  label.htmlFor = "country-select";
  label.textContent = "Place";
  const select = document.createElement("select");
  select.id = "country-select";
  for (const [continent, ids] of PLACE_CONTINENTS) {
    const rows = shipped.filter((row) => ids.includes(row.id));
    if (!rows.length) continue;
    const group = document.createElement("optgroup");
    group.label = continent;
    for (const row of rows) {
      const option = document.createElement("option");
      option.value = row.id;
      const flag = flagForPlace(row.id);
      option.textContent = flag ? `${flag} ${row.name}` : row.name;
      option.selected = row.id === session.pack?.id;
      group.appendChild(option);
    }
    select.appendChild(group);
  }
  select.addEventListener("change", () => {
    const id = select.value;
    if (!id || id === session.pack?.id) return;
    const params = new URLSearchParams(location.search);
    params.set("country", id);
    params.delete("item");
    history.pushState(null, "", `?${params.toString()}`);
    loadPack(id).then((next) => render(next)).then(() => {
      document.querySelector("#country-select")?.focus();
    });
  });
  nav.append(label, select);
  document.querySelector(".top")?.append(nav);
}

let eventsBound = false;
function bind() {
  if (eventsBound) return;
  eventsBound = true;
  const wheel = $("#wheel");
  wheel.addEventListener("click", (e) => {
    const art = e.target.closest(".jig");
    const seg = e.target.closest(".seg");
    if (!seg) return;
    select(Number(seg.dataset.m));
    if (art) openSheet(art.dataset.item, { opener: seg });
  });
  wheel.addEventListener("keydown", (e) => {
    const seg = e.target.closest(".seg");
    if (seg && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      select(Number(seg.dataset.m));
    }
  });
  $("#month-rail").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-m]");
    if (b) select(Number(b.dataset.m));
  });
  $("#today-btn").addEventListener("click", () => select(session.today));
  document.addEventListener("click", (e) => {
    const it = e.target.closest("#panel [data-item], #sheet [data-item]");
    if (it) openSheet(it.dataset.item, { opener: it.closest("button") || it });
    const go = e.target.closest("[data-goto]");
    if (go) {
      session.suppressReturn = true;
      session.openItem = null;
      $("#sheet").close();
      select(Number(go.dataset.goto));
      document.querySelector(`#month-rail button[data-m="${session.selected}"]`)?.focus();
    }
  });
  const sheet = $("#sheet");
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest(".sheet-close")) sheet.close();
  });
  sheet.addEventListener("close", () => {
    const back = session.sheetReturn;
    session.sheetReturn = null;
    session.openItem = null;
    syncQuery();
    if (session.suppressReturn) {
      session.suppressReturn = false;
      return;
    }
    if (!back) return;
    if (back.kind === "rail") {
      document.querySelector(`#month-rail button[data-m="${back.month}"]`)?.focus();
    } else if (back.el?.isConnected) {
      back.el.focus();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (sheet.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
    const fromSeg = document.activeElement?.closest?.(".seg");
    if (e.key === "ArrowRight") select((session.selected + 1) % 12);
    else if (e.key === "ArrowLeft") select((session.selected + 11) % 12);
    else return;
    e.preventDefault();
    if (fromSeg) session.segEls[session.selected].g.focus({ preventScroll: true });
  });
  window.addEventListener("popstate", () => {
    loadRegistry().then((registry) => {
      const id = resolvePackId(new URLSearchParams(location.search).get("country"), registry);
      if (id === session.pack?.id) render(session.pack);
      else loadPack(id).then((pack) => render(pack));
    });
  });
}

async function mountSprite() {
  const holder = $("#sprite");
  if (holder.dataset.ready === "1") return;
  const res = await fetch(new URL("sprites.svg", import.meta.url));
  holder.innerHTML = await res.text();
  const svg = $("svg", holder);
  if (svg) {
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.setAttribute("aria-hidden", "true");
  }
  holder.dataset.ready = "1";
}

function rolesIn(pack) {
  const roles = new Set();
  for (const it of pack.items) for (const role of it.months) roles.add(role);
  return roles;
}

export async function render(pack) {
  session.urlReady = false;
  session.pack = pack;
  session.roles = rolesIn(pack);
  session.byName = new Map(pack.items.map((it) => [it.item, it]));
  session.recipeByMonth = new Map(pack.recipes.map((r) => [r.month, r]));
  session.today = monthInZone(pack.timezone);
  const requested = monthFromSearch(location.search);
  const selection = requested ?? session.today;
  session.selected = selection;
  session.hubMonth = null;
  session.layout = { ext: pack.months.map(() => 0), start: 0 };
  session.extVel = pack.months.map(() => 0);
  session.vel = 0;
  if (session.tween) cancelAnimationFrame(session.tween);
  session.tween = null;

  document.documentElement.lang = pack.locale;
  document.title = pack.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", pack.tagline);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", pack.title);
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", pack.tagline);
  $("#title").textContent = pack.title;
  $("#tagline").textContent = pack.tagline;
  $("#attribution").textContent = pack.attribution;
  $("#hint").textContent = pack.copy.hint;

  await mountSprite();
  const registry = await loadRegistry();
  maybeCountryControl(registry);
  const markItem = pack.months[selection].wheel[0];
  if (markItem) $("#brand-mark").innerHTML = sticker(markItem);
  buildWheel();
  bind();

  const queryItem = new URLSearchParams(location.search).get("item");
  session.pendingQueryItem = queryItem && session.byName.has(queryItem) ? queryItem : null;
  const afterSpin = () => {
    if (session.pendingQueryItem) {
      const name = session.pendingQueryItem;
      session.pendingQueryItem = null;
      openSheet(name, { fromQuery: true });
    }
  };

  if (reducedMotion.matches) {
    select(selection, { intro: true, onSettle: afterSpin });
  } else {
    session.layout = { ext: pack.months.map(() => 0), start: targetLayout(selection).start + 170 };
    draw(session.layout);
    $("#wheel").classList.add("intro");
    select(selection, {
      intro: true,
      onSettle: () => {
        afterSpin();
      },
    });
    setTimeout(() => $("#wheel")?.classList.remove("intro"), 2600);
  }
  session.urlReady = true;
  stripUnknownCountry(pack.id);
  if (requested == null && new URLSearchParams(location.search).has("month")) {
    const params = new URLSearchParams(location.search);
    params.delete("month");
    if (queryItem && !session.byName.has(queryItem)) params.delete("item");
    const next = params.toString();
    history.replaceState(null, "", next ? `?${next}` : location.pathname);
  } else if (queryItem && !session.byName.has(queryItem)) {
    const params = new URLSearchParams(location.search);
    params.delete("item");
    const next = params.toString();
    history.replaceState(null, "", next ? `?${next}` : location.pathname);
  }
}

async function boot() {
  const registry = await loadRegistry();
  const params = new URLSearchParams(location.search);
  const requested = params.get("country");
  const id = resolvePackId(requested, registry);
  stripUnknownCountry(id);
  const pack = await loadPack(id);
  await render(pack);
}

boot();
