const fs=require('fs'),path=require('path'),assert=require('assert'),R=require('../out/html/rules.js'),P=require('../out/html/peoples-sector.js'),lib=require('dendrynexus/lib/engine.js');
require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...a)=>{if(String(a[0]).startsWith('Error'))errors.push(a.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8'),(err,game)=>{if(err)throw err;let count=0;
function test(title,f){errors.length=0;f();assert.deepEqual(errors,[]);count++;output('PASS '+title);}
function fresh(){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:1,week:1,CHP_in_government:1,economic_minister_party:'CHP',finance_minister_party:'CHP',agriculture_minister_party:'CHP',labor_minister_party:'CHP',justice_minister_party:'CHP',budget:100,cyprus_mode:0});return e;}
const A=require('../out/html/card-actions.js');const originalFresh=fresh;const Qof=()=>fresh().state.qualities;const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' != '+b);


require('../out/html/coalitions.js');const fixes=require('./card-return-audit.json');

const audit=require('./advisor-menu-audit.json');
for(const route of audit.routes)test(route.id+' browsing and cancellation are free',()=>{
 for(const exit of ['main','cancel_advisor_action','root']){
 const e=fresh(),Q=e.state.qualities;Object.assign(Q,{resources:100,advisor_action_timer:0,last_advisor_action:0,month_actions:0,CHP_party_leader:'Ecevit'});
 const timer=A.timerKey(route.target);Q[timer]=9;const visits=e.state.visits[route.target]||0,minister=Q.economic_minister;
 e.goToScene(route.id);assert.equal(Q.advisor_action_timer,0);assert(Q.advisor_pending,route.id);e.goToScene(exit);
 assert(!Q.advisor_pending);assert.equal(Q.advisor_action_timer,0);assert.equal(Q[timer],9);assert.equal(Q.month_actions,0);assert.equal(Q.economic_minister,minister);assert.equal(e.state.visits[route.target]||0,visits);
 }
});
test('Every effect-bearing advisor action commits exactly one cooldown',()=>{for(const id of audit.actions){const e=fresh(),Q=e.state.qualities;A.beginAdvisor(e,id.split('.')[0]);const first=game.scenes[id].onArrival[0];e._runActions([first]);assert.equal(Q.advisor_action_timer,3,id);assert(!Q.advisor_pending,id);A.backAdvisor(e);assert.equal(Q.advisor_action_timer,3,id);}});
test('Actual advisor policy effects survive returning to main',()=>{const e=fresh(),Q=e.state.qualities;Q.advisor_action_timer=0;Q.month_actions=0;Q.resources=100;const relation=Q.west_relation;e.goToScene('aksoy.internationalaffairs');e.goToScene('international_relations.fr_uk');assert.equal(Q.advisor_action_timer,3);assert.equal(Q.west_relation,relation+3);e.goToScene('main');assert.equal(Q.advisor_action_timer,3);assert.equal(Q.resources,99);});
test('Topuz land reform is completely removed and direct advisor actions still charge',()=>{assert(!game.scenes['topuz.land']);assert(!game.scenes.topuz.options.some(o=>o.id==='topuz.land'));const e=fresh(),Q=e.state.qualities;e.goToScene('rahsan.resource');assert.equal(Q.advisor_action_timer,4);});
console.log=output;output('PASS '+count+' advisor cooldown suites across '+audit.routes.length+' routes and '+audit.actions.length+' actions.');});
