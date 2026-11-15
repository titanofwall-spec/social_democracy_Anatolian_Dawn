# Cold War map modes: classification policy and sources

The visualization covers 1972–1981. Political Mode uses the original exported display stack unchanged. Alternate modes replace only its country-color layer. Texture, sea treatment, heightmap, color grading, lighting, outlines and decorations retain their existing order. Consequently the specified HEX values are the country-layer colors; the rendered terrain and lighting modulate them.

The two broad blocs are a conservative game visualization, not a claim that every client or ally surrendered its independent foreign policy. Formal alliance membership is handled separately and always wins. Unlisted, ambiguous, independent communist, and genuinely non-aligned countries remain neutral. China, Albania, Yugoslavia, India, Algeria, Libya, Mexico, Panama, Finland, Sweden, Austria, Switzerland and Ireland are not automatically assigned a superpower bloc. Membership of the Non-Aligned Movement alone is not used as proof that a country had no substantive military patron.

## Formal alliances

NATO: the twelve 1949 signatories, Greece, Turkey and West Germany throughout this interval. France and Greece remained treaty members despite withdrawals from the integrated command. Spain does not enter before its 1982 accession. Warsaw Pact: USSR, East Germany, Poland, Czechoslovakia, Hungary, Romania and Bulgaria. Albania withdrew before the covered period. Territorial aliases Greenland/Denmark, Puerto Rico/USA and French Guiana/France inherit their shared ID's classification.

- [NATO membership and accession dates](https://www.nato.int/en/about-us/organization/nato-member-countries)
- [France's membership and command-structure distinction](https://www.diplomatie.gouv.fr/en/the-ministry-in-action/action-for-peace-and-respect-for-human-rights/security-disarmament-and-non-proliferation/our-alliances-and-cooperations/france-and-nato)
- [Greece's continuing treaty membership](https://www.mfa.gr/en/foreign-policy/greece-in-international-organizations/the-north-atlantic-treaty-organization-nato/)
- [Warsaw Pact chronology, US government archive](https://www.govinfo.gov/content/pkg/GOVPUB-PREX3-PURL-gpo15376/pdf/GOVPUB-PREX3-PURL-gpo15376.pdf)

## Date-dependent game classifications

Dates use the game's half-month resolution, not a simulated daily diplomatic history. Some changes represent gradual shifts; the following boundaries are explicit modeling choices anchored to the cited events. These are historical baselines rather than responses to hypothetical alternate-history choices made in the Turkish campaign.

| Country | Display rule |
|---|---|
| Egypt | Soviet-associated until second half of July 1972; neutral transition; American-associated from second half of March 1979 |
| Ethiopia | American-associated before September 1974; neutral transition; Soviet-associated from May 1977 |
| Somalia | Soviet-associated before second half of November 1977; neutral transition; American-associated from second half of August 1980 |
| Iran | American-associated before February 1979; neutral thereafter, never automatically Soviet |
| Nicaragua | American-associated before second half of July 1979; neutral transition; Soviet-associated from second half of May 1980 |
| Afghanistan | Neutral before December 1978; Soviet-associated from the treaty period onward |
| Iraq | Soviet-associated April 1972–first half of September 1980; neutral thereafter because the war complicated its patron relationships |
| Jamaica | Neutral before November 1980; American-associated under Seaga |
| Pakistan | American-associated, with a neutral interval April–December 1979 following the aid rupture |
| British Honduras / Belize | Western-associated before independence in September 1981, neutral thereafter; not separately a NATO member |
| Cape Verde / Portuguese Guinea | Western-associated under Portuguese administration, neutral after independence; not separately NATO members |
| French Territory of the Afars and Issas | Western-associated under French administration, neutral after June 1977; not separately a NATO member |

Sources for major transitions:

- [Egypt's July 1972 expulsion and diplomatic pivot](https://history.state.gov/milestones/1969-1976/arab-israeli-war-1973)
- [Egypt's subsequent US military relationship, Library of Congress country study](https://tile.loc.gov/storage-services/master/frd/frdcstdy/eg/egyptcountrystud00metz/egyptcountrystud00metz.pdf)
- [Ethiopia/Somalia patron reversal](https://history.state.gov/milestones/1977-1980/horn-of-africa)
- [Somalia's November 1977 rupture](https://2009-2017.state.gov/outofdate/bgn/somalia/74252.htm)
- [Somalia's August 1980 US facilities agreement, US Marine Corps country study](https://www.marines.mil/Portals/1/Publications/Somalia%20Study_3.pdf)
- [Iran's revolution chronology](https://www.archives.gov/research/foreign-policy/iran-hostage-crisis)
- [Nicaragua's transition and continued early US engagement](https://history.state.gov/milestones/1977-1980/central-america-carter)
- [May 1980 Soviet–Nicaraguan contacts, Congressional Record](https://www.govinfo.gov/content/pkg/GPO-CRECB-1980-pt9/pdf/GPO-CRECB-1980-pt9-7-2.pdf)
- [Afghanistan's pre-1978 non-alignment and subsequent Soviet involvement](https://history.state.gov/historicaldocuments/frus1977-80v12/preface)
- [Iraq's 1972 Soviet treaty](https://www.reaganlibrary.gov/public/digitallibrary/smof/nsc-europeanandsovietaffairs/matlock/box-037/40-351-7452065-037-005-2018.pdf)
- [Seaga's accession](https://jis.gov.jm/government/past-prime-ministers/edward-phillip-george-seaga/)

## Artwork and rendering

The supplied PNG files are copied unchanged, retaining their alpha channels. Coordinates are image-box coordinates, not opaque-content bounding-box coordinates. The American image is at (0.08D, -0.02D), width 0.43D, rotation -8 degrees. The Soviet image is at (0.67D, 0.03D), width 0.54D, rotation +7 degrees. Rotation pivots are the specified top-left anchors. Source aspect ratios are preserved.

Both Soviet copies use the identical transform. Their complementary SVG clip paths use the existing exact globe mask; the inverse is an even-odd outer path minus that same mask. Stacking: base map, inside artwork, atmosphere, outside artwork, hover layer. All decorative elements and the hover canvas have pointer events disabled. Globe sizing reserves space for the artwork's protrusions while keeping all artwork coordinates relative to D.

The dedicated Cold War theme overrides theme variables only within the overlay. Panel backgrounds use alpha 0.75; no parent opacity is applied. No global light/dark preference changes.
