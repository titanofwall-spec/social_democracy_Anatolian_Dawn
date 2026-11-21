/* Baseline inputs for Onat's model. Rates are percentages and the spread is
 * in percentage points. Keep the campaign defaults in this file.
 */
(function (root) {
  'use strict';

  const settings = Object.freeze({
    savingsRate: 20,
    annualMoneySupplyGrowth: 24.5,
    initialNominalCredit: 100,
    centralBankRate: 15.3,
    lendingSpread: 3
  });

  const initialLendingRate = settings.centralBankRate + settings.lendingSpread;

  // January 1972's nominal M2 level comes from the campaign's starting data.
  function moneySupplyForMonth(month, initialMoneySupply) {
    return initialMoneySupply * Math.pow(1 + settings.annualMoneySupplyGrowth / 100, month / 12);
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
    settings, initialLendingRate, moneySupplyForMonth, nominalCreditForMonth
  });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = baseline;
  } else {
    root.AnatolianEconomyBaseline = baseline;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
