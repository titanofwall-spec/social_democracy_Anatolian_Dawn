const fs=require('fs'),assert=require('assert');
const r=require('../out/html/rules.js');require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const rm=r.cyprusRoadmap,loc=require('../docs/GENEVA_FLAVOR_LOCALIZATION.json');
const source=fs.readFileSync('source/scenes/events/cyprus_geneva_side.scene.dry','utf8').replace(/\r\n/g,'\n');
for(const [i,e] of loc.events.entries()){
 const block=source.split('@event'+(i+1)+'\n')[1].split('\n@continue')[0];
 assert(block.includes('title: '+e.title+'\n'));
 assert(block.includes('\n\n'+e.body+'\n\n- @continue'+(i+1)+': '+e.button+'\n'));
}
const scene=JSON.parse(fs.readFileSync('out/game.json','utf8')).scenes;
for(let i=1;i<=12;i++)assert.equal(scene['cyprus_geneva_side.event'+i].options.length,1);
function q(coalition,day,plan='denktas',backing=0){return {cyprus_campaign_version:2,cyprus_mode:1,CHP_in_government:1,MSP_in_government:+(coalition==='MSP'),AP_in_government:+(coalition==='AP'),CGP_in_government:+(coalition==='CGP'),cyprus_month:8,cyprus_day:day,cyprus_campaign_phase:'geneva2',cyprus_selected_plan:plan,cyprus_gunes_backing:backing,cyprus_roadmap_seen:['geneva2-10','geneva2-11','geneva2-12','geneva2-13'],cyprus_atilla1_results:[]};}
let cases=0;
for(const coalition of ['MSP','AP','CGP','alone'])for(const [plan,backing] of [['denktas',0],['gunes',0],['gunes',1]]){
 for(const [day,expected] of [[11,[7]],[12,[8]],[13,plan==='gunes'?[9]:[]],[14,backing?[10]:[10,11]]]){
 const Q=q(coalition,day,plan,backing),actual=[];
 while(rm.genevaSideEvent(Q)){
 const id=rm.genevaSideEvent(Q),before=JSON.parse(JSON.stringify(Q));actual.push(id);
 assert(rm.finishGenevaSideEvent(Q,id));before.cyprus_roadmap_seen.push('geneva-side-'+id);assert.deepEqual(Q,before);assert(!rm.finishGenevaSideEvent(Q,id));
 }
 assert.deepEqual(actual,expected);cases++;
 }
 const Q=q(coalition,15,plan,backing);Q.cyprus_campaign_phase='atilla2';Q.cyprus_roadmap_seen.push('geneva-side-11');assert.equal(rm.genevaSideEvent(Q),coalition==='MSP'?12:0);
 Q.cyprus_gunes_agreed=1;assert.equal(rm.genevaSideEvent(Q),0);
}
for(const [coalition,name] of [['MSP','İsmail Müftüoğlu'],['AP','Kamran İnan'],['CGP','Ferit Melen'],['alone','Fikret Gündoğan']])assert.equal(rm.delegationRepresentative(q(coalition,10)),name);
console.log('PASS exact localization, 12 compiled single-option scenes, '+cases+' coalition/plan/date cases, narrative-only acknowledgement, replay prevention and MSP aftermath gates');


for(const coalition of ['MSP','AP','CGP','alone']){
 for(const [month,day,seen,id] of [[7,26,[],1],[7,27,[],2],[7,29,[],3],[7,30,['geneva1'],4],[7,31,['geneva1'],5],[8,1,['declaration'],6]]){
  const Q=q(coalition,day);Q.cyprus_month=month;Q.cyprus_roadmap_seen=seen;Q.cyprus_atilla1_results=[25,26,28].map(day=>({day}));assert.equal(rm.genevaSideEvent(Q),id);
 }
 const Q=q(coalition,9);assert(rm.prepareEvent(Q));assert(Q.cyprus_roadmap_event_text.includes(loc.insertion.replace(/\n\n/g,'<br><br>')));
 const settled=q(coalition,14,'gunes',1);settled.cyprus_gunes_agreed=1;assert.equal(rm.genevaSideEvent(settled),0);
}
console.log('PASS Geneva I dates across all governments, exact opening insertion and accepted-settlement exclusion');
