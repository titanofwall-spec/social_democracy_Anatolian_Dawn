const fs=require('fs'),path=require('path'),assert=require('assert');
const rules=require('../out/html/rules.js');require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const lib=require('dendrynexus/lib/engine.js'),root=path.resolve(__dirname,'..'),c=rules.cyprusAtilla1,rm=rules.cyprusRoadmap,cp=rules.cyprusCampaign;
require('../out/html/data/province-data.js');const provinces=require('../out/html/provinces.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(err,game)=>{
 if(err)throw err;let count=0;
 function test(label,run){errors.length=0;run();assert.deepEqual(errors,[],label);count++;output('PASS '+label);}
 function fresh(options={}){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:7,week:2,flavour_events:0,CHP_in_government:1,prime_minister_party:'CHP',army_land_strength:.8,army_naval_strength:.8,army_aerial_strength:.8,us_relation:80,west_relation:80,hashas_done:0},options);e.goToScene('kibrisdarbe');e.random.random=()=>1;return e;}
 function pick(e,id){const a=e.getCurrentChoices(),n=a.findIndex(x=>x.id===id);assert(n>=0,'Missing '+id+' at '+e.state.sceneId);assert(!a[n].unavailable,id+' unavailable');e.choose(n);}
 function next(e){const choices=e.getCurrentChoices();assert(choices.some(x=>!x.unavailable),'Dead end '+e.state.sceneId);e.choose(choices.findIndex(x=>!x.unavailable));}
 function prepare(e){for(let i=0;i<40&&e.state.sceneId!=='cyprus_atilla1_20';i++)next(e);assert.equal(e.state.sceneId,'cyprus_atilla1_20');}


 function near(a,b,label,tolerance=1e-7){assert(Math.abs(a-b)<tolerance,label+': '+a+' vs '+b);}
 const N=global.AnatolianNationalCoalition;
 const tick=(Q,months)=>{const t=Q.year*24+(Q.month-1)*2+(Q.week===2?1:0)+months*2;Q.year=Math.floor(t/24);Q.month=Math.floor(t%24/2)+1;Q.week=t%2+1;N.update(Q);};

 const copy=x=>JSON.parse(JSON.stringify(x));
 function opposition(party='AP',extra={}){const e=fresh(),Q=e.state.qualities;rules.resetCabinet(Q);Object.assign(Q,{army_in_government:0,CHP_in_government:0,prime_minister_party:party,budget:10,resources:10,poppy_harvestation:1,imf_agreement:0},extra);Q[party+'_in_government']=1;for(const m of ['industrial','education','economic','agriculture'])Q[m+'_minister_party']=party;Object.assign(Q,extra);return e;}
 function advance(Q,periods=6){const t=Q.year*24+(Q.month-1)*2+Q.week-1+periods;Q.year=Math.floor(t/24);Q.month=Math.floor((t%24)/2)+1;Q.week=t%2+1;}
 test('Each party implements an agenda-compatible real policy and wins modest, conserved support',()=>{
 for(const [party,id] of [['AP','industrial_policy.industry1'],['MSP','industrial_policy.elektronik'],['DP','agricultural_policy.hashas'],['CGP','education_science.curriculum']]){
 const e=opposition(party),Q=e.state.qualities,before=provinces.compute(Q,true),budget=Q.budget,resources=Q.resources,demographics=copy(Q.province_pools);N.governmentTurn(Q);
 const record=Q.national_coalition.governmentPolicies.history[0],policy=N.governmentPolicies.find(p=>p.id===id);assert.equal(record.id,id);assert.equal(record.party,party);assert.equal(Q[policy.flag],1);assert.equal(Q.budget,budget);assert.equal(Q.resources,resources);
 const after=provinces.compute(Q,true);assert(after.fractions[party]>before.fractions[party]);assert(after.fractions[party]-before.fractions[party]<.01);assert.equal(after.totalVotes,before.totalVotes);assert.equal(Object.values(after.seats).reduce((a,b)=>a+b,0),450);for(const row of provinces.data.provinces)assert.deepEqual(Q.province_pools[row.id].demographics,demographics[row.id].demographics);
 output(party+' '+id+': '+(100*(after.fractions[party]-before.fractions[party])).toFixed(3)+' polling points');
 }
 });
 test('Shared player actions preserve their original effects, prices and rewards',()=>{
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/government-policy-effects.json'),'utf8'));
 for(const p of expected){const Q=opposition().state.qualities;Q.CHP_in_government=1;const before=copy(Q);assert(N.applyGovernmentPolicy(Q,p.id));for(const [k,v]of Object.entries(p.effects))near(Q[k]-(before[k]||0),v,p.id+' '+k);for(const [k,v]of Object.entries(p.sets))assert.equal(Q[k],v);for(const [c,v]of Object.entries(p.support))near(Q[c+'_chp']-before[c+'_chp'],v,p.id+' reward '+c);}
 });
 test('Actual opposition effects match player effects except spending and party credit',()=>{
 for(const p of N.governmentPolicies){const a=opposition('AP').state.qualities,b=copy(a);assert(N.applyGovernmentPolicy(a,p.id,'AP'));N.applyGovernmentPolicy(b,p.id,'CHP');for(const k of Object.keys(p.effects))if(k!=='budget')near(a[k],b[k],p.id+' '+k);for(const k of Object.keys(p.sets))assert.equal(a[k],b[k]);}
 });
 test('Cabinet ownership, coalition red lines and external support determine who acts',()=>{
 const Q=opposition('AP',{MSP_in_government:1,CGP_in_government:1,DP_external_support:1,education_minister_party:'CGP',industrial_minister_party:'MSP',economic_minister_party:'AP',agriculture_minister_party:'MSP'}).state.qualities;
 const C=require('../out/html/coalitions.js');for(let i=0;i<12;i++){N.governmentTurn(Q);advance(Q);}const history=Q.national_coalition.governmentPolicies.history;assert(history.length>3);assert(history.some(e=>e.party==='MSP'));assert(history.some(e=>e.party==='CGP'));for(const e of history){const a=C.data.find(a=>a.scenes.includes(e.id));assert.equal(e.party,Q[a.ministry+'_minister_party']);assert(!e.parties.includes('DP'));assert(!e.parties.some(p=>a.parties[p]==='red'));assert.notEqual(e.id,'education_science.curriculum');}
 });
 test('Completed policy survives save/reload and government change, blocking the real player choice',()=>{
 for(const p of N.governmentPolicies.filter(p=>p.flag)){const e=opposition('AP'),Q=e.state.qualities;N.applyGovernmentPolicy(Q,p.id,'AP');const saved=copy(Q);rules.resetCabinet(saved);saved.CHP_in_government=1;assert.equal(saved[p.flag],1);provinces.ensure(saved);const scene=game.scenes[p.id];assert(scene.chooseIf);assert.equal(scene.chooseIf.call(e,e.state,saved),false,p.id+' blocked after inheritance');const before=JSON.stringify(saved);assert.equal(N.applyGovernmentPolicy(saved,p.id,'AP'),false);assert.equal(JSON.stringify(saved),before);}
 });
 test('Tick guard, three-month cadence, save/load and rendering never replay actions',()=>{
 let Q=opposition().state.qualities;N.governmentTurn(Q);const once=JSON.stringify(Q),html=N.governmentActivityHtml(Q);assert(html.includes('Basic industrialization push'));N.governmentTurn(Q);assert.equal(JSON.stringify(Q),once);assert.equal(N.governmentActivityHtml(Q),html);assert.equal(JSON.stringify(Q),once);Q=copy(Q);advance(Q,1);N.governmentTurn(Q);assert.equal(Q.national_coalition.governmentPolicies.history.length,1);advance(Q,5);N.governmentTurn(Q);assert.equal(Q.national_coalition.governmentPolicies.history.length,2);assert.equal(Q.industryy,1);const history=JSON.stringify(Q.national_coalition.governmentPolicies.history);Q.CHP_in_government=1;advance(Q);N.governmentTurn(Q);assert.equal(JSON.stringify(Q.national_coalition.governmentPolicies.history),history);assert(N.governmentActivityHtml(Q).includes('Basic industrialization push'));
 });
 test('Caretakers, military cabinets, missing prerequisites and completed policies cannot fabricate actions',()=>{
 for(const extra of [{AP_in_government:0},{army_in_government:1}]){const Q=opposition('AP').state.qualities;Object.assign(Q,extra);N.governmentTurn(Q);assert(!Q.national_coalition.governmentPolicies);}
 const Q=opposition().state.qualities;Q.poppy_harvestation=0;assert(!N.applyGovernmentPolicy(Q,'agricultural_policy.hashas','AP'));Q.imf_agreement=1;assert(!N.applyGovernmentPolicy(Q,'economic_policy.publicworks','AP'));const before=JSON.stringify(Q);assert(!N.applyGovernmentPolicy(Q,'missing-policy','AP'));assert.equal(JSON.stringify(Q),before);
 });
 test('Normal post-event progression persists government effects and credit',()=>{
 const e=opposition(),Q=e.state.qualities,before=Q.industry_modifier;Q.cyprus_mode=0;Q.month_actions=1;e.goToScene('post_event');assert.equal(Q.industryy,1);near(Q.industry_modifier-before,10,'real turn industrial output');assert.equal(Q.national_coalition.governmentPolicies.history.length,1);assert(N.governmentActivityHtml(Q).includes('AP'));
 });
 test('Policy effects reach production indexes and the next monthly macro step',()=>{
 const macro=require('../out/html/macro-economy.js'),Q=opposition().state.qualities;macro.ensure(Q);const baseline=copy(Q),index=Q.industrial_production_index;
 N.applyGovernmentPolicy(Q,'industrial_policy.industry1','AP');near(Q.industrial_production_index-index,10,'production index');
 advance(Q,2);advance(baseline,2);macro.step(Q);macro.step(baseline);rules.refreshEconomy(Q);rules.refreshEconomy(baseline);
 assert(Q.macro_model.unemployment<baseline.macro_model.unemployment);near(Q.unemployed,Q.macro_model.unemployment,'live headline');
 });
 output('PASS: '+count+' opposition government scenario groups.');
});
