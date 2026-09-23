# Ontario pack — schema and evidence

Region pack. Id `on`. Display name « Canada – Ontario ». Not a Canada-national calendar. Timezone America/Toronto.

Source: Foodland Ontario Availability Guide, in `primary_months.csv` (20 fruits + 53 vegetables). The guide says when that produce is available to buy in Ontario. Semantic type in the extract: `purchase_availability`. Harvest-timing facts in the extract: 0. Open Government Licence – Ontario. The federal note that Canada has 13 provinces and territories is why this pack is not copied to any other province.

## Roles

The cell is available 1 or 0. The guide does not rank peak, edge, harvest, or storage.

| Source | Letter | Role |
|---|---|---|
| 1 | I | in |
| 0 | . | out |

« In » means listed as available Ontario product that month, including stored apples and greenhouse crops. It is not relabelled as a harvest date, and it is not an import shop calendar. Peak and edge are not invented. `require_peak_every_month` is false.

## Categories

The guide's produce_group is kept: fruit or vegetable. Rhubarb stays fruit because that is the guide's group. Field and greenhouse rows stay separate; their months differ and the guide does not fuse them.

## Domestic filter

Foodland Ontario publishes Ontario-grown availability. Cranberries, watermelon, muskmelon, and sweet potatoes stay: the guide gives them Ontario months, and the UK pack's import exclusions do not apply here. No source row was dropped as import-only. Three rows are held for a drawing (`STICKER_GAPS.md`), not because they failed the domestic test.

Shipped: 70.

Item names that share a sticker id with the UK pack use the UK item string, so the shared sprite matches:

- Rhubarb → `rhubarb`
- Asparagus → `asparagus`
- Broccoli → `broccoli`
- Brussels Sprouts → `brussels sprouts`
- Cabbage → `cabbage`
- Carrots → `carrots`
- Cauliflower → `cauliflower`
- Celery → `celery`
- Garlic → `garlic`
- Kale → `kale`
- Leeks → `leeks`
- Potatoes → `potatoes`
- Radicchio → `radicchio`
- Radishes → `radishes`
- Spinach → `spinach`

## Approximate stickers

Haskap uses the berry cluster. Cranberries use the berry drawing. Grapes use the currant bunch. Watermelon uses a green striped oval. Muskmelon uses a tan striped oval. Sweet potatoes use the potato drawing with an orange fill. Daikon uses a thin white root. Nappa, bok choy, mustard greens, amaranth, water spinach, yow choy, and snow-pea shoots use leafy or head drawings. Chinese broccoli and rapini use the broccoli drawing. Green and yellow beans share one row in the guide and one green-bean drawing.

Fact sheets cite the Foodland guide and otherwise show only the month grid.
