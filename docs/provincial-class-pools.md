# Independent provincial demographic voting

The supplied table replaces the national class preference pool and the former province-wide preference multipliers. Every province owns seven demographic shares and seven independent party preference distributions: 469 rows in total. `out/html/data/province-data.js` contains the starting data; each game's `province_pools` stores the evolving values.

Class shares come from the supplied attachment, with the inline Siirt margins taking priority: Workers 12.4%, Capitalists 0.3%, Petty bourgeoisie 7.1%, State employees 4.2%, Rural 74.2%, Alevis 1%, Kurdish population 0.8%. Voting preferences come from the attachment's class rows. Small rounding differences in percentage totals are normalized. Hakkâri's zero-population capitalist row legitimately has zero preferences.

Each province's valid votes use its population, interpolated turnout and its own class distributions. National votes and demographic summaries aggregate those results. There is no historical 1973/1977 vote calibration, nationwide target fitting, regional saturation, or province-wide party preference weight. Historical election data remains only for turnout, district seat quotas and legacy result reconstruction. General and local ballots use the current provincial preferences; local independent-candidate splitting is retained. Senate district D'Hondt remains separate from lower-house seat allocation.

As explicitly requested, the fixed political Kurdish voting split still overrides the conscious population's portion of each province's Kurdish class. Unconscious Kurdish voters use the province's supplied class preferences. Socialist Left formation, party availability, election bans and MP decay continue to apply.

The supplied `Other` column remains a reporting category, not a party. Its initial split follows the existing minor-party behavior: TBP support is concentrated among Alevis, MP has a small capped share, and the remainder goes to Independents or Kurdish Independents in the Kurdish class. Separate socialist parties activate only upon Socialist Left formation.

Existing policies that address a class nationally broadcast their changes to that class in every province once. National compatibility fields are derived summaries and a transient interface for those policy effects; they no longer supply a shared voting baseline. A local edit stays local. Population and class size changes are incorporated before the next national aggregation.

Old saves receive the new supplied class baselines and discard the retired calibration weights. Election archives and completed Senate results remain intact. Recorded elections are not recalculated.

MGP uses the existing CGP state key before the merger and changes its display to CGP upon the existing formation event. Its tooltip reads Milli Güven Partisi (National Trust Party).
