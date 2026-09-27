// Sticker Garden drawings. Shared by every country pack.
// Flat colour, one ink outline, one white highlight, a face, die-cut border.
// Item colours live in art/bindings/<id>.json, not here.

const INK = "#2b2340";

const C = {
  red: "#ff5a4e", deepRed: "#d9344a", pink: "#ff86a8", rhubarb: "#ff5f8a", magenta: "#c2255c",
  purple: "#8e4dd6", plum: "#5b3a9b", blue: "#4f6df5", navy: "#34307a", orange: "#ff9a3c",
  amber: "#ffb627", yellow: "#ffd84a", butter: "#fff0a6", cream: "#fff6dc", tan: "#e9b87a",
  brown: "#b0703f", cocoa: "#7a4a2c", green: "#3bb273", deepGreen: "#23865a", leaf: "#52c26b",
  lime: "#a8e05a", mint: "#c9f0b0", sage: "#9dbf94", teal: "#2f7d74", terracotta: "#e2764b",
  white: "#fffdf6", lilac: "#c9a7ff", peach: "#ffb38a",
};

function face(x, y, s = 1) {
  return `<g class="face" transform="translate(${x} ${y}) scale(${s})" stroke="none">
    <g class="eyes"><ellipse cx="-7" cy="0" rx="2.7" ry="3.5" fill="${INK}"/><ellipse cx="7" cy="0" rx="2.7" ry="3.5" fill="${INK}"/>
    <circle cx="-6.2" cy="-1.3" r="0.9" fill="#fff"/><circle cx="7.8" cy="-1.3" r="0.9" fill="#fff"/></g>
    <path d="M-4.5 5.2Q0 9.8 4.5 5.2" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>
    <ellipse cx="-12.5" cy="5" rx="3.8" ry="2.4" fill="#ff6f9f" opacity=".5"/>
    <ellipse cx="12.5" cy="5" rx="3.8" ry="2.4" fill="#ff6f9f" opacity=".5"/>
  </g>`;
}

const shine = (x, y, rx, ry, rot = 20) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="none" opacity=".5" transform="rotate(${rot} ${x} ${y})"/>`;

const n1 = (v) => +v.toFixed(1);
const TAU = Math.PI * 2;

/** Ellipse outline made of `n` round bumps (lychee skin, walnut shell, custard-apple knobs). */
function scallop(cx, cy, rx, ry, n, bump) {
  let d = `M${n1(cx)} ${n1(cy - ry)}`;
  for (let i = 1; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * TAU;
    const m = a - Math.PI / n;
    d += `Q${n1(cx + (rx + bump) * Math.cos(m))} ${n1(cy + (ry + bump) * Math.sin(m))} ${n1(cx + rx * Math.cos(a))} ${n1(cy + ry * Math.sin(a))}`;
  }
  return `${d}Z`;
}

/** Ellipse outline with `n` sharp spikes (durian). */
function spikes(cx, cy, rx, ry, n, len) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * TAU;
    const m = a + Math.PI / n;
    d += `${i ? "L" : "M"}${n1(cx + rx * Math.cos(a))} ${n1(cy + ry * Math.sin(a))}L${n1(cx + (rx + len) * Math.cos(m))} ${n1(cy + (ry + len) * Math.sin(m))}`;
  }
  return `${d}Z`;
}

function star(cx, cy, ro, ri, n = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i / (n * 2)) * TAU;
    const r = i % 2 ? ri : ro;
    d += `${i ? "L" : "M"}${n1(cx + r * Math.cos(a))} ${n1(cy + r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

/** Parallel lines across an ellipse at `angle` degrees, leaving a gap for the face box. */
function hatch(cx, cy, rx, ry, step, angle, hole) {
  const ux = Math.cos((angle * Math.PI) / 180), uy = Math.sin((angle * Math.PI) / 180);
  const segs = [];
  for (let k = -Math.max(rx, ry); k <= Math.max(rx, ry); k += step) {
    const px = cx - uy * k, py = cy + ux * k;
    const a = (ux / rx) ** 2 + (uy / ry) ** 2;
    const b = 2 * (((px - cx) * ux) / rx ** 2 + ((py - cy) * uy) / ry ** 2);
    const c = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 - 1;
    const disc = b * b - 4 * a * c;
    if (disc <= 0) continue;
    const t0 = (-b - Math.sqrt(disc)) / (2 * a), t1 = (-b + Math.sqrt(disc)) / (2 * a);
    let h0 = Infinity, h1 = -Infinity;
    if (hole) {
      const [x0, y0, x1, y1] = hole;
      let lo = -Infinity, hi = Infinity;
      for (const [p, u, mn, mx] of [[px, ux, x0, x1], [py, uy, y0, y1]]) {
        if (Math.abs(u) < 1e-9) { if (p < mn || p > mx) { lo = Infinity; } continue; }
        const ta = (mn - p) / u, tb = (mx - p) / u;
        lo = Math.max(lo, Math.min(ta, tb)); hi = Math.min(hi, Math.max(ta, tb));
      }
      if (lo < hi) { h0 = lo; h1 = hi; }
    }
    const pieces = h0 < h1 ? [[t0, Math.min(h0, t1)], [Math.max(h1, t0), t1]] : [[t0, t1]];
    for (const [s, e] of pieces) {
      if (e - s < 2) continue;
      segs.push(`M${n1(px + ux * s)} ${n1(py + uy * s)}L${n1(px + ux * e)} ${n1(py + uy * e)}`);
    }
  }
  return segs.join("");
}

/** Points on a staggered grid inside an ellipse, skipping the face box. */
function grid(cx, cy, rx, ry, step, hole, fillRatio = 0.86) {
  const pts = [];
  for (let y = cy - ry, row = 0; y <= cy + ry; y += step * 0.87, row++) {
    for (let x = cx - rx + (row % 2 ? step / 2 : 0); x <= cx + rx; x += step) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > fillRatio) continue;
      if (hole && x > hole[0] && x < hole[2] && y > hole[1] && y < hole[3]) continue;
      pts.push([n1(x), n1(y)]);
    }
  }
  return pts;
}

