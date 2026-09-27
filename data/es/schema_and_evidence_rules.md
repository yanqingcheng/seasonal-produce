# Spain pack — schema and evidence

National MAPA consumer calendars « Frutas de Temporada » and « Hortalizas de Temporada ». The extract is `primary_months.csv`. Rights: MAPA aviso legal, reusable with citation. Sources are listed in `primary_sources.csv`. Scope is Spain. The MAPA grid does not split regions, so this pack does not invent them (Canaries, Andalusia, and the Mediterranean coast are not written onto fact sheets). The two regional specialty rows below name the place their own source names.

Blank `temporada_level` cells: 228. The source notes count 228 semantic zeros (67 vegetable + 161 fruit). Blank matches that count, with `in_source_matrix` still 1 because the cell exists in the complete matrix. Blank is **out**, not an ambiguous in-season cell. No month was filled in.

## Roles

MAPA's own words: a dot means the item is de temporada that month; the dot colour is mayor or menor nivel de comercialización. Both levels are in season. The source has no edge and no separate harvest flag.

| Source | Letter | Role | Shown as |
|---|---|---|---|
| MAYOR | M | peak | Mayor comercialización |
| MENOR | m | in | Menor comercialización |
| blank | . | out | Fuera de temporada |

Peak here means the higher commercialization level, not a horticultural « best » mark. The Spanish copy uses MAPA's words so the wheel does not pretend otherwise. Every shipped month still has at least one mayor cell, so `require_peak_every_month` is true.

## Categories

HORTALIZA → vegetable. FRUTA → fruit. Lettuce and other leaves stay vegetables because that is the source group.

## Domestic filter

The MAPA calendars are Spanish seasonal produce, not an import shop list. Citrus, plátano, aguacate, mango, chirimoya, kiwi, granada, melón, and sandía stay in scope when the grid gives them months: Spain grows them. None of the 57 source rows were dropped as import-only.

Year-round mayor rows (ajo, tomate, pimiento, and others) stay. The source marks those months de temporada, which matches staggered and protected Spanish production. This pack does not relabel them as imports.

Shipped: 59: 57 MAPA rows and 2 regional specialties. Held for a drawing: none. Plátano, chirimoya, and kiwi joined once their stickers were drawn.

## Regional specialties

The MAPA grid is national and has no calçot or chestnut. Two regional rows add them, each from the body that governs the protected name, and the fact sheet names the region. They use the menor level (`m`, in season), because a harvest window says nothing about commercialization level. The MAPA rows are not changed.

- **calçot de Valls**: Valls, Alt Camp (Tarragona), November–April. IGP Calçot de Valls.
- **castaña de Galicia**: October. The IGP specification says picking starts in late September or early October and lasts about a month; the edge weeks are not counted.

Cereza del Jerte is not a separate row: its May–July window is already the national cereza row. Bonito del norte is a catch and stays off the wheel.

## Approximate stickers

Aguacate uses the pear drawing. Citrus and caqui use round fruit. Granada uses round with a crown. Mango, níspero, and paraguaya use the oval. Uva and sandía use the currant bunch and the green striped oval. Melón uses a round fruit. Cardo uses the celery drawing. Endibia uses chicory. Calçot uses the spring-onion drawing in white, and castaña the chestnut. Breva and higo both use the fig drawing, with different fills. Nectarina shares the nectarine colours; the item name stays nectarina.

Fact sheets cite the MAPA calendar and otherwise show only the month grid.
