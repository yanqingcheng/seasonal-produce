# Stage 2 assessment — UK thin ship vs INTENT.md

**Date:** 2026-09-23 (Europe/London)  
**Assessor seat:** Flotsam (Workshop Neopet) / executor  
**Repo intent:** `yanqingcheng/seasonal-produce` PR #1 branch `cursor/scaffold-intent-docs-7e9b` → `INTENT.md` (Qing affirmed 2026-09-23)  
**Explicit scope of this verdict:** against that **INTENT.md thin UK ship**, **not** Melody’s earlier PASS against idea #22.

---

## Verdict: **PASS**

The local + Drive UK pass-2 corpus is **sufficient for the affirmed thin UK ship**. It supplies a full 12-month UK calendar (~108 items), one cited recipe per month, and corpus-bounded fields for ingredient fact sheets. It is **not** the thin JNCC fruit-only stripe (~21). Remaining gaps are Stage-3 presentation / join hygiene / optional enrichment — they do **not** require inventing crop-season rows and do **not** block Stages 3–5 for the UK-first cut.

**Thin-ship adequacy:** **YES** — good enough for a UK circular year-wheel + recipes + corpus-bounded fact sheets even though long-term density (prose notes, herb confidence, Wales/NI depth) is incomplete.

---

## Evidence

### Corpus paths (densest UK pack)

| Path | Role |
|---|---|
| `/workspace/seasonal-produce-uk/` | Local working pack (aligned to Drive after annex pull) |
| Drive folder `1wCQqq9T4hq9qsw09yuO8JhooGKWb3FoV` | Canonical UK Seasonal Produce research (same pass-2) |
| `/workspace/seasonal-produce-uk/produce_calendar.csv` | Primary calendar (108 items × 12 months) |
| `/workspace/seasonal-produce-uk/produce_calendar.json` | Same 108 items, app-ingestion shape |
| `/workspace/seasonal-produce-uk/produce_calendar_long.csv` | Evidence grid (1296 = 108×12 cells; per-source votes) |
| `/workspace/seasonal-produce-uk/recipes.csv` | 12 cited recipes (one per calendar month) |
| `/workspace/seasonal-produce-uk/apple_pear_varieties.csv` | Annex: 27 variety season windows |
| `/workspace/seasonal-produce-uk/schema_and_evidence_rules.md` | Schema / P·I·T·. rules |
| `/workspace/seasonal-produce-uk/audit_report.md` | Contradictions, exclusions, confidence caveats |
| `/workspace/seasonal-produce-uk/sources.md` | Source ledger |
| `/workspace/seasonal-produce-uk/changelog.md` | Pass 1→2 history |

**Rejected as primary UK source:** intl zip UK JNCC fruit-only stripe (~21) under `/workspace/seasonal-produce-intl/` — corroboration only per INTENT.

**Note:** Before this assessment, the box folder held only CSV calendar + recipes + schema/audit/changelog. Drive annexes (`produce_calendar_long.csv`, `produce_calendar.json`, `apple_pear_varieties.csv`, `sources.md`) were copied into `/workspace/seasonal-produce-uk/` so Stage 3 can use the densest pack. Calendar row count matches Drive (`produce_calendar.csv` 13191 bytes / 108 rows).

### Key counts

| Metric | Count |
|---|---|
| Calendar items (`produce_calendar.csv`) | **108** |
| Unique item names | **108** |
| Months with ≥1 in-season cell (P/I/T) | **12 / 12** |
| Recipes | **12** (exactly one per month Jan–Dec) |
| Long evidence rows | **1296** (108×12) |
| Apple/pear variety annex rows | **27** |
| Categories | vegetable 52, fruit 29, herb 13, salad 7, foraged/wild 5, nut 2 |

### Month coverage (in-season density)

States: **P** peak, **I** in season, **T** transition, **.** out.

| Month | P+I+T | P+I only | Peak (P) | Notes |
|---|---:|---:|---:|---|
| jan | 35 | 25 | 15 | Veg-heavy winter; usable |
| feb | 33 | 25 | 13 | Thinnest total P+I+T; still ≥33 |
| mar | 36 | 22 | 10 | Lowest P+I (tied with apr) |
| apr | 34 | 22 | 8 | Lowest peak count |
| may | 53 | 24 | 11 | Transition-heavy (T=29) |
| jun | 71 | 45 | 27 | Rich |
| jul | 80 | 54 | 35 | Rich |
| aug | 81 | 60 | 43 | Rich |
| sep | 85 | 63 | 46 | Densest |
| oct | 73 | 48 | 29 | Rich |
| nov | 44 | 31 | 23 | Adequate |
| dec | 40 | 28 | 16 | Adequate |

**Sparse-month flag (non-blocking):** Jan–Apr and Nov–Dec are thinner than summer, especially for **fruit peaks**, but every month has **≥22 P+I** and **≥33 P+I+T** items — enough produce names to richly illustrate each wheel segment without inventing rows. Winter segments will be veg/root-led by nature of UK seasonality.

### Sample items (not invented)

- `apple` fruit — peaks jan/feb/sep–dec; stored_notes + regions_notes + specialist source present  
- `asparagus` vegetable — peak apr–jun; Vale of Evesham PGI note  
- `jersey royals` vegetable — peak may–jun (May recipe star)  
- `strawberry` fruit — peak may–aug (June recipe; recipe text says “strawberries”)  
- `forced rhubarb` fruit — winter product split from maincrop `rhubarb`

