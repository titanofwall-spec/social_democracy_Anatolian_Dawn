/* Kurdish political organizations. Gameplay founding dates and coefficients supplied by the author. */
(function(root){
'use strict';
const R=root.AnatolianRules||(typeof require==='function'?require('./rules.js'):null);
const config={version:1,unaffiliated:{u0:.80,u1:1.00,u2:.55,u3:.25},organizations:[
 {id:'t_kdp',name:'T-KDP',aliases:[],founded:[1965,1,1],initialSupport:500,a:.95,b:.30,c:.15,O:null,A:null},
 {id:'dhkd_tksp',name:'DHKD/TKSP',aliases:[],founded:[1974,12,1],initialSupport:250,a:.60,b:1.00,c:.20,O:null,A:null},
 {id:'ddkd_ppkk_kip',name:'DDKD/PPKK/KİP',aliases:['DDKD/KİP'],founded:[1975,1,1],initialSupport:1500,a:.20,b:.95,c:.50,O:null,A:null},
 {id:'asdkd_rizgari',name:'ASDKD/Rızgari',aliases:['ASDKD'],founded:[1976,3,1],initialSupport:500,a:.10,b:.85,c:.60,O:null,A:null},
 {id:'ala_rizgari',name:'Ala Rızgari',aliases:[],founded:[1979,1,1],initialSupport:1200,a:.03,b:.60,c:.85,O:null,A:null},
 {id:'kawa',name:'Kawa',aliases:[],founded:[1976,1,1],initialSupport:250,a:.03,b:.50,c:.85,O:null,A:null},
 {id:'denge_kawa',name:'Denge Kawa',aliases:[],founded:[1978,1,1],initialSupport:300,a:.04,b:.55,c:.70,O:null,A:null},
 {id:'red_kawa',name:'Red Kawa',aliases:[],founded:[1978,1,1],initialSupport:450,a:.02,b:.45,c:.90,O:null,A:null},
 {id:'t_kdp_kuk',name:'T-KDP/KUK',aliases:[],founded:[1978,5,1],initialSupport:1000,a:.05,b:.70,c:.90,O:null,A:null},
 {id:'kd_uko_pkk',name:'KD/UKO/PKK',aliases:[],founded:[1974,1,1],initialSupport:50,a:.01,b:.25,c:1.00,O:null,A:null},
 {id:'tekosin',name:'Tekoşin',aliases:[],founded:[1978,1,1],initialSupport:150,a:.02,b:.40,c:.90,O:null,A:null}
]};
const announcements=[
 {year:1965,date:[1965,1,1],title:'T-KDP Is Founded',ids:['t_kdp']},
 {year:1974,date:[1974,12,1],title:'KD/UKO/PKK and DHKD/TKSP Are Founded',ids:['kd_uko_pkk','dhkd_tksp']},
 {year:1975,date:[1975,1,1],title:'DDKD/PPKK/KİP Is Founded',ids:['ddkd_ppkk_kip']},
 {year:1976,date:[1976,3,1],title:'Kawa and ASDKD Are Founded',ids:['kawa','asdkd_rizgari']},
 {year:1978,date:[1978,5,1],title:'New Kurdish Political Organizations Emerge',ids:['denge_kawa','red_kawa','tekosin','t_kdp_kuk']},
 {year:1979,date:[1979,1,1],title:'Ala Rızgari Is Founded',ids:['ala_rizgari']}
];
const finite=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d;
const bound=v=>Math.max(0,Math.min(1,finite(v)));
const stamp=date=>date[0]*10000+date[1]*100+date[2];
const dateOf=Q=>[finite(Q.year,1972),finite(Q.month,1),Q.week===2?16:1];
const number=v=>Math.max(0,finite(v));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function coefficient(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1;}
function validate(data=config){
 const ids=new Set();for(const g of data.organizations){if(ids.has(g.id))throw new RangeError('Duplicate Kurdish organization: '+g.id);ids.add(g.id);for(const k of ['a','b','c'])if(!coefficient(g[k]))throw new RangeError(g.id+': '+k+' must be within 0–1');if(!Number.isInteger(g.initialSupport)||g.initialSupport<0)throw new RangeError(g.id+': invalid founding support');if(g.founded.length!==3||!g.founded.every(Number.isInteger)||g.founded[1]<1||g.founded[1]>12||g.founded[2]!==1)throw new RangeError(g.id+': invalid founding date');}
 for(const k of ['u0','u1','u2','u3'])if(!coefficient(data.unaffiliated[k]))throw new RangeError('Invalid unaffiliated coefficient: '+k);
 return true;
}
function inputs(Q){const m=R.kurdishModel(Q);return {date:dateOf(Q),X:bound(m.consciousness),Y:bound(m.radicalism),Z:bound(m.paramilitarism),kurdishPopulation:number(m.kurdishPopulation)};}
function recordFor(Q,g,now){
 const saved=Q.kurdish_org_state?.records?.[g.id];if(saved)return saved;
 // Pure preview for old saves and direct date changes; persistence occurs in update().
 return {foundedOn:stamp(g.founded),seededAt:stamp(g.founded)===now?now:null,seedPending:stamp(g.founded)===now};
}
function resolve(g,overrides){const own=overrides?.[g.id]||{};return {...g,O:Object.prototype.hasOwnProperty.call(own,'O')?own.O:g.O,A:Object.prototype.hasOwnProperty.call(own,'A')?own.A:g.A,enabled:own.active!==false};}
function calculate(input,options={}){
 const data=options.config||config;validate(data);
 const X=bound(input.X),Y=bound(input.Y),Z=bound(input.Z),kurdishPopulation=number(input.kurdishPopulation),PC=kurdishPopulation*X,M=1-Y,radicalEnvironment=Y*(1-Z),P=Y*Z,now=stamp(input.date),u=data.unaffiliated;
 const unaffiliatedScore=u.u0+u.u1*M+u.u2*radicalEnvironment+u.u3*P;
 const organizations=data.organizations.map(g=>{const definition=resolve(g,options.overrides),active=definition.enabled&&stamp(g.founded)<=now;return {...definition,active,score:active?g.a*M+g.b*radicalEnvironment+g.c*P:0};});
 const totalScore=unaffiliatedScore+organizations.reduce((total,g)=>total+g.score,0),activeCount=organizations.filter(g=>g.active).length;
 const unaffiliatedShare=totalScore>0?unaffiliatedScore/totalScore:1,unaffiliated=PC*unaffiliatedShare,missingConfiguration=[];
 let seeded=false;
 for(const g of organizations){
  g.share=g.active&&totalScore>0?g.score/totalScore:0;g.normalSupport=PC*g.share;g.support=g.normalSupport;g.foundingSeed=false;g.configurationErrors=[];
  if(!g.active){g.support=0;g.members=0;g.armed=0;g.capacity=null;g.orientation=null;continue;}
  const record=options.records?.[g.id];if(record?.seedPending&&record.seededAt===now){g.support=Math.min(g.initialSupport,kurdishPopulation);g.foundingSeed=true;g.seedPopulationLimited=g.support!==g.initialSupport;seeded=true;}
  for(const key of ['O','A'])if(!coefficient(g[key])){const issue={id:g.id,name:g.name,field:key,reason:g[key]===null||g[key]===undefined?'not configured':'invalid: expected 0–1'};g.configurationErrors.push(issue);missingConfiguration.push(issue);}
  g.capacity=coefficient(g.O)?g.O:null;g.orientation=coefficient(g.A)?g.A:null;
  g.members=g.capacity===null?null:g.support*g.capacity;
  // Zero Z proves zero armed personnel without pretending the missing O/A values are zero.
  g.armed=Z===0||g.orientation===0||g.members===0?0:g.members===null||g.orientation===null?null:g.members*g.orientation*Z*Z;
 }
 const active=organizations.filter(g=>g.active),knownMembers=active.reduce((n,g)=>n+(g.members===null?0:g.members),0),knownArmed=active.reduce((n,g)=>n+(g.armed===null?0:g.armed),0),allocated=unaffiliated+active.reduce((n,g)=>n+g.support,0);
 return {X,Y,Z,kurdishPopulation,PC,M,R:radicalEnvironment,P,unaffiliatedScore,totalScore,unaffiliatedShare,unaffiliated,organizations,activeOrganizations:active,activeCount,totalSupport:active.reduce((n,g)=>n+g.support,0),allocatedPopulation:allocated,populationDifference:allocated-PC,totalMembers:active.some(g=>g.members===null)?null:knownMembers,totalArmed:active.some(g=>g.armed===null)?null:knownArmed,knownMembers,knownArmed,missingConfiguration,mode:seeded?'founding initialization':'normal',populationConserved:Math.abs(allocated-PC)<Math.max(1,PC)*1e-10};
}
function signature(Q,input){return JSON.stringify([input,config,Q.kurdish_org_overrides||{},Q.kurdish_org_state?.records||{}]);}
function snapshot(Q){
 const input=inputs(Q),key=signature(Q,input),saved=Q.kurdish_org_state;
 if(saved?.signature===key&&saved.result)return saved.result;
 const now=stamp(input.date),records=Object.fromEntries(config.organizations.map(g=>[g.id,recordFor(Q,g,now)]));
 return calculate(input,{records,overrides:Q.kurdish_org_overrides});
}
function update(Q){
 if(!Q.started)return snapshot(Q);
 const input=inputs(Q),now=stamp(input.date);
 if(Q.kurdish_org_state?.version!==1){const legacy={};for(const key of Object.keys(Q))if(/^kurdish_group_\d+_militarization$/.test(key)){legacy[key]=Q[key];delete Q[key];}Q.kurdish_org_state={version:1,initializedAt:now,lastDate:now,records:{},legacyMilitarization:legacy};}
 const state=Q.kurdish_org_state;if(!Q.kurdish_org_announcements)Q.kurdish_org_announcements={};
 for(const g of config.organizations){const founding=stamp(g.founded);if(founding>now)continue;if(!state.records[g.id])state.records[g.id]={foundedOn:founding,seededAt:founding===now?now:null,seedPending:founding===now};const record=state.records[g.id];if(record.seedPending&&now>record.seededAt)record.seedPending=false;}
 state.lastDate=now;state.signature=signature(Q,input);state.result=calculate(input,{records:state.records,overrides:Q.kurdish_org_overrides});return state.result;
}
function announcementDue(Q,year){const event=announcements.find(e=>e.year===year);if(!event||Q.year!==year||Q.kurdish_org_announcements?.[year])return false;const now=stamp(dateOf(Q)),baseline=Q.kurdish_org_state?.initializedAt??now,due=stamp(event.date);return now>=due&&baseline<=due;}
function acknowledge(Q,year){if(!Q.kurdish_org_announcements)Q.kurdish_org_announcements={};Q.kurdish_org_announcements[year]=true;}
function displayCounts(model){
 // Largest remainders reconcile the displayed support pools to rounded PC in normal mode.
 const entries=[...model.activeOrganizations.map(g=>({id:g.id,value:g.support})),{id:'unaffiliated',value:model.unaffiliated}],out={};let total=0;
 for(const e of entries){out[e.id]=Math.floor(e.value);total+=out[e.id];}const target=model.mode==='normal'?Math.round(model.PC):Math.round(model.allocatedPopulation),sorted=entries.slice().sort((a,b)=>(b.value-Math.floor(b.value))-(a.value-Math.floor(a.value))||a.id.localeCompare(b.id));for(let i=0;i<target-total;i++)out[sorted[i%sorted.length].id]++;
 return out;
}
const count=v=>v===null?'Not configured':Math.floor(v).toLocaleString('en-US');
const groupImages={"t_kdp": ["t-kdp"], "dhkd_tksp": ["dhkd"], "ddkd_ppkk_kip": ["kip", "ddkd"], "asdkd_rizgari": ["rizgari"], "ala_rizgari": ["rizgari"], "kawa": ["kawa"], "denge_kawa": ["kawa"], "red_kawa": ["kawa"], "t_kdp_kuk": ["kuk"], "kd_uko_pkk": ["pkk"], "tekosin": ["tekosin"]};
function groupImageHtml(id){return (groupImages[id]||[]).map(img=>'<img src="img/kurdish/'+img+'.png" alt="" style="max-width:130px;max-height:100px;object-fit:contain;margin:4px 8px 8px 0">').join('');}
function groupRows(model,counts){return model.activeOrganizations.map(g=>'<span style="display:block;margin-bottom:8px">'+groupImageHtml(g.id)+'<br><b style="color:#c2d93f">'+esc(g.name)+'</b><br>Suitability: '+g.score.toFixed(3)+'<br>'+(g.foundingSeed?'Founding supporters: ':'Political support: ')+counts[g.id].toLocaleString('en-US')+(g.foundingSeed?'':' ('+(g.share*100).toFixed(2)+'%)')+'<br>Active members: '+count(g.members)+'<br>Armed personnel: '+count(g.armed)+(g.configurationErrors.length?'<br>'+g.configurationErrors.map(e=>esc(e.field+': '+e.reason)).join('; '):'')+'</span>').join('');}
function organizationHtml(Q){const model=snapshot(Q),counts=displayCounts(model);return '<h3>Kurdish Political Organizations</h3><p>Politically conscious population: '+Math.round(model.PC).toLocaleString('en-US')+'</p><p><button type="button" class="kurdish-organizations-link" data-kurdish-organizations="support" aria-haspopup="dialog">KG / Political Support</button>: '+model.activeOrganizations.reduce((total,g)=>total+counts[g.id],0).toLocaleString('en-US')+' supporters.</p><p>Unaffiliated: '+counts.unaffiliated.toLocaleString('en-US')+'<br>Active members: '+count(model.totalMembers)+'<br>Armed personnel: '+count(model.totalArmed)+'</p>'+(model.mode==='normal'?'':'<p>Founding initialization. The listed seed populations have not yet been proportionally redistributed; normal allocation resumes next period.</p>');}
function paramilitaryHtml(Q){const model=snapshot(Q),counts=displayCounts(model),rate=model.totalArmed!==null&&model.totalMembers!==null&&model.totalMembers>0?(100*model.totalArmed/model.totalMembers).toFixed(2)+'%':model.totalMembers===0?'0.00%':'Not configured';return '<p><button type="button" class="kurdish-organizations-link" data-kurdish-organizations="paramilitary" aria-haspopup="dialog">Kurdish Paramilitaries</button>: '+count(model.totalArmed)+' armed personnel.<br>Active members: '+count(model.totalMembers)+'<br>Armed share of members: '+rate+'</p>';}
let overlay=null,previousFocus=null;
function closeOverlay(){if(!overlay)return;overlay.remove();overlay=null;document.body.classList.remove('kurdish-organizations-open');if(previousFocus?.isConnected)previousFocus.focus();previousFocus=null;}
function openOverlay(mode,Q){if(!root.document)return;Q=Q||root.dendryUI?.dendryEngine?.state?.qualities;if(!Q)return;if(overlay)closeOverlay();previousFocus=document.activeElement;const model=snapshot(Q),counts=displayCounts(model);overlay=document.createElement('div');overlay.className='kurdish-organizations-backdrop';overlay.innerHTML='<section class="kurdish-organizations-dialog" role="dialog" aria-modal="true" aria-labelledby="kurdish-organizations-title"><div class="kurdish-organizations-header"><h2 id="kurdish-organizations-title">'+(mode==='paramilitary'?'Kurdish Paramilitaries':'KG / Political Support')+'</h2><button type="button" class="kurdish-organizations-close" aria-label="Close Kurdish organizations">×</button></div><div class="kurdish-organizations-scroll" tabindex="0" role="region" aria-label="Organization parameters">'+(groupRows(model,counts)||'<p>No active Kurdish political organizations.</p>')+'</div></section>';document.body.appendChild(overlay);document.body.classList.add('kurdish-organizations-open');overlay.querySelector('.kurdish-organizations-close').onclick=closeOverlay;overlay.addEventListener('click',event=>{if(event.target===overlay)closeOverlay();});overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeOverlay();}else if(event.key==='Tab'){const focusable=Array.from(overlay.querySelectorAll('button,[tabindex="0"]')),first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});overlay.querySelector('.kurdish-organizations-close').focus();}
if(root.document)document.addEventListener('click',event=>{const trigger=event.target.closest?.('[data-kurdish-organizations]');if(trigger){event.preventDefault();openOverlay(trigger.dataset.kurdishOrganizations);}});
const api={config,announcements,validate,calculate,snapshot,update,announcementDue,acknowledge,displayCounts,organizationHtml,paramilitaryHtml,openOverlay,closeOverlay};
root.AnatolianKurdishOrganizations=api;if(R){R.kurdishOrganizations=api;R.kurdishGroups=config.organizations.map(g=>({id:g.id,name:g.name}));}
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
