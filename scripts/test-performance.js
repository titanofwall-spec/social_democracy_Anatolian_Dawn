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

 const definitions=[{}, {year:1975,month:2,socialist_left_formed:1}, {year:1977,month:6,Amnesty:1,kurdish_issue_consciousness:.6,kurdish_issue_radicalism:.4}, {year:1979,month:10,TIP_banned:1,disk_endorsement:1}, {year:1981,month:6,constitutional_reform:1,electoral_threshold:10}, {year:1974,month:8,disk_endorsement:1,prestige:5}];
 function deterministic(Q){Q.province_independent_factors=Object.fromEntries(provinces.data.provinces.map(p=>[p.id,.583333333333]));return Q;}
 const select=s=>({votes:s.votes,seats:s.seats,classShares:s.classShares,transfer:s.transfer,totalVotes:s.totalVotes,provinces:s.provinces.map(p=>({id:p.id,votes:p.votes,seats:p.seats,winner:p.winner}))});
 const fixturePath=path.join(__dirname,'fixtures/performance-votes.json');

 const fixtures=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
 test('All provincial votes, winning parties and seats match pre-optimization fixtures',()=>{for(const [index,settings]of definitions.entries()){const Q=deterministic(fresh(settings).state.qualities);if(settings.prestige)N.addTemporary(Q,'Cyprus Prestige',settings.prestige);for(const [pi,poll]of [true,false].entries()){const actual=select(provinces.compute(JSON.parse(JSON.stringify(Q)),poll)),expected=fixtures[index][pi];assert.deepEqual(actual.votes,expected.votes);assert.deepEqual(actual.seats,expected.seats);assert.deepEqual(actual.provinces,expected.provinces);for(const key of Object.keys(actual.classShares))near(actual.classShares[key],expected.classShares[key],key,1e-10);near(actual.transfer,expected.transfer,'transfer',1e-8);const totals=provinces.pollingTotals(JSON.parse(JSON.stringify(Q)),true,poll);assert.deepEqual(totals.votes,expected.votes);assert.equal(totals.totalVotes,expected.totalVotes);assert.equal(totals.transfer,expected.transfer);}}});
 test('Linear D Hondt is identical to the original sorting algorithm, including ties',()=>{function reference(votes,seats){const out=Object.fromEntries(Object.keys(votes).map(k=>[k,0])),keys=Object.keys(votes).filter(k=>votes[k]>0);if(!keys.length)keys.push(Object.keys(votes).sort((a,b)=>votes[b]-votes[a])[0]);for(let i=0;i<seats;i++){keys.sort((a,b)=>votes[b]/(out[b]+1)-votes[a]/(out[a]+1)||a.localeCompare(b));out[keys[0]]++;}return out;}let seed=17;for(let i=0;i<400;i++){const votes={};for(const k of ['chp','AP','TIP','CGP','MSP','IND']){seed=(seed*1664525+1013904223)>>>0;votes[k]=i%5===0?100:seed%1000;}assert.deepEqual(provinces.dhondt(votes,i%35),reference(votes,i%35));}});
 test('Immutable-input caches cannot be poisoned by callers and mutable votes update immediately',()=>{const Q=fresh().state.qualities;const y=1974.5,first=provinces.populations(y),expected={...first};first[Object.keys(first)[0]]=0;assert.deepEqual(provinces.populations(y),expected);const row=provinces.data.provinces[0],prefs=provinces.startingPreferences(row,'rural'),chp=prefs.chp;prefs.chp=0;assert.equal(provinces.startingPreferences(row,'rural').chp,chp);const before=provinces.pollingTotals(Q).votes.chp;Q.province_pools[row.id].preferences.rural.chp+=.1;assert(provinces.pollingTotals(Q).votes.chp>before);const restored=JSON.parse(JSON.stringify(Q));assert.deepEqual(provinces.pollingTotals(restored).votes,provinces.pollingTotals(Q).votes);});
 output('PASS '+count+' performance equivalence suites.');
});
