# National Coalition

A six-arrow icon in the left navigation opens a large National Coalition overlay. Seven demographic summaries surround a large CHP six-arrow emblem in a shallow U; the summary is above, and prestige, development and recent changes are below. The overlay supports both themes, keyboard focus, Escape, a close button and responsive scrolling. On small screens, the constituency panels stack. The former `status.national_coalition` page remains available for save compatibility, but is no longer a text navigation tab. Only the original right-side The Party entry is retained; the duplicate left-side entry has been removed.

## Authoritative data and support

The seven provincial demographic preference pools remain authoritative. Starting preferences are not rebased or flattened: the original new campaign remains at approximately 25.331% CHP. The author reference marginal percentages are recorded in `AnatolianNationalCoalition.reference`.

Existing class-wide policy changes are broadcast once by `AnatolianProvinces.sync`. Net positive CHP changes, including gains caused by reductions to opponents, are attenuated using the current aggregate demographic support and reach. A smooth gain function integrates increasingly small returns near reach and remains positive above it. Negative effects retain their strength. Local differences remain intact; there is no national vote ceiling and no forced historical election result. The public national polling-grant helper uses the same filtering.

Each demographic has reach and consolidated support. Floating support is the remaining structural support. Ordinary gains are floating initially; losses consume floating support first, trimming consolidation only when structural support falls below it. Good government, party organization and electoral success consolidate support. Consolidated plus floating support equals structural polling; prestige is additional. The page's national reach uses demographic population weights. Actual polling and attachment totals follow the existing turnout-weighted vote model.

Politically conscious Kurdish voting is applied by the existing Kurdish Issue override. Reach filtering affects only the ordinary preference component. Temporary prestige takes ballots only from the non-politically-conscious pool, never redistributing conscious Kurdish preferences. Their fixed CHP contribution is counted once in the national summary.

## Structural political openings

Initial rural reach is 19.5%. The Political Rally's land-reform theme opens three commitments: mild 21.5%, moderate 22.5%, strong 24%. Repeated declarations cannot stack, and weaker declarations do not undo a stronger commitment.

Actual Agriculture Ministry Land Reform and Koykent actions queue reach projects lasting 18 months, with increasing cumulative gains. Promises alone do not complete these projects. Existing completed rural reform counters are recognized when an old save first acquires the new model.

Party organization funding improves voter consolidation and creates modest, delayed non-rural openings. Major labor reforms, Left of Center / United Front strategy adoption, the sectarian-affairs reform and Kurdish-rights programmes also have one-time, delayed reach hooks. Repeated funded organization work improves organizational strength, while each named structural opening is awarded once.

The first largest-party general-election result from 1973 onward unlocks a credibility breakthrough, without granting support or modifying its saved election result. Credibility progresses from Opposition Party through Serious National Challenger and Credible Governing Alternative to Established Governing Party. Sustained successful government develops the latter stages. A persistent governing crisis can damage current credibility; earned reform reach and the structural largest-party breakthrough remain. Failure to form a government after a largest-party result can weaken floating support after a three-month grace period; a completed government formation or an outright majority avoids that specific failure condition.

There are no 1977/1979 vote targets or date-based penalties. Governing failure is evaluated from actual economy health, inflation, unemployment, party/coalition stability and the current police/paramilitary force balance. The latter is calculated directly, without requiring the player to view Defense. Majority governments ignore stale coalition dissent. `scandal(Q,id,severity)` is available for future authored political-controversy events; no new Gunes Motel event has been invented.

## Temporary prestige and tactical voting

All current Cyprus roadmap polling rewards, including the Sarachane rally and later settlement implementation, now call `addTemporary(Q,"Cyprus Prestige",points)`. Existing once-only campaign reward guards remain. They are not also added to provincial structural preferences. Prestige has a provisional 12-month half-life and a 36-month maximum duration after its most recent award. Each effect keeps its own last-update time, so a newly granted effect cannot be aged back to the campaign start. Successful government and organization can retain some fading prestige as ordinary, reach-filtered floating voters.

DİSK endorsement is displayed by name as a 1.5-percentage-point tactical effect. It transfers real TİP-aligned ballots nationally in proportion to the donor pool, with at most half the pool available. If that pool cannot supply 1.5 points, the page shows the available effect and the 1.5-point maximum. The banned-TİP case solves the target against the valid-ballot total after abstention; the legally active TİP case preserves the ballot total. Friendly TİP tactical cooperation without endorsement retains its separate 1.3-point ceiling. Projected seats and election-day votes use the same transfer once; ordinary polling preferences remain unchanged. Local elections retain their previous behavior. Legacy string-valued endorsement flags are normalized, and the TİP reformation event now writes a real boolean false.

## Provisional tuning and future hooks

Only the rural rally hierarchy follows the supplied approximate milestones. All other numerical settings are provisional architecture defaults, not a claim of finalized historical calibration. Initial non-rural reaches are Workers 55%, Petty bourgeoisie 40%, State employees 56%, Capitalists 24%, Alevis 72%, and ordinary Kurdish voters 36%. See `config` in `out/html/national-coalition.js` for central reach, legitimacy, prestige and tactical parameters. Reform and performance coefficients are adjacent to their named functions.

Public hooks: `ruralRally`, `queueReach`, `reform`, `policy`, `developOrganization`, `election`, `addTemporary`, `scandal`, `update`, `snapshot`, and `html`. State lives in the registered `Q.national_coalition` object and is included in normal saves and exports. Only elapsed-turn updates mature projects, decay effects or apply performance-based consolidation/loss. Rendering does not advance time. Existing saves preserve their current support and election history; previously paid, structural Cyprus rewards are not retroactively paid again or arbitrarily removed.

## Verification

`test-national-coalition.js` covers diminishing returns, above-reach gains, rural declaration hierarchy, actual reform hooks, largest-party legitimacy, temporary prestige and exact polling effects, conscious Kurdish exclusion, conditional post-1977 outcomes, government consolidation, tactical conservation, population-weighted reach, old saves, repeated render purity and a real half-month turn. Thirty rounds of +3 to every demographic produce about 36.22% in the stress fixture without political breakthroughs, rather than unbounded growth. This is an architecture check, not a finalized 1973 historical calibration.

`test-national-coalition-browser.js` checks real left navigation, all displayed demographic fields, reach/prestige changes, dark mode, save roundtrip and continued polling/map functionality. The normal regression suite retains campaign, economy, demographic, election, parliamentary, Senate and card coverage. The existing save-storage browser regression continues to cover IndexedDB, save pages, legacy saves, exports and imports.


The overlay shares original `#content` window styling through `.game-window`, original `ul.choices` panel styling through `.game-choice-panel`, and sidebar heading styling through `.game-section-title`. It retains the original six-arrow asset, standard typeface, theme colors and link treatment. The demographic ordering is Rural/Kurdish population, Workers/Alevis, then State employees/Petty bourgeoisie/Capitalists in one aligned bottom row.


All remaining positive Cyprus rewards were audited: legacy settlement-status bonuses, retaliation against American bases, petty-bourgeois campaign bonuses and the patriotic strategy now use the same idempotent temporary prestige ledger. Existing ending, Sarachane and later-settlement rewards have named once-only ledger entries. A status transition cannot duplicate an already-paid ending. Old five-year demographic bonus removals have been retired; decay occurs only in the prestige system. Event callouts now describe temporary Cyprus Prestige. Negative failure consequences and unrelated diplomacy/economic effects remain in place. The author-supplied introductory paragraphs are preserved in the overlay. Party names use the game's shared tooltip formatter, and the tooltip portal is ordered above the dialog.
