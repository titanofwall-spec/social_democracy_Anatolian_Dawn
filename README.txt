ANATOLIAN DAWN / COLD WAR HISTORICAL GOVERNMENT TOOLTIPS

Run INSTALL.bat. Default target:
C:\Program Files (x86)\social_democracy_Anatolian_Dawn

This small patch contains no copied game files.
It probes local HTML entrypoints, makes dated backups, and inserts a self-contained JavaScript tooltip enhancement containing the full government database.

The enhancement:
- reads country name or, when unambiguous, SVG region color from hover information;
- identifies available existing tooltip DOM elements;
- adds head of state, head of government, and ideology-colored government party information;
- probes common game-state date fields and UI date markers (if not found, shows the 1972 baseline with a warning);
- avoids inserting static historical information for Turkey, leaving its dynamic game system unchanged;
- hides scrollbar in commonly named Cold War menu containers without disabling scrolling.

IMPORTANT LIMITATIONS
Without access to this game's actual tooltip implementation, no generic installer can guarantee that the DOM selectors, country identifiers or date source will match this particular build. It may require follow-up edits. It does NOT overwrite or remove existing placeholder rows, it adds actual historical content below them where a tooltip is identified. Turkey's live data bindings cannot be implemented without game code knowledge.

To undo: remove <script data-anatolian-coldwar-governments="v1" ...> from modified HTML and restore your original HTML from _cold_war_patch_backups/<timestamp>. The generated _cold_war_governments asset directories are safe to remove after restoring.

Python 3 required. Windows Program Files installation may require elevation. Do not run the game as administrator unnecessarily. Historical records are provisional in places.
