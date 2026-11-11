# Monthly economic repairs, version 2

This is a reversible stabilization pass on Onat's monthly model, based on main at
`c8d4aa6d`. It retains savings and investment, the twelve-month efficiency lag,
consumption, fiscal impulse, unemployment level adjustments, counterfactual GDP,
FX memory, policy effects and the half-month game calendar. It does not replace
the framework or rewrite historical commits. Review/revert this branch's commit
to recover the original implementation.

## Audit and history

The October 20 commit `6e8f12db9ef7dae09bf0508403de2c225d4bb3ac`
changed the price-control modifier from -3 to -6. Onat's October 31 integration
`c490575596c38450df066b718cf37a4397f0a822` read the persistent modifier in every
monthly inflation calculation. Current main still did so. Negative modifiers
decayed with a one-year half-life, but observed CPI also fed expectations with
45% monthly weight. A separate negative-CPI demand penalty reinforced deflation.
The positive-only shortage measure, month-to-month growth shown as annual GDP,
missing sector-capacity link and flat deflation health score were also present.

## Price controls

The action now changes coverage: `coverage += (0.55 - coverage) * 0.5`.
Successive actions without elapsed time reach 27.5%, 41.25%, 48.125%, etc.
Coverage decays monthly with the previous one-year half-life. Defaults are
80% enforcement and 6% annual permitted controlled-price growth, converted to
monthly growth. With market monthly growth `g`, the observed basket grows by:

`g - coverage * enforcement * max(0, g - monthlyCap)`.

Thus controls only reduce increases above the ceiling. They never deepen an
already falling price index. The action retains +1 black-market risk, -3
capitalist support, advisor commitment and the existing action count. There is
no cumulative price-gap variable, deferred-price state or release mechanic.
Ending controls simply stops their suppression of subsequent increases.
The twelve underlying monthly rates are ordinary rolling inflation history;
they are never subtracted from observed prices or used to trigger a release.

## Inflation and demand

Internal price rates are annual log percentage points. A monthly rate `r`
changes prices by `exp(r / 1200)`; public CPI is the percentage change against
the price level exactly twelve months earlier. Initialization previously seeded
the oldest observation one month too early; that is corrected for new states.

The monetary anchor is twelve-month log M2 growth minus potential log growth.
The inflation target is:

`anchor + 0.30 * (expectation - anchor) + 0.30 * smoothedGap`
`+ 0.20 * (8 - counterfactualUnemployment) + 0.10 * velocityPressure + policyPressure`.

Underlying trend moves 25% toward the target monthly. Expectations use 80%
previous expectation, 10% underlying twelve-month inflation, 5% observed
twelve-month inflation and 5% monetary anchor, all in log units. The target's
70% anchor weight deliberately gives a stronger restoring force than the
tentative 10% starting suggestion; these are gameplay coefficients, not estimates
of Turkey's historical economy. Other legacy inflation modifiers now enter the
anchored target, rather than repeatedly adding to a largely self-referential
expectations trend. Tiger and oil terms retain their existing magnitudes as
annual log-point pressures, so their balance merits playtesting.

The gap is `25 * tanh(100 * log(demand / availableCapacity) / 25)`, smoothed
65/35. It recognizes both slack and excess demand. Available capacity retains
FX constraints and allows a 2% temporary overshoot of sustainable potential.
The no-FX counterfactual uses the same allowance. The separate direct deflation
penalty is removed. Expected inflation is converted back to ordinary percent
before subtracting it from the nominal interest rate in consumption demand.

## GDP and production

The headline is genuine twelve-month real GDP growth. Monthly growth and
annualized monthly growth remain separately stored; the latter continues to
drive Onat's short-run consumption and employment equations.

Sector indexes are derived from current base indexes plus policy modifiers,
even when a card has not refreshed its display yet. Weighted log changes in
industry (35%) and agriculture (25%) feed a rate filter with 85% persistence.
Each level change enters once and spreads its capacity effect over months;
an unchanged elevated index is not reapplied as growth every month.

Potential log growth equals 40% of neutral investment log growth, plus the
filtered sector contribution, plus actual investment log growth less neutral
investment log growth. Thus sector growth replaces the neutral 60% sector share
instead of being added on top of the full neutral investment trend. Incremental
savings, efficiency, FX and employment effects remain. Neutral investment growth
is the original 3.512%; unchanged sector indexes now imply about 1.39% potential
growth before FX/employment effects. Historical annual sector-index jumps are
smoothed rather than instantly changing GDP. No new K/Q/P mappings are invented;
future policies must avoid writing the same capacity gain into both an index
and a new investment parameter without recalibration.

## Money, FX and health

The old `V` is named `velocityPressure`: it is a bounded interest incentive,
not measured money velocity. `monetaryVelocityIndex = CPI * realGDP / M2` is a
separate diagnostic in index units, not an empirically calibrated turnover ratio.
M2 compounds as a saved stock. `macro_m2_level` is consumed once as an absolute
stock command, then ordinary growth resumes. It no longer silently freezes M2
forever. Price/output shock inputs remain monthly scenario inputs until cleared.

