# Final monthly economy model

Implemented from [the supplied 133 equations](specifications/final-economy.md).
`equations.js` is the authoritative monthly solver; `runtime.js` translates game
choices, publishes indicators, migrates saves, and advances it once per month.

## Equation coverage

| Equations | Implementation |
|---|---|
| 1–9 | April policy rate; bounded lending; exact Fisher real rate; M2 and annual summaries |
| 10–18 | Endogenous nominal/real credit, lagged credit adequacy, labor and investment efficiency |
| 19–32 | Planned consumption/investment/government; realized investment-share lags; potential output |
| 33–50 | Nominal/real exchange rates, export capacity and receipts, remittances, debt service, debt limits, reserves |
| 51–71 | Mandatory/flexible import coefficients; final/intermediate import financing; input shortages; production and GDP identity |
| 72–97 | Net exports, absorption, comparison output, unemployment, import forecasts, reserve cover and persistent FX stress, trend inflation |
| 98–111 | Import price index, exchange-rate pass-through, CPI expectations, sector indices and annual averages |
| 112–133 | Initial absorption, domestic savings, neutral shocks, model domains, initial government plan and separate initial-debt schedule |

The original observations for January 1970–December 1971 are preserved.
New historical fields absent from those observations receive explicit scenario
assumptions during initialization; they are not claimed to be observed data.
Where twelve-month GDP growth was absent it is reconstructed from available levels.

## Calibration and policy inputs

The 1972 starting-value workbook now supplies the calibration in the existing
baseline and equations files. Its t=0 is 31 December 1971; engine month 0 remains
January 1972 (workbook t=1), so April and the campaign calendar are unchanged.
Domestic amounts remain billions of TL and foreign amounts remain billions of
USD. The workbook's million-USD stocks and flows are divided by 1,000; price
conversion coefficients remain USD per real TL and are not divided again.

Starting reserves are 0.748 billion USD and external debt 2.210 billion USD.
Initial legacy principal is 0.007583333333333333 billion USD/month, separate from
120-month new-loan amortization. The legacy schedule continues until its original
principal is exhausted; it is not incorrectly amortized over the new-loan term.
Annual external interest is 2.1475494633550474%. Monthly remittances are 0.03925
billion USD; collection is 100%. The debt-income multiple is 2.1, minimum reserve
buffer 0.2571839059936105 billion USD, import forecast bound 0.06, and final-goods
priority 0.5. Import elasticities, all eight mandatory/flexible import cells,
shortage sensitivities, export capacity and its ceiling, pass-through and imported
cost weight now use the supplied workbook values. The bank lending margin is
2.5 percentage points; it is no longer an automatically inferred real-rate target.

Initial investment, government consumption, absorption, exports, imports,
agricultural prices, import cover and lagged receipts use the workbook anchors.
Missing monthly pre-game government consumption is reconstructed from its annual
means and growth rates. Missing historical investment is reconstructed using
expenditure accounting and calibrated to the supplied January lag-average check;
this is synthetic history, not a claim of observed monthly investment. Historical
export cash totals are anchored to the supplied annual totals and December model
receipt. Import-need history uses the supplied initial monthly log trend. These
backfills preserve all existing workbook observations of GDP, CPI, M2 and credit.
The unrelated alternative-model coefficients labelled AYRI MODEL are not installed
into these equations. The exported workbook description contains references to
other sheets, but its flattened numeric import coefficients are supplied in the
same sheet and are used directly.

Runtime inputs include `macro_external_parameters`, `macro_import_coefficients`,
`macro_world_demand`, `macro_remittances`, `macro_export_price`,
`macro_final_import_price`, `macro_intermediate_import_price`,
`macro_government_growth`, and `macro_export_capacity_wear`.
`macro_exchange_rate_change` is a one-off decimal change (0.10 means 10%).

The borrowing card requests 0.2 billion USD; financing is limited by the model,
and each new loan starts principal repayment the following month. Initial debt
has its own schedule and is never registered as a new loan. The export subsidy
action adds 0.01 export capacity after twelve months. The first export-transition
stage devalues by 30% and queues 0.04 capacity; the second devalues by 40% and
queues 0.06 capacity, also with the twelve-month lag. Same-month devaluations
compound. These action conversions
are calibration choices as well. Old policy/event FX pressure changes enter as
liquidity shocks: one pressure point corresponds to 1/100 of the reserve-cover
target times previous planned monthly imports. There is no automatic monthly FX
pressure ramp. Benefits remain queued even when the displayed pressure is zero.

## Debt-service crises

Equation 49 specifies a crisis event but not the subsequent settlement rule.
The game flags an external-financing crisis in its economy screen, blocks import
financing while service is short, pays available funds toward interest then
principal, and carries unpaid interest/principal as explicit arrears. Unpaid
principal remains in the debt stock. Normal settlement equations apply only
when there is no gap. This continuation rule avoids inventing debt forgiveness
or allowing negative reserves. The flag clears after a fully funded settlement.

Zero import need has infinite cover mathematically; saves represent that value
as `null` and the interface says “no imports required.” Production and credit use
the specification's small positive floors. Fiscal restrictions on M2 and existing
authored fiscal, employment, production and price interventions remain active.

## Save compatibility and validation

Version 3 histories are upgraded in place to version 5; no played GDP, CPI, money,
or observation row is discarded. Financial fields are initialized at migration,
with a new separate initial-debt repayment schedule. Existing version 4 financial saves advance to version 5 without resetting balances, loan schedules or played history. Older aggregate saves retain
the previous migration path. Monthly updates remain idempotent and JSON replay
remains deterministic. The normal game still ends after December 1981.

`npm run build` regenerates browser assets and versioned URLs. `npm test` includes
the historical observation fixtures and `test-final-economy.js`, covering monetary
formulas, GDP/savings identities, reserve/debt conservation, input shortages,
coefficient bounds, repayment timing, import-price pass-through, action lags,
crises, migration, save replay, and a 120-month run. The existing full campaign
playthroughs also exercise real cabinet choices over 1973–1981.
