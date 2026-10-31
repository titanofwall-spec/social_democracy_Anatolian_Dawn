const fs=require('fs'),path=require('path'),assert=require('assert'),R=require('../out/html/rules.js'),P=require('../out/html/peoples-sector.js'),lib=require('dendrynexus/lib/engine.js');
require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...a)=>{if(String(a[0]).startsWith('Error'))errors.push(a.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8'),(err,game)=>{if(err)throw err;let count=0;
function test(title,f){errors.length=0;f();assert.deepEqual(errors,[]);count++;output('PASS '+title);}
function fresh(){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:1,week:1,CHP_in_government:1,economic_minister_party:'CHP',finance_minister_party:'CHP',agriculture_minister_party:'CHP',labor_minister_party:'CHP',justice_minister_party:'CHP',budget:100,cyprus_mode:0});return e;}
const A=require('../out/html/card-actions.js');const originalFresh=fresh;const Qof=()=>fresh().state.qualities;const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' != '+b);


require('../out/html/coalitions.js');const fixes=require('./card-return-audit.json');
test('Repaired menus never display duplicate Return or Back actions',()=>{
  for(const id of Object.keys(fixes))for(const difficulty of [0,2])for(const adviser of [0,1]){
    const e=fresh(),Q=e.state.qualities;A.install(e);
    Object.assign(Q,{difficulty,last_advisor_action:adviser,last_cabinet_action:0,resources:100,budget:100,n_advisors:1});
    e.goToScene(id);
    const choices=e.getCurrentChoices();
    const visibleReturns=choices.filter(c=>/^(?:Return|Back)(?:\b|$)/i.test(c.title)&&c.canChoose);
    assert(visibleReturns.length<=1,id+' has multiple simultaneous Return/Back choices: '+visibleReturns.map(c=>c.id).join(','));
  }
});
test('Cooperative Bank and People Sector return despite the parent card cooldown and without repeating entry effects',()=>{for(const id of ['cooperative_bank','peoples_sector']){const e=fresh(),Q=e.state.qualities;A.install(e);e.goToScene('economic_democracy');const timer=Q.economic_democracy_timer,actions=Q.month_actions;assert(timer>0);const i=e.getCurrentChoices().findIndex(c=>c.id==='economic_democracy.'+id);assert(i>=0&&e.getCurrentChoices()[i].canChoose);e.choose(i);Q.budget=0;Q.resources=0;e.goToScene('economic_democracy.'+id);const back=e.getCurrentChoices().findIndex(c=>c.id==='economic_democracy.navigation_menu');assert(back>=0,'Original Back missing');e.choose(back);assert.equal(e.state.sceneId,'economic_democracy.navigation_menu');assert.equal(Q.economic_democracy_timer,timer);assert.equal(Q.month_actions,actions);assert(e.getCurrentChoices().some(c=>c.id==='economic_democracy.back_to_main'&&c.canChoose));}});
test('Return links do not make exhausted cards drawable',()=>{const e=fresh(),Q=e.state.qualities;A.install(e);Object.assign(Q,{budget:0,resources:0,CHP_in_government:0});assert(!A.available(e,'economic_democracy'));assert(!A.available(e,'judiciary.navigation_return_main'));});
test('Every card menu has a guaranteed exit independent of action affordability',()=>{const families=new Set(Object.values(game.scenes).filter(s=>s.isCard||s.isPinnedCard).map(s=>s.id.split('.')[0]));function exit(id,seen=new Set()){if(['root','main','return'].includes(id))return true;if(seen.has(id))return false;seen=new Set(seen).add(id);const s=game.scenes[id];if(!s)return false;if(/\.navigation_return_/.test(id))return true;if(s.chooseIf||s.viewIf)return false;if(/\.(back|back_to_main|remove_none|navigation_return_.*)$/.test(id))return true;if(s.onArrival)return false;if(s.goTo)return s.goTo.some(t=>!t.predicate&&exit(t.id,seen));if(!s.options)return true;return s.options.some(o=>o.id.startsWith('@')&&exit(o.id.slice(1),seen));}let checked=0;for(const s of Object.values(game.scenes)){if(!s.options||!families.has(s.id.split('.')[0]))continue;assert(s.options.some(o=>o.id.startsWith('@')&&exit(o.id.slice(1),new Set([s.id]))),'No unconditional exit from '+s.id);checked++;}assert(checked>=130);output('Audited '+checked+' card menus and the legacy cabinet-allocation screen.');});
test('Returning to main never deletes any other drawn cards from the saved hand',()=>{
  const e=fresh(),Q=e.state.qualities;A.install(e);e.goToScene('main');
  const ids=['religious_affairs_directorate','judiciary','rally'];
  e.state.currentHands.main=ids.map(id=>({id,title:game.scenes[id].title,image:game.scenes[id].cardImage}));
  Object.assign(Q,{religious_women_admitted:1,sectarian_affairs_office_founded:1,religious_publications_compliant:1,religious_women_recruitment:6,budget:0,resources:0});
  assert(!A.available(e,'religious_affairs_directorate'));
  assert(e._runPredicate(game.scenes.religious_affairs_directorate.viewIf,true));
  e.goToScene('main');
  assert.deepEqual(e.state.currentHands.main.map(x=>x.id),ids,'Simply rendering the hand erased cards');
  e.goToScene('party_disunity.navigation_return_main');
  assert.deepEqual(e.state.currentHands.main.map(x=>x.id),ids,'Return erased cards from the hand');
});
test('Every newly-added Return action is financially inert and preserves unrelated cards',()=>{
  const ids=Object.keys(game.scenes).filter(id=>id.includes('.navigation_return_'));
  assert(ids.length>=20,'Return scenes unexpectedly missing');
  for(const id of ids){
    const e=fresh(),Q=e.state.qualities;A.install(e);e.goToScene('main');
    e.state.currentHands.main=['rally','judiciary'].map(card=>({id:card,title:game.scenes[card].title,image:game.scenes[card].cardImage}));
    const before={budget:Q.budget,resources:Q.resources,actions:Q.month_actions,time:Q.time};
    e.goToScene(id);
    assert.equal(Q.budget,before.budget,id+' spent budget');
    assert.equal(Q.resources,before.resources,id+' spent resources');
    assert.equal(Q.month_actions,before.actions,id+' spent actions');
    assert.equal(Q.time,before.time,id+' advanced calendar');
    assert.deepEqual(e.state.currentHands.main.map(c=>c.id),['rally','judiciary'],id+' changed hand');
  }
});
output('PASS '+count+' card-return suites covering '+Object.keys(fixes).length+' repaired menus.');});
