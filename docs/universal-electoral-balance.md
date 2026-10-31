# Universal Electoral Rebalance v5 (standalone)

This patch updates the province-class voting engine in `out/html/provinces.js`
without replacing unrelated game functionality. It can install over the original
engine or over the previous universal electoral rebalance.

## Geography and ceilings

- Restores the existing regional-affinity response for provincial class gains.
  Uniform log-odds growth previously caused CHP to lead 55 provinces at
  42% national support instead of the original model's 42.
- After every polling, general-election, or local-election ballot, constrained
  province-to-province party-vote swaps enforce limits while preserving each
  province's valid-vote turnout and every party's national vote total.
  These swaps preferentially retain provincial first-place parties.
- **No blanket national mixing:** if a ballot already satisfies all limits,
  the provincial votes remain unchanged. Only out-of-bounds votes need repair.
  If swaps cannot resolve a pathological set of constraints, a bounded
  national-average mixing fallback guarantees the limits.
- Every party has a provincial maximum of
  `min(84.9%, national_share + 15pp + 0.6 * max(0, 60% - national_share)) - 0.05pp`.
  At 60% nationwide, that is **74.95%**; provincial values stay below 75%.
- Every party at or above 15% nationally has at least 20% of its own
  nationwide share in each province. Parties with zero support remain at zero.
- In the exceptional mathematically impossible case of a party exceeding
  84.8% nationally, its share is brought down to 84.8% and excess is
  distributed to alternative parties so no province reaches 85%.
- All changes occur after political actions and before integer vote rounding,
  seats, province winners, maps, and historical election snapshots.
- Saved province preferences and archived elections are not rewritten.

## Regression tests

The dedicated suite checks the universal all-party bounds, population and
seat conservation, and that already-compliant provinces are not modified.
The complete existing `npm test` suite also includes the original national
coalition regional-growth checks: **42 CHP provincial wins at 42% nationwide**,
**43 at 55% nationwide**. That test has NOT been relaxed or rewritten.

The installer backs up every changed source file, runs the dedicated tests
followed by the entire `npm test` suite, and restores originals if a check
fails. It does not stage, commit, or push Git changes.
