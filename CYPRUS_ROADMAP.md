# Cyprus campaign roadmap

This implementation follows the supplied roadmap. Existing July 15–26 writing and the Atilla I victory variants are retained. New conference and implementation writing is provisional game text for the later human-writing pass.

## Calendar

- July 20–21: opening military operations and the junction.
- July 22–28: daily advance-or-halt decisions. July 24 retains its airport alternatives. July 27 and 28 are separate military decisions.
- A halt freezes the map at that day, disables all further Atilla I support and replaces subsequent military events with ceasefire enforcement and line reinforcement. The July 27–28 ceasefire report covers both days.
- July 29–30: Geneva I concludes; Atilla I results are displayed on July 30.
- July 31: declaration of full implementation of Geneva I and the ceasefire.
- August 1, 3, 5 and 7: four diplomatic turns. British/American outreach costs 1 Leverage Point, raises the selected attitude one tier and advances exactly 2 days. Skip 2 Days uses the same calendar step. The fourth turn leads to the August 8–9 conference opening on August 9.
- August 10: five-party conference and the constitutional dispute.
- August 11: failed Denktaş–Clerides meeting and the multi-zone proposal.
- August 12: choose the Güneş or Denktaş Plan.
- August 13–14: branching conference reports, American support when qualified, and agreement or breakdown.
- Successful Güneş route: notification August 15, northern canton established during the first week (August 21), formal announcement and minigame ending August 30, implementation confirmation on November 1.
- Rejected Güneş or Denktaş route: Atilla II on August 14–18, then historical division and return to normal play. Atilla II cannot fail.

## Conditions and scores

Atilla I remains capped at 720. The total is military operation scores + twice support resources spent + twice resources remaining, snapshotted once at Geneva I's end. Massive begins at 540; Successful begins at 360. Failed junctions remain military defeats.

There are no foreign-attitude penalties for advances before July 25. Each additional offensive day on July 25–28 lowers British and American Cyprus attitudes one tier and returns Greece to Hostile.

Conference Leverage Points = max(0, operation reward + 2 × ceasefire days − offensive days during Geneva I). The operation reward is 4 for Massive, 2 for Successful and 0 otherwise. The conference reward is paid once.

The Güneş agreement without Atilla II requires:
- Britain at least Neutral and America at least Friendly.
- No lifting of the poppy ban before the crisis.
- Massive Atilla I result, completed junction and a Superior Defensive Position.
- Restraint, airport assurances, strong UN cooperation and no UN confrontation.

Atilla II has five operation decisions, a maximum score of 400 and a minimum reinforced base result of 45 per decision. Military support still improves that result. Every route completes successfully on August 18.

## Later negotiations

Foreign Ministry → Manage Our Relations with the West → Cyprus Negotiations:
- Güneş: US and Western Europe at least Friendly (65), four rounds.
- Denktaş: both at least Very Friendly (75), six rounds.
- CHP must control the Foreign Ministry.
- A negotiation round cannot be counted twice in the same normal-game period.
- After enough rounds, choose Implement the negotiated Cyprus plan. Relations must still meet the threshold.

## Writing and verification

New dated conference/ceasefire descriptions and branch text live in out/html/cyprus-roadmap.js. Their shared event interface is source/scenes/events/cyprus_roadmap_event.scene.dry. July 27/28 military choices use cyprus_roadmap_military.scene.dry. The November report is cyprus_gunes_implemented.scene.dry. Later negotiation choices are in source/scenes/government_affairs/foreign_policy.scene.dry.

CYPRUS_ROADMAP_WRITING.json is a readable export of the provisional event descriptions; the runtime source remains cyprus-roadmap.js.

Run npm run build and npm test after edits. Asset URLs are now refreshed automatically when their content changes. The validation includes legacy campaign coverage, 29 new-roadmap scenarios, a general simulation smoke test, and Chrome playthroughs of all three final routes.
