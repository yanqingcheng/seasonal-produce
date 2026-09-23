# France ADEME Impact CO2 seasonal fruit and vegetable months v1

## Scope and semantics

This PRIMARY layer extracts the `months` field for all 42 records returned by ADEME's consumer-facing Impact CO2 `fruitsetlegumes` API. The French tool is titled `Fruits et légumes de saison` and invites consumers to discover produce `de saison` for a selected month. Individual pages describe date ranges as `Hypothèses`. We preserve that qualified consumer-seasonality meaning and do not relabel it harvest, production, storage, or import timing.

Complete source denominator: 1 national consumer-facing tool / 1 extracted. This is not a regional partition and makes no subnational claims. The 42 records include separate source identities such as mango imported by air versus ship and categories beyond strict botanical fruit/vegetable naming; these are preserved verbatim instead of fused.

`is_in_season=1` means the API lists that calendar month for the source item record. `0` is a semantic zero within the complete 42 x 12 matrix. Source months are already numeric; no season-to-month conversion was performed.

French semantic terms: `de saison` = in season; `mois` = month(s); `Hypothèses` = assumptions.

## Rights

Impact CO2 is an ADEME service. Its official GitHub repository contains the exact source data file that drives this API and is licensed under MIT, permitting use, copying, modification, publication, distribution and sublicensing with the copyright and permission notice retained. The official API page also says users can access the data free of charge and integrate it in applications and content. The package retains the MIT license and source file. Site logos and artwork are not redistributed as dataset content.

## Counts

- Before this unit: France primary national tools in this expansion = 0
- After this unit: 1/1 national tool extracted
- 42 verbatim source records x 12 months = 504 cells
- 260 in-season cells; 244 semantic zeros

## Evidence

- Live API: https://impactco2.fr/api/v1/fruitsetlegumes
- Consumer tool: https://impactco2.fr/outils/fruitsetlegumes
- Official source repository: https://github.com/incubateur-ademe/impactco2
- API integration page: https://impactco2.fr/outils/api
