'use strict';
const assert=require('node:assert/strict');
const E=require('../out/html/economy-equations.js');
const M=require('../out/html/macro-economy.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const fresh=()=>({started:1,year:1972,month:1});
const advance=q=>{if(++q.month>12){q.month=1;q.year++;}M.step(q);return q.macro_model.history.at(-1);};
const inputs={savingsRate:20,cooperativization:1,cooperativeBank:1,peoplesSectorIntegration:0,
 koykentInvestment:0,cooperativeUnions:0,highTechPolicy:0,stateEnterpriseRestructuring:0};
function fixture(){return Array.from({length:24},(_,i)=>({month:i-24,...inputs,
 realGdp:100,potentialGdp:110,consumption:65,investment:20,realizedInvestmentShare:20,
 government:15,desiredGovernment:15,absorption:100,cpi:1,inflation:10,expectedInflation:10,nextExpectedInflation:10,
 lendingRate:12,realLendingRate:100*(1.12/1.1-1),centralBankRate:9,realGdpGrowth:5.5,realGdpGrowth12:5.5,
 consumptionGrowth:5.5,moneySupply:100,nominalCredit:30,creditAdequacy:0,investmentEfficiency:1,
 counterfactualGdp:100,unemployment:8,fx:0,fxStress:0,smoothedUnmetDemand:0,
 agriculturalProduction:1,industrialProduction:1,realAgriculturalPrice:1,nominalAgriculturalPrice:1,
 reserves:100,externalDebt:0,exportCapacity:0.08,exportDollars:0.05,exportCash:0.05,availableRemittances:0.05,
 exchangeRate:14,realExchangeRate:100,loanSchedule:[],plannedImportDollars:0.1}));}
function calc(overrides={},history=fixture(),parameters={}){return E.calculateMonth({month:0,history,
 initialRealCreditToPotential:30/110,inputs:{...inputs,...overrides},parameters:{initialDebt:0,...parameters}});}
const r=calc();
near(r.realLendingRate,100*((1+r.lendingRate/100)/1.1-1));
near(r.circulationPressure,Math.min(18,Math.max(0,-r.realLendingRate)));
near(r.capacityGrowth,0.60+0.28*0.52*20);
near(calc({fiscalContribution:2}).consumptionGrowth-r.consumptionGrowth,0.74*2/0.65);
near(r.desiredInvestment,20);near(r.consumptionShare,0.65);
near(r.nominalCredit,30*Math.pow(1-0.5*(100*(1.12/1.1-1)-2.5)/100,1/12));
near(r.realGdp,r.consumption+r.investment+r.government+r.exports-r.realImports);
near(r.domesticSavings,r.investment+r.netExports);
near(r.exportCash,E.externalDefaults.exportCollection*0.05);
near(r.exportDollars,r.exportPrice*r.exports/12);
near(r.reserves,100+r.exportCash+r.availableRemittances-r.importDollars);
near(r.unboundedInflationTrend,r.expectedInflation+0.60/12*(r.moneyGrowth-r.counterfactualGrowth12-r.expectedInflation)
 +1.20/12*(8-r.counterfactualUnemployment)+1.80/12*r.smoothedUnmetDemand+0.10/12*r.circulationPressure);
assert.equal(r.realization,1);assert.equal(r.fx,0);
const constrained=fixture();constrained.at(-1).reserves=0;
const short=calc({remittances:0,exportCollection:0},constrained);
assert.equal(short.finalImportFunding,0);assert.equal(short.intermediateImportFunding,0);
assert(short.realGdp<r.realGdp);assert.equal(short.fx,100);
near(short.realGdp,short.consumption+short.investment+short.government+short.exports-short.realImports);
assert(short.intermediateBudget+short.finalBudget<=short.importBudget+1e-12);
const zero=Object.fromEntries(['C','I','G','EX'].map(j=>[j,{final:[0,0],intermediate:[0,0],beta:0}]));
const noImports=calc({importCoefficients:zero});assert.equal(noImports.importCover,null);
assert.equal(noImports.importShortage,0);assert.equal(noImports.fx,0);
assert.equal(JSON.parse(JSON.stringify(noImports)).importCover,null);
const shares=Object.fromEntries(['C','I','G','EX'].map(j=>[j,{final:[0.1,5],intermediate:[0.2,5],beta:0.5}]));
const scaled=calc({importCoefficients:shares});
for(const v of Object.values(scaled.coefficients)){assert(v.final>=0.1);assert(v.intermediate>=0.2);assert(v.final+v.intermediate<=1-E.externalDefaults.epsilon+1e-12);}
const devaluation=calc({exchangeRateChange:0.2});near(devaluation.fxPriceShock,E.externalDefaults.passThrough*E.externalDefaults.importedCostWeight*Math.log(1.2));
const imported=calc({finalImportPrice:2*E.externalDefaults.finalImportPrice,intermediateImportPrice:2*E.externalDefaults.intermediateImportPrice});near(imported.importPriceIndex,200);
const crisisHistory=fixture();Object.assign(crisisHistory.at(-1),{externalDebt:10,reserves:0});
const crisis=calc({legacyPrincipal:1,remittances:0,exportCollection:0},crisisHistory);
assert(crisis.debtServiceGap>1);assert.equal(crisis.importBudget,0);assert.equal(crisis.externalDebt,10);
near(crisis.principalArrears,1);near(crisis.reserves,0);
// A new loan's principal starts next month and is not counted as initial debt.
let h=fixture();let loan=calc({requestedLoan:0.6,external:{debtMonths:3,debtIncomeMultiple:100}},h);
near(loan.newLoan,0.6);near(loan.principalDue,0);near(loan.externalDebt,0.6);
for(let month=1;month<=3;month++){
 h.push(loan);h.shift();loan=E.calculateMonth({month,history:h,inputs:{...inputs,external:{debtMonths:3,debtIncomeMultiple:100}},parameters:{initialDebt:0},initialRealCreditToPotential:30/110});
 near(loan.principalDue,0.2);near(loan.externalDebt,0.6-0.2*month);
}assert.equal(loan.loanSchedule.length,0);
const exportHistory=fixture();exportHistory[12].exportCapacityAction=0.02;
near(calc({},exportHistory).exportCapacity,0.10);
const q=fresh();M.step(q);const first=q.macro_model.history.at(-1);
assert.equal(q.macro_model.version,5);
const saved=JSON.stringify(q.macro_model);M.step(q);assert.equal(JSON.stringify(q.macro_model),saved);
const reload=JSON.parse(JSON.stringify(q));advance(q);advance(reload);assert.deepEqual(q,reload);
// Real version-3 saves retain all played data while receiving financial fields.
const v3=JSON.parse(JSON.stringify(q));v3.macro_model.version=3;
for(const row of v3.macro_model.history){delete row.reserves;delete row.externalDebt;delete row.loanSchedule;}
const observations=v3.macro_model.history.map(row=>[row.month,row.realGdp,row.cpi,row.moneySupply]);
M.ensure(v3);assert.deepEqual(v3.macro_model.history.map(row=>[row.month,row.realGdp,row.cpi,row.moneySupply]),observations);
assert.equal(v3.macro_model.version,5);advance(v3);
const legacy={started:1,year:1976,month:8,macro_model:{version:1,y:120,potential:130,price:2,m2:215}};
M.ensure(legacy);near(legacy.macro_model.history.at(-1).realGdp,120);advance(legacy);
for(let month=2;month<120;month++){
 const prior=q.macro_model.history.at(-1),next=advance(q);
 if(month%12!==3)near(next.centralBankRate,prior.centralBankRate);
 near(next.realGdp,next.consumption+next.investment+next.government+next.exports-next.realImports);
 near(next.domesticSavings,next.investment+next.netExports);
 near(next.externalDebt,prior.externalDebt+next.newLoan-next.paidPrincipal);
 assert(next.reserves>=0&&next.externalDebt>=0&&next.fx>=0&&next.fx<=100);
 assert(Number.isFinite(next.realGdp)&&next.realGdp>0);
 if(next.debtServiceGap===0)near(next.reserves,next.reservesBeforeService-next.debtService-next.importDollars);
}
assert.equal(q.macro_model.lastMonth,119);
const state=JSON.stringify(q);q.year=1982;q.month=1;assert.equal(M.step(q),null);
const annual=E.calculateCalendarYear(Array.from({length:12},()=>({...r,realGdp:110,cpi:1.2,unemployment:7})),Array.from({length:12},()=>({...r,realGdp:100,cpi:1,unemployment:8})));
near(annual.realGdpGrowth,10);near(annual.inflation,20);near(annual.unemployment,7);
near(annual.moneyGrowth,r.moneyGrowth);near(annual.nominalCredit,r.nominalCredit);near(annual.realLendingRate,r.realLendingRate);
assert.throws(()=>calc({savingsRate:101}),RangeError);
assert.throws(()=>calc({exchangeRateChange:-1}),RangeError);
assert.throws(()=>calc({requestedLoan:-1}),RangeError);
console.log('PASS: final equations, expenditure identities, reserves, imports, debt amortization, crises, pass-through, action lags, JSON saves, migrations, and 120-month simulation.');
