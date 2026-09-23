# Stage 3 — Design: the UK Year-Wheel

**Date:** 2026-09-23 · **Seat:** Stage 3 graphics / UI (Cursor Cloud, Claude Opus 5.5, effort medium)
**Obeys:** [INTENT.md](INTENT.md) (thin UK ship) and [STAGE2.md](STAGE2.md) (UK pass-2 corpus PASS).
**Prototype:** [`prototype/index.html`](prototype/index.html) · art sheet: [`prototype/gallery.html`](prototype/gallery.html)

## Why

This exhibit sits in Qing's Animal Crossing–style museum of loves. It should make a visitor smile at a leek. The seasonal data is the substance; the design's job is to make that data feel like a toy you want to spin.

## Qing's art direction (2026-09-23)

**Qing, seat chat, 2026-09-23 (verbatim):**

> design note wise I want to be creative - but we need to make it artistic and stylised because fake-realistic pictures of food are offputting. so it could be 3d, pixel art, cartoon - but it needs to feel dynamic and interactive while still being slick and responsive. I want it to make people feel joy about their food

**Stage 3 reading of it:**

- She **wants to be creative**.
- The art must be **artistic and stylised**, because **fake-realistic pictures of food are offputting**.
- **3D, pixel art, or cartoon** are all OK.
- It must feel **dynamic and interactive**, while still **slick and responsive**.
- The goal: make people **feel joy about their food**.

### Qing's follow-up (2026-09-23): make it busier

**Qing, seat chat, 2026-09-23 (as relayed in the Stage 3 iteration brief, not verbatim):** she likes that it's cute but wants it **busier**. Her proposal:

- **Enlarge the highlighted / selected month segment** so more of that month's produce can sit on the wheel itself.
- When packing items onto the enlarged segment, **prioritise common and popular** produce, not obscure or niche items first.

