/* Deterministic unit tests for the new demographic engine (Node built-ins only). */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const CL=['workers','capitalists','petty_bourgeoisie','state_employees','rural','alevis','kurds'];
const d=(workers,rural,kurds)=>({workers,capitalists:.01,petty_bourgeoisie:.10,state_employees:.05,rural,alevis:.04,kurds});
const rows=[
 {id:'industrial',name:'Industrial',population:{1970:400000,1975:490000,1980:580000},center:[0,0],demographics:d(.47,.31,.02)},
 {id:'regional',name:'Regional',population:{1970:300000,1975:350000,1980:380000},center:[300,80],demographics:d(.16,.52,.12)},
 {id:'rural',name:'Rural',population:{1970:200000,1975:240000,1980:290000},center:[720,150],demographics:d(.05,.48,.27)},
 {id:'siirt',name:'Siirt',population:{1970:100000,1975:120000,1980:150000},center:[880,200],demographics:{workers:.124,capitalists:.003,petty_bourgeoisie:.071,state_employees:.042,rural:.742,alevis:.010,kurds:.008}}
];
const hist={1970:1000000,1971:1020000,1972:1040000,1973:1060000,1974:1080000,1975:1140000,1976:1170000,1977:1200000,1978:1230000,1979:1260000,1980:1300000};
const weights=o=>{const t=Object.values(o).reduce((a,b)=>a+b,0);return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,v/t]));};
const D={classes:CL,provinces:rows,nationalPopulation:hist};
const P={ensure(Q){if(!Q.province_pools)Q.province_pools=Object.fromEntries(rows.map(r=>[r.id,{demographics:{...r.demographics},preferences:{}}]));},demographics(Q,id){return weights(Q.province_pools[id].demographics);},sync(Q){Q.province_aggregate_mirror={};}};
const ctx={AnatolianProvinceData:D,AnatolianProvinces:P,console};ctx.globalThis=ctx;
vm.runInNewContext(fs.readFileSync(path.join(root,'out/html/dynamic-demographics.js'),'utf8'),ctx);
vm.runInNewContext(fs.readFileSync(path.join(root,'out/html/mission.js'),'utf8'),ctx);
const model=ctx.AnatolianDynamicDemographics,mission=ctx.AnatolianMission;
assert.ok(model&&mission);
const Q={started:1,year:1972,month:1,week:1,classes:CL,parties:['chp'],land_reform:0,koykent_progress:0,
 economic_growth:5,unemployed:8,industrial_production_index:100,agricultural_production_index:100,
 industry_modifier:0,agriculture_modifier:0,demiryoluu:0,yatirimm:0,spreadd:0,koykentegitimm:0,koykenttt:0};
P.ensure(Q);
const initial=model.ensure(Q);assert.strictEqual(initial.year,1972);
assert.strictEqual(Object.keys(initial.provinces).length,4);
assert.strictEqual(Q.province_pools.siirt.demographics.kurds,.788,'Legacy Siirt correction');
for(const p of rows)assert.ok(Math.abs(Object.values(model.shares(initial.provinces[p.id])).reduce((a,b)=>a+b,0)-1)<1e-10);
assert.strictEqual(mission.levels(Q)['Köykent Programme'],'Not Adopted');
Q.land_reform=3;assert.strictEqual(mission.levels(Q)['Köykent Programme'],'Adopted');
Q.koykent_progress=7;assert.strictEqual(mission.levels(Q)['Köykent Programme'],'Implemented');
assert.ok(mission.html(Q).includes('7 / 7'));
Q.land_reform=0;Q.koykent_progress=0;
Q.year=1973;
assert.strictEqual(model.endYear(Q,1972),true);
assert.strictEqual(model.endYear(Q,1972),false,'Annual update must not replay');
const s=Q.dynamic_demographic_state;
assert.strictEqual(s.year,1973);
assert.ok(Math.abs(Object.values(s.population).reduce((a,b)=>a+b,0)-hist[1973])<10,'Historical national natural baseline');
for(const p of rows){
 const sh=Q.province_pools[p.id].demographics;
 assert.ok(Math.abs(Object.values(sh).reduce((a,b)=>a+b,0)-1)<1e-8,'Class sum 100%');
 assert.ok(Object.values(s.provinces[p.id].cells).every(v=>v>=-1e-8),'No negative population');
}
Q.province_development={regional:{industry:15,services:5},industrial:{industry:0}};
const op=model.annualOpportunities(Q,s);
assert.ok(op.regional.jobs>op.industrial.jobs,'Targeted regional investment must raise regional job access');
Q.year=1974;Q.koykent_progress=7;Q.land_reform=3;Q.yatirimm=3;Q.koykenttt=1;Q.koykentegitimm=1;
assert.strictEqual(model.endYear(Q,1973),true);
assert.ok(Q.dynamic_demographics_last_summary.urbanization>0);
assert.ok(s.koykentConstruction>0&&s.koykentMaturity>=0);
for(const p of rows)assert.ok(Math.abs(Object.values(Q.province_pools[p.id].demographics).reduce((a,b)=>a+b,0)-1)<1e-8);
for(let completed=1974;completed<=1998;completed++){Q.year=completed+1;assert.strictEqual(model.endYear(Q,completed),true);}
assert.ok(s.koykentMaturity>.9,'Long-term Köykent maturation should approach convergence by the late 1990s');
console.log('PASS: mission statuses, Siirt correction, annual updates, conservation, regional jobs and long-run Köykent maturation');
