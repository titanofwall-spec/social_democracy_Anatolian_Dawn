const fs=require('fs'),path=require('path'),assert=require('assert');
const R=require('../out/html/rules.js'),C=require('../out/html/coalitions.js'),lib=require('dendrynexus/lib/engine.js');
const noop=()=>{},node={remove:noop,appendChild:noop,insertAdjacentElement:noop,insertBefore:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},style:{setProperty:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};
global.window={};global.d3=null;global.Image=function(){return {...node};};global.localStorage={getItem:()=>null,setItem:noop};global.updateCyprusWidth=noop;
const output=console.log,errors=[];console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
const compiled=fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8');
lib.convertJSONToGame(compiled,(err,game)=>{
 if(err)throw err;
 let count=0;
 function test(label,fn){errors.length=0;fn();assert.deepEqual(errors,[],label);count++;output('PASS '+label);}
 function engine(extra={}){
  const e=new lib.DendryEngine(new lib.NullUserInterface(),game);
  window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');
  Object.assign(e.state.qualities,{year:1973,month:10,week:2,largest_party_key:'chp',chp_seats:230,AP_seats:130,CGP_seats:35,MSP_seats:25,DP_seats:20,CHP_party_leader:'Ecevit',AP_party_leader:'Demirel',MSP_party_leader:'Erbakan'},extra);
  C.start(e.state.qualities);return e;
 }
 const displayed=x=>typeof x==='string'?x:Array.isArray(x)?x.map(displayed).join(' '):x&&typeof x==='object'?displayed(x.content):'';
 for(const year of [1973,1977,1981]){
  test(year+' outright CHP victory goes directly to the full special event',()=>{
   const e=engine({year}),Q=e.state.qualities;
   assert.equal(Q.coalition_formation.stage,'mandate');
   e.goToScene('coalition_negotiations');
   assert.equal(e.state.sceneId,'coalition_negotiations.chp_majority');
   assert.equal(Q.coalition_formation.stage,'formed');
   assert.equal(Q.in_CHP_majority,1);assert.equal(Q.CHP_in_government,1);assert.equal(Q.prime_minister_party,'CHP');
   assert.equal(Q.prime_minister,'Bülent Ecevit');
   assert(C.ministries.every(m=>Q[m+'_minister_party']==='CHP'));
   const prose=C.eventText(Q,'chp_majority');
   assert(prose.includes('Well... We have done it.'),'Missing canonical opening');
   assert(prose.includes('without having to make a single coalition agreement'),'Missing canonical ending');
   assert(prose.length>2000,'Full narrative shortened into a generic government announcement');
   const shown=displayed(e.state.currentContent);
   assert(shown.includes('Well... We have done it.'),'Announcement not rendered in scene');
   assert(e.getCurrentChoices().some(choice=>choice.id==='root'));
   if(year!==1973)assert(!prose.includes('has not been the largest party since 1961'));
  });
 }
 test('225 seats do not bypass negotiations',()=>{
  const e=engine({year:1977,chp_seats:225,AP_seats:155}),Q=e.state.qualities;
  e.goToScene('coalition_negotiations');
  assert.equal(e.state.sceneId,'coalition_negotiations.mandate');
  assert.equal(Q.in_CHP_majority,0);
 });
 test('AP majority still uses the normal mandate and its own government path',()=>{
  const e=engine({year:1977,chp_seats:170,AP_seats:230,largest_party_key:'AP'}),Q=e.state.qualities;
  e.goToScene('coalition_negotiations');
  assert.equal(e.state.sceneId,'coalition_negotiations.mandate');
  assert.equal(Q.CHP_in_government,0);
  const choice=e.getCurrentChoices().find(c=>c.id==='coalition_negotiations.ap_majority');assert(choice&&!choice.unavailable);
 });
 output(count+' CHP-majority routing and narrative scenarios passed.');
});