That is now the "busy active segment" rule (see [Wheel anatomy](#wheel-anatomy)).

### Hard rules that follow from it

1. **No fake-realistic food.** No photos, stock imagery, photoreal renders, AI "food photography", realistic textures, subsurface shine or gradient-modelled volume. If a drawing starts to look like real food, simplify it until it doesn't.
2. **Stylised, and one style everywhere.** Every produce item, at every size, is drawn in the same system (below).
3. **Joy is a requirement.** Every screen should have at least one thing that moves, smiles or responds.
4. **Busy, but slick.** The board should feel full of food (Qing's follow-up), but motion stays springy and short, never blocks input, and switches off under `prefers-reduced-motion`. Busyness comes from more stickers, not more simultaneous animation.

## Chosen visual system: "Sticker Garden"

**Cartoon** is the pick from Qing's three options. 3D would be heavy for a thin static ship, and pixel art fights a wheel that rotates (pixels shimmer when rotated). Cartoon also matches the Animal Crossing museum frame, and SVG keeps it crisp at every size, from 28 px chips to the fact-sheet hero.

Every produce item is a **die-cut sticker**:

- **Flat colour shapes** with a single **ink outline** (`#2b2340`, 3.4 on a 100-unit box, round joins).
- **One white highlight** blob per body. That is the only nod to volume.
- **A face on everything**: two dot eyes with catch-lights, a small smile and pink blush. Eyes **blink** on a staggered cycle, so the board feels alive.
- **A white die-cut border and a soft offset shadow**, like a sticker on paper.

### Illustration approach

- `prototype/art.js` holds about 40 hand-drawn **archetypes**: round fruit, stone fruit, pear, berry, cluster, currant strig, cherry pair, root, bulb-root, potato, leafy bunch, rosette, head, cauliflower, broccoli, asparagus, rhubarb, celery, leek, spring onion, pod, beans, pumpkin, butternut, long veg, aubergine, corn, mushroom, nuts, potted herb (four leaf styles), wild garlic, nettle, elderflower, courgette flower, nasturtium, onion, garlic, fennel, pepper, chilli, artichoke, samphire and chicory.
- Each of the **108 corpus items** maps to one archetype plus a colour set. Examples: plum and damson share the stone-fruit shape but differ in colour; forced rhubarb is pink with small yellow leaves, while maincrop rhubarb is red with a big green leaf.
- Art is built once into an SVG `<symbol>` sprite with two symbols per item: `art-*` (colour) and `cut-*` (silhouette for the die-cut and shadow). Everything reuses them with `<use>`, so the wheel's stickers (a month's quiet and active lists combined in the DOM, about 76 visible at once) stay cheap.
- Herbs sit in little terracotta pots, so the herb family reads at a glance.
- Art only encodes *what the item is*. It never encodes data. Varieties, taste, size and nutrition are not in the corpus, and the drawings don't imply them.

### Palette

| Token | Hex | Use |
|---|---|---|
| Paper | `#fff7e8` → `#ffeccc` | Page background, with a faint polka-dot grid |
| Ink | `#2b2340` | Every outline, text, chunky shadows |
| Tomato | `#ff5a4e` | Peak state, "this month" tag, today halo, pointer |
| Sun | `#ffc93c` | In-season state, today pill, primary buttons |
| Leaf | `#3bb273` | Veg category, "new in" |
| Plum | `#8e4dd6` | Wild/foraged category, recipe badge, links |
| Sky | `#4f6df5` | Keyboard focus ring |
| Month tints | 12 hues, icy blue (Jan) → spring greens → summer yellows → autumn oranges → lilac (Dec) | Wheel segments and panel header; the year reads as a colour wheel |

Category colours (mix bar, fact sheet): veg `#3bb273`, fruit `#ff5a4e`, herb `#2f7d74`, salad `#a8e05a`, nut `#b0703f`, wild/foraged `#8e4dd6`.

### Type

- **Fredoka** (rounded, chunky) for display: month names, headings, labels.
- **Nunito** for body copy.
- The prototype loads both from Google Fonts. Stage 4 should self-host them (see below).

### Surfaces

Cards, tiles, chips and buttons use a **3 px ink border and a solid offset "sticker" shadow** (`0 4–7px 0 ink`). Buttons **press down** on `:active` (the shadow collapses), which is the tactile, toy-like feel.

## The exhibit

### Wheel anatomy

- A scalloped **plate** holds 12 wedge **segments**, tinted by month.
- A **hub** shows the selected month, its season and its peak count. A tomato **pointer notch** on the hub marks the selection.
- Month **labels** sit on the rim and are always upright (they are positioned, never rotated).

#### Busy active segment

- The **selected month's wedge is 4× as wide as a quiet month's**: 96° against 24° for each of the other 11. It also reaches further out (radius 476 vs 442, breaking over the plate's inner edge) and its label moves out onto the rim.
- The active wedge carries **up to 21 stickers** in four rows (4 + 5 + 6 + 6), taken from the month's popularity ranking. A quiet wedge carries **5**, picked for variety across the wheel (see [Variety on quiet wedges](#variety-on-quiet-wedges)).
- Higher-ranked items take the **most central, roomiest slots** (middle rows, centre column first), so the most familiar produce is what the eye lands on under the pointer.
- Anything that doesn't fit on the wedge is still in the panel's **At peak / Also in season** lists, exactly as before. The wedge is a highlight reel; the panel is the full record.
- When the selection changes, the old wedge shrinks while the new one swells into the pointer. Stickers on both the quiet and active lists slide between their slots; stickers on only one list grow in or shrink away.

#### Which produce goes on the wedge (commonness heuristic)

The corpus has **no popularity or familiarity field**, so `scripts/build-data.mjs` ranks each month's P and I items with a transparent points score. The score only orders stickers. It is never shown to visitors as a fact.

| Signal | Points | Source |
|---|---|---|
| Well-known UK kitchen staple | +4 | `STAPLES` list in `build-data.mjs` (41 names: apple, pear, strawberry, potatoes, carrots, leeks, cabbage, peas, tomatoes, lettuce & salad leaves, and so on). The build fails if a name isn't a corpus item |
| Ingredient in this month's recipe | +3 | `recipes.csv` join |
| At peak (P) this month, not just in season (I) | +2 | Month grid |
| Everyday category (vegetable, fruit, salad) | +1 | `category`. Herbs, nuts and foraged/wild score 0 here |

Then:

- **Ties:** within the same score, the **shorter UK season goes first** (among equally familiar items, the one that's only around now is the better "this month" pick; this stops cabbage and lettuce heading every month). Categories are then interleaved so a wedge isn't all one colour.
- **Recipe guarantee:** the month's recipe ingredients are always on the enlarged wedge. If one falls outside the top 21, it replaces the lowest-ranked non-recipe item.
- **Import flag:** items whose corpus note says UK supply is mostly imported (e.g. cranberry) are never stickers. They still appear in the month's lists.
- **Result:** staples at peak lead (September's enlarged wedge opens with cucumber, plum, radishes, sweetcorn and blackberry), and herbs and foraged items only fill in once the familiar produce has run out (March's wedge ends with wild garlic and nettles).

#### Variety on quiet wedges

**Qing, seat chat, 2026-09-23 (as relayed, not verbatim):** fewer repeats on the non-highlighted months. If the corpus has other in-season options for a month, prefer those over repeating the same stickers across many wedges. Repeats are OK only when a month is genuinely thin.

So the 11 quiet wedges together should read as twelve different months, not twelve cabbages. `build-data.mjs` picks each month's 5 quiet stickers with a draft across the whole year:

1. **Recipe first:** each month's own recipe ingredients go on its quiet wedge (the 12 recipes use distinct produce, so this never repeats). The wheel and the panel's recipe card stay tied together.
2. **Draft rounds:** the months then take turns, one sticker per round, thinnest month (fewest P/I candidates) first. Each month takes its **most popular item** (by the ranking above) that isn't already on another quiet wedge.
3. **Repeats only when thin:** if a month has no unused option left, it takes its least-repeated item. On the current corpus this never happens: the 60 quiet stickers are all distinct, and the build prints any repeats.

The **enlarged active wedge is exempt**: it stays popularity-first (Qing's earlier rule), so it can share items with quiet wedges. The quiet and active lists for a month can differ; each wedge holds both lists.

Trade-off: rich months give up some headline staples to thinner ones (September's quiet wedge is cucumber, garlic, damson, butternut squash and loganberry; plum goes to October). Selecting the month still shows its most popular produce.

The `STAPLES` list is an **editorial judgement**, not corpus data. It is small and reviewable on purpose. **Stage 4** should replace it with a sourced signal (e.g. Defra Family Food purchase volumes or search-interest data), vendored and cited like the rest of the corpus.

### Current-month default (INTENT behaviour)

On load, the selection **is** the current calendar month, taken from `new Date()`. How it's shown:

- **Arrival spin:** the wheel spins in (about 170°, springy overshoot, 1.6 s) with every wedge quiet, and **lands with today's month on top**, under the pointer, swelling to the enlarged busy wedge as it arrives. Stickers pop in one after another, starting from today's segment.
- **Today stays marked** even after you spin away:
  - a **sun pill** (yellow, slowly turning rays) replaces that month's rim label;
  - a **marching-ants tomato halo** outlines the segment;
  - a red dot sits on that month in the month rail;
  - the panel shows a "This month" tag and the hub says "this month".
- A **"Back to {Month}" button** appears whenever another month is selected.
- For demos and tests, `?month=1..12` overrides the current month. Without it, the default is always the real current month.

### Interactions

| Action | Result |
|---|---|
| Click / tap a segment | The wheel rotates the shortest way to put it on top (0.85 s spring) while that wedge swells to the busy active size and the old one shrinks; a confetti burst pops at the rim; the panel refreshes |
| Click a sticker on the wheel | Selects its month **and** opens that item's fact sheet |
| Month rail buttons | Same as clicking a segment. This is the reliable control on small screens |
| ← / → keys | Previous / next month (wraps the year) |
| Tab to a segment, then Enter / Space | Selects it |
| Any produce tile or chip | Opens the fact sheet (native `<dialog>`; Esc, backdrop or × closes it) |
| Recipe link in a fact sheet | Closes the sheet and jumps the wheel to that recipe's month |

### Month panel (click month → short description)

- **Header:** season, month name, and a short **derived** description.
- A **mix bar** shows the in-season count by category.
- **"New in"** and **"Last call"** chips list items starting or ending their in-season run (P/I) this month.
- **Recipe card:** the month's stickers on a plate, the recipe title, clickable ingredient chips (with the corpus qualifier, e.g. "best after first frosts") and a link to the source.
- **At peak** (P) and **Also in season** (I) tile grids. A "recipe" badge marks the recipe's ingredients.
- **On the edge** (T): a collapsible chip list, explained as "start or end of season, or a single source".

**Copy rules.** The corpus has no authored month text (Stage 2, gap 1), so descriptions are **templates filled only from the grid**:

- peak and in-season counts;
- fullest / leanest month, or the change versus the previous month;
- the leading category and the fruit-peak count;
- the arrivals and farewells lists.

Every noun in the copy is a corpus item or a count. Winter months come out veg-led on their own ("Veg lead the peaks (11 of 15), with 4 fruits at their best") and no fruit is invented.

### Fact sheet (clickable ingredient)

**Corpus fields only:**

- name and category;
- a **12-month season ring** (P solid, I tint, T hatched, `.` pale) with the current month's cell bolded;
- in-season, peak and edge month ranges;
- `stored_notes` as month chips, when present;
- `regions_notes`, when present;
- the recipe join (recipes that use this item);
- `specialist_sources`, when present.

The 23 grid-only items say so plainly: "The research corpus only has the month grid for this one, so that's all we show." Nothing is padded.

### Motion inventory

| Moment | Motion | Timing |
|---|---|---|
| Load | Wheel spin-in to today; stickers pop in (scale and rotate), staggered by month distance from today | 1.6 s, overshoot |
| Select month | Shortest-path rotation (spring) while wedge widths trade (ease-out), with extra stickers growing in; hub text pop; confetti burst; panel rise; tiles pop in, staggered | 0.85 s; tiles 22 ms stagger |
| Idle | Selected segment's stickers bob; faces blink; today's sun rays turn; halo dashes march; pointer nudges | Slow loops (2.8–12 s) |
| Hover | Sticker jiggle (scale and tilt); tile lift and squish; chip tilt; plate wiggle | 0.2–0.6 s spring |
| Fact sheet | Dialog springs up; hero sticker pops, then bobs | 0.45 s |
| Reduced motion | All of the above off; state changes are instant (the enlarged wedge is drawn at its final size straight away) | — |

Only the selected segment bobs, so idle animation stays cheap on phones. The wheel layout is tweened in JS (`requestAnimationFrame`, one pass over 12 paths and their visible stickers per frame) because wedge widths can't be animated with CSS transforms alone.

### Accessibility and responsive

- **Layout:** two columns at 900 px and up (wheel sticky on the left, panel on the right). Below 900 px the wheel stacks above the panel and the rail becomes 6 × 2 below 560 px. Tiles tighten to 3 across on phones. The fact sheet goes single-column on phones.
- **Controls:** every action has a real `<button>` (rail, tiles, chips), so the wheel is never the only way in. Segments are focusable `role="button"` with labels like "September: 46 at peak, 17 more in season (this month)".
- **Announcements:** the panel is `aria-live="polite"`. The season ring and mix bar have text `aria-label`s. Stickers are `aria-hidden`; names are always printed beside them.
- **Visuals:** colour is never the only signal. States also differ by pattern (hatched edge) and by label, and there is a visible sky-blue focus ring. Ink-on-pastel contrast is high throughout.
- `prefers-reduced-motion` is honoured globally.

## Data pipeline (UK corpus only)

- `data/uk/` vendors the uploaded UK pass-2 pack:
  - `produce_calendar.csv`: 108 items. Byte-identical to the Drive copy per Stage 2 (13191 bytes).
  - `recipes.csv`: 12 recipes.
  - `schema_and_evidence_rules.md`.
- The CSV is the source rather than the JSON: the JSON merges `regions_notes`, `stored_notes` and sources into one `notes` field, and the CSV keeps them separate.
- `node scripts/build-data.mjs` writes `prototype/data.js` and **fails the build** if any of these break:
  - the item count is not 108;
  - a month state is not P, I, T or `.`;
  - a recipe ingredient doesn't resolve to a calendar item;
  - a recipe ingredient isn't P or I in its month;
  - there isn't exactly one recipe per month.
- **Alias normalisation** at ingest: strip `(…)` qualifiers (kept as display text), strip a leading "early", then try the name as-is, `-ies`→`-y` and `-s`→`` (`strawberries`→`strawberry`, `blackberries (early)`→`blackberry`, `early apples`→`apple`, `damsons`→`damson`, `chestnuts`→`chestnut`, `Jersey Royals (peak May-Jun)`→`jersey royals`, `parsnips (best after first frosts)`→`parsnips`).
- Nothing about the produce is authored by hand: arrivals and farewells are computed from the grid, and sticker picks are computed from the grid, recipes and categories. The one editorial input is the `STAPLES` ranking list (see [the commonness heuristic](#which-produce-goes-on-the-wedge-commonness-heuristic)). It orders stickers and adds no rows or fact fields.

## Prototype vs. what Stage 4/5 should harden

**Intentionally prototype (fine to throw away):**

- Plain static HTML/CSS/JS, with no framework or bundler. Panel HTML is rebuilt with template strings.
- Google Fonts loaded from the CDN.
- `?month=` override and `scripts/shoot.mjs` (a headless-Chrome screenshot harness used for design review).
- Hand-tuned SVG path data in one `art.js` file; archetype parameters are loose.
- Blurb templates live in `app.js`.

**Stage 4/5 should harden:**

1. **Keep the build-time data checks** (they are the no-invention guard) and run them in CI. Add a test that every corpus item has a mapped archetype (`ProduceArt.hasArt`) so new rows can't silently fall back.
2. **Self-host fonts** (and subset them), and add `font-display` metrics so the hub text doesn't reflow.
3. **Pre-render the sprite** to a static `sprites.svg` (or inline it at build time) instead of generating it on the client. Add social / OG preview art in the same style for the homepage and Twitter.
4. **Timezone:** the "current month" uses the visitor's local clock. Decide whether a UK exhibit should use `Europe/London` near month boundaries.
5. **State in the URL** (optional): shareable `#month` / `#item` links, as long as the no-hash default remains the current month.
6. **Performance budget:** keep idle animation limited to the selected segment. The busy wedge and the separate quiet picks put 258 sticker instances in the DOM (about 76 visible). Check that the month-change tween holds 60 fps on a mid-range phone; if it doesn't, create the active-only stickers only for the months being tweened.7. **A11y pass with a screen reader:** keyboard rotation, dialog focus return, and announcing month changes without being chatty.
8. **Trust copy:** surface the corpus's confidence caveats (Hubbub-only herbs, radicchio import flag) in an About / sources view built from `sources.md` once that annex is vendored.
9. **Art QA:** a few archetypes are close cousins (the needle-leaf herbs; thyme vs. tarragon). An illustrator pass can differentiate them without leaving the system.
10. **Popularity signal:** replace the editorial `STAPLES` list with a sourced familiarity or purchase signal (see [the commonness heuristic](#which-produce-goes-on-the-wedge-commonness-heuristic)), and keep the build check that every name resolves to a corpus item.

**Out of scope for v1 (per INTENT):** multi-country, globe or map; inventing rows or fact fields; more countries' wheels.

## How to run

```bash
node scripts/build-data.mjs          # regenerate prototype/data.js from data/uk/
python3 -m http.server -d prototype  # then open http://localhost:8000/
# demo another month:  http://localhost:8000/?month=1
# every sticker:       http://localhost:8000/gallery.html
```

Opening `prototype/index.html` straight from disk also works.

## Friction log

- **Stage 2 points at `/workspace/seasonal-produce-uk/`, which doesn't exist on this box.** The corpus arrived only as chat uploads (CSV, JSON, recipes, schema; no `sources.md`, long CSV or varieties annex). The pack is now vendored into `data/uk/`, so later stages have one in-repo source. Future briefs should point there.
- **Qing's "make it busier" feedback reached this seat as a paraphrase**, so DESIGN.md records it as relayed, not verbatim. If a verbatim quote exists, paste it in alongside the art-direction quote.
- **The corpus has no popularity signal**, yet "common and popular first" is now a design requirement. The `STAPLES` list covers the gap for the prototype; Stage 4 should source real data (Stage 4 hardening item 10).
- **The uploaded JSON isn't a lossless mirror of the CSV** (the notes fields are merged). The pipeline uses the CSV only. Stage 4 shouldn't switch to the JSON without re-splitting the fields.