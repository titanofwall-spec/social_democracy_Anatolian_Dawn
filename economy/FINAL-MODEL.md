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

The uploaded equations do not supply numeric initial trade, reserves, external
debt, amortization maturity, import coefficients, elasticities, or pass-through.
`externalDefaults` and `importDefaults` expose the chosen starting calibration.
External money uses billions of USD, domestic real/nominal money uses the existing
billions-of-TL scale. The conversion coefficients are USD per real TL; annualized
real trade is divided by twelve to obtain monthly foreign-currency payments.

Defaults: exchange rate 14, foreign price index 1, export capacity 0.08 of potential
GDP, export and import conversion prices 1/14, reserves 1.2 billion USD, external
debt 2 billion USD, 5% effective annual debt interest, and 60-month repayment.
Remittances are 0.08 billion USD/month; export/remittance collection is 90%.
Debt is limited to twice trailing-year collected foreign income. Reserve cover
target is three months, import forecast log growth is bounded at ±0.1/month,
and final imports receive a 25% priority weight. Pass-through is 0.5 with imported
cost weight 0.25. Government consumption begins at 12% of GDP. These settings are
calibration choices, not an assertion of historical accuracy.

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

Version 3 histories are upgraded in place to version 4; no played GDP, CPI, money,
or observation row is discarded. Financial fields are initialized at migration,
with a new separate initial-debt repayment schedule. Older aggregate saves retain
the previous migration path. Monthly updates remain idempotent and JSON replay
remains deterministic. The normal game still ends after December 1981.

`npm run build` regenerates browser assets and versioned URLs. `npm test` includes
the historical observation fixtures and `test-final-economy.js`, covering monetary
formulas, GDP/savings identities, reserve/debt conservation, input shortages,
coefficient bounds, repayment timing, import-price pass-through, action lags,
crises, migration, save replay, and a 120-month run. The existing full campaign
playthroughs also exercise real cabinet choices over 1973–1981.
