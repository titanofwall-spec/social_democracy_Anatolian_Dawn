# Coalition government

This system is separate from the National Coalition electoral mechanic.

## Source material

Party positions come from `Liste (2).xlsx`, rows 4–141, columns F–I: `+` is green, `0` is yellow, and `-` is red. Stable policy IDs retain their workbook row numbers. `out/html/data/coalition-actions.js` maps these positions onto existing actions. Repeated funding rounds share the same negotiated right.

The formation order follows the government-formation branches in `Koalisyon işleri (1).xlsx`, with the user's explicit overrides: Talu may only be refused, and the final right-wing arrangement consists of AP–MSP–CGP with DP outside the cabinet.

Workbook rows 31, 79, 80, 85, 91, 93, 94, 97, 108, 109, 112, 115, 121 and 138 have no separate executable counterpart in the current ministry cards. They do not create dummy actions or tradeable concessions. Existing actions remain covered; new actions can be added to the policy registry when implemented.

## Formation and bargaining

General-election results enter `coalition_negotiations`. The largest party gets the first mandate. Majority governments bypass bargaining. For 1973, CHP's sequence is CGP, MSP, AP, followed by a returned mandate, an AP–CHP attempt, and the Talu refusal. A caretaker remains until local elections. Only a CHP general-election victory enables CHP's local-election momentum and renewed MSP attempt.

Ministry bargaining uses an editable selection with a seat-proportional portfolio quota. This is a balancing choice, not a historical allocation. All ten ministerial portfolios can be selected; the partner receives the remainder. Later unilateral cabinet reshuffling is disabled for a signed agreement.

Contested powers are selected individually inside ministry submenus. Only ministries assigned to CHP appear in either demands or concessions. Selecting a ministry opens its list; it never allocates a bundle. Policy sections use their responsible ministry's ownership requirements, or the prime minister's office for powers administered directly there. Existing action prerequisites still apply.

Releasing a ministry during bargaining removes its pending allocations. Signing checks both equal totals and eligibility of every selected action. During government, negotiated rights cannot override ownership of a ministry: even unresolved or formerly player-owned actions in a partner's ministry remain unavailable.

Contested powers can be claimed, conceded or left unresolved. Signing requires equal numbers claimed and conceded, including zero for zero. A power cannot belong to both parties. Ownership lasts for that cabinet and is cleared by cabinet resignation or replacement.

* Player-owned yellow actions: no coalition resource payment.
* Partner-owned yellow actions: blocked regardless of available resources.
* Unresolved yellow actions: one party resource per initiation, increasing Y once per initiation.
* Red actions: blocked by the partner.
* Green actions: supported, subject to normal ministry ownership and action prerequisites.

The one-resource price, proportional ministry quota and relations threshold of 30 are explicit initial balancing values in `coalitions.js`.

The scene-entry hook enforces payment and binding concessions, while choice compilation and card availability use the same permissions. Existing budget, completion, project and cooldown prerequisites still apply. Merely opening the ministry card does not consume a coalition resource.

## Dissent

Dissent is shown on a 0–100 scale and updated once for elapsed half-month turns, using monthly component rates. Reopening menus cannot advance it. Coalition Affairs shows the component breakdown, the number of settled powers, unresolved powers and Y.

R reads current coalition relations. P reads cabinet age and distance to the next general election. S compares existing far-left/far-right force against police strength, militancy and loyalty, and includes OHAL. F reads US, Western European, Soviet and Middle Eastern relations and existing embargo status. E reads inflation, unemployment, growth and foreign-exchange pressure.

The supplied X formulas are applied without changing their coefficients:

```
G(Y) = 0.04Y + 0.015Y²
X_AP = 1.2 + 0.5E + G(Y)
X_CGP = 1 + 0.6S + 0.9G(Y)
X_DP = 1.4 + 1.05G(Y)
X_MSP = 2 + 1.3G(Y)
```

For governments with multiple partners, their X terms are added. Right-wing governments also maintain dissent state, without exposing their policy tools to CHP in opposition. The existing no-confidence event now triggers at 75 rather than the incompatible old four-point threshold. Resignation and loss of confidence reopen interactive formation rather than automatically installing a scripted cabinet.

External events can call `AnatolianCoalitions.external(Q, amount)` for an immediate dissent change, or pass `R`, `P`, `S`, `F`, `E` or `X` as a third argument to adjust that monthly component. No new external crises are scheduled.

## Persistence and content

`coalition_formation` preserves the mandate, attempts, pending ministries and powers, history and local-election breakpoint. `coalition_government` preserves cabinet partners, signed rights, Y, time anchor and component adjustments. Existing saves with a coalition migrate to an unresolved agreement without overwriting their cabinet allocation. JSON save/export/import includes both objects.

The 1973 event passages supplied by the player are stored in `data/coalition-texts.js` and selected by mandate, coalition, negotiation stage and outcome. Tracking notes are not displayed as titles. Unwritten branches retain their existing placeholders. Secretary references resolve the current leadership state when rendered.

Tests: `scripts/test-coalitions.js` and `scripts/test-coalitions-browser.js`, alongside the existing official regression suite and save-storage browser tests.

## Köykent concession

Köykent Project is a single immediate allocation choice shared across the five rights at workbook rows 4, 5, 6, 23 and 70. These five actions are absent from individual ministry allocation lists. Demanding, conceding, switching or clearing the project updates all five underlying rights together. The existing balance still counts five contested affairs. This grants policy cooperation, not ownership of another ministry; executing an action still requires its ministry. New menus are Demand Concessions and Offer Concessions, and allocation statuses identify the actual party through the standard party formatter.

## Authored 1973 formation paths

The first mandate event distinguishes CHP and AP victories. CGP, initial MSP, renewed MSP, CHP-led AP and AP-led CHP talks use separate introductions, meeting passages, cabinet passages and program passages. Arithmetic failures and abandoned negotiations select different supplied texts. Talu remains a refusal-only proposal and continues as the existing caretaker after returning the mandate.

The CHP-led AP proposal uses Sadi Irmak as a non-partisan prime minister, with Ecevit and Demirel as deputy prime ministers, if accepted. AP's subsequent invitation after CHP has already returned the first mandate cannot produce a government: the supplied compulsory refusal is enforced. An AP-largest election retains the distinct, viable AP-led Grand Coalition route.

When CHP is outside the proposed cabinet, only the discussion and outcome events are shown. Ministry allocation is calculated from the governing parties' seat strengths, excludes external DP support, and is appended to the cabinet-formation event. Player ministry selection and concession trading are bypassed and guarded against stale-save entry. A later right-wing fallback may obtain DP toleration without giving DP coalition membership or ministries. The supplied majority and minority formation passages are selected according to actual support.

The MSP request to delay local elections is included as the supplied discussion passage. It does not silently change the election calendar; no acceptance effects or rewritten election-date system were supplied with this text update. Calendar annotations in the player's tracking notes do not create automatic time jumps.
