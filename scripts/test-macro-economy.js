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
// Independent fixtures for the supplied monetary equations and their boundary cases.
const march = {centralBankRate:9,inflation:20,expectedInflation:18,
  nextExpectedInflation:99,realGdpGrowth:6,unemployment:7,fxStress:0.5};
const aprilRate = (overrides={}) => eq.calculateCentralBankRate({month:3,previous:march,
  comparison:{inflation:10},previousMoneyGrowth:30,...overrides});
near(aprilRate(),11.533333333333333);
near(aprilRate({previousMoneyGrowth:100}),13); // Inflation of 20 caps the increase at 4 points.
near(aprilRate({previousMoneyGrowth:-100}),8); // And caps the cut at 1 point.
for(const month of [0,1,2,4,11,12,14,16])near(aprilRate({month}),9);
near(aprilRate({month:15}),11.533333333333333);
const deflation={...march,inflation:-10,expectedInflation:-8,realGdpGrowth:0,unemployment:8,fxStress:0};
near(aprilRate({previous:deflation,comparison:{inflation:-10},previousMoneyGrowth:-10}),8.5);
near(aprilRate({previous:{...deflation,centralBankRate:0.25},comparison:{inflation:-10},previousMoneyGrowth:-10}),0);
near(aprilRate({previous:deflation,comparison:{inflation:-10},previousMoneyGrowth:100}),10);
near(eq.calculateLendingRate({previousLendingRate:10,centralBankRate:9,lendingSpread:5}),12);
near(eq.calculateLendingRate({previousLendingRate:1,centralBankRate:9,lendingSpread:-20}),9);
near(eq.calculateLendingRate({previousLendingRate:30,centralBankRate:9,lendingSpread:30}),18);
near(eq.calculateLendingRate({previousLendingRate:10,centralBankRate:0,lendingSpread:20}),0);
const moneyInputs={previousMoneySupply:100,previousMoneyGrowth:20,previousGdpGrowth:6,
  expectedInflation:12,creditDemand:2,realLendingRate:4};
const monetary=eq.calculateMoneySupply(moneyInputs);
near(monetary.moneySupplyGrowthRate,22.25);
near(monetary.moneySupply,100*Math.pow(1.2225,1/12));
const capped=eq.calculateMoneySupply({...moneyInputs,annualGrowthLimit:14});
near(capped.moneySupplyGrowthRate,14);near(capped.moneySupply,100*Math.pow(1.14,1/12));
assert(eq.calculateMoneySupply({...moneyInputs,creditDemand:0}).moneySupply<monetary.moneySupply);
assert(eq.calculateMoneySupply({...moneyInputs,realLendingRate:10}).moneySupply<monetary.moneySupply);
const floorMoney=eq.calculateMoneySupply({...moneyInputs,annualGrowthLimit:-100});
near(floorMoney.moneySupplyGrowthRate,-99.999999);
assert(floorMoney.moneySupply>0&&floorMoney.moneySupply<100);
assert.throws(()=>eq.calculateMoneySupply({...moneyInputs,annualGrowthLimit:NaN}),RangeError);

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
near(row(Q).lendingRate,18);
assert.equal(row(Q).centralBankRate,9);
assert.equal(row(Q).creditAdequacy,0);
const january = row(Q);
near(january.averageSavings,18.52245004602241);
near(january.averageUnemployment,6.4);
near(january.expectedInflation,23.968830083061974);
near(january.creditDemand,-1.098539776212978);
near(january.consumptionShare,0.7091499724142758);
const decemberMoneyGrowth=100*(december1971.moneySupply/december1970.moneySupply-1);
const januaryMoneyDriver=0.70*decemberMoneyGrowth+0.30*(december1971.realGdpGrowth+january.expectedInflation)+
  1.50*january.creditDemand-0.10*(january.realLendingRate-2.5);
near(january.moneySupplyGrowthRate,januaryMoneyDriver);
near(january.moneySupply,december1971.moneySupply*Math.pow(1+januaryMoneyDriver/100,1/12));
near(january.moneyGrowth,100*(january.moneySupply/january1971.moneySupply-1));
near(january.centralBankRate+january.lendingSpread,january.expectedInflation+2.5);
near(january.inflation,100*(january.cpi/january1971.cpi-1));
near(january.nominalAgriculturalPrice/january.realAgriculturalPrice,january.cpi);
const february = advance(Q);
assert.equal(february.fx,21);
near(february.moneySupply,january.moneySupply*Math.pow(1+february.moneySupplyGrowthRate/100,1/12));
near(february.centralBankRate+january.lendingSpread,january.expectedInflation+2.5);
near(february.centralBankRate+february.lendingSpread,february.expectedInflation+2.5);
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
// April changes the policy rate once, then carries it through the rest of the year.
const calendar=fresh();M.step(calendar);
near(advance(calendar).centralBankRate,9);
const marchRow=advance(calendar);
const aprilComparison=calendar.macro_model.history.at(-13);
const expectedApril=eq.calculateCentralBankRate({month:3,previous:marchRow,
  comparison:aprilComparison,previousMoneyGrowth:100*(marchRow.moneySupply/aprilComparison.moneySupply-1)});
const april=advance(calendar);near(april.centralBankRate,expectedApril);
assert.notEqual(april.centralBankRate,marchRow.centralBankRate);
near(calendar.central_bank_interest_rate,april.centralBankRate);
const aprilSaved=JSON.stringify(calendar.macro_model);M.step(calendar);
assert.equal(JSON.stringify(calendar.macro_model),aprilSaved);
const aprilReload=JSON.parse(JSON.stringify(calendar));
near(advance(calendar).centralBankRate,april.centralBankRate);
advance(aprilReload);assert.deepEqual(aprilReload,calendar);
for(let i=0;i<10;i++)near(advance(calendar).centralBankRate,april.centralBankRate);
assert.equal(calendar.month,3);
const nextApril=advance(calendar);assert.equal(calendar.month,4);
assert.notEqual(nextApril.centralBankRate,april.centralBankRate);
// Monetary restrictions and one-off M2 levels remain usable with the dynamic formula.
const restricted=fresh();restricted.macro_m2_growth=14;M.step(restricted);
near(row(restricted).moneySupplyGrowthRate,14);
const injected=fresh();injected.macro_m2_level=100;M.step(injected);
near(row(injected).moneySupply,100);assert.equal(injected.macro_m2_level,undefined);
assert.notEqual(advance(injected).moneySupply,100);
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
console.log('PASS: Onat workbook history, April TCMB updates and bounds, monthly real-rate targets, dynamic M2, policy restrictions, FX shocks, annual outputs, and save replay.');
