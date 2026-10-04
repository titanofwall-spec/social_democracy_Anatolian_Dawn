const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
require(path.join(root,'out/html/rules.js'));
require(path.join(root,'out/html/cyprus-atilla1.js'));
const lib=require('dendrynexus/lib/engine.js');
const silent=()=>{};
const node={style:{},appendChild:silent,setAttribute:silent,addEventListener:silent,offsetWidth:600,classList:{add:silent,remove:silent,toggle:silent},querySelector:()=>node,querySelectorAll:()=>[],innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:silent};
global.Image=function(){return {...node}};
global.window={}; global.d3=null; global.updateCyprusWidth=silent;
global.localStorage={getItem:()=>null,setItem:silent};
const errors=[]; const originalLog=console.log;
console.log=(...args)=>{ if(String(args[0]).startsWith('Error'))errors.push(args.map(String).join(' ')); };
function finite(Q,keys){for(const key of keys)assert(Number.isFinite(Q[key]),key+' is not finite: '+Q[key]);}
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(err,game)=>{
 if(err)throw err;
 const ui=new lib.NullUserInterface(); ui.show_portraits=false;
 const engine=new lib.DendryEngine(ui,game);
 window.dendryUI={dendryEngine:engine};
 engine.beginGame([1,2,3,4,5]); engine.goToScene('root.start');
 let Q=engine.state.qualities;
 assert.deepEqual(Q.parties,['chp','TIP','AP','CGP','DP','MSP','MHP','other']);
 assert.equal(Q.year,1972); assert.equal(Q.prime_minister,'Nihat Erim');
 assert(!('z_relation' in Q)); assert(!('reichswehr_minister_party' in Q));
 // A rendering calculation must never create negative congress seats.
 engine._runActions(game.scenes.status.onArrival);
 engine._runActions(game.scenes['status.the_party'].onArrival);
 const congressKeys=['km','lk','ok','rk','tw'].map(f=>f+'_congress_seats');
 finite(Q,congressKeys);
 assert(congressKeys.every(k=>Q[k]>=0));
 assert.equal(congressKeys.reduce((sum,k)=>sum+Q[k],0),1200);
 // The historical execution vote must count only seats of each vote colour.
 const chart={width(){return this;},height(){return this;},innerRadiusCoef(){return this;},fromCenter(){return this;},smallToBig(){return this;},toCenter(){return this;},bigToSmall(){return this;},datum(){return this;},call(){return this;}};
 chart.enter=chart;chart.exit=chart;
 global.d3={parliament:()=>chart,select:()=>chart};
 engine._runActions(game.scenes['gezmis.commence'].onDisplay);
 assert.equal(Q.gezmisVoteAye,true);
 global.d3=null;
 engine.goToScene('root.start_main');
 for(let i=0;i<24;i++){Q.month_actions=1;engine.goToScene('post_event');}
 finite(Q,['inflation','unemployed','economic_growth','forex_pressure','chp_support','AP_support']);
 assert.equal(Q.year,1973); assert.equal(Q.month,1);
 // Actual national election path including post-election allocation and chart.
 Q.year=1973;Q.month=10;Q.week=1; Q.next_election_year=1973;Q.next_election_month=10;
 engine.state.jumpSceneId='national_elections.post_national_elections';
 engine.goToScene('election_algorithm');
 finite(Q,['chp_votes','AP_votes','chp_seats','AP_seats','progressive_coalition']);
 assert.equal(Q.parties.reduce((sum,p)=>sum+Q[p+'_seats'],0),450);
 Q.chp_seats=260;Q.in_CHP_majority=0; engine.goToScene('national_elections.CHP_majority');engine.goToScene('national_elections.ecevit_prime_minister');
 assert.equal(Q.prime_minister,'Bülent Ecevit');assert.equal(Q.defense_minister_party,'CHP');
 engine.goToScene('national_elections.drop_finance');assert.notEqual(Q.finance_minister_party,'CHP');assert.equal(Q.economic_minister_party,'CHP');
 Q.TIP_in_government=1; Q.TIP_coalition_dissent=4; engine.goToScene('TIP_vote_of_no_confidence.fall');
 assert.equal(Q.CHP_in_government,0);assert.equal(Q.next_election_time-Q.time,6);
 engine.state.jumpSceneId='main';engine.goToScene('local_election_algorithm');
 finite(Q,['chp_local_votes','AP_local_votes','chp_local_seats','AP_local_seats']);
 Q.year=1974;Q.month=7;Q.week=2;engine.goToScene('kibrisdarbe');assert.equal(Q.cyprus_mode,1);
 Q.military_strength=20; Q.cyprus_target_district='kyrenia';Q.cyprus_target_district_label='Kyrenia';
 engine.goToScene('cyprus_air_strike');
 engine.goToScene('status');
 engine.goToScene('library');
 Q.coup_timer=15;engine.goToScene('game_over');assert.equal(Q.game_over,1);
 if(errors.length)throw new Error(errors.join('\n'));
 console.log=originalLog;
 console.log('PASS: new game, 24 half-month turns, national election (450 seats), majority cabinet, finance portfolio drop, TIP collapse, local elections, Cyprus entry, dashboards and ending.');
});
