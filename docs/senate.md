# Senate mechanic

The Politics sidebar shows TBMM, The Senate, 15 appointed members, 18 MBK members, eligible former presidents, and the inline elected-party totals.

The supplied workbook provides all 67 province groups and seat quotas. Each group has 50 seats. Elected seats total 150; renewals replace only the participating group's seats. District allocation uses the existing D'Hondt helper and saved independent-candidate split factors. Senate elections never change lower-house seats or general/local election schedules.

Renewals: October 1973 (C), October 1975 (A), June 1977 (B), October 1979 (C), June 1981 (A). These follow the requested group order; 1981 continues the alternate-history schedule. The game's half-month calendar handles these in the first period of each month. Each completed election stores an immutable map snapshot. The ledger reports the 50 contested seats; the diagram reports the full composition of 150 elected senators. Nonparticipating provinces are gray.

## Provisional starting allocation

The user's provincial list totals AP 109, CHP 39, MP 1 and TİP 1. The clarified national totals are AP 101, CHP 47, MP 1 and TİP 1. With the user's authorization to choose provisionally, one seat transfers from AP to CHP in each of Adana, Ankara, İzmir, İstanbul, Hatay, Kocaeli, Gaziantep and Zonguldak. Province quotas and group totals remain unchanged.

All starting assignments are centralized in `out/html/data/senate-data.js`, including the provisional transfer list. Future corrected assignments should replace those initial counts. Saved games retain their existing Senate state; changing initial data alone deliberately does not overwrite an ongoing game.

## Presidents

Former presidents join and leave using the supplied membership dates. The 1973 presidential choice is captured when its result is applied. A renewed Sunay presidency postpones his former-president membership until April 1980. A candidate who has died before April 1980 is not added then. Death placeholders apply to İnönü, Sunay, and the selected president, once each, independently of flavor-event settings. Dates within a half-month appear at the first game period on or after the date. Tooltips show English entry dates, never death dates.

Historical death dates for alternative winners were checked against primary sources:

- [Presidency: Fahri Korutürk](https://www.tccb.gov.tr/cumhurbaskanlarimiz/fahri_koruturk/): 12 October 1987.
- [TBMM: Ömer Faruk Gürler](https://cdn.tbmm.gov.tr/TbmmWeb/Yayinlar/Dosya/5ddb1cad-cdf0-4064-856a-824895851e73.pdf): 23 August 1975.
- [Atatürk Encyclopedia: Perihan Arıburun](https://ataturkansiklopedisi.gov.tr/detay/8183): Tekin Arıburun died on 12 August 1993. This primary-source date is used rather than the conflicting 13 August date in some secondary summaries.

## Verification

`scripts/test-senate.js` covers workbook totals, every renewal, unchanged lower-house seats, saved snapshots, membership dates, one-time death placeholders, pure rendering, and actual election scene execution. Browser checks cover the result event, standard 150-dot diagram, inactive provinces, five archived map tabs, contested-seat totals, nested province details, and the Politics sidebar.
