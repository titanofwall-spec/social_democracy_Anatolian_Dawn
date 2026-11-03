# Temporary Map Design Studio

## Open it

Open the game's election map, then click **Admin: edit map** above the map. The studio opens over the game. This is a temporary local authoring tool; “admin” is a label, not an account or permission system.

Start a campaign first if the election map is not available yet. The same entry point appears on inline election results and municipal control maps. Work on a desktop-sized window for comfortable access to both sidebars.

## A useful first workflow

1. Click **+ Layer** and give it a name such as “Paper shading”. Choose **multiply**, reduce **Opacity**, and set **Clip artwork to → All land**.
2. Choose **Brush**. Set a large size, soft round finish, low flow, and a warm grey or brown. Paint gently over the land. The layer mask keeps the sea clear.
3. To use an existing map, create/select a layer, copy the actual map image or a screenshot, click the map canvas and press **Ctrl+V** (Cmd+V on macOS). Set that layer's blend mode to **overlay** or **multiply** and adjust its opacity. Use **Fit image to map**, then drag and adjust its position, scale or dimensions to line it up. The pasted image is embedded in your project. The **Paste image** button is another option; if the browser blocks clipboard access, Ctrl+V or **Import texture / image** remains available. Pasting while a text field is focused edits that field normally.

   For sea details, create another layer and clip it to **Water only**. Add a gradient or grain wash, or import a texture image. Select its object to change its gradient, colors, rotation and scale.
4. Choose **Province anchor**, then click a province. Enable **Clip stroke to selected province** for local shading, or use the layer's **One province** clipping option.
5. Choose **Text**, enter your label and click the map. With “Attach to clicked province” enabled, the label stores that province ID and an offset. A click directly over land chooses that province; a click in water uses the province you previously selected. A leader line can connect the label to the province's existing center. Turn the leader off if you want a plain map label.
6. Use **Move/select** to drag artwork. The right-hand object inspector provides exact positions, rotation, scale, opacity, typography, colors and province anchoring. Changing the attached province keeps the label in its current visible position and recalculates its offset.
7. **Preview in game** closes the studio and applies a temporary preview to existing and newly opened election maps. **Stop design preview** restores the ordinary map. Reopen the editor to continue.
8. Click **Export .admap.json**. Send that exported file back when you want the design integrated permanently.

## Layers

The frontmost layer is at the top of the list. Select a layer by name. Its circle toggles visibility; its diamond toggles locking. Locking a merged group protects its children as well. Choose an unlocked, visible layer before painting.

Each layer has a name, visibility, lock, opacity, blend mode and optional clipping to all land, all water, or one province. The blend modes are Normal, Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Hard Light, Soft Light, Difference, Exclusion, Hue, Saturation, Color and Luminosity.

Layers can be duplicated, moved up/down and deleted. **Merge down** combines the selected top-level layer with the one below it into a merged group containing the original sublayers. Their blend modes, masks, strokes and text stay intact. This is deliberately an editable merge, not raster flattening. Select the child layers to edit them. **Ungroup** restores those layers individually when the merged group still has Normal blending, full opacity, no mask and no additional direct artwork; otherwise those settings could change the appearance when removed.

Objects on the selected layer are listed separately, frontmost first. Select an object to inspect it, duplicate/delete it, or send it to the front/back of its layer. Eraser strokes also remain listed and editable even though they are not selectable by clicking a visible colored mark. Hidden/locked layers do not intercept object selection.

## Drawing and object tools