### Recipes ↔ calendar

`recipes.csv` fields: `month`, `recipe`, `in_season_produce_used`, `source_name`, `source_url`.

- All **12 months** present; all URLs are BBC Good Food (audit: spot-verified live 19 Sep 2026).  
- Star produce resolves to calendar items that are **P or I** in that month (schema rule).  
- **Join hygiene (non-blocking):** recipe strings use plurals/aliases that need normalization at ingest, e.g. `strawberries` → `strawberry`, `blackberries` → `blackberry`, `damsons` → `damson`, `chestnuts` → `chestnut`. October “pumpkin & squash” maps cleanly to item `pumpkin & squash` (and optionally `butternut squash`).  
- Usable for thin ship: yes — title + month + ingredient list + source URL is enough to surface a recipe on each month segment.

### Fact-sheet field inventory

**Present on every calendar row (108/108):**

- `item` (name)  
- `category`  
- `jan`…`dec` month states (P/I/T/.)  
- derivable: in-season month list, peak month list from grid

**Present on some rows (corpus-bounded; do not invent fillers):**

| Field | Nonempty | Use on fact sheet |
|---|---:|---|
| `peak_months` | 73/108 | Peak callout |
| `regions_notes` | 43/108 | Regional / PDO-PGI prose when present |
| `stored_notes` | 11/108 | Storage availability (not harvest) |
| `specialist_sources` | 24/108 | Citation / trust line |

**Annex / evidence (optional depth, not required to invent UI fields):**

- Long CSV: per-month `bbc` / `hubbub` / `gw` / `borough_kitchen` votes, `votes`, `n_sources`, `override`  
- `apple_pear_varieties.csv`: variety + `season_window` + `source`  
- `sources.md`: ledger for About / trust copy  

**Minimal fact sheet (supported for all 108):** name, category, month grid / in-season months, peak months (from grid even when `peak_months` blank).  

**Richer fact sheet:** only where notes/sources exist (~40% have any prose note; **23** items are grid-only: e.g. many Hubbub-only herbs, `radicchio`, `shallots`, `salsify`, `wild nettles`). INTENT forbids inventing extra fields — thin sheets for those 23 are correct.

**Not in corpus (must not be invented as data fields):** nutrition, taste adjectives, generic encyclopedia blurbs, authored per-month narrative paragraphs, images/prompts (Stage 3), multi-country wheels.

### INTENT checklist

| Affirmed INTENT need | Corpus support |
|---|---|
| UK circular year-wheel; month segments | **Yes** — 12 months × item states; densest months Jun–Oct |
| Click month → short description | **Derive in Stage 3** from that month’s P/I/(T) item list + optional recipe blurb — **no** authored `month_description` column; do not invent crop rows to pad copy |
| Clickable ingredients → fact sheets | **Yes** — fields above; bound to corpus |
| Recipes included from UK research pack | **Yes** — 12/12 months |
| Current-month default | Behaviour only (Stage 3 UI) — **no corpus blocker** |
| Stronger UK ~108, not JNCC ~21 | **Yes** — 108 items |
| Non-goals: no invented rows; no fake multi-country | **Honoured** — UK-only pack; imports excluded in audit |

---

## Gaps vs INTENT (named, actionable — non-blocking)

1. **No authored month short-description texts** — Stage 3 must compose short segment copy from the month’s calendar items (+ recipe title if desired). Do not invent produce to fill winter prose.  
2. **Sparse fact-sheet prose** — 23 items grid-only; only 43/108 have `regions_notes`. Ship thin sheets; optional Instinct enrichment later for notes, not a Stage-2 hold.  
3. **Recipe↔item string aliases** — normalize plurals/aliases at ingest (`strawberries`/`blackberry`/`damson`/`chestnut`). Data is present; join is imperfect.  
4. **Winter/spring relative thinness** — Jan–Apr lower peak counts; fruit peaks scarce. Still enough items for an illustrated segment (veg/root-led).  
5. **Confidence caveats (surface honestly)** — Hubbub-only herbs; radicchio import-heavy flags (audit). Do not “fix” by inventing UK-grower months.  
6. **Annex completeness on box** — was missing long/json/varieties/sources until pulled from Drive this assessment; prefer `/workspace/seasonal-produce-uk/` + Drive `1wCQqq9T4hq9qsw09yuO8JhooGKWb3FoV` going forward.

---

## Instinct pass-back

**Not required for Stage-2 gate** (verdict is PASS). Parallel open research (US regional, Italy, Australia, Egypt, Mexico) stays out of band for the UK thin ship per INTENT. Optional later UK enrichment (herb second sources, radicchio UK-grower, Wales/NI calendar source, eattheseasons clocks) can ride a non-blocking Drive note if Instinct has spare capacity — **do not treat as a ship block**.

---

## What this is / is not

- **Is:** Stage 2 re-check of UK pass-2 corpus **against affirmed INTENT.md** thin UK ship (PR #1).  
- **Is not:** a claim that Melody’s idea-#22 research PASS substitutes for this gate.  
- **Is not:** permission to invent crop-season rows, fake multi-country wheels, or invent fact-sheet fields beyond the UK corpus.
