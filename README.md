# Anatolian Dawn: An Alternate History

A political strategy game about CHP in 1970s Turkey, adapted from Autumn Chen’s Social Democracy: An Alternate History.

## Build

Use Node.js 24. Install dependencies with `npm ci`, then run `npm run build` and `npm test`.
The playable build is `out/html/index.html`. GitHub Pages uses `.github/workflows/build.yaml`.
Most narrative and state live in `source/`. Custom interface code and media live in `out/html/`; preserve them when building.

`out/html/rules.js` shares economy, faction, cabinet-reset and vote calculations between story actions and displays. Register new literal quality names in `scripts/state-keys.json`; `npm run check` validates compiled Dendry state references, card images and the checked economy helper. See `REPAIR_NOTES.md` for the repair scope and validation.

## Credits

Original game and DendryNexus: Autumn Chen. Turkish adaptation: Egehan.
Upstream repository: https://github.com/aucchen/social_democracy_alternate_history
See LICENSE, the in-game credits, credits_images.txt and credits_music.txt for attribution.
The historical changes.txt file records upstream development and is retained as provenance.

## Save compatibility

The Weimar-remnant cleanup renames state and scene IDs. Start a new playthrough after updating; pre-cleanup saves are not supported.

## Where to edit

- `economy/` holds Onat's new equations and campaign defaults. `legacy-model.js` is the current game's model until the new economy is connected.
- `actions/` holds ministry and agenda scenes. The shared turn flow and currently embedded policy hooks still live in their existing game code.
- `features/` holds Cyprus, Rubicon, coalition and map source files.
- `source/` holds shared Dendry scenes and definitions.
- `scripts/feature-files.json` maps the feature files to their existing compiler and browser paths.
- `out/html/` is the browser deployment tree. Edit feature-owned files in their source folders and build to refresh the deployed copies.
