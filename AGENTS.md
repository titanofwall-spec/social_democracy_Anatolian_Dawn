# Anatolian Dawn repository guidance

An alternate-history CHP strategy game in 1970s Turkey, based on Autumn Chen’s original Social Democracy game and built with DendryNexus.

## Layout

- source/info.dry: metadata.
- source/scenes/root.scene.dry: new-game initialization and difficulty.
- source/scenes/post_event.scene.dry: half-month turn updates, economy and events.
- source/scenes/main.scene.dry: decks and Cyprus map.
- source/scenes/status.scene.dry: dashboards and charts.
- source/scenes/events/national_elections.scene.dry: national elections, seats and coalitions.
- source/scenes/election_algorithm.scene.dry: demographic vote calculations.
- source/scenes/local_election_algorithm.scene.dry: local seat calculations.
- source/scenes/election_simulation.scene.dry: independent simulator.
- source/scenes/advisors, events, government_affairs, party_affairs: game content.
- source/qdisplays: display widgets.
- out/html/game.js, game.css, index.html: custom interface files; preserve these during builds.
- out/html/img, music, cyprusgame: media assets.
- out/html/rules.js: shared, checked simulation helpers.
- out/html/data.js: custom tooltip definitions; preserve these during builds.
- out/game.json, out/html/game.json, out/html/core.js: compiled output; regenerate rather than edit.

## Conventions

State lives in Q.*. Keep literal state names registered in scripts/state-keys.json and run npm run check before building. Policy actions write economic modifiers; quarter fields are faction source values. Rendering must not apply elapsed-turn effects. AP is the Justice Party key; chp is the CHP voting key. Prime-minister fields use prime_minister and defense portfolios use defense_minister. Scene files use Dendry headers, @sections and embedded JavaScript blocks.

Faction source values are q0–q5_<faction>_str, weighted 20/15/25/20/10/10 percent. Preserve the dynamic leadership bonus in quarter 2. Time advances in half-months; calendar months use two periods.

## Validation

Install locked dependencies with npm ci. Build with npm run build, then run npm test. Preserve custom interface and media. Check changed scene references and exercise the affected paths. Cleanup changes require a fresh playthrough; old saves use retired state keys and scene IDs.

## Attribution

Preserve LICENSE, upstream attribution and historical credit files. Legitimate historical references in the Turkish timeline and contemporary Germany on the Cold War map are intentional.
