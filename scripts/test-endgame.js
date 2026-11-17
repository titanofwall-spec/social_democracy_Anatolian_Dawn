const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
require('../out/html/rules.js');
require('../out/html/coalitions.js');
require('../out/html/cyprus-atilla1.js');
require('../out/html/cyprus-campaign.js');
require('../out/html/cyprus-roadmap.js');
const END=require('../out/html/endgame.js'),lib=require('dendrynexus/lib/engine.js');
const noop=()=>{},node={style:{},appendChild:noop,insertAdjacentElement:noop,insertBefore:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};
global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
let passed=0;const errors=[],log=console.log;console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
function test(label,fn){errors.length=0;fn();assert.deepEqual(errors,[],label);passed++;log('PASS '+label);}
function findSection(Q,id){const x=END.categories(Q).find(c=>c.id===id);assert(x,'Missing '+id);return x;}
function findRow(Q,id,label){const row=findSection(Q,id).items.find(x=>x.label===label);assert(row,'Missing '+label);return row;}
test('Endgame manifest reads real save counters and never mutates the state',()=>{
 const Q={landreform_done:5,koykent_progress:6,eastern_crime:1,nationall:1,imamhatipp:2,
    municipal_development:{version:2,counts:{waterlines:2}},social_issues_state:{done:{associations:true},counts:{oversight:4}}};
 const snapshot=JSON.stringify(Q);
 assert.deepEqual(findRow(Q,'koykent','Land Reform'),{label:'Land Reform',completed:5,max:6,done:false});
 assert.deepEqual(findRow(Q,'interior','Eastern Organized Crime'),{label:'Eastern Organized Crime',completed:4,max:5,done:false});
 assert.deepEqual(findRow(Q,'labor','Collective Bargaining'),{label:'Collective Bargaining',completed:1,max:1,done:true});
 assert.equal(findRow(Q,'education','İmam Hatip Funding Cuts').completed,2);
 assert.equal(findRow(Q,'municipalities','Water and Sewage Infrastructure').completed,2);
 assert.equal(findRow(Q,'kurdish','Freedom of Association').done,true);
 assert.equal(findRow(Q,'kurdish','Protection from State Violence').completed,4);
 assert.equal(JSON.stringify(Q),snapshot);
 assert(END.categories({}).length>=12,'Expected broad government policy coverage');
});
test('Endgame HTML has accessible expandable categories and no vanilla ending text',()=>{
 const html=END.render({year:1982,landreform_done:5,eastern_crime:1});
 assert(html.includes('<details class="endgame-section">'));
 assert(html.includes('<summary>'));
 assert(html.includes('Köykent (Land Reform)'));
 assert(html.includes('Interior Affairs'));
 assert(html.includes('5/6'));
 assert(html.includes('4/5'));
 assert(html.includes('Not completed'));
 assert(!html.includes('Hitler Does Not Yet Control Germany'));
 assert(!html.includes('Game Over (reload to read again)'));
});
test('Native browser game-over display is replaced and remains read-only',()=>{
 let rendered='',fallback=0;
 const node={attr:()=>node,trigger:()=>node};
 const fake={dendryEngine:{state:{qualities:{game_over:1,year:1982}}},$content:{html:v=>{rendered=v;},find:()=>node},displayGameOver:()=>{fallback++;}};
 END.install(fake);END.install(fake);
 fake.displayGameOver();
 assert(rendered.includes('End of the Playthrough'));
 assert.equal(fallback,0);
 fake.dendryEngine.state.qualities.game_over=0;
 fake.displayGameOver();assert.equal(fallback,1);
});
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(error,game)=>{
 if(error)throw error;
 function engine(){
  const ui=new lib.NullUserInterface();ui.show_portraits=false;
  const e=new lib.DendryEngine(ui,game);global.window.dendryUI=global.dendryUI={dendryEngine:e};
  e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');return e;
 }
 function enter1982(e){
  const Q=e.state.qualities;
  Object.assign(Q,{started:1,year:1981,month:12,week:2,month_actions:1,cyprus_mode:0,
    cyprus_preop_resume:0,cyprus_campaign_resume:0,coup_timer:0,tsk_pacified:1,
    endgame_1982_ignored:0,game_over:0});
  e.goToScene('post_event');
  return Q;
 }
 test('December 1981 advances to January 1982 and offers exactly Game over / Nah',()=>{
  const e=engine(),Q=enter1982(e);
  assert.equal(Q.year,1982);assert.equal(Q.month,1);assert.equal(Q.week,1);
  assert.equal(e.state.sceneId,'endgame_1982');
  assert.deepEqual(e.getCurrentChoices().map(x=>x.id),['endgame_1982.finish','endgame_1982.nah']);
  assert.equal(e.state.gameOver,false);
 });
 test('Nah permanently disables the date-triggered ending without ending or skipping turns',()=>{
  const e=engine(),Q=enter1982(e);
  const choice=e.getCurrentChoices().findIndex(c=>c.id==='endgame_1982.nah');
  e.choose(choice);
  assert.equal(Q.endgame_1982_ignored,1);assert.equal(e.state.gameOver,false);
  assert.equal(Q.year,1982);assert.equal(Q.month,1);assert.equal(Q.week,1);
  const snapshot=JSON.parse(JSON.stringify(e.getExportableState()));
  e.setState(snapshot);
  for(const [year,month,week] of [[1982,1,1],[1982,12,2],[1983,2,1]]){
   Object.assign(Q,{year,month,week,month_actions:1});
   e.goToScene('post_event');
   assert.notEqual(e.state.sceneId,'endgame_1982');
   assert.equal(Q.endgame_1982_ignored,1);
  }
 });
 test('Game over finishes the engine, awards achievements, and cannot resume gameplay',()=>{
  const e=engine(),Q=enter1982(e);
  const choice=e.getCurrentChoices().findIndex(c=>c.id==='endgame_1982.finish');
  e.choose(choice);
  assert.equal(e.state.gameOver,true);
  assert.equal(e.state.sceneId,'game_over');
  assert.equal(Q.game_over,1);
  assert.equal(Q.endgame_1982_chosen,1);
  assert.equal(e.isGameOver(),true);
 });
 test('A coup takes priority and still ends in the new report',()=>{
  const e=engine(),Q=e.state.qualities;
  Object.assign(Q,{started:1,year:1981,month:12,week:2,month_actions:1,coup_timer:15,
    tsk_pacified:0,army_in_government:0,cyprus_mode:0});
  e.goToScene('post_event');
  assert.equal(e.state.sceneId,'game_over');
  assert.equal(e.state.gameOver,true);
  assert.equal(Q.game_over,1);
 });
 test('Entering 1982 without advancing a turn does not launch the prompt mid-turn',()=>{
  const e=engine(),Q=e.state.qualities;
  Object.assign(Q,{started:1,year:1981,month:12,week:2,month_actions:0,tsk_pacified:1});
  e.goToScene('post_event');
  assert.equal(Q.year,1981);
  assert.notEqual(e.state.sceneId,'endgame_1982');
 });
 log(passed+' endgame scenarios passed');
});
