# Kurdish political organizations

Implementation: `out/html/kurdish-organizations.js`. Exact author-supplied a/b/c, founding dates and founding supporters are in its configuration. O (organizational capacity) and A (paramilitary orientation) are explicitly null for all eleven groups. No default O/A or recruitment/growth rates have been invented.

## Mathematics

Existing normalized X/Y/Z and existing Kurdish population feed PC = population * X. M = 1-Y, R = Y*(1-Z), P = Y*Z. Each active group scores a*M+b*R+c*P. Unaffiliated score = .80 + M + .55*R + .25*P. Shares normalize over unaffiliated plus active organization scores. Support = PC*share; members = support*O; armed = members*A*Z^2. O/A outside 0..1 are reported invalid; missing values remain unknown, never silently zero. Z=0 proves armed=0 while missing configuration remains reported. Future/disabled groups contribute no score or support.

Normal allocation conserves PC. Calculations retain floating precision. Displayed supporter counts use deterministic largest remainders to reconcile to rounded PC; member/armed displays round down. Elections and existing changes to X/Y/Z are unchanged.

## Founding and saves

Root initialization and the normal post-event update register due groups independently of event acknowledgement. Each group receives its exact founding supporter count during the founding half-month. Repeated updates, renders, announcements and save/reload within that period preserve the seed. The next dated period redistributes support using the normal formula. Thus founding figures are initial conditions rather than permanent bonuses. During founding, total allocation can temporarily differ from PC; the UI explicitly labels this exception. In the impossible case of a seed exceeding the entire Kurdish population it is limited to that population and flagged seedPopulationLimited. Existing saves after a founding date use normal allocation, avoiding retroactive seeds.

Six annual announcement scenes consolidate founders in 1965, 1974, 1975, 1976, 1978 and 1979. Announcements are available on/after the last founding date that year and only for a campaign initialized before that date; acknowledgement is saved, preventing repeats. Future groups never activate from announcements. Historical announcements are suppressed in late saves. Dates are the author's gameplay schedule.

Legacy per-group 2% militarization values are archived in the new state and removed from live calculations; they are not interpreted as A. Empty name tooltips and #c2d93f remain; aggregate tooltips expose political support, active membership, armed personnel and missing configuration. Politics and Defense use the same snapshot. Rendering does not recruit or mutate organization state.

## Configuration still required

Both O and A for T-KDP, DHKD/TKSP, DDKD/PPKK/KİP, ASDKD/Rızgari, Ala Rızgari, Kawa, Denge Kawa, Red Kawa, T-KDP/KUK, KD/UKO/PKK and Tekoşin. Edit the config or provide saved overrides keyed by organization ID in Q.kurdish_org_overrides with O/A in 0..1. No electorate fields depend on these coefficients.

## Files

New module, six `source/scenes/events/kurdish_org_founding_YEAR.scene.dry` scenes, `scripts/test-kurdish-organizations.js`, this document. Updated rules.js population and UI helpers, data.js canonical name, root/post_event lifecycle hooks, index.html script loading, build/check scripts, state-key registry, rule type declarations, package test command and existing Kurdish tests. Generated game.json/core.js outputs rebuilt.

## Verification

Build, registered-state and syntax/type checks; 125 model environments; exact coefficients and roster; manpower bounds; null/invalid/zero configurations; all eleven date boundaries and seeds; conservation after initialization; six annual events; late-save suppression; render/update idempotence; save serialization; demographic population integration; existing electoral, party-unlock, policy scaffold, province, Cyprus and cleanup regressions; Chrome Politics/Defense/tooltips and founding event checks.
