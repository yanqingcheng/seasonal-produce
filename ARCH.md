# Stage 4 — Architecture (HLD)

**Date:** 2026-09-23
**Obeys:** [INTENT.md](INTENT.md) (thin UK ship, Qing affirmed 2026-09-23), [STAGE2.md](STAGE2.md) (UK pass-2 corpus PASS), [DESIGN.md](DESIGN.md) (Sticker Garden, signed off).
**This document is the Stage 5 spec.** Stage 5 ships the **UK pack** on a wheel that already speaks the country-pack contract below. It does not restyle the wheel, reopen motion, or publish a second country, a country toggle, or a globe.

The wheel is not a UK-only program with a rewrite planned later. The signed-off Stage 3 sticker garden is the **shared graphics layer**: one wheel, one panel, one fact sheet, reused for every country. A pack supplies data and locale copy. It does not fork that chrome. v1 builds and loads the UK pack only.

Where this file and DESIGN.md disagree on the **UK pack’s clock**, the **UK staple ranking**, or **which UK items may be stickers**, this file wins. Art, UK blurb wording, and accessibility stay in DESIGN.md. **§5 is the motion spec Stage 5 implements.** Those radii, angles, and sticker counts are the same figures as DESIGN.md’s wheel anatomy. They do not vary by country.

## Decisions to accept or correct

| # | Decision | Call |
|---|---|---|
| 1 | What “this month” means | The shell reads the **pack’s timezone**. The UK pack sets **Europe/London**. The v1 exhibit answers what the UK is growing now. |
| 2 | What a shared link does | A valid `?month=1..12` is the selected month: the arrival spin lands **that** wedge under the pointer, grown to the long radius (690 in the wheel’s viewBox; §5). The today marker stays on the pack timezone’s month. No query, or a value outside 1–12, selects the pack timezone’s month. |
| 3 | Runtime | One static page. SVG wheel, DOM panel, native dialog. The page calls `render(pack)`. No framework, no server, no account. |
| 4 | Popularity order | The ranking **algorithm** is shared. The staple **list** is pack data. The UK list stays the editorial `STAPLES` names, moved into the UK pack. It only orders stickers and is never shown as a fact. A cited purchase table replaces that list later; it is not a gate on this ship. |
| 5 | What may be a row | **Peak and in season mean a meaningful domestic growing season in that country.** Import-only shop availability is not a season. Those items are **removed from the pack**, not hidden with `sticker_exclude`. The UK pack **drops cranberry** (calendar, lists, and stickers). Pak choi and samphire stay. `sticker_exclude` may exist for a rare art hold and is **empty** for the UK pack. Radicchio stays for now; Instinct re-checks it. Stage 5 does not invent a fix. |
| 6 | Recipe depth | When a month has a recipe, the panel shows title, corpus ingredient chips, and the corpus source link. Method steps stay on that link. The UK pack has one recipe every month. |
| 7 | About / sources | Footer text comes from the pack. The UK string is: “Months and fact sheets come from the UK pass-2 research corpus (19 Sep 2026): BBC Good Food, Hubbub, BBC Gardeners’ World, Borough Kitchen and specialist grower bodies. Recipes are from BBC Good Food.” A separate About page waits until `sources.md` is in the repo. It is not in `data/uk/` today. |
| 8 | Public URL | `site/` published as a static site. GitHub Pages on this repo is the intended host (`https://yanqingcheng.github.io/seasonal-produce/`). Any public HTTPS host of that same directory meets the ship if Pages is unavailable. v1 has no country path. |
| 9 | How a second country plugs in | A new pack: data, locale copy, and bindings onto the existing stickers. A new drawing is added to the **shared** library only when no current archetype reads as that item. The wheel chrome is not redrawn. This pass does not add a second pack. |
| 10 | Toggle and globe | Extension is a new pack plus a selector. Stage 5 writes a registry with one shipped pack and does not draw a control. A control appears only when a later change ships a second pack. Globe and map stay deferred; when they exist they are that selector and call `loadPack(id)`. They are not a new wheel. |
| 11 | Graphics | Month tints, category colours, plate, type, motion, panel, and fact-sheet layout are one shared layer from Stage 3. Packs do not reskin them. |

## 1. Product cut

This is one exhibit in Qing’s Animal Crossing–style museum of loves, published as a homepage and a Twitter portfolio piece.

**v1 is the UK year-wheel.** A visitor lands on the current UK month, spins the wheel, reads a short month description, opens ingredient fact sheets, and sees one cited recipe per month.

**In v1**

- 12-month UK wheel, Sticker Garden art, signed-off motion.
- Month panel: derived blurb, mix, new-in / last-call, recipe card, at-peak, in-season, on-the-edge.
- Fact sheet for every UK pack item (107 once cranberry is removed), fields drawn only from that item’s corpus row.
- 12 recipes from `data/uk/recipes.csv`, one per month.
- Today marker, “Back to {month}”, month rail, keyboard, reduced motion.
- Shareable `?month=` link. Optional `?item=` opens that item’s fact sheet when the name is a corpus item; any other value is ignored.

