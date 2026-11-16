# Anatolian Dawn — Turkish translation source copies

**Source**: https://github.com/titanofwall-spec/social_democracy_Anatolian_Dawn at commit `a69744f0cbb6b515af821ebb72b73cfec76885a9` (main branch). Snapshot: November 17, 2026.
**Contents**: 325 copied files, original directory structure and bytes preserved.
**Categories**: {"reference_or_authoring":20,"archived_backup":11,"active_game":267,"visual_localization_review":27}.
**Purpose**: preparation of a Turkish localization, not a runnable mod or applied translation.

## Translation workflow

Prioritize `source/scenes/`, `source/qdisplays/`, and `source/info.dry` for Dendry events, choices, and narrative.
Check `out/html/` JavaScript, HTML, CSS, JSON and SVG for hard-coded English UI labels, tooltips, news, elections, parties and Cyprus minigame text.
The compiled `out/game.json` and `out/html/game.json` are included for coverage, but do not treat generated files as authoritative; rebuilds can overwrite them.
The authored/research files, backups, and candidate map images are included to prevent overlooked text. They are clearly labeled in the manifest and may not be active game localization.

**Only translate player-visible text**. Preserve identifiers, variable and function names, JSON property keys, Dendry directives, `@` choice labels, event destinations, interpolation tokens, `{! ... !}` code blocks, HTML element attributes used by scripts, file paths and escape sequences. Avoid indiscriminate search-and-replace. Preserve UTF-8 text.
The included images are candidates for separate inspection of embedded names or labels; no claim that every one contains visible English text.
Third-party minified JS, build/test automation, general engineering documents, audio, and most raster photographs are excluded.

`TRANSLATION_MANIFEST.json` lists each original path, category, byte size and Git blob SHA. `TRANSLATION_FILE_LIST.txt` provides a checklist.
This archive contains **GitHub-tracked files only**, not local/unpushed changes from Windows.
**Do not merge this isolated export branch into main.** Download the branch ZIP to obtain a self-contained folder of copies.
