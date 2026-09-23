(function () {
  const D = window.UK_WHEEL;
  const { sticker, buildSprite } = window.ProduceArt;
  const $ = (sel, root = document) => root.querySelector(sel);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const byName = new Map(D.items.map((it) => [it.item, it]));
  const recipeByMonth = new Map(D.recipes.map((r) => [r.month, r]));

  const TINTS = ["#cfe0ff", "#ddd3ff", "#d3f2c4", "#c2ecad", "#e2f59c", "#fff09a", "#ffe07a", "#ffcf7a", "#ffbd7e", "#ffab88", "#f6b3aa", "#dccff2"];
  const SEASONS = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
  const SHORT = D.months.map((m) => m.name.slice(0, 3));
  const CATEGORY = {
    vegetable: { label: "Vegetable", one: "veg", plural: "veg", colour: "#3bb273" },
    fruit: { label: "Fruit", one: "fruit", plural: "fruit", colour: "#ff5a4e" },
    herb: { label: "Herb", one: "herb", plural: "herbs", colour: "#2f7d74" },
    salad: { label: "Salad", one: "salad", plural: "salad", colour: "#a8e05a" },
    nut: { label: "Nut", one: "nut", plural: "nuts", colour: "#b0703f" },
    "foraged/wild": { label: "Foraged / wild", one: "wild & foraged", plural: "wild & foraged", colour: "#8e4dd6" },
  };
  const countOf = (n, c) => `${n} ${n === 1 ? CATEGORY[c].one : CATEGORY[c].plural}`;
  const STATE_LABEL = { P: "Peak", I: "In season", T: "On the edge", ".": "Out of season" };
  const PROPER = { jersey: "Jersey", royals: "Royals", brussels: "Brussels", bramley: "Bramley" };

  const displayName = (name) => {
    const words = name.split(" ").map((w) => PROPER[w] || w);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(" ");
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function monthFromQuery() {
    const m = Number(new URLSearchParams(location.search).get("month"));
    return Number.isInteger(m) && m >= 1 && m <= 12 ? m - 1 : null;
  }
  const today = monthFromQuery() ?? new Date().getMonth();

  // ---------- geometry ----------
  // Every month keeps a 30° wedge. The selected one grows outward (radius, never angle) past the
  // plate rim and carries every sticker in its ranked `wheel` list.
  const R_IN = 150, R_OUT = 442, R_OUT_ACTIVE = 690, R_LABEL = 478, R_LABEL_ACTIVE = 728;
  const HW = 15, LABEL_GROW = 34 / 30;
  const polar = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [r * Math.sin(a), -r * Math.cos(a)];
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = (v) => v.toFixed(1);
  function wedge(c, hw, rOut) {
    const a0 = c - hw + 0.7, a1 = c + hw - 0.7;
    const [x0, y0] = polar(rOut, a0), [x1, y1] = polar(rOut, a1);
    const [x2, y2] = polar(R_IN, a1), [x3, y3] = polar(R_IN, a0);
    return `M${f1(x0)} ${f1(y0)}A${rOut} ${rOut} 0 0 1 ${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}A${R_IN} ${R_IN} 0 0 0 ${f1(x3)} ${f1(y3)}Z`;
  }
  // Slots are [radius, fraction of the 15° half-angle, size].
  const QUIET_SLOTS = [[215, 0, 92], [300, -0.547, 76], [300, 0.547, 76], [388, -0.533, 88], [388, 0.533, 88]];
  const ACTIVE_ROWS = [
    { r: 222, n: 1, spread: 0, size: 84 }, { r: 302, n: 2, spread: 0.5, size: 72 }, { r: 386, n: 2, spread: 0.52, size: 88 },
    { r: 470, n: 3, spread: 0.62, size: 72 }, { r: 555, n: 3, spread: 0.64, size: 84 }, { r: 640, n: 4, spread: 0.7, size: 72 },
  ];
  // Higher-ranked items get the roomiest slots nearest the pointer.
  const ROW_PENALTY = [0.1, 0.05, 0, 0.1, 0.2, 0.35];
  const ACTIVE_SLOTS = ACTIVE_ROWS.flatMap(({ r, n, spread, size }, row) =>
    Array.from({ length: n }, (_, k) => [r, n === 1 ? 0 : lerp(-spread, spread, k / (n - 1)), size, row]))
    .sort((a, b) => Math.abs(a[1]) + ROW_PENALTY[a[3]] - (Math.abs(b[1]) + ROW_PENALTY[b[3]]));

  function scallops(r, bumps, depth) {
    let d = "";
    for (let i = 0; i <= bumps * 4; i++) {
      const deg = (i / (bumps * 4)) * 360;
      const rr = r + depth * Math.cos((i / 4) * 2 * Math.PI);
      const [x, y] = polar(rr, deg);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + "Z";
  }

  // ---------- wheel ----------
  const wheel = $("#wheel");
  let selected = today;
  const segEls = [];
  // `ext` is each month's outward growth (0 quiet, 1 selected); `start` is January's centre angle.
  let layout = { ext: D.months.map(() => 0), start: 0 };
  let tween = null;

  function buildWheel() {
    const segs = D.months.map((mo, m) => {
      // Quiet and active lists differ (quiet wedges avoid repeats), so each wedge holds their union.
      const items = [...new Set([...mo.quiet, ...mo.wheel])];
      const stickers = items.map((item, i) =>
        `<g class="slot" data-q="${mo.quiet.indexOf(item)}" data-a="${mo.wheel.indexOf(item)}"><g class="pop" style="--i:${i};--m:${(m - today + 12) % 12}"><g class="bob" style="--d:${(i * 0.37 + m * 0.21) % 2}s"><g class="jig" data-item="${esc(item)}">${sticker(item, `x="-50" y="-50" width="100" height="100"`)}</g></g></g></g>`).join("");
      const isToday = m === today;
      const label = isToday
        ? `<g class="sun"><circle r="40" class="sun-rays"/></g><rect x="-44" y="-22" width="88" height="44" rx="22" class="today-pill"/><text class="seg-label" y="2">${SHORT[m].toUpperCase()}</text>`
        : `<text class="seg-label" y="2">${SHORT[m].toUpperCase()}</text>`;
      return `<g class="seg${isToday ? " is-today" : ""}" data-m="${m}" tabindex="0" role="button" aria-label="${mo.name}: ${mo.counts.peak} at peak, ${mo.counts.in} more in season${isToday ? " (this month)" : ""}" style="--tint:${TINTS[m]}">
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
    wheel.querySelectorAll(".seg").forEach((g) => segEls.push({
      g,
      bg: $(".seg-bg", g),
      halo: $(".today-halo", g),
      slots: [...g.querySelectorAll(".slot")].map((el) => ({ el, q: QUIET_SLOTS[el.dataset.q], a: ACTIVE_SLOTS[el.dataset.a] })),
      label: $(".label", g),
    }));
  }

  // A wedge only reaches past the plate near the pointer, where the viewBox has headroom; on a long
  // spin the old wedge tucks in as it swings away and the new one pulls out as it arrives.
  const REACH_FULL = 25, REACH_NONE = 70;
  function reach(c) {
    const off = Math.abs(((c % 360) + 540) % 360 - 180);
    const u = Math.min(1, Math.max(0, (REACH_NONE - off) / (REACH_NONE - REACH_FULL)));
    return u * u * (3 - 2 * u);
  }

  function draw({ ext, start }) {
    segEls.forEach((s, m) => {
      const c = start + m * 30;
      const e = ext[m] * reach(c);
      const d = wedge(c, HW, lerp(R_OUT, R_OUT_ACTIVE, e));
      s.bg.setAttribute("d", d);
      if (s.halo) s.halo.setAttribute("d", d);
      s.slots.forEach(({ el, q, a }) => {
        const [r, frac, size] = q && a ? [lerp(q[0], a[0], e), lerp(q[1], a[1], e), lerp(q[2], a[2], e)]
          : a ? [a[0], a[1], a[2] * e]
          : [q[0], q[1], q[2] * (1 - e)];
        if (size < 2) { el.setAttribute("display", "none"); return; }
        el.removeAttribute("display");
        const [x, y] = polar(r, c + frac * HW);
        el.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${(size / 100).toFixed(3)})`);
      });
      const [lx, ly] = polar(lerp(R_LABEL, R_LABEL_ACTIVE, e), c);
      s.label.setAttribute("transform", `translate(${f1(lx)} ${f1(ly)}) scale(${lerp(1, LABEL_GROW, e).toFixed(3)})`);
    });
  }

  function targetLayout(m) {
    return { ext: D.months.map((_, k) => (k === m ? 1 : 0)), start: -m * 30 };
  }

  // Rotation and each wedge's outward growth are damped springs. `grow` is [angular frequency,
  // damping ratio]; `spin` is [angular frequency, damping for a 30° step, damping for a 180° spin],
  // so a long spin's overshoot past the pointer stays a few degrees. A new pick mid-spin retargets
  // the springs and keeps the wheel's momentum.
  const SPRINGS = { spin: [8, 0.62, 0.8], grow: [11, 0.7] };
  const INTRO_SPRINGS = { spin: [4.6, 0.55, 0.55], grow: [7, 0.8] };
  let goal = null, springs = SPRINGS, spinZeta = 0.62;
  let vel = 0;
  const extVel = D.months.map(() => 0);
  let lastFrame = 0;

  function animateTo(target, withSprings = SPRINGS) {
    const delta = ((((target.start - layout.start) % 360) + 540) % 360) - 180;
    goal = { ext: target.ext, start: layout.start + delta };
    springs = withSprings;
    const [, zNear, zFar] = springs.spin;
    spinZeta = lerp(zNear, zFar, Math.min(1, Math.max(0, (Math.abs(delta) - 30) / 150)));
    if (reducedMotion.matches) {
      if (tween) cancelAnimationFrame(tween);
      tween = null;
      vel = 0;
      extVel.fill(0);
      layout = { ext: [...goal.ext], start: goal.start };
      draw(layout);
      return;
    }
    if (!tween) {
      lastFrame = performance.now();
      tween = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    // rAF timestamps can predate the click that started the motion, so dt is clamped at 0.
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    const [ws] = springs.spin, [wg, zg] = springs.grow;
    let { start } = layout;
    const ext = [...layout.ext];
    const steps = Math.ceil(dt / (1 / 240));
    for (let i = 0; i < steps; i++) {
      const h = dt / steps;
      vel += (-ws * ws * (start - goal.start) - 2 * spinZeta * ws * vel) * h;
      start += vel * h;
      for (let k = 0; k < 12; k++) {
        extVel[k] += (-wg * wg * (ext[k] - goal.ext[k]) - 2 * zg * wg * extVel[k]) * h;
        ext[k] += extVel[k] * h;
      }
    }
    const settled = Math.abs(start - goal.start) < 0.02 && Math.abs(vel) < 0.2
      && ext.every((x, k) => Math.abs(x - goal.ext[k]) < 0.002 && Math.abs(extVel[k]) < 0.02);
    if (settled) {
      layout = { ext: [...goal.ext], start: goal.start };
      vel = 0;
      extVel.fill(0);
      tween = null;
    } else {
      layout = { ext, start };
      tween = requestAnimationFrame(tick);
    }
    draw(layout);
  }

  function renderHub() {
    const mo = D.months[selected];
    $("#hub").innerHTML = `<g class="hub-pop">
      <text class="hub-season" y="-52">${SEASONS[selected].toUpperCase()}</text>
      <text class="hub-month" y="12">${mo.name}</text>
      <text class="hub-count" y="56">${mo.counts.peak} at peak</text>
      ${selected === today ? `<text class="hub-today" y="88">this month</text>` : ""}
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

  // ---------- panel ----------
  const itemChip = (name, extra = "") =>
    `<button type="button" class="chip" data-item="${esc(name)}">${sticker(name)}<span>${esc(displayName(name))}${extra}</span></button>`;

  function tile(name, i, recipeItems) {
    const it = byName.get(name);
    const state = it.months[selected];
    return `<li style="--i:${i}"><button type="button" class="tile" data-item="${esc(name)}" aria-label="${esc(displayName(name))}, ${STATE_LABEL[state].toLowerCase()} in ${D.months[selected].name}. Open fact sheet.">
      <span class="tile-art">${sticker(name)}</span>
      <span class="tile-name">${esc(displayName(name))}</span>
      ${recipeItems.has(name) ? `<span class="tile-badge">recipe</span>` : ""}
    </button></li>`;
  }

  function monthBlurb(m) {
    const mo = D.months[m];
    const prev = D.months[(m + 11) % 12];
    const total = (x) => x.counts.peak + x.counts.in;
    const totals = D.months.map(total);
    const change = total(mo) - total(prev);
    let trend;
    if (total(mo) === Math.max(...totals)) trend = "The fullest month on the wheel.";
    else if (total(mo) === Math.min(...totals)) trend = "The leanest stretch of the year, so every pick counts.";
    else if (change >= 8) trend = `The wheel is filling up: ${change} more in season than ${prev.name}.`;
    else if (change <= -8) trend = `Winding down: ${-change} fewer in season than ${prev.name}.`;
    else trend = `Much the same haul as ${prev.name}.`;
    const fruitPeaks = mo.peak.filter((n) => byName.get(n).category === "fruit").length;
    const lead = CATEGORY[mo.lead.category].plural;
    const mix = fruitPeaks
      ? `${lead[0].toUpperCase() + lead.slice(1)} lead the peaks (${mo.lead.count} of ${mo.counts.peak}), with ${fruitPeaks === 1 ? "1 fruit at its best" : `${fruitPeaks} fruits at their best`}.`
      : `${lead[0].toUpperCase() + lead.slice(1)} lead the peaks (${mo.lead.count} of ${mo.counts.peak}); no UK fruit is at peak.`;
    return `${mo.name} has <strong>${mo.counts.peak}</strong> things at peak and <strong>${mo.counts.in}</strong> more in season. ${trend} ${mix}`;
  }

  function mixBar(mo) {
    const counts = {};
    for (const n of [...mo.peak, ...mo.in]) {
      const c = byName.get(n).category;
      counts[c] = (counts[c] || 0) + 1;
    }
    const parts = Object.keys(CATEGORY).filter((c) => counts[c]);
    return `<div class="mix" role="img" aria-label="In season by type: ${parts.map((c) => countOf(counts[c], c)).join(", ")}">
      <div class="mix-bar">${parts.map((c) => `<span style="flex:${counts[c]};background:${CATEGORY[c].colour}" title="${countOf(counts[c], c)}"></span>`).join("")}</div>
      <ul class="mix-key">${parts.map((c) => `<li><i style="background:${CATEGORY[c].colour}"></i>${countOf(counts[c], c)}</li>`).join("")}</ul>
    </div>`;
  }

  function recipeCard(m) {
    const r = recipeByMonth.get(m);
    const plateItems = r.produce.map((p) => p.item);
    return `<section class="recipe" aria-labelledby="recipe-title">
      <div class="plate" aria-hidden="true">
        <div class="plate-inner-ring"></div>
        ${plateItems.map((n, i) => `<span class="plate-item p${plateItems.length}-${i}" data-item="${esc(n)}">${sticker(n)}</span>`).join("")}
      </div>
      <div class="recipe-body">
        <p class="eyebrow">${D.months[m].name}'s recipe</p>
        <h3 id="recipe-title">${esc(r.title)}</h3>
        <p class="recipe-uses">Made with ${r.produce.map((p) => itemChip(p.item, p.qualifier ? ` <em>(${esc(p.qualifier)})</em>` : "")).join(" ")}</p>
        <a class="chunky-btn small" href="${esc(r.source_url)}" target="_blank" rel="noopener">Cook it on ${esc(r.source_name)} <span aria-hidden="true">↗</span></a>
      </div>
    </section>`;
  }

  function renderPanel(animate) {
    const m = selected;
    const mo = D.months[m];
    const recipeItems = new Set(recipeByMonth.get(m).produce.map((p) => p.item));
    const panel = $("#panel");
    panel.style.setProperty("--tint", TINTS[m]);
    panel.innerHTML = `
      <article class="month-card${animate ? " enter" : ""}">
        <header class="month-head">
          <p class="eyebrow">${SEASONS[m]} · ${m + 1} of 12 ${m === today ? `<span class="now-tag">This month</span>` : ""}</p>
          <h2>${mo.name}</h2>
          <p class="blurb">${monthBlurb(m)}</p>
          ${mixBar(mo)}
          ${mo.arrivals.length ? `<div class="flow"><span class="flow-label new">New in</span>${mo.arrivals.map((n) => itemChip(n)).join("")}</div>` : ""}
          ${mo.farewells.length ? `<div class="flow"><span class="flow-label bye">Last call</span>${mo.farewells.map((n) => itemChip(n)).join("")}</div>` : ""}
        </header>
        ${recipeCard(m)}
        <section class="shelf">
          <h3><span class="state-dot P"></span>At peak <small>${mo.counts.peak}</small></h3>
          <ul class="tiles">${mo.peak.map((n, i) => tile(n, i, recipeItems)).join("")}</ul>
        </section>
        <section class="shelf">
          <h3><span class="state-dot I"></span>Also in season <small>${mo.counts.in}</small></h3>
          <ul class="tiles">${mo.in.map((n, i) => tile(n, i, recipeItems)).join("")}</ul>
        </section>
        ${mo.edge.length ? `<details class="edge">
          <summary><span class="state-dot T"></span>On the edge <small>${mo.counts.edge}</small><span class="edge-why">start or end of season, or a single source</span></summary>
          <div class="edge-chips">${mo.edge.map((n) => itemChip(n)).join("")}</div>
        </details>` : ""}
      </article>`;
  }

  function renderRail() {
    $("#month-rail").innerHTML = D.months.map((mo, m) => `<button type="button" data-m="${m}" aria-pressed="${m === selected}" style="--tint:${TINTS[m]}" class="${m === today ? "is-today" : ""}">
      <span>${SHORT[m]}</span>${m === today ? `<i aria-label="this month"></i>` : ""}</button>`).join("");
  }

  function renderTodayButton() {
    const btn = $("#today-btn");
    btn.hidden = selected === today;
    $("span", btn).textContent = D.months[today].name;
  }

  function select(m, { intro = false } = {}) {
    const changed = m !== selected || intro;
    selected = m;
    const refocus = document.activeElement === segEls[m].g;
    segEls.forEach((s, k) => s.g.classList.toggle("is-selected", k === m));
    // Paint the enlarged wedge last so its stickers and outline sit above its neighbours.
    $("#spin").appendChild(segEls[m].g);
    if (refocus) segEls[m].g.focus({ preventScroll: true });
    animateTo(targetLayout(m), intro ? INTRO_SPRINGS : SPRINGS);
    renderHub();
    renderRail();
    renderTodayButton();
    if (changed) {
      renderPanel(!intro);
      if (!intro) burst();
    }
  }

  // ---------- fact sheet ----------
  function monthRanges(indices) {
    if (indices.length === 12) return "all year";
    const set = new Set(indices);
    const starts = indices.filter((i) => !set.has((i + 11) % 12));
    return starts.map((s) => {
      let e = s;
      while (set.has((e + 1) % 12)) e = (e + 1) % 12;
      return s === e ? SHORT[s] : `${SHORT[s]}–${SHORT[e]}`;
    }).join(", ");
  }

  function seasonRing(it) {
    const cat = CATEGORY[it.category].colour;
    const r0 = 58, r1 = 100;
    const cells = it.months.map((s, m) => {
      const a0 = m * 30 - 15 + 1.5, a1 = m * 30 + 15 - 1.5;
      const p = (r, a) => polar(r, a).map((v) => v.toFixed(1)).join(" ");
      const d = `M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
      const [tx, ty] = polar(118, m * 30);
      const fill = s === "P" ? cat : s === "I" ? `color-mix(in srgb, ${cat} 45%, white)` : s === "T" ? "url(#edge-hatch)" : "#f1ece2";
      return `<path d="${d}" fill="${fill}" class="ring-cell${m === selected ? " is-sel" : ""}"><title>${D.months[m].name}: ${STATE_LABEL[s]}</title></path>
        <text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" class="ring-label${m === selected ? " is-sel" : ""}">${SHORT[m][0]}</text>`;
    }).join("");
    return `<svg class="season-ring" viewBox="-136 -136 272 272" role="img" aria-label="Season: ${it.months.map((s, m) => `${SHORT[m]} ${STATE_LABEL[s]}`).join(", ")}">
      <defs><pattern id="edge-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#fffaf0"/><rect width="4" height="10" fill="${cat}" opacity=".55"/></pattern></defs>
      ${cells}
      <g class="ring-center">${sticker(it.item, `x="-50" y="-50" width="100" height="100"`)}</g>
    </svg>`;
  }

  function openSheet(name) {
    const it = byName.get(name);
    if (!it) return;
    const cat = CATEGORY[it.category];
    const inSeason = it.months.map((s, m) => (s === "P" || s === "I" ? m : -1)).filter((m) => m >= 0);
    const edge = it.months.map((s, m) => (s === "T" ? m : -1)).filter((m) => m >= 0);
    const peaks = it.peak_months.map((k) => D.monthKeys.indexOf(k));
    const recipes = D.recipes.filter((r) => r.produce.some((p) => p.item === name));
    const stored = it.stored_notes ? Object.entries(it.stored_notes) : [];
    const gridOnly = !it.regions_notes && !stored.length && !it.specialist_sources.length;
    const nowState = it.months[selected];

    const sheet = $("#sheet");
    sheet.style.setProperty("--cat", cat.colour);
    sheet.innerHTML = `<div class="sheet-inner">
      <button type="button" class="sheet-close" aria-label="Close fact sheet">×</button>
      <div class="sheet-top">
        ${seasonRing(it)}
        <div class="sheet-title">
          <p class="eyebrow"><span class="cat-pill">${cat.label}</span></p>
          <h2 id="sheet-title">${esc(displayName(it.item))}</h2>
          <p class="sheet-now"><span class="state-dot ${nowState === "." ? "O" : nowState}"></span>${STATE_LABEL[nowState]} in ${D.months[selected].name}</p>
          <ul class="ring-key">
            <li><i class="k-P"></i>Peak</li><li><i class="k-I"></i>In season</li><li><i class="k-T"></i>Edge</li><li><i class="k-O"></i>Out</li>
          </ul>
        </div>
      </div>
      <dl class="facts">
        <div><dt>In season</dt><dd>${inSeason.length ? monthRanges(inSeason) : "No P/I months in the UK grid"}</dd></div>
        <div><dt>Peak</dt><dd>${peaks.length ? monthRanges(peaks) : "No peak month marked"}</dd></div>
        ${edge.length ? `<div><dt>On the edge</dt><dd>${monthRanges(edge)}</dd></div>` : ""}
        ${stored.length ? `<div class="wide"><dt>Stored &amp; type notes</dt><dd class="notes-chips">${stored.map(([k, v]) => `<span><b>${SHORT[D.monthKeys.indexOf(k)]}</b> ${esc(v)}</span>`).join("")}</dd></div>` : ""}
        ${it.regions_notes ? `<div class="wide"><dt>Regions &amp; notes</dt><dd>${esc(it.regions_notes)}</dd></div>` : ""}
        ${recipes.length ? `<div class="wide"><dt>Recipe</dt><dd>${recipes.map((r) => `<button type="button" class="link-btn" data-goto="${r.month}">${esc(r.title)} <small>(${D.months[r.month].name})</small></button>`).join("<br>")}</dd></div>` : ""}
        ${it.specialist_sources.length ? `<div class="wide"><dt>Specialist sources</dt><dd class="sources">${it.specialist_sources.map((s) => `<span>${esc(s)}</span>`).join("")}</dd></div>` : ""}
      </dl>
      ${gridOnly ? `<p class="sheet-foot">The research corpus only has the month grid for this one, so that's all we show.</p>` : ""}
    </div>`;
    if (!sheet.open) sheet.showModal();
    $(".sheet-close", sheet).focus();
  }

  // ---------- events ----------
  function bind() {
    wheel.addEventListener("click", (e) => {
      const art = e.target.closest(".jig");
      const seg = e.target.closest(".seg");
      if (!seg) return;
      select(Number(seg.dataset.m));
      if (art) openSheet(art.dataset.item);
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
    $("#today-btn").addEventListener("click", () => select(today));
    document.addEventListener("click", (e) => {
      const it = e.target.closest("#panel [data-item], #sheet [data-item]");
      if (it) openSheet(it.dataset.item);
      const go = e.target.closest("[data-goto]");
      if (go) {
        $("#sheet").close();
        select(Number(go.dataset.goto));
      }
    });
    const sheet = $("#sheet");
    sheet.addEventListener("click", (e) => {
      if (e.target === sheet || e.target.closest(".sheet-close")) sheet.close();
    });
    document.addEventListener("keydown", (e) => {
      if (sheet.open || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") select((selected + 1) % 12);
      else if (e.key === "ArrowLeft") select((selected + 11) % 12);
      else return;
      const seg = wheel.querySelector(`.seg[data-m="${selected}"]`);
      if (document.activeElement && document.activeElement.closest(".seg")) seg.focus({ preventScroll: true });
    });
  }

  // ---------- boot ----------
  $("#sprite").innerHTML = buildSprite(D.items);
  $("#brand-mark").innerHTML = sticker(D.months[today].wheel[0]);
  buildWheel();
  bind();
  if (reducedMotion.matches) {
    select(today, { intro: true });
  } else {
    // Start 170° round with every wedge quiet, so the arrival spin also swells today's wedge.
    layout = { ext: D.months.map(() => 0), start: targetLayout(today).start + 170 };
    draw(layout);
    wheel.classList.add("intro");
    select(today, { intro: true });
    setTimeout(() => wheel.classList.remove("intro"), 2600);
  }
})();
