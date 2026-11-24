/* Baseline inputs for Onat's model. Rates are percentages and the spread is
 * in percentage points. Keep the campaign defaults in this file.
 */
(function (root) {
  'use strict';

  // Annual benchmarks are references; new campaigns use the monthly pre-game history below.
  const historical = Object.freeze({
    inflation: Object.freeze({ 1972: 23.40, 1973: 15.8, 1974: 15.4, 1975: 19.0, 1976: 16.4, 1977: 22.5, 1978: 53.3, 1979: 62.0 }),
    realGdpGrowth: Object.freeze({ 1972: 9.54, 1973: 4.9, 1974: 3.3, 1975: 6.1, 1976: 9.0, 1977: 3.0, 1978: 1.2, 1979: -0.5 }),
    unemployment: Object.freeze({ 1972: 6.8, 1973: 6.5, 1974: 8.0, 1975: 7.5, 1976: 8.5, 1977: 9.7, 1978: 10.1, 1979: 8.9 }),
    industrialProduction: Object.freeze({ 1972: 100, 1973: 110, 1974: 120, 1975: 132, 1976: 145, 1977: 158, 1978: 150, 1979: 142 }),
    agriculturalProduction: Object.freeze({ 1972: 100, 1973: 102, 1974: 105, 1975: 108, 1976: 111, 1977: 113, 1978: 115, 1979: 117 })
  });

  // Source: Onat, Umut_için_liste.xlsx, Sheet 1!A2:Q25.
  // Months -24 through -1 are January 1970 through December 1971.
  // Monetary amounts are in billions of TL. Preserve the workbook precision.
  const pregameHistory = Object.freeze([
    { month: -24, cpi: 0.7475246901623261, inflation: 6.488001916625152, expectedInflation: 5.940597686084281,
      moneySupply: 54.9333258031277, nominalCredit: 30.470577846307386, realGdp: 121.15632699033976,
      consumption: 84.08339696438989, potentialGdp: 132.77002779232436, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 11.686480046916017, nextExpectedInflation: 6.186929589827674 },
    { month: -23, cpi: 0.7514851159736592, inflation: 6.751056319315141, expectedInflation: 6.186929589827674,
      moneySupply: 54.6220888297389, nominalCredit: 30.75885752154641, realGdp: 121.6245468056854,
      consumption: 84.40583534054058, potentialGdp: 133.13063680748647, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 11.828481672105475, nextExpectedInflation: 6.440786618097034 },
    { month: -22, cpi: 0.7524751932894319, inflation: 6.891700221702468, expectedInflation: 6.440786618097034,
      moneySupply: 53.6883779095724, nominalCredit: 31.04986458750232, realGdp: 122.09457609975101,
      consumption: 84.72951018560391, potentialGdp: 133.49222525199707, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 12.36722740646878, nextExpectedInflation: 6.64369773971948 },
    { month: -21, cpi: 0.7539603675372121, inflation: 6.8022526414186935, expectedInflation: 6.64369773971948,
      moneySupply: 53.9996148829612, nominalCredit: 31.343624847798324, realGdp: 122.56642186543426,
      consumption: 85.05442624112267, potentialGdp: 133.8547957860277, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 12.840458519252667, nextExpectedInflation: 6.715047445484126 },
    { month: -20, cpi: 0.7584157737323106, inflation: 6.61098979306467, expectedInflation: 6.715047445484126,
      moneySupply: 53.843996396266796, nominalCredit: 31.64016435018365, realGdp: 123.04009112265747,
      consumption: 85.38058826682234, potentialGdp: 134.21835107697504, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 12.921672390381966, nextExpectedInflation: 6.6682215018953706 },
    { month: -19, cpi: 0.7663366253549768, inflation: 7.72442896553962, expectedInflation: 6.6682215018953706,
      moneySupply: 53.2215224494891, nominalCredit: 31.93950938884315, realGdp: 123.5155909184721,
      consumption: 85.70800104068071, potentialGdp: 134.5828937994806, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 12.55310258861472, nextExpectedInflation: 7.143514860535284 },
    { month: -18, cpi: 0.7633663934076584, inflation: 7.606425772749903, expectedInflation: 7.143514860535284,
      moneySupply: 54.31085185635, nominalCredit: 32.24168650672887, realGdp: 123.99292832716364,
      consumption: 86.03666935899784, potentialGdp: 134.94842663545026, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 13.61185251526538, nextExpectedInflation: 7.351824771031863 },
    { month: -17, cpi: 0.769306973850537, inflation: 7.841793392052399, expectedInflation: 7.351824771031863,
      moneySupply: 55.7114182365997, nominalCredit: 32.54672249791355, realGdp: 124.47211045035671,
      consumption: 86.36659803646646, potentialGdp: 135.3149522740741, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 7.5, lendingRate: 10.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 13.507065107737889, nextExpectedInflation: 7.572310650491104 },
    { month: -16, cpi: 0.776732611992954, inflation: 9.185799448244559, expectedInflation: 7.572310650491104,
      moneySupply: 57.5788400769327, nominalCredit: 32.854644409966504, realGdp: 124.95314441712092,
      consumption: 86.6977919062423, potentialGdp: 135.68247341184616, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 13.216864871343278, nextExpectedInflation: 8.298380609480159 },
    { month: -15, cpi: 0.7915841213742716, inflation: 9.520540722014047, expectedInflation: 8.298380609480159,
      moneySupply: 61.0024467842098, nominalCredit: 33.1654795463519, realGdp: 125.43603738407678,
      consumption: 87.03025582001517, potentialGdp: 136.05099275258428, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 11.993274097440022, nextExpectedInflation: 8.848352660120408 },
    { month: -14, cpi: 0.8024752049442562, inflation: 10.197146094184761, expectedInflation: 8.848352660120408,
      moneySupply: 61.9361577043763, nominalCredit: 33.479255468849786, realGdp: 125.92079653550222,
      consumption: 87.36399464807977, potentialGdp: 136.42051300744993, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 11.29720227948957, nextExpectedInflation: 9.455309705449368 },
    { month: -13, cpi: 0.8103960565669223, inflation: 9.279048181534977, expectedInflation: 9.455309705449368,
      moneySupply: 67.6940417120695, nominalCredit: 33.796, realGdp: 126.40742908343947,
      consumption: 87.69901327940713, potentialGdp: 136.79103689496824, savingsRate: 18.579625507932942,
      unemployment: 6.4, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.308381734764959, creditAdequacy: 10.98539776212978, nextExpectedInflation: 9.375992019687892 },
    { month: -12, cpi: 0.8193068689571193, inflation: 9.602649884274129, expectedInflation: 9.375992019687892,
      moneySupply: 66.4490938185142, nominalCredit: 34.17239898376555, realGdp: 129.98518142657386,
      consumption: 90.9203939580424, potentialGdp: 137.16253774479975, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.308116046364132, creditAdequacy: 10.7282035914428, nextExpectedInflation: 9.477988058751698 },
    { month: -11, cpi: 0.8391088814655429, inflation: 11.6600799708926, expectedInflation: 9.477988058751698,
      moneySupply: 66.9159492785975, nominalCredit: 34.55299006703931, realGdp: 130.9764231589839,
      consumption: 91.7283062631622, potentialGdp: 137.53501805067563, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3078503579633054, creditAdequacy: 9.176415039466708, nextExpectedInflation: 10.459929419215104 },
    { month: -10, cpi: 0.8470297330882091, inflation: 12.565801589476155, expectedInflation: 10.459929419215104,
      moneySupply: 66.4490938185142, nominalCredit: 34.937819938837585, realGdp: 131.97522390820868,
      consumption: 92.5433976209054, potentialGdp: 137.90848031246816, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3075846695624778, creditAdequacy: 9.073292677773619, nextExpectedInflation: 11.407571895832579 },
    { month: -9, cpi: 0.8658415517326178, inflation: 14.839133330159271, expectedInflation: 11.407571895832579,
      moneySupply: 68.7833711189304, nominalCredit: 35.32693580817011, realGdp: 132.98164131784142,
      consumption: 93.3657318238349, potentialGdp: 138.28292703620525, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.307318981161652, creditAdequacy: 7.71311140623879, nextExpectedInflation: 12.95177454127959 },
    { month: -8, cpi: 0.8737622868070419, inflation: 15.208875800023103, expectedInflation: 12.95177454127959,
      moneySupply: 68.62775263223601, nominalCredit: 35.72038540983143, realGdp: 133.99573347105417,
      consumption: 94.19537323136996, potentialGdp: 138.65836073408497, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3070532927608243, creditAdequacy: 7.638921433771315, nextExpectedInflation: 13.967470107714172 },
    { month: -7, cpi: 0.889108893120367, inflation: 16.020670773567748, expectedInflation: 13.967470107714172,
      moneySupply: 70.02831901248571, nominalCredit: 36.11821701025675, realGdp: 135.01755889395,
      consumption: 95.0323867748231, potentialGdp: 139.03478392449, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3067876043599975, creditAdequacy: 6.734259652155364, nextExpectedInflation: 14.891410407348282 },
    { month: -6, cpi: 0.9381188274594184, inflation: 22.892340501350496, expectedInflation: 14.891410407348282,
      moneySupply: 74.3856366399293, nominalCredit: 36.52047941344305, realGdp: 136.04717655894066,
      consumption: 95.87683796248197, potentialGdp: 139.41219913200254, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3065219159591708, creditAdequacy: 2.2050649637036677, nextExpectedInflation: 18.49182894964928 },
    { month: -5, cpi: 0.9623762461629405, inflation: 25.096519188699485, expectedInflation: 18.49182894964928,
      moneySupply: 75.786203020179, nominalCredit: 36.927221966936074, realGdp: 137.08464588814996,
      consumption: 96.72879288473642, potentialGdp: 139.79060888741873, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.306256227558344, creditAdequacy: 0.4886962549504366, nextExpectedInflation: 21.46393955722187 },
    { month: -4, cpi: 0.9737624266649324, inflation: 25.366491844141304, expectedInflation: 21.46393955722187,
      moneySupply: 77.6536248605119, nominalCredit: 37.338494567884105, realGdp: 138.1300267568434,
      consumption: 97.58831821925078, potentialGdp: 140.17001572776348, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3059905391575173, creditAdequacy: 0.14904732725901684, nextExpectedInflation: 23.220088086335615 },
    { month: -3, cpi: 0.9915841679935684, inflation: 25.265798191110257, expectedInflation: 23.220088086335615,
      moneySupply: 82.0109424879555, nominalCredit: 37.75434766915902, realGdp: 139.18337949688356,
      consumption: 98.45548123618252, potentialGdp: 140.5504221963051, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.30572485075669, creditAdequacy: -0.8280400550511463, nextExpectedInflation: 24.140657633484203 },
    { month: -2, cpi: 1.0014850576995382, inflation: 24.79950178262593, expectedInflation: 24.140657633484203,
      moneySupply: 82.0109424879555, nominalCredit: 38.17483228554564, realGdp: 140.24476490021203,
      consumption: 99.33034980344709, potentialGdp: 140.93183084257015, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3054591623558633, creditAdequacy: -0.9849986063780239, nextExpectedInflation: 24.437137500597984 },
    { month: -1, cpi: 1.0, inflation: 23.39645435051796, expectedInflation: 24.437137500597984,
      moneySupply: 86.99073406217671, nominalCredit: 38.6, realGdp: 141.31424422235813,
      consumption: 100.2129923920295, potentialGdp: 141.31424422235813, savingsRate: 17.89351996500656,
      unemployment: 6.8, centralBankRate: 9.0, lendingRate: 11.5,
      capacityGrowth: 3.3051934739550366, creditAdequacy: 0.0, nextExpectedInflation: 23.968830083061974 },
  ].map(row => Object.freeze(row)));
  // Uploaded workbook anchors are 31 December 1971 (t=0); engine month 0 is January.
  const starting = Object.freeze({
    "source": "Turkiye_1972_Baslangic_Degiskenleri_Umut_Stili.xlsx; sheet Tum Baslangic Degerleri; domestic money in billion TL; USD amounts converted from million to billion",
    "investment": 23.988160248085684,
    "government": 19.95799698131127,
    "absorption": 144.15914962142645,
    "exports": 9.576725051229309,
    "realImports": 12.42163045029764,
    "exportDollars": 0.07844284605420858,
    "exportCash": 0.06789172322316356,
    "plannedImportDollars": 0.101745433845351,
    "importForecastGrowth": 0.04077855722999281,
    "importCover": 5.816849208430511,
    "nominalAgriculturalPrice": 1.03,
    "realAgriculturalPrice": 1.03,
    "initialEffectiveInvestment": 10.93932894601649,
    "governmentMeans": {
        "1970": 15.524411122651278,
        "1971": 18.45852482483237
    },
    "governmentGrowth": {
        "1970": 6.5,
        "1971": 18.9
    },
    "annualExportCash": {
        "1970": 0.5885,
        "1971": 0.6766
    },
    "initialDebtLimit": 2.40996,
    "initialAnnualRealInterest": -3.815268914088605,
    "initialAnnualGdp": 135.578,
    "initialAnnualCpi": 0.9167904117626081
});
  const lastPregameMonth = pregameHistory.at(-1);
  const previousPregameMonth = pregameHistory.at(-2);

  const settings = Object.freeze({
    savingsRate: lastPregameMonth.savingsRate,
    annualMoneySupplyGrowth: 28.51,
    // Monetary amounts are in billions of TL; consumption share is a ratio.
    initialNominalCredit: lastPregameMonth.nominalCredit,
    centralBankRate: lastPregameMonth.centralBankRate,
    lendingSpread: lastPregameMonth.lendingRate - lastPregameMonth.centralBankRate,
    initialRealGdp: lastPregameMonth.realGdp,
    // Historical reference; the equations do not take nominal GDP as a separate input.
    initialNominalGdp: 229.07,
    initialCpi: lastPregameMonth.cpi,
    initialMoneySupply: lastPregameMonth.moneySupply,
    initialConsumptionShare: lastPregameMonth.consumption / lastPregameMonth.realGdp,
    initialGrowth: 100 * (Math.pow(lastPregameMonth.realGdp / previousPregameMonth.realGdp, 12) - 1),
    initialInflation: lastPregameMonth.inflation,
    initialUnemployment: lastPregameMonth.unemployment,
    // Compatibility conversions for the balance of existing policy cards.
    agriculturalInvestmentPerModifier: 0.01 / 0.035,
    industrialRestructuringPerModifier: 0.01 / 0.025,
    agriculturalDemandPerConsumptionPoint: 0.1,
    fxPolicyDriftMultiplier: 1.5
  });

  const initialLendingRate = settings.centralBankRate + settings.lendingSpread;

  // Monthly M2 evolves from the campaign's initial level at the configured annual rate.
  function moneySupplyForMonth(month, initialMoneySupply, annualGrowth = settings.annualMoneySupplyGrowth) {
    return initialMoneySupply * Math.pow(1 + annualGrowth / 100, month / 12);
  }

  // Credit for month t uses nominal potential GDP growth from t-2 to t-1.
  // The previous row is also the source of the credit level to carry forward.
  function nominalCreditForMonth(month, previous, twoMonthsAgo) {
    if (month === 0) return settings.initialNominalCredit;
    const previousNominalPotential = previous.cpi * previous.potentialGdp;
    const olderNominalPotential = twoMonthsAgo.cpi * twoMonthsAgo.potentialGdp;
    return previous.nominalCredit * previousNominalPotential / olderNominalPotential;
  }

  const baseline = Object.freeze({
    historical, pregameHistory, starting, settings, initialLendingRate, moneySupplyForMonth, nominalCreditForMonth
  });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = baseline;
  } else {
    root.AnatolianEconomyBaseline = baseline;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
