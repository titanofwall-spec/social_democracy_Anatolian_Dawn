# Cyprus incidents and Kocatepe

The six source scenes use the finalized supplied descriptions and Continue quotations. The successful Kocatepe outcome is titled **A Last Minute Save**. The date in the `Operation Failure July 22` source heading is treated as scheduling metadata; its event title is **Operation Failure**.

| Event | Trigger |
| --- | --- |
| The Phantom Convoy | July 21, 1974, before the existing July 21 military decision. The supplied narrative establishes the approximately 14:00 briefing. |
| A Last Minute Save | The convoy's sole Continue action succeeds in the Kocatepe roll. |
| The Sinking of Kocatepe | The same action fails in the Kocatepe roll. |
| Operation Failure | July 22, before the existing daily military decision, regardless of the Kocatepe outcome. |
| The Massacre at Taşkent | The Atilla II route, once August 15 combat has been resolved and reports are available on August 16 or later. Never the peaceful Güneş implementation route. |
| The Weight of Gratitude | After a successful final settlement report, before the existing rally and domestic calendar advance. Excludes military defeat and non-intervention. |

These events add no calendar days. Military and diplomatic decisions remain in place. The active campaign uses daily dates rather than an hourly clock; the Kocatepe record stores July 21 at approximately 15:00 without advancing the daily calendar. Older saves already past the July incidents do not receive a backdated roll.

## Military system integration

`cyprusAtilla1.militaryTier` supplies the existing average land/air/naval strength tier. Base chances to save Kocatepe are 10%, 20%, 30%, 40% and 50%. `cyprusRoadmap.kocatepeChance` adds the existing `cyprus_support_bonus` directly as percentage points; maximum success is 60% with investment, 50% from military strength alone.

The original bottom-panel support actions, prices, cooldowns, spending ledger, early action limits and bonus cap remain in use. `cyprusAtilla1.consumeSupportBonus` is shared with the active campaign's ordinary military resolutions. `rollProbability` reuses their random-draw normalization and consumes this same pending bonus. It makes exactly one draw and does not deduct resources again. Existing score-based operations retain their score distributions.

`cyprus_kocatepe_result` saves the base chance, support bonus, final chance, draw, selected outcome, date and `shipLost` record. Completion markers use the existing `cyprus_roadmap_seen` ledger. Opening or restoring an outcome never rolls again, and only the selected outcome is eligible. The outcome consumes the pending bonus before the next ordinary military action.

There is no individual-ship inventory or naval-loss consequence system in the existing game. Kocatepe's loss is recorded in the saved result; no additional strength, resource, polling or diplomatic penalty is invented.

## Verification

`scripts/test-cyprus-incidents.js` covers all five strength tiers and their boundaries, +0 through +10 bonuses, 110 controlled success/failure results, real support purchases, one-time consumption, no extra costs, no carry-over, mutually exclusive outcomes, popup order, engine rendering, saved-state re-entry, Taşkent's war/peace conditions and the aftermath/rally transition. Text is compared against `scripts/fixtures/cyprus-incidents.json`, imported from the supplied files.

The suite runs as part of `npm test`. Existing Cyprus roadmap helpers also acknowledge the new interludes so their original campaign assertions continue to exercise the next military or diplomatic decision.
