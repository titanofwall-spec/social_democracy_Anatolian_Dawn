'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let count=0;
function test(name,f){f();count++;console.log('PASS '+name);}
test('Health cannot reward severe deflation or implausible GDP growth',()=>{
  const source=fs.readFileSync(require.resolve('../economy/scenes/economy_health_calculator.scene.dry'),'utf8');
  const block=source.slice(source.indexOf('var SYSTEMIC'),source.indexOf('// Hard threshold effects'));
  const score=(inflation,growth)=>{const Q={inflation,economic_growth:growth,unemployed:3,forex_pressure:20};
    vm.runInNewContext(block,{Q,AnatolianRules:{refreshEconomy(){}}});return Q;};
  assert.equal(score(-70,90).health_economy_status,'In Crisis');
  assert(score(-20,8).economy_health<score(-1,8).economy_health);
  assert(score(5,90).growth_score<score(5,8).growth_score);
  assert.equal(score(NaN,Infinity).health_economy_status,'In Crisis');
});
console.log(`PASS ${count} economic repair regression groups.`);