**Out of v1** — see [Non-goals](#8-non-goals). The public page is the UK exhibit alone. `prototype/gallery.html` and `scripts/shoot.mjs` stay review tools. The pack boundary in the next section is in v1 so a later country does not require a new wheel.

## 2. Country packs

### Shared graphics layer

The Stage 3 prototype is the graphics spec for every country. Stage 5 implements it once. Changing country swaps the pack on that same screen. It does not ship a second design.

**Common, one implementation**

- The year-wheel chrome: scalloped plate, 12 wedges, hub, tomato pointer, upright rim labels, sun pill, marching-ants halo.
- Motion and packing from §5 and DESIGN.md: equal **30°** wedges, selected month enlarges by **radius** (442 → 690), tuck → rotate → bloom only as the wedge lands under the pointer (full within 4°, quiet by 16°), stickers anchored on their wedge, active fifteen in six rows (1+2+2+3+3+4), quiet five.
- Sticker-garden drawing rules: flat colour, one ink outline, one white highlight, a face, die-cut border and offset shadow. The same rules at chip size and at fact-sheet hero size.
- The archetype library (the Stage 3 shapes: round fruit, root, leek, brassica, and the rest).
- Month tints (icy blue in January through to lilac in December) and the category legend colours. These are chrome, not pack fields.
- Panels: month blurb, mix bar, new-in / last-call, recipe card on its plate, at-peak and in-season shelves, edge disclosure, fact-sheet dialog and season ring.
- Type, ink and paper, buttons, breakpoints, reduced motion, and the Open Graph image drawn in the same style.

**A pack supplies data and locale copy.** Title, tagline, month names, season labels, category labels, attribution, blurb connective words, and the thin-sheet sentence. Plus the calendar, recipes, staples, and skip list.

**What can be a country-specific asset**

- A **binding** from that pack’s item id to an archetype already in the library, plus the fill colours that distinguish items sharing a shape (plum and damson). That is how most new rows appear. No new drawing.
- A **new sticker** only when no archetype reads as that produce. The drawing joins the shared library under the same rules, and any pack may bind to it. It does not restyle the plate, the wedges, or the panels, and it is not a private theme.
- Nothing else visual. A pack does not bring its own plate, wedge geometry, motion, type, month palette, or panel layout.

### Shared core

These do not change when a country is added. Stage 5 builds them once, with the UK pack as the only input.

- **Flow.** Load → today’s month in the pack timezone → spin lands that wedge → month panel → ingredient fact sheet → recipe card when the month has one. Back to today. Rail, ←/→, reduced motion.
- **Graphics.** The layer above. `render(pack)` paints that one screen from the pack’s data and copy.
- **Ranking algorithm and quiet-wedge draft.** Same point table and draft rules. The staple names, the everyday categories, and the skip list come from the pack.
- **Blurb composer.** Same count rules as DESIGN.md. Connective words come from the pack’s copy bundle; nouns and counts come from that pack’s grid.
- **Fact-sheet renderer.** Same dialog. It draws a field only when that item has it. The four season roles (peak, in season, edge, out) are what the ring understands.

### Country pack contract

A pack is a directory `data/<id>/`. The build reads one pack and writes `site/data/<id>.json`. The shell’s only data API is `loadPack(id)` then `render(pack)`.

**Manifest, `pack.json`**

| Field | Meaning |
|---|---|
| `id`, `name` | Stable id (`uk`) and the country name |
| `locale` | BCP 47 tag. UK: `en-GB` |
| `timezone` | IANA zone for “this month”. UK: `Europe/London` |
| `title`, `tagline` | Header. UK: “The UK Year-Wheel” / “Spin through what's growing, month by month.” |
| `month_names` | 12 Gregorian names, January first. The wheel does not reorder months for a southern hemisphere; season labels do that work |
| `seasons` | 12 presentation labels, one per month. UK: Jan–Feb winter, Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec winter |
| `categories` | `{ id, label, plural, everyday }`. `everyday: true` is the ranking +1. Colour is the shared legend, not a pack field. UK ids: vegetable, fruit, herb, salad, nut, foraged/wild, with vegetable, fruit, and salad everyday. A category id the legend does not know yet is added once, in the shared legend, when that pack is accepted |
| `state_roles` | Map from the corpus’s month letters to the four roles `peak`, `in`, `edge`, `out`. UK: `P`, `I`, `T`, `.` |
| `sticker_exclude` | Optional item names omitted from sticker pools only, for a rare art hold. They would still be in the lists. It is not how imports are handled. UK: empty |
| `attribution` | Footer string |
| `thin_sheet` | Sentence when an item has no optional prose. UK uses the DESIGN.md line |
| `alias_profile` | `en` or `none`. See below |
| `recipe_rule` | `one_per_month` or `optional`. UK: `one_per_month` |
| `expect_items` | When set, the build fails if the row count differs. UK: `107` after cranberry is removed |
| `require_peak_every_month` | When true, the build fails if any month has no peak-role cell. UK: true (April has 8) |

**Calendar, `produce_calendar.csv`**, one row per item in that country:

| Column | Required | Use |
|---|---|---|
| `item` | yes | Unique name inside the pack. The wheel’s identity for the item |
| `category` | yes | A manifest category id |
| `jan`…`dec` | yes | A key of `state_roles` |
| `peak_months` | no | Checked against peak-role cells when present; not copied into the runtime document |
| `stored_notes` | no | JSON object, keys `jan`…`dec`, values short phrases. Fact-sheet chips |
| `regions_notes` | no | Fact-sheet prose |
| `specialist_sources` | no | Fact-sheet citations, split on `;` |

Any other column is kept in the file for research and is not shown. A future pack does not get new fact-sheet fields by adding a column. That takes a revision of this contract.

**Domestic season rule (every pack).** Qing, 2026-09-23: a row is in a pack only when the sources support a meaningful **domestic** growing season in that country. Supermarket import availability is not a season. Peak and in season on the wheel, in the month lists, and on the stickers mean country-grown. This is the same rule for the UK ship and for every later pack. Instinct applies it when packing other countries. Stage 5 does not invent replacement rows for items the rule removes.

The UK schema already excluded banana, citrus, dates, pomegranate, watermelon, melon, and sweet potato on that basis. Cranberry was left in the pass-2 calendar with a note that virtually all UK supply is imported and there is no meaningful UK season. That exception goes. Stage 5 deletes the cranberry row from `data/uk/produce_calendar.csv` before the ship build, and does not draw it. The pass-2 file had 108 rows; the UK pack ships **107**.

Pak choi and samphire stay. Their notes describe UK growing (glasshouse, Norfolk marsh) and mention imports only as a caveat. The prototype’s “note contains import” test is not the rule.

Radicchio stays in the pack. Qing flagged it as a soft spot: the audit calls the flags import-heavy shop availability, which is not proof of UK growing. That audit file is not in the repo. Instinct re-checks it. Stage 5 does not drop the row and does not invent UK-grower months. Qing is also asking Instinct to apply the domestic-season rule on the other countries still in research.

**Recipes, `recipes.csv`**, optional file. Columns: `month`, `recipe`, `in_season_produce_used`, `source_name`, `source_url`. At most one recipe per month under this contract. `one_per_month` fails the build unless each month has one. `optional` allows a month with none, and the panel omits the recipe card for that month. An ingredient must resolve to an item whose role in that month is peak or in season.

**Staples**, `staples.txt`, one item name per line. Empty or absent means the +4 score never applies. Every name must be a calendar item.

**Aliases.** The shared resolver lowercases the ingredient string, lifts a parenthetical into `qualifier`, then looks up the name. If `aliases.csv` exists (`from,item` pairs), those pairs win before anything else. The English steps (strip a leading `early `, then try the name, a trailing `ies`→`y`, and one trailing `s` removed) run only when `alias_profile` is `en`. UK sets `en` and keeps the worked examples in §4. A later pack that is not English sets `alias_profile` to `none` and ships explicit pairs. It does not inherit English plural stripping.

**Copy bundle**, `copy.json`. Locale copy the shell will not hardcode: “This month”, “Back to {month}”, “New in”, “Last call”, “At peak”, “Also in season”, “On the edge”, the edge explanation, state-role labels, and the blurb connective words. UK’s bundle is the English of the prototype and DESIGN.md. Item names inside blurbs still come from the grid. This file does not set colours, radii, or motion.

**Art bindings**, `art/bindings/<id>.json`. Each calendar item maps to a shared archetype id and that item’s fill colours. The drawings live once in `art/`. A pack that names a leek points at the leek archetype; it does not redraw the wheel. The build fails if any item lacks a binding. If no archetype fits, the new drawing is added to `art/` under the sticker-garden rules, then the binding points at it. Packs do not carry a second sprite style.

**Runtime document**, `site/data/<id>.json`, is the manifest’s display fields plus `items`, `recipes`, and `months` as in §4. `items[].months` stores the four **roles**, not the raw letters, so the shell never branches on a country’s alphabet. The UK CSV letters map onto those roles; `uk.json` stores the roles.

**Registry**, `site/data/registry.json`: an array of `{ id, name, status }` with `status` of `shipped`. v1 contains `{ "id": "uk", "name": "United Kingdom", "status": "shipped" }`. The shell draws a country control only when more than one entry is `shipped`.

### What is UK-specific in v1

UK-specific means pack content and UK profile flags. It does not mean branches in the wheel.

- Corpus: 107 items after cranberry is removed, the pass-2 notes for the rows that remain, 12 BBC Good Food recipes, English alias examples.
- Profile flags: `expect_items` 107, `recipe_rule` `one_per_month`, `require_peak_every_month`, `alias_profile` `en`.
- Clock, locale copy, season labels, category labels, staple list, attribution, title. Month tints and category colours stay in the shared graphics layer. `sticker_exclude` is empty.
- Evidence meaning of peak / in season / edge, which lives in `data/uk/schema_and_evidence_rules.md` and in the UK edge sentence. Another country’s letters map onto the same four roles only after that country’s own sources say so.

The exhibit script must not contain the UK timezone, the staple names, the footer sentence, or the item names. Those live in `uk.json`. A test can grep the script for `Europe/London` and expect no hits. `uk.json` must not contain `cranberry`.

### Extension path

**Exists in Stage 5, single-country**

- `loadPack(id)` / `render(pack)`.
- Build command `node scripts/build-data.mjs uk`, which is the shared builder pointed at one id.
- Registry with the one shipped row, and the rule that the control is absent until a second shipped row exists.
- `?country=uk` loads the UK pack. Any other `?country=` value is ignored and the UK pack still loads. No second JSON file is published, so an unknown id cannot paint an empty or invented wheel.

**Deliberately deferred**

- The selector UI: country toggle, globe, map, GeoJSON. When it is built, it only chooses a pack id. The screen it opens is this wheel.
- A second pack, including Spain MAPA. When that research is accepted, an adapter writes the contract CSVs into `data/<id>/`, locale copy and bindings are added, and the registry gains a shipped row. New stickers are added only for item ids the library cannot show. The wheel source and the Stage 3 chrome stay. The selector appears because the registry grew.
- Cross-country compare, a network fetch of packs, and any per-country motion, palette, or panel layout.

`openPack` for a future map is `loadPack(id)`. Stage 5 does not add a second function for geography.

### Worked plug-in (not built)

A later Spain pack is `data/es/pack.json` plus a calendar CSV in the columns above, optional recipes, a staple list, Spanish locale copy, `alias_profile: "none"` with `aliases.csv`, and `art/bindings/es.json` pointing at the existing archetypes. A produce the library cannot show gets one new shared sticker, drawn to the same rules. `timezone` would be `Europe/Madrid` if that pack is about what Spain is growing now. The plate, the spin, the panels, and the month colours stay the Stage 3 wheel. Missing months are not filled with UK rows or with guessed crops. Until that directory exists, the site has nothing to load for `es`.

## 3. Information architecture

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

**Default.** On load with no query, or with `?month=` outside 1–12, selection is the calendar month in the pack timezone. For the UK pack that zone is Europe/London. The arrival spin lands that wedge under the pointer at the active radius. `?country=` other than `uk` is ignored (§2).

**Selection vs today.** Today is computed once at load from the pack timezone and does not follow the query string. `?month=9` spins to September under the pointer and blooms September. If London’s month is March, March keeps the today marker and the header shows “Back to March”. The prototype treated `?month=` as today; the ship does not. A demo that needs the today marker on a chosen month uses the pack clock, or the review harness.

**Today marker**, four signals that stay on the pack’s current month after the visitor spins away:

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
| Flow | Up to four “New in” chips and four “Last call” chips. January’s previous month is December, and December’s next month is January. New in: peak or in season this month, and not peak or in season last month. Last call: peak or in season this month, not peak or in season next month, and not already New in. Candidates are this month’s peak items in CSV order, then its in-season items in CSV order. The chips show the first four of each list |
| Recipe | Stickers of that recipe’s produce, title, ingredient chips with corpus qualifier, outbound source link. Omitted when the pack has no recipe for the month. The UK pack has one every month |
| Shelves | At peak, Also in season (in-season role only), each tile opening a fact sheet. Recipe ingredients wear a badge |
| Edge | Collapsible edge-role list. The UK explanation, from the pack copy, is “start or end of season, or a single source” |

Season labels are the pack’s `seasons` array, not corpus fields. The UK array is the prototype’s grouping: Jan–Feb winter, Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec winter.

The **mix bar** counts items in the peak or in-season role this month, split by the pack’s categories. It is a proportional colour bar plus a text key such as “29 fruit”. Peak-only items are not a separate mix. The UK categories are vegetable, fruit, herb, salad, nut, and foraged/wild.

**Fact sheet.** Opens from a wheel sticker, a tile, a chip, or a valid `?item=` on load. The sheet describes the whole year for that item in this pack. The ring is drawn from that item’s twelve month roles. The bolded cell is the **selected** month (the pack’s current month, or the valid `?month=`).

A sheet opened from a control closes on Esc, backdrop, or ×, and returns focus to that control. A sheet opened from `?item=` waits until the arrival spin has settled, then opens. Closing it moves focus to that month’s rail button. A recipe button inside the sheet closes it and selects that recipe’s month.

**Ranges on the sheet.** “In season” is every month in the peak or in-season role, written as runs (`May–Aug`). “Peak” is every peak-role month. “On the edge” is every edge-role month, and the row is omitted when there are none. The panel shelf “At peak” is the peak role only. The shelf “Also in season” is the in-season role only, so peak items are not listed twice. On the UK pack those roles are the CSV letters `P`, `I`, and `T`.

**Navigation.** Segment click, sticker click, rail, ←/→ (wrap), and Enter/Space on a focused segment do what DESIGN.md’s interaction table says. The wheel is never the only control.

**Breakpoints.** Unchanged from DESIGN.md: two columns from 900px up (wheel sticky); stacked below that; rail 6×2 below 560px; fact sheet single column on phones.

## 4. Data shape

**Source of truth for v1** is the UK pack under `data/uk/`, not the Drive JSON (that JSON merges note fields). The shared contract is §2. This section is the UK profile of that contract, including the checks Stage 5 must keep.

| File | Role |
|---|---|
| `data/uk/produce_calendar.csv` | 107 items after Stage 5 removes cranberry. Name, category, `jan`…`dec` (`P` `I` `T` `.`), optional `peak_months`, `stored_notes`, `regions_notes`, `specialist_sources` |
| `data/uk/recipes.csv` | 12 rows. Month, title, ingredient string, source name, source URL |
| `data/uk/schema_and_evidence_rules.md` | What P/I/T/. mean |

Not in the repo, and not required to render v1: `produce_calendar_long.csv`, `produce_calendar.json`, `apple_pear_varieties.csv`, `sources.md`, `audit_report.md`. Apple’s regions note mentions a varieties annex; the fact sheet shows that sentence because it is corpus text. v1 does not add a varieties view.

**Build** (`node scripts/build-data.mjs uk`) reads the UK pack and writes `site/data/uk.json` plus `site/data/registry.json`. The client does not parse CSV. The shared builder fails if a state is outside `state_roles`, a category is unknown, a staple or alias misses, a recipe ingredient is not peak or in season in its month, or an item has no art binding. The UK profile also **fails** if any of these break:

- item count is not 107, or the name `cranberry` is still a row
- a regions note says there is no meaningful UK or domestic season (the cranberry wording). This does not drop notes that only mention imports as a caveat
- a month state is not `P`, `I`, `T`, or `.` (the UK `state_roles`)
- `peak_months`, when present, disagrees with that row’s peak-role cells (on this corpus they agree for every row that has the column)
- a recipe ingredient does not resolve to a calendar item
- a recipe ingredient is not `P` or `I` in its recipe month
- there is not exactly one recipe per month
- a staple name is not a calendar item
- a corpus item has no archetype binding (new check for Stage 5; the prototype did not fail the build on a missing drawing)

UK alias resolution (`alias_profile: "en"`) is the full procedure, which is the shared lowercase and parenthetical steps plus the English endings:

1. Lowercase the whole string.
2. If it contains `(…)`, remove that parenthetical from the lookup name and keep the inside text as `qualifier`.
3. If the lookup name starts with `early `, remove that prefix. If step 2 did not set a qualifier, set `qualifier` to `early`.
4. Try these candidates in order: the lookup name; that name with a trailing `ies` replaced by `y`; that name with one trailing `s` removed.
5. The build fails if none of those names is a corpus item.

`label` is the ingredient string as written in `recipes.csv`, before this procedure, so the chip can show the recipe’s own words. `qualifier` is the parenthetical text, or `early`, or null. Worked examples: `strawberries`→`strawberry`; `blackberries (early)`→`blackberry` with qualifier `early`; `early apples`→`apple` with qualifier `early`; `Jersey Royals (peak May-Jun)`→`jersey royals` with qualifier `peak May-Jun`.

**Runtime document** `uk.json` (one country object; a later pack has the same shape under its own id):

- `items[]` — one per corpus row. `item`, `category`, `months[12]` (each cell a role: `peak`, `in`, `edge`, or `out`), `stored_notes`, `regions_notes` (string or null), `specialist_sources` (string array). The UK CSV letters `P` `I` `T` `.` are mapped through `state_roles` before they are written here. The fact-sheet ring and the ranges are derived from these roles. The CSV `peak_months` column is not copied: on this corpus it matches the `P` cells wherever it is filled, and no row has a `P` cell with the column blank. `stored_notes` is null, or an object whose keys are `jan`…`dec` and whose values are the short corpus phrases (apple’s January value is `stored`). A fact-sheet chip shows the short month name and that phrase.
- `recipes[]` — `month` index 0–11, `title`, `produce[]` of `{ item, label, qualifier }`, `source_name`, `source_url`. `label` and `qualifier` are defined in the alias steps above.
- `months[]` — one object per calendar month, with counts and name-lists kept apart:
  - `key`, `name`
  - `counts`: `{ peak, in, edge }` — how many items are in the peak, in-season, and edge roles
  - `lead`: `{ category, count }` or null — the category with the most peak-role items. A tie goes to whichever tied category appears first in CSV order. Null when the month has no peak-role item. The UK profile fails the build in that case; April has 8 peaks
  - `blurb`: the composed sentence
  - `wheel`: up to 15 item names, popularity order, recipe ingredients guaranteed
  - `quiet`: 5 item names
  - `peak`, `in`, `edge`: item-name arrays for the peak, in-season, and edge roles, in CSV order
  - `arrivals`, `farewells`: item-name arrays, at most 4, defined with the chips in §3

Names in those arrays are corpus `item` strings. The client joins them to `items[]`. It does not invent rows.

**Blurbs** are composed at build time from that pack’s month grid only, using the template rules in DESIGN.md and the connective words in the pack copy bundle: peak count, in-season count, fullest or leanest month or the change versus the previous month (±8 as the threshold the prototype uses), leading peak category, fruit-peak count, and the arrival and farewell lists. Every noun is a corpus item or a count. The strings live in `uk.json` so a corpus change shows up in the diff. The client prints the string. When `lead` is null (no peak-role items), the leading-category sentence is omitted. The UK profile cannot hit that case.

**Sticker order** is the DESIGN.md points score, computed at build, never displayed:

| Signal | Points |
|---|---|
| Name in the pack’s staple list | +4 |
| Ingredient in this month’s recipe | +3 |
| Peak role this month | +2 |
| Category flagged `everyday` | +1 |

Sort by score, highest first. Inside one score, the shorter in-season run (count of peak + in-season months in this pack) comes first. Inside one score and one run length, take turns by category instead of listing one category as a block: CSV order picks which category leads, and CSV order ranks names inside a category. That full order is the ranking. The active fifteen are the first fifteen names, after which any recipe ingredient still outside replaces the lowest name that is not a recipe ingredient. The category turns can change who is inside the fifteen when a tied group crosses the cut. They are not only a rearrangement of an already chosen fifteen.

**Quiet five, in order:**

1. Put that month’s recipe ingredients on its quiet wedge first. On the UK corpus the 12 recipes use different produce, so this step does not repeat a name. A later pack whose recipes share an ingredient uses step 3 when a quiet slot would otherwise repeat.
2. Fill the remaining slots up to 5. Months take turns, one sticker per turn, fewest peak-or-in-season candidates first. On its turn a month takes its highest-ranked candidate that is not already on any quiet wedge.
3. A name appears on a second quiet wedge only when that month has no unused candidate left. It then takes its least-repeated remaining candidate. On this corpus that step does not run: the 60 quiet stickers are distinct, and the build prints any repeat.

If a pack sets `sticker_exclude`, those names are removed from both sticker pools before ranking and still appear in the lists. The UK list is empty. Imports are not handled here; they are absent from the calendar. The staple file is the 41 names already in the build script. The enlarged wedge may share names with quiet wedges; a month’s quiet five and its active fifteen can differ.

**Fact sheet fields**, and nothing else:

| Shown | Source |
|---|---|
| Name, category | row |
| 12-cell season ring (peak solid, in-season tint, edge hatched, out pale) | that item’s twelve roles |
| In-season range (peak and in season), peak range, edge range | derived from those roles |
| Stored notes as month chips | `stored_notes` when present |
| Regions prose | `regions_notes` when present |
| Recipes that use the item | recipe join |
| Specialist sources | `specialist_sources` when present |
| Thin-sheet line | when regions, stored notes, and specialist sources are all empty: “The research corpus only has the month grid for this one, so that's all we show.” |

Nutrition, taste, varieties, and encyclopedia copy are not fields.

## 5. Render path

**Static site.** The museum piece is one interactive exhibit. The only per-visitor input is the clock. Stage 5 publishes the files in `site/`. README asks later work to stay static and small.

**SVG for the wheel, DOM for the panel, `<dialog>` for the sheet.** Stickers stay crisp from a chip to the fact-sheet hero, labels stay upright, and controls stay real buttons. A wedge’s outer radius is path geometry, so the spin is a `requestAnimationFrame` spring that rewrites the 12 wedge paths and their sticker positions each frame.

**Art pipeline.** This is the shared graphics layer, not a UK theme. Archetype drawings move from `prototype/art.js` into `art/`. The UK item→archetype map moves to `art/bindings/uk.json`. The build emits `site/sprites.svg` with the symbols those bindings use (`art-*` and `cut-*` per item). The page includes that sprite. The client only `<use>`s it. A later pack adds bindings. A new symbol is emitted only for a new shared archetype. Art encodes what the item is. It does not encode variety, taste, or nutrition. The drawing rules stay DESIGN.md’s Sticker Garden. No photo, no photoreal render, no stock image. Month tints and category colours are constants in the shell, the same ones as the prototype.

**Fonts.** Fredoka and Nunito are self-hosted under `site/fonts/` (Open Font License, Latin subset, `font-display: optional` so a late font does not swap under the hub and move it). The page does not call Google Fonts.

**Motion spec.** Stage 5 implements the figures in this list. They match DESIGN.md. A later edit to one file updates the other in the same change.

- Every wedge is **30°**. The selected wedge grows in **radius** (quiet outer radius 442 → active 690 in the prototype viewBox; labels 478 → 728). Neighbours do not lose angle.
- **Tuck → rotate → bloom.** While the wheel is rotating, every wedge stays at the quiet radius. The outgoing wedge is back to that radius before it has moved 15°. No extended wedge travels around the circle. The incoming wedge grows only as it arrives under the pointer: full radius within 4° of the pointer, easing back to quiet radius by 16°. Wedges that merely pass the pointer during the rotation stay quiet.
- Stickers stay on their wedge. A name that is on both that month’s quiet list and its active list is one sticker on that wedge, and it slides between those two slots. A name only on the active list rides that wedge’s outer edge as it shrinks. A name that also appears on another month is a separate sticker on that other wedge. A visible sticker’s centre stays inside its own wedge path.
- Active wedge: up to 15 stickers, six rows (1+2+2+3+3+4), highest rank nearest the pointer. Quiet wedge: 5.
- Arrival spin (~1.6s) lands on the **selection** under the pointer at the active radius. With no query that selection is today in the pack timezone. With a valid `?month=` it is that month, while the today marker stays on the pack’s current month. Later selections take the shortest path (~0.9s) and retarget if the visitor clicks again mid-spin.
- Idle motion is the selected segment only (bob, blink, sun rays, halo, pointer). `prefers-reduced-motion` draws the final radii immediately and skips the spin.

Panel HTML is rendered from the loaded pack when the selection changes. The wheel is not redrawn from scratch; the spring updates geometry in place. v1 loads `uk.json`.

**Performance tactic, same architecture.** One frame visits 12 paths and the visible stickers (about 70). Idle animation stays on the selected segment. If a month-change trace on a mid-range phone, or a CPU-throttled desktop profile when no phone is available, stays under 30fps for the tween, Stage 5 creates active-only sticker nodes only for the wedges currently moving. That is a DOM-count tactic. It is not a switch to canvas.

**Social preview.** Stage 5 adds one static Open Graph image, drawn from the sticker sprite, for the homepage and Twitter card. It is not a second page.

## 6. Module and repo boundaries

| Path | Owns | Stage 5 |
|---|---|---|
| `INTENT.md`, `STAGE2.md`, `DESIGN.md`, `ARCH.md` | Product, corpus gate, visual system, this HLD | Read. Motion and the pack contract do not get redesigned in code comments. |
| `data/<id>/` | One country pack. v1 has `data/uk/` only: manifest, calendar, recipes, staples, copy | UK pack is the only directory. |
| `scripts/build-data.mjs` | Shared builder: validate a pack, rank stickers, compose blurbs, write JSON and the registry | `node scripts/build-data.mjs uk` writes `site/data/uk.json`. UK profile checks in §4 run here. |
| `art/` | Shared archetypes. `art/bindings/<id>.json` is per pack | Bindings for `uk` only. Build writes `site/sprites.svg`. |
| `site/` | Shell: `index.html`, `styles.css`, exhibit script, `data/uk.json`, `data/registry.json`, `sprites.svg`, `fonts/` | New. This is what gets published. The script calls `loadPack` / `render`. |
| `prototype/` | Signed-off Stage 3 prototype, including `gallery.html` | Stays openable for comparison. Not the deployed tree. |
| `scripts/shoot.mjs` | Screenshot harness for review | Not shipped. |

The exhibit script is one client module with three concerns: wheel springs, month panel, fact-sheet dialog. It takes a pack argument. Shared state is the selected month index, the today index, and the open item name. There is no store library and no router. There is no second code path for a second country.

**Deploy sketch**

1. On the ship branch, CI runs `node scripts/build-data.mjs uk` and fails the job when the §4 checks fail.
2. The job publishes the `site/` directory.
3. Intended URL: `https://yanqingcheng.github.io/seasonal-produce/`.
4. The page loads `uk.json`, `registry.json`, and `sprites.svg` from that same directory. No API. No other country file is on the server.

Local check remains a static server rooted at `site/` after the build. Opening the prototype from disk stays valid for design comparison; it is not the acceptance URL.

## 7. Thin-ship acceptance

Stage 5 is done when every line below is true on the public URL. A line that needs a judgement call is not done.

1. **URL.** An HTTPS URL loads `site/` with no build step in the browser. View source shows the exhibit, the sprite, `uk.json`, and `registry.json`, and does not request Google Fonts.
2. **Today.** With no query, on a machine whose `Europe/London` calendar month is M, the arrival spin ends with M under the pointer at the active radius, the panel says “This month”, and the sun pill, halo, and rail dot are on M. The other eleven wedges are 30° at the quiet radius.
3. **Share.** `?month=9` ends the arrival spin with September under the pointer at the active radius. If London’s month is not September, the sun pill, halo, and rail dot stay on London’s month and “Back to {that month}” selects it. `?month=13` behaves as no query. `?item=` set to a UK corpus `item` string opens that fact sheet; any other value does not open a sheet and does not add a row.
4. **Motion.** In every frame of a rotation, a wedge more than 16° from the pointer is at the quiet radius, and every visible sticker centre lies inside its wedge path. A wedge within 4° of the pointer may be at the long radius; that is the landing bloom, not a wedge travelling extended. Reduced-motion preference shows the final radii with no spin.
5. **Records.** The panel lists every peak and in-season item for the month. Counts match the 107-row UK calendar. Cranberry appears nowhere on the wheel, in the lists, or in `uk.json`. Pak choi, samphire, and radicchio are still in the pack. Each month shows its one recipe; each ingredient chip opens the joined item; the source link is the URL in `recipes.csv`.
6. **Fact sheets.** Apple’s sheet shows category, the ring, ranges, stored chips, regions note, and specialist source, and does not show nutrition or taste. A row with empty regions, stored notes, and specialist sources shows the thin-sheet sentence and no extra prose.
7. **Corpus gate.** `node scripts/build-data.mjs uk` exits non-zero if the item count, states, recipe joins, recipe count, staple names, or archetype bindings break the §4 rules. CI runs that command.
8. **Art.** Shipped image assets are the SVG sprite and the Open Graph image drawn from it. No raster food photograph.
9. **Access.** ←/→ change month and wrap. The fact sheet takes focus and returns it to the opener on close. Changing month updates the panel text; a screen reader announces that update when it finishes the current phrase, and focus stays on the control the visitor used (arrow key, rail button, or segment). Colour is paired with a label or a hatch. Month rail works below 900px wide.
10. **Scope.** The shipped DOM has no country switch, globe, or map. `registry.json` lists only `uk`. No second country’s data file is published or loaded.
11. **Pack boundary.** `uk.json` has `id` `uk` and `timezone` `Europe/London`. The exhibit script renders that document through the one wheel. `uk.json` does not carry wedge radii, bloom angles, or month-tint colours. The script does not contain `Europe/London` or the footer’s source sentence; those strings are in the pack. `?country=uk` loads the UK pack. `?country=es` is ignored, the UK pack still loads, and the page contains no Spain rows.

Performance note, recorded beside the checklist: one month-change on a mid-range phone or, if none is available, a CPU-throttled desktop profile, naming the machine. If the tween stays under 30fps, apply the sticker-node tactic in §5 and re-check. A tween that is still under 30fps after that tactic does not fail checks 1–11; the note says so, and Qing can hold the ship on that note alone.

## 8. Non-goals

Stage 5 does not do these. The pack contract in §2 is how a later country arrives; it is not permission to ship one now.

- A second country’s rows, and the selector that would show them (toggle, globe, map). Parallel research (US regional, Italy, Australia, Egypt, Mexico, and a future Spain MAPA pack) stays out of the thin ship. No invented rows for those countries, and no UK rows reused to fake them. A later country is a pack plus that selector, not a new wheel design.
- A per-country fork of the Stage 3 chrome: different plate, motion, month palette, panel layout, or sticker style.
- Inventing crop-season rows, month prose that names produce not in that month’s grid, or fact-sheet fields the loaded pack does not have. That includes inventing a UK growing season for radicchio, or deleting it, before Instinct re-checks the import-heavy flags.
- Treating supermarket imports as in season. Cranberry is the UK case Stage 5 removes. The same domestic-season rule applies to every country pack; Stage 5 does not write those other packs.
- Using the Joint Nature Conservation Committee (JNCC) UK fruit list — about 21 fruits, shipped inside an international data zip — as this calendar. INTENT allows it as corroboration only. Those rows are not in this repo, and v1 does not load them.
- Photoreal, photographic, or fake-realistic food. 3D and pixel art are not the v1 style; Sticker Garden is.
- Hosting recipe methods, quantities, or photos. The corpus has title, ingredient names, and a source URL.
- A varieties browser, an evidence-vote grid, or an About page, until those annexes are vendored. Even then they are a later change to this HLD, not part of the thin-ship acceptance list.
- Replacing the UK staple list with Defra or search-interest data inside Stage 5. Welcome as a follow-up once a cited table is in the UK pack and the build still proves every name is a corpus item.
- Accounts, comments, analytics-driven personalisation, a backend, or a framework rewrite of the prototype.

## Stage 5 reading order

1. [INTENT.md](INTENT.md) — what Qing affirmed.
2. This file — what to build, the eleven decisions above, and the country-pack contract. v1 fills the contract with the UK pack only. The Stage 3 sticker garden is the shared graphics layer.
3. [DESIGN.md](DESIGN.md) — art, interaction table, blurb wording, accessibility. Motion figures are §5 of this file; they match DESIGN.md’s wheel anatomy, and a change updates both.
4. [STAGE2.md](STAGE2.md) — why this corpus is enough, and which gaps must stay visible rather than be filled in.
