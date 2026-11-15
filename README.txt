Anatolian Dawn - Cold War tooltip layout fix v2

Run INSTALL.bat. Target: C:\Program Files (x86)\social_democracy_Anatolian_Dawn

Requires existing tooltip adapter from prior installer and Python 3. Backs up its JavaScript asset before replacing it.

New behavior: replace the value in the original Head of State / Head of Government / Government labels. No duplicate panel and no date/baseline warning. Turkey untouched. Internal default date is 1972-01-01 if game date cannot be read.

If the game uses unusual markup, some values might remain unchanged; script does not overwrite unknown tooltip HTML.
