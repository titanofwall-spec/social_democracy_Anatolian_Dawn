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
 test('High-support trajectories improve AP against the original proportional partition',()=>{
 const vm=require('vm'),sandbox={AnatolianRules:rules,AnatolianProvinceData:provinces.data,module:{exports:{}}};
 const source=fs.readFileSync(path.join(root,'out/html/provinces.js'),'utf8').replace("if(party==='chp')transferCHPGain(before,v,Q);",'');
 vm.runInNewContext(source,sandbox);const baseline=sandbox.module.exports;
 for(const delta of [.10,.20,.30]){const Q=fresh().state.qualities,original=JSON.parse(JSON.stringify(Q));for(const c of Q.classes){provinces.shiftClass(Q,c,'chp',delta);baseline.shiftClass(original,c,'chp',delta);}
 const a=provinces.compute(Q,true),b=provinces.compute(original,true);near(a.fractions.chp,b.fractions.chp,'same CHP endpoint',1e-7);assert(a.fractions.AP>b.fractions.AP+.005);assert.equal(a.totalVotes,b.totalVotes);
 for(const p of a.provinces)for(const k of Q.parties)assert(p.votes[k]>=0);output(JSON.stringify({delta,chp:a.fractions.chp,ap:a.fractions.AP,proportionalAP:b.fractions.AP}));
 }
 });
 test('Permanent donor layer conserves cells, preserves small parties and ranks donor rates',()=>{
 for(const support of [.2,.33,.46,.6,.8])for(const gain of [.001,.01,.05]){
 const names=['CGP','TIP','TBP','MP','MSP','MHP','DP','AP'],before={chp:support};for(const k of names)before[k]=(1-support)/8;
 const next={...before,chp:support+gain};provinces.transferCHPGain(before,next);
 near(Object.values(next).reduce((a,b)=>a+b,0),1,'cell total');near(next.chp,support+gain,'endpoint');
 for(const k of names)assert(next[k]>0);for(let i=1;i<names.length;i++)assert(next[names[i]]>next[names[i-1]],'donor order');
 assert(next.AP>before.AP*(1-support-gain)/(1-support),'AP better than proportional');
 }
 for(const tiny of [1e-4,1e-8]){const before={chp:.33,AP:.4,CGP:tiny,DP:.27-tiny},next={...before,chp:.39};provinces.transferCHPGain(before,next);assert(next.CGP>0);assert(next.DP<before.DP);assert(next.AP<before.AP);}
 const losses={chp:.3,AP:.7};assert.deepEqual(provinces.transferCHPGain({chp:.4,AP:.6},{...losses}),losses);
 });
 test('AP donor propensity falls smoothly as CHP rises',()=>{let previous=Infinity;for(const support of [.2,.3,.4,.5,.6]){const before={chp:support,AP:(1-support)*.6,DP:(1-support)*.4},next={...before,chp:support+.001};provinces.transferCHPGain(before,next);const loss=(before.AP-next.AP)/before.AP;assert(loss<previous);previous=loss;}});
 test('Cyprus excludes AP in every district and class; other temporary effects retain AP donors',()=>{
 for(const year of [1972,1974,1977])for(const points of [1,3,6]){
 const Q=fresh({year}).state.qualities,before=provinces.compute(Q,true),saved=JSON.stringify(Q.province_pools);
 N.addTemporary(Q,'Cyprus Prestige',points);const after=provinces.compute(Q,true);
 near(after.fractions.chp-before.fractions.chp,points/100,'exact prestige',1e-7);assert(Math.abs(after.votes.AP-before.votes.AP)<=1);
 for(let i=0;i<before.provinces.length;i++){const a=before.provinces[i],b=after.provinces[i];assert(Math.abs(a.votes.AP-b.votes.AP)<=2);for(const c of Q.classes)near(a.classPreferences[c].AP,b.classPreferences[c].AP,'class AP');assert.equal(b.totalVotes,a.totalVotes);}
 assert.equal(JSON.stringify(Q.province_pools),saved);assert.equal(Object.values(after.seats).reduce((a,b)=>a+b,0),450);
 Q.national_coalition.temporary=[];N.addTemporary(Q,'Other prestige',points);const other=provinces.compute(Q,true);assert(other.votes.AP<before.votes.AP);
 N.addTemporary(Q,'Cyprus Prestige',points);const mixed=provinces.compute(Q,true);assert(Math.abs(mixed.votes.AP-other.votes.AP)<=1);near(mixed.fractions.chp-before.fractions.chp,2*points/100,'mixed exact',1e-7);
 }
 });
 test('Permanent gains preserve demographics, chronology, totals and totals-only projections',()=>{
 for(const year of [1972,1974,1977]){const Q=fresh({year}).state.qualities,before=provinces.compute(Q,true),demographics=JSON.stringify(before.provinces.map(p=>p.demographics)),history=JSON.stringify(Q.province_election_history);
 provinces.addPollingPoints(Q,6);const after=provinces.compute(Q,true),totals=provinces.pollingTotals(Q);assert(after.fractions.chp>before.fractions.chp);assert.equal(after.totalVotes,before.totalVotes);assert.deepEqual(totals.votes,after.votes);assert.equal(JSON.stringify(after.provinces.map(p=>p.demographics)),demographics);assert.equal(JSON.stringify(Q.province_election_history),history);assert.equal(Q.year,year);assert.equal(Object.values(after.seats).reduce((a,b)=>a+b,0),450);
 output(JSON.stringify({year,chpBefore:before.fractions.chp,apBefore:before.fractions.AP,chpAfter:after.fractions.chp,apAfter:after.fractions.AP}));
 }
 });
 output('PASS: '+count+' CHP transfer scenario groups.');
});
