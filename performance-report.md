# Performance audit and implemented changes

Date: 24 October 2026. Applied to the local Anatolian Dawn game; publishing is separate.

## Measured results

Same machine, isolated headless Chrome, same seeded game initialization, before/after scripts. Values are medians of 15 measured runs after three warm-ups, except Köykent (five runs). Six-turn timing is a single short sequence and should be treated as indicative rather than a long-play average.

| Operation | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Full polling / provincial seat projection | 4.2 ms | 2.3 ms | 45% |
| National Coalition summary calculation | 10.1 ms | 4.1 ms | 59% |
| Köykent rally national-gain calculation | 94.4 ms | 43.8 ms | 54% |
| Six half-month turns, including normal UI work | 137.2 ms | 100.4 ms | 27% |
| Tooltip geometry reads during 200 mousemove events | 200 | 1 | 99.5% |
| Database transactions to read one save page | 15 | 1 | 93% |

These are timings of the measured operations, not a promise that every click or every device will improve by the same percentage. Network speed, large archives, device speed, animations, image decoding and browser storage still affect responsiveness.

## Scope inspected

Runtime scripts and compiled engine entry points, turn progression and status scenes, provincial voting and demographics, National Coalition numerical solvers, election archives and maps, Senate chamber drawing, desk/card rendering, tooltip and percentage-formatting observers, event-media observation, save/load and autosave paths, startup asset ordering and build cache versions.

The CPU sample identified repeated projection work, demographic normalization, provincial vote rounding, D'Hondt allocation and garbage collection as the main calculation costs. Mutable political state is intentionally not memoized: policies, province edits, party formation, bans, calendar changes, conscious Kurdish preferences and restored saves must be visible immediately.

## Implemented

### Voting and numerical calculations

- Added a totals-only calculation path with the same national ballot rounding. Numerical solvers no longer rebuild district seat allocations and sort thousands of province/party rounding candidates simply to read the CHP percentage.
- Updated Köykent rallies, permanent 1973 support and the older polling adjustment solver to use that path.
- National Coalition summaries reuse their structural projection when there is no temporary prestige, use totals-only calculations for current polling / tactical transfers, and reuse existing demographic preferences rather than recomputing them.
- Removed the duplicate provincial synchronization inside projections: Kurdish-state preparation already performs it.
- Precompute party availability, conscious Kurdish shares and the MP decay factor once per projection rather than once per province and demographic.
- Hoist provincial odds and affinity calculations out of the 36-iteration vote-shift search.
- Replace repeated sorting for each D'Hondt seat with a linear best-quotient selection, preserving the same alphabetical tie-breaks.
- Reduce temporary array/object allocations in normalization and summation.
- Cache only immutable workbook starting preferences and the most recent population interpolation. Public results are copied so callers cannot corrupt cached data. No cache data is written into saves.

### Maps and interface

- Reuse the static terrain SVG markup and index election provinces once per map paint instead of searching the province list for each path.
- Calculate the fixed Senate semicircle geometry once; membership, colors and former presidents still use current or archived state.
- Remove the redundant legacy mousemove tooltip updater. Floating tooltip positioning now runs at most once per animation frame, and its dimensions are read once when it opens rather than on every mouse event. Resize, scrolling and focus cleanup remain active.
- Deduplicate percentage-formatting mutation batches so adding a panel and its children does not scan the same subtree repeatedly. Detached additions and script/style/textarea contents are skipped.

### Saves and delivery

- Read a visible save page in one read transaction instead of fifteen separate transactions.
- Read autosave rotation candidates together. Writes still commit atomically; save payloads, manual slots, periodic autosaves, export/import, legacy recovery and error reporting remain intact.
- Refresh cache versions for changed browser scripts.

## Verification

- Full existing non-browser regression suite, plus performance equivalence and speculative-loan tests.
- Pre-optimization fixtures compare every province's party vote totals, winning party and seats across six scenarios, each with both polling and election ballots. Scenarios cover ordinary voting, Socialist Left, conscious/radical Kurdish voting, banned TİP, DİSK, prestige, dates and electoral thresholds. Integer ballots and seats match exactly; floating demographic shares use a tight numerical tolerance.
- Four hundred D'Hondt distributions compare the optimized allocator with the original sorting algorithm, including ties.
- Totals-only results match full projections; immutable cache results resist caller mutation; changed province preferences and restored saves update immediately.
- Existing National Coalition tests retain the exact Köykent gains and cooldown and the 42% / 55% provincial-concentration targets.
- Chrome checks cover National Coalition, party affairs, Kurdish group overlays, general/local/Senate terrain maps, province clicks, Senate chamber counts/colors, light/dark modes and mobile layouts.
- Large-save Chrome coverage includes slot 100, ten pages, export/import, loading, 2/4/6-month autosaves, legacy storage and failure recovery.

The Kurdish-overlay browser test had an outdated expectation that membership was unconfigured. It now verifies the configured numbers and hidden suitability, matching the already implemented group settings.

## Repeating the checks

The package test command includes the new performance-equivalence tests. The benchmark command runs `scripts/benchmark-performance.js`; it reports timings rather than failing on machine-dependent time limits. The fixture is in `scripts/fixtures/performance-votes.json`.

No gameplay balance, starting vote distribution, cooldown duration, historical result, save format or media asset quality was deliberately changed. Advisors were not modified. The compiled engine and simulation scheduling were left intact after inspection; replacing those would add compatibility risk without an established benefit from this profile.
