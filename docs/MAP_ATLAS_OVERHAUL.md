# Electoral map atlas overhaul

The existing `out/html/province-map.js` renderer now provides a restrained political-atlas presentation for polling, archived general/local elections, Senate renewals, inline results, and municipal control maps. The province data, SVG path coordinates, party palette, votes, seat calculations, election archives, tabs and result tables are unchanged.

## Presentation and controls

- Pale blue-grey water and faint tiled paper grain; stronger country silhouette, fine provincial borders and restrained printed-ink shading. The silhouette and ink layers reuse the original province paths and cannot intercept input.
- Hover gently brightens land and strengthens its outline. A persistent dark-gold selection contour with a pale underlay is drawn above adjacent provinces, including multipart provinces. Native result tooltips and keyboard activation remain available.
- Six major city labels appear by default: İstanbul, Ankara, İzmir, Bursa, Adana and Diyarbakır. “All province names” enables the remaining labels. Labels keep a readable screen size and are laid out again on zoom, pan and resize, with major cities taking priority. Overlapping and clipped candidates are hidden; city labels try alternative vertical offsets.
- Black Sea, Aegean Sea, Mediterranean Sea and Sea of Marmara labels use muted serif text. Sea labels are checked against province fills to avoid crossing coastlines. Marmara's label becomes visible at close zoom, when it fits in the water.
- Wheel zoom follows the cursor; buttons provide zoom and reset. Zoom is bounded from 1× to 6×. Dragging while zoomed pans within the original framed extent and suppresses accidental province clicks. Zoom transitions use animation frames and respect reduced-motion preferences. Touch dragging is enabled when zoomed.
- “Victory margins” is optional and off initially in each rendered view. It blends the existing winner color over ivory using a consistent scale: 55% ink for a tie, linearly increasing to 100% at a 30-percentage-point lead. The lead is the difference between the two largest **raw provincial ballot totals**, divided by all provincial votes; reporting groups do not alter the calculation. Turning the option off restores the original exact colors. Municipal control maps retain their existing CHP/other coloring and omit this option because historical control records do not contain the necessary ballot totals.
- The existing physical-map option remains functional. Map controls are included in the modal keyboard focus loop. All decorative layers ignore pointer events.

## Verification

`npm run check`, `npm run build`, and the complete existing `npm test` suite passed. The build regenerates compiler output; unrelated compiler whitespace changes should be excluded from the map patch. Only map asset cache hashes need refreshing in `out/html/index.html`.

`scripts/test-map-atlas.cjs` provides real-browser coverage for all 67 province selections, unchanged original SVG geometry, unchanged campaign state and default colors, margin endpoints, major-city and sea labels, label collision handling, cursor-anchored zoom, pan/reset, navigation limits, general/local archives, Senate voting subsets, inline results, municipal controls, and desktop/mobile layout. Browser page errors fail the test.

The browser test uses Playwright supplied by the execution environment rather than adding it to the game's production dependencies. Set `ATLAS_PLAYWRIGHT` to the installed Playwright module path if it cannot be resolved normally, and optionally set `ATLAS_CHROME` to a Chromium executable. Run `node scripts/test-map-atlas.cjs` from the repository. `ATLAS_REPO` can override the target checkout; `ATLAS_SCREENSHOT` optionally writes mobile and desktop review images.

Changes are local and uncommitted for review; no remote update is required to use the rebuilt local game.
