# Anatolian Dawn — Onat monthly macro engine

This integration replaces the headline GDP growth, CPI inflation, and unemployment baselines with a monthly stateful calculation, preserving existing display assets and Dendry scenes. The existing half-month turn system advances the macro state only when the calendar month changes. State is saved as `Q.macro_model`.

## Existing policy effects

- `growth_modifier` is interpreted as the fiscal demand impulse `f_t` (or explicit `macro_fiscal_impulse` if supplied).
- `inflation_modifier` is treated as an annualized addition to the underlying inflation trend, alongside `oil_inflation_effect` and the Tiger policy effect.
- `unemployment_modifier` changes the monthly unemployment level when its value changes. This prevents repeatedly subtracting the same -1 modifier every month.
- `forex_pressure` is the game's existing bounded 0–100 pressure metric and feeds `q_t`. Existing drift and card effects continue to apply to it.
- Industrial and agricultural output indices retain their existing calculations; they are not wholesale replaced.

## Exposed inputs (configure in scene actions)

`macro_savings_rate` (%) = 20, `macro_interest_rate` (%) = base CPI inflation + 3, `macro_m2_growth` (%) = base inflation + base growth, `macro_mpc` = 0.74, `macro_investment_K` = 1, `macro_investment_Q` = 1, `macro_investment_P` = 0. Optional inputs are `macro_fiscal_impulse`, `macro_public_employment`, `macro_output_shock`, `macro_price_shock`, `macro_m2_level`, `macro_initial_gdp`, `macro_initial_cpi`, `macro_initial_m2`.

**Calibration is incomplete**: Onat's supplied equations do not specify historical series for saving, M2 or interest rates, or how specific cooperative/industrial policies map into K, Q, and P. Neutral starting assumptions have been used rather than claiming those mappings exist. GDP starts at an index of 100. New saves are recommended. Old saves get a macro state on their next post-event turn.

## Important formula choices

- Investment effectiveness enters capacity after 12 months as `E_(t-12)`.
- The foreign-exchange input `FX_t = FX_0 + ΔFX*t` from Onat's stress test is replaced with actual game `forex_pressure`; the asymmetric memory and production ceiling are preserved.
- The `g_t^0` counterfactual uses the previous counterfactual GDP exactly as written in the supplied equations; the baseline mismatch previously discussed has **not** been silently corrected.
- For extreme inputs, consumption and output growth use a 0.05 minimum positive factor to prevent NaNs, as the demand formula already does. This guard applies outside ordinary calibration ranges.
- The macro model does not automatically hold unemployment to 8%, and does not automatically spend treasury funds.

## Testing and installation

Copy the package into your Downloads folder and run `INSTALL.bat`. By default it modifies `%USERPROFILE%\Downloads\social_democracy_Anatolian_Dawn`, makes external backups, runs `npm ci`, `npm run build`, and `npm test`. To target a different clone, pass its path as the first argument. Open `out/html/index.html` after compilation. Inspect historical trajectories before merging this change into a release.
