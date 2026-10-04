# Anatolian Dawn gameplay repairs

Applied locally on 3 October 2026, following the code audit. These fixes retain the Dendry story format and the pinned engine revision. They are ready for review in GitHub Desktop; no commit, push or deployment was performed by this repair task.

## Preserved TİP election rule

The original national-election behavior is preserved. When TİP is banned, its supporters abstain. With DİSK endorsement, half of that support transfers to CHP and the rest abstains. There is no automatic full transfer to CHP. The polls now use the same projection as the election, including the turnout normalization after abstention. Demographic preference values are preserved.

## Repairs

| Audit finding | Result |
| --- | --- |
| AD-001: inconsistent dissent scales | Dissent derives from the same weighted quarter model throughout the game. Navigation no longer produces the initial 95% spike. |
| AD-002: erased economic effects | Actions change canonical modifiers; shared derivation updates headlines. Production investment survives turn updates, and the sidebar does not erase inflation changes. Oil's once-only benefit and the existing year-specific Tiger benefits survive baseline refreshes. |
| AD-003: time effects on navigation | Political/economic drift and monthly coup rolls run only when the relevant half-month/month actually passes. History records append once per elapsed turn. |
| AD-004: stale cabinet ownership | Shared resets clear governing parties, coalition flags and all eleven portfolios before formations and caretaker transitions. Additional coalition-collapse and historical cabinet paths were corrected. |
| AD-005: permanent cooldown | The intraparty timer is registered and expires through the monthly timer system. |
| AD-006: action conditions | Corrected economy, party-leader and AP-government names. The Avcıoğlu writing action consistently respects its cooldown. |
| AD-007: Cyprus exit/calendar | Daily dates use the Gregorian calendar, elapsed half-months advance the main simulation, date-triggered scenes respect their predicates, and September reaches the existing ending. Exiting restores the normal party tab and its chart. |
| AD-008: unused state names | Corrected party-relation/support casing, faction variants, production aliases and portfolio names. Policy popularity changes no longer accidentally change the petty-bourgeois demographic's population weight. |
| AD-009: missing costs | Electronics costs two budget; Köykent industry costs one. The education Köykent action also consistently charges its advertised one-budget cost. |
| AD-010: advisor actions | Üstündağ reaches education reforms; Avcıoğlu reaches economic policies when CHP owns the portfolio; Aksoy records a once-only AET application. |
| AD-011: faction/congress disagreement | Aggregate faction gains update canonical quarter values while preserving their proportions, so strengths, dissent and congress seats agree. Legacy +5 gains mean five percentage points of party strength. |
| AD-012: poll/election disagreement | Polls and national elections share the projection, while preserving the TİP rule above. |
| AD-013: zero displays | Numeric zero is displayed as zero, instead of a fallback value. |
| AD-014: stale health scores | Deflation receives a fresh score, unemployment has the existing minimum floor, and zero production does not create an infinite agricultural price. |
| AD-015: inherited chart origin | History graphs start at the supplied data's earliest valid date, sort dates and accept empty records. Historical pre-1972 records remain possible. |
| AD-016: missing image | Land reform points to the existing Topuz portrait. |

## Rendering and maintenance

Unchanged sidebar HTML and parliament charts are retained across refreshes. Chart caching includes container width and correctly restores an SVG whose original placeholder contains whitespace. Tooltip movement updates only the hovered tooltip and batches layout work through an animation frame. Pinned-card images load lazily and decode asynchronously. Large historical image/audio assets retain their original contents; their compression has not been changed or benchmarked.

The deployment workflow uses Node 24, locked dependency installation and validation before publishing. `npm test` runs source/asset/state-name checks, TypeScript checking for the extracted economy helper, the existing gameplay regression suite and 23 new repair scenarios. `scripts/state-keys.json` is a reviewed-name registry, not a complete type schema: newly introduced literal names must be registered deliberately; computed dynamic keys are covered by the applicable gameplay invariants.

## Validation and limits

- Built all 155 source files into 732 scenes using the pinned compiler; the two compiled game JSON files are identical.
- The full `npm run build` and `npm test` commands pass with the installed pinned dependencies.
- The existing suite covers initialization, national/local elections, 450 national seats, 1,200 congress seats, portfolio changes, TİP coalition collapse, Cyprus entry, dashboards and an ending.
- All 23 added scenarios pass, including three TİP eligibility/endorsement cases, persistent policy effects, monthly cooldowns, navigation invariants, cabinet transitions, advisor reforms, Cyprus dates/return and graph edge cases.
- A controlled 192-half-month simulation remains finite throughout. This is not an exhaustive eight-year playthrough of every narrative branch.
- Browser checks cover a fresh normal game, polls/economy displays, an education reform, 48 actual Cyprus Skip Day clicks, its ending/return and restoration of the 1,200-seat chart. Twenty unchanged redraws retained both panels and their chart. Sampled browser paths reported no warning/error console messages.
- A completely fresh `npm ci` could not finish on this host because its package-fetch policy disables Git dependencies. The pinned dependency and new lockfile pass the installed-runtime build/tests; the updated GitHub workflow still needs its first actual run after a push. Legacy Dendry build dependencies also retain upstream maintenance/security notices; they were not upgraded as part of these gameplay fixes.

The Cyprus district-ownership mechanics remain unfinished, as the game's existing ending explains. The unused high-forex card-disable flag and advisor-only land-reform access remain design questions. This repair does not invent those new mechanics.

Start a fresh playthrough after updating. Pre-cleanup saves already use retired state/scene names and are unsupported. A separate repair backup and hash manifest were saved outside the repository before updating the Downloads copy.
