'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const M = require('../out/html/macro-economy.js');
const sample = extra => ({year:1973, month:1, inflation:15, economic_growth:5.5,
  unemployed:8, forex_pressure:20, macro_m2_growth:20, macro_interest_rate:18,
  base_industry_index:100, base_agriculture_index:100, ...extra});
const copy = q => JSON.parse(JSON.stringify(q));
const near = (a,b,t=1e-8) => assert(Math.abs(a-b)<t, `${a} != ${b}`);
function tick(q) { if (++q.month>12) {q.year++;q.month=1;} M.step(q); M.headlines(q); }
function run(q,n,policy=()=>{}) { M.ensure(q);for(let i=0;i<n;i++){policy(q,i);tick(q);}return q.macro_model; }
let count=0;
function test(name,f){f();count++;console.log('PASS '+name);}
test('Coverage saturates; monthly basket arithmetic; no ceiling-induced deflation',()=>{
  const q=sample();M.ensure(q);M.applyPriceControls(q);near(q.price_control_coverage,.6375);
  M.applyPriceControls(q);near(q.price_control_coverage,.796875);
  for(let i=0;i<100;i++)M.applyPriceControls(q);
  assert(q.price_control_coverage<=.85);assert.equal(q.inflation_modifier,undefined);
  const b=copy(q);b.price_control_coverage=0;const p=q.macro_model.price;tick(q);tick(b);
  const market=b.macro_model.price/p-1, cap=Math.pow(1.03,1/12)-1;
  near(q.macro_model.price/p-1,market-.85*.92*Math.max(0,market-cap));
  for(const rate of [0,-10]){
    const a=sample({inflation:rate,macro_m2_growth:rate,macro_interest_rate:rate+3});
    M.ensure(a);const b=copy(a);M.applyPriceControls(a);tick(a);tick(b);
    assert(b.macro_model.price<100);near(a.macro_model.price,b.macro_model.price);
  }
});
test('An initial enforcement round makes a substantial observable difference',()=>{
  const controlled=sample(), market=sample();
  M.ensure(controlled);M.ensure(market);
  M.applyPriceControls(controlled);
  for(let i=0;i<12;i++){tick(controlled);tick(market);}
  assert(controlled.inflation<market.inflation-4,
    'A single price-control intervention must reduce annual inflation by at least four points during its first year.');
  assert(controlled.price_control_coverage>0&&controlled.price_control_coverage<.85);
});
test('Repeated controls remain bounded across nine years; expiry has no release shock',()=>{
  const q=sample();run(q,108,q=>M.applyPriceControls(q));
  assert(q.inflation>0 && q.inflation<25);assert(q.macro_model.underlyingInflation>q.inflation);
  const b=copy(q);q.price_control_coverage=0;b.price_control_coverage=0;
  // Equal current macro conditions with a different past-control history have equal
  // next prices: no accumulated hidden price gap can feed a release.
  b.macro_model.underlyingMonthlyHistory=Array(12).fill(q.macro_model.underlyingTrend/12);
  tick(q);tick(b);near(q.macro_model.price,b.macro_model.price);
});
test('Monetary anchor stabilizes expectations; genuine inflation and deflation remain possible',()=>{
  const neutral=run(sample(),108), tight=run(sample({macro_m2_growth:0}),108);
  const loose=run(sample({macro_m2_growth:100}),108);
  assert(neutral.inflation>5 && neutral.inflation<30);
  assert(tight.inflation<neutral.inflation);assert(loose.inflation>60 && loose.inflation<150);
  for(const s of [neutral,tight,loose])assert(Number.isFinite(s.expectation) && s.inflation>-100);
  const q=sample({inflation:-10,macro_m2_growth:20});run(q,108);
  assert(q.inflation>0,'temporary deflation does not perpetuate itself');
});
test('Demand uses real interest, without a second negative-CPI penalty',()=>{
  const a=sample();M.ensure(a);const b=copy(a);a.macro_model.inflation=-2;b.macro_model.inflation=-40;
  tick(a);tick(b);near(a.macro_model.demandGrowth,b.macro_model.demandGrowth);
  const c=sample({macro_interest_rate:40}),d=sample({macro_interest_rate:10});
  M.ensure(c);M.ensure(d);tick(c);tick(d);assert(c.macro_model.demandGrowth<d.macro_model.demandGrowth);
});
test('GDP and M2 histories use exactly twelve months; monthly annualization stays internal',()=>{
  const q=sample();M.ensure(q);const ys=[q.macro_model.y],ps=[q.macro_model.price];
  for(let i=1;i<=30;i++){
    if(i===15)q.macro_output_shock=-3;else q.macro_output_shock=0;
    tick(q);const s=q.macro_model;ys.push(s.y);ps.push(s.price);
    near(s.growthAnnualizedMonthly,100*(Math.pow(ys[i]/ys[i-1],12)-1));
    if(i>=12){near(q.economic_growth,100*(ys[i]/ys[i-12]-1));near(q.inflation,100*(ps[i]/ps[i-12]-1));}
    if(i===15)assert(Math.abs(s.growth-s.growthAnnualizedMonthly)>10);
  }
  const m=sample();run(m,12);near(m.macro_model.m2,120);
  m.macro_m2_level=200;tick(m);near(m.macro_model.m2,200);assert(!('macro_m2_level' in m));
  tick(m);near(m.macro_model.m2,200*Math.pow(1.2,1/12));
});
test('Production level gains feed capacity once, gradually, with incremental investment retained',()=>{
  const a=sample(),b=sample();M.ensure(a);M.ensure(b);b.industry_modifier=10;b.agriculture_modifier=10;
  tick(a);tick(b);assert(b.macro_model.potential>a.macro_model.potential);
  assert(b.macro_model.potential/a.macro_model.potential<Math.pow(1.1,.60));
  // Neutral FX and matched unemployment remove secondary investment feedback.
  for(let i=0;i<95;i++){a.macro_model.unemploymentHistory.fill(8);b.macro_model.unemploymentHistory.fill(8);tick(a);tick(b);}
  near(b.macro_model.potential/a.macro_model.potential,Math.pow(1.1,.60),1e-7);
  const c=sample(),d=sample({macro_investment_K:10});run(c,24);run(d,24);
  assert(d.macro_model.potential>c.macro_model.potential);
  const snapshot=JSON.stringify(b);M.step(b);M.headlines(b);assert.equal(JSON.stringify(b),snapshot);
});
test('Signed gap is bounded; FX price pass-through rises once and recovery is not a price reversal',()=>{
  const low=sample({growth_modifier:-100}),high=sample({growth_modifier:100});run(low,1);run(high,1);
  assert(low.macro_model.demandGap<0);assert(high.macro_model.demandGap>0);
  assert(Math.abs(low.macro_model.demandGap)<=25 && Math.abs(high.macro_model.demandGap)<=25);
  const q=sample();M.ensure(q);const b=copy(q);q.forex_pressure=100;tick(q);tick(b);
  assert(q.macro_model.price>b.macro_model.price);assert(q.macro_model.y<b.macro_model.y);
  q.forex_pressure=20;
  for(let i=0;i<24;i++){const before=q.macro_model.price;tick(q);assert(q.macro_model.price>before);}
});
test('Version-one migration preserves levels and real histories, and survives JSON reload',()=>{
  const q=sample();run(q,20);const s=q.macro_model,oldY=s.y,oldP=s.price;
  s.version=1;s.expectation=15;for(const key of ['yHistory','sectorGrowth','industry','agriculture','underlyingMonthlyHistory','underlyingTrend'])delete s[key];
  q.inflation_modifier=-12;M.ensure(q);near(s.y,oldY);near(s.price,oldP);near(q.inflation_modifier,-12);
  assert.equal(s.growthHistoryEstimated,false);near(s.yHistory[0],s.annualHistory.at(-12).y);
  const b=copy(q);tick(q);tick(b);assert.deepEqual(q,b);
});
test('Health cannot reward severe deflation or implausible GDP growth',()=>{
  const source=fs.readFileSync(require.resolve('../source/scenes/economy_health_calculator.scene.dry'),'utf8');
  const block=source.slice(source.indexOf('var SYSTEMIC'),source.indexOf('// Hard threshold effects'));
  const score=(inflation,growth)=>{const Q={inflation,economic_growth:growth,unemployed:3,forex_pressure:20};
    vm.runInNewContext(block,{Q,AnatolianRules:{refreshEconomy(){}}});return Q;};
  assert.equal(score(-70,90).health_economy_status,'In Crisis');
  assert(score(-20,8).economy_health<score(-1,8).economy_health);
  assert(score(5,90).growth_score<score(5,8).growth_score);
  assert.equal(score(NaN,Infinity).health_economy_status,'In Crisis');
});
console.log(`PASS ${count} economic repair regression groups.`);
