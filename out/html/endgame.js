/* Anatolian Dawn end-of-playthrough report. Read-only: never mutates game qualities. */
(function(root){
'use strict';
const number = value => typeof value==='number' && Number.isFinite(value) ? value : 0;
const clamp = (value, max) => Math.max(0, Math.min(max, Math.floor(number(value))));
const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const step = (label,key,max) => ({label,max,read:Q=>Q[key]});
const flag = (label,key) => ({label,max:1,read:Q=>Q[key] ? 1 : 0});
const custom = (label,max,read) => ({label,max,read});
const sections = [
 {id:'koykent',title:'Köykent (Land Reform)',items:[
  step('Land Reform','landreform_done',6),step('Land Reform Policy','land_reform',3),
  step('Köykent Programme','koykent_progress',7),flag('Köykent Education','koykentegitimm'),
  flag('Köykent Industry','koykenttt'),step('Agricultural Cooperatives','cooperative_done',3),
  step('Eastern Agricultural Support','east_agri_done',3),flag('Poppy Cultivation Legalization','hashas_done')
 ]},
 {id:'labor',title:'Labor Affairs',items:[
  flag('Collective Bargaining','nationall'),flag('Workplace Democracy','kitt'),
  flag('Secondary Strikes','ikincilgrevv'),flag('Factory Health Inspections','healthinspectionss'),
  flag('Employer Lockout Ban','lokavtt'),flag('Union Recognition','ps_bargaining')
 ]},
 {id:'interior',title:'Interior Affairs',items:[
  custom('Eastern Organized Crime',5,Q=>5-number(Q.eastern_crime===undefined?5:Q.eastern_crime)),
  step('Special Warfare Department Investigations','ohp_investigations',4),
  flag('Grey Wolves Ban','grey_wolves_banned'),flag('Raiders Ban','raiders_banned')
 ]},
 {id:'foreign',title:'Exterior Affairs',items:[
  flag('European Economic Community Application','aet'),
  step('Soviet Friendship and Credit Agreements','friendshipp',2),
  flag('Soviet Economic Cooperation Treaty','treatyy'),
  flag('PLO Recognition','fkoo'),flag('Pan-Arab Agreements','panarabb'),
  flag('Conservative Monarchy Agreements','monarchyy')
 ]},
 {id:'economy',title:'Economic Policy',items:[
  step('Export Economy Transition','Tiger',2),flag('IMF Agreement','imf_agreement'),
  flag('Economic Reform','economicreform')
 ]},
 {id:'fiscal',title:'Fiscal Affairs',items:[
  flag('Income Tax Bracket Reform','vergidilimii'),
  flag('Restrictions on Speculative Loans','speculativee')
 ]},
 {id:'industry',title:'Industrial Affairs',items:[
  flag('Industrialization Push','industryy'),flag('Electronics Industry','electronicc'),
  flag('Industrial Capacity Expansion','capacityy'),flag('Railway Expansion','demiryoluu')
 ]},
 {id:'education',title:'Education and Science',items:[
  flag('Curriculum Reform','curriculumm'),flag('Halk Eğitim Centers','halkegitimm'),
  flag('Student Rights','studentt'),flag('Teachers’ Political Freedoms','teacherr'),
  step('İmam Hatip Funding Cuts','imamhatipp',3)
 ]},
 {id:'women',title:'Women’s Rights',items:[
  step('Abortion Rights','legalizee',2),flag('Equal Pay','social_equal_pay'),
  step('Maternity Leave Reform','maternityy',3),flag('Social Security Expansion','guvenlikk')
 ]},
 {id:'judiciary',title:'Judiciary',items:[
  flag('Amnesty','Amnesty'),flag('Judicial Moderation','moderationn'),
  step('State Security Court Resistance','resistt',4),
  step('Anti-Communist Association Prosecutions','kmd_prosecutions',4)
 ]},
 {id:'religion',title:'Religious Affairs',items:[
  flag('Sectarian Affairs Office','sectarian_affairs_office_founded'),
  flag('Publication Compliance','religious_publications_compliant'),
  flag('Women Admitted to Religious Positions','religious_women_admitted'),
  step('Recruitment of Women','religious_women_recruitment',6)
 ]},
 {id:'kurdish',title:'Kurdish Issue',items:[
  ...[
   ['Freedom of Association','associations'],
   ['Public Discussion','public_discussion'],
   ['Publication Rights','publishing'],
   ['Public Meetings','meetings']
  ].map(([label,key])=>custom(label,1,Q=>Q.social_issues_state?.done?.[key]?1:0)),
  custom('Protection from State Violence',6,Q=>Q.social_issues_state?.counts?.oversight),
  custom('Eastern Agricultural Assistance',6,Q=>Q.social_issues_state?.counts?.agricultural_efforts)
 ]},
 {id:'people-sector',title:'Economic Democracy and People’s Sector',items:[
  flag('Found İYAK','iyak_established'),flag('Reform İYAK','ps_iyak_reformed'),
  flag('Reform MEYAK','ps_meyak_reformed'),flag('Establish Cooperative Umbrella','cooperative_umbrella_established'),
  step('Expand Cooperative Umbrella','ps_umbrella_expansions',4),
  flag('Integrate People’s Sector','peoples_sector_integrated'),
  step('Fund People’s Sector','ps_sector_funding',4),
  flag('Establish Cooperative Bank','cooperative_bank_founded'),
  step('Fund Cooperative Bank','ps_bank_funding',4),
  flag('Nationalize Mines','ps_mines_nationalized'),
  flag('Nationalize Petroleum','ps_petrol_nationalized'),
  flag('Establish HAYAT','ps_hayat_founded')
 ]},
 {id:'defense',title:'Military Affairs',items:[
  flag('Domestic Arms Manufacturing','MKE'),flag('Found ASELSAN','aselsann'),
  flag('Military Coup Averted', 'tsk_pacified')
 ]},
 {id:'municipalities',title:'Municipalities and Urban Development',items:[
  ...[
   ['Water and Sewage Infrastructure','waterlines',3],
   ['Public Transportation','publictransport',4],
   ['Public Libraries','libraries',2],
   ['Halk Ekmek Bakeries','halkekmek',2],
   ['Urban Roads','roads',3],
   ['Migration Restrictions','migration',1],
   ['Gecekondu Infrastructure','infrastructure',2],
   ['Gecekondu Integration','connect',1],
   ['Land Regularization','regularization',4],
   ['Large-Scale Urban Planning','planning',1],
   ['Gecekondu Transit and Services','transport',3],
   ['Gecekondu Industry','industry',3]
  ].map(([label,key,max])=>custom(label,max,Q=>{
    const s=Q.municipal_development;
    if(!s)return 0;
    const v=number(s.counts?.[key]);
    return s.version===2 || !['waterlines','publictransport','libraries','halkekmek','roads'].includes(key) ? v : Math.ceil(v/2);
  }))
 ]},
 {id:'cyprus',title:'Cyprus and Foreign Intervention',items:[
  flag('Atilla I','cyprus_atilla1_complete'),
  flag('Atilla II','cyprus_atilla2_complete'),
  flag('Saraçhane Rally','cyprus_rally_seen'),
  flag('US Arms Embargo','cyprus_embargo_applied'),
  flag('Settlement of the Cyprus Question','cyprus_campaign_resolved')
 ]}
];
function categories(Q){
 return sections.map(s=>({id:s.id,title:s.title,items:s.items.map(i=>{
   const completed=clamp(i.read(Q||{}),i.max);
   return {label:i.label,completed,max:i.max,done:completed===i.max};
 })}));
}
function render(Q){
 const data=categories(Q);
 const heading=Q && Q.coup_roll_success ? 'Military Coup — End of the Playthrough' : 'End of the Playthrough';
 return '<section class="anatolian-endgame" aria-label="Endgame progress report">'+
  '<h1>'+escape(heading)+'</h1>'+
  '<p class="endgame-date">'+escape(Q&&Q.year||'1982')+' · Final policy record</p>'+
  '<div class="endgame-sections">'+data.map(s=>'<details class="endgame-section"><summary>'+
   '<span>'+escape(s.title)+'</span><span class="endgame-section-count">'+s.items.filter(i=>i.done).length+'/'+s.items.length+' completed</span></summary>'+
   '<ul class="endgame-items">'+s.items.map(i=>'<li><span class="endgame-action">'+escape(i.label)+'</span>'+
   '<span class="endgame-steps">'+i.completed+'/'+i.max+'</span>'+
   '<span class="endgame-status '+(i.done?'is-done':'is-incomplete')+'">'+(i.done?'Completed':'Not completed')+'</span></li>').join('')+'</ul></details>').join('')+'</div></section>';
}
function install(ui){
 if(!ui||ui._anatolianEndgameInstalled)return;
 const previous=typeof ui.displayGameOver==='function'?ui.displayGameOver.bind(ui):null;
 ui.displayGameOver=function(){
  const Q=ui.dendryEngine?.state?.qualities;
  if(!Q || !Q.game_over) return previous&&previous();
  if(ui.$content?.html){
   ui.$content.html(render(Q));
   ui.$content.find('.anatolian-endgame').attr('tabindex','-1').trigger('focus');
  }
  if(typeof document!=='undefined'&&document.body) document.body.classList.add('anatolian-playthrough-ended');
 };
 ui._anatolianEndgameInstalled=true;
}
const api={categories,render,install,sections};
root.AnatolianEndgame=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
