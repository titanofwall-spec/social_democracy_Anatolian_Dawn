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
require('./test-final-economy.js');
console.log('PASS: historical workbook observations and monetary formula fixtures.');

// Workbook anchors: sheet Tum Baslangic Degerleri, rows 28,45-60,81-102,377-407.
const wbq=fresh(),wb=M.ensure(wbq),w0=wb.history.at(-1);
near(w0.investment,23.988160248085684);near(w0.government,19.95799698131127);
near(w0.absorption,144.15914962142645);near(w0.exports,9.576725051229309);near(w0.realImports,12.42163045029764);
near(w0.reserves,.748);near(w0.externalDebt,2.210);near(w0.realAgriculturalPrice,1.03);
near(w0.exportDollars,.07844284605420857);near(w0.importCover,5.816849208430511);
M.step(wbq);const w1=wb.history.at(-1);
near(w1.effectiveInvestment,10.93932894601649);near(w1.capacityGrowth,3.6630121048846176);
near(w1.reservesBeforeService,.8656928460542085);near(w1.debtLimit,2.40996);
near(w1.principalDue,.007583333333333333);near(w1.interestDue,.0039166666666666528);near(w1.lendingRate,11.5);
const financial=JSON.parse(JSON.stringify(wbq));financial.macro_model.version=4;
const priorHistory=JSON.stringify(financial.macro_model.history);
M.ensure(financial);assert.equal(financial.macro_model.version,5);assert.equal(JSON.stringify(financial.macro_model.history),priorHistory);
near(financial.macro_model.legacyPrincipalMonthly,financial.macro_model.initialDebt/financial.macro_model.initialDebtMonths);
console.log('PASS: supplied 1972 workbook anchors, USD scale conversion, legacy principal schedule, January checks and financial-save preservation.');
