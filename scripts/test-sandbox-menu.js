'use strict';
/* Standalone sandbox smoke tests. Invoked after the repository's npm test suite. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../out/html/sandbox-menu.js'),'utf8');
const local=new Map();
const qualities={started:1,budget:3,resources:2,dues:2,
  armed_forces_loyalty:0.65,police_loyalty:0.6,
  kurdish_issue_consciousness:.07,coalition_dissent:12,
  q0_km_str:2,q0_lk_str:3,q0_ok_str:2,q0_rk_str:1,q0_tw_str:1};
const context={
  console, Date, Math,
  localStorage:{getItem:key=>local.get(key)||null,setItem:(key,val)=>local.set(key,val)},
  confirm:()=>true,alert:()=>{},
  dendryUI:{dendryEngine:{state:{qualities}},autosave:()=>{}},
  AnatolianRules:{
    factionModel:q=>({active:{km:true,tw:true,lk:true,ok:true,rk:true},total:10,
      averages:{km:2,tw:1,lk:3,ok:2,rk:2},bonuses:{km:0,tw:0,lk:0,ok:0,rk:0}}),
    adjustFactionStrength:()=>{},refreshFactions:()=>{},refreshPolls:()=>{}
  },
  updateSidebar:()=>{},updatePartySidebar:()=>{}
};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:'sandbox-menu.js'});
const S=context.AnatolianSandbox;
assert.ok(S);
const cats=S.categories(qualities);
assert.deepEqual(Array.from(cats.map(c=>c.name)),['Party & Politics','Polls','Defense','Exterior Affairs','Gameplay']);
assert.equal(cats[1].sections[0].rows.length,14,'Seven demographics have two controls each');
const relations=cats[0].sections[1].rows.map(x=>x.label);
assert.equal(relations.length,7);
assert.ok(!relations.some(x=>x.startsWith('MP ')));
assert.ok(!relations.some(x=>x.includes('Socialist Left')));
assert.equal(S.cheated(qualities),false);
const one=cat=>cat.sections.flatMap(sec=>sec.rows);
const p=one(cats[0]);
assert.equal(S.apply(qualities,p.find(x=>x.label==='Resources'),'11'),true);
assert.equal(qualities.resources,11);
assert.equal(S.cheated(qualities),true);
assert.ok(qualities.sandbox_branch_id);
const cleanSave={started:1,budget:3};
assert.equal(S.cheated(cleanSave),false,'Prior clean save branch must remain eligible');
assert.equal(S.apply(qualities,p.find(x=>x.label==='Resources'),''),false);
const def=one(cats[2]);
assert.equal(S.apply(qualities,def.find(x=>x.label==='Police Loyalty'),'75'),true);
assert.equal(qualities.police_loyalty,.75);
assert.equal(S.apply(qualities,def.find(x=>x.label==='Kurdish Consciousness'),'80'),true);
assert.equal(qualities.kurdish_issue_consciousness,.8);
const gameplay=one(cats[4]);
assert.equal(S.action(qualities,'budget'),true);
assert.equal(qualities.budget,4);
qualities.fundraising_timer=8;qualities.coup_timer=14;
assert.equal(S.action(qualities,'cooldowns'),true);
assert.equal(qualities.fundraising_timer,0);
assert.equal(qualities.coup_timer,14,'Coup progress is not an action cooldown');
const savedId=qualities.sandbox_branch_id;
assert.equal(S.cheated({sandbox_branch_id:savedId}),true,'Independent local audit catches simple field edits');
console.log('Sandbox Menu smoke tests passed.');
