# Provincial elections

The election model uses the supplied 67-province SVG and the workbook's Iller sheet. The seven class/identity pools are exclusive and sum to 100% for each province. Workbook demographics take precedence when historical vote targets conflict with the fixed Kurdish political voting pools.

## Population

1970, 1975 and 1980 province counts are interpolated linearly. Their annual shares are then rescaled to the user-specified national totals for 1970-1980. Within each year, the national total is interpolated to the current half-month. Largest remainders allocate whole people, so the province populations and demographic counts reconcile exactly.

Census input totals: 35,605,176 (1970), 40,347,719 (1975), 44,736,957 (1980). These intentionally differ from the game's national population schedule; provincial shares are retained while matching that schedule.

## Voting

Province preferences are fitted to the supplied 1973 and 1977 election tables, using baseline class preferences plus province-specific multipliers. The supplied JSON establishes a schema only; none of its numeric weights are used. The 1977 weights are adjusted for national electoral swing, so interpolation changes regional appeal rather than forcing the player to reproduce the historical national outcome.

The supplied tables combine minor parties. Their provincial breakdown is estimated using the national reference shares, Alevi concentration for TBP, AP appeal for MP, and the existing Kurdish political pools. Estimates are identified in the map. Adiyaman's 1973 table lists a minor-party remainder of 11,109 but the named parties and stated total imply 12,393; the named counts and stated total are preserved and the remainder is reconciled.

Projected valid votes use each province's historical valid-vote/population ratios, interpolated between the two elections. Residents are not treated as eligible voters. National polls aggregate provincial valid votes. Socialists remain individually visible in polling data but pool under TIP for seat calculations once Socialist Left has formed. TIP's ban and endorsement transfer still apply.

General-election seats are allocated by provincial D'Hondt, with 450 constituently apportioned seats in total, using interpolated 1973/1977 province seat quotas. Existing constitutional national thresholds still apply when enabled. Local results count one winning municipality per historical province (67 total); the TBMM panel for a local election retains the preceding national parliament.

## Dynamic state and saves

`province_pools[id].demographics` stores editable starting shares. `preferenceWeights` provides additional editable party modifiers. Existing nationwide demographic policy changes alter common demographic drivers and existing class voting actions still affect province results. Population growth alone also changes the national demographic composition.

Completed general and local elections save immutable province snapshots in `province_election_history`. On older saves, map history begins with the first election completed after this update; earlier province-by-province player results did not exist and are not invented. Initialization preserves current party preferences and parliamentary totals. Reopening overlays does not advance time or grant rewards.

The new automated test is `scripts/test-provinces.js`. It checks imports, population reconciliation, projections, seat totals, dynamic changes, archived results, save continuity, Socialist Left pooling and exact Cyprus percentage-point rewards.
