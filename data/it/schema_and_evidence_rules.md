# Italy pack — schema and evidence

National indicative consumer calendar. Id `it`. Display name « Italy ». Timezone Europe/Rome.

Source: MIPAAF (now MASAF) « Calendario stagionalità di frutta e verdura », as published by AULSS 9 Scaligera SIAN. The page is purchase guidance: follow the season when you buy. The extract is `primary_months.csv` (51 items × 12 months, 301 months on the list). Scope is Italy. It is not a Veneto calendar, even though the publisher is AULSS 9. Credit: MIPAAF/MASAF, via AULSS 9 Scaligera. The ministry's site texts are CC BY with attribution. The original ministry page is empty today; this pack follows the AULSS 9 republication.

A 2017 copy of the same calendar lacks sedano in February and zucche in December. Those two months stay, because they are on the AULSS 9 list. Patate appears in every month of the 2017 copy and is absent from AULSS 9, so patate is not a row.

## Roles

Each month names the fruit and the vegetables to buy. The extract marks every other cell `not_listed`. That is the month list, not a separate peak, harvest, or edge flag.

| Source | Letter | Role |
|---|---|---|
| listed_in_season | I | in |
| not_listed | . | out |

« In » means the month's list names the item. Peak and edge are not invented. `require_peak_every_month` is false. The wheel copy says « di stagione ».

## Categories

The page groups FRUTTA and VERDURA. Frutta → fruit. Verdura → vegetable, including insalata, cicoria, radicchio, and spinaci, because that is the group on the page.

## Domestic filter

Every row is an Italian crop. Kiwi stays in the Italian season (Lazio grows it) but is held for a drawing, not dropped as an import. No row was removed as import-only. Nothing tropical and flat across all twelve months is on this list.

Shipped: 50. Held for a drawing: kiwi (`STICKER_GAPS.md`).

One shoulder month is not shipped. Carciofi is listed January–April, absent in May, and listed again for June alone. June is dropped so the wheel shows January–April without a hole. May is not filled in. The June cell remains in `primary_months.csv`.

## Approximate stickers

Shared archetypes, not new drawings. Agrumi use round fruit, with different fills for arance, clementine, mandarini, limoni, and pompelmi. Susine and prugne both use the oval, with different fills. Angurie uses a green striped oval. Meloni uses a round fruit. Kaki uses a round fruit with a calyx. Nespole uses the oval. Uva uses the same bunch as Spain. Castagne uses the chestnut drawing. Bietole da coste uses the chard leaf. Cicoria uses the chicory drawing.

Fact sheets cite the MIPAAF/MASAF calendar and otherwise show only the month grid.
