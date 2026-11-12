require('../out/html/macro-economy.js');
const fs=require('fs'),path=require('path'),assert=require('assert'),R=require('../out/html/rules.js'),P=require('../out/html/peoples-sector.js'),lib=require('dendrynexus/lib/engine.js');
require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...a)=>{if(String(a[0]).startsWith('Error'))errors.push(a.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8'),(err,game)=>{if(err)throw err;let count=0;
function test(title,f){errors.length=0;f();assert.deepEqual(errors,[]);count++;output('PASS '+title);}
function fresh(){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:1,week:1,CHP_in_government:1,economic_minister_party:'CHP',finance_minister_party:'CHP',agriculture_minister_party:'CHP',labor_minister_party:'CHP',budget:100,cyprus_mode:0});return e;}
const A=require('../out/html/card-actions.js');const originalFresh=fresh;const Qof=()=>fresh().state.qualities;const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' != '+b);

test('Finished or cooling actions exclude a card, including nested submenus',()=>{const e=fresh(),Q=e.state.qualities;A.install(e);Q.religious_women_admitted=1;Q.sectarian_affairs_office_founded=1;Q.religious_publications_compliant=1;Q.religious_women_recruitment=6;assert(!A.available(e,'religious_affairs_directorate'));assert(!e._compileChoices(game.scenes['main.govt']).some(c=>c.id==='religious_affairs_directorate'));Q.religious_women_recruitment=2;Q.social_issues_state={done:{},counts:{},dates:{recruit_women:1974*24}};assert(!A.available(e,'religious_affairs_directorate'));Q.year++;assert(A.available(e,'religious_affairs_directorate'));assert(A.available(e,'economic_policy'));Q.imf_agreement=1;Q.budget=0;assert(!e._compileChoices(game.scenes['economic_policy.short']).some(c=>c.id.endsWith('.pricecontrols')&&c.canChoose));});
test('All original government cards with ready policy actions remain eligible',()=>{const e=fresh(),Q=e.state.qualities;A.install(e);for(const id of ['labor_affairs','economic_policy','womens_rights','economic_democracy','kurdish_issue','religious_affairs_directorate'])assert(A.available(e,id),id);});
test('Back restores an opened hand card and refunds the unused turn; decline consumes it',()=>{for(const id of ['economic_democracy','religious_affairs_directorate','kurdish_issue']){const e=fresh(),Q=e.state.qualities;A.install(e);e.goToScene('main');e.state.currentHands.main=[{id,title:game.scenes[id].title,image:game.scenes[id].cardImage}];Q.month_actions=0;const time=Q.time;e.playCard(id);assert.equal(e.state.currentHands.main.length,0);assert.equal(Q.month_actions,1);e.goToScene(id+'.back_to_main');assert(e.state.currentHands.main.some(c=>c.id===id));assert.equal(Q[id+'_timer'],0);assert.equal(Q.time,time);e.goToScene('main');e.playCard(id);e.goToScene(id+'.decline');assert(!e.state.currentHands.main.some(c=>c.id===id));assert.equal(Q.time,time+1);assert.equal(Q[id+'_timer'],6);}});
test('Price controls expand coverage without changing underlying policy pressure',()=>{const e=fresh(),Q=e.state.qualities;Q.imf_agreement=0;const before=Q.inflation_modifier;e.goToScene('economic_policy.pricecontrols');near(Q.inflation_modifier,before);near(Q.price_control_coverage,0.6375);});
test('After 1976, historical rates cannot increase baseline inflation; modifiers still work',()=>{const e=fresh(),Q=e.state.qualities;Object.assign(Q,{year:1977,month:12,week:2,base_inflation:22.5,oil_crisis_effect_applied:1,month_actions:1,cyprus_mode:0});Q.historical_inflation[1978]=999;e.goToScene('post_event');near(Q.base_inflation,16.4);assert(Q.inflation<30);Q.year=1979;Q.month_actions=1;e.goToScene('post_event');near(Q.base_inflation,16.4);});
test('Arab oil embargo shock is date-driven, once only and independent of flavour events',()=>{const e=fresh(),Q=e.state.qualities;Object.assign(Q,{year:1973,month:10,week:2,flavour_events:0,oil_crisis_effect_applied:0,inflation_modifier:0,month_actions:1});e.goToScene('post_event');assert.equal(Q.oil_crisis_effect_applied,1);assert(Q.inflation_modifier>7);const first=Q.inflation_modifier;Q.month_actions=0;e.goToScene('post_event');near(Q.inflation_modifier,first);});
test('Economic sanctions retain their growth penalty for the rest of play',()=>{const e=fresh(),Q=e.state.qualities;Object.assign(Q,{year:1978,month:1,week:1,oil_crisis_effect_applied:1,cyprus_economic_sanctions_active:1,growth_modifier:-.5,tsk_pacified:1,cyprus_mode:0});for(let i=0;i<24;i++){Q.month_actions=1;e.goToScene('post_event');}near(Q.growth_modifier,-.5);});

