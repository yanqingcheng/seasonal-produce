# France pack — schema and evidence

National consumer seasonality from ADEME Impact CO2, tool « Fruits et légumes de saison ». The extract is `primary_months.csv` (42 source records × 12 months). Geographic scope is France, with no subnational split. Live API: https://impactco2.fr/api/v1/fruitsetlegumes. The upstream data file in https://github.com/incubateur-ademe/impactco2 is MIT licensed.

## Roles

The source cell is `is_in_season` 1 or 0. ADEME calls the ranges hypotheses (« Hypothèses »). It does not mark peak, harvest, storage, or an edge.

| Source | Letter in this pack | Role |
|---|---|---|
| 1 | I | in |
| 0 | . | out |

Peak and edge are not used. Inventing them would overclaim the grid. `require_peak_every_month` is false. The wheel copy says « de saison », and the hub counts that role because there is no peak.

## Categories

| Source group | Pack category |
|---|---|
| légumes | vegetable, except laitue and cresson, which use salad (the same split as the UK pack's leaf salads) |
| fruits | fruit |
| herbes | Ail is the only herb-group row; it is packed as vegetable because it is a bulb |
| pâtes, riz et céréales | Maïs is packed as vegetable. The months are the fresh-corn window, same as UK sweetcorn |
| fruits à coque et graines oléagineuses | nut |

## Domestic filter

A row stays only when the month grid itself shows a French season. Flat 12-month tropical rows are treated as shop availability unless the source names a French season. Melon and pastèque stay: their windows are June–September, which is a southern French season, not an import flag.

Shipped: 35. Dropped: 7.

- **Ananas** (`ananas`). Ananas is in season in all 12 ADEME months. The grid does not name a metropolitan or overseas harvest, and a flat year is the import-shop pattern. Possible French overseas pineapple is not stated, so the row is excluded rather than narrowed.
- **Avocat** (`avocat`). Avocat is in season in all 12 months. That is shop availability. It is not the bounded Corsican crop, and this pack does not invent a shorter window.
- **Banane** (`banane`). Banane is in season in all 12 months. The same ADEME extract labels mango as imported by air or ship, and it does not separate Antilles production from imports. The row does not show a domestic season.
- **Fruit de la passion** (`fruitdelapassion`). Fruit de la passion is in season in all 12 months. No metropolitan season is stated. Excluded as import-shaped.
- **Mangue (importée par avion)** (`mangue`). The source label is Mangue (importée par avion).
- **Mangue (importée par bateau)** (`manguebateau`). The source label is Mangue (importée par bateau).
- **Champignon (morille crue)** (`champignonmorille`). Champignon (morille crue) is marked in season all 12 months. A French morel season is not year-round, and the grid has no narrower cells to keep. Excluded rather than inventing a spring window.

Kept with a note, not dropped: **cresson** is in season all 12 months. Cultivated watercress supports that, and the source says so. Fenouil keeps the April cell and the May hole; nothing is smoothed.

## Approximate stickers

Shared archetypes, not new drawings. Noix uses the chestnut drawing. Melon uses a round fruit. Pastèque uses a green striped oval. Raisin uses the currant bunch. Courge and potiron both use the pumpkin drawing, with different fills, and stay separate because ADEME lists both.

Fact sheets cite the ADEME tool and otherwise show only the month grid.
