# The Other Side of Geneva

The six user-supplied passages and their Continue labels live in source/scenes/events/cyprus_geneva_side.scene.dry.

Placement follows the active version-two Cyprus campaign's existing event groups:

- A Matter of Protocol: after resolving July 25, before July 26.
- Sleepless Nights: after resolving July 26, before July 27.
- An Agreement Nobody Expected: after resolving July 28 (including the bundled July 27–28 ceasefire event), before July 29.
- A Minister's Resignation, One Last Argument, A Glass of Rakı: in order after resolving the combined July 29–30 Geneva I conclusion, before the Atilla I ending report.

The advancing and frozen-frontline routes both include these interludes. They do not depend on random event draws. Only Continue marks each interlude read, using geneva-side-1 through geneva-side-6 in the existing saved cyprus_roadmap_seen ledger. Reading or reopening an interlude does not resolve an operation, advance the date, or award leverage. Existing later saves do not receive a backlog of missed interludes.

For future dialogue, insert the government-dependent delegate with:

    [+ {! return AnatolianRules.cyprusRoadmap.delegationRepresentative(Q); !} +]

MSP retains İsmail Müftüoğlu. Without MSP, AP uses Kamran İnan, then CGP uses Ferit Melen. A CHP-only government uses Fikret Gündoğan. Outside a CHP government the historical name is retained. For a broader coalition containing MSP, MSP takes precedence; without MSP, AP takes precedence over CGP.

Roadmap event prose also passes through delegationText(Q,text), replacing full-name and surname-only references. No existing Müftüoğlu reference was found in the authored source, and the six supplied passages do not contain one. The mapping does not change minister assignments or political state.