/** A stroked stem with an ink edge, for shapes that are lines rather than fills. */
const inkStroke = (d, colour, w) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5.5}"/><path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}"/>`;

// Archetypes: (c, f) => markup in a 100x100 box. `c` holds colours, `f` is the face function
// (a no-op when drawing the sticker silhouette).
const A = {
  round: (c, f) => `
    <path d="M50 31C36 20 13 26 14 52C15 77 34 91 50 85C66 91 85 77 86 52C87 26 64 20 50 31Z" fill="${c.body}"/>
    ${shine(31, 46, 5, 9)}
    ${c.calyx
      ? `<path d="M50 32L40 24L46 30L36 30L47 34L42 40L50 35L58 40L53 34L64 30L54 30L60 24Z" fill="${c.calyx}"/>`
      : `<path d="M50 32C50 24 51 18 55 11" fill="none"/>`}
    ${c.leaf ? `<path d="M54 21C60 9 76 7 83 11C79 23 64 28 54 21Z" fill="${c.leaf}"/>` : ""}
    ${c.crown ? `<path d="M42 31L44 22L48 29L50 20L52 29L56 22L58 31Z" fill="${c.crown}"/>` : ""}
    ${f(50, 60)}`,

  oval: (c, f) => `
    <ellipse cx="50" cy="57" rx="31" ry="33" fill="${c.body}"/>
    ${c.stripes ? `<path d="M50 26C40 40 40 74 50 89M50 26C60 40 60 74 50 89M50 26C28 42 28 72 50 89M50 26C72 42 72 72 50 89" fill="none" stroke="${c.stripes}" stroke-width="2.2"/>` : ""}
    ${c.cleft ? `<path d="M50 25C43 40 43 72 50 89" fill="none" stroke-width="2.4" opacity=".45"/>` : ""}
    ${shine(33, 46, 5, 9)}
    <path d="M50 25C50 18 52 13 56 9" fill="none"/>
    ${c.leaf ? `<path d="M55 17C62 6 77 5 83 9C78 21 64 24 55 17Z" fill="${c.leaf}"/>` : ""}
    ${f(50, 60)}`,

  pear: (c, f) => `
    <path d="M50 17C40 17 38 30 38 40C38 48 22 56 22 71C22 85 36 93 50 93C64 93 78 85 78 71C78 56 62 48 62 40C62 30 60 17 50 17Z" fill="${c.body}"/>
    ${c.fuzz ? `<path d="M34 62q2-2 4 0M60 58q2-2 4 0M46 80q2-2 4 0M64 76q2-2 4 0" fill="none" stroke-width="2" opacity=".4"/>` : ""}
    ${shine(35, 64, 5, 9)}
    <path d="M50 18C50 12 52 8 56 4" fill="none"/>
    <path d="M54 12C60 3 74 2 80 6C75 16 62 18 54 12Z" fill="${c.leaf}"/>
    ${f(50, 70)}`,

  fig: (c, f) => `
    <path d="M50 14C57 14 58 24 60 30C77 40 85 56 81 70C77 84 64 91 50 91C36 91 23 84 19 70C15 56 23 40 40 30C42 24 43 14 50 14Z" fill="${c.body}"/>
    <path d="M50 30C46 50 46 70 50 88M40 34C32 50 32 72 40 86M60 34C68 50 68 72 60 86" fill="none" stroke-width="2" opacity=".35"/>
    ${shine(33, 58, 5, 9)}
    <path d="M48 15L50 7L52 15Z" fill="${c.leaf}"/>
    ${f(50, 64)}`,

  berry: (c, f) => {
    const dots = [[36, 42], [50, 40], [64, 42], [29, 54], [43, 53], [57, 53], [71, 54], [34, 66], [48, 66], [62, 66], [42, 78], [56, 78]];
    return `
    <path d="M50 91C29 85 19 65 21 48C23 34 36 28 50 28C64 28 77 34 79 48C81 65 71 85 50 91Z" fill="${c.body}"/>
    ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.6" fill="${c.body2}" stroke="none"/><circle cx="${x - 1.6}" cy="${y - 1.8}" r="1.3" fill="#fff" stroke="none" opacity=".7"/>`).join("")}
    <path d="M50 31C44 25 36 22 30 23C36 17 44 17 48 21C48 15 50 11 52 8C55 12 55 17 54 21C58 17 65 17 71 22C65 22 56 25 50 31Z" fill="${c.leaf}"/>
    ${f(50, 58)}`;
  },

  cluster: (c, f) => {
    const berry = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.body}"/>
      <path d="M${x - 4} ${y - r + 4}l4 3 4-3" fill="none" stroke-width="2.2"/>${shine(x - r / 2.6, y - r / 5, r / 5, r / 3.2)}`;
    return `${berry(50, 36, 19)}${berry(31, 62, 20)}${berry(69, 62, 20)}${f(31, 66, 0.72)}${f(69, 66, 0.72)}`;
  },

  currants: (c, f) => {
    const pts = [[38, 42, 12], [58, 48, 12], [44, 63, 13], [64, 70, 12], [50, 83, 12]];
    return `
    <path d="M26 10C40 16 54 26 66 40M40 22L38 42M54 30L58 48M48 40L44 63M62 50L64 70M52 60L50 83" fill="none" stroke="${c.stem}" stroke-width="3"/>
    <path d="M24 12C18 2 32 -2 36 8C32 12 28 14 24 12Z" fill="${c.leaf}"/>
    ${pts.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 && c.body2 ? c.body2 : c.body}"/>${shine(x - 4, y - 3, 2.5, 4)}`).join("")}
    ${f(50, 84, 0.55)}`;
  },

  cherry: (c, f) => `
    <path d="M58 12C50 30 40 44 34 60M58 12C62 32 66 48 70 62" fill="none" stroke="${c.stem}" stroke-width="3.2"/>
    <path d="M58 12C66 2 82 2 88 8C82 18 68 20 58 12Z" fill="${c.leaf}"/>
    <circle cx="33" cy="72" r="18" fill="${c.body}"/>${shine(25, 66, 3.5, 6)}
    <circle cx="70" cy="74" r="18" fill="${c.body2 || c.body}"/>${shine(62, 68, 3.5, 6)}
    ${f(33, 75, 0.62)}${f(70, 77, 0.62)}`,

  strawberry: (c, f) => {
    const seeds = [[36, 42], [50, 40], [64, 42], [30, 54], [44, 54], [58, 54], [70, 54], [38, 68], [52, 68], [64, 66], [46, 80], [56, 80]];
    return `
    <path d="M50 92C29 80 13 60 15 41C17 27 32 22 50 27C68 22 83 27 85 41C87 60 71 80 50 92Z" fill="${c.body}"/>
    ${seeds.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.7" ry="2.6" fill="${C.yellow}" stroke="none"/>`).join("")}
    <path d="M50 31C43 27 33 28 26 27C32 21 41 20 46 23C44 17 46 11 50 7C54 11 56 17 54 23C59 20 68 21 74 27C67 28 57 27 50 31Z" fill="${c.leaf}"/>
    ${f(50, 58)}`;
  },

  root: (c, f) => `
    <g fill="${c.leaf}"><path d="M47 30C37 22 29 12 31 3C41 7 47 17 50 28Z"/><path d="M50 30C48 18 50 8 57 2C61 12 57 22 53 30Z"/><path d="M53 31C61 21 71 15 78 15C74 25 63 31 55 33Z"/></g>
    <g transform="translate(50 0) scale(${c.thin ? 0.68 : 1} 1) translate(-50 0)">
      <path d="M29 34C29 25 71 25 71 34C71 54 59 78 50 97C41 78 29 54 29 34Z" fill="${c.body}"/>
      <path d="M35 46h8M58 55h7M40 66h7M54 76h5" fill="none" stroke-width="2.3" opacity=".45"/>
    </g>
    ${f(50, 46, c.thin ? 0.62 : 0.82)}`,

  bulbroot: (c, f) => `
    ${c.side ? `<path d="M22 56C12 46 8 34 10 26M78 56C88 46 92 34 90 26" fill="none" stroke="${c.stem}" stroke-width="3.2"/><path d="M10 26C2 20 6 10 14 14C16 18 14 24 10 26Z M90 26C98 20 94 10 86 14C84 18 86 24 90 26Z" fill="${c.leaf}"/>` : ""}
    <path d="M44 32C38 22 30 14 32 4C42 8 48 18 49 30Z M56 32C62 22 70 14 68 4C58 8 52 18 51 30Z" fill="${c.leaf}"/>
    <path d="M49 31L47 14M51 31L53 14" fill="none" stroke="${c.stem}" stroke-width="2.6"/>
    <path d="M50 30C71 30 84 44 82 62C80 78 66 86 55 88${c.knobbly ? "" : "L50 98L45 88"}C34 86 20 78 18 62C16 44 29 30 50 30Z" fill="${c.body}"/>
    ${c.cap ? `<path d="M19 54C22 40 34 30 50 30C66 30 78 40 81 54C66 47 34 47 19 54Z" fill="${c.cap}"/>` : ""}
    ${c.knobbly ? `<path d="M30 83l-6 9M42 88l-2 9M58 88l3 9M70 83l7 7" fill="none" stroke-width="2.4"/>` : ""}
    ${shine(31, 58, 4, 8)}
    ${f(50, 64)}`,

  potato: (c, f) => {
    const spud = (face) => `
      <path d="M21 58C17 40 33 26 54 28C76 30 87 46 83 62C79 80 60 87 44 85C29 83 23 72 21 58Z" fill="${c.body}"/>
      <path d="M33 44q3-2 6 0M68 44q3-2 6 0M36 72q3-2 6 0M70 68q3-2 6 0" fill="none" stroke-width="2.2" opacity=".5"/>
      ${c.blush ? `<ellipse cx="72" cy="58" rx="7" ry="5" fill="${c.blush}" stroke="none" opacity=".6"/>` : ""}
      ${face ? f(52, 58) : ""}`;
    if (!c.pair) return spud(true);
    return `<g transform="translate(34 4) scale(.62)">${spud(false)}</g><g transform="translate(-4 30) scale(.74)">${spud(true)}</g>`;
  },

  leafy: (c, f) => {
    const shape = c.curly
      ? "M50 92C38 80 26 66 26 50C19 46 23 37 28 35C22 29 28 21 34 22C34 13 42 9 48 13C52 7 61 9 62 15C70 13 77 21 72 28C80 32 78 42 72 44C76 54 64 78 50 92Z"
      : c.lobed
        ? "M50 92C44 80 40 70 38 60L30 58L37 52L28 44L37 40L32 30L42 30L42 18C46 12 54 12 58 18L58 30L68 30L63 40L72 44L63 52L70 58L62 60C60 70 56 80 50 92Z"
        : "M50 92C34 76 26 44 36 22C42 10 58 10 64 22C74 44 66 76 50 92Z";
    const leaf = (rot) => `<g transform="rotate(${rot} 50 92)">
      <path d="${shape}" fill="${c.body}"/>
      ${c.dots ? `<path d="M42 40h.1M56 34h.1M44 58h.1M58 52h.1M50 70h.1" fill="none" stroke="${c.dots}" stroke-width="4"/>` : ""}
      ${c.stalk ? `<path d="M44 92C42 76 42 64 45 54L55 54C58 64 58 76 56 92Z" fill="${c.stalk}"/>` : ""}
      <path d="M50 90C48 66 50 42 52 22" fill="none" stroke="${c.rib || INK}" stroke-width="${c.rib ? 4 : 2.3}"/>
    </g>`;
    return `${leaf(-30)}${leaf(30)}${leaf(0)}${f(50, 50, 0.72)}`;
  },

  rosette: (c, f) => {
    const leaves = [0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="50" cy="32" rx="12" ry="20" fill="${c.body}" transform="rotate(${r} 50 56)"/>`).join("");
    return `${leaves}<circle cx="50" cy="56" r="16" fill="${c.body2}"/>${f(50, 56, 0.7)}`;
  },

  head: (c, f) => {
    const outline = c.frilly
      ? "M14 58C8 50 12 40 18 38C16 28 26 22 32 24C36 16 46 14 50 20C56 14 66 16 68 24C76 22 84 30 82 38C90 42 90 52 86 58C88 78 70 90 50 90C30 90 12 78 14 58Z"
      : "M14 58C12 36 30 22 50 22C70 22 88 36 86 58C84 80 68 90 50 90C32 90 16 80 14 58Z";
    const single = (face) => `
      <path d="${outline}" fill="${c.body}"/>
      <path d="M16 62C10 50 14 34 26 30C22 44 24 58 30 70Z M84 62C90 50 86 34 74 30C78 44 76 58 70 70Z" fill="${c.body2}"/>
      <path d="M28 44C36 34 64 34 72 44M22 62C30 46 44 42 50 42C58 42 72 48 78 62M50 42C46 56 46 74 50 88" fill="none" stroke="${c.vein || INK}" stroke-width="${c.vein ? 3 : 2.2}" opacity="${c.vein ? 1 : 0.5}"/>
      ${face ? f(50, 66) : ""}`;
    if (!c.trio) return single(true);
    return `<path d="M50 96L50 60" fill="none" stroke="${c.body2}" stroke-width="8"/>
      <g transform="translate(-2 10) scale(.52)">${single(false)}</g><g transform="translate(50 12) scale(.52)">${single(false)}</g><g transform="translate(22 40) scale(.6)">${single(true)}</g>`;
  },

  cauliflower: (c, f) => `
    <path d="M50 92C26 92 6 78 10 56C18 66 30 70 50 70C70 70 82 66 90 56C94 78 74 92 50 92Z" fill="${c.leaf}"/>
    <path d="M12 60C4 44 10 30 22 30C22 46 30 58 40 66Z M88 60C96 44 90 30 78 30C78 46 70 58 60 66Z" fill="${c.leaf}"/>
    <path d="M20 62C14 48 24 34 34 36C36 26 46 22 52 28C58 22 70 26 70 34C80 34 88 48 80 62C66 70 34 70 20 62Z" fill="${c.body}"/>
    <path d="M34 42q4-3 8 0M56 38q4-3 8 0M44 54q4-3 8 0M66 52q4-3 8 0M26 52q4-3 8 0" fill="none" stroke-width="2" opacity=".35"/>
    ${f(50, 52, 0.8)}`,

  broccoli: (c, f) => c.sprouting
    ? `<path d="M50 96L42 58M50 96L50 50M50 96L60 58" fill="none" stroke="${c.stalk}" stroke-width="6"/>
       <path d="M50 96L42 58M50 96L50 50M50 96L60 58" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".3"/>
       <path d="M22 70C18 64 26 58 30 62C34 54 44 62 38 68C36 76 26 76 22 70Z" fill="${c.leaf}"/>
       ${[[34, 48, 15], [66, 50, 15], [50, 30, 17]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.body}"/><path d="M${x - 6} ${y - 2}h.1M${x + 5} ${y - 4}h.1M${x} ${y + 5}h.1" fill="none" stroke="${c.body2}" stroke-width="4"/>`).join("")}
       ${f(50, 32, 0.6)}`
    : `<path d="M41 92L44 60L56 60L59 92Z" fill="${c.stalk}"/>
       <path d="M24 62C11 60 11 38 26 36C26 22 42 17 50 26C58 17 74 22 74 36C89 38 89 60 76 62Z" fill="${c.body}"/>
       <path d="M30 46h.1M44 38h.1M60 40h.1M68 52h.1M36 56h.1M54 52h.1" fill="none" stroke="${c.body2}" stroke-width="5"/>
       ${f(50, 48, 0.85)}`,

  asparagus: (c, f) => {
    const spear = (dx, rot) => `<g transform="rotate(${rot} 50 94) translate(${dx} 0)">
      <path d="M43 94L43 30C43 20 47 14 50 8C53 14 57 20 57 30L57 94Z" fill="${c.body}"/>
      <path d="M43 30C45 22 48 16 50 12C52 16 55 22 57 30C54 28 46 28 43 30Z" fill="${c.tip}"/>
      <path d="M44 42l4 3M56 50l-4 3M44 60l4 3M56 68l-4 3" fill="none" stroke="${c.tip}" stroke-width="2.4"/></g>`;
    return `${spear(-16, -8)}${spear(16, 8)}${spear(0, 0)}
      <path d="M24 78C40 84 60 84 76 78L76 86C60 92 40 92 24 86Z" fill="${c.band}"/>
      ${f(50, 54, 0.5)}`;
  },

  rhubarb: (c, f) => {
    const stalk = (dx, rot) => `<g transform="rotate(${rot} 50 96) translate(${dx} 0)"><path d="M43 96C41 72 42 50 45 34L55 34C58 50 59 72 57 96Z" fill="${c.body}"/><path d="M49 40C48 58 48 76 50 92" fill="none" stroke="${c.body2}" stroke-width="3"/></g>`;
    const leaf = c.small
      ? `<path d="M34 36C28 26 36 16 44 20C48 10 60 12 60 20C70 18 74 30 66 36C58 42 42 42 34 36Z" fill="${c.leaf}"/>`
      : `<path d="M18 36C10 20 28 6 44 12C54 2 78 6 82 22C92 28 86 44 72 42C62 50 28 48 18 36Z" fill="${c.leaf}"/><path d="M50 38L34 20M50 38L50 12M50 38L70 20" fill="none" stroke-width="2" opacity=".4"/>`;
    return `${stalk(-14, -6)}${stalk(14, 6)}${leaf}${stalk(0, 0)}${f(50, 64, 0.5)}`;
  },

  celery: (c, f) => `
    <path d="M26 30C18 20 26 8 36 14C40 4 54 4 56 14C64 6 78 12 74 22C84 26 80 38 70 36Z" fill="${c.leaf}"/>
    ${[[-14, -7], [14, 7], [-6, -2], [6, 2]].map(([dx, rot]) => `<g transform="rotate(${rot} 50 96) translate(${dx} 0)"><path d="M42 96C40 72 41 50 43 30L57 30C59 50 60 72 58 96Z" fill="${c.body}"/><path d="M47 34V92M53 34V92" fill="none" stroke="${c.body2}" stroke-width="2"/></g>`).join("")}
    ${f(50, 66, 0.7)}`,

  leek: (c, f) => `
    <path d="M40 54C34 38 24 22 14 12C30 14 44 30 49 50Z M60 54C66 38 76 22 86 12C70 14 56 30 51 50Z" fill="${c.leaf}"/>
    <path d="M43 54C43 34 46 18 50 5C54 18 57 34 57 54Z" fill="${c.leaf}"/>
    <path d="M38 94L38 52C44 48 56 48 62 52L62 94C56 98 44 98 38 94Z" fill="${c.body}"/>
    <path d="M38 52C44 48 56 48 62 52L62 62C56 58 44 58 38 62Z" fill="${c.body2}" stroke="none"/>
    <path d="M42 96l-4 3M50 97v3M58 96l4 3" fill="none" stroke-width="2"/>
    ${f(50, 76, 0.66)}`,

  springonion: (c, f) => `
    ${[[-16, -8], [16, 8], [0, 0]].map(([dx, rot]) => `<g transform="rotate(${rot} 50 96) translate(${dx} 0)"><path d="M46 70L45 10L50 4L55 10L54 70Z" fill="${c.leaf}"/><path d="M50 66C60 70 62 84 54 92L46 92C38 84 40 70 50 66Z" fill="${c.body}"/><path d="M48 92l-2 5M52 92l2 5" fill="none" stroke-width="2"/></g>`).join("")}
    ${f(50, 80, 0.42)}`,

  pod: (c, f) => c.flat
    ? `<path d="M8 50C30 34 70 32 92 44C74 66 30 68 8 50Z" fill="${c.body}"/>
       <path d="M30 50q5-6 10 0M46 50q5-6 10 0M62 48q5-6 10 0" fill="none" stroke-width="2.2" opacity=".45"/>
       <path d="M90 44C94 38 96 34 94 28" fill="none" stroke="${c.leaf}" stroke-width="3"/>
       ${f(48, 52, 0.62)}`
    : `<path d="M8 38C28 64 70 72 92 44C86 74 60 88 40 82C22 78 10 60 8 38Z" fill="${c.body}"/>
       ${[[28, 58, 10], [46, 64, 11], [64, 62, 10], [79, 54, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.body2}"/>${shine(x - 3, y - 3, 2, 3.5)}`).join("")}
       <path d="M8 38C28 58 68 64 92 44" fill="none"/>
       <path d="M92 44C98 38 98 30 92 26" fill="none" stroke="${c.leaf}" stroke-width="3"/>
       ${f(46, 66, 0.46)}`,

  beans: (c, f) => {
    const w = c.wide ? 1.4 : 1;
    const bean = (dy, rot) => `<g transform="translate(0 ${dy}) rotate(${rot} 50 50)"><path d="M12 30C28 ${46 - 4 * w} 58 ${70 - 2 * w} 88 ${76}C${92 + 2 * w} ${82} 86 ${86 + 2 * w} 80 ${84 + 2 * w}C54 ${76 + 6 * w} 24 ${54 + 6 * w} 10 34C8 30 10 28 12 30Z" fill="${c.body}"/>
      ${c.wide ? `<path d="M26 44q4 0 6 4M46 58q4 0 6 4M64 68q4 0 6 4" fill="none" stroke-width="2" opacity=".4"/>` : ""}</g>`;
    return `${bean(-14, -4)}${bean(14, 4)}${bean(0, 0)}${f(50, 60, 0.46)}`;
  },

  pumpkin: (c, f) => `
    <path d="M46 34C46 26 48 20 55 15L60 19C55 24 55 28 55 34Z" fill="${c.stem}"/>
    <path d="M58 18C66 10 74 14 70 22" fill="none" stroke="${c.stem}" stroke-width="2.4"/>
    <ellipse cx="28" cy="61" rx="18" ry="26" fill="${c.body}"/><ellipse cx="72" cy="61" rx="18" ry="26" fill="${c.body}"/>
    <ellipse cx="40" cy="61" rx="17" ry="28" fill="${c.body}"/><ellipse cx="60" cy="61" rx="17" ry="28" fill="${c.body}"/>
    <ellipse cx="50" cy="61" rx="15" ry="29" fill="${c.body2}"/>
    ${f(50, 64, 0.85)}`,

  butternut: (c, f) => `
    <path d="M40 15C52 13 58 21 58 35C58 45 56 49 64 57C78 69 74 93 50 93C26 93 22 69 36 57C44 49 40 45 40 35C40 25 36 17 40 15Z" fill="${c.body}"/>
    <path d="M46 16L47 8L53 8L52 16Z" fill="${c.stem}"/>
    ${shine(36, 72, 4, 8)}
    ${f(50, 74, 0.85)}`,

  long: (c, f) => `
    <g transform="translate(50 50) scale(${c.fat ? "1.12 1.3" : "1 1"}) translate(-50 -50)">
    <path d="M18 78C10 70 16 60 26 54L66 22C74 16 86 20 86 30C86 38 80 42 74 46L34 78C28 84 22 82 18 78Z" fill="${c.body}"/>
    ${c.stripes ? `<path d="M26 64L70 30M32 72L78 38" fill="none" stroke="${c.stripes}" stroke-width="3"/>` : ""}
    ${c.dots ? `<path d="M34 60h.1M50 48h.1M64 38h.1M44 66h.1M60 54h.1M72 42h.1" fill="none" stroke="${c.dots}" stroke-width="3.5"/>` : ""}
    <path d="M74 21L84 12L90 17L82 27Z" fill="${c.cap}"/>
    </g>
    ${f(49, 53, 0.78)}`,

  aubergine: (c, f) => `
    <path d="M60 22C74 22 82 34 78 48C74 66 64 90 42 90C22 90 16 72 24 58C32 44 40 36 44 30C48 24 54 22 60 22Z" fill="${c.body}"/>
    ${shine(30, 70, 4, 9, 30)}
    <path d="M46 31C48 21 57 15 65 16C73 16 80 22 78 31C72 27 66 30 62 35C58 29 52 29 46 31Z" fill="${c.cap}"/>
    <path d="M64 17L68 6" fill="none" stroke="${c.cap}" stroke-width="5"/>
    ${f(47, 62, 0.85)}`,

  corn: (c, f) => {
    const kernels = [];
    for (let y = 22; y <= 80; y += 9) for (let x = 38; x <= 62; x += 8) kernels.push(`<rect x="${x - 3}" y="${y - 3.5}" width="6" height="7" rx="2.5" fill="${c.body2}" stroke="none"/>`);
    return `
    <path d="M50 14C64 14 70 36 70 56C70 76 62 90 50 90C38 90 30 76 30 56C30 36 36 14 50 14Z" fill="${c.body}"/>
    ${kernels.join("")}
    <path d="M50 96C28 90 20 60 24 34C34 54 40 74 50 96Z M50 96C72 90 80 60 76 34C66 54 60 74 50 96Z" fill="${c.leaf}"/>
    ${f(50, 46, 0.72)}`;
  },

  mushroom: (c, f) => {
    const shroom = (face) => `
      <path d="M38 56C38 70 35 82 40 88C46 92 54 92 60 88C65 82 62 70 62 56Z" fill="${c.stem}"/>
      <path d="M13 56C13 31 30 18 50 18C70 18 87 31 87 56C87 62 13 62 13 56Z" fill="${c.cap}"/>
      ${c.spots ? `<circle cx="34" cy="36" r="4" fill="${c.spots}" stroke="none"/><circle cx="58" cy="30" r="5" fill="${c.spots}" stroke="none"/><circle cx="70" cy="46" r="3.5" fill="${c.spots}" stroke="none"/>` : ""}
      ${shine(30, 34, 4, 8, 40)}
      ${face ? f(50, 42, 0.85) : ""}`;
    if (!c.pair) return shroom(true);
    return `<g transform="translate(46 34) scale(.56)">${shroom(false)}</g><g transform="translate(-2 8) scale(.84)">${shroom(true)}</g>`;
  },

  chestnut: (c, f) => `
    <path d="M50 16C62 16 86 36 84 60C82 80 66 88 50 88C34 88 18 80 16 60C14 36 38 16 50 16Z" fill="${c.body}"/>
    <path d="M18 66C30 74 70 74 82 66C80 82 66 88 50 88C34 88 20 82 18 66Z" fill="${c.body2}"/>
    <path d="M48 17L50 8L52 17Z" fill="${c.body2}"/>
    ${shine(34, 40, 5, 10, 30)}
    ${f(50, 50, 0.85)}`,

  cobnut: (c, f) => `
    <ellipse cx="50" cy="62" rx="25" ry="27" fill="${c.body}"/>
    <path d="M22 52C17 38 21 22 30 17L34 28L40 13L46 26L52 9L58 26L64 13L68 28L74 17C81 23 83 38 78 52C66 44 34 44 22 52Z" fill="${c.leaf}"/>
    ${shine(38, 66, 4, 7)}
    ${f(50, 70, 0.72)}`,

  herb: (c, f) => {
    const leafShapes = {
      round: "M0 0C7 -11 22 -11 27 0C22 11 7 11 0 0Z",
      needle: "M0 0C6 -3.5 16 -3.5 22 0C16 3.5 6 3.5 0 0Z",
      frilly: "M0 0C1 -8 9 -13 13 -8C19 -13 27 -7 23 0C27 7 19 13 13 8C9 13 1 8 0 0Z",
    };
    const shape = leafShapes[c.leafShape];
    const leaf = (x, y, rot, sc) => `<path d="${shape}" fill="${c.body}" transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"/>`;
    let plant;
    if (c.leafShape === "grass") {
      const blades = "M40 64L34 10M46 64L44 6M52 64L54 8M58 64L64 12";
      plant = `<path d="${blades}" fill="none" stroke="${c.body}" stroke-width="5"/><path d="${blades}" fill="none" stroke-width="1.4" opacity=".35"/><circle cx="33" cy="12" r="8" fill="${C.lilac}"/><path d="M29 10h.1M35 9h.1M33 15h.1" fill="none" stroke="${C.purple}" stroke-width="3"/>`;
    } else if (c.leafShape === "frilly") {
      const tips = [[26, 28, -140], [50, 14, -90], [74, 28, -40]];
      plant = `<path d="M50 66C46 50 34 40 26 28M50 66C50 46 50 30 50 14M50 66C54 50 66 40 74 28" fill="none" stroke="${c.stem}" stroke-width="3"/>
        ${tips.map(([x, y, r]) => leaf(x, y, r - 35, 0.95) + leaf(x, y, r + 35, 0.95) + leaf(x, y, r, 1.05)).join("")}`;
    } else if (c.leafShape === "needle") {
      const leaves = [];
      for (let i = 0; i < 7; i++) {
        const y = 58 - i * 6.6;
        const sc = 1 - i * 0.07;
        leaves.push(leaf(51, y, -150 + i * 4, sc), leaf(51, y - 3, -30 - i * 4, sc));
      }
      plant = `<path d="M51 66C50 50 49 30 52 8" fill="none" stroke="${c.stem}" stroke-width="3.5"/>${leaves.join("")}${leaf(52, 12, -90, 0.9)}`;
    } else {
      const pairs = [[56, 1.15], [40, 1.0], [26, 0.8]];
      plant = `<path d="M50 66C49 50 49 30 51 12" fill="none" stroke="${c.stem}" stroke-width="3.5"/>
        ${pairs.map(([y, sc]) => leaf(49, y, -168, sc) + leaf(51, y - 2, -12, sc)).join("")}${leaf(51, 16, -90, 0.8)}`;
    }
    return `
    ${plant}
    <path d="M26 64H74L76 72H24Z" fill="${C.terracotta}"/>
    <path d="M29 72H71L66 95H34Z" fill="${C.terracotta}"/>
    <path d="M31 72H69" fill="none" stroke-width="2" opacity=".35"/>
    ${f(50, 83, 0.68)}`;
  },

  wildgarlic: (c, f) => `
    <path d="M50 94C34 80 24 50 30 22C40 42 48 70 50 94Z" fill="${c.body}"/>
    <path d="M50 94C66 80 76 50 70 22C60 42 52 70 50 94Z" fill="${c.body}"/>
    <path d="M50 94L50 30" fill="none" stroke="${c.body}" stroke-width="4"/>
    ${[[50, 22], [40, 26], [60, 26], [45, 14], [56, 14]].map(([x, y]) => `<path d="M${x} ${y - 6}L${x + 2} ${y - 2}L${x + 6} ${y}L${x + 2} ${y + 2}L${x} ${y + 6}L${x - 2} ${y + 2}L${x - 6} ${y}L${x - 2} ${y - 2}Z" fill="${C.white}" stroke-width="1.6"/>`).join("")}
    ${f(50, 68, 0.5)}`,

  nettle: (c, f) => {
    const serr = "M0 0L4 -6L8 -8L10 -12L14 -12L16 -16L20 -14L24 -16L26 -12L30 -10L30 -6L34 -2L30 0L34 2L30 6L30 10L26 12L24 16L20 14L16 16L14 12L10 12L8 8L4 6Z";
    return `<path d="M50 96L50 10" fill="none" stroke="${c.stem}" stroke-width="3.5"/>
      <path d="${serr}" fill="${c.body}" transform="translate(50 70) rotate(200)"/>
      <path d="${serr}" fill="${c.body}" transform="translate(50 70) rotate(-20)"/>
      <path d="${serr}" fill="${c.body}" transform="translate(50 42) rotate(200) scale(.8)"/>
      <path d="${serr}" fill="${c.body}" transform="translate(50 42) rotate(-20) scale(.8)"/>
      <path d="${serr}" fill="${c.body}" transform="translate(50 20) rotate(-90) scale(.7)"/>
      ${f(50, 58, 0.42)}`;
  },

  elderflower: (c, f) => {
    const dots = [];
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4;
      const r = 4 + Math.sqrt(i) * 5.4;
      dots.push(`<circle cx="${(50 + Math.cos(a) * r * 1.4).toFixed(1)}" cy="${(38 + Math.sin(a) * r * 0.8).toFixed(1)}" r="3.6" fill="${c.body}" stroke-width="1.4"/>`);
    }
    return `<path d="M50 96L50 58M50 58L34 46M50 58L66 46M50 58L50 44" fill="none" stroke="${c.stem}" stroke-width="3"/>
      <path d="M50 84C38 84 28 76 26 68C36 68 44 74 50 84Z M50 80C62 80 72 72 74 64C64 64 56 70 50 80Z" fill="${c.leaf}"/>
      <ellipse cx="50" cy="38" rx="36" ry="22" fill="${c.body2}"/>
      ${dots.join("")}
      ${f(50, 40, 0.66)}`;
  },

  courgetteflower: (c, f) => `
    <path d="M50 62C46 72 46 86 50 97C54 86 54 72 50 62Z" fill="${c.stem}"/>
    <path d="M50 64C38 54 22 42 18 20C32 24 42 30 46 38C45 24 48 12 54 6C59 16 59 28 56 38C62 28 72 22 84 20C80 42 64 54 50 64Z" fill="${c.body}"/>
    <path d="M50 60C48 48 44 38 36 30M50 60C52 48 54 36 54 24M50 60C56 50 64 40 72 32" fill="none" stroke="${c.body2}" stroke-width="2.4"/>
    ${f(52, 44, 0.6)}`,

  nasturtium: (c, f) => `
    <circle cx="30" cy="66" r="22" fill="${c.leaf}"/>
    <path d="M30 66L30 44M30 66L50 60M30 66L14 80M30 66L40 86M30 66L10 58" fill="none" stroke="${C.mint}" stroke-width="2"/>
    ${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="62" cy="22" rx="12" ry="15" fill="${c.body}" transform="rotate(${r} 62 40)"/>`).join("")}
    <circle cx="62" cy="40" r="9" fill="${c.body2}"/>
    ${f(62, 40, 0.5)}`,

  onion: (c, f) => {
    const bulb = (face) => `
      <path d="M50 12C54 22 58 26 66 32C80 40 86 56 80 70C74 84 62 90 50 90C38 90 26 84 20 70C14 56 20 40 34 32C42 26 46 22 50 12Z" fill="${c.body}"/>
      <path d="M50 16C40 36 36 60 44 88M50 16C60 36 64 60 56 88" fill="none" stroke="${c.body2}" stroke-width="2.4"/>
      <path d="M44 90l-4 6M50 90v7M56 90l4 6" fill="none" stroke-width="2"/>
      ${shine(32, 54, 4, 9)}
      ${face ? f(50, 62) : ""}`;
    if (!c.pair) return bulb(true);
    return `<g transform="translate(40 2) scale(.62)">${bulb(false)}</g><g transform="translate(-2 20) scale(.8)">${bulb(true)}</g>`;
  },

  garlic: (c, f) => `
    <path d="M50 14C52 24 58 28 66 34C80 44 84 62 76 76C70 86 60 90 50 90C40 90 30 86 24 76C16 62 20 44 34 34C42 28 48 24 50 14Z" fill="${c.body}"/>
    <path d="M50 34C42 50 40 70 44 88M50 34C58 50 60 70 56 88M36 40C28 54 28 72 34 84M64 40C72 54 72 72 66 84" fill="none" stroke="${c.body2}" stroke-width="2.4"/>
    <path d="M46 14L48 6L52 6L54 14Z" fill="${c.body}"/>
    ${f(50, 62, 0.85)}`,

  fennel: (c, f) => `
    <path d="M40 44C34 30 26 18 20 10M50 42C50 28 50 16 50 4M60 44C66 30 74 18 80 10" fill="none" stroke="${c.stem}" stroke-width="5"/>
    <path d="M20 10l-6-2M20 10l-2-7M50 4l-5-3M50 4l5-3M80 10l6-2M80 10l2-7M26 20l-7 1M74 20l7 1" fill="none" stroke="${c.leaf}" stroke-width="2.6"/>
    <path d="M22 70C18 54 30 42 40 42L60 42C70 42 82 54 78 70C74 86 62 92 50 92C38 92 26 86 22 70Z" fill="${c.body}"/>
    <path d="M40 44C36 58 38 78 46 90M60 44C64 58 62 78 54 90" fill="none" stroke-width="2" opacity=".4"/>
    ${f(50, 68, 0.8)}`,

  pepper: (c, f) => `
    <path d="M28 34C18 36 14 50 18 66C22 84 36 90 50 88C64 90 78 84 82 66C86 50 82 36 72 34C64 30 58 34 50 34C42 34 36 30 28 34Z" fill="${c.body}"/>
    <path d="M50 38C46 52 46 74 50 87" fill="none" stroke-width="2.2" opacity=".4"/>
    ${shine(30, 54, 4, 10)}
    <path d="M40 36C44 29 56 29 60 36C56 38 44 38 40 36Z" fill="${c.cap}"/>
    <path d="M50 32C50 24 54 18 60 14" fill="none" stroke="${c.cap}" stroke-width="5"/>
    ${f(50, 62)}`,

  chilli: (c, f) => `
    <path d="M30 20C40 20 44 28 46 36C52 58 64 76 84 90C62 92 40 78 32 58C28 46 24 32 30 20Z" fill="${c.body}"/>
    ${shine(36, 42, 3, 8, -20)}
    <path d="M24 22C26 14 36 12 40 20C36 24 28 26 24 22Z" fill="${c.cap}"/>
    <path d="M32 16C30 10 32 6 36 4" fill="none" stroke="${c.cap}" stroke-width="4"/>
    ${f(42, 48, 0.6)}`,

  artichoke: (c, f) => `
    <path d="M44 88L42 98L58 98L56 88Z" fill="${c.body2}"/>
    <path d="M50 10C62 18 80 34 80 56C80 76 66 90 50 90C34 90 20 76 20 56C20 34 38 18 50 10Z" fill="${c.body}"/>
    <path d="M30 30C40 38 46 36 50 26C54 36 60 38 70 30M22 50C34 58 44 56 50 46C56 56 66 58 78 50M24 70C36 78 44 76 50 66C56 76 64 78 76 70" fill="none" stroke-width="2.4"/>
    <path d="M50 26l-3 5h6ZM50 46l-3 5h6ZM50 66l-3 5h6Z" fill="${c.tip}" stroke="none"/>
    ${f(50, 58, 0.62)}`,

  samphire: (c) => {
    const d = "M50 96V60M50 72C40 66 32 58 30 44M50 60C58 52 66 44 68 30M50 60V32M30 44C26 40 24 34 24 26M68 30C72 26 74 20 74 12M50 32C46 26 46 20 48 12M30 44C34 38 38 34 40 28M68 30C62 26 60 20 60 14";
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="13"/>
      <path d="${d}" fill="none" stroke="${c.body}" stroke-width="7.5"/>
      <path d="M46 84h8M46 68h8M34 52l6-2M60 44l6 2M46 44h8" fill="none" stroke-width="2" opacity=".45"/>`;
  },

  chicory: (c, f) => `
    <path d="M50 8C66 20 72 50 66 76C62 88 56 94 50 94C44 94 38 88 34 76C28 50 34 20 50 8Z" fill="${c.body}"/>
    <path d="M50 8C60 16 64 26 64 36C58 28 54 20 50 8Z M50 8C40 16 36 26 36 36C42 28 46 20 50 8Z" fill="${c.tip}"/>
    <path d="M50 20C42 40 42 70 48 92M50 20C58 40 58 70 52 92" fill="none" stroke-width="2.2" opacity=".35"/>
    ${f(50, 62, 0.72)}`,

  banana: (c, f) => {
    const finger = "M12 40C18 86 70 96 84 36L90 28C74 62 30 62 14 37Z";
    return `
    <g transform="rotate(24 87 32)"><path d="${finger}" fill="${c.body2}"/><circle cx="12" cy="38.5" r="3" fill="${c.tip}"/></g>
    <path d="${finger}" fill="${c.body}"/>
    <circle cx="12" cy="38.5" r="3" fill="${c.tip}"/>
    <path d="M82 36L88 14L96 16L92 30Z" fill="${c.stem}"/>
    <path d="M20 47C32 70 62 78 82 40" fill="none" stroke-width="2.2" opacity=".3"/>
    ${shine(24, 58, 3, 7, -40)}
    ${f(48, 65, 0.72)}`;
  },

  kiwi: (c, f) => {
    const seeds = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * TAU;
      const x = n1(42 + 18.5 * Math.cos(a)), y = n1(60 + 18.5 * Math.sin(a));
      return `<ellipse cx="${x}" cy="${y}" rx="1.5" ry="2.8" fill="${INK}" stroke="none" transform="rotate(${n1((a * 180) / Math.PI + 90)} ${x} ${y})"/>`;
    }).join("");
    return `
    <ellipse cx="66" cy="38" rx="27" ry="22" fill="${c.skin}" transform="rotate(-28 66 38)"/>
    ${c.fuzz ? `<path d="M74 18l2-3M86 28l3-1M89 42l3 1M60 17l-1-3M50 24l-3-2" fill="none" stroke-width="2" opacity=".45"/>` : ""}
    ${shine(60, 26, 3, 6, -30)}
    <circle cx="42" cy="60" r="31" fill="${c.skin}"/>
    <circle cx="42" cy="60" r="26" fill="${c.body}"/>
    <path d="M42 36V44M42 76V84M18 60H26M58 60H66M25 43l6 6M59 43l-6 6M25 77l6-6M59 77l-6-6" fill="none" stroke="${c.core}" stroke-width="2" opacity=".6"/>
    <ellipse cx="42" cy="61" rx="13" ry="9.5" fill="${c.core}" stroke="none"/>
    ${seeds}
    ${f(42, 60, 0.58)}`;
  },

  lychee: (c, f) => {
    const texture = c.hairs
      ? Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * TAU;
        const [x0, y0] = [46 + 28 * Math.cos(a), 58 + 28 * Math.sin(a)];
        const [x1, y1] = [46 + 40 * Math.cos(a + 0.2), 58 + 40 * Math.sin(a + 0.2)];
        const [qx, qy] = [46 + 38 * Math.cos(a - 0.08), 58 + 38 * Math.sin(a - 0.08)];
        return `<path d="M${n1(x0)} ${n1(y0)}Q${n1(qx)} ${n1(qy)} ${n1(x1)} ${n1(y1)}" fill="none" stroke="${c.hairs}" stroke-width="4"/>`;
      }).join("")
      : "";
    const bumps = grid(46, 58, 27, 27, 9, [30, 50, 60, 72], 0.8)
      .map(([x, y]) => `M${x - 2.6} ${y + 1.6}L${x} ${y - 1.8}L${x + 2.6} ${y + 1.6}`).join("");
    return `
    ${texture}
    <path d="${c.hairs ? scallop(46, 58, 30, 30, 24, 2) : scallop(46, 58, 30, 30, 20, 4)}" fill="${c.body}"/>
    <path d="${bumps}" fill="none" stroke="${c.body2}" stroke-width="2.2"/>
    ${shine(30, 48, 4, 7)}
    <path d="M50 29C52 22 56 16 62 12" fill="none" stroke="${c.stem}" stroke-width="3.2"/>
    <path d="M60 13C66 3 80 3 86 7C80 17 68 19 60 13Z" fill="${c.leaf}"/>
    ${c.flesh ? `<ellipse cx="78" cy="74" rx="13" ry="14" fill="${c.flesh}"/>${shine(73, 69, 2.5, 5)}
      <path d="M64 76C65 92 91 92 92 76L87 80L83 75L78 81L73 75L69 80Z" fill="${c.body}"/>` : ""}
    ${f(45, 60, 0.85)}`;
  },

  longan: (c, f) => {
    const fruit = (x, y, r, face) => {
      const body = c.oval
        ? `<ellipse cx="${x}" cy="${y}" rx="${n1(r * 0.8)}" ry="${r}" fill="${c.body}"/>`
        : `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.body}"/>`;
      const specks = `<path d="M${x - r * 0.4} ${y + r * 0.45}h.1M${x + r * 0.5} ${y + r * 0.2}h.1M${x + r * 0.1} ${y + r * 0.62}h.1M${x - r * 0.55} ${y - r * 0.05}h.1" fill="none" stroke="${c.body2}" stroke-width="2.6"/>`;
      return `${body}${specks}${shine(x - r * 0.4, y - r * 0.3, r * 0.16, r * 0.3)}${face ? f(x, y + 2, 0.62) : ""}`;
    };
    return `
    <path d="M60 18C70 4 88 2 96 6C88 16 74 22 60 18Z M36 16C26 4 10 4 4 8C12 18 26 20 36 16Z" fill="${c.leaf}"/>
    <path d="M10 26C34 14 64 14 90 26M34 20L26 42M64 20L74 44M50 18L50 50M42 20L38 60M58 20L64 62" fill="none" stroke="${c.stem}" stroke-width="3"/>
    ${fruit(26, 44, 13, false)}${fruit(74, 46, 13, false)}${fruit(36, 62, 13, false)}${fruit(64, 64, 13, false)}${fruit(50, 74, 17, true)}`;
  },

  papaya: (c, f) => {
    const d = "M50 8C64 8 72 26 74 46C77 72 70 94 50 94C30 94 23 72 26 46C28 26 36 8 50 8Z";
    const seeds = [[44, 32], [50, 27], [56, 32], [42, 40], [49, 38], [57, 40], [44, 48], [51, 47], [57, 49], [48, 55], [54, 55]];
    return `
    <path d="M47 9L48 2L53 2L53 9Z" fill="${c.stem}"/>
    <path d="${d}" fill="${c.skin}"/>
    <path d="${d}" fill="${c.body}" transform="translate(50 52) scale(.84) translate(-50 -52)"/>
    <path d="M50 19C59 19 63 30 63 42C63 54 58 61 50 61C42 61 37 54 37 42C37 30 41 19 50 19Z" fill="${c.cavity}"/>
    ${seeds.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.7" fill="${INK}" stroke="none"/><circle cx="${x - 0.8}" cy="${y - 0.9}" r=".8" fill="#fff" stroke="none"/>`).join("")}
    ${f(50, 75, 0.72)}`;
  },

  passionfruit: (c, f) => {
    const seeds = [[62, 26], [72, 30], [58, 36], [70, 40], [78, 36], [66, 18]];
    return `
    <circle cx="64" cy="34" r="26" fill="${c.body}"/>
    <circle cx="64" cy="34" r="21" fill="${c.pith}"/>
    <circle cx="64" cy="34" r="16.5" fill="${c.pulp}" stroke="none"/>
    ${seeds.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c.pulp2}" stroke="none"/><circle cx="${x}" cy="${y + 0.6}" r="2" fill="${INK}" stroke="none"/>`).join("")}
    <circle cx="38" cy="62" r="29" fill="${c.body}"/>
    <path d="M20 72q3-2 5 0M52 80q3-2 5 0M56 50q3-2 5 0M24 50q3-2 5 0" fill="none" stroke-width="2" opacity=".4"/>
    ${shine(24, 52, 4, 8)}
    <path d="M40 34C40 28 42 24 46 21" fill="none" stroke="${c.leaf}" stroke-width="3.4"/>
    ${f(38, 64)}`;
  },

  dragonfruit: (c, f) => {
    const flap = (x, y, rot, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-8 3C-8 -8 -4 -16 3 -23C2 -14 5 -6 8 3Z" fill="${c.body}"/>
      <path d="M3 -23C-1 -19 -3 -14 -3 -10C0 -11 3 -11 5.5 -10C4.5 -15 3.5 -19 3 -23Z" fill="${c.tip}" stroke-width="2"/></g>`;
    return `
    ${flap(22, 50, -62)}${flap(78, 50, 62)}${flap(24, 76, -110, 0.9)}${flap(76, 76, 110, 0.9)}
    <path d="M50 16C68 16 82 34 82 56C82 78 68 92 50 92C32 92 18 78 18 56C18 34 32 16 50 16Z" fill="${c.body}"/>
    ${flap(36, 22, -30)}${flap(64, 22, 30)}${flap(50, 20, 0, 1.1)}
    ${flap(30, 82, -12, 0.75)}${flap(70, 82, 12, 0.75)}${flap(50, 88, 0, 0.7)}
    ${shine(30, 46, 4, 8)}
    ${f(50, 60)}`;
  },

  jackfruit: (c, f) => {
    const bumps = grid(50, 58, 28, 36, 8, [31, 50, 69, 72])
      .map(([x, y]) => `M${x - 2.2} ${y + 1.4}L${x} ${y - 1.6}L${x + 2.2} ${y + 1.4}`).join("");
    return `
    <path d="M45 22L46 8L54 8L55 22Z" fill="${c.stem}"/>
    <path d="M54 12C60 2 76 0 82 4C76 14 64 18 54 12Z" fill="${c.leaf}"/>
    <path d="${scallop(50, 58, 30, 37, 30, 3)}" fill="${c.body}"/>
    <path d="${bumps}" fill="none" stroke="${c.body2}" stroke-width="2.2"/>
    ${shine(32, 44, 4, 9)}
    ${f(50, 60, 0.9)}`;
  },

  durian: (c, f) => {
    const inner = grid(50, 58, 24, 26, 10, [32, 48, 68, 72], 0.75)
      .map(([x, y]) => `M${x - 3} ${y + 2}L${x} ${y - 3}L${x + 3} ${y + 2}`).join("");
    return `
    <path d="M46 28L45 12L53 10L54 28Z" fill="${c.stem}"/>
    <path d="${spikes(50, 60, 29, 28, 18, 9)}" fill="${c.body}"/>
    <path d="${inner}" fill="none" stroke="${c.body2}" stroke-width="2.2"/>
    ${shine(34, 48, 4, 8)}
    ${f(50, 61, 0.9)}`;
  },

  custardapple: (c, f) => {
    const knobs = grid(50, 58, 28, 30, 10, [32, 50, 68, 72], 0.82)
      .map(([x, y]) => `M${x - 4.5} ${y - 3}C${x - 4.5} ${y + 5} ${x + 4.5} ${y + 5} ${x + 4.5} ${y - 3}`).join("");
    return `
    <path d="M48 28L47 16L53 15L53 28Z" fill="${c.stem}"/>
    <path d="M52 18C58 8 74 6 80 10C74 20 62 24 52 18Z" fill="${c.leaf}"/>
    <path d="${scallop(50, 58, 30, 31, 16, 5)}" fill="${c.body}"/>
    <path d="${knobs}" fill="none" stroke="${c.body2}" stroke-width="2.2"/>
    ${shine(32, 46, 4, 8)}
    ${f(50, 60, 0.9)}`;
  },

  carambola: (c, f) => `
    <g transform="translate(64 32) rotate(-32)">
      <path d="M-33 0C-24 -17 20 -19 33 -4C35 0 35 2 33 4C20 19 -24 17 -33 0Z" fill="${c.body2}"/>
      <path d="M-28 -3C-10 -9 14 -9 31 -2M-28 3C-10 9 14 9 31 2" fill="none" stroke-width="2.2" opacity=".45"/>
      <path d="M33 0L40 -2" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    </g>
    <path d="${star(40, 62, 32, 19)}" fill="${c.body}"/>
    <path d="${star(40, 62, 17, 9)}" fill="${c.flesh}" stroke="none" opacity=".75"/>
    ${[0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + (i / 5) * TAU; return `<ellipse cx="${n1(40 + 12 * Math.cos(a))}" cy="${n1(62 + 12 * Math.sin(a))}" rx="1.6" ry="2.6" fill="${c.stem}" stroke="none" transform="rotate(${i * 72} ${n1(40 + 12 * Math.cos(a))} ${n1(62 + 12 * Math.sin(a))})"/>`; }).join("")}
    ${f(40, 63, 0.6)}`,

  pineapple: (c, f) => {
    const leaf = (rot, s) => `<path d="M45 40C44 28 46 16 50 4C54 16 56 28 55 40Z" fill="${c.leaf}" transform="rotate(${rot} 50 40) translate(50 40) scale(${s}) translate(-50 -40)"/>`;
    const hole = [31, 57, 69, 79];
    return `
    ${leaf(-52, 0.72)}${leaf(52, 0.72)}${leaf(-26, 0.88)}${leaf(26, 0.88)}${leaf(0, 1)}
    <ellipse cx="50" cy="65" rx="26" ry="29" fill="${c.body}"/>
    <path d="${hatch(50, 65, 24, 27, 9, 50, hole)}${hatch(50, 65, 24, 27, 9, -50, hole)}" fill="none" stroke="${c.body2}" stroke-width="2.2"/>
    ${shine(33, 52, 4, 8)}
    ${f(50, 67, 0.85)}`;
  },

  waxapple: (c, f) => `
    <path d="M50 16L52 6" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    <path d="M50 15C61 15 64 24 66 34C70 51 86 60 86 76C86 86 78 90 72 86C68 92 58 94 50 88C42 94 32 92 28 86C22 90 14 86 14 76C14 60 30 51 34 34C36 24 39 15 50 15Z" fill="${c.body}"/>
    <path d="M40 30C36 48 30 64 29 84M60 30C64 48 70 64 71 84" fill="none" stroke-width="2" opacity=".3"/>
    ${shine(35, 50, 4, 9)}
    ${f(50, 64)}`,

  coconut: (c, f) => `
    <circle cx="68" cy="36" r="24" fill="${c.body}"/>
    <path d="M52 26l4 2M80 22l3 3M86 40l3 1M60 52l2 3" fill="none" stroke-width="2" opacity=".45"/>
    <ellipse cx="63" cy="30" rx="2.4" ry="3" fill="${INK}" stroke="none"/><ellipse cx="72" cy="30" rx="2.4" ry="3" fill="${INK}" stroke="none"/><ellipse cx="67.5" cy="38" rx="2.4" ry="3" fill="${INK}" stroke="none"/>
    <path d="M12 58C12 82 30 92 48 92C66 92 84 82 84 58Z" fill="${c.body}"/>
    <path d="M20 74l4 2M32 84l3 2M66 84l3-2M76 72l4-2" fill="none" stroke-width="2" opacity=".45"/>
    <ellipse cx="48" cy="58" rx="36" ry="12" fill="${c.flesh}"/>
    <ellipse cx="48" cy="59" rx="27" ry="7.5" fill="${c.flesh2}"/>
    ${f(48, 75, 0.8)}`,

  date: (c, f) => {
    const one = (rot, face) => `<g transform="rotate(${rot} 50 14)">
      <path d="M50 22C62 22 64 36 64 50C64 66 58 80 50 80C42 80 36 66 36 50C36 36 38 22 50 22Z" fill="${c.body}"/>
      <path d="M44 22C46 18 54 18 56 22C54 25 46 25 44 22Z" fill="${c.cap}"/>
      <path d="M40 40q3 3 1 7M59 56q-3 3-1 7M57 34q-2 3 0 6" fill="none" stroke-width="2" opacity=".4"/>
      ${shine(42, 36, 2.5, 6)}
      ${face ? f(50, 56, 0.55) : ""}</g>`;
    return `<path d="M50 20C52 10 60 4 72 2" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
      ${one(40, false)}${one(-40, false)}${one(0, true)}`;
  },

  olive: (c, f) => {
    const leaf = (x, y, rot) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="17" fill="${c.leaf}" transform="rotate(${rot} ${x} ${y})"/>`;
    const fruit = (x, y, s, face) => `<path d="M${x} ${y - 14 * s}L${x - 2} ${y - 20 * s}" fill="none" stroke="${c.stem}" stroke-width="2.6"/>
      <ellipse cx="${x}" cy="${y}" rx="${n1(12 * s)}" ry="${n1(15 * s)}" fill="${c.body}"/>${shine(x - 5 * s, y - 5 * s, 2.5 * s, 5 * s)}${face ? f(x, y + 2, 0.55) : ""}`;
    return `
    ${leaf(22, 20, -58)}${leaf(56, 12, 70)}${leaf(80, 30, 40)}${leaf(40, 36, -20)}
    <path d="M6 30C30 32 60 24 94 12" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    ${fruit(28, 56, 0.9, false)}${fruit(76, 60, 0.9, false)}${fruit(52, 70, 1.25, true)}`;
  },

  peanut: (c, f) => `
    <g transform="rotate(-24 50 52)">
    <path d="M50 10C63 10 71 21 70 32C69 42 63 46 63 51C63 55 72 59 72 70C72 84 62 92 50 92C38 92 28 84 28 70C28 59 37 55 37 51C37 46 31 42 30 32C29 21 37 10 50 10Z" fill="${c.body}"/>
    <path d="M38 22C42 30 42 38 40 44M62 22C58 30 58 38 60 44M44 14C46 24 46 34 46 44M56 14C54 24 54 34 54 44M36 32H64M40 20H60M32 64C34 76 38 84 44 88M68 64C66 76 62 84 56 88" fill="none" stroke-width="2" opacity=".35"/>
    ${shine(36, 30, 2.8, 6)}
    ${f(50, 70, 0.8)}</g>`,

  walnut: (c, f) => `
    <path d="${scallop(50, 56, 33, 32, 22, 2.6)}" fill="${c.body}"/>
    <path d="M50 22C47 28 53 33 50 39M50 81C47 84 53 87 50 90" fill="none" stroke-width="3"/>
    <path d="M24 44C30 40 32 48 38 44M20 58C26 54 30 62 35 58M26 74C30 70 34 76 39 72M76 44C70 40 68 48 62 44M80 58C74 54 70 62 65 58M74 74C70 70 66 76 61 72M36 30C40 34 44 30 44 36M64 30C60 34 56 30 56 36" fill="none" stroke-width="2.2" opacity=".5"/>
    <path d="M47 23L50 15L53 23Z" fill="${c.body}"/>
    ${f(50, 60, 0.85)}`,

  almond: (c, f) => {
    const shape = c.pecan
      ? "M0 -30C10 -22 13 -8 13 2C13 14 8 24 0 30C-8 24 -13 14 -13 2C-13 -8 -10 -22 0 -30Z"
      : "M0 -28C9 -18 15 -3 15 8C15 19 8 25 0 25C-8 25 -15 19 -15 8C-15 -3 -9 -18 0 -28Z";
    const marks = c.pecan
      ? `<path d="M-6 -20C-10 -8 -10 8 -6 22M6 -20C10 -8 10 8 6 22M0 -26V-16" fill="none" stroke="${c.body2}" stroke-width="3"/>`
      : `<path d="M-6 -8h.1M5 -14h.1M-8 6h.1M8 2h.1M-2 18h.1M6 16h.1" fill="none" stroke="${c.body2}" stroke-width="3"/>`;
    return `
    <g transform="translate(66 38) rotate(32) scale(.86)"><path d="${shape}" fill="${c.body}"/>${marks}</g>
    <g transform="translate(40 60) rotate(-22)"><path d="${shape}" fill="${c.body}"/>${marks}${shine(-6, -6, 2.5, 6, 10)}</g>
    ${f(40, 64, 0.62)}`;
  },

  pistachio: (c, f) => `
    <g transform="rotate(-18 50 56)">
    <ellipse cx="50" cy="38" rx="17" ry="22" fill="${c.kernel}"/>
    <path d="M36 26C40 18 60 18 64 26C58 23 42 23 36 26Z" fill="${c.skin}" stroke="none"/>
    <path d="M50 92C32 92 25 74 27 58C28 46 30 38 34 30C38 42 44 50 50 52C56 50 62 42 66 30C70 38 72 46 73 58C75 74 68 92 50 92Z" fill="${c.body}"/>
    <path d="M50 53C49 60 49 66 50 70" fill="none" stroke-width="2" opacity=".35"/>
    ${shine(36, 52, 3, 6)}
    ${f(51, 74, 0.8)}</g>`,

  ginkgo: (c, f) => {
    const nut = (x, y, s, face) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -16C9 -16 13 -6 13 2C13 11 7 16 0 16C-7 16 -13 11 -13 2C-13 -6 -9 -16 0 -16Z" fill="${c.body}"/><path d="M0 -16C1 -19 2 -20 3 -21" fill="none" stroke-width="2.4"/>${shine(-5, -4, 2, 4)}</g>${face ? f(x, y + 2, 0.55) : ""}`;
    return `
    <path d="M50 62L50 80" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    <path d="M50 62L16 22C28 8 42 6 48 8L50 24L52 8C58 6 72 8 84 22Z" fill="${c.leaf}"/>
    <path d="M50 58L28 24M50 58L38 16M50 58L62 16M50 58L72 24M50 58L20 30M50 58L80 30" fill="none" stroke-width="2" opacity=".3"/>
    ${nut(68, 76, 1, false)}${nut(38, 74, 1.25, true)}`;
  },

  sunflower: (c, f) => {
    const petals = Array.from({ length: 16 }, (_, i) =>
      `<ellipse cx="50" cy="20" rx="6.5" ry="12" fill="${c.body}" transform="rotate(${i * 22.5} 50 46)"/>`).join("");
    const seeds = grid(50, 46, 15, 15, 5.2, [38, 40, 62, 56], 0.8).map(([x, y]) => `M${x} ${y}h.1`).join("");
    return `
    <path d="M50 70L50 97" fill="none" stroke="${c.stem}" stroke-width="5"/>
    <path d="M50 88C40 82 30 84 24 90C32 96 42 94 50 88Z" fill="${c.leaf}"/>
    ${petals}
    <circle cx="50" cy="46" r="18" fill="${c.disc}"/>
    <path d="${seeds}" fill="none" stroke="${c.seed}" stroke-width="2.6"/>
    ${f(50, 47, 0.72)}`;
  },

  coffee: (c, f) => `
    <path d="M58 20C62 6 78 2 88 6C84 18 70 24 58 20Z" fill="${c.leaf}"/>
    <path d="M60 18C68 12 76 10 84 8" fill="none" stroke-width="2" opacity=".35"/>
    <g transform="translate(64 44) rotate(28)">
      <ellipse cx="0" cy="0" rx="17" ry="22" fill="${c.body2}"/>
      <path d="M-2 -21C6 -12 -8 -4 0 4C8 12 -4 16 2 21" fill="none" stroke-width="3"/>
    </g>
    <g transform="translate(38 62) rotate(-24)">
      <ellipse cx="0" cy="0" rx="21" ry="27" fill="${c.body}"/>
      ${shine(-9, -10, 3, 7, 0)}
    </g>
    ${f(38, 63, 0.78)}`,

  peppercorn: (c, f) => {
    const corns = [[30, 58, 8], [44, 50, 8], [60, 52, 8], [72, 62, 7.5], [36, 74, 8], [64, 76, 8], [50, 86, 7.5], [22, 70, 7]];
    const leaflets = [[62, 20, -40], [72, 14, -40], [82, 10, -40], [66, 30, 50], [76, 26, 50], [86, 22, 50]];
    return `
    ${leaflets.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="8" fill="${c.leaf}" transform="rotate(${r} ${x} ${y})"/>`).join("")}
    <path d="M54 28C66 22 80 18 94 16M50 44C50 36 52 30 56 26M50 44L30 58M50 44L60 52M50 44L50 66" fill="none" stroke="${c.stem}" stroke-width="3"/>
    ${corns.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.body}"/>${i % 2
      ? `<circle cx="${x + r * 0.2}" cy="${y - r * 0.2}" r="${n1(r * 0.42)}" fill="${INK}" stroke="none"/><circle cx="${x}" cy="${y - r * 0.35}" r=".9" fill="#fff" stroke="none"/>`
      : `<path d="M${x - r * 0.35} ${y + r * 0.2}h.1M${x + r * 0.3} ${y - r * 0.3}h.1M${x + r * 0.2} ${y + r * 0.5}h.1" fill="none" stroke="${c.body2}" stroke-width="2.2"/>`}`).join("")}
    <circle cx="50" cy="66" r="13" fill="${c.body}"/>
    <path d="M40 58C38 64 40 72 46 76" fill="none" stroke="${c.body2}" stroke-width="2.4"/>
    ${f(51, 67, 0.5)}`;
  },

  tea: (c, f) => `
    <path d="M50 96C50 80 50 62 52 42" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    <path d="M52 44C45 32 47 18 55 6C61 18 61 32 52 44Z" fill="${c.bud}"/>
    <path d="M53 40C54 30 55 20 55 12" fill="none" stroke-width="1.8" opacity=".35"/>
    <path d="M51 58C68 44 86 40 94 44C88 60 70 68 51 58Z" fill="${c.body2}"/>
    <path d="M53 57C66 52 80 48 91 46" fill="none" stroke-width="2" opacity=".35"/>
    <path d="M50 76C34 58 12 54 4 58C8 78 30 88 50 76Z" fill="${c.body}"/>
    <path d="M48 75C38 68 22 62 8 60M20 62l-2 6M30 66l-1 7M40 70l0 6" fill="none" stroke-width="2" opacity=".3"/>
    ${f(28, 70, 0.55)}`,

  bittermelon: (c, f) => {
    const spine = (t) => 50 + 4 * Math.sin(t * Math.PI);
    const half = (t) => 17 * Math.pow(Math.sin(Math.PI * Math.min(0.96, 0.04 + t)), 0.75);
    const left = [], right = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const bump = 2.2 * Math.abs(Math.sin(t * 34));
      left.push(`${n1(spine(t) - half(t) - bump)} ${n1(10 + t * 84)}`);
      right.push(`${n1(spine(t) + half(t) + bump)} ${n1(10 + t * 84)}`);
    }
    const ridges = [-0.55, 0, 0.55].map((k) => {
      const pts = [];
      for (let i = 2; i <= 38; i += 2) {
        const t = i / 40;
        if (k === 0 && t > 0.44 && t < 0.72) continue;
        pts.push(`${n1(spine(t) + k * half(t) + 1.6 * Math.sin(t * 34))} ${n1(10 + t * 84)}`);
      }
      return `M${pts.join("L")}`;
    }).join("");
    return `
    <path d="M${[...left, ...right.reverse()].join("L")}Z" fill="${c.body}"/>
    <path d="${ridges}" fill="none" stroke="${c.body2}" stroke-width="2.4"/>
    ${grid(54, 52, 13, 36, 8, [38, 44, 70, 72], 0.9).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.6" fill="${c.body2}" stroke="none"/>`).join("")}
    <path d="M48 12C46 6 49 2 54 2" fill="none" stroke="${c.stem}" stroke-width="3.4"/>
    ${shine(n1(spine(0.4) - 9), 38, 3, 8, 5)}
    ${f(n1(spine(0.58)), 59, 0.72)}`;
  },

  okra: (c, f) => {
    const pod = (x, y, rot, face) => `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M-37 0L-45 -3" fill="none" stroke="${c.cap}" stroke-width="4.5"/>
      <path d="M-30 -10C-20 -13 -8 -12 4 -9C18 -5 30 -1 41 3C30 6 18 9 4 10C-8 12 -20 12 -30 9C-33 4 -33 -5 -30 -10Z" fill="${c.body}"/>
      <path d="M-26 -5C-8 -6 16 -2 38 3M-26 5C-8 7 16 6 38 3${face ? "M10 1C20 2 30 2 38 3" : "M-26 0C-4 0 18 1 38 3"}" fill="none" stroke-width="2.2" opacity=".4"/>
      <path d="M-30 -10C-35 -12 -39 -7 -38 -3L-38 3C-39 7 -35 11 -30 9C-28 4 -28 -5 -30 -10Z" fill="${c.cap}"/>
      ${face ? `${shine(-18, -6, 2, 4.5, 80)}${f(-6, 1, 0.55)}` : ""}</g>`;
    const seeds = [0, 1, 2, 3, 4].map((i) => {
      const a = -Math.PI / 2 + (i / 5) * TAU;
      return `<circle cx="${n1(76 + 6.5 * Math.cos(a))}" cy="${n1(80 + 6.5 * Math.sin(a))}" r="2.4" fill="${c.seed}" stroke-width="1.6"/>`;
    }).join("");
    return `${pod(28, 54, 102, false)}${pod(60, 42, 28, true)}
      <circle cx="76" cy="80" r="16" fill="${c.body}"/>
      <path d="${star(76, 80, 12, 6)}" fill="${c.flesh}" stroke-width="2"/>
      ${seeds}`;
  },

  lotusroot: (c, f) => {
    const holes = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * TAU + 0.2;
      return `<ellipse cx="${n1(40 + 19 * Math.cos(a))}" cy="${n1(62 + 19 * Math.sin(a))}" rx="4.6" ry="5.4" fill="${c.hole}" stroke-width="2.2"/>`;
    }).join("");
    return `
    <g transform="translate(40 62) rotate(45)">
      <rect x="-17" y="-66" width="34" height="66" rx="17" fill="${c.body}"/>
      <path d="M-17 -38C-6 -35 6 -35 17 -38" fill="none" stroke-width="2.4"/>
      <path d="M-7 -52h.1M8 -58h.1M5 -46h.1" fill="none" stroke-width="2.6" opacity=".4"/>
    </g>
    <circle cx="40" cy="62" r="29" fill="${c.body}"/>
    <circle cx="40" cy="62" r="25.5" fill="${c.flesh}"/>
    ${holes}
    ${f(40, 62, 0.58)}`;
  },

  lotuspod: (c, f) => {
    const seeds = [[50, 34], [36, 32], [64, 32], [42, 39], [58, 39], [26, 36], [74, 36], [44, 27], [57, 27]];
    return `
    <path d="M45 70C45 82 43 90 40 98L50 98C52 90 55 82 55 70Z" fill="${c.body}"/>
    <path d="M17 34C18 56 36 70 46 74L54 74C64 70 82 56 83 34Z" fill="${c.body}"/>
    <ellipse cx="50" cy="34" rx="33" ry="12" fill="${c.top}"/>
    ${seeds.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.4" fill="${c.seed}" stroke-width="2"/>`).join("")}
    <path d="M24 50C30 60 38 66 44 68" fill="none" stroke-width="2" opacity=".35"/>
    ${f(50, 55, 0.72)}`;
  },

  bambooshoot: (c, f) => `
    <path d="M50 6C58 18 74 52 76 76C77 88 64 94 50 94C36 94 23 88 24 76C26 52 42 18 50 6Z" fill="${c.body}"/>
    <path d="M50 94C64 94 77 88 76 76C74 58 66 40 57 24C61 46 59 72 50 94Z" fill="${c.body2}"/>
    <path d="M50 94C36 94 23 88 24 76C26 62 32 48 40 36C40 56 43 78 50 94Z" fill="${c.body2}"/>
    <path d="M50 6C54 12 57 18 59 24C54 22 46 22 41 24C43 18 46 12 50 6Z" fill="${c.tip}"/>
    <path d="M29 62h.1M33 50h.1M70 60h.1M66 46h.1M28 78h.1M72 78h.1" fill="none" stroke-width="2.6" opacity=".4"/>
    <path d="M27 86C34 95 66 95 73 86C64 90 36 90 27 86Z" fill="${c.base}"/>
    ${f(50, 64, 0.72)}`,

  corm: (c, f) => {
    const body = c.beak
      ? "M50 30C70 30 84 44 84 62C84 78 70 88 50 88C30 88 16 78 16 62C16 44 30 30 50 30Z"
      : "M50 36C70 36 88 46 88 62C88 78 70 86 50 86C30 86 12 78 12 62C12 46 30 36 50 36Z";
    const sprout = c.beak
      ? `<path d="M48 34C44 20 50 8 66 2C60 12 56 24 54 34Z" fill="${c.sprout}"/>`
      : `<path d="M47 38C44 28 46 20 50 12C54 20 56 28 53 38Z" fill="${c.sprout}"/><path d="M47 30L40 24M53 30L60 24" fill="none" stroke="${c.sprout}" stroke-width="3"/>`;
    const y0 = c.beak ? 48 : 52;
    return `
    ${sprout}
    <path d="${body}" fill="${c.body}"/>
    <path d="M${c.beak ? 20 : 15} ${y0}C34 ${y0 + 6} 66 ${y0 + 6} ${c.beak ? 80 : 85} ${y0}M${c.beak ? 22 : 24} ${y0 + 26}C36 ${y0 + 31} 64 ${y0 + 31} ${c.beak ? 78 : 76} ${y0 + 26}" fill="none" stroke="${c.body2}" stroke-width="2.6"/>
    <path d="M46 ${c.beak ? 88 : 86}l-2 6M54 ${c.beak ? 88 : 86}l2 6" fill="none" stroke-width="2"/>
    ${shine(28, y0 + 6, 4, 7)}
    ${f(50, y0 + 15, 0.85)}`;
  },

  caltrop: (c, f) => `
    <path d="M45 40L46 28L54 28L55 40Z" fill="${c.body2}"/>
    <path d="M50 38C61 38 67 45 71 52C80 50 90 43 96 32C95 48 86 60 75 64C72 76 62 84 50 84C38 84 28 76 25 64C14 60 5 48 4 32C10 43 20 50 29 52C33 45 39 38 50 38Z" fill="${c.body}"/>
    <path d="M47 84L50 92L53 84Z" fill="${c.body}"/>
    ${shine(36, 52, 3, 6)}
    ${f(50, 62, 0.82)}`,

  scape: (c, f) => {
    if (c.straight) {
      const tips = [[30, 16], [40, 10], [50, 7], [60, 10], [70, 16]];
      return `
      ${tips.map(([x, y]) => inkStroke(`M50 96L${x} ${y + 8}`, c.body, 4.5)).join("")}
      ${tips.map(([x, y]) => `<path d="M${x} ${y - 7}C${x + 5} ${y - 1} ${x + 5} ${y + 8} ${x} ${y + 9}C${x - 5} ${y + 8} ${x - 5} ${y - 1} ${x} ${y - 7}Z" fill="${c.bud}"/>`).join("")}
      <path d="M34 60C44 65 56 65 66 60L67 78C56 83 44 83 33 78Z" fill="${c.band}"/>
      ${f(50, 69, 0.55)}`;
    }
    const main = "M30 97C30 74 28 54 32 40C36 22 60 14 70 26C80 38 66 52 56 44C48 38 54 28 62 30C70 32 72 44 70 52";
    const back = "M58 97C60 86 70 80 80 76C88 72 90 64 86 58";
    return `
    ${inkStroke(back, c.body, 5.5)}
    <ellipse cx="84" cy="53" rx="6" ry="7.5" fill="${c.bud}" transform="rotate(-20 84 53)"/>
    <path d="M86 46L90 36" fill="none" stroke="${c.body}" stroke-width="3"/>
    ${inkStroke(main, c.body, 7)}
    <path d="M70 50C82 52 84 70 74 76C62 78 58 62 70 50Z" fill="${c.bud}"/>
    <path d="M72 76L70 90" fill="none" stroke="${c.body}" stroke-width="3.2"/>
    ${f(71, 63, 0.5)}`;
  },

  fiddlehead: (c, f) => {
    const coil = "M48 97C46 78 36 64 34 48C32 28 48 16 62 20C76 24 78 42 66 48C56 52 50 44 56 38";
    const coil2 = "M30 97C28 84 20 76 16 64C12 50 22 40 32 44";
    return `
    ${inkStroke(coil2, c.body, 7)}
    <circle cx="33" cy="47" r="6" fill="${c.body2}"/>
    ${inkStroke(coil, c.body, 9)}
    <circle cx="57" cy="36" r="8" fill="${c.body2}"/>
    <path d="M36 70l-6 -3M38 80l-6 -2M34 58l-6 -4" fill="none" stroke="${c.body}" stroke-width="3.2"/>
    ${f(58, 34, 0.45)}`;
  },

  ginger: (c, f) => {
    const lobes = [[18, 68, 70, 64, 27], [28, 60, 16, 42, 16], [48, 56, 50, 34, 17], [50, 42, 64, 26, 13], [66, 60, 84, 48, 15], [70, 72, 88, 80, 13], [22, 74, 10, 84, 11]];
    const seg = ([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`;
    const rings = lobes.flatMap(([x1, y1, x2, y2, w], i) => (i === 0 ? [0.1, 0.9] : [0.45, 0.78]).map((t) => {
      const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      const cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t, h = w / 2 - 1.5;
      return `M${n1(cx - nx * h)} ${n1(cy - ny * h)}Q${n1(cx + (x2 - x1) / len * 2.5)} ${n1(cy + (y2 - y1) / len * 2.5)} ${n1(cx + nx * h)} ${n1(cy + ny * h)}`;
    })).join("");
    return `
    ${c.leaf ? `<path d="M62 28C60 18 62 10 68 2C72 10 70 20 66 28Z M82 48C82 38 86 30 92 24C94 32 90 42 85 49Z" fill="${c.leaf}"/>` : ""}
    ${lobes.map((l) => `<path d="${seg(l)}" fill="none" stroke="${INK}" stroke-width="${l[4] + 6.8}"/>`).join("")}
    ${lobes.map((l) => `<path d="${seg(l)}" fill="none" stroke="${c.body}" stroke-width="${l[4]}"/>`).join("")}
    ${c.tip ? lobes.slice(1).map(([, , x2, y2, w]) => `<circle cx="${x2}" cy="${y2}" r="${n1(w / 2)}" fill="${c.tip}" stroke="none"/>`).join("") : ""}
    <path d="${rings}" fill="none" stroke="${c.ring}" stroke-width="2.2"/>
    ${shine(26, 58, 2.6, 5, 70)}
    ${f(46, 66, 0.78)}`;
  },

  sugarcane: (c, f) => {
    const stalk = (dx, rot) => `<g transform="rotate(${rot} 50 96) translate(${dx} 0)">
      <path d="M42 96L42 26L58 26L58 96Z" fill="${c.body}"/>
      ${[40, 58, 76].map((y) => `<path d="M41 ${y}C46 ${y + 3} 54 ${y + 3} 59 ${y}L59 ${y + 4}C54 ${y + 7} 46 ${y + 7} 41 ${y + 4}Z" fill="${c.node}"/>`).join("")}
      <ellipse cx="50" cy="26" rx="8" ry="2.6" fill="${c.flesh}"/></g>`;
    return `
    <path d="M50 30C40 16 24 8 8 8C24 16 38 26 46 36Z M52 30C60 14 76 6 94 6C78 16 64 26 56 36Z" fill="${c.leaf}"/>
    ${stalk(-18, -8)}${stalk(18, 8)}${stalk(0, 0)}
    ${f(50, 69, 0.5)}`;
  },

  rose: (c, f) => `
    <path d="M50 70L50 97" fill="none" stroke="${c.stem}" stroke-width="4"/>
    <path d="M50 84C40 76 28 76 20 82C28 92 42 92 50 84Z M50 80C60 72 72 72 80 78C72 88 58 88 50 80Z" fill="${c.leaf}"/>
    ${[0, 72, 144, 216, 288].map((r) => `<circle cx="50" cy="28" r="15" fill="${c.body}" transform="rotate(${r} 50 46)"/>`).join("")}
    <circle cx="50" cy="46" r="20" fill="${c.body2}"/>
    <path d="M42 36C44 28 58 28 58 36C58 42 50 44 48 40M34 44C34 34 40 28 46 26M66 44C66 34 60 28 54 26" fill="none" stroke-width="2.2" opacity=".5"/>
    ${f(50, 51, 0.62)}`,

  sprouts: (c, f) => {
    const heads = [[20, 30, 7, -40], [34, 16, 7, -20], [66, 16, 7, 20], [80, 30, 7, 40]];
    const stems = heads.map(([x, y]) => inkStroke(`M${n1(44 + x / 8)} 97C${n1(44 + x / 8)} 70 ${x} ${y + 30} ${x} ${y + 5}`, c.body, 4.5)).join("");
    const head = ([x, y, r, rot]) => `<g transform="rotate(${rot} ${x} ${y})">
      <path d="M${x} ${y - r}C${x - 4} ${y - r - 8} ${x - 12} ${y - r - 6} ${x - 12} ${y - r - 2}C${x - 8} ${y - r} ${x - 4} ${y - r + 1} ${x} ${y - r}Z" fill="${c.leaf}" stroke-width="2"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n1(r * 0.85)}" fill="${c.head}"/><path d="M${x} ${y - r * 0.8}V${y + r * 0.8}" fill="none" stroke-width="1.8" opacity=".35"/></g>`;
    return `
    ${stems}
    ${inkStroke("M52 97C52 76 50 60 50 42", c.body, 6)}
    ${heads.map(head).join("")}
    <ellipse cx="50" cy="34" rx="15" ry="12.5" fill="${c.head}"/>
    <path d="M46 22C42 12 30 10 26 14C30 20 40 22 46 22Z" fill="${c.leaf}"/>
    ${f(50, 35, 0.6)}`;
  },

  kelp: (c, f) => {
    const frond = (x0, amp, lean, w, len) => {
      const l = [], r = [], mid = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const y = 96 - t * len;
        const x = x0 + lean * t + amp * Math.sin(t * 9);
        const hw = w * Math.sin(Math.PI * Math.min(0.95, 0.12 + t * 0.88)) * (1 + 0.15 * Math.sin(t * 22));
        l.push(`${n1(x - hw)} ${n1(y)}`); r.push(`${n1(x + hw)} ${n1(y)}`); mid.push(`${n1(x)} ${n1(y)}`);
      }
      return `<path d="M${[...l, ...r.reverse()].join("L")}Z" fill="${c.body}"/><path d="M${mid.join("L")}" fill="none" stroke="${c.body2}" stroke-width="2.4"/>`;
    };
    return `${frond(38, 4, -22, 9, 78)}${frond(64, 4, 20, 9, 76)}${frond(50, 5, 0, 13, 90)}
      <path d="M40 96C44 92 56 92 60 96" fill="none" stroke-width="3"/>
      ${f(50, 56, 0.55)}`;
  },
};


export function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function hash(s) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function archetypeIds() {
  return Object.keys(A);
}

/** Markup for one archetype inside a 100×100 box. */
export function drawArchetype(kind, colours, silhouette) {
  const draw = A[kind];
  if (!draw) throw new Error(`unknown archetype ${kind}`);
  const markup = draw(colours, silhouette ? () => "" : face);
  if (!silhouette) return markup;
  return markup
    .replace(/#[0-9a-fA-F]{3,6}\b/g, "currentColor")
    .replace(/opacity="[^"]*"/g, "")
    .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${Number(w) + 12}"`);
}

export function symbolPair(item, kind, colours) {
  const id = slug(item);
  const delay = (hash(item) % 70) / 10;
  const art = drawArchetype(kind, colours, false);
  const cut = drawArchetype(kind, colours, true);
  return `<symbol id="art-${id}" viewBox="-8 -8 116 116"><g stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" style="--blink-delay:${delay}s">${art}</g></symbol>
        <symbol id="cut-${id}" viewBox="-8 -8 116 116"><g fill="currentColor" stroke="currentColor" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">${cut}</g></symbol>`;
}
