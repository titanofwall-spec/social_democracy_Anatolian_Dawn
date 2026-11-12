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
 test('Shared player actions preserve their original effects, prices and rewards',()=>{
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/government-policy-effects.json'),'utf8'));
 for(const p of expected){const Q=opposition().state.qualities;Q.CHP_in_government=1;const before=copy(Q);assert(N.applyGovernmentPolicy(Q,p.id));for(const [k,v]of Object.entries(p.effects))near(Q[k]-(before[k]||0),v,p.id+' '+k);for(const [k,v]of Object.entries(p.sets))assert.equal(Q[k],v);for(const [c,v]of Object.entries(p.support))near(Q[c+'_chp']-before[c+'_chp'],v,p.id+' reward '+c);}
 });
 test('Non-CHP cabinets cannot execute player policies or alter the economy and voters',()=>{
 for(const party of ['AP','MSP','DP','CGP']){
  const Q=opposition(party).state.qualities;N.governmentTurn(Q);
  const before=JSON.stringify(Q);
  for(const p of N.governmentPolicies)assert.equal(N.applyGovernmentPolicy(Q,p.id,party),false);
  for(let i=0;i<24;i++)N.governmentTurn(Q);
  assert.equal(JSON.stringify(Q),before);
  assert(!Q.national_coalition.governmentPolicies);
 }
 });
 test('Old saved policy records remain readable but never resume execution',()=>{
 const Q=opposition().state.qualities;N.ensure(Q).governmentPolicies={history:[{id:'industrial_policy.industry1',label:'Basic industrialization push',party:'AP',partyName:'AP',year:1974,month:1,parties:['AP']}],lastActionTick:0};
 const history=JSON.stringify(Q.national_coalition.governmentPolicies);
 N.governmentTurn(Q);advance(Q,12);N.governmentTurn(Q);
 assert.equal(JSON.stringify(Q.national_coalition.governmentPolicies),history);
 assert(N.governmentActivityHtml(Q).includes('Basic industrialization push'));
 assert(!Q.national_coalition.news.includes('industrialization'));
 });
 test('Normal post-event progression no longer completes automatic ministry actions',()=>{
 const e=opposition(),Q=e.state.qualities;Q.cyprus_mode=0;Q.month_actions=1;
 const flags=N.governmentPolicies.filter(p=>p.flag).map(p=>[p.flag,Q[p.flag]]);
 e.goToScene('post_event');
 for(const [key,value]of flags)assert.equal(Q[key],value,key);
 assert(!Q.national_coalition.governmentPolicies);
 });
 test('News screen remains available for future use',()=>{
 const ui=fs.readFileSync(path.join(root,'out/html/game.js'),'utf8');
 assert(ui.includes("title.textContent='News'"));assert(ui.includes("box.id='government-news'"));
 });
 output('PASS: '+count+' opposition government scenario groups.');
});
