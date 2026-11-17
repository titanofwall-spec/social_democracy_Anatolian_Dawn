const fs=require('fs'),path=require('path'),assert=require('assert');
const rules=require('../out/html/rules.js');require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const lib=require('dendrynexus/lib/engine.js'),root=path.resolve(__dirname,'..'),c=rules.cyprusAtilla1,rm=rules.cyprusRoadmap,cp=rules.cyprusCampaign;
require('../out/html/data/province-data.js');const provinces=require('../out/html/provinces.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop, insertAdjacentElement:noop, insertBefore:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(err,game)=>{
 if(err)throw err;let count=0;
 function test(label,run){errors.length=0;run();assert.deepEqual(errors,[],label);count++;output('PASS '+label);}
 function fresh(options={}){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:7,week:2,flavour_events:0,CHP_in_government:1,prime_minister_party:'CHP',army_land_strength:.8,army_naval_strength:.8,army_aerial_strength:.8,us_relation:80,west_relation:80,hashas_done:0},options);e.goToScene('kibrisdarbe');e.random.random=()=>1;return e;}
 function pick(e,id){const a=e.getCurrentChoices(),n=a.findIndex(x=>x.id===id);assert(n>=0,'Missing '+id+' at '+e.state.sceneId);assert(!a[n].unavailable,id+' unavailable');e.choose(n);}
 function next(e){const choices=e.getCurrentChoices();assert(choices.some(x=>!x.unavailable),'Dead end '+e.state.sceneId);e.choose(choices.findIndex(x=>!x.unavailable));}
 function prepare(e){for(let i=0;i<40&&e.state.sceneId!=='cyprus_atilla1_20';i++)next(e);assert.equal(e.state.sceneId,'cyprus_atilla1_20');}


 function near(a,b,label){assert(Math.abs(a-b)<1e-9,label+': '+a+' vs '+b);}

 const C=require('../out/html/coalitions.js');global.AnatolianCoalitions=C;
 function available(e){e.goToScene('fiscal_policy.onetime');const choice=e.getCurrentChoices().find(x=>x.id==='fiscal_policy.speculative');assert(choice,'Loan reform is listed');return choice.canChoose;}
 test('New games and older saves with an absent completion flag can restrict speculative loans',()=>{const e=fresh(),Q=e.state.qualities;Object.assign(Q,{in_CHP_majority:1,AP_in_government:0,finance_minister_party:'CHP'});delete Q.speculativee;assert(available(e));Q.speculativee=0;assert(available(e));const before={industry:Q.industry_modifier,growth:Q.growth_modifier,unemployment:Q.unemployment_modifier};pick(e,'fiscal_policy.speculative');assert.equal(Q.speculativee,1);near(Q.industry_modifier,before.industry+5,'industry');near(Q.growth_modifier,before.growth+.5,'growth');near(Q.unemployment_modifier,before.unemployment-.5,'unemployment');assert(!available(e));});
 test('Coalition rights, ownership and per-use resources still govern the reform',()=>{const e=fresh(),Q=e.state.qualities;Object.assign(Q,{in_CHP_majority:0,chp_seats:150,AP_in_government:1,MSP_in_government:0,CGP_in_government:0,DP_in_government:0,finance_minister_party:'CHP',resources:2,speculativee:0});const s=C.ensure(Q),id=C.byScene['fiscal_policy.speculative'].id;assert(available(e));s.rights[id]='partner';assert(!available(e));s.rights[id]='player';Q.resources=0;assert(available(e));delete s.rights[id];assert(!available(e));Q.resources=2;assert(available(e));Q.finance_minister_party='AP';assert(!available(e));Q.finance_minister_party='CHP';const before=Q.resources;assert(C.use(Q,'fiscal_policy.speculative'));assert.equal(Q.resources,before-1);assert.equal(s.yellowUses,1);});

 function loanChoice(e){e.goToScene('fiscal_policy.onetime');return e.getCurrentChoices().find(x=>x.id==='fiscal_policy.speculative');}
 function subtitle(choice){return JSON.stringify(choice.subtitle);}
 test('Completed reform renders cleanly and reopening does not repeat any action effects',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{in_CHP_majority:1,AP_in_government:0,finance_minister_party:'CHP',speculativee:0});
  const deltas={industry_modifier:5,growth_modifier:.5,unemployment_modifier:-.5,west_relation:-5,us_relation:-5,capitalists_chp:-10};
  const before=Object.fromEntries(Object.keys(deltas).map(k=>[k,Q[k]]));
  assert(loanChoice(e).canChoose);pick(e,'fiscal_policy.speculative');
  for(const [key,delta] of Object.entries(deltas))near(Q[key],before[key]+delta,key);
  assert.equal(Q.speculativee,1);
  const after=JSON.stringify(Q);
  for(let i=0;i<3;i++){
   const choice=loanChoice(e);assert.equal(choice.canChoose,false);
   assert(subtitle(choice).includes('We have already implemented restrictions on speculative loans!'));
   assert(!/return|typeof|AnatolianCoalitions|[{}]/.test(subtitle(choice)),'No JavaScript in rendered subtitle');
   assert.equal(JSON.stringify(Q),after,'Menu rendering must not mutate state');
  }
  delete global.AnatolianCoalitions;
  try{assert(!subtitle(loanChoice(e)).includes('return'));}finally{global.AnatolianCoalitions=C;}
 });
 test('Blocked coalition reform renders the actual restriction reason',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{in_CHP_majority:0,chp_seats:150,AP_in_government:1,MSP_in_government:0,CGP_in_government:0,DP_in_government:0,finance_minister_party:'CHP',resources:2,speculativee:0});
  const s=C.ensure(Q),id=C.byScene['fiscal_policy.speculative'].id;s.rights[id]='partner';
  const expected=C.reason(Q,'fiscal_policy.speculative');assert(expected);
  const choice=loanChoice(e);assert.equal(choice.canChoose,false);
  assert(subtitle(choice).includes(expected));assert(!subtitle(choice).includes('return'));
 });
 test('Compiled display text throughout the game contains no leaked JavaScript blocks',()=>{
  function inspect(value,location){
   if(typeof value==='string')assert(!/\{!|!\}|\breturn\s+(?:typeof|Anatolian)/.test(value),'Leaked JavaScript at '+location);
   else if(value&&typeof value==='object')for(const [key,child] of Object.entries(value))inspect(child,location+'.'+key);
  }
  inspect(game.scenes,'scenes');
 });
 output('PASS: '+count+' speculative loan reform scenarios.');
});
