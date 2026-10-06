# Cyprus campaign rules

Start from a save before the Cyprus crisis begins to activate this campaign. Existing active Cyprus saves preserve their earlier roll engine and rewards rather than being silently rewritten.

## Military routes

July 22 ceasefire orders do not freeze the territorial map: limited defensive advances still occur on July 23 and at the July 24 airport confrontation. The July 24 options either continue expansion with an assurance not to seize the airport, continue expansion with pressure for control, or negotiate monitored access and freeze further movement. Only the last route ends Atilla I and Geneva I early, on July 28. It has five military rolls; later offensive rolls are skipped. Other routes keep the July 30 ending and nine rolls. Later halt choices retain defensive field events but freeze the map at their last held stage.

An incomplete junction at the military ending is Military Defeat. The dashboard displays Frontlines rather than Junction. Map artwork follows the supplied historical stages during continued movement, and remains on the held stage when frozen; it does not invent alternative cartography or new Atilla II artwork.

## Scores and resources

Individual results: Failure 0–19; Mid 20–44; Successful 45–69; Massive 70–80. The existing five-tier roll requirements are retained (historical choices require Outdated), with the existing +5 per tier above the requirement and +10 pending support cap. The seven Defense strength tiers determine the resource budget.

At the Atilla I ending, snapshot the sum of military rolls, then add twice the Military Resources spent on support and twice the remaining Military Resources. Support has already affected the military rolls, so this deliberately awards readiness credit again. The combined result is capped at 720, with a fixed denominator of 720 even when four rolls were skipped. Failure is below 360, Successful is 360–539, and Massive is 540–720. Defeat overrides that classification. Leverage rewards are 0/2/4, once only. Resources arriving after this snapshot cannot change the score.

## Diplomacy and settlements

Cyprus attitudes have five tiers: Hostile, Suspicious, Neutral, Friendly, Very Friendly. At entry, neutral foreign relations mean neutral Britain and suspicious America. Higher relations improve the starting attitudes. Relegalized poppy cultivation subtracts two American stance tiers once. Greece starts hostile, improves one tier at the junta collapse, and becomes hostile again when expansion continues after the airport decision.

The early federal opportunity requires Massive, Superior Defensive Position, a connected line, safe airport assurances or monitored access, restraint, UN cooperation, no UN confrontation, Friendly or better Britain and America, and Suspicious or better Greece. Click country flags after Atilla I to spend leverage. Outreach costs 1, improves one tier, and has a three-day country cooldown. A Denktaş endorsement costs 1 per country; Güneş costs 2. A plan needs all three endorsements. Denktaş needs two conference breakthroughs; Güneş needs three and strong UN cooperation. Successful diplomatic meetings grant one leverage and advance negotiations; available choices depend on current country attitudes.

On the early route, conferences occur July 25–27 before the July 28 ending. Later conferences occur July 29/31 and August 3/6/9/12/13. Plans may be ratified as soon as their conditions are fulfilled, through August 14. Without agreement, August 14 offers constitutional restoration or explicit authorization of Atilla II.

Atilla II has military decisions August 14–16, followed by negotiations August 17–19 and a final settlement decision August 20. It has a separate 240-point military score. Strong results award additional leverage once. Federal and constitutional outcomes remain possible; Historical Division unlocks only after Atilla II.

Endings: Non-Intervention (CHP absent at entry), Military Defeat, Return to the 1960 Constitutional Order, Denktaş Plan, Güneş Plan, Historical Division. The constitutional date is 1960; the requested 1962 label was a date error. Güneş with strong UN cooperation and no Atilla II is the best diplomatic ending. Final results return to domestic play and update Cyprus status.

Historical military quotations and translations remain attributed source references. Branch summaries and outcomes are game simulation text. The July 28 conference conclusion is explicitly an alternative route, not a historical date.

## Verification

Run npm run build and npm test. The suite includes the 43 legacy repair regressions and 18 complete-campaign scenarios, covering early/full routes, scoring, resource ledgers, attitudes, all settlement types, explicit Atilla II, save/load idempotence and calendar boundaries. Browser playthroughs additionally check real choices, frozen map artwork, country flags and both campaign routes.
