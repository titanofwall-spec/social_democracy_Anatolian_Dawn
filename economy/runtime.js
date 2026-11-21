(function (root) {
  'use strict';

  const equations = typeof module !== 'undefined' && module.exports
    ? require('./economy-equations.js') : root.AnatolianEconomy;
  const baseline = typeof module !== 'undefined' && module.exports
    ? require('./economy-baseline.js') : root.AnatolianEconomyBaseline;
  const { settings } = baseline;
  const number = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const positive = (value, fallback) => value > 0 && Number.isFinite(value) ? value : fallback;
  const monthOf = Q => (Q.year - 1972) * 12 + Q.month - 1;
  const decay = (value, negative, positive) => value * Math.pow(value < 0 ? negative : positive, 1 / 12);

  function sectors(Q) {
    return {
      cooperativization: 1 + Math.min(3, Math.max(0, number(Q.cooperative_done))),
      cooperativeBank: Q.cooperative_bank_founded ? 2 + Math.min(2, Math.floor(Math.max(0, number(Q.ps_bank_funding)) / 2)) : 1,
      peoplesSectorIntegration: Q.peoples_sector_integrated ? 1 : 0,
      cooperativeUnions: Q.cooperative_umbrella_established ? 1 : 0,
      highTechPolicy: Q.electronicc ? 1 : 0,
      koykentInvestment: number(Q.koykent_progress) +
        number(Q.agriculture_modifier) * settings.agriculturalInvestmentPerModifier,
      stateEnterpriseRestructuring: number(Q.onat_kit_restructuring) +
        (number(Q.industry_modifier) - 3 * number(Q.onat_kit_restructuring)) * settings.industrialRestructuringPerModifier
    };
  }

  function initialHistory() {
    const neutralSectors = sectors({});
    return baseline.pregameHistory.map((source, index, history) => {
      // GDP and consumption growth are annualized from adjacent observed levels.
      // The first row has no earlier observation; its unused growth rates use the next pair.
      const earlier = history[index - 1] || source;
      const later = index === 0 ? history[1] : source;
      const growth = key => 100 * (Math.pow(later[key] / earlier[key], 12) - 1);
      return {
        ...neutralSectors,
        ...source,
        realGdpGrowth: growth('realGdp'),
        consumptionGrowth: growth('consumption'),
        // These series are absent from the workbook; retain neutral pre-game assumptions.
        fx: equations.defaults.initialFx, fxStress: 0,
        investmentEfficiency: equations.defaults.initialInvestmentEfficiency,
        unmetDemand: 0, smoothedUnmetDemand: 0,
        counterfactualGdp: source.realGdp,
        agriculturalProduction: equations.defaults.initialAgriculturalProduction,
        industrialProduction: equations.defaults.initialIndustrialProduction,
        realAgriculturalPrice: 1, nominalAgriculturalPrice: source.cpi,
        realCredit: source.nominalCredit / source.cpi
      };
    });
  }

  function initialize(Q, month) {
    if (month === 0) {
      const history = initialHistory();
      const previous = history.at(-1);
      return {
        version: 3, lastMonth: -1, history,
        initialMoneySupply: settings.initialMoneySupply,
        lastPublishedFx: number(Q.forex_pressure, equations.defaults.initialFx), pendingFx: 0,
        lastEmploymentModifier: 0,
        initialRealCreditToPotential: previous.nominalCredit / (previous.cpi * previous.potentialGdp)
      };
    }
    // Legacy saves without monthly history still migrate from their saved economy.
    const old = Q.macro_model || {};
    const migrating = month > 0;
    const growth = migrating ? number(old.growth, number(Q.economic_growth, settings.initialGrowth)) : settings.initialGrowth;
    const inflation = migrating ? number(old.inflation, number(Q.inflation, settings.initialInflation)) : settings.initialInflation;
    const unemployment = migrating ? number(old.unemployment, number(Q.unemployed, settings.initialUnemployment)) : settings.initialUnemployment;
    const gdp = positive(old.y, settings.initialRealGdp);
    const potential = positive(old.potential, gdp);
    const consumption = positive(old.consumption, gdp * settings.initialConsumptionShare);
    const cpi = positive(old.price, settings.initialCpi);
    const money = positive(old.m2, settings.initialMoneySupply);
    const agriculturalPrice = 1; // Legacy saves held a consumption/production ratio here.
    const fx = migrating ? number(Q.forex_pressure, equations.defaults.initialFx) : equations.defaults.initialFx;
    const fxStress = migrating ? Math.max(0, (fx - 40) / 60) : 0;
    const annualGrowth = Math.max(0.05, 1 + growth / 100);
    const annualInflation = Math.max(0.05, 1 + inflation / 100);
    const levels = sectors(migrating ? Q : {});
    const history = Array.from({ length: 24 }, (_, i) => {
      const offset = i - (migrating ? 23 : 24);
      const time = offset / 12;
      const rowCpi = cpi * Math.pow(annualInflation, time);
      const rowGdp = gdp * Math.pow(annualGrowth, time);
      return {
        ...levels,
        month: month + offset,
        savingsRate: number(Q.macro_savings_rate, settings.savingsRate),
        unemployment, inflation, realGdpGrowth: growth, consumptionGrowth: growth,
        fx, fxStress, investmentEfficiency: 1, creditAdequacy: 0,
        lendingRate: baseline.initialLendingRate, centralBankRate: settings.centralBankRate,
        nextExpectedInflation: inflation, unmetDemand: 0, smoothedUnmetDemand: 0,
        realGdp: rowGdp, counterfactualGdp: rowGdp,
        potentialGdp: potential * Math.pow(annualGrowth, time),
        consumption: consumption * Math.pow(annualGrowth, time),
        cpi: rowCpi,
        moneySupply: baseline.moneySupplyForMonth(offset, money),
        nominalCredit: settings.initialNominalCredit,
        agriculturalProduction: migrating ? positive(old.agriculture, positive(Q.agricultural_production_index, 100)) / 100 : 1,
        industrialProduction: migrating ? positive(old.industry, positive(Q.industrial_production_index, 100)) / 100 : 1,
        realAgriculturalPrice: agriculturalPrice,
        nominalAgriculturalPrice: agriculturalPrice * rowCpi
      };
    });
    return {
      version: 3, lastMonth: migrating ? month : -1, history,
      initialMoneySupply: money, lastPublishedFx: number(Q.forex_pressure, fx), pendingFx: 0,
      lastEmploymentModifier: migrating ? number(Q.unemployment_modifier) : 0,
      initialRealCreditToPotential: settings.initialNominalCredit / (cpi * potential)
    };
  }

  function ensure(Q) {
    const month = monthOf(Q);
    if (!Number.isInteger(month) || month < 0 || !Q.started) return null;
    // Preserve the complete played history in existing version 3 saves.
    if (Q.macro_model?.version !== 3) Q.macro_model = initialize(Q, month);
    return Q.macro_model;
  }

  // Existing choices and historical effects write their FX change here. Keep
  // the published indicator monthly, while retaining the queued change.
  function captureFx(Q, model) {
    const value = number(Q.forex_pressure, model.lastPublishedFx);
    model.pendingFx = Math.max(-model.history.at(-1).fx, model.pendingFx + value - model.lastPublishedFx);
    model.lastPublishedFx = value;
  }

  function publish(Q, model) {
    const row = model.history.at(-1);
    Q.inflation = row.inflation;
    Q.economic_growth = row.realGdpGrowth;
    Q.unemployed = row.unemployment;
    Q.forex_pressure = model.lastPublishedFx = Math.max(0, row.fx + model.pendingFx);
    Q.central_bank_interest_rate = row.centralBankRate;
    Q.industrial_production_index = row.industrialProduction;
    Q.agricultural_production_index = row.agriculturalProduction;
    Q.agricultural_product_prices = row.realAgriculturalPrice;
  }

  function step(Q) {
    const model = ensure(Q);
    if (!model) return null;
    captureFx(Q, model);
    const target = monthOf(Q);
    for (let month = model.lastMonth + 1; month <= target; month++) {
      const [previous, older] = [model.history.at(-1), model.history.at(-2)];
      const year = 1972 + Math.floor(month / 12);
      const tiger = year >= 1978 && year <= 1980 &&
        (number(Q.Tiger) >= 2 || Q['tiger_' + year + '_effect_applied']);
      const employmentModifier = number(Q.unemployment_modifier);
      // Policy amounts remain authored with the choices. Translate their units
      // here once, before handing the inputs to Onat's monthly equations.
      const policyFxDrift = settings.fxPolicyDriftMultiplier * (number(Q.forex_pressure_drift, 2) - 2) / 12;
      const fx = month === 0 ? equations.defaults.initialFx :
        Math.max(0, previous.fx + equations.defaults.monthlyFxChange + policyFxDrift +
          model.pendingFx - number(Q.forex_pressure_delayed_reduction) / 12);
      const annualMoneyGrowth = number(Q.macro_m2_growth, settings.annualMoneySupplyGrowth);
      const moneySupply = positive(Q.macro_m2_level, month === 0 ? model.initialMoneySupply :
        baseline.moneySupplyForMonth(1, previous.moneySupply, annualMoneyGrowth));
      const row = equations.calculateMonth({
        month,
        history: model.history,
        initialRealCreditToPotential: model.initialRealCreditToPotential,
        inputs: {
          ...sectors(Q),
          fx, moneySupply,
          savingsRate: number(Q.macro_savings_rate, settings.savingsRate),
          centralBankRate: settings.centralBankRate,
          lendingSpread: settings.lendingSpread,
          nominalCredit: baseline.nominalCreditForMonth(month, previous, older),
          fiscalContribution: number(Q.macro_fiscal_impulse, number(Q.growth_modifier)) +
            settings.agriculturalDemandPerConsumptionPoint * (number(Q.agricultural_consumption, 100) - 100) +
            (tiger ? 3 : 0),
          publicEmployment: number(Q.macro_public_employment) + model.lastEmploymentModifier - employmentModifier,
          outputShock: number(Q.macro_output_shock),
          costShock: number(Q.macro_price_shock) +
            (number(Q.inflation_modifier) - number(Q.oil_inflation_effect) - (tiger ? 30 : 0)) / 12
        }
      });
      model.history.push(row);
      if (month % 12 === 11) {
        model.lastCalendarYear = equations.calculateCalendarYear(model.history.slice(-12), model.history.slice(-24, -12));
      }
      if (model.history.length > 24) model.history.shift();
      model.initialRealCreditToPotential = row.initialRealCreditToPotential;
      model.lastMonth = month;
      model.lastEmploymentModifier = employmentModifier;
      Q.last_economy_month = Q.year * 12 + Q.month;
      if (month > 0) {
        model.pendingFx = 0;
        Q.forex_pressure_delayed_reduction = 0;
        const sanctions = Q.cyprus_economic_sanctions_active ? -0.5 : 0;
        Q.inflation_modifier = decay(number(Q.inflation_modifier), 0.5, 0.9);
        Q.growth_modifier = sanctions + decay(number(Q.growth_modifier) - sanctions, 0.95, 0.8);
        Q.unemployment_modifier = decay(employmentModifier, 0.7, 0.9);
      }
      delete Q.macro_m2_level;
    }
    publish(Q, model);
    return model;
  }

  function headlines(Q) {
    const model = ensure(Q);
    if (!model) return false;
    if (model.lastMonth < 0) step(Q);
    else {
      captureFx(Q, model);
      publish(Q, model);
    }
    return true;
  }

  const api = { ensure, step, headlines };
  root.AnatolianMacro = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
