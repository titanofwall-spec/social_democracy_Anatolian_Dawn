/* Onat's economy equations. January 1972 is month 0.
 * Rates use percentage points (8 means 8%). Shares and indices use ratios.
 * History is chronological and ends at t-1. Each monthly result is a history row.
 */
(function (root) {
  'use strict';

  const defaults = Object.freeze({
    initialFx: 20,
    monthlyFxChange: 1,
    referenceUnemployment: 8,
    marginalPropensityToConsume: 0.74,
    initialInvestmentEfficiency: 1,
    initialCreditAdequacy: 0,
    initialAgriculturalProduction: 1,
    initialIndustrialProduction: 1,
    creditDemandCoefficient: 0.10,
    creditCapacityCoefficient: 0.20
  });

  const clip = (value, min, max) => Math.max(min, Math.min(max, value));
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  const percentChange = (current, previous) => 100 * (current / previous - 1);
  const annualize = (current, previous) => 100 * (Math.pow(current / previous, 12) - 1);

  // Required inputs: savingsRate, cooperativization, cooperativeBank,
  // peoplesSectorIntegration, koykentInvestment, cooperativeUnions,
  // highTechPolicy, stateEnterpriseRestructuring, centralBankRate, lendingSpread,
  // nominalCredit, and moneySupply. The four optional shocks default to zero.
  // At t > 0, initialRealCreditToPotential is the ratio returned by month 0.
  function calculateMonth({ month, history, inputs, initialRealCreditToPotential, parameters = {} }) {
    if (!Number.isInteger(month) || month < 0 || history.length < 24) {
      throw new RangeError('A campaign month and at least 24 preceding monthly rows are required.');
    }
    const settings = { ...defaults, ...parameters };
    const lag = months => history[history.length - months];
    const averageLag = (key, first, last) =>
      mean(history.slice(history.length - last, history.length - first + 1).map(row => row[key]));
    const previous = lag(1);
    const {
      savingsRate, cooperativization, cooperativeBank, peoplesSectorIntegration,
      koykentInvestment, cooperativeUnions, highTechPolicy, stateEnterpriseRestructuring,
      centralBankRate, lendingSpread, nominalCredit, moneySupply,
      fiscalContribution = 0, publicEmployment = 0, outputShock = 0, costShock = 0
    } = inputs;
    const { referenceUnemployment, marginalPropensityToConsume } = settings;

    const averageSavings = averageLag('savingsRate', 12, 23);
    const averageUnemployment = averageLag('unemployment', 13, 24);
    const investmentEfficiency = month === 0 ? settings.initialInvestmentEfficiency :
      1 + 0.02 * (cooperativization - 1) + 0.02 * (cooperativeBank - 1) +
      0.04 * peoplesSectorIntegration;
    const effectiveInvestment = 0.52 * averageSavings;
    const laborFactor = clip(1 - 0.08 * Math.max(0, averageUnemployment - referenceUnemployment) / 100, 0.90, 1);
    const oldFxStress = lag(12).fxStress;
    const investmentFxFactor = 1 - 0.22 * oldFxStress / (1 + oldFxStress);
    const capacityGrowth = 0.60 + 0.28 * effectiveInvestment * lag(12).investmentEfficiency *
      investmentFxFactor * laborFactor;
    const potentialGdp = previous.potentialGdp * Math.pow(1 + capacityGrowth / 100, 1 / 12);

    const fx = inputs.fx ?? settings.initialFx + settings.monthlyFxChange * month;
    const effectiveFx = Math.max(fx, 0.75 * averageLag('fx', 1, 6));
    const fxSeverity = Math.max(0, (effectiveFx - 40) / 60);
    const fxStress = fxSeverity >= previous.fxStress ? fxSeverity :
      previous.fxStress + 0.10 * (fxSeverity - previous.fxStress);
    const averageSectorFx = (fx + 11 * averageLag('fx', 1, 11)) / 12;
    const sectorFxPenalty = Math.pow(Math.max(0, (averageSectorFx - 65) / 35), 2);
    const yearAgo = lag(12);
    const twoYearsAgo = lag(24);
    const agriculturalProduction = month === 0 ? settings.initialAgriculturalProduction :
      previous.agriculturalProduction * Math.exp((
        0.025 * (yearAgo.cooperativization - twoYearsAgo.cooperativization) *
          (1 + 0.10 * (yearAgo.cooperativeBank - 1)) +
        0.015 * (yearAgo.cooperativeBank - twoYearsAgo.cooperativeBank) +
        0.035 * (yearAgo.koykentInvestment - twoYearsAgo.koykentInvestment) +
        0.015 * (yearAgo.cooperativeUnions - twoYearsAgo.cooperativeUnions) -
        0.015 * sectorFxPenalty
      ) / 12);
    const industrialProduction = month === 0 ? settings.initialIndustrialProduction :
      previous.industrialProduction * Math.exp((
        0.060 * (1 + 0.04 * yearAgo.peoplesSectorIntegration) *
          (yearAgo.highTechPolicy - twoYearsAgo.highTechPolicy) +
        0.025 * (yearAgo.stateEnterpriseRestructuring - twoYearsAgo.stateEnterpriseRestructuring) -
        0.050 * sectorFxPenalty
      ) / 12);

    // Only earlier credit adequacy enters this month's demand and capacity.
    const creditDemand = settings.creditDemandCoefficient * (previous.creditAdequacy - lag(13).creditAdequacy);
    const creditCeiling = potentialGdp * Math.exp(
      -settings.creditCapacityCoefficient * Math.max(0, -previous.creditAdequacy) / 100
    );
    const outputCeiling = Math.min(potentialGdp * Math.exp(-0.10 * Math.pow(fxStress, 3)), creditCeiling);
    const lendingRate = Math.min(2 * centralBankRate, 0.50 * previous.lendingRate + 0.50 * (centralBankRate + lendingSpread));
    const expectedInflation = previous.nextExpectedInflation;
    const realLendingRate = lendingRate - expectedInflation;
    const consumptionShare = previous.consumption / previous.realGdp;
    const targetConsumptionGrowth = 5.5 +
      0.45 * marginalPropensityToConsume / consumptionShare * (previous.realGdpGrowth - 5.5) -
      0.08 * Math.max(0, previous.inflation - 12) -
      0.10 * (realLendingRate - 3) -
      0.25 * (savingsRate - yearAgo.savingsRate) -
      1.50 * Math.pow(fxStress / (1 + fxStress), 2);
    const baselineConsumptionGrowth = 0.35 * previous.consumptionGrowth + 0.65 * targetConsumptionGrowth;
    const consumptionGrowth = baselineConsumptionGrowth +
      marginalPropensityToConsume / Math.max(consumptionShare, 0.05) * (fiscalContribution + creditDemand);
    const deflationEffect = 0.50 * Math.min(0, previous.inflation);
    const baselineDemandGrowth = 5.5 + consumptionShare * (baselineConsumptionGrowth - 5.5) +
      0.35 * (capacityGrowth - 5.5) + deflationEffect + creditDemand;
    const demandGrowth = baselineDemandGrowth + fiscalContribution;
    const desiredOutput = previous.realGdp * Math.pow(Math.max(0.05, 1 + demandGrowth / 100), 1 / 12);
    const outputShockMultiplier = Math.exp(outputShock / 100);
    const realGdp = Math.min(desiredOutput, outputCeiling) * outputShockMultiplier;
    const realGdpGrowth = annualize(realGdp, previous.realGdp);
    const desiredConsumption = previous.consumption * Math.pow(1 + consumptionGrowth / 100, 1 / 12);
    const consumption = desiredConsumption * Math.min(1, realGdp / desiredOutput);

    const stableEmploymentGrowth = 5.5 + 0.40 * (capacityGrowth - 5.5);
    const unemploymentAtGrowth = growth => clip(
      previous.unemployment + 0.25 / 12 * (stableEmploymentGrowth - growth) - publicEmployment, 0, 100
    );
    const unemployment = unemploymentAtGrowth(realGdpGrowth);
    const counterfactualGdp = Math.min(desiredOutput, potentialGdp) * outputShockMultiplier;
    const counterfactualGrowth = annualize(counterfactualGdp, previous.counterfactualGdp);
    const counterfactualUnemployment = unemploymentAtGrowth(counterfactualGrowth);

    const unmetDemand = 100 * Math.max(0, (desiredOutput - realGdp) / realGdp);
    const smoothedUnmetDemand = 0.65 * previous.smoothedUnmetDemand + 0.35 * unmetDemand;
    const moneyGrowth = percentChange(moneySupply, yearAgo.moneySupply);
    const circulationPressure = Math.min(18, Math.max(0, expectedInflation - lendingRate));
    const unboundedInflationTrend = expectedInflation +
      0.60 / 12 * (moneyGrowth - counterfactualGrowth - expectedInflation) +
      1.20 / 12 * (referenceUnemployment - counterfactualUnemployment) +
      1.80 / 12 * smoothedUnmetDemand + 0.10 / 12 * circulationPressure;
    const inflationTrend = clip(unboundedInflationTrend, -60, 300);
    const fxPriceShock = 0.20 * (Math.pow(fxStress, 3) - Math.pow(previous.fxStress, 3));
    const cpi = previous.cpi * Math.pow(1 + inflationTrend / 100, 1 / 12) *
      Math.exp(fxPriceShock + costShock / 100);
    const inflation = percentChange(cpi, yearAgo.cpi);
    const nextExpectedInflation = 0.55 * expectedInflation + 0.45 * inflation;

    const realCredit = nominalCredit / cpi;
    const creditRatio = realCredit / potentialGdp;
    const initialCreditRatio = month === 0 ? creditRatio : initialRealCreditToPotential;
    const creditAdequacy = month === 0 ? settings.initialCreditAdequacy :
      100 * Math.log(creditRatio / initialCreditRatio);
    const agriculturalPriceFactor =
      Math.pow((moneySupply / (cpi * realGdp)) / (previous.moneySupply / (previous.cpi * previous.realGdp)), 0.35) *
      Math.pow((consumption / realGdp) / consumptionShare, 0.25) *
      Math.pow(previous.agriculturalProduction / agriculturalProduction, 0.65);
    const realAgriculturalPrice = previous.realAgriculturalPrice * agriculturalPriceFactor;
    const nominalAgriculturalPrice = previous.nominalAgriculturalPrice *
      (cpi / previous.cpi) * agriculturalPriceFactor;

    const result = {
      month, savingsRate, cooperativization, cooperativeBank, peoplesSectorIntegration,
      koykentInvestment, cooperativeUnions, highTechPolicy, stateEnterpriseRestructuring,
      averageSavings, averageUnemployment, investmentEfficiency, effectiveInvestment, laborFactor,
      investmentFxFactor, capacityGrowth, potentialGdp, fx, effectiveFx, fxSeverity, fxStress, averageSectorFx,
      agriculturalProduction, industrialProduction, creditDemand, creditCeiling, outputCeiling,
      centralBankRate, lendingRate, expectedInflation, realLendingRate, consumptionShare,
      targetConsumptionGrowth, baselineConsumptionGrowth, consumptionGrowth, deflationEffect,
      baselineDemandGrowth, demandGrowth, desiredOutput, realGdp, realGdpGrowth, desiredConsumption, consumption,
      stableEmploymentGrowth, unemployment, counterfactualGdp, counterfactualGrowth, counterfactualUnemployment,
      unmetDemand, smoothedUnmetDemand, moneySupply, moneyGrowth, circulationPressure, unboundedInflationTrend,
      inflationTrend, fxPriceShock, cpi, inflation, nextExpectedInflation, nominalCredit, realCredit,
      initialRealCreditToPotential: initialCreditRatio, creditAdequacy, realAgriculturalPrice, nominalAgriculturalPrice
    };
    for (const [key, value] of Object.entries(result)) {
      if (!Number.isFinite(value)) throw new RangeError('Invalid economy value for ' + key + ' in month ' + month + '.');
    }
    return result;
  }

  function calculateCalendarYear(currentYear, previousYear) {
    if (currentYear.length !== 12 || previousYear.length !== 12) {
      throw new RangeError('Calendar-year comparisons require twelve monthly rows for each year.');
    }
    const averageRealGdp = mean(currentYear.map(row => row.realGdp));
    const averageCpi = mean(currentYear.map(row => row.cpi));
    return {
      averageRealGdp,
      averageCpi,
      realGdpGrowth: percentChange(averageRealGdp, mean(previousYear.map(row => row.realGdp))),
      inflation: percentChange(averageCpi, mean(previousYear.map(row => row.cpi))),
      unemployment: mean(currentYear.map(row => row.unemployment))
    };
  }

  const economy = Object.freeze({ defaults, calculateMonth, calculateCalendarYear });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = economy;
  } else {
    root.AnatolianEconomy = economy;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
