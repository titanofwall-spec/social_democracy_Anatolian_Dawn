# Provincial elections

The election model uses the supplied 67-province SVG and the workbook's Iller sheet. The seven class/identity pools are exclusive and sum to 100% for each province. Workbook demographics take precedence when historical vote targets conflict with the fixed Kurdish political voting pools.

## Population

1970, 1975 and 1980 province counts are interpolated linearly. Their annual shares are then rescaled to the user-specified national totals for 1970-1980. Within each year, the national total is interpolated to the current half-month. Largest remainders allocate whole people, so the province populations and demographic counts reconcile exactly.

Census input totals: 35,605,176 (1970), 40,347,719 (1975), 44,736,957 (1980). These intentionally differ from the game's national population schedule; provincial shares are retained while matching that schedule.

## Voting

The 469 supplied class-party rows remain the baseline for national support. Historical saturation changes where those voters are distributed, rather than awarding or removing nationwide support. Baseline provincial class weights, demographic pools and explicit player preference modifiers are retained.

The supplied 1973 and 1977 general-election tables provide the regional benchmarks. The shape of CHP's gains moves from the 1973 pattern toward 1977 as nationwide support rises from 33.30% to 41.38%. Historical regional affinities are strengthened, so urban gains and AP strongholds diverge rather than moving uniformly. At that benchmark, provincial CHP support is bounded by its higher 1973/1977 result. Nationwide support above the benchmark opens further headroom; seats themselves are never capped or overridden.

A constrained fit redistributes free voters while preserving provincial class-pool sizes and fixed Kurdish political votes. General-election party totals are conserved exactly through balanced integer rounding. MP's existing provincial decline and cap are preserved. The national-only projection used during polling-point searches avoids repeatedly solving the spatial fit.

Both sets of 67 supplied capital-mayor winners inform local affinity. Their influence is modest in general elections and stronger in municipal contests. The national mayoral totals calibrate municipal voting preferences relative to general elections. National provincial-council totals are retained as a separate reference, not mixed into the mayoral tally. No provincial local vote totals were supplied, so local vote profiles are modeled estimates; supplied capital winners are calibration anchors rather than guaranteed outcomes after player actions.

The fixed Kurdish political pools remain part of the calculation. Where they impose a minimum above the supplied aggregate target, the target is fitted as closely as possible while retaining those pools and the workbook's demographic figures.

The supplied Other column includes minor parties and independents. Its underlying votes are allocated among the existing named parties according to their existing demographic appeal and political-pool minimums. In province result displays these parties appear as Other. Current voter preferences group MP, TBP, Independents and unlocked Kurdish Independents into Others, with a colored hover breakdown. TIP is shown separately before formation; after formation the separate Socialist Left row includes TIP and its four members. This is display grouping only: the underlying parties, seat allocation and existing Socialist Left electoral pooling remain separate.

Saved games recalibrate tendency metadata once using version 4, keeping the class-vote baseline intact. Local demographic changes, explicit preference modifiers, population anchors, initial parliamentary totals and previous election snapshots are retained.

The refreshed 1973/1977 general-election tables also supply constituency seat quotas and valid-vote/population ratios. Adiyaman's 1973 named party counts and stated total imply a remainder of 12,393 rather than the supplied 11,109; the import preserves the named counts and stated total.

Projected valid votes use each province's historical valid-vote/population ratios, interpolated between the two elections. Residents are not treated as eligible voters. National polls aggregate provincial valid votes. Socialists remain individually visible in polling data but pool under TIP for seat calculations once Socialist Left has formed. TIP's ban and endorsement transfer still apply.

General-election seats are allocated by provincial D'Hondt, with 450 constituently apportioned seats in total, using interpolated 1973/1977 province seat quotas. Existing constitutional national thresholds still apply when enabled. Local results count one winning municipality per historical province (67 total); the TBMM panel for a local election retains the preceding national parliament.

## Dynamic state and saves

`province_pools[id].demographics` stores editable starting shares. `preferenceWeights` provides additional editable party modifiers. Existing nationwide demographic policy changes alter common demographic drivers and existing class voting actions still affect province results. Population growth alone also changes the national demographic composition.

Completed general and local elections save immutable province snapshots in `province_election_history`. On older saves, map history begins with the first election completed after this update; earlier province-by-province player results did not exist and are not invented. Initialization preserves current party preferences and parliamentary totals. Reopening overlays does not advance time or grant rewards.

The new automated test is `scripts/test-provinces.js`. It checks imports, population reconciliation, projections, seat totals, dynamic changes, archived results, save continuity, Socialist Left pooling and exact Cyprus percentage-point rewards.

## Party availability and map navigation

TKP, TSIP, TEP and SDP are absent from the active party roster before the TIP reformation event sets socialist_left_formed. Their raw demographic preferences and derived votes/seats are suppressed while inactive. Unorganized nonradical socialist Kurdish preferences remain under TIP until formation.

Kurdish Independents unlock through General Amnesty. Otherwise the Placeholder event becomes eligible in the first period of January 1975 (or the first later eligible visit), doubles radicalism up to 100%, and unlocks the party exactly once. Before this unlock, radical Kurdish voters have no eligible electoral organization and are excluded from projected valid votes.

The map toolbar contains adjoining Current polls, 1973 General, 1977 General, 1981 General, 1973 Local, 1977 Local and 1981 Local tabs. Unrecorded elections are disabled. A 1975 general election, or scheduling the next general election for 1975, changes the latter general labels to 1975 and 1979. Local labels remain fixed. The ledger uses existing party flag assets and the shared name/tooltip formatter; independent/umbrella entries use a neutral marker because they have no party flag. Its parliamentary column is Seats.

## Election results screens

General and local results show a clickable provincial map immediately below the shared TBMM parliament graphic. Each map retains its own archived snapshot; opening details from an older result does not substitute current polls or a later election. Local results show the preceding national parliament. Provincial outlines are black in both themes, while hover and keyboard-focus highlights retain the theme's accent color.
