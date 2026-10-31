# Universal electoral deconcentration (standalone)

This change applies to the current province-class voting engine in
`out/html/provinces.js`. It is standalone and can replace either the original
runaway-concentration code or the previous electoral balance patches. It uses
the 1972 class-vote preferences as the underlying starting point.

## Rules

- **Every party** receives the same neutral geographic-swing calculation.
  Campaign gains use a common log-odds adjustment in each class; the former
  increasing stronghold affinity exponent is retired.
- Each computed national party margin is redistributed among the 67 provinces
  with a single convex mixing coefficient, retaining local electorate sizes
  and national party totals (subject to integer rounding).
- Each party's provincial maximum is
  `min(84.9%, national_share + 15pp + 0.6 * max(0, 60% - national_share)) - 0.05pp`.
  For 60% national support this is **74.95%**, so vote rounding cannot produce
  a province at 75%.
- Parties at 15% or more nationally have a provincial floor at 20% of their
  own national support. Zero parties/unformed parties remain zero.
- If a party already has **more than 84.8% nationwide**, it is mathematically
  impossible to maintain national totals AND guarantee that no province reaches
  85%. In that exceptional case the nationwide total is reduced to 84.8% and
  the difference is redistributed to the already-supported other parties.
- Applied after ordinary political effects and temporary bonuses, but before
  integer vote rounding, D'Hondt allocation, municipal winners and poll maps.
- No previous election archive is recalculated; province class preferences
  saved in older games are not overwritten. Their new projected outcomes are
  nonetheless bound by the same geographic limits.

## Files

- `out/html/provinces.js` — updated in place by installer to preserve other
  repository work; no compiled `core.js` files are touched.
- `scripts/test-universal-electoral-balance.js` — integrated engine tests.
- `docs/universal-electoral-balance.md` — this documentation.

No Git actions are performed. The installer backs up overwritten files next
 to the repository, executes Node syntax and model tests, and restores files
if a test fails. Run `npm run check && npm run build && npm test` separately
before publishing. If a build step changes your `out/html/provinces.js`, run
`INSTALL_AND_TEST.bat` again.
