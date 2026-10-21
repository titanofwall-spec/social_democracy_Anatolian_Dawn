# Senate mechanic

The Politics sidebar shows TBMM, The Senate, 15 appointed members, 18 MBK members, eligible former presidents, and the inline elected-party totals.

The supplied workbook provides all 67 province groups and seat quotas. Each group has 50 seats. Elected seats total 150; renewals replace only the participating group's seats. District allocation uses the existing D'Hondt helper and saved independent-candidate split factors. Senate elections never change lower-house seats or general/local election schedules.

Renewals: October 1973 (C), October 1975 (A), June 1977 (B), October 1979 (C), June 1981 (A). These follow the requested group order; 1981 continues the alternate-history schedule. October renewals occur in the second period; June renewals occur in the first period. Each completed election stores an immutable map snapshot. The ledger reports the 50 contested seats; the diagram reports the full composition of 150 elected senators. Nonparticipating provinces are gray.

## Starting allocation

The corrected `Umut_senato_liste_cCc (2).xlsx`, sheet `İl-Parti Dağılımı`, supplies the starting elected seats for every province. Totals: AP 87, CHP 34, MGP 11, DP 8, MHP 1, Independents 9. MGP maps to the existing MGP/CGP party (`CGP`), and Bağımsız maps to Independents (`IND`). The workbook supersedes all previous provisional totals and transfers. Each group retains 50 seats and every provincial quota is unchanged.

All starting assignments are centralized in `out/html/data/senate-data.js`. The historical comparison sheet is not the starting provincial allocation; its broken summary formulas are not used. The imported 67 rows reconcile exactly with the first sheet's totals.

Older Senate saves upgrade only the starting seats of groups that have not yet held an in-game renewal. Completed election results, elected replacements, archived maps, presidential state and death-event acknowledgements remain intact. New games use the corrected allocation immediately.

## Presidents

Former presidents join and leave using the supplied membership dates. The 1973 presidential choice is captured when its result is applied. A renewed Sunay presidency postpones his former-president membership until April 1980. A candidate who has died before April 1980 is not added then. Death placeholders apply to İnönü, Sunay, and the selected president, once each, independently of flavor-event settings. Dates within a half-month appear at the first game period on or after the date. Tooltips show English entry dates, never death dates.

Historical death dates for alternative winners were checked against primary sources:

- [Presidency: Fahri Korutürk](https://www.tccb.gov.tr/cumhurbaskanlarimiz/fahri_koruturk/): 12 October 1987.
- [TBMM: Ömer Faruk Gürler](https://cdn.tbmm.gov.tr/TbmmWeb/Yayinlar/Dosya/5ddb1cad-cdf0-4064-856a-824895851e73.pdf): 23 August 1975.
- [Atatürk Encyclopedia: Perihan Arıburun](https://ataturkansiklopedisi.gov.tr/detay/8183): Tekin Arıburun died on 12 August 1993. This primary-source date is used rather than the conflicting 13 August date in some secondary summaries.

## Verification

`scripts/test-senate.js` covers workbook totals, every renewal, unchanged lower-house seats, saved snapshots, membership dates, one-time death placeholders, pure rendering, and actual election scene execution. Browser checks cover the result event, standard 150-dot diagram, inactive provinces, five archived map tabs, contested-seat totals, nested province details, and the Politics sidebar.