- **Brush:** hard round, soft round and stipple/grain finishes; size, flow/opacity, hardness and color. A brush-size ring follows the pointer. Pen input records pressure; mouse input uses a consistent width. Strokes remain editable paths. Select an existing stroke to change its size, hardness, color, opacity, rotation, scale or clipping.
- **Eraser:** removes earlier artwork on its current layer, including earlier imported images and shapes. It never erases the game's underlying provincial geometry. Later strokes are not erased retroactively. Erasure is stored as editable mask strokes. Lower layers show through erased areas. For a merged group, an eraser added directly to the group affects its preceding children as well.
- **Rectangle, ellipse and line:** drag to draw. Shift constrains rectangles and ellipses to squares/circles. Fill, outline color/width and dashed outlines are editable.
- **Text:** multiline labels, five local font families, size, bold/italic, alignment, letter/line spacing, halo color/width, rotation, scale, opacity, province anchoring and optional leader lines. Custom labels use map coordinates and scale with the map. Their collision/placement is under your control; the default automatic city/sea labels retain the game's existing behavior.
- **Color/gradient/grain wash:** add an object covering the framed map, then choose solid color, linear gradient, radial gradient or repeated grain in the inspector. Set its colors, angle, end opacity and object/layer opacity. A land or water layer mask is useful here.
- **Paste/import texture/image:** Ctrl/Cmd+V accepts copied PNG, JPEG or WebP images and screenshots up to **128 MiB per image** into the selected unlocked layer. The original image bytes and resolution are retained; only the initial displayed size is fitted to the workspace. The Paste image button can read supported images when the browser permits it. Clipboard images take precedence over an older copied editor object. Image files can also be imported. Images remain embedded in the exported project.

### Resize, rotate, crop and flip images

Select an image with **Move/select**, or click its name in the object list. An image toolbar appears above the canvas with Crop, Reset crop, Fit to map, flips and a proportions lock. Eight corner/edge handles appear around the image's visible frame. Drag a handle to resize it; the opposite corner/edge stays fixed. **Lock aspect ratio** is on initially, and Shift temporarily toggles it during a drag. Turn it off to stretch the image in one direction. The inspector also provides precise **Visible width** and **Visible height** fields.

Drag the round handle above the image to rotate it around its visible center. Hold Shift to snap rotation to 15° increments. Rotation and Scale fields remain available, along with horizontal/vertical flip checkboxes and **Reset rotation / scale**.

Click **Crop image** or press **C** with an image selected. The handles turn amber; drag edges/corners inward to trim the visible area, or outward to restore pixels. A faint copy of the complete image provides context while cropping. **Done cropping** returns to resizing. **Reset crop** restores the entire image. Crop left/top/width/height percentages provide exact control. Escape cancels an active drag; each completed crop/resize/rotation is one undo step.

Cropping is non-destructive: it stores a frame over the original image without removing pixels or resampling it. Export/import, browser recovery, undo/redo, duplication and in-game preview preserve that crop. **Fit visible image to map** fits the visible cropped area inside the original 1675 × 717 map while preserving its proportions. Differently drawn/projected maps still require manual alignment.
- **Eyedropper:** samples a province's base color or a supported artwork object's stored color into the brush; it does not sample the final composited screen pixel.

Use the base-map settings to change sea color, paper grain, provincial/coastal borders and widths, ink shading, default label font/colors/halo, coastline shadow, default label visibility and terrain overlay. Party colors and election results remain controlled by the game. The neutral-land preview and screen grid are workspace aids and are not exported.

## Navigation and shortcuts

Wheel zoom follows the pointer. Hand/pan or Space + drag moves the view. The editor permits a little sea around the edges for painting and bounds the view so the map cannot be lost. The zoom range is approximately 67%–1000%; Fit restores the whole frame.

| Action | Shortcut |
|---|---|
| Move/select, brush, eraser, text | V, B, E, T |
| Rectangle, ellipse, line | R, O, L |
| Province anchor, hand, eyedropper | P, H, I |
| Export/import project | Ctrl/Cmd+S, Ctrl/Cmd+O |
| Undo/redo | Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y |
| Copy/paste/duplicate selected object; paste external image | Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+D |
| Delete selected object | Delete or Backspace |
| Move selected object | Arrow keys; Shift = 10 map units |
| Brush size | [ and ] |
| Zoom, fit | + / −, F |
| Cancel gesture, deselect, close | Escape in that order |

Shortcuts leave normal text editing alone. Escape while typing first leaves the field. Ctrl/Cmd+S commits the active field before exporting. The studio traps keyboard focus independently of the game map behind it.

