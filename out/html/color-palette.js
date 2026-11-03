/* Player-facing and editor-authored universal party/organization palette.
 * Names, state, ballots and party calculations never depend on these colors.
 * The palette affects runtime SVG fills and the existing colourList markup source.
 */
(function(root){
'use strict';
const P=root.AnatolianProvinces;
if(!P||!P.colors)return;
const terms=root.AnatolianGameColourEntries||[];
const keys=Object.keys(P.colors);
const alias={
 'CHP':'chp','AP':'AP','MGP':'CGP','CGP':'CGP','DP':'DP',
 'MNP':'MSP','MSP':'MSP','MHP':'MHP','CKMP':'MHP',
 'TIP':'TIP','TİP':'TIP','Socialist Left':'TIP',
 'TKP':'TKP','TSIP':'TSIP','TSİP':'TSIP','TEP':'TEP','SDP':'SDP',
 'TBP':'TBP','MP':'MP','IND':'IND','Independents':'IND',
 'KI':'KI','Kurdish Independents':'KI','Others':'other','Other':'other'
};
const colorPattern=/(^|;)\s*color\s*:\s*(#[0-9a-f]{3,8})\s*(?=;|$)/i;
const valid=/^#[0-9a-f]{6}$/i;
const read=style=>{const m=colorPattern.exec(style);if(!m)return null;const c=m[2];if(c.length===4)return '#'+[...c.slice(1)].map(x=>x+x).join('');return valid.test(c)?c:null;};
const defaults={parties:Object.fromEntries(keys.map(k=>[k,P.colors[k]])),entities:{}};
for(const t of terms)if(!alias[t.word]){const c=read(t.style);if(c)defaults.entities[t.word]=c;}
// Seat colors that were previously literal constants in senate.js.
defaults.entities['MBK']='#5b7387';
defaults.entities['Former Presidents']='#ff0000';
defaults.entities['Appointed Senators']='#00bcd4';
const baseStyles=new Map(terms.map(t=>[t,t.style]));
let activeSignature=null;
const current={parties:{...defaults.parties},entities:{...defaults.entities}};
function normalize(input){
 const out={parties:{},entities:{}};
 for(const section of ['parties','entities']){
  const data=input?.[section]||{};
  for(const [key,c] of Object.entries(data))if(Object.prototype.hasOwnProperty.call(defaults[section],key)&&valid.test(c))out[section][key]=c;
 }
 return out;
}
function marginColor(color,votes){
 if(!votes)return color;
 const a=Object.values(votes).map(Number).filter(Number.isFinite).sort((x,y)=>y-x),total=a.reduce((x,y)=>x+y,0);
 const margin=total?Math.max(0,(a[0]-(a[1]||0))/total):0,ink=.55+.45*Math.min(1,margin/.30);
 const m=/^#([a-f\d]{6})$/i.exec(color);if(!m)return color;
 return '#'+[0,2,4].map((o,i)=>Math.round(parseInt(m[1].slice(o,o+2),16)*ink+[246,243,232][i]*(1-ink)).toString(16).padStart(2,'0')).join('');
}
function refresh(host=root.document){
 if(!host)return;
 for(const path of host.querySelectorAll('.province-map-canvas [data-province][data-atlas-party]')){
  const party=path.dataset.atlasParty,color=P.colors[party];if(!color)continue;
  path.atlasColor=color;
  const canvas=path.closest('.province-map-canvas');
  path.style.fill=canvas?.previousElementSibling?.querySelector('[data-atlas="margin"]')?.checked?marginColor(color,path.atlasVotes):color;
 }
 for(const circle of host.querySelectorAll('svg circle[data-party]')){
  const party=circle.dataset.party;
  if(P.colors[party])circle.setAttribute('fill',P.colors[party]);
  else if(party==='MBK')circle.setAttribute('fill',current.entities.MBK);
  else if(party==='former-president')circle.setAttribute('fill',current.entities['Former Presidents']);
 }
 for(const circle of host.querySelectorAll('svg .senate-appointed circle'))circle.setAttribute('fill',current.entities['Appointed Senators']);
}
function apply(input){
 const normalized=normalize(input),signature=JSON.stringify(normalized);
 if(signature===activeSignature)return false;
 activeSignature=signature;
 for(const section of ['parties','entities'])for(const [key,c] of Object.entries(defaults[section]))current[section][key]=normalized[section][key]||c;
 Object.assign(P.colors,current.parties);
 for(const term of terms){
  const party=alias[term.word],value=party?current.parties[party]:current.entities[term.word];
  if(!value)continue;
  const original=baseStyles.get(term)||term.style;
  term.style=colorPattern.test(original)?original.replace(colorPattern,(all,sep)=>sep+'color: '+value):original+';color: '+value+';';
 }
 refresh();
 if(root.document)root.document.dispatchEvent(new CustomEvent('anatolian-palette-updated'));
 return true;
}
function lists(){return {
 parties:keys.map(key=>({key,name:key==='chp'?'CHP':key==='other'?'Others':key,color:defaults.parties[key]})),
 entities:Object.keys(defaults.entities).map(key=>({key,name:key,color:defaults.entities[key]}))
};}
root.AnatolianColorPalette={defaults,lists,normalize,apply,refresh,current,alias};
})(globalThis);
