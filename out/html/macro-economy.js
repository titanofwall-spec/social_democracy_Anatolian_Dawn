// Onat's monthly macroeconomic model. One step per completed calendar month.
// State is kept in Q.macro_model so it survives Dendry saves.
(function (root) {
  'use strict';
  const num = (value, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const clip = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  const avg = values => values.reduce((sum, x) => sum + x, 0) / values.length;
  const positive = (value, fallback = 1) => Math.max(1e-9, num(value, fallback));
  const annualized = (current, previous) => 100 * (Math.pow(positive(current) / positive(previous), 12) - 1);
  const monthId = Q => num(Q.year, 1972) * 12 + num(Q.month, 1);
  const historyPush = (arr, value, maxLength) => { arr.push(value); while (arr.length > maxLength) arr.shift(); };
  function ensure(Q) {
    if (Q.macro_model && Q.macro_model.version === 1) return Q.macro_model;
    const inflation = num(Q.inflation, num(Q.base_inflation, 15.3));
    const growth = num(Q.economic_growth, num(Q.base_growth, 5.5));
    const unemployment = num(Q.unemployed, num(Q.base_unemployment, 8));
    const forex = clip(num(Q.forex_pressure, 20), 0, 100);
    const q = Math.max(0, (forex - 40) / 60);
    const initialY = positive(Q.macro_initial_gdp, 100);
    const initialP = positive(Q.macro_initial_cpi, 100);
    const M2growth = num(Q.macro_m2_growth, inflation + growth);
    const M2 = positive(Q.macro_initial_m2, 100);
    Q.macro_model = {
      version: 1, lastMonth: monthId(Q), y: initialY, potential: initialY, consumption: initialY * 0.75,
      price: initialP, m2: M2, unemployment, expectation: inflation,
      priorGrowth: growth, priorConsumptionGrowth: growth, priorCounterfactualGDP: initialY,
      hBar: 0, lastUnemploymentModifier: num(Q.unemployment_modifier),
      savingsHistory: Array(24).fill(num(Q.macro_savings_rate, 20)),
      unemploymentHistory: Array(24).fill(unemployment),
      efficiencyHistory: Array(12).fill(1), qHistory: Array(12).fill(q),
      forexHistory: Array(6).fill(forex),
      priceHistory: Array.from({length: 12}, (_, i) => initialP / Math.pow(Math.max(0.1, 1 + inflation / 100), (12 - i) / 12)),
      m2History: Array.from({length: 12}, (_, i) => M2 / Math.pow(Math.max(0.1, 1 + M2growth / 100), (12 - i) / 12)),
      annualHistory: [], inflation, growth, q, demandGap: 0
    };
    return Q.macro_model;
  }
  function step(Q) {
    const s = ensure(Q), currentMonth = monthId(Q);
    if (currentMonth <= s.lastMonth) return s;
    // Standard game flow advances one calendar month; catch up conservatively if a save jumped.
    while (s.lastMonth < currentMonth) {
      const savings = num(Q.macro_savings_rate, 20);
      const K = num(Q.macro_investment_K, 1), policyQ = num(Q.macro_investment_Q, 1);
      const policyP = num(Q.macro_investment_P, 0);
      const E = 1 + 0.02 * (K - 1) + 0.02 * (policyQ - 1) + 0.04 * policyP;
      const delayedSavings = avg(s.savingsHistory.slice(1, 13));
      const delayedUnemployment = avg(s.unemploymentHistory.slice(0, 12));
      const L = clip(1 - 0.08 * Math.max(0, delayedUnemployment - 8) / 100, 0.9, 1);
      const qOld12 = s.qHistory[0], investmentFX = 1 - 0.22 * qOld12 / (1 + qOld12);
      const investment = 0.52 * delayedSavings;
      const capacityGrowth = 0.60 + 0.28 * investment * s.efficiencyHistory[0] * investmentFX * L;
      s.potential *= Math.pow(Math.max(0.05, 1 + capacityGrowth / 100), 1 / 12);
      // FX_t is the game's actual 0–100 forex_pressure, not the paper's linear stress-test input.
      const fx = clip(num(Q.forex_pressure, 20), 0, 100);
      const X = Math.max(fx, 0.75 * avg(s.forexHistory));
      const severity = Math.max(0, (X - 40) / 60);
      const qPrevious = s.q;
      const q = severity >= qPrevious ? severity : qPrevious + 0.10 * (severity - qPrevious);
      const maxOutput = s.potential * Math.exp(-0.10 * Math.pow(q, 3));
      const previousY = positive(s.y), h = s.consumption / previousY;
      const nominalInterest = num(Q.macro_interest_rate, s.expectation + 3);
      const realInterest = nominalInterest - s.expectation;
      const m = num(Q.macro_mpc, 0.74);
      const previousSavings = s.savingsHistory[12];
      const inflationPrevious12 = 100 * (s.price / positive(s.priceHistory[0]) - 1);
      const cStar = 5.5 + 0.45 * m / Math.max(h, 0.05) * (s.priorGrowth - 5.5)
        - 0.08 * Math.max(0, inflationPrevious12 - 12) - 0.10 * (realInterest - 3)
        - 0.25 * (savings - previousSavings) - 1.5 * Math.pow(q / (1 + q), 2);
      const c0 = 0.35 * s.priorConsumptionGrowth + 0.65 * cStar;
      const tiger = (Q.year === 1978 && Q.tiger_1978_effect_applied) || (Q.year === 1979 && Q.tiger_1979_effect_applied) || (Q.year === 1980 && Q.tiger_1980_effect_applied);
      const f = num(Q.macro_fiscal_impulse, num(Q.growth_modifier)) + (tiger ? 3 : 0);
      const c = c0 + m / Math.max(h, 0.05) * f;
      const deflationEffect = -0.5 * Math.max(0, -inflationPrevious12);
      const demandGrowth0 = 5.5 + h * (c0 - 5.5) + 0.35 * (capacityGrowth - 5.5) + deflationEffect;
      const demandGrowth = demandGrowth0 + f;
      const demand = previousY * Math.pow(Math.max(0.05, 1 + demandGrowth / 100), 1 / 12);
      const shock = num(Q.macro_output_shock);
      const y = Math.min(demand, maxOutput) * Math.exp(shock / 100);
      const growth = annualized(y, previousY);
      const consumptionWanted = s.consumption * Math.pow(Math.max(0.05, 1 + c / 100), 1 / 12);
      const consumption = consumptionWanted * Math.min(1, y / positive(demand));
      const b = 5.5 + 0.40 * (capacityGrowth - 5.5);
      // An existing card's unemployment_modifier is a LEVEL adjustment; apply changes once,
      // rather than treating a persistent -1 modifier as -1 additional percentage point each month.
      const legacyModifier = num(Q.unemployment_modifier);
      const legacyChange = legacyModifier - s.lastUnemploymentModifier;
      const jobs = num(Q.macro_public_employment);
      const unemployment = clip(s.unemployment + (0.25 / 12) * (b - growth) - jobs + legacyChange, 0, 100);
      const y0 = Math.min(demand, s.potential) * Math.exp(shock / 100);
      // Deliberately preserve the counterfactual ratio in Onat's supplied equations.
      const growth0 = annualized(y0, s.priorCounterfactualGDP);
      const unemployment0 = clip(s.unemployment + (0.25 / 12) * (b - growth0) - jobs + legacyChange, 0, 100);
      const H = 100 * Math.max(0, (demand - y) / positive(y));
      s.hBar = 0.65 * s.hBar + 0.35 * H;
      const moneyGrowthTarget = num(Q.macro_m2_growth, num(Q.base_inflation, 15.3) + num(Q.base_growth, 5.5));
      const moneyNow = positive(Q.macro_m2_level, s.m2 * Math.pow(Math.max(0.05, 1 + moneyGrowthTarget / 100), 1 / 12));
      const mu = 100 * (moneyNow / positive(s.m2History[0]) - 1);
      const V = Math.min(18, Math.max(0, s.expectation - nominalInterest));
      let piTrend = s.expectation + (0.60 / 12) * (mu - growth0 - s.expectation)
        + (1.20 / 12) * (8 - unemployment0) + (1.80 / 12) * s.hBar + (0.10 / 12) * V;
      piTrend = clip(piTrend + num(Q.inflation_modifier) - num(Q.oil_inflation_effect) - (tiger ? 30 : 0), -60, 300);
      const fxPriceShock = 0.20 * (Math.pow(q, 3) - Math.pow(qPrevious, 3));
      const price = s.price * Math.pow(1 + piTrend / 100, 1 / 12) * Math.exp(fxPriceShock + num(Q.macro_price_shock) / 100);
      const inflation12 = 100 * (price / positive(s.priceHistory[0]) - 1);
      const nextExpectation = 0.55 * s.expectation + 0.45 * inflation12;
      historyPush(s.savingsHistory, savings, 24);
      historyPush(s.unemploymentHistory, unemployment, 24);
      historyPush(s.efficiencyHistory, E, 12);
      historyPush(s.qHistory, q, 12);
      historyPush(s.forexHistory, fx, 6);
      historyPush(s.priceHistory, price, 12);
      historyPush(s.m2History, moneyNow, 12);
      historyPush(s.annualHistory, {y, price, unemployment}, 24);
      s.y = y; s.consumption = consumption;
      s.price = price; s.m2 = moneyNow; s.unemployment = unemployment;
      s.expectation = nextExpectation; s.priorGrowth = growth; s.priorConsumptionGrowth = c;
      s.priorCounterfactualGDP = y0; s.lastUnemploymentModifier = legacyModifier;
      s.growth = growth; s.inflation = inflation12; s.q = q; s.demandGap = H;
      s.capacityGrowth = capacityGrowth; s.demandGrowth = demandGrowth; s.counterfactualGrowth = growth0;
      s.lastMonth++;
    }
    return s;
  }
  function headlines(Q) {
    const s = Q.macro_model;
    if (!s || s.version !== 1) return false;
    Q.economic_growth = num(s.growth, num(Q.base_growth, 5.5));
    Q.inflation = num(s.inflation, num(Q.base_inflation, 15.3));
    Q.unemployed = Math.max(0, num(s.unemployment, 8));
    return true;
  }
  const api = {ensure, step, headlines};
  root.AnatolianMacro = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof globalThis !== 'undefined' ? globalThis : window));