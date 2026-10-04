# Atilla I implementation

Five shared daily events cover 20–24 July 1974. Each decision saves one result and advances to the following calendar day. The operation report appears on 25 July, with Geneva I as the narrative handoff. Geneva negotiations and Atilla II are not implemented by this change.

## Decisions and hidden military requirements

| Day | Historical requirement | Alternatives |
| --- | --- | --- |
| 20 July | Outdated | Secure beachhead and unload heavy support: Good |
| 21 July | Outdated | Reinforce existing positions: Adequate |
| 22 July | Outdated | Halt immediately: Adequate |
| 23 July | Outdated | Halt and seek UN protection: Adequate |
| 24 July | Outdated | Negotiate monitored access: Adequate; maintain control demand: Good |

The military tier is derived from the arithmetic mean of land, air and naval strength, using the game's existing 0–1 values: Critical below 0.2, Outdated from 0.2, Adequate from 0.4, Good from 0.6, Excellent from 0.8. Military resources are a separate pool and do not determine this tier.

Meeting or exceeding the requirement rolls an inclusive integer from 50 through 80. Falling below it rolls from 0 through 60. Add five points per tier above the requirement; cap the result at 80. Equality qualifies for the better roll. Requirements and individual scores are not displayed in the choices or daily reports.

The engine's seeded random generator supplies the roll. Loading a saved result, revisiting an action or repeating the ending does not generate another roll or award another reward. Restoring a save immediately before a decision and repeating that decision preserves its random result.

## Scores

| Daily score | Result |
| --- | --- |
| 0–19 | Failure |
| 20–39 | Mid |
| 40–59 | Successful |
| 60–80 | Massive |

| Five-day total | Ending | Additional diplomatic leverage |
| --- | --- | --- |
| 0–199 | Failure | 0 |
| 200–299 | Successful | 2 |
| 300–400 | Massive | 4 |

Leverage is added once to `leverage_points`, preserving any existing balance. The result and combined score remain visible in the Cyprus status panel.

## Persistent consequences

The saved daily records retain the selected action, military tier, score, outcome and report. An early junction requires the Massive result on the 21 July historical action. A Successful or Massive historical advance on 22 July completes an unfinished junction, or protects the flanks of an existing one. A defensive halt never establishes a missing junction.

The 22 July halt determines whether the 23 July historical consolidation reports further expansion or damage inflicted in defensive engagements. The separate protection alternative stays defensive. Airport outcomes record diplomatic costs and access separately; no option transfers airport sovereignty or creates an already missing corridor. The ending reports actual positions separately from aggregate success.

The header and map actions redirect to outstanding operation events during the five-day sequence. Both existing optional stories on 21 and 24 July remain available on the normal continuation route. After the result is acknowledged, the existing Cyprus daily calendar resumes.

## Implementation and validation

- `source/scenes/events/cyprus_atilla1_20.scene.dry` through `_24.scene.dry`: eleven decisions and their result screens.
- `cyprus_atilla1_continue.scene.dry` and `cyprus_atilla1_ending.scene.dry`: shared routing and the 25 July report.
- `out/html/cyprus-atilla1.js`: shared calculation and narrative rules; loaded after `rules.js` and before the compiled game.
- Root and Cyprus entry initialize the new state; literal names are registered in `scripts/state-keys.json`.
- The checker validates the new helper's state names, syntax and types.

Source checks and the existing build passed using the cached dependencies matching the unchanged lockfile. The regression suite now includes 29 scenarios, with all 44 decision/outcome combinations, tier and score boundaries, ending thresholds, save/restore, one-time rewards, flavor events and the full daily calendar. A browser playthrough exercised all five daily decisions, the ending and the return to the existing calendar.

For testing, start a fresh game or use a save from before 20 July. Old saves taken during an already ongoing Atilla I do not contain the required five-day decision history.
