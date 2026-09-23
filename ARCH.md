# Stage 4 — Architecture (HLD)

**Date:** 2026-09-23
**Obeys:** [INTENT.md](INTENT.md) (thin UK ship, Qing affirmed 2026-09-23), [STAGE2.md](STAGE2.md) (UK pass-2 corpus PASS), [DESIGN.md](DESIGN.md) (Sticker Garden, signed off).
**This document is the Stage 5 spec.** Stage 5 builds the ship described here. It does not restyle the wheel, reopen motion, or start a second country.

Where this file and DESIGN.md disagree on the **clock**, the **staple ranking**, or **which items may be stickers**, this file wins. Art, blurb wording, and accessibility stay in DESIGN.md. **§4 is the motion spec Stage 5 implements.** Those radii, angles, and sticker counts are the same figures as DESIGN.md’s wheel anatomy.

## Decisions to accept or correct

| # | Decision | Call for the thin ship |
|---|---|---|
| 1 | What “this month” means | The calendar month in **Europe/London** at page load. The exhibit answers what the UK is growing now. |
| 2 | What a shared link does | A valid `?month=1..12` is the selected month: the arrival spin lands **that** wedge under the pointer, grown to the long radius (690 in the wheel’s viewBox; §4). The today marker stays on the London month. No query, or a value outside 1–12, selects the London month. |
| 3 | Runtime | One static page. SVG wheel, DOM panel, native dialog. No framework, no server, no account. |
| 4 | Popularity order | The editorial `STAPLES` list in `scripts/build-data.mjs` stays. It only orders stickers. It is never shown as a fact. A cited purchase table is a later corpus change, not a gate on this ship. |
| 5 | “Mostly imported” stickers | Wheel stickers skip an item only when its corpus note says UK supply is mostly imported and there is no meaningful UK season. On this corpus that item is **cranberry**. Pak choi and samphire stay eligible: their notes describe UK production and mention imports as a caveat. The prototype’s substring test drops those two as well; Stage 5 follows this row. |
| 6 | Recipe depth | Month panel shows title, corpus ingredient chips, and the corpus source link. Method steps stay on that link. |
| 7 | About / sources | Footer text: “Months and fact sheets come from the UK pass-2 research corpus (19 Sep 2026): BBC Good Food, Hubbub, BBC Gardeners’ World, Borough Kitchen and specialist grower bodies. Recipes are from BBC Good Food.” A separate About page waits until `sources.md` is in the repo. It is not in `data/uk/` today. |
| 8 | Public URL | `site/` published as a static site. GitHub Pages on this repo is the intended host (`https://yanqingcheng.github.io/seasonal-produce/`). Any public HTTPS host of that same directory meets the ship if Pages is unavailable. |

## 1. Product cut

This is one exhibit in Qing’s Animal Crossing–style museum of loves, published as a homepage and a Twitter portfolio piece.

**v1 is the UK year-wheel.** A visitor lands on the current UK month, spins the wheel, reads a short month description, opens ingredient fact sheets, and sees one cited recipe per month.

**In v1**

- 12-month UK wheel, Sticker Garden art, signed-off motion.
- Month panel: derived blurb, mix, new-in / last-call, recipe card, at-peak, in-season, on-the-edge.
- Fact sheet for every one of the 108 corpus items, fields drawn only from that item’s corpus row.
- 12 recipes from `data/uk/recipes.csv`, one per month.
- Today marker, “Back to {month}”, month rail, keyboard, reduced motion.
- Shareable `?month=` link. Optional `?item=` opens that item’s fact sheet when the name is a corpus item; any other value is ignored.

