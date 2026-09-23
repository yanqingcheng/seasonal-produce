// Sticker Garden produce art: flat cartoon shapes, one ink outline weight, a face on everything.
// Each item maps to a hand-drawn archetype plus a colour set. Output is an SVG <symbol> sprite so the
// wheel, panel and fact sheet all reuse the same drawing via <use>.
(function () {
  const INK = "#2b2340";

  const C = {
    red: "#ff5a4e", deepRed: "#d9344a", pink: "#ff86a8", rhubarb: "#ff5f8a", magenta: "#c2255c",
    purple: "#8e4dd6", plum: "#5b3a9b", blue: "#4f6df5", navy: "#34307a", orange: "#ff9a3c",
    amber: "#ffb627", yellow: "#ffd84a", butter: "#fff0a6", cream: "#fff6dc", tan: "#e9b87a",
    brown: "#b0703f", cocoa: "#7a4a2c", green: "#3bb273", deepGreen: "#23865a", leaf: "#52c26b",
    lime: "#a8e05a", mint: "#c9f0b0", sage: "#9dbf94", teal: "#2f7d74", terracotta: "#e2764b",
    white: "#fffdf6", lilac: "#c9a7ff", peach: "#ffb38a",
  };

  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  function hash(s) {
    let h = 0;
    for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return Math.abs(h);
  }

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
  };

  const ITEMS = {
    apple: ["round", { body: C.red, leaf: C.leaf }],
    apricot: ["oval", { body: C.amber, cleft: true, leaf: C.leaf }],
    asparagus: ["asparagus", { body: C.leaf, tip: C.purple, band: C.rhubarb }],
    aubergine: ["aubergine", { body: C.plum, cap: C.green }],
    basil: ["herb", { body: C.green, stem: C.deepGreen, leafShape: "round" }],
    beetroot: ["bulbroot", { body: C.magenta, leaf: C.green, stem: C.deepRed }],
    bilberry: ["cluster", { body: C.navy }],
    blackberry: ["berry", { body: C.plum, body2: C.purple, leaf: C.green }],
    blackcurrant: ["currants", { body: C.navy, stem: C.green, leaf: C.leaf }],
    blueberry: ["cluster", { body: C.blue }],
    "bramley apple": ["round", { body: C.lime, leaf: C.green }],
    "broad beans": ["pod", { body: C.green, body2: C.mint, leaf: C.deepGreen }],
    broccoli: ["broccoli", { body: C.green, body2: C.deepGreen, stalk: C.lime }],
    "brussels sprouts": ["head", { body: C.lime, body2: C.green, trio: true }],
    "butternut squash": ["butternut", { body: C.peach, stem: C.brown }],
    cabbage: ["head", { body: C.leaf, body2: C.green }],
    carrots: ["root", { body: C.orange, leaf: C.green }],
    cauliflower: ["cauliflower", { body: C.cream, leaf: C.green }],
    "cavolo nero": ["leafy", { body: C.teal, curly: true, dots: "#1f5c55" }],
    celeriac: ["bulbroot", { body: C.tan, leaf: C.green, stem: C.green, knobbly: true }],
    celery: ["celery", { body: C.mint, body2: C.leaf, leaf: C.green }],
    chard: ["leafy", { body: C.green, rib: C.deepRed }],
    cherry: ["cherry", { body: C.deepRed, stem: C.green, leaf: C.leaf }],
    chervil: ["herb", { body: C.leaf, stem: C.green, leafShape: "frilly" }],
    chestnut: ["chestnut", { body: C.cocoa, body2: C.tan }],
    chicory: ["chicory", { body: C.cream, tip: C.lime }],
    chillies: ["chilli", { body: C.red, cap: C.green }],
    chives: ["herb", { body: C.green, leafShape: "grass" }],
    cobnuts: ["cobnut", { body: C.tan, leaf: C.lime }],
    coriander: ["herb", { body: C.green, stem: C.deepGreen, leafShape: "frilly" }],
    courgette: ["long", { body: C.green, stripes: C.lime, cap: C.amber }],
    "courgette flower": ["courgetteflower", { body: C.amber, body2: C.orange, stem: C.green }],
    "crab apple": ["cherry", { body: C.red, body2: C.amber, stem: C.brown, leaf: C.leaf }],
    cranberry: ["cluster", { body: C.deepRed }],
    cucumber: ["long", { body: C.deepGreen, dots: C.mint, cap: C.lime }],
    "currants (mixed)": ["currants", { body: C.red, body2: C.navy, stem: C.green, leaf: C.leaf }],
    damson: ["oval", { body: C.navy, cleft: true }],
    dill: ["herb", { body: C.lime, stem: C.green, leafShape: "needle" }],
    elderberry: ["currants", { body: C.plum, stem: C.deepRed, leaf: C.green }],
    elderflower: ["elderflower", { body: C.white, body2: C.butter, stem: C.green, leaf: C.leaf }],
    "fennel bulb": ["fennel", { body: C.mint, stem: C.lime, leaf: C.green }],
    fig: ["fig", { body: C.purple, leaf: C.green }],
    "forced rhubarb": ["rhubarb", { body: C.pink, body2: C.rhubarb, leaf: C.yellow, small: true }],
    "french beans": ["beans", { body: C.green }],
    garlic: ["garlic", { body: C.white, body2: C.lilac }],
    "globe artichoke": ["artichoke", { body: C.sage, body2: C.green, tip: C.purple }],
    gooseberry: ["oval", { body: C.lime, stripes: C.cream }],
    greengage: ["oval", { body: "#c8e06a", cleft: true, leaf: C.green }],
    horseradish: ["root", { body: C.tan, leaf: C.green, thin: true }],
    "jersey royals": ["potato", { body: C.butter, pair: true }],
    "jerusalem artichoke": ["potato", { body: C.tan, blush: C.pink }],
    kale: ["leafy", { body: C.deepGreen, curly: true }],
    kohlrabi: ["bulbroot", { body: C.mint, leaf: C.green, stem: C.green, side: true }],
    "lamb's lettuce": ["rosette", { body: C.green, body2: C.leaf }],
    leeks: ["leek", { body: C.white, body2: C.mint, leaf: C.green }],
    "lettuce & salad leaves": ["head", { body: C.lime, body2: C.leaf, frilly: true }],
    loganberry: ["berry", { body: C.deepRed, body2: C.red, leaf: C.green }],
    mangetout: ["pod", { body: C.lime, leaf: C.green, flat: true }],
    marrow: ["long", { body: C.green, stripes: C.mint, cap: C.amber, fat: true }],
    medlar: ["round", { body: C.brown, crown: C.cocoa }],
    mint: ["herb", { body: C.leaf, stem: C.green, leafShape: "round" }],
    "mushrooms (cultivated)": ["mushroom", { cap: C.cream, stem: C.white }],
    "mustard leaves & mizuna": ["leafy", { body: C.purple, lobed: true, rib: C.mint }],
    nasturtium: ["nasturtium", { body: C.orange, body2: C.yellow, leaf: C.green }],
    nectarine: ["oval", { body: C.red, cleft: true, leaf: C.leaf }],
    "new potatoes": ["potato", { body: C.cream, pair: true }],
    onions: ["onion", { body: C.amber, body2: C.orange }],
    oregano: ["herb", { body: "#6fae5a", stem: C.deepGreen, leafShape: "round" }],
    "pak choi": ["leafy", { body: C.green, stalk: C.white }],
    parsley: ["herb", { body: C.deepGreen, stem: C.green, leafShape: "frilly" }],
    parsnips: ["root", { body: C.cream, leaf: C.green }],
    peach: ["oval", { body: C.peach, cleft: true, leaf: C.leaf }],
    pear: ["pear", { body: C.lime, leaf: C.green }],
    peas: ["pod", { body: C.leaf, body2: C.lime, leaf: C.green }],
    peppers: ["pepper", { body: C.red, cap: C.green }],
    plum: ["oval", { body: C.purple, cleft: true, leaf: C.green }],
    potatoes: ["potato", { body: C.tan }],
    "pumpkin & squash": ["pumpkin", { body: C.orange, body2: C.amber, stem: C.brown }],
    "purple sprouting broccoli": ["broccoli", { body: C.purple, body2: C.lilac, stalk: C.green, leaf: C.leaf, sprouting: true }],
    quince: ["pear", { body: C.yellow, leaf: C.green, fuzz: true }],
    radicchio: ["head", { body: C.magenta, body2: C.deepRed, vein: C.white }],
    radishes: ["bulbroot", { body: C.rhubarb, leaf: C.green, stem: C.green }],
    raspberry: ["berry", { body: C.rhubarb, body2: C.pink, leaf: C.green }],
    redcurrant: ["currants", { body: C.red, stem: C.green, leaf: C.leaf }],
    rhubarb: ["rhubarb", { body: C.rhubarb, body2: C.deepRed, leaf: C.green }],
    rocket: ["leafy", { body: C.green, lobed: true }],
    rosemary: ["herb", { body: C.teal, stem: C.brown, leafShape: "needle" }],
    "runner beans": ["beans", { body: C.leaf, wide: true }],
    sage: ["herb", { body: C.sage, stem: C.green, leafShape: "round" }],
    salsify: ["root", { body: C.cocoa, leaf: C.green, thin: true }],
    samphire: ["samphire", { body: C.leaf }],
    shallots: ["onion", { body: C.peach, body2: C.terracotta, pair: true }],
    sorrel: ["leafy", { body: C.leaf, rib: C.deepRed }],
    spinach: ["leafy", { body: C.deepGreen }],
    "spring greens": ["leafy", { body: C.lime }],
    "spring onions": ["springonion", { body: C.white, leaf: C.green }],
    strawberry: ["strawberry", { body: C.red, leaf: C.green }],
    swede: ["bulbroot", { body: C.butter, cap: C.purple, leaf: C.green, stem: C.green }],
    sweetcorn: ["corn", { body: C.yellow, body2: C.amber, leaf: C.leaf }],
    tarragon: ["herb", { body: C.green, stem: C.green, leafShape: "needle" }],
    tayberry: ["berry", { body: C.magenta, body2: C.rhubarb, leaf: C.green }],
    thyme: ["herb", { body: C.sage, stem: C.brown, leafShape: "needle" }],
    tomatoes: ["round", { body: C.red, calyx: C.green }],
    turnips: ["bulbroot", { body: C.white, cap: C.purple, leaf: C.green, stem: C.green }],
    watercress: ["rosette", { body: C.deepGreen, body2: C.green }],
    "wild garlic": ["wildgarlic", { body: C.leaf }],
    "wild mushrooms": ["mushroom", { cap: C.brown, stem: C.cream, spots: C.tan, pair: true }],
    "wild nettles": ["nettle", { body: C.green, stem: C.deepGreen }],
  };

  const FALLBACK = { fruit: ["round", { body: C.pink, leaf: C.leaf }], vegetable: ["leafy", { body: C.green }], herb: ["herb", { body: C.green, stem: C.deepGreen, leafShape: "round" }] };

  function draw(name, category, silhouette) {
    const [kind, colours] = ITEMS[name] || FALLBACK[category] || FALLBACK.vegetable;
    const markup = A[kind](colours, silhouette ? () => "" : face);
    if (!silhouette) return markup;
    return markup
      .replace(/#[0-9a-fA-F]{3,6}\b/g, "currentColor")
      .replace(/opacity="[^"]*"/g, "")
      .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${Number(w) + 12}"`);
  }

  function buildSprite(items) {
    const symbols = items.map(({ item, category }) => {
      const id = slug(item);
      const delay = (hash(item) % 70) / 10;
      return `<symbol id="art-${id}" viewBox="-8 -8 116 116"><g stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" style="--blink-delay:${delay}s">${draw(item, category, false)}</g></symbol>
        <symbol id="cut-${id}" viewBox="-8 -8 116 116"><g fill="currentColor" stroke="currentColor" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">${draw(item, category, true)}</g></symbol>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${symbols.join("")}</defs></svg>`;
  }

  // A sticker is three layers of the same drawing: a soft offset shadow, a white die-cut, then the art.
  function sticker(item, attrs = "") {
    const id = slug(item);
    return `<svg class="sticker" viewBox="-8 -8 116 116" ${attrs} aria-hidden="true"><use href="#cut-${id}" class="sticker-shadow"/><use href="#cut-${id}" class="sticker-cut"/><use href="#art-${id}"/></svg>`;
  }

  window.ProduceArt = { buildSprite, sticker, slug, hasArt: (name) => name in ITEMS };
})();
