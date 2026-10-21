# Save-button storage failure

Reproduction: a campaign containing three general elections, three local elections and five Senate renewals serializes to about 1.65 million characters. The original localStorage implementation fills the browser quota after several save slots. Clicking Save then throws QuotaExceededError, leaving the button unchanged. Autosaves share that same limited storage.

`out/html/save-storage.js` installs the save handlers before the engine begins. New saves use IndexedDB, with a transaction required to complete before a button becomes Load or reports Saved. Manual saves, quick saves and both rotating autosaves use the same queued transaction-based storage. Failed writes show an error and retain the existing committed save. Unavailable database storage is reported rather than silently pretending to save.

Existing localStorage saves remain readable and exportable under their original game/author namespace. Legacy slot data is removed only after its replacement commits successfully. An autosave rotation preserves the prior a0 in a1 in the same transaction. Manual slots are not deleted during migration. Save files retain the original JSON format, so import/export compatibility is unchanged. Existing menu links and their alternate window-level handlers use the installed UI methods.

`scripts/test-save-storage-browser.js` exercises all eight large manual saves with localStorage filled to quota, browser reload and load, quick save/load, two rotating autosaves, a deliberately aborted write and preservation of the previous save, legacy localStorage loading, and exported-file reimport. It uses an isolated browser context and synthetic campaign state; it does not access a player's browser profile or saves.


## Save pages and timed autosaves

There are ten manual-save pages with ten slots each (100 total). Existing internal slot IDs 0-7 are unchanged; display labels are Slot 1 through Slot 100. Bottom-right arrow buttons change pages. Auto-0 and Auto-1 retain the current/previous rotating autosaves. Auto-2, Auto-3 and Auto-4 independently retain a snapshot every 2, 4 and 6 in-game calendar months. Timing starts at the first autosave after a new game or a pre-update save is opened. The campaign calendar identifier and anchor are included in save exports; timed records keep their capture month. Repeated page transitions in the same month do not overwrite a timed snapshot. A jump past a deadline saves the current available state once, without fabricating intermediate states.

All autosave updates commit atomically together. Existing save export/import and localStorage fallback remain available. The isolated browser regression covers large campaigns, all ten page boundaries, slot 100 reload/export/import, interval boundaries, legacy loading, failed writes and the four portrait-style tooltips.
