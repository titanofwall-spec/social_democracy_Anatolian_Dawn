# People's Sector implementation

The Economic Democracy card is now titled People's Sector. Scene ID economic_democracy is retained for existing decks/saves. It is available to CHP governments. Agriculture is required for establishing/expanding cooperatives and founding/funding the Cooperative Bank. Economics OR Finance is required for plan integration/funding and nationalizations. Existing Labor actions retain their Labor ministry access.

## Timing and requirements

All new economic and demographic benefits phase in linearly over 18 months (36 half-month periods). Budget costs apply immediately. Calendar elapsed time drives progress; reopening a screen or reloading a save does not add another increment. Completed modifiers remain in effect. Existing Labor policy effects are preserved.

MEYAK reform is free and one-time. İYAK founding costs 1; its reform is free and unlocks one full calendar year after founding İYAK, per the user's correction. Cooperative umbrella establishment costs 1 and enables four expansions at 1 each. Plan integration is free and enables four funding rounds at 1 each. Cooperative Bank founding costs 2 and enables four funding rounds at 2 each. The first expansion/funding can be made after establishment; subsequent rounds require one calendar year since the previous round. Four is a hard limit. Ministries and budget are rechecked in the action handler.

Mines nationalization costs 3; petroleum nationalization costs 4; both are one-time. HAYAT costs 1 and requires all the other one-time reforms plus all four cooperative expansions, all four plan funding rounds, and all four bank funding rounds. Opening the card consumes one normal action period and starts a six-month reuse timer, matching ordinary government cards. Selecting a reform does not charge another action period. Submenu navigation consumes none.

The counter starts at zero in new games. Old scaffolds with an establishment flag retain that institution; because their original founding dates were not stored, the upgrade records the current date for the İYAK waiting period. It does not retroactively invent economic benefits for old placeholder actions.

## Explicit numerical interpretation of +/++/---

The user supplied directions and relative strength, rather than numerical magnitudes. This implementation uses: economic growth/unemployment/inflation += or -= 0.25 percentage points per sign; industrial/agricultural production index += 2 per sign; foreign exchange pressure += 2 per sign; CHP demographic preference score += 2 per sign, so ++ gives 4 and --- subtracts 6. Effects phase in over the full 18 months. These are existing preference scores, not guaranteed national polling percentage points. Negative preference scores are bounded at zero. No other party's preferences are overwritten.

| Reform | Full eventual effect per action |
|---|---|
| MEYAK | Industry +2; growth +0.25; state-employee CHP preference +4 |
| Found İYAK | Industry +2; growth +0.25; unemployment -0.25; worker CHP preference +2 |
| Reform İYAK | Worker preference +4; capitalist preference -6 |
| Cooperative establishment/expansion | Growth +0.25; agriculture +2; inflation -0.25; rural preference +2; capitalist preference -2 |
| Plan integration/funding | Industry +2; agriculture +2 |
| Bank founding/funding | Growth +0.25; agriculture +4; industry +2; unemployment -0.25; forex pressure +2; rural preference +2 |
| Mines | Growth +0.25; industry +2; forex pressure +2; worker preference +2; capitalist preference -6 |
| Petroleum | Growth +0.25; industry +2; agriculture +2; forex pressure +2; each non-capitalist class preference +2; capitalist preference -6 |
| HAYAT | Growth +0.25; industry +2; unemployment -0.25; worker and state-employee preferences +2 each |

## Economy indicators

Inserted immediately below the monthly economic-values note. Institutions update from the successful action flags. Cooperatives and Bank begin integrating/functioning on establishment, reach Significantly Integrated/Expanded after two rounds, and Fully Integrated/Expanded after four. People's Sector becomes a Separate Entity when an institution is established or MEYAK reformed, and Integrated to Five Year Plan after integration. Mines and petroleum update independently.

Strength Against Capital accumulates three independent phrases: bargaining recognition reform -> Empowered With Bargaining; removal of lockout rights -> Protected From Lockouts; mandatory factory health inspections -> Enforced Security. Existing lockout action title/body now explicitly removes the right rather than merely tightening prerequisites. Ordinary collective bargaining alone does not set the recognition reform's indicator.

Worker Representation tracks KİT advisory representatives and worker participation through reformed İYAK shareholding. Strike rights begin Curbed by 12 March and become Expanded after the existing partial secondary-strike legalization. The later two configured labels are reserved for future strike-law reforms: no additional Labor reforms or repeated strike-law effects were invented.

## Verification

Nine new regression suites cover default indicators, English UI, free MEYAK, corrected İYAK one-year gate, ministry and budget restrictions, exact gradual effects and idempotence, saved cooldowns and four-round caps, all HAYAT prerequisites, actual Labor scenes, actual card choices and budget, and post-event versus display updates. Existing election/province/party/Kurdish/Cyprus/cleanup tests pass. Chrome smoke test checks the live card, disabled cooldown reason without a click, budget, economy panel position, light/dark UI and no render mutations.

Main implementation: out/html/peoples-sector.js. Content: source/scenes/government_affairs/economic_democracy.scene.dry and labor_affairs.scene.dry. Integration: root.scene.dry, post_event.scene.dry, status.scene.dry, index.html, rules.js Node test loading, build/check/state registry and package test command. Compiled output rebuilt.
