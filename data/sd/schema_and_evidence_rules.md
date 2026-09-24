# Shandong pack — schema and evidence

Place pack. Id `sd`. Display name « Shandong ». Not a national calendar. Timezone Asia/Shanghai.

Each crop keeps the months of one local harvest window. Where several cultivar or place names share the same food name, the pack keeps the window with more in-season months, and the publisher page when those counts tie. Other windows are not merged into the grid. A month marked peak or declining in the source stays in season here. This wheel does not add a separate peak or edge rank. `require_peak_every_month` is false.

| Source state | Letter | Role |
|---|---|---|
| in_season | I | in |
| peak | I | in |
| declining | I | in |
| not_listed | . | out |

## Categories

Fruit, vegetable, herb, and nut follow the food name, the same way the other packs file tomato, sweet corn, and mushroom as vegetables and citrus as fruit.

## Domestic filter

Every shipped row is a harvest window for this place. Nothing was added to fill a quiet month. Rows with no shared sticker stay in `STICKER_GAPS.md` with their source months. They are not dropped as imports.

Shipped: 32. Held for a drawing: 16.

## Approximate stickers

Shared archetypes, not new drawings. Crops that already have a sticker in another pack use that sticker's item name and colours. Named cultivars of pear, peach, plum, and citrus use the same silhouette with their own name. Fact sheets name the region the window belongs to, and cite the publishers for that crop.

Attribution: Shandong harvest months from 齐鲁网 and 腾讯新闻.
