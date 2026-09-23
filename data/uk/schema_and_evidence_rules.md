# UK Seasonal Produce Calendar - Schema & Evidence Rules
Project #22 from Qing's public-data research dump, pass 2 (19 Sep 2026). See changelog.md for pass history..

## Files
- produce_calendar.csv - one row per produce item; 12 month state columns (jan..dec), peak_months, stored_notes, regions_notes, specialist_sources.
- produce_calendar_long.csv - one row per item x month with per-source evidence (bbc / hubbub / gw / borough_kitchen columns), vote count, and any curated override.
- produce_calendar.json - the same dataset as structured JSON for app ingestion.
- apple_pear_varieties.csv - variety-level season windows from British Apples & Pears Ltd.
- recipes.csv - 12 cited recipes, one per month, each built on produce in season that month.
- audit_report.md - contradictions, coverage gaps, judgment calls.
- sources.md - full source ledger.

## Month states
- P = peak season. Requires BBC Good Food "best" mark plus at least one other source, OR 3+ independent sources at full votes.
- I = in season: UK-grown produce available (>=2 source votes, or BBC "best" alone).
- T = transition / edge: single-source month, BBC "coming in" mark, or specialist source saying early/late fringe.
- . = out of UK season.
- Storage availability is recorded in stored_notes (e.g. apples/pears/potatoes/squash stored through winter), not merged into the harvest-season states.

## Evidence rules applied
1. Every month flag traces to named public sources; the long CSV carries the raw per-source votes so any flag can be re-derived.
2. Peak (P) never rests on a single source.
3. Where a specialist body contradicts the generalist calendars (e.g. The Watercress Company's May-Nov season), the specialist window wins in the main table via a recorded override, and the disagreement is kept in audit_report.md. Overrides are flagged per-cell in produce_calendar_long.csv.
4. Boundary disagreements of half a month are preserved, not averaged.
5. Imported-only produce (banana, citrus, dates, pomegranate, watermelon, melon, sweet potato) is excluded from the UK calendar; the exclusions are listed in the audit report.
6. Regionality is only asserted where a source names the place (Jersey Royals -> Jersey PDO/PGI; forced rhubarb -> Yorkshire Triangle PDO; asparagus -> Vale of Evesham PGI; watercress -> Hampshire/Dorset; raspberries -> Tayside/Angus; damsons -> Lyth Valley; cobnuts -> Kent; Cornish/Pembrokeshire earlies; samphire -> Norfolk marsh coast).
7. Recipes: exactly one per calendar month, each using produce the dataset marks in season (P or I) that month, each with a working source URL (spot-verified).

## Source families used
- Generalist UK calendars (multi-item): BBC Good Food seasonal calendar (per-item month grid, "best"/"coming in" marks); Hubbub month-by-month lists; BBC Gardeners' World month-by-month (with stored/forced/cultivated qualifiers); Borough Kitchen month-by-month.
- Grower/specialist bodies: British Apples & Pears, British Tomato Growers' Association, British Leeks, The Watercress Company, Kentish Cobnuts Association, Jersey Royals, Yes Peas! (peas.org), Vale of Evesham asparagus PGI, Westmorland Damson Association, Lincolnshire Field Products (sprouts), AHDB Horticulture (strawberries), Fruit & Vine / British Berry Growers (blueberries), Stewarts of Tayside (Scottish soft fruit).
- Protection registers: GOV.UK protected food names (Yorkshire Forced Rhubarb PDO; Jersey Royals and Vale of Evesham PGI referenced by grower/tourism sources).
- Regional editorial: Eat UK seasonal guide, TasteScot month-by-month, Pembrokeshire Herald, Branston (Cornish earlies), M&S British strawberries, Delicious magazine (forced rhubarb).

## Known limits (see audit for detail)
- BBC Good Food vegetable table is truncated after Parsnip in the fetched copy; pass 2 closed this with the 12 BBC month pages as an independent BBC stream (mark M: full in-season vote, peak needs 3 sources).
- Mint, basil, chervil have 2 sources (Hubbub + BBC month pages); other herbs rest on Hubbub alone - flagged single-source. Radicchio flags reflect import-heavy availability - see audit.
- NFU interactive chart data is not scrapeable (JS); only its item list and storage/glasshouse notes were usable.
