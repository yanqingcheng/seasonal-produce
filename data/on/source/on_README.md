# Canada opening unit: Ontario purchase-availability calendar

Canada was selected because an official government dataset directly expresses the target consumer-facing semantic: the months fruits and vegetables are available for purchase in Ontario. It is not silently relabelled as harvest timing. The two official workbooks contain 20 fruits and 53 vegetables, 73 produce items total, with a complete 12-month binary matrix (876 cells).

The national denominator is frozen at 13 provinces and territories using official federal reference data. Calendar coverage is 1/13: Ontario admitted, 12/13 explicit gaps. Ontario cannot be copied to another province or territory.

Rights fail-closed: the Ontario catalogue marks the dataset Open Government Licence - Ontario. That licence allows copying, modification, publication, translation, distribution and commercial/non-commercial use with attribution. The federal partition source uses Open Government Licence - Canada. No blocked or unclear source contributed facts.

Visual verification: rendered both exact workbooks to PDF and inspected all six pages as pixels. The first and second page halves preserve the row order and expose January-July and August-December respectively. Every one of the 20 fruit rows and 53 vegetable rows is readable across the paired page halves; no row or month is missing. This pagination is a render artifact only, and the machine extraction reads the intact source workbook matrix. PASS.
