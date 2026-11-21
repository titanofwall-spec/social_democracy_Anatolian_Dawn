const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),rules=require('../out/html/rules.js');
require('../out/html/cyprusgame/js/atilla-i.js');require('../out/html/cyprusgame/js/campaign.js');require('../out/html/cyprusgame/js/roadmap.js');
const lib=require('dendrynexus/lib/engine.js'),c=rules.cyprusAtilla1,rm=rules.cyprusRoadmap,cp=rules.cyprusCampaign;
const fixture=require('./fixtures/cyprus/incidents.json'),noop=()=>{},node={remove:noop,appendChild:noop,insertAdjacentElement:noop,insertBefore:noop,setAttribute:noop,addEventListener:noop,style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',offsetWidth:600};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.localStorage={getItem:()=>null,setItem:noop};global.d3=null;global.updateCyprusWidth=noop;
const output=console.log,errors=[];console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
function q(strength=.8,bonus=0){const Q={army_land_strength:strength,army_aerial_strength:strength,army_naval_strength:strength,year:1974,month:7,week:2,CHP_in_government:1,prime_minister_party:'CHP',hashas_done:0,us_relation:80,west_relation:80};c.initialize(Q);cp.initialize(Q);Object.assign(Q,{cyprus_mode:1,cyprus_year:1974,cyprus_month:7,cyprus_day:21,cyprus_operation_started:1,military_strength:100,cyprus_support_bonus:bonus});return Q;}
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(err,game)=>{
 if(err)throw err;let count=0;
 function test(label,run){errors.length=0;run();assert.deepEqual(errors,[],label);count++;output('PASS '+label);}
 function fresh(){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:7,week:2,CHP_in_government:1,prime_minister_party:'CHP',hashas_done:0,us_relation:80,west_relation:80,flavour_events:0,army_land_strength:.8,army_aerial_strength:.8,army_naval_strength:.8});cp.initialize(e.state.qualities);Object.assign(e.state.qualities,{cyprus_mode:1,cyprus_calendar_advance:0,cyprus_year:1974,cyprus_month:7,cyprus_day:21,cyprus_operation_started:1,military_strength:100});return e;}
 function pick(e,id){const choices=e.getCurrentChoices(),i=choices.findIndex(x=>x.id===id);assert(i>=0,'Missing '+id+' at '+e.state.sceneId);assert(choices[i].canChoose!==false,id+' disabled');e.choose(i);}
 function text(v){if(typeof v==='string')return v;if(Array.isArray(v))return v.map(text).join(' ');return v&&typeof v==='object'?text(v.content):'';}
 const normalize=s=>s.replace(/\s+/g,' ').trim();
 function shown(e,id){const f=fixture[id],choices=e.getCurrentChoices();assert.equal(e.state.sceneId,f.scene);assert.equal(choices.length,1);assert.equal(text(choices[0].title),f.continue);const display=normalize(text(e.state.currentContent));for(const p of f.body.split(/\n\n+/))assert(display.includes(normalize(p)),id+' missing paragraph');}
 test('All six finalized descriptions, titles and Continue labels are stored unchanged',()=>{
  assert.equal(Object.keys(fixture).length,6);
  for(const f of Object.values(fixture)){const s=fs.readFileSync(require('./project-files.js').sceneSourcePath(root, 'source/scenes/events/'+f.scene+'.scene.dry'),'utf8').replace(/\r\n/g,'\n');assert(s.startsWith('title: '+f.title+'\n'));assert(s.includes('\n= '+f.title+'\n\n'+f.body+'\n\n- @continue: '+f.continue+'\n'));assert(game.scenes[f.scene]);}
  assert.equal(fixture.saved.title,'A Last Minute Save');assert.equal(fixture.niki.title,'Operation Failure');
 });
 test('Every strength threshold uses the existing five military tiers and the specified 10–50% bases',()=>{
  for(const [strength,base] of [[0,10],[.199999,10],[.2,20],[.399999,20],[.4,30],[.599999,30],[.6,40],[.799999,40],[.8,50],[1,50]]){const Q=q(strength);assert.equal(rm.kocatepeChance(Q).baseChance,base);assert.equal(rm.kocatepeChance(Q).chance,base);}
 });
 test('Kocatepe tooltip explicitly lists all five success tiers and one-point bonuses',()=>{
  const tooltip=c.choiceTooltip('cyprus_phantom_convoy.continue');
  for(const part of ['1 (Critical) 10%','2: 20%','3: 30%','4: 40%','5 (Excellent) 50%','+1 percentage point','60% success, 40% failure'])
   assert(tooltip.includes(part),part);
  const Q=q(0.8,10);assert.equal(rm.kocatepeChance(Q).chance,60);
 });
 test('All +0 through +10 bonuses use exact percentage boundaries, one draw and no extra resource charge',()=>{
  for(const strength of [.1,.3,.5,.7,.9])for(let bonus=0;bonus<=10;bonus++)for(const success of [true,false]){
   const Q=q(strength,bonus),chance=rm.kocatepeChance(Q).chance,base=rm.kocatepeChance(Q).baseChance,resources=Q.military_strength,spent=Q.cyprus_support_spent;
   let draws=0;assert(rm.resolveKocatepe(Q,()=>{draws++;return chance/100+(success?-1e-9:0);}));
   assert.equal(draws,1);assert.equal(Q.cyprus_kocatepe_result.success,success);assert.equal(Q.cyprus_kocatepe_result.shipLost,!success);assert.equal(Q.cyprus_kocatepe_result.baseChance,base);assert.equal(Q.cyprus_kocatepe_result.supportBonus,bonus);assert.equal(Q.cyprus_kocatepe_result.chance,base+bonus);
   assert.equal(Q.cyprus_support_bonus,0);assert.equal(Q.military_strength,resources);assert.equal(Q.cyprus_support_spent,spent);assert.equal(Q.cyprus_day,21);
   assert(!rm.resolveKocatepe(Q,()=>{throw Error('Rerolled');}));assert.equal(rm.incidentScene(Q),success?fixture.saved.scene:fixture.sunk.scene);
  }
 });
 test('Actual bottom-panel support actions fund the Kocatepe roll and cannot leak into the next operation',()=>{
  const Q=q();for(const key of ['reinforce','smuggle','strike','paratrooper'])assert(c.useSupport(Q,key,c.supportActions[key].side),key);
  assert.equal(Q.cyprus_support_bonus,10);assert.equal(Q.military_strength,78);assert.equal(Q.cyprus_support_spent,22);assert(!c.useSupport(Q,'bombard','greek'));
  assert(rm.resolveKocatepe(Q,()=>.59));assert.equal(Q.cyprus_kocatepe_result.chance,60);assert(Q.cyprus_kocatepe_result.success);assert.equal(Q.military_strength,78);assert.equal(Q.cyprus_support_bonus,0);
  assert(rm.finishIncident(Q,'kocatepe-outcome'));assert(rm.resolveMilitary(Q,21,'historical',()=>1));assert.equal(Q.cyprus_atilla1_results.at(-1).supportBonus,0);
 });
 for(const success of [true,false])test((success?'Saved':'Sunk')+' sequence is convoy → one outcome → main operation → July 22 Niki, with persistent saves',()=>{
  const e=fresh();e.goToScene('cyprus_campaign_continue');shown(e,'phantom');let Q=e.state.qualities;
  assert(!Q.cyprus_kocatepe_result);assert.equal(rm.finishIncident(Q,'kocatepe-outcome'),false);
  e.goToScene(fixture.phantom.scene);assert(!Q.cyprus_kocatepe_result,'Opening a popup must not roll');
  Q.cyprus_support_bonus=5;const resources=Q.military_strength,day=Q.cyprus_day;e.random.random=()=>success?0:1;
  pick(e,'cyprus_phantom_convoy.continue');shown(e,success?'saved':'sunk');assert.equal(Q.cyprus_day,day);assert.equal(Q.military_strength,resources);assert.equal(Q.cyprus_support_bonus,0);assert.equal(Q.cyprus_kocatepe_result.success,success);
  assert.equal(e._runPredicate(game.scenes[fixture[success?'sunk':'saved'].scene].viewIf),false);
  const state=JSON.parse(JSON.stringify(e.getExportableState()));e.setState(state);Q=e.state.qualities;e.random.random=()=>{throw Error('Reload rerolled');};e.goToScene(state.sceneId);shown(e,success?'saved':'sunk');assert(!rm.resolveKocatepe(Q,e.random.random));
  pick(e,fixture[success?'saved':'sunk'].scene+'.continue');assert.equal(e.state.sceneId,'cyprus_atilla1_21');assert.equal(Q.cyprus_day,21);assert.equal(rm.incidentScene(Q),null);
  e.random.random=()=>1;pick(e,'cyprus_atilla1_21.historical');assert.equal(Q.cyprus_day,22);assert.equal(Q.cyprus_atilla1_results.at(-1).supportBonus,0);
  pick(e,'cyprus_atilla1_continue');shown(e,'niki');assert.equal(Q.cyprus_day,22);pick(e,'cyprus_operation_failure.continue');assert.equal(e.state.sceneId,'cyprus_atilla1_22');assert.equal(rm.incidentScene(Q),null);assert(!rm.finishIncident(Q,'niki'));
 });
 test('Taşkent reports follow August 15 combat only on the second-operation route',()=>{
  const e=fresh(),Q=e.state.qualities;Object.assign(Q,{cyprus_month:8,cyprus_day:15,cyprus_atilla2_started:1,cyprus_campaign_phase:'atilla2',cyprus_atilla2_start_day:14,cyprus_atilla2_results:[{day:14}]});assert.equal(rm.incidentScene(Q),null);
  Q.cyprus_day=16;assert.equal(rm.incidentScene(Q),null);Q.cyprus_atilla2_results.push({day:15});e.goToScene('cyprus_campaign_continue');shown(e,'taskent');const military=JSON.stringify(Q.cyprus_atilla2_results);pick(e,'cyprus_taskent.continue');assert.equal(Q.cyprus_day,16);assert.equal(JSON.stringify(Q.cyprus_atilla2_results),military);assert.equal(e.state.sceneId,'cyprus_roadmap_event');assert(!rm.finishIncident(Q,'taskent'));
  for(const second of [0,1]){const peaceful=q();Object.assign(peaceful,{cyprus_month:8,cyprus_day:21,cyprus_gunes_agreed:1,cyprus_campaign_phase:'implementation',cyprus_atilla2_started:second,cyprus_atilla2_results:[{day:15}]});assert.equal(rm.incidentScene(peaceful),null);}
 });
 test('Gratitude follows the final settlement and precedes the existing one-time rally without early calendar changes',()=>{
  const e=fresh(),Q=e.state.qualities;Object.assign(Q,{cyprus_month:8,cyprus_day:30,cyprus_campaign_resolved:1,cyprus_final_result:'Güneş Plan',cyprus_campaign_phase:'settled',year:1974,month:8,week:2});
  e.goToScene('cyprus_campaign_final');pick(e,'cyprus_campaign_final.root');shown(e,'gratitude');assert.equal(Q.month,8);assert.equal(Q.cyprus_mode,1);assert(!Q.cyprus_rally_pending);
  const save=JSON.parse(JSON.stringify(e.getExportableState()));e.setState(save);e.goToScene(save.sceneId);shown(e,'gratitude');pick(e,'cyprus_gratitude.continue');const current=e.state.qualities;assert.equal(e.state.sceneId,'cyprus_sarachane_rally');assert.equal(current.cyprus_mode,0);assert.equal(current.month,9);assert(rm.incidentSeen(current,'gratitude'));assert(!rm.gratitudePending(current));assert(!rm.finishIncident(current,'gratitude'));
  for(const result of ['Military Defeat','Non-Intervention']){const failed=q();Object.assign(failed,{cyprus_campaign_resolved:1,cyprus_final_result:result});assert(!rm.gratitudePending(failed));}
 });
 test('Later old saves get no backdated convoy, and ordinary rolls retain their original score ranges',()=>{
  const Q=q();Q.cyprus_day=23;assert.equal(rm.incidentScene(Q),null);assert(!rm.resolveKocatepe(Q,()=>{throw Error('Backdated roll');}));
  for(let tier=0;tier<5;tier++)for(let req=1;req<=3;req++)for(const draw of [0,.2,.5,.999999,1]){const minimum=tier>=req?50:0,maximum=tier>=req?80:60,expected=Math.min(80,minimum+Math.floor(Math.min(draw,1-Number.EPSILON)*(maximum-minimum+1))+Math.max(0,tier-req)*5);assert.equal(c.roll(tier,req,()=>draw),expected);}
 });
 test('The Last Laugh follows the first actual military result exactly once without consuming its next bonus',()=>{
  const e=fresh(),Q=e.state.qualities;Q.cyprus_day=20;e.random.random=()=>1;e.goToScene('cyprus_atilla1_20');pick(e,'cyprus_atilla1_20.historical');assert.equal(Q.cyprus_day,21);assert.notEqual(e.state.sceneId,'cyprus_last_laugh');
  Q.cyprus_support_bonus=5;pick(e,'cyprus_atilla1_continue');assert.equal(e.state.sceneId,'cyprus_last_laugh');assert.equal(text(e.getCurrentChoices()[0].title),'Well, here we are!');assert(normalize(text(e.state.currentContent)).includes('We did arrive in the morning rather than at night, afterall'));
  pick(e,'cyprus_last_laugh.continue');assert.equal(e.state.sceneId,'cyprus_phantom_convoy');assert.equal(Q.cyprus_support_bonus,5);assert.equal(Q.cyprus_day,21);assert(!rm.finishIncident(Q,'last-laugh'));
 });
 output('PASS: '+count+' Cyprus incident groups, including 110 controlled Kocatepe outcomes.');
});
