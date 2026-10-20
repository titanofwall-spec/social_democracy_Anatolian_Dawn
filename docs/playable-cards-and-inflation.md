# Playable cards, return-to-hand and inflation

## Card eligibility

out/html/card-actions.js installs an instance wrapper around the existing engine choice compiler, used by deck draws and Cabinet lists. Each candidate isCard must have a reachable, currently choosable substantive action. It follows internal go-to menus and submenus, respects existing view/choose predicates, excludes navigation/decline/return controls and prevents cycles. Completed/cooling actions therefore cannot keep a card drawable solely through its Back option. Conditions are recomputed on each choices compilation, so budget, ministries, dates and unlocks can restore availability. Existing root cooldown checks still apply. No policy effects are executed by the availability inspection.

## The three new policy cards

People's Sector, Religious Affairs and Kurdish Issue have Back to main menu and We will not take an action at the moment. The former restores the exact removed hand card and refunds its unused card-level timer/action charge. The latter consumes/discards the card and retains the ordinary six-month reuse timer. A successful reform commits the card and cannot be undone by Back. Cabinet-origin cards return to the menu without inventing a hand card. The pending opening is plain save-state data and can survive save/reload. Existing cards retain their original navigation.

## Inflation and sanctions

Short-term price controls now subtract 6 from inflation_modifier instead of 3; other policy side effects are unchanged.

Annual historical inflation is consulted only through 1976. From 1977 onward the baseline is anchored at the 1976 value (16.4), including migration from saves carrying a later historical baseline. Policy modifiers, their existing decay, oil-supply benefits and player-selected economic reforms remain active. Historical GDP, unemployment and production series were not changed because they do not assign inflation. The later historical inflation values can remain as reference data but are not applied.

The Arab oil embargo now applies a separate one-time +8-point inflation modifier on/after November 1973, independent of optional flavour events. It undergoes the existing positive-modifier decay. Saves first loaded after 1976 are marked as having passed the shock and do not receive a new late spike. No repeat calendar-year inflation shocks were added. +8 is the explicit implementation magnitude for the requested outside crisis effect, which had no supplied number.

An actual economic Cyprus embargo sets cyprus_economic_sanctions_active. The existing -.5 growth penalty is isolated from normal policy-modifier decay and therefore persists throughout play. The existing +25 forex pressure and military effects remain; the immediate delayed-ceasefire forex penalty also remains. No negotiated peace acquires new sanctions. Older embargo saves infer the persistent marker only when Atilla II and the economic-embargo conditions are present and the ending is not negotiated peace.

## Verification

New suites cover completed/cooling cards, nested menus, original ready government cards, return-to-hand versus discard for all three cards, price-control magnitude, historical-rate isolation after 1976, once-only oil shock, and persistent economic sanctions. Existing source/type/state checks and social/People's Sector/election/Kurdish/Cyprus/cleanup regression suites pass. Chrome checks confirm the runtime filter and actual Back/inaction buttons.