The FX import-price term passes through positive increases in cubic stress.
Improved FX still relaxes production and investment constraints but no longer
forces an equal negative price shock. This is a deliberately asymmetric price
assumption, not an exchange-rate model.

Deflation has severity bands below -2%, -5%, -10% and -20%; invalid inflation
receives the strongest penalty. GDP above 15% receives no growth bonus and above
30% receives a penalty. These affect health only, not the simulated GDP series.
Severe deflation with implausibly high growth cannot produce a Stable label.

## Old saves

Back up the save before loading this branch. Version 1 upgrades automatically,
once, through ensure/headline refresh. GDP, potential, consumption, CPI, M2,
employment and existing histories are retained. Expectations change units from
ordinary percent to log points. Available saved GDP observations are reused;
missing observations are backfilled from the old headline growth and flagged by
`growthHistoryEstimated`. After twelve new observations none are estimated.
Where thirteen saved GDP levels exist the current headline is corrected on load;
otherwise the first new monthly update establishes the rolling comparison.
Underlying inflation history is initially estimated from old expectations and
is replaced over twelve months. Sector baselines start at current saved levels,
so old production gains are not suddenly replayed.

Old saves did not record how much of their aggregate inflation modifier came
from controls. The migration preserves that mixed modifier and its existing
decay, rather than guessing and erasing IMF, oil or other policies. It cannot
retroactively remove old control penalties, reconstruct a counterfactual CPI
path or undo damage already present in the save. Coverage starts at zero until
a new control action. A new campaign is recommended for clean economic balance;
old saves are supported for continuity, not exact historical reconstruction.

## Validation and limits

Run `npm ci`, `npm run check`, `npm run build`, then `npm test`.
The new numerical regressions cover basket arithmetic, saturation, genuine
deflation, expectation recovery, money growth, real interest, GDP/CPI lag
accounting, sector impulse conservation, investment lag, bounded signed gaps,
FX recovery, migration and health. Four additional scenarios execute 216 real
half-month post-event turns from January 1973 through December 1981: baseline,
repeated controls, production plus FX stress/recovery, and monetary changes plus
Tiger. They reload qualities annually and check each monthly CPI/GDP comparison,
finite positive levels and navigation idempotence. Existing tests also cover
elections, coalitions, opposition policies and Cyprus paths.

These are full-horizon economic scenarios, not exhaustive choice-by-choice
campaign walkthroughs. Random event selection is suppressed for reproducibility;
policy stress actions are invoked directly to avoid card-draw variance. They do
not establish historical calibration or every possible save/event combination.
Interest, saving, M2, sector weights and later historical production remain
incompletely calibrated. In particular, absent later historical index entries,
the existing last-known production bases remain in use. Crises and recessions
remain possible; numerical stability is not a guarantee of an easy campaign.

Validation on this branch: locked dependency installation, source checks, build
and the complete `npm test` suite passed. The final calendar update into January
1982 produced the following diagnostics (not calibration targets):

| 1973-1981 scenario | CPI YoY | GDP YoY | Unemployment | Health |
| --- | ---: | ---: | ---: | --- |
| Baseline | 32.18% | 1.07% | 7.42% | In Crisis |
| Repeated controls | 21.27% | 1.07% | 7.40% | In Crisis |
| Production and FX recovery | 27.82% | 3.18% | 7.43% | Unhealthy |
| Monetary changes and Tiger | 15.33% | 1.07% | 7.41% | In Crisis |

The remaining crises reflect the existing FX drift and health multiplier.
Controls lower observed inflation without erasing that separate constraint.

## Continuous economic-health severity (November 11, 2026)

The four visible labels remain **Booming**, **Stable**, **Unhealthy**, and
**In Crisis**. The overall inflation, unemployment and GDP scoring is now
linearly interpolated between severity anchors instead of jumping across
score brackets. Foreign-exchange pressure applies a bounded, smooth penalty,
not division by a sharply stepped multiplier.

**Inflation above 40% always displays `In Crisis`**, independently of
offsetting GDP or employment performance. Severe weakness in other indicators
can also trigger that label. A displayed label is descriptive: changing it
does **not** itself apply a new political penalty. At 39.9% and 40.1% inflation,
the continuously calculated gameplay consequences remain nearly equal.

The saved `economy_health_political_effect` is the government's support change
in percentage points per half-month turn, with a maximum loss of 0.80 and
maximum normal-group gain of about 0.83. Inflation, deflation, unemployment,
growth and foreign-exchange pressure all change its magnitude smoothly.
Capitalists still receive double the positive prosperity bonus. CHP's direct
class adjustments remain suppressed when the national coalition model is
active, as before.

The same continuously calculated effect also scales democracy-status drain
and the economic contribution to paramilitary growth. Discrete safety or
crisis triggers for industrial card restrictions and systemic-crisis mode
remain distinct mechanics; these were not removed. Existing saves initialize
the new field at zero and recalculate it on their next economic-health pass.

This is a health/UI-and-consequences adjustment only. Monthly macroeconomic
equations, production, money supply, inflation transmission and policy-card
economics are unchanged. Coefficients are gameplay balancing values, not
historical econometric estimates. Extra tests were intentionally not run
during this change, at the user's request.