test('IMF agreement locks out exporting, lowers monetary pressure and resolves a severe FX crisis',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{forex_pressure:90,forex_pressure_drift:2,imf_agreement:0,
    Tiger:0,economicaction:3,macro_m2_growth:24,west_relation:80,us_relation:80,
    oil_crisis_effect_applied:1,flavour_events:0});
  assert(e._runPredicate(game.scenes['economic_policy.standby'].chooseIf,true));
  e.goToScene('economic_policy.standby');
  near(Q.forex_pressure,65);
  near(Q.forex_pressure_drift,-13);
  assert.equal(Q.imf_agreement,1);assert.equal(Q.macro_m2_growth,14);
  assert(!e._runPredicate(game.scenes['economic_policy.tiger'].chooseIf,true));
  assert(!e._runPredicate(game.scenes['economic_policy.standby'].chooseIf,true),
    'IMF rescue cannot be repeatedly farmed');
  for(let i=0;i<72;i++){Q.month_actions=1;e.goToScene('post_event');}
  assert(Q.forex_pressure<=35,'IMF must sustain FX recovery over three years');
});
test('Export transition requires both stages, excludes IMF and resolves high FX pressure',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{forex_pressure:90,forex_pressure_drift:2,imf_agreement:0,
    Tiger:0,economicaction:3,macro_m2_growth:25,
    oil_crisis_effect_applied:1,flavour_events:0});
  assert(e._runPredicate(game.scenes['economic_policy.tiger'].chooseIf,true));
  e.goToScene('economic_policy.tiger');
  assert.equal(Q.Tiger,1);near(Q.forex_pressure,78);near(Q.forex_pressure_drift,-5);
  assert(e._runPredicate(game.scenes['economic_policy.tiger2'].chooseIf,true));
  e.goToScene('economic_policy.tiger2');
  assert.equal(Q.Tiger,2);near(Q.forex_pressure,60);near(Q.forex_pressure_drift,-14);
  assert.equal(Q.macro_m2_growth,18);
  assert(!e._runPredicate(game.scenes['economic_policy.standby'].chooseIf,true));
  for(let i=0;i<72;i++){Q.month_actions=1;e.goToScene('post_event');}
  assert(Q.forex_pressure<=30,'export economy must sustain FX recovery over three years');
});
test('Completed land redistribution, not initiation, improves production, inflation and forex',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{year:1974,month:3,week:1,oil_crisis_effect_applied:1,
    land_reform:2,landreform_done:0,land_distribution_pending_stage:1,
    land_distribution_due_tick:1974*24+5,month_actions:1,forex_pressure:60,
    forex_pressure_drift:2,inflation_modifier:0,agriculture_modifier:0});
  e.goToScene('post_event');
  assert.equal(Q.landreform_done,1);assert.equal(Q.land_distribution_pending_stage,0);
  assert(Q.agriculture_modifier>=1.5);
  assert(Q.inflation_modifier<0);assert(Q.forex_pressure<=58);
  assert(Q.forex_pressure_drift<=1.4);
});
test('People sector and industry reforms lower FX pressure and inflation as construction matures',()=>{
  const e=fresh(),Q=e.state.qualities;
  Object.assign(Q,{forex_pressure:65,forex_pressure_drift:2,
    inflation_modifier:0,agriculture_minister_party:'CHP',
    industrial_minister_party:'CHP',budget:100});
  const beforeIndustry=Q.industry_modifier;
  e.goToScene('industrial_policy.industry1');
  assert(Q.industry_modifier>beforeIndustry);
  assert(Q.forex_pressure<65&&Q.inflation_modifier<0);
  const before=Q.forex_pressure;
  assert(P.apply(Q,'establish_umbrella'));
  Q.year=1976;P.update(Q);
  assert(Q.forex_pressure<before);
  assert(Q.forex_pressure_drift<2);
});

output('PASS '+count+' playable-card and inflation suites.');});
