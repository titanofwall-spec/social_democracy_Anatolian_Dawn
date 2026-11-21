const assert = require('node:assert/strict');
const M = require('../out/html/macro-economy.js');
const eq = require('../out/html/economy-equations.js');
const B = require('../out/html/economy-baseline.js');
const near = (a,b) => assert(Math.abs(a-b)<1e-8, a+' != '+b);
const fresh = () => ({started:1, year:1972, month:1});
const row = Q => Q.macro_model.history.at(-1);
function advance(Q) {
  if (++Q.month > 12) { Q.month = 1; Q.year++; }
  M.step(Q);
  return row(Q);
}
const Q = fresh();
const seeded = M.ensure(Q);
assert.equal(seeded.lastMonth,-1);
assert.equal(seeded.history.length,24);
assert.deepEqual(seeded.history.map(r=>r.month),Array.from({length:24},(_,i)=>i-24));
const firstHistorical=seeded.history[0], december1970=seeded.history[11];
const january1971=seeded.history[12], december1971=seeded.history.at(-1);
near(firstHistorical.cpi,0.74752469016232614);
near(firstHistorical.realGdp,121.15632699033976);
near(firstHistorical.centralBankRate,7.5);
near(firstHistorical.lendingRate,10.5);
near(december1970.nominalCredit,33.796);
near(january1971.moneySupply,66.4490938185142);
near(january1971.savingsRate,17.893519965006561);
near(december1971.realGdp,141.31424422235813);
near(december1971.potentialGdp,141.31424422235813);
near(december1971.consumption,100.21299239202951);
near(december1971.moneySupply,86.990734062176713);
near(december1971.inflation,23.39645435051796);
near(december1971.expectedInflation,24.437137500597984);
near(december1971.nextExpectedInflation,23.968830083061974);
near(december1971.consumptionGrowth,11.2);
near(december1971.realGdpGrowth,9.544701652325461);
near(december1971.capacityGrowth,3.3051934739550366);
near(december1971.creditAdequacy,0);
near(seeded.initialRealCreditToPotential,38.6/141.31424422235813);
for(const record of seeded.history) {
  for(const [key,value] of Object.entries(B.pregameHistory[record.month+24])) near(record[key],value);
  near(record.nextExpectedInflation,0.55*record.expectedInflation+0.45*record.inflation);
}
const independent=fresh();
M.ensure(independent).history[0].savingsRate=0;
assert.notEqual(seeded.history[0].savingsRate,0);
assert.notEqual(B.pregameHistory[0].savingsRate,0);
M.step(Q);
assert.equal(row(Q).month,0);
assert.equal(row(Q).agriculturalProduction,1);
assert.equal(row(Q).industrialProduction,1);
assert.equal(row(Q).fx,20);
near(row(Q).lendingRate,11.5);
assert.equal(row(Q).centralBankRate,9);
assert.equal(row(Q).creditAdequacy,0);
const january = row(Q);
near(january.averageSavings,18.52245004602241);
near(january.averageUnemployment,6.4);
near(january.expectedInflation,23.968830083061974);
near(january.creditDemand,-1.098539776212978);
near(january.consumptionShare,0.7091499724142758);
near(january.moneyGrowth,30.913348946135887);
near(january.inflation,100*(january.cpi/january1971.cpi-1));
near(january.nominalAgriculturalPrice/january.realAgriculturalPrice,january.cpi);
const february = advance(Q);
assert.equal(february.fx,21);
near(february.moneySupply, B.moneySupplyForMonth(1,january.moneySupply));
near(february.nominalCredit, B.nominalCreditForMonth(1,january,Q.macro_model.history.at(-3)));
near(february.realGdpGrowth,100*(Math.pow(february.realGdp/january.realGdp,12)-1));
near(february.realAgriculturalPrice,february.nominalAgriculturalPrice/february.cpi);
const sameMonth = JSON.stringify(Q.macro_model);
M.step(Q);
assert.equal(JSON.stringify(Q.macro_model),sameMonth);
const reloaded=JSON.parse(JSON.stringify(Q));
advance(Q);
advance(reloaded);
assert.deepEqual(reloaded,Q);
const comparison = fresh();
const disruption = fresh();
M.step(comparison);
M.step(disruption);
disruption.forex_pressure += 50;
M.headlines(disruption);
const calm=advance(comparison), stressed=advance(disruption);
assert(stressed.fxStress>calm.fxStress);
assert(stressed.outputCeiling<calm.outputCeiling);
assert(stressed.cpi>calm.cpi);
const agriculture=fresh(), control=fresh();
M.step(agriculture);
M.step(control);
agriculture.cooperative_done=1;
for(let t=1;t<=12;t++) {
  near(advance(agriculture).agriculturalProduction, advance(control).agriculturalProduction);
}
assert(advance(agriculture).agriculturalProduction>advance(control).agriculturalProduction);
const oldSave = {
  started: 1, year: 1976, month: 8, forex_pressure: 61,
  agricultural_product_prices: 0.7, agricultural_production_index: 112, industrial_production_index: 138,
  macro_model: {version: 1, y: 120, potential: 130, price: 2, m2: 215, unemployment: 9}
};
M.headlines(oldSave);
assert.equal(row(oldSave).realGdp,120);
assert.equal(row(oldSave).realAgriculturalPrice,1);
near(row(oldSave).agriculturalProduction,1.12);
near(row(oldSave).industrialProduction,1.38);
assert.equal(advance(oldSave).fx,62);
assert.equal(oldSave.macro_model.history.length,24);
const historical = Array.from({length:12},()=>({realGdp:100,cpi:1,unemployment:8}));
const later = Array.from({length:12},()=>({realGdp:110,cpi:1.2,unemployment:7}));
const annual=eq.calculateCalendarYear(later,historical);
near(annual.realGdpGrowth,10); near(annual.inflation,20); near(annual.unemployment,7);
console.log('PASS: Onat 1970-1971 workbook history, observed growth, lagged savings/credit/CPI, inflation expectations, baseline inputs, monthly timing, FX shocks, annual outputs, and save replay.');