**Out of v1** — see [Non-goals](#7-non-goals). The public page is this exhibit alone. `prototype/gallery.html` and `scripts/shoot.mjs` stay review tools.

## 2. Information architecture

One URL, one screen, one dialog.

```
header          "The UK Year-Wheel" and "Spin through what's growing, month by month.", plus "Back to {month}" when the selection is not today
stage
  wheel         12 wedges, hub, upright month labels, today halo
  month rail    12 buttons; the reliable control under 900px
  month panel   the selected month's record
fact sheet      native dialog over the stage
footer          corpus attribution
```

**Default.** On load with no query, or with `?month=` outside 1–12, selection is the Europe/London calendar month. The arrival spin lands that wedge under the pointer at the active radius.

**Selection vs today.** Today is computed once at load from `Europe/London` and does not follow the query string. `?month=9` spins to September under the pointer and blooms September. If London’s month is March, March keeps the today marker and the header shows “Back to March”. The prototype treated `?month=` as today; the ship does not. A demo that needs the today marker on a chosen month uses the London clock, or the review harness.

**Today marker**, four signals that stay on the London month after the visitor spins away:

| Signal | What it shows |
|---|---|
| Sun pill | That month’s rim label is a yellow sun badge with the short month name, instead of the plain rim label |
| Halo | A tomato-coloured dashed outline on that wedge |
| Rail dot | A red dot on that month’s rail button |
| Panel tag | The words “This month” in the panel header when the selected month is today |

The hub is the disc in the middle of the wheel. It names the month **under the pointer** (the selection), that month’s season, and its peak count. When the selection is today it also says “this month”. During a spin it ticks through the months passing the pointer.

**Month panel** (the “click a month → short description” beat):

| Block | Contents |
|---|---|
| Header | Season label, month name, “This month” when the selection is today, derived blurb, mix bar |
| Flow | Up to four “New in” chips and four “Last call” chips. January’s previous month is December, and December’s next month is January. New in: `P` or `I` this month, and not `P` or `I` last month. Last call: `P` or `I` this month, not `P` or `I` next month, and not already New in. Candidates are this month’s `P` items in CSV order, then its `I` items in CSV order. The chips show the first four of each list |
| Recipe | Stickers of that recipe’s produce, title, ingredient chips with corpus qualifier, outbound source link |
| Shelves | At peak (P), Also in season (I), each tile opening a fact sheet. Recipe ingredients wear a badge |
| Edge | Collapsible T list: “start or end of season, or a single source” |

Season labels are presentation, fixed to the prototype’s grouping: Jan–Feb winter, Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec winter. They are not corpus fields.

The **mix bar** counts items that are `P` or `I` this month, split by category (vegetable, fruit, herb, salad, nut, foraged/wild). It is a proportional colour bar plus a text key such as “29 fruit”. Peak-only items are not a separate mix.

**Fact sheet.** Opens from a wheel sticker, a tile, a chip, or a valid `?item=` on load. The sheet always describes the whole UK year for that item. The ring is drawn from that item’s twelve month states. The bolded cell is the **selected** month (London’s month, or the valid `?month=`).

A sheet opened from a control closes on Esc, backdrop, or ×, and returns focus to that control. A sheet opened from `?item=` waits until the arrival spin has settled, then opens. Closing it moves focus to that month’s rail button. A recipe button inside the sheet closes it and selects that recipe’s month.

**Ranges on the sheet.** “In season” is every month that is `P` or `I`, written as runs (`May–Aug`). “Peak” is every `P` month. “On the edge” is every `T` month, and the row is omitted when there are none. The panel shelf “At peak” is `P` only. The shelf “Also in season” is `I` only, so peak items are not listed twice.

**Navigation.** Segment click, sticker click, rail, ←/→ (wrap), and Enter/Space on a focused segment do what DESIGN.md’s interaction table says. The wheel is never the only control.

**Breakpoints.** Unchanged from DESIGN.md: two columns from 900px up (wheel sticky); stacked below that; rail 6×2 below 560px; fact sheet single column on phones.

## 3. Data shape

**Source of truth** is the vendored CSV pair, not the Drive JSON (that JSON merges note fields):

| File | Role |
|---|---|
| `data/uk/produce_calendar.csv` | 108 items. Name, category, `jan`…`dec` (`P` `I` `T` `.`), optional `peak_months`, `stored_notes`, `regions_notes`, `specialist_sources` |
| `data/uk/recipes.csv` | 12 rows. Month, title, ingredient string, source name, source URL |
| `data/uk/schema_and_evidence_rules.md` | What P/I/T/. mean |

Not in the repo, and not required to render v1: `produce_calendar_long.csv`, `produce_calendar.json`, `apple_pear_varieties.csv`, `sources.md`, `audit_report.md`. Apple’s regions note mentions a varieties annex; the fact sheet shows that sentence because it is corpus text. v1 does not add a varieties view.

**Build** (`scripts/build-data.mjs`) reads the CSVs and writes the runtime document `site/data/exhibit.json`. The client does not parse CSV. The build **fails** if any of these break:

- item count is not 108
- a month state is not `P`, `I`, `T`, or `.`
- `peak_months`, when present, disagrees with that row’s `P` cells (on this corpus they agree for every row that has the column)
- a recipe ingredient does not resolve to a calendar item
- a recipe ingredient is not `P` or `I` in its recipe month
- there is not exactly one recipe per month
- a `STAPLES` name is not a calendar item
- a corpus item has no archetype in the art map (new check for Stage 5; the prototype did not fail the build on a missing drawing)

Alias resolution, in order, on each recipe ingredient string:

1. Lowercase the whole string.
2. If it contains `(…)`, remove that parenthetical from the lookup name and keep the inside text as `qualifier`.
3. If the lookup name starts with `early `, remove that prefix. If step 2 did not set a qualifier, set `qualifier` to `early`.
4. Try these candidates in order: the lookup name; that name with a trailing `ies` replaced by `y`; that name with one trailing `s` removed.
5. The build fails if none of those names is a corpus item.

`label` is the ingredient string as written in `recipes.csv`, before this procedure, so the chip can show the recipe’s own words. `qualifier` is the parenthetical text, or `early`, or null. Worked examples: `strawberries`→`strawberry`; `blackberries (early)`→`blackberry` with qualifier `early`; `early apples`→`apple` with qualifier `early`; `Jersey Royals (peak May-Jun)`→`jersey royals` with qualifier `peak May-Jun`.

**Runtime document** (one JSON object):

- `items[]` — one per corpus row. `item`, `category`, `months[12]` (each cell `P`, `I`, `T`, or `.`), `stored_notes`, `regions_notes` (string or null), `specialist_sources` (string array). The fact-sheet ring and the peak / in-season / edge ranges are derived from `items[].months`. The CSV `peak_months` column is not copied: on this corpus it matches the `P` cells wherever it is filled, and no row has a `P` cell with the column blank. `stored_notes` is null, or an object whose keys are `jan`…`dec` and whose values are the short corpus phrases (apple’s January value is `stored`). A fact-sheet chip shows the short month name and that phrase.
- `recipes[]` — `month` index 0–11, `title`, `produce[]` of `{ item, label, qualifier }`, `source_name`, `source_url`. `label` and `qualifier` are defined in the alias steps above.
- `months[]` — one object per calendar month, with counts and name-lists kept apart:
  - `key`, `name`
  - `counts`: `{ peak, in, edge }` — how many items are `P`, `I`, and `T`
  - `lead`: `{ category, count }` — the category with the most `P` items. A tie goes to whichever tied category appears first in CSV order. Every month in this corpus has at least one `P` (April has 8); the build fails if a month has none
  - `blurb`: the composed sentence
  - `wheel`: up to 15 item names, popularity order, recipe ingredients guaranteed
  - `quiet`: 5 item names
  - `peak`, `in`, `edge`: item-name arrays for `P`, `I`, and `T`, in CSV order
  - `arrivals`, `farewells`: item-name arrays, at most 4, defined with the chips in §2

Names in those arrays are corpus `item` strings. The client joins them to `items[]`. It does not invent rows.

**Blurbs** are composed at build time from the month grid only, using the template rules already in DESIGN.md: peak count, in-season count, fullest or leanest month or the change versus the previous month (±8 as the threshold the prototype uses), leading peak category, fruit-peak count, and the arrival and farewell lists. Every noun is a corpus item or a count. The strings live in `exhibit.json` so a corpus change shows up in the diff. The client prints the string; it does not keep a second copy of the template.

**Sticker order** is the DESIGN.md points score, computed at build, never displayed:

| Signal | Points |
|---|---|
| Name in `STAPLES` | +4 |
| Ingredient in this month’s recipe | +3 |
| `P` this month | +2 |
| Category vegetable, fruit, or salad | +1 |

Sort by score, highest first. Inside one score, the shorter UK in-season run (count of `P`+`I` months) comes first. Inside one score and one run length, take turns by category instead of listing one category as a block: CSV order picks which category leads, and CSV order ranks names inside a category. That full order is the ranking. The active fifteen are the first fifteen names, after which any recipe ingredient still outside replaces the lowest name that is not a recipe ingredient. The category turns can change who is inside the fifteen when a tied group crosses the cut. They are not only a rearrangement of an already chosen fifteen.

**Quiet five, in order:**

1. Put that month’s recipe ingredients on its quiet wedge first. The 12 recipes use different produce, so this step does not repeat a name.
2. Fill the remaining slots up to 5. Months take turns, one sticker per turn, fewest `P`+`I` candidates first. On its turn a month takes its highest-ranked candidate that is not already on any quiet wedge.
3. A name appears on a second quiet wedge only when that month has no unused candidate left. It then takes its least-repeated remaining candidate. On this corpus that step does not run: the 60 quiet stickers are distinct, and the build prints any repeat.

Cranberry is removed from both the active and the quiet candidate pools before ranking. The `STAPLES` set remains the 41 names already in the build script. The enlarged wedge may share names with quiet wedges; a month’s quiet five and its active fifteen can differ.

**Fact sheet fields**, and nothing else:

| Shown | Source |
|---|---|
| Name, category | row |
| 12-cell season ring (P solid, I tint, T hatched, `.` pale) | that item’s `items[].months` |
| In-season range (`P` and `I`), peak range (`P`), edge range (`T`) | derived from that same `items[].months` array |
| Stored notes as month chips | `stored_notes` when present |
| Regions prose | `regions_notes` when present |
| Recipes that use the item | recipe join |
| Specialist sources | `specialist_sources` when present |
| Thin-sheet line | when regions, stored notes, and specialist sources are all empty: “The research corpus only has the month grid for this one, so that's all we show.” |

Nutrition, taste, varieties, and encyclopedia copy are not fields.

## 4. Render path

**Static site.** The museum piece is one interactive exhibit. The only per-visitor input is the clock. Stage 5 publishes the files in `site/`. README asks later work to stay static and small.

**SVG for the wheel, DOM for the panel, `<dialog>` for the sheet.** Stickers stay crisp from a chip to the fact-sheet hero, labels stay upright, and controls stay real buttons. A wedge’s outer radius is path geometry, so the spin is a `requestAnimationFrame` spring that rewrites the 12 wedge paths and their sticker positions each frame.

**Art pipeline.** Archetype drawings and the item→archetype colour map move from `prototype/art.js` into `art/`. The build emits `site/sprites.svg` (`art-*` and `cut-*` symbols per item). The page includes that sprite. The client only `<use>`s it. Art encodes what the item is. It does not encode variety, taste, or nutrition. The drawing rules (flat colour, one ink outline, one white highlight, a face, die-cut border) stay DESIGN.md’s Sticker Garden. No photo, no photoreal render, no stock image.

**Fonts.** Fredoka and Nunito are self-hosted under `site/fonts/` (Open Font License, Latin subset, `font-display: optional` so a late font does not swap under the hub and move it). The page does not call Google Fonts.

**Motion spec.** Stage 5 implements the figures in this list. They match DESIGN.md. A later edit to one file updates the other in the same change.

- Every wedge is **30°**. The selected wedge grows in **radius** (quiet outer radius 442 → active 690 in the prototype viewBox; labels 478 → 728). Neighbours do not lose angle.
- **Tuck → rotate → bloom.** While the wheel is rotating, every wedge stays at the quiet radius. The outgoing wedge is back to that radius before it has moved 15°. No extended wedge travels around the circle. The incoming wedge grows only as it arrives under the pointer: full radius within 4° of the pointer, easing back to quiet radius by 16°. Wedges that merely pass the pointer during the rotation stay quiet.
- Stickers stay on their wedge. A name that is on both that month’s quiet list and its active list is one sticker on that wedge, and it slides between those two slots. A name only on the active list rides that wedge’s outer edge as it shrinks. A name that also appears on another month is a separate sticker on that other wedge. A visible sticker’s centre stays inside its own wedge path.
- Active wedge: up to 15 stickers, six rows (1+2+2+3+3+4), highest rank nearest the pointer. Quiet wedge: 5.
- Arrival spin (~1.6s) lands on the **selection** under the pointer at the active radius. With no query that selection is today. With a valid `?month=` it is that month, while the today marker stays on London’s month. Later selections take the shortest path (~0.9s) and retarget if the visitor clicks again mid-spin.
- Idle motion is the selected segment only (bob, blink, sun rays, halo, pointer). `prefers-reduced-motion` draws the final radii immediately and skips the spin.

Panel HTML is rendered from `exhibit.json` when the selection changes. The wheel is not redrawn from scratch; the spring updates geometry in place.

**Performance tactic, same architecture.** One frame visits 12 paths and the visible stickers (about 70). Idle animation stays on the selected segment. If a month-change trace on a mid-range phone, or a CPU-throttled desktop profile when no phone is available, stays under 30fps for the tween, Stage 5 creates active-only sticker nodes only for the wedges currently moving. That is a DOM-count tactic. It is not a switch to canvas.

**Social preview.** Stage 5 adds one static Open Graph image, drawn from the sticker sprite, for the homepage and Twitter card. It is not a second page.

## 5. Module and repo boundaries

| Path | Owns | Stage 5 |
|---|---|---|
| `INTENT.md`, `STAGE2.md`, `DESIGN.md`, `ARCH.md` | Product, corpus gate, visual system, this HLD | Read. Motion and field bounds do not get redesigned in code comments. |
| `data/uk/*.csv` | Corpus | Only input to the build. |
| `scripts/build-data.mjs` | Validate corpus, rank stickers, compose blurbs, write JSON | Output path becomes `site/data/exhibit.json`. Checks in §3 run here. |
| `art/` | Archetypes, item map | Moved out of `prototype/art.js`. Build reads it and writes `site/sprites.svg`. |
| `site/` | The ship: `index.html`, `styles.css`, exhibit script, `data/exhibit.json`, `sprites.svg`, `fonts/` | New. This is what gets published. |
| `prototype/` | Signed-off Stage 3 prototype, including `gallery.html` | Stays openable for comparison. Not the deployed tree. |
| `scripts/shoot.mjs` | Screenshot harness for review | Not shipped. |

The exhibit script is one client module with three concerns: wheel springs, month panel, fact-sheet dialog. Shared state is the selected month index, the today index, and the open item name. There is no store library and no router.

**Deploy sketch**

1. On the ship branch, CI runs `node scripts/build-data.mjs` and fails the job when §3 checks fail.
2. The job publishes the `site/` directory.
3. Intended URL: `https://yanqingcheng.github.io/seasonal-produce/`.
4. The page loads `exhibit.json` and `sprites.svg` from that same directory. No API.

Local check remains a static server rooted at `site/` after the build. Opening the prototype from disk stays valid for design comparison; it is not the acceptance URL.

## 6. Thin-ship acceptance

Stage 5 is done when every line below is true on the public URL. A line that needs a judgement call is not done.

1. **URL.** An HTTPS URL loads `site/` with no build step in the browser. View source shows the exhibit, the sprite, and the JSON, and does not request Google Fonts.
2. **Today.** With no query, on a machine whose `Europe/London` calendar month is M, the arrival spin ends with M under the pointer at the active radius, the panel says “This month”, and the sun pill, halo, and rail dot are on M. The other eleven wedges are 30° at the quiet radius.
3. **Share.** `?month=9` ends the arrival spin with September under the pointer at the active radius. If London’s month is not September, the sun pill, halo, and rail dot stay on London’s month and “Back to {that month}” selects it. `?month=13` behaves as no query. `?item=` set to a corpus `item` string opens that fact sheet; any other value does not open a sheet and does not add a row.
4. **Motion.** In every frame of a rotation, a wedge more than 16° from the pointer is at the quiet radius, and every visible sticker centre lies inside its wedge path. A wedge within 4° of the pointer may be at the long radius; that is the landing bloom, not a wedge travelling extended. Reduced-motion preference shows the final radii with no spin.
5. **Records.** The panel lists every P and I item for the month. Counts match the CSV. Each month shows its one recipe; each ingredient chip opens the joined item; the source link is the URL in `recipes.csv`.
6. **Fact sheets.** Apple’s sheet shows category, the ring, ranges, stored chips, regions note, and specialist source, and does not show nutrition or taste. A row with empty regions, stored notes, and specialist sources shows the thin-sheet sentence and no extra prose.
7. **Corpus gate.** `node scripts/build-data.mjs` exits non-zero if the item count, states, recipe joins, recipe count, staple names, or archetype map break the §3 rules. CI runs that command.
8. **Art.** Shipped image assets are the SVG sprite and the Open Graph image drawn from it. No raster food photograph.
9. **Access.** ←/→ change month and wrap. The fact sheet takes focus and returns it to the opener on close. Changing month updates the panel text; a screen reader announces that update when it finishes the current phrase, and focus stays on the control the visitor used (arrow key, rail button, or segment). Colour is paired with a label or a hatch. Month rail works below 900px wide.
10. **Scope.** The shipped DOM has no country switch, globe, or map, and no second country’s data file is loaded.

Performance note, recorded beside the checklist: one month-change on a mid-range phone or, if none is available, a CPU-throttled desktop profile, naming the machine. If the tween stays under 30fps, apply the sticker-node tactic in §4 and re-check. A tween that is still under 30fps after that tactic does not fail checks 1–10; the note says so, and Qing can hold the ship on that note alone.

## 7. Non-goals

- Multi-country toggle, globe, map, or any country wheel besides the UK. Parallel research (US regional, Italy, Australia, Egypt, Mexico) stays out of this ship.
- Inventing crop-season rows, month prose that names produce not in that month’s grid, or fact-sheet fields the corpus does not have.
- Using the Joint Nature Conservation Committee (JNCC) UK fruit list — about 21 fruits, shipped inside an international data zip — as this calendar. INTENT allows it as corroboration only. Those rows are not in this repo, and v1 does not load them.
- Photoreal, photographic, or fake-realistic food. 3D and pixel art are not the v1 style; Sticker Garden is.
- Hosting recipe methods, quantities, or photos. The corpus has title, ingredient names, and a source URL.
- A varieties browser, an evidence-vote grid, or an About page, until those annexes are vendored. Even then they are a later change to this HLD, not part of the thin-ship acceptance list.
- Replacing `STAPLES` with Defra or search-interest data inside Stage 5. Welcome as a follow-up once a cited table is in `data/uk/` and the build still proves every name is a corpus item.
- Accounts, comments, analytics-driven personalisation, a backend, or a framework rewrite of the prototype.

## Stage 5 reading order

1. [INTENT.md](INTENT.md) — what Qing affirmed.
2. This file — what to build, and the eight decisions above.
3. [DESIGN.md](DESIGN.md) — art, interaction table, blurb wording, accessibility. Motion figures are §4 of this file; they match DESIGN.md’s wheel anatomy, and a change updates both.
4. [STAGE2.md](STAGE2.md) — why this corpus is enough, and which gaps must stay visible rather than be filled in.
