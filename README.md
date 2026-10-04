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