## Saving and the file you send back

The exported **`.admap.json`** is the deliverable. It is a versioned, data-only project file, not a screenshot, PNG export, PSD or executable script. It contains:

- A fingerprint of the original provincial SVG and the map's coordinate frame.
- Map-wide appearance settings.
- Ordered layers, merged sublayers, blend modes, clipping, opacity and locks.
- Brush/eraser points, shapes, gradients, editable text and province IDs/offsets.
- Embedded texture images; no external file paths or image links are required.

Import project restores those editable components. The reader rejects unsupported versions, mismatched geography, invalid settings and external/SVG image sources. Import failure leaves the current draft untouched. Import, new project, deletion and merging can be undone.

The studio autosaves locally using **IndexedDB**, with a previous checkpoint available under **Project & view → Recover previous autosave**. Image data is stored once, separately from document/history metadata, so large images do not hit the former localStorage size limit or get copied into every undo step. Older localStorage drafts are still read when no newer indexed draft exists. Closing the studio waits for its save to finish; reopening or reloading the same game address restores it. Browser storage remains specific to the browser/address and subject to the browser's available quota. If saving fails, the studio asks you to export and stays open until you have started an export; it does not silently close on an unsaved large project. The previous checkpoint is a fallback, not a complete historical archive.

Undo history is session-local, capped at 60 steps and a metadata memory budget; image payloads are referenced rather than duplicated. It is not included in the exported document. Project import files are limited to **384 MiB**, with up to **320 MiB of encoded embedded image data**, 64 layers, six nesting levels, 5,000 objects, 6,000 points per stroke and 150,000 total stroke points. Image dimensions in map coordinates can reach 50,000 units; source-image resolution is preserved independently. Practical decoding/storage capacity also depends on the browser and device memory.

## Permanent adoption and later tool removal

Send the final `.admap.json` back. The implementation can validate it, make any requested refinements, install it as the game's default visual design and remove the editor entry points and tools. That later step is not performed until you provide the finished design.

`out/html/map-design.js` and `map-design.css` are the small portable reader/renderer; `map-editor.js` and `map-editor.css` are the temporary studio. The map renderer calls their optional hooks at the end of its existing setup. The build adds/version-stamps their assets without changing the compiler, campaign qualities, party palette or electoral algorithms. A permanent design can keep the reader, stylesheet and validated document while removing the editor scripts, styles, mount hook, import UI and temporary build inclusions.

The project intentionally does not contain election snapshots or replace province paths. Artwork stays registered to the original SVG in polling, archived general/local results, Senate renewals and municipal control maps. Senate nonvoters retain the existing grey base color. Heavy opaque paint can intentionally cover political fills; you control that visual choice through masks, opacity and blending.

## Verification

`node scripts/test-map-design.js` validates every object type, blend modes, round-trip fidelity, geometry fingerprints, invalid-input rejection, merge structure, limits and province anchors. It is included in `npm test`.

`node scripts/test-map-editor.cjs` exercises the studio in Chromium with Playwright, including strokes, clipping, anchoring, typography, transforms, live opacity, undo/redo, locks, gesture cancellation, embedded images, export/import, bad imports, local recovery, preview rollback, unchanged gameplay and pixel comparisons for merges/erasers/province masks. `ATLAS_PLAYWRIGHT` can point to an environment-provided Playwright module; `ATLAS_CHROME` can specify a Chromium executable. `ATLAS_REPO` and `EDITOR_SCREENSHOT` optionally override the checkout and write a review screenshot.

`scripts/test-map-atlas.cjs` continues to cover all 67 selectable provinces and the existing map navigation/election modes. Run the repository check, build and full test suite as usual.

`scripts/test-map-images.cjs` adds a real PNG over the old 5 MB limit and verifies drag resizing, aspect locking, exact sizing, centered rotation, crop pixels, crop undo/redo, flips, source-byte preservation, large-project export/reimport, deduplicated IndexedDB autosave/reload and protection against storage failure. `npm run test:map-editor` runs both editor browser suites; `npm run test:map-images` runs the image suite alone.


