/* Baseline inputs for Onat's model. Rates are percentages and the spread is
 * in percentage points. Keep the campaign defaults in this file.
 */
(function (root) {
  'use strict';

  // Original annual benchmarks. Only the 1972 starting values seed the model.
  const historical = Object.freeze({
    inflation: Object.freeze({ 1972: 15.3, 1973: 15.8, 1974: 15.4, 1975: 19.0, 1976: 16.4, 1977: 22.5, 1978: 53.3, 1979: 62.0 }),
    realGdpGrowth: Object.freeze({ 1972: 9.2, 1973: 4.9, 1974: 3.3, 1975: 6.1, 1976: 9.0, 1977: 3.0, 1978: 1.2, 1979: -0.5 }),
    unemployment: Object.freeze({ 1972: 4.6, 1973: 6.5, 1974: 8.0, 1975: 7.5, 1976: 8.5, 1977: 9.7, 1978: 10.1, 1979: 8.9 }),
    industrialProduction: Object.freeze({ 1972: 100, 1973: 110, 1974: 120, 1975: 132, 1976: 145, 1977: 158, 1978: 150, 1979: 142 }),
    agriculturalProduction: Object.freeze({ 1972: 100, 1973: 102, 1974: 105, 1975: 108, 1976: 111, 1977: 113, 1978: 115, 1979: 117 })
  });

  const settings = Object.freeze({
    savingsRate: 20,
    annualMoneySupplyGrowth: 24.5,
    initialNominalCredit: 100,
    centralBankRate: 15.3,
    lendingSpread: 3,
    initialRealGdp: 100,
    initialCpi: 1,
    initialMoneySupply: 100,
    initialConsumptionShare: 0.75,
    initialGrowth: historical.realGdpGrowth[1972],
    initialInflation: historical.inflation[1972],
    initialUnemployment: historical.unemployment[1972],
    // Compatibility conversions for the balance of existing policy cards.
    agriculturalInvestmentPerModifier: 0.01 / 0.035,
    industrialRestructuringPerModifier: 0.01 / 0.025,
    agriculturalDemandPerConsumptionPoint: 0.1,
    fxPolicyDriftMultiplier: 1.5
  });

  const initialLendingRate = settings.centralBankRate + settings.lendingSpread;

  // January 1972's nominal M2 level comes from the campaign's starting data.
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
    historical, settings, initialLendingRate, moneySupplyForMonth, nominalCreditForMonth
  });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = baseline;
  } else {
    root.AnatolianEconomyBaseline = baseline;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
