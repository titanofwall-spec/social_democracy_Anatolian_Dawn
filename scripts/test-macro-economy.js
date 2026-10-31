'use strict';
const assert = require('node:assert/strict');
const macro = require('../out/html/macro-economy.js');
const sample = () => ({year:1973,month:1,base_growth:5.5,economic_growth:5.5,
  base_inflation:15,inflation:15,base_unemployment:8,unemployed:8,forex_pressure:45,
  growth_modifier:0,inflation_modifier:0,unemployment_modifier:0,
  macro_savings_rate:20,macro_interest_rate:18,macro_m2_growth:20});
const a=sample(); macro.ensure(a);
assert.equal(macro.step(a).lastMonth,1973*12+1,'do not run twice in one month');
a.month=2;macro.step(a); const first=a.macro_model.y;
assert(first>0 && a.macro_model.price>0);macro.headlines(a);
assert.equal(a.economic_growth,a.macro_model.growth);
assert.equal(macro.step(a).y,first,'idempotent');
const baseline=sample(),stimulus=sample();macro.ensure(baseline);macro.ensure(stimulus);
baseline.month=2;stimulus.month=2;stimulus.growth_modifier=2;
macro.step(baseline);macro.step(stimulus);
assert(stimulus.macro_model.demandGrowth>baseline.macro_model.demandGrowth,'policy fiscal modifier changes real demand');
const lowFX=sample(),highFX=sample();macro.ensure(lowFX);macro.ensure(highFX);
lowFX.month=2;highFX.month=2;highFX.forex_pressure=100;
macro.step(lowFX);macro.step(highFX);
assert(highFX.macro_model.q>lowFX.macro_model.q,'FX pressure feeds the model');
assert(highFX.macro_model.price>lowFX.macro_model.price,'FX pressure feeds CPI');
const baselineE=sample(),boostE=sample();macro.ensure(baselineE);macro.ensure(boostE);
boostE.macro_investment_K=10;
for(let i=0;i<13;i++) {baselineE.month++;boostE.month++;
  if(baselineE.month===13){baselineE.year++;baselineE.month=1;boostE.year++;boostE.month=1;}
  macro.step(baselineE);macro.step(boostE);
  if(i<12) assert.equal(boostE.macro_model.capacityGrowth,baselineE.macro_model.capacityGrowth,'E delayed');
}
assert(boostE.macro_model.capacityGrowth>baselineE.macro_model.capacityGrowth,'12-month E lag takes effect');
const unemployed=sample();macro.ensure(unemployed);unemployed.unemployment_modifier=-1;unemployed.month=2;macro.step(unemployed);
const lowered=unemployed.macro_model.unemployment;
unemployed.month=3;macro.step(unemployed);
assert(unemployed.macro_model.unemployment>lowered-0.5,'persistent policy modifier not reapplied monthly');
console.log('PASS: macro monthly idempotence, policy demand, FX, 12-month investment lag, employment policy.');
