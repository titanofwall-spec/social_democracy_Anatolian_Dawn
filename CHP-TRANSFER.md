# Additive CHP donor partition

Implemented in out/html/provinces.js; Cyprus filtering is in out/html/national-coalition.js. These are the checkout's existing runtime assets. No synced sources/ files were edited.

## Permanent equation

The existing provincial affinity solver determines the new CHP cell share first. For a positive gain g = CHP_new - CHP_old, retain that endpoint and repartition only its rival donors. Losses and gains by other parties retain their existing behavior. Both shiftClass (including coalition actions) and addPollingPoints use the helper; coalition saturation/retention still runs afterward.

For each available donor k with current cell share x_k, use:

    affinity: CGP 1.80, TIP 1.65, TBP 1.50, MP 1.35,
              MSP 1.20, MHP 1.05, DP 0.85, AP 0.65
    a_k = 0.5 + 0.5 * affinity_k   (unlisted parties: affinity = 1)
    a_AP = a_AP / (1 + 4 * CHP_old^2)
    retained_k = x_k * exp(-a_k * t)

Solve t >= 0 by bisection so that retained donor shares exactly fill the remaining cell mass. Unavailable-party shares keep their original proportional result; their change is deducted from the gain that the available donors fund. No unavailable party is introduced. Zero donors remain zero.

This blends current-share weighting with the requested preference: marginal losses are proportional to x_k * a_k. The order is a propensity per existing voter, not an absolute-vote quota regardless of party size. Exponential depletion makes a positive small donor shrink smoothly rather than being consumed first. AP and DP have strictly positive donor rates. At effectively total CHP dominance (remaining donor mass <= 1e-12), retain the original solver result rather than inventing support.

Then add a modest passive AP consolidation benefit, only if AP is an available existing donor:

    B = min(0.15 * remaining_non_AP_pool, 0.25 * g * CHP_old)
    AP += B
    every other donor *= (pool - B) / pool

This conserves the cell total and CHP endpoint. It is not a national AP floor and cannot guarantee a minimum AP result in every state. The effect is relative to the otherwise proportional trajectory; AP can still lose net support as CHP rises. There is no persistent modifier, so merely refreshing polls does not compound the effect.

## Temporary Cyprus equation

Apply ordinary temporary effects first with their existing proportional donor pool. Apply all effects titled Cyprus Prestige second, excluding both CHP and AP from their donor pool. Existing saves already use this exact title, so no migration is needed. For either pool:

    factor = min(1, requested_points / 100 * national_votes / eligible_donor_votes)
    donor_loss = min(current_share, factor * ordinary_share * eligible_fraction)

The Kurdish conscious component remains excluded as before. Rebuild province votes and class totals from the resulting class preferences. Cyprus itself never subtracts AP shares; integer ballot rounding can differ by one national vote. If eligible donors are insufficient, only the available votes can transfer. Cyprus decay, duration, later permanent retention and chronology remain unchanged. Other temporary effects can still take AP votes.

## Verification

Applied to C:/Users/umutc/Downloads/social_democracy_Anatolian_Dawn. Existing universal provincial vote balancing, sandbox overrides, demographic system and macro-economy mechanics are preserved. Checks and regression results are recorded in the accompanying chat. No commit or push was made. Originals are backed up in the Codex workspace under chp-downloads-repository-backup.
