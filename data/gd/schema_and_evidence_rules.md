# Guangdong pack — schema and evidence

Place pack. Id `gd`. Display name « Guangdong ». Not a national calendar. Timezone Asia/Shanghai.

Rows come from the Guangdong section of the China provinces research (v0.59): 40 labels for 38 foods, each from a Chinese-language source about the county, city, or province that grows it. Every row names that place on its fact sheet and cites the publisher.

Each crop keeps the months of one local harvest window. Where several cultivar or place names share the same food name, the pack keeps the window with more in-season months, and the publisher page when those counts tie. Other windows are not merged into the grid. A month marked peak or declining in the source stays in season here. This wheel does not add a separate peak or edge rank. `require_peak_every_month` is false.

| Source state | Letter | Role |
|---|---|---|
| in_season | I | in |
| peak | I | in |
| declining | I | in |
| not_listed | . | out |

Two foods have more than one window:

- Lychee keeps Lintou, Maoming (May–July). The Zengcheng and Conghua windows are June–July.
- Choy sum keeps the province-level window from the Guangdong Academy of Agricultural Sciences (September–May). The Lianzhou early crop and the Zengcheng late crop are shorter.

## Categories

Fruit or vegetable, following the food name, the same way the other packs file tomato and sweet corn as vegetables and citrus as fruit. Sugarcane files as fruit, as in the Yunnan pack.

## Domestic filter

Every shipped row is a harvest window for this place. Nothing was added to fill a quiet month. The blueberry row is a Guangzhou greenhouse crop and says so on its fact sheet. Rows with no shared sticker stay in `STICKER_GAPS.md` with their source months. They are not dropped as imports.

Shipped: 34. Held for a drawing: 4 (luffa, hairy gourd, oyster, mud crab).

## Approximate stickers

Shared archetypes, not new drawings. Crops that already have a sticker in another pack use that sticker's item name and colours. Named cultivars use the same silhouette with their own name: Jinyou pomelo uses the pummelo drawing in a golden fill, and green plum (qingmei) the Japanese ume fill. Chinese olive uses the olive drawing. Choy sum uses the Ontario yow choy leaf. Fact sheets name the region the window belongs to, and cite the publishers for that crop.

Attribution: Guangdong harvest months from Guangdong provincial, city and county governments, 南方+, 羊城晚报, 广州日报 and other Guangdong newspapers, and 中国地理标志产品 records.
