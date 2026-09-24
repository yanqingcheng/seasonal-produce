# Florida pack — schema and evidence

Region pack. Id `fl`. Display name « Florida ». Not a United States calendar. Timezone America/New_York (the peninsula, and the department, sit in Eastern time).

Source: Florida Department of Agriculture and Consumer Services, Florida Produce Seasonal Availability Calendar. The legend is In Season / Not In Season. The extract is `primary_months.csv` (34 items × 12 months, 225 in-season cells, 183 not-in-season cells, no blank cells). Scope label on every row is Florida statewide.

FDACS also publishes a Crops in Season page. On the items both list, dozens of months disagree. That page is not copied onto this wheel.

Florida public records are not copyrighted by the agency. The Fresh From Florida logo is not used. Facts only.

## Roles

The cell is in season or not in season. The calendar does not rank peak, edge, harvest, or storage.

| Source | Letter | Role |
|---|---|---|
| in_season | I | in |
| not_in_season | . | out |

Peak and edge are not invented. `require_peak_every_month` is false. The wheel copy says « in season », which is the calendar's own legend.

## Categories

The chart does not print a group, so this pack files each row as fruit or vegetable the way the other packs do. Tomato, sweet corn, and mushroom stay vegetables. Avocado, mango, and citrus stay fruit. Cilantro stays a vegetable row with an herb drawing.

## Domestic filter

The calendar is Florida-grown availability. Avocado, mango, citrus, watermelon, and pineberry stay: Florida grows them, and the chart gives them months. No row was removed as import-only. Peanut is held for a drawing (`STICKER_GAPS.md`), not because it failed the domestic test.

Shipped: 33.

Watermelon keeps two windows, March–July and October–December. Both are several months long. Neither is trimmed.

August is short on this calendar: avocado, mango, and mushroom. Those three cells are the chart. Nothing was added to fill the summer.

## Approximate stickers

Shared archetypes, not new drawings. Item names that share a sticker id with another pack use that pack's item string, so the drawing matches:

- Blackberry → `blackberry`
- Blueberry → `blueberry`
- Broccoli → `broccoli`
- Cabbage → `cabbage`
- Cauliflower → `cauliflower`
- Celery → `celery`
- Cucumber → `cucumber`
- Eggplant stays `Eggplant` (the Ontario string)
- Mango → `mango`
- Peach → `peach`
- Spinach → `spinach`
- Strawberry → `strawberry`
- Watermelon stays `Watermelon` (the Ontario string)

Avocado uses the pear drawing. Cantaloupe uses a tan striped oval. Grapefruit, orange, and tangerine use round fruit with different fills. Pineberry uses the strawberry drawing in white. Endive uses the chicory drawing. Escarole and lettuce use a frilly head. Collard greens use a dark leaf. Squash uses the pumpkin drawing. Snap beans use the bean drawing. Mushroom uses the mushroom drawing.

Fact sheets cite the FDACS calendar and otherwise show only the month grid.