## Authoring a new player-toggle physical map (November 2026)

The old static physical overlay and its global Options radio settings have been removed.
Open **Admin: edit map**, press **Create physical map layer**, and select that layer.
Paste a physical map image with Ctrl+V or use Import texture / image. The studio
reuses its existing transform controls: Move/select dragging, eight resize handles,
rotation, cropping, flipping, opacity and precise X/Y/size fields. Importing a second
physical image replaces the previous image on that special layer; other artwork
layers remain untouched. Select a normal layer to return to ordinary electoral artwork.
The physical layer is separate: it is NOT painted onto the electoral map by default.

Press **Preview in game** and switch **Physical map** on/off in the map's own controls,
next to Victory margins. Until a physical map is previewed or installed, that toggle
is disabled. Selecting the physical layer inside the editor shows it temporarily for
alignment without changing the player-facing setting.

**Export design + physical map** downloads a `.admap.zip` containing the full editable
`.admap.json` and a separately rendered, aligned, fixed 1675×717 `physical-map.png`.
The image export uses the physical layer's actual SVG clipping, image transforms and
mask; it cannot change any election data. Extract the JSON to import it again.
Run **Install_Exported_Design.bat** from the standalone update package with the ZIP
path as the argument (or drag the ZIP onto the BAT). It installs the normal artwork
as `out/html/data/map-design-default.js` and the fixed physical PNG as
`out/html/img/physical-map-custom.png`. Run `npm run build` and check the game,
then push the modified assets yourself. The exported ZIP retains the editable source.


## Universal political and entity colors

Open **Universal party & entity colors** in the studio's left sidebar. Every party
from `AnatolianProvinces.colors` is listed, along with all named entities from
`colourList` (Kurdish organizations, Cyprus groups, far-left/right organizations,
and other colored terms), plus Senate special groups. Each entry has a live color
picker and a per-item reset, with a **Reset all colors** action. Party aliases
(CHP/chp, MGP/CGP, MNP/MSP, TİP/TIP, TSİP/TSIP, and others) use the same
underlying party color rather than duplicating inconsistent settings.

Changes are saved as a sparse `palette` property in the same `.admap.json` file
and thus also in the combined physical-map export. The runtime palette updates
province maps, victory-margin fills, Senate seat colors, the shared party
palette and the game's existing `colourList` label styles. Changes do not
alter votes, party identity, election snapshots or savegame calculations.
An old design file without `palette` is backwards compatible.


## Political / Physical / Combined map textures (v5)

The default game map is **Vanilla**: no texture checkbox is selected. The map
controls offer three mutually exclusive checkboxes, and clicking the selected
one again restores Vanilla: **Political Map**, **Physical Map**, and **Political
and Physical Map**. Victory margins, province selection, zoom, dynamic election
colors and other normal map controls remain available in every mode.

In Map Design Studio, create a separate **Political texture** layer and/or
**Physical map** layer. Paste or import each image, align it using crop, rotate,
resize and exact coordinates. The **Map texture layers** section exposes each
layer's visibility, opacity, blend mode, clipping and stacking position. The
right-hand layer inspector remains usable. The studio has a four-way preview
selector; its default is combined to aid alignment.

Exported `.admap.zip` files contain the complete editable `.admap.json`, a
human-readable `texture-settings.json` showing blend, opacity, clipping and
layer order, and up to two baked transparent 1675x717 PNGs:
`political-map.png` and `physical-map.png`. The PNGs bake transforms and masks,
not the outer layer opacity or blend, which the installed runtime applies live.

Use the **v5 Install_Exported_Design.bat** (not the older v4 export installer)
to install the finished project. It retains each texture layer's appearance
metadata and order in `out/html/data/map-design-default.js`, and writes the
PNG assets to `out/html/img/`. The player begins in Vanilla mode. Re-edit from
the original `.admap.json` inside your export ZIP, which retains full image
sources and layer objects.
