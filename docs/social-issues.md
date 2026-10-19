# Social Issues menu and policies

The new Social Issues tab uses the standard left-sidebar tab system and heading style. Women's Rights, Religious Affairs, the complete former Politics Kurdish section (including political organizations/support), and Kurdish Rights appear in that order. The Defense separatist/paramilitary category is retained.

## Indicators

Women's abortion stages follow legalizee (0/1/2). Equal Pay follows the equal-pay directive in Women's Rights; old saves can also infer it from that scene's visit record. Female Workforce follows that directive, maternity-leave implementation or the houseworker social-security reform. No new women's policy effects were invented.

Religious Office and Compliance follow their successful one-time reforms. Female participation emerges with admission and is fully expanded after six recruitment rounds.

Kurdish freedom starts repressed by laws and prejudice; any of the four legal reforms moves it to repression by prejudice; all four enable and protect it. Economic Aid improves with agricultural efforts and reaches Maximum Aid after six rounds. State-violence protection improves on the first oversight action and reaches Protected after six.

## Policy requirements

Religious Office costs 1 budget, Publications Compliance 2, initial admission of women 1, each once. Recruitment becomes available after admission, is free, permits six successful uses, and requires one full calendar year between uses. The first round can be taken immediately after admission. The obsolete Women Employment Program menu option is replaced by Publications Compliance; its old address safely returns to the menu.

Kurdish associations, public discussion and meetings each require CHP control of Interior, cost nothing, and are one-time. Regulated Kurdish publishing is implemented as a one-time legal reform costing 1 budget. Oversight costs 1 per round, has six rounds and a one-year cooldown. Agricultural efforts replace the old local-government placeholder, require Agriculture, cost 1 per round, and have six rounds with a one-year cooldown. No additional ministry gate is imposed on publishing or oversight because none was specified. All actions require CHP in government and consume one normal action period. Opening a menu costs nothing. Costs and eligibility are checked again by the action handler.

Repeat cooldowns appear as the exact requested unavailable subtitle beneath the option, without a click. Successful state, counts and dates survive serialization; reentry during the cooldown or after a one-time reform cannot pay or apply its effects again.

## Kurdish effects

Each successful Kurdish action closes 1% of the remaining gap toward full consciousness: X' = X + .01*(1-X). Radicalism falls by 3% of its current value: Y' = .97*Y. Existing valid X/Y values are normalized 0..1, and paramilitary inclination is unchanged. From X=.20, Y=.25, all sixteen actions (four legal actions, six oversight and six agricultural) produce X approximately .31883 and Y approximately .15356. This remains noticeable without reaching 100% consciousness or zero radicalism. Existing electorate and organization models recalculate from the changed X/Y; no separate voting formula was added. Religious actions do not change Kurdish variables.

## Content and images

The user's English passages were lightly corrected for grammar and punctuation. No source annotations are added to the game. Supplied images are copied unchanged to img/religious-affairs.png, img/kurdish-issue.jpg and img/peoples-sector.png. The first is the Religious Affairs card image; Kurdish Issue and People's Sector use their respective images both on the card and above the opened menu options.

## Verification

Eight new regression suites cover all default and final statuses, ministry/budget/government requirements, one-time and six-round limits, saved annual cooldowns, exact combined X/Y effects, actual policy choices and Women's Rights actions, and supplied assets. Existing People's Sector, Kurdish, provincial/election, party-unlock, cleanup and Cyprus suites pass. Browser checks cover tab relocation/headings, live costs and inline cooldown reasons, indicators, loaded inline images, and light/dark layouts. Build, state registry, JavaScript syntax and existing type checks pass.

Implementation: out/html/social-issues.js; the three affected policy scene files; status.scene.dry; index.html; rules.js Node test wiring; build/check/state keys/package scripts; test-social-issues.js. Former scaffold tests delegate to the functional policy suite. Generated story output rebuilt. No changes to existing card effects beyond the specified new policies and display markers.
