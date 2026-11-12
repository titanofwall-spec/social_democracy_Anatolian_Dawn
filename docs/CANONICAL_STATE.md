# Canonical game-state variables

The state held in `Q` uses **one gameplay source per concept**. Extra spellings
in older saves are imported only when the canonical field is absent. Once read,
the aliases are removed by `AnatolianRules.migrateStateAliases`.

Canonical fields:
- Sector policies use `industry_modifier` and `agriculture_modifier`, while
  `industrial_production_index` and `agricultural_production_index` are
  derived using historical baselines. The redundant
  `industrial_player_modifier` and `agricultural_player_modifier` are retired.
- Voter support is `<demographic>_<party>` (e.g. `workers_chp`,
  `rural_AP`). Parliamentary seats use `chp_seats` for CHP and upper-case
  party symbols for other parties (`CGP_seats`, `TIP_seats`, etc.).
- `CGP_relation`, `I_in_government`, `democracystatus` and
  `<party>_party_leader` are authoritative. Old alternative spellings are
  never written by current gameplay code.
- `dissent_percent`, numeric `*_2`/ `*_formatted` display strings, electoral
  historical snapshots, and macroeconomic inputs are intentionally distinct
  derived/snapshot values. They are not interchangeable with their sources.

## Existing saves

Save migration is performed when a save loads, when a state is refreshed,
and when the Status screen initializes. The canonical value wins conflicts,
so a stale incorrectly-written alias cannot overwrite real progress.
If an old save contains *only* an alias, its value is imported. Erroneous
historical increments in a shadow key cannot be reliably reconstructed.
A one-time `state_aliases_version` marker avoids repeated migration.

## Policy status projections

Interior Affairs labels are now derived by `AnatolianRules.interiorPolicyStatuses`
from completed reforms (e.g. land distribution stages, nationalizations,
workers' representation, safety inspections and education reform flags).
The status screen must not maintain a second set of independently mutable
policy levels. The original standalone measures with no corresponding
implemented policy source (minimum wage, university prestige and household
violence) remain separate until mechanics for those concepts are created.

The agriculture price ratio and its text tier are calculated together
in `AnatolianRules.refreshEconomy`; government actions and monthly updates
call that shared function. Parliament's party-seat figures come from
current election state, never hardcoded initial election percentages.

Regression check: `node scripts/test-state-aliases.js` (also in `npm test`).
