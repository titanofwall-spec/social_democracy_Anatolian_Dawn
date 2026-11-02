# Temporary Map Design Studio

## Open it

Open the game's election map, then click **Admin: edit map** above the map. The studio opens over the game. This is a temporary local authoring tool; “admin” is a label, not an account or permission system.

Start a campaign first if the election map is not available yet. The same entry point appears on inline election results and municipal control maps. Work on a desktop-sized window for comfortable access to both sidebars.

## A useful first workflow

1. Click **+ Layer** and give it a name such as “Paper shading”. Choose **multiply**, reduce **Opacity**, and set **Clip artwork to → All land**.
2. Choose **Brush**. Set a large size, soft round finish, low flow, and a warm grey or brown. Paint gently over the land. The layer mask keeps the sea clear.
3. Create another layer for sea details. Clip it to **Water only**. Add a gradient or grain wash, or import a texture image. Select its object to change its gradient, colors, rotation and scale.
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
- **Import texture/image:** PNG, JPEG or WebP, up to 5 MB each. The image is embedded in the project. Resize, move, rotate, scale, blend or clip it as an ordinary object. Use Scale to retain its aspect ratio; width/height can be adjusted separately. This tool does not provide a separate pixel image editor or destructive image crop.
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
| Copy/paste/duplicate selected object | Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+D |
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

The studio also autosaves its draft locally in this browser, with a previous checkpoint available under **Project & view → Recover previous autosave**. Closing the studio saves the current draft. Reopening or reloading the same game address restores it. Browser storage is specific to the browser and address and has a limited quota; if the draft cannot be stored, the status bar explicitly asks you to export it. Large embedded textures can reach that limit quickly, so keep portable exports as you work. The previous checkpoint is a fallback, not a complete historical archive.

Undo history is session-local, capped at 60 steps and a memory budget for image-heavy projects. It is not included in the exported document. Import files are limited to 30 MB; a document supports up to 64 layers, six nesting levels, 5,000 objects, 6,000 points per stroke, 150,000 total stroke points and 20 MB of embedded image data.

## Permanent adoption and later tool removal

Send the final `.admap.json` back. The implementation can validate it, make any requested refinements, install it as the game's default visual design and remove the editor entry points and tools. That later step is not performed until you provide the finished design.

`out/html/map-design.js` and `map-design.css` are the small portable reader/renderer; `map-editor.js` and `map-editor.css` are the temporary studio. The map renderer calls their optional hooks at the end of its existing setup. The build adds/version-stamps their assets without changing the compiler, campaign qualities, party palette or electoral algorithms. A permanent design can keep the reader, stylesheet and validated document while removing the editor scripts, styles, mount hook, import UI and temporary build inclusions.

The project intentionally does not contain election snapshots or replace province paths. Artwork stays registered to the original SVG in polling, archived general/local results, Senate renewals and municipal control maps. Senate nonvoters retain the existing grey base color. Heavy opaque paint can intentionally cover political fills; you control that visual choice through masks, opacity and blending.

## Verification

`node scripts/test-map-design.js` validates every object type, blend modes, round-trip fidelity, geometry fingerprints, invalid-input rejection, merge structure, limits and province anchors. It is included in `npm test`.

`node scripts/test-map-editor.cjs` exercises the studio in Chromium with Playwright, including strokes, clipping, anchoring, typography, transforms, live opacity, undo/redo, locks, gesture cancellation, embedded images, export/import, bad imports, local recovery, preview rollback, unchanged gameplay and pixel comparisons for merges/erasers/province masks. `ATLAS_PLAYWRIGHT` can point to an environment-provided Playwright module; `ATLAS_CHROME` can specify a Chromium executable. `ATLAS_REPO` and `EDITOR_SCREENSHOT` optionally override the checkout and write a review screenshot.

`scripts/test-map-atlas.cjs` continues to cover all 67 selectable provinces and the existing map navigation/election modes. Run the repository check, build and full test suite as usual.
