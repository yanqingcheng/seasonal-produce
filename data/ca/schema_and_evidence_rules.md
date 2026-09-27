# California pack — schema and evidence

Region pack. Id `ca`. Display name « California ». Not a United States calendar. Timezone America/Los_Angeles.

Most rows come from the County of Fresno, Harvest Calendar for Fresno County Crops (Public Works and Planning, Community Development Division, 2018). The extract is `primary_months.csv`. Four further California harvest sources add rows the Fresno chart does not list: the California Artichoke Advisory Board (artichoke), California Grown (garlic), The Produce Nerd (mandarin), and the Coachella Valley Independent (date). Every shipped row cites one of those publishers.

## Roles

A month marked in season, peak, or declining in the source is in season here. `not_listed` means the source did not state that month. It is not a measured zero, and it is out on this wheel. The calendar does not rank peak or edge.

| Source | Letter | Role |
|---|---|---|
| in_season | I | in |
| peak | I | in |
| declining | I | in |
| not_listed | . | out |

`require_peak_every_month` is false.

## One window

Where a food has two harvest windows, the pack keeps the window with more in-season months. The other window is not merged into the grid. Navel and Valencia oranges are one food. The navel window (November–May) is longer than Valencia (April–July), so the orange row is the navel window.

When the two windows have the same number of months, the pack keeps the window named first:

- Lima bean, peas, and snap beans keep February–April, not August–October.
- Sweet potatoes keep November–December, not February–March.
- Tomato keeps June–August. The source also lists September–November; those months touch the summer window, and the summer window is the one named first.

Broccoli, cabbage, and cauliflower keep September–January (five months) rather than March–June. Carrot keeps March–June. Lettuce keeps October–December. Turnip keeps November–January.

Artichoke is in season all year. March–May and October are peaks in the source, and those months stay in season here.

## Categories

Fruit, vegetable, or nut, the same way the other packs file tomato and sweet corn as vegetables and citrus as fruit. Navel and Valencia are one orange row.

## Domestic filter

In season means grown in California. Import-only produce is not on this wheel. Field crops and the ambiguous Fresno slash lines (greens, squash) were already left out of the extract. Avocado, Dungeness crab, ocean salmon, and red bell pepper have notes without a month window, so they are not rows.

Shipped: 44. Almond, walnut, kiwifruit, pistachio, date, olive, and pecan joined once their stickers were drawn.

## Approximate stickers

Shared archetypes, not new drawings. Item names that share a sticker id with another pack use that pack's item string, so the drawing matches.

Boysenberry uses the berry drawing. Lima bean uses the pod drawing. Mandarin uses a round citrus fill. Persimmon and pomegranate use the drawings already shared with other packs. Pecan uses the almond drawing with the darker, ridged pecan fill. Olive uses the green olive fill.

Fact sheets cite the publisher for that crop and otherwise show only the month grid.
