'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const lib=require('dendrynexus/lib/engine.js');
require('../out/html/rules.js');
require('../out/html/peoples-sector.js');
require('../out/html/cyprus-atilla1.js');
require('../out/html/cyprus-campaign.js');
require('../out/html/cyprus-roadmap.js');
const noop=()=>{};
const node={remove:noop,style:{setProperty:noop},appendChild:noop,insertAdjacentElement:noop,insertBefore:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};
global.Image=function(){return {...node};};
global.window={};
global.d3=null;
global.updateCyprusWidth=noop;
global.localStorage={getItem:()=>null,setItem:noop};

lib.convertJSONToGame(fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8'),(err,game)=>{
  if(err)throw err;
  const cards=require('../out/html/card-actions.js');
  function fresh(){
    const e=new lib.DendryEngine(new lib.NullUserInterface(),game);
    window.dendryUI=global.dendryUI={dendryEngine:e};
    e.beginGame([1,2,3,4,5]);
    e.goToScene('root.start');
    e.goToScene('root.start_main');
    Object.assign(e.state.qualities,{year:1972,month:4,week:1,rubicon_mode:1,rubicon_week:3,CHP_party_leader:'Ecevit',resources:12,cyprus_mode:0});
    return e;
  }
  function approval(scene,delta) {
    const e=fresh(),Q=e.state.qualities;
    const prior=Q.inonu_approval,relation=Q.inonu_relation;
    e.goToScene(scene);
    assert.equal(Q.inonu_approval,prior+delta,scene+' did not change the on-screen approval value');
    assert.equal(Q.inonu_relation,relation+delta,scene+' did not change the underlying relation');
  }
  approval('rubicon_inonu_walkout.continue_assembly',-5);
  approval('rubicon_inonu_walkout.end_assembly',5);
  approval('rubicon_inonu_preparations.object',-5);
  approval('rubicon_interpellation_passes',-8);
  approval('rubicon_interpellation_fails',-4);
  approval('rubicon_melen_invitation.join',5);
  approval('rubicon_melen_invitation.refuse',-10);
  {
    const e=fresh(),Q=e.state.qualities;
    Q.inonu_approval=2;
    e.goToScene('rubicon_melen_invitation.refuse');
    assert.equal(Q.inonu_approval,0,'approval must not become negative');
  }
  {
    const e=fresh(),Q=e.state.qualities;
    Q.CHP_party_leader='Ecevit';
    Q.intraparty_timer=0;Q.remnants_of_inonu_timer=0;Q.inonuu=0;
    assert(game.scenes.intrapartyinfluence.tags.includes('dovevsbayonet'));
    assert(game.scenes.remnantsofinonu.tags.includes('dovevsbayonet'));
    assert(!game.scenes.intrapartyinfluence.tags.includes('party_affairs'));
    assert(!game.scenes.remnantsofinonu.tags.includes('party_affairs'));
    assert(e._runPredicate(game.scenes['main.dovevsbayonet'].viewIf));
    assert(!game.scenes.ecevitandworker.options.some(o=>/navigation_return_main/.test(o.id)));
    for(const id of ['ecevitandworker.yes','ecevitandworker.no'])
      assert(game.scenes[id].goTo.some(t=>t.id==='post_event'),'Nazilli choice must continue the story');
  }
  {
    const e=fresh(),Q=e.state.qualities;
    Q.resources=1;
    const choice=e._compileChoices(game.scenes.relations_with_the_army).find(c=>c.id==='relations_with_the_army.connections');
    assert(choice && !choice.canChoose && /resources/i.test(choice.subtitle));
    const before=Q.coup_timer,workers=Q.workers_chp,dissent=Q.left_kemalists_dissent;
    e._runActions(game.scenes['relations_with_the_army.statements'].onArrival);
    assert(Q.workers_chp<workers,'public reassurance must cost political support');
    assert(Q.left_kemalists_dissent>dissent,'public reassurance must cause internal dissent');
    assert(Q.coup_timer<=before,'reassurance must not raise pressure');
  }
  {
    const e=fresh(),Q=e.state.qualities;
    Q.resources=5;Q.coup_timer=10;
    const resources=Q.resources,dissent=Q.left_kemalists_dissent;
    e._runActions(game.scenes['relations_with_the_army.connections'].onArrival);
    assert.equal(Q.resources,resources-2,'private concessions must cost two resources');
    assert(Q.left_kemalists_dissent>dissent,'private talks must also have a factional cost');
  }
  {
    const status=fs.readFileSync(path.join(__dirname,'../source/scenes/status.scene.dry'),'utf8');
    assert(status.includes('a leading figure in [+ CGP_name +]'),'Melen affiliation must follow the current party name');
    const registry=fs.readFileSync(path.join(__dirname,'../out/html/data.js'),'utf8');
    for(const name of ['Nihat Erim','Süleyman Demirel','İsmet İnönü','Bülent Ecevit','Çankaya Palace'])
      assert(registry.includes("['"+name+"'"),'historical tooltip missing for '+name);
    const army=fs.readFileSync(path.join(__dirname,'../source/scenes/party_affairs/relations_with_the_army.scene.dry'),'utf8');
    assert(!/pressure by (?:up to )?\d+ points?/i.test(army),'visible action must not expose pressure numbers');
    const mandate=fs.readFileSync(path.join(__dirname,'../source/scenes/events/rubicon_melen_mandate.scene.dry'),'utf8');
    assert(mandate.includes('Melen invites the CHP into his government'));
    const dp=fs.readFileSync(path.join(__dirname,'../source/scenes/events/rubicon_dp_motion.scene.dry'),'utf8');
    assert(dp.includes('Both the MGP and the AP parliamentary factions have been convinced'));
  }
  console.log('PASS Rubicon branches, displayed approval, army trade-offs, congress cards, Nazilli progression, tooltips, and copy.');
});
