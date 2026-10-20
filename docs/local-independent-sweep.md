# Independent sweep in local elections

## Reproduced fault

A 1977 scenario with approximately 7.53% general-election support for independents produced approximately 41.07% local votes and 39/67 provincial capitals. Reproduction increased the existing independent preference scores fourfold; it did not assign a local majority. At ordinary preferences, approximately 2.37% general support became 17.23% local support. This explains why different playthrough preference states triggered the problem; the independent D'Hondt random factor itself did not cause the vote inflation.

## Causes and correction

Local historical references were interpolated using CHP nationwide popularity rather than election year. A weak CHP could therefore select the 1973 high-independent local baseline during a 1977 contest. Local party conversion also multiplied support by ratios against estimated general-election shares; a small estimated independent denominator inflated their local votes many times. Finally, mayoral winners compared the total votes for all independents as if they belonged to a single candidate.

Local references now interpolate by calendar election year, with 1973 and 1977 as exact anchors. The historical local/general difference is applied as an additive vote-share swing, rather than an unbounded ratio multiplier. Existing support changes still matter; removed/inactive parties remain absent and locked Kurdish political pools remain protected. No independent support or seats cap was added.

Mayoral contests compare election-adjusted votes: banned TİP handling and the Socialist Left pooling are respected, and the pooled IND/KI totals use the already existing saved 1/2..2/3 candidate split when identifying the strongest independent candidate. Actual independent ballots and published vote totals are retained. This changes winner comparison, not the recorded number of voters. Election factors are archived as before; loading/reopening an existing snapshot cannot reroll them. The general-election D'Hondt formula and voting preferences are unchanged.

In the reproduced high-support scenario the local independent vote now totals approximately 13.02%, and the independent municipal count remains a minority (typically 6/67 with the ordinary generated factors), rather than 39. Independents can still win genuinely strong local contests.

## Verification

24 stress combinations cover 1973/1977, Socialist Left off/on, baseline/doubled/quadrupled independent preference, and candidate splits of exactly 1/2 or 2/3. All preserve 67 provincial capitals and avoid the artificial independent majority. Further checks cover the exact reproduced scenario, candidate-vote winner consistency, vote conservation, repeat tally idempotence and save/reload snapshots. Existing 23 province model scenarios, party-unlock, playable-card, advisor picker, cadence, rules and cleanup suites pass. Chrome runs six complete municipal election events with varied random seeds and both ordinary/quadrupled independent preference, verifies counts, and renders every result map.

Already archived past elections remain immutable. The correction applies to new tallies; it does not rewrite past saved outcomes without their original electorate state.

Files: out/html/provinces.js, scripts/test-local-independents.js, package.json; asset version in index.html refreshed by the existing build.

