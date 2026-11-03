(function(root){
'use strict';const P=root.AnatolianProvinces;if(!P||!root.document)return;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.round(Number(v)||0).toLocaleString('en-US'),pct=v=>(100*(Number(v)||0)).toFixed(2)+'%';
const names={rural:'Rural',workers:'Workers',capitalists:'Capitalists',petty_bourgeoisie:'Petty bourgeoisie',state_employees:'State employees',alevis:'Alevis',kurds:'Kurdish population'};
let overlay=null,detail=null,priorFocus=null,current=null,owner=null;
// Cartographic presentation only: no campaign qualities or election data are written.
const atlasNS='http://www.w3.org/2000/svg';
let atlasSerial=0,selectedProvince=null,atlasPhysicalEnabled=false;
function atlasNode(tag,attrs={}){const el=document.createElementNS(atlasNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function marginColor(color,votes){
 const values=Object.values(votes).map(Number).filter(Number.isFinite).sort((a,b)=>b-a),total=values.reduce((a,b)=>a+b,0);
 const margin=total>0?Math.max(0,(values[0]-(values[1]||0))/total):0;
 // 0 to 30 percentage points: 55% to 100% of the original ink over ivory.
 const ink=.55+.45*Math.min(1,margin/.30),rgb=/^#([a-f\d]{6})$/i.exec(color);
 if(!rgb)return color;
 return '#'+[0,2,4].map((offset,i)=>Math.round(parseInt(rgb[1].slice(offset,offset+2),16)*ink+[246,243,232][i]*(1-ink)).toString(16).padStart(2,'0')).join('');
}
function setupAtlas(canvas,allowMargin=true){
 const svg=canvas.querySelector('svg');if(!svg||svg.dataset.atlas)return;svg.dataset.atlas='true';
 const uid='atlas-'+(++atlasSerial),paths=[...svg.querySelectorAll('[data-province]')];
 // Additional sea space leaves room for geographic labels without changing any path.
 const home={x:-85,y:-75,w:1845,h:865};let scale=1,x=home.x,y=home.y,frame=0,drag=null,suppressClick=false;
 svg.setAttribute('viewBox',`${x} ${y} ${home.w} ${home.h}`);
 const defs=atlasNode('defs');defs.innerHTML=`<filter id="${uid}-shadow" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.8" flood-color="#283c41" flood-opacity=".22"/></filter><linearGradient id="${uid}-ink" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".055"/><stop offset="1" stop-color="#30291d" stop-opacity=".035"/></linearGradient>`;svg.prepend(defs);
 const viewport=atlasNode('g',{class:'atlas-geography'});while(defs.nextSibling)viewport.append(defs.nextSibling);svg.append(viewport);
 const silhouette=atlasNode('g',{class:'atlas-silhouette',filter:`url(#${uid}-shadow)`,'aria-hidden':'true'}),shade=atlasNode('g',{class:'atlas-ink','aria-hidden':'true'});
 for(const path of paths){for(const [group,attrs] of [[silhouette,{fill:'#526366',stroke:'#526366','stroke-width':'3'}],[shade,{fill:`url(#${uid}-ink)`}]]){const copy=atlasNode('path',{d:path.getAttribute('d'),...attrs});group.append(copy);}}
 viewport.prepend(silhouette);viewport.append(shade);
 const physHover=atlasNode('g',{class:'atlas-physical-hover','aria-hidden':'true','pointer-events':'none'});viewport.append(physHover);
  viewport.append(atlasNode('g',{class:'atlas-selection','aria-hidden':'true'}));
  let hoverId=null;
  function clearPhysicalHover(){hoverId=null;physHover.replaceChildren();}
  svg.addEventListener('pointerover',e=>{if(!canvas.classList.contains('atlas-physical-enabled'))return;const p=e.target.closest?.('[data-province]');const id=p?.dataset.province||null;if(id===hoverId)return;clearPhysicalHover();if(p){hoverId=id;for(const q of paths)if(q.dataset.province===id)physHover.append(atlasNode('path',{d:q.getAttribute('d'),fill:'none'}));}});
  svg.addEventListener('pointerleave',clearPhysicalHover);
 const labels=atlasNode('g',{class:'atlas-labels','aria-hidden':'true'});viewport.append(labels);
 const candidates=[];
 const major=['istanbul','ankara','izmir','bursa','adana','diyarbakir'];
 for(const p of [...P.data.provinces].sort((a,b)=>(major.includes(b.id)?1:0)-(major.includes(a.id)?1:0))){const text=atlasNode('text',{class:'atlas-city',x:p.center[0],y:p.center[1],'text-anchor':'middle'});text.textContent=p.id==='istanbul'?'İstanbul':p.id==='izmir'?'İzmir':p.name;labels.append(text);candidates.push({text,major:major.includes(p.id),x:p.center[0],y:p.center[1]});}
 // Sea positions use the original map coordinates; each candidate is checked against land.
 for(const [name,sx,sy,size] of [['Black Sea',860,-30,13],['Aegean Sea',-35,375,10],['Mediterranean Sea',640,755,13],['Sea of Marmara',210,160,9]]){const text=atlasNode('text',{class:'atlas-sea',x:sx,y:sy,'text-anchor':'middle','font-size':size});if(name==='Aegean Sea')text.setAttribute('transform',`rotate(-90 ${sx} ${sy})`);text.textContent=name;labels.append(text);candidates.push({text,sea:true,x:sx,y:sy,size});}
 const controls=document.createElement('div');controls.className='atlas-controls';controls.innerHTML='<button type="button" data-atlas="in" aria-label="Zoom in">+</button><button type="button" data-atlas="out" aria-label="Zoom out">−</button><button type="button" data-atlas="reset">Reset map</button><label><input type="checkbox" data-atlas="labels"> All province names</label><label><input type="checkbox" data-atlas="physical" disabled> Physical map</label>'+(allowMargin?'<label><input type="checkbox" data-atlas="margin"> Victory margins</label><span class="atlas-scale" hidden>Ink strength: tied (55%) → lead of 30 pp or more (100%)</span>':'');canvas.before(controls);
 canvas.title='Scroll to zoom toward the cursor; drag to pan while zoomed. Use Reset map to restore the full view.';
 const all=controls.querySelector('[data-atlas="labels"]');
 function layout(){
  if(!svg.isConnected||!svg.getBoundingClientRect().width)return;
  const occupied=[],rect=svg.getBoundingClientRect(),fontScale=home.w/rect.width/scale;
  for(const c of candidates){const t=c.text;t.style.display='';t.setAttribute('font-size',(c.sea?c.size:11)*fontScale);t.setAttribute('x',c.x);t.setAttribute('y',c.y);
   if(!c.sea&&!c.major&&!all.checked){t.style.display='none';continue;}
   let accepted=false;
   for(const dy of c.sea?[0]:[0,-15,15,-30,30]){t.setAttribute('y',c.y+dy*fontScale);const b=t.getBoundingClientRect(),pad=3;
    if(b.left<rect.left+pad||b.right>rect.right-pad||b.top<rect.top+pad||b.bottom>rect.bottom-pad)continue;
    if(occupied.some(a=>b.left<a.right+pad&&b.right>a.left-pad&&b.top<a.bottom+pad&&b.bottom>a.top-pad))continue;
    if(c.sea){const matrix=svg.getScreenCTM();if(!matrix)continue;let land=false;
     for(let sx=b.left;sx<=b.right;sx+=Math.max(2,b.width/30)){for(const sy of [b.top,b.top+b.height/2,b.bottom]){const point=new DOMPoint(sx,sy).matrixTransform(matrix.inverse());if(paths.some(p=>p.isPointInFill(point))){land=true;break;}}if(land)break;}if(land)continue;}
    occupied.push(b);accepted=true;break;
   }if(!accepted)t.style.display='none';
  }
 }
 function bounds(){const w=home.w/scale,h=home.h/scale;x=Math.max(home.x,Math.min(home.x+home.w-w,x));y=Math.max(home.y,Math.min(home.y+home.h-h,y));}
 function draw(){frame=0;if(!svg.isConnected)return;bounds();const target=[x,y,home.w/scale,home.h/scale],prior=svg.getAttribute('viewBox').split(' ').map(Number),reduced=root.matchMedia('(prefers-reduced-motion: reduce)').matches;const next=target.map((v,i)=>reduced||drag||Math.abs(v-prior[i])<.08?v:prior[i]+(v-prior[i])*.45);svg.setAttribute('viewBox',next.join(' '));svg.style.touchAction=scale>1?'none':'pan-y';layout();if(next.some((v,i)=>v!==target[i]))schedule();}
 function schedule(){if(!frame)frame=root.requestAnimationFrame(draw);}
 function zoom(factor,point){const next=Math.max(1,Math.min(6,scale*factor)),ratio=scale/next;x=point.x-(point.x-x)*ratio;y=point.y-(point.y-y)*ratio;scale=next;schedule();}
 function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
 controls.onclick=e=>{const action=e.target.dataset.atlas;if(action==='reset'){scale=1;x=home.x;y=home.y;schedule();}else if(action==='in'||action==='out')zoom(action==='in'?1.3:1/1.3,{x:x+home.w/scale/2,y:y+home.h/scale/2});};
 all.onchange=layout;
 const margin=controls.querySelector('[data-atlas="margin"]');if(margin)margin.onchange=()=>{for(const path of paths)if(path.atlasColor)path.style.fill=margin.checked?marginColor(path.atlasColor,path.atlasVotes):path.atlasColor;controls.querySelector('.atlas-scale').hidden=!margin.checked;};
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.002),point(e));},{passive:false});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0||scale===1)return;drag={id:e.pointerId,start:point(e),clientX:e.clientX,clientY:e.clientY,x,y,moved:false};suppressClick=false;});
 svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<5)return;if(!drag.moved){drag.moved=true;svg.setPointerCapture(e.pointerId);canvas.classList.add('atlas-panning');}const now=point(e);x+=drag.start.x-now.x;y+=drag.start.y-now.y;bounds();svg.setAttribute('viewBox',`${x} ${y} ${home.w/scale} ${home.h/scale}`);schedule();});
 function end(e){if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=null;canvas.classList.remove('atlas-panning');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
 svg.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
 const resize=new ResizeObserver(()=>{if(!svg.isConnected){resize.disconnect();return;}schedule();});resize.observe(canvas);all.onchange=layout;schedule();
 root.AnatolianMapDesign?.attach(svg,canvas);
 const physical=controls.querySelector('[data-atlas="physical"]');
 if(physical){physical.onchange=()=>{atlasPhysicalEnabled=physical.checked;canvas.classList.toggle('atlas-physical-enabled',physical.checked);};
  root.AnatolianMapDesign?.updatePhysicalControl(canvas);if(!physical.disabled&&atlasPhysicalEnabled){physical.checked=true;canvas.classList.add('atlas-physical-enabled');}}
 root.AnatolianMapEditor?.mount(canvas);
}
function selectProvince(host,id){selectedProvince=id;for(const layer of host.querySelectorAll('.atlas-selection'))layer.replaceChildren();for(const p of host.querySelectorAll('[data-province]')){const selected=p.dataset.province===id;p.classList.toggle('atlas-selected',selected);p.setAttribute('aria-pressed',String(selected));if(selected){const layer=p.closest('svg').querySelector('.atlas-selection');if(layer)for(const cls of ['atlas-selection-halo','atlas-selection-gold'])layer.append(atlasNode('path',{d:p.getAttribute('d'),class:cls}));}}}

function closeDetail(){if(detail){detail.remove();detail=null;if(overlay)overlay.querySelector('.province-current')?.focus();}}
function close(){closeDetail();if(overlay){overlay.remove();overlay=null;document.body.classList.remove('province-map-open');priorFocus?.focus();}}
// Original province coordinates remain authoritative for every map mode.
let mapMarkup;
function turkeyMapSvg(){if(mapMarkup)return mapMarkup;return mapMarkup=P.data.svg.replace('role="img"','role="group"').replace('<svg ','<svg style="isolation:isolate" ');}
function parliament(){return '<svg class="province-parliament" viewBox="0 0 500 250" role="img" aria-label="TBMM seat distribution"></svg>';}
function drawParliament(seats){if(!root.d3?.parliament)return;const graph=root.d3.parliament().width(500).height(500).innerRadiusCoef(.4);graph.enter.fromCenter(false).smallToBig(false);graph.update.animate(false);const data=Object.keys(seats).map(k=>({id:k,name:P.label(owner,k),legend:P.label(owner,k),seats:seats[k],color:P.colors[k]||'#808080'}));root.d3.select(overlay.querySelector('.province-parliament')).datum(data).call(graph);}

function stamp(s){return (s.kind==='senate'?'Senate election, Group '+s.group:s.kind==='local'?'Local election':'General election')+' · '+s.month+'/'+s.year;}
function flags(s){return s.socialistLeftFormed??(s.kind==='poll'?!!owner.socialist_left_formed:false);}
function partyFlag(key,name){const files={chp:'img/chp5_20251125_200815_0000.svg',AP:'img/AP.jpg',TIP:"img/TİP_1970'ler.png",CGP:name==='MGP'?'img/cgplogo.png':'img/cgp-party-logo.png',DP:'img/DP.png',MSP:name==='MNP'?'img/mnp.png':'img/MSP.png',MHP:'img/MHP.png',TKP:'img/tkp.png',TSIP:'img/tsip.gif',TEP:'img/tep.jpeg',SDP:'img/sdp.jpg',TBP:'img/tbp-logo.jpg',MP:'img/mp-logo.png'};return files[key]||'img/independent-placeholder.svg';}
function styledParty(s,k,votes){const formed=flags(s),name=k==='other'?'Others':formed&&k==='TIP'?'Socialist Left':(s.partyNames?.[k]==='GP'?'MGP':s.partyNames?.[k])||P.label(owner,k);let html;
 if(k==='TIP'&&formed){const temp=document.createElement('div'),q={...owner,socialist_left_formed:1};for(const p of ['TIP','TKP','TSIP','TEP','SDP'])q[p+'_poll_votes']=100*(s.votes[p]||0)/(s.totalVotes||1);temp.innerHTML=AnatolianRules.socialistPollHtml(q);html=temp.firstElementChild.outerHTML;}
 else html=root.formatPartyLabel?root.formatPartyLabel(esc(name)):'<span style="color:'+(P.colors[k]||'#808080')+'">'+esc(name)+'</span>';
 return '<img class="province-party-flag" src="'+partyFlag(k,(s.partyNames?.[k]==='GP'?'MGP':s.partyNames?.[k])||P.label(owner,k))+'" alt=""><span class="province-party-name">'+html+'</span>';
}
function partyRows(s,p){
 const rawVotes=p?p.votes:s.votes,rawSeats=p?p.seats:s.seats,national=!p,formed=flags(s),votes=P.reportingVotes(rawVotes,national,formed),seats=P.reportingVotes(rawSeats,national,formed),total=Object.values(votes).reduce((a,b)=>a+b,0)||1;
 const breakdown=()=>{const keys=national?AnatolianRules.otherPollParties:P.provinceOtherParties;return keys.filter(k=>((rawVotes[k]||0)>0||(rawSeats[k]||0)>0)).map(k=>'<span style="display:block;white-space:nowrap"><b style="color:'+(P.colors[k]||'#808080')+'">'+esc((s.partyNames?.[k]==='GP'?'MGP':s.partyNames?.[k])||P.label(owner,k))+'</b>: '+num(rawVotes[k])+' ('+pct(rawVotes[k]/total)+')</span>').join('');};
 return Object.keys(votes).filter(k=>votes[k]>0||seats[k]>0).sort((a,b)=>a==='other'?1:b==='other'?-1:votes[b]-votes[a]).map(k=>{let amount=seats[k]||0;if(s.kind==='local'){if(p)amount=k==='other'?(P.provinceOtherParties.includes(p.winner)?1:0):(p.winner===k?1:0);else amount=P.reportingVotes(s.municipalities,true,formed)[k]||0;}const name=k==='other'?'<img class="province-party-flag" src="img/independent-placeholder.svg" alt=""><span class="province-party-name province-vote-group" style="color:#808080;font-weight:bold" tabindex="0">'+(p?'Other':'Others')+'<span class="province-group-tip">'+breakdown()+'</span></span>':styledParty(s,k,votes);return '<tr><th scope="row">'+name+'</th><td>'+num(votes[k])+'</td><td>'+pct(votes[k]/total)+'</td><td>'+num(amount)+'</td></tr>';}).join('');
}
function showProvince(id){if(!overlay)return;const p=current.provinces.find(p=>p.id===id);if(!p)return;closeDetail();detail=document.createElement('div');detail.className='province-detail-backdrop';detail.innerHTML='<section class="province-detail" role="dialog" aria-modal="true" aria-labelledby="province-detail-title"><button class="province-close" aria-label="Close province details">×</button><p class="province-kicker">'+esc(current.kind==='poll'?'Current projection':stamp(current))+'</p><h2 id="province-detail-title">'+esc(p.name)+'</h2><div class="province-detail-summary"><strong>'+num(p.population)+'</strong> residents · '+num(p.totalVotes)+' '+(current.kind==='poll'?'projected valid votes':'valid votes')+'</div><h3>Population and demographics</h3><table><thead><tr><th>Demographic</th><th>Share</th><th>People</th></tr></thead><tbody>'+Object.entries(p.demographics).map(([k,v])=>'<tr><th>'+esc(names[k])+'</th><td>'+pct(v)+'</td><td>'+num(p.demographicCounts?.[k]??v*p.population)+'</td></tr>').join('')+'</tbody></table><h3>Province election results</h3><table><thead><tr><th>Party</th><th>Votes</th><th>Share</th><th>'+ (current.kind==='local'?'Municipality':'Seats')+'</th></tr></thead><tbody>'+partyRows(current,p)+'</tbody></table><details><summary>Voting preferences by demographic</summary><p>Each demographic has its own provincial voting preferences.</p><table><tbody>'+Object.entries(p.classPreferences||{}).map(([c,v])=>'<tr><th>'+esc(names[c])+'</th><td>'+Object.entries(v).filter(([k,n])=>n>0).map(([k,n])=>esc(P.label(owner,k))+': '+pct(n)).join(', ')+'</td></tr>').join('')+'</tbody></table></details></section>';document.body.append(detail);detail.querySelector('button').onclick=closeDetail;detail.addEventListener('click',e=>{if(e.target===detail)closeDetail();});detail.querySelector('button').focus();}
function render(s){current=s;const body=overlay.querySelector('.province-map-body');body.innerHTML='<div class="province-map-main"><div class="province-map-heading"><h2>'+esc(s.kind==='poll'?'Current polling projection':stamp(s))+'</h2><span>'+num(s.totalPopulation)+' residents · '+num(s.totalVotes)+' valid votes</span></div><div class="province-map-canvas">'+turkeyMapSvg()+'</div><p class="province-map-hint">Select a province for its population, demographics and detailed results.</p><div class="province-map-parliament"><h3>'+(s.kind==='senate'?'Republican Senate':'TBMM')+' · '+(s.kind==='poll'?'Projected distribution':s.kind==='local'?'Parliament at this election':'Election result')+'</h3>'+parliament(s.senateComposition||s.parliamentSeats||s.seats)+'<p>'+(s.kind==='senate'?'150 elected senators · 15 appointed members · Permanent members shown separately · 50 elected seats renewed':'450 MPs · Majority: 226')+'</p></div></div><aside class="province-map-ledger"><h3>'+(s.kind==='local'?'Local election results':'National results')+'</h3><table><thead><tr><th>Party</th><th>Votes</th><th>Share</th><th>'+(s.kind==='local'?'Municipalities':'Seats')+'</th></tr></thead><tbody>'+partyRows(s)+'</tbody></table><p class="province-map-note">'+(s.legacyReconstruction?'Imported from an older save. National vote shares are preserved. Provincial figures and absolute vote counts are reconstructed estimates.'+(s.legacyNationalSeatsPreserved?' The saved national seat totals are preserved.':' National seat totals are estimated.')+'':'')+'</p></aside>';
 if(s.kind==='local')body.querySelector('.province-map-parliament').remove();else if(s.kind==='senate')root.AnatolianSenate.renderChamber(overlay.querySelector('.province-parliament'),owner,s);else drawParliament(s.parliamentSeats||s.seats);
 paintMap(body,s,owner,id=>showProvince(id));}

function paintMap(host,s,Q,onSelect){
 const provinceById=new Map(s.provinces.map(p=>[p.id,p]));
 for(const path of host.querySelectorAll('[data-province]')){const p=provinceById.get(path.dataset.province);if(!p){path.style.fill='#808080';path.removeAttribute('tabindex');path.style.cursor='default';const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent='Not voting in this Senate renewal';path.append(title);continue;}const formed=s.socialistLeftFormed??(s.kind==='poll'?!!Q.socialist_left_formed:false),votes=P.reportingVotes(p.votes,false,formed),winner=s.kind==='local'?(P.provinceOtherParties.includes(p.winner)?'other':p.winner):Object.keys(votes).sort((a,b)=>votes[b]-votes[a])[0];path.dataset.atlasParty=winner;path.atlasColor=P.colors[winner]||'#808080';path.atlasVotes=p.votes;path.style.fill=path.atlasColor;const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=p.name+': '+(formed&&winner==='TIP'?'Socialist Left':P.label(Q,winner))+' '+pct(votes[winner]/p.totalVotes);path.append(title);path.onclick=()=>{selectProvince(host,p.id);onSelect(p.id);};path.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectProvince(host,p.id);onSelect(p.id);}};}
 for(const canvas of host.querySelectorAll('.province-map-canvas'))setupAtlas(canvas);
 if(selectedProvince)selectProvince(host,selectedProvince);
}
function openSnapshot(s,id){open();if(!overlay)return;render(s);overlay.querySelectorAll('[role="tab"]').forEach(button=>{const selected=button.textContent.trim()===s.year+' '+(s.kind==='senate'?'Senate '+s.group:s.kind==='local'?'Local':'General');button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));});if(id){selectProvince(overlay,id);showProvince(id); }}
function renderElectionResultMap(kind){
 const Q=root.dendryUI?.dendryEngine?.state?.qualities,hosts=document.querySelectorAll('.election-results-map[data-election-kind="'+kind+'"]'),host=hosts[hosts.length-1];if(!Q||!host)return;
 const snapshot=Q.province_election_history?.filter(s=>s.kind===kind&&s.year===Q.year&&s.month===Q.month).slice(-1)[0]||Q.province_election_history?.filter(s=>s.kind===kind).slice(-1)[0];if(!snapshot)return;
 host.innerHTML='<div class="province-map-canvas">'+turkeyMapSvg()+'</div>';paintMap(host,snapshot,Q,id=>openSnapshot(snapshot,id));
 const parliaments=document.querySelectorAll(kind==='senate'?'.senate-election-parliament':'.local-election-parliament'),svg=kind==='local'||kind==='senate'?parliaments[parliaments.length-1]:null;if(svg&&kind==='senate')root.AnatolianSenate.renderChamber(svg,Q,snapshot);
}
root.renderElectionResultMap=renderElectionResultMap;
root.renderMunicipalControlMap=function(){
 const Q=root.dendryUI?.dendryEngine?.state?.qualities,host=document.querySelector('.municipal-control-map');if(!Q||!host)return;
 const snapshot=root.AnatolianMunicipalities.controlSnapshot(Q),historical=!snapshot;
 const provinces=snapshot?.provinces||P.data.provinces.map(p=>({id:p.id,name:p.name,winner:root.AnatolianMunicipalities.startingMunicipalWinners[p.id]}));
 host.innerHTML='<div class="province-map-canvas">'+turkeyMapSvg()+'</div><p class="municipal-map-caption">'+(historical?'1968 local elections':'Latest local election · '+snapshot.year)+' · CHP municipalities in red</p>';
 const provinceById=new Map(provinces.map(p=>[p.id,p]));
 for(const path of host.querySelectorAll('[data-province]')){const p=provinceById.get(path.dataset.province);path.dataset.atlasParty=p?.winner==='chp'?'chp':'other';path.style.fill=p?.winner==='chp'?P.colors.chp:'#808080';const title=document.createElementNS('http://www.w3.org/2000/svg','title');const winner=p?.winner==='GP'?'GP':p?.winner==='IND'?'Independent':p?P.label(Q,p.winner):'';title.textContent=p?p.name+': '+winner+(historical?' (1968)':''):'No recorded municipal election';path.append(title);if(p&&!historical){path.onclick=()=>{selectProvince(host,p.id);openSnapshot(snapshot,p.id);};path.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();path.onclick();}};}else{path.removeAttribute('tabindex');path.setAttribute('role','img');}}
 setupAtlas(host.querySelector('.province-map-canvas'),false);
};

function generalElectionYears(Q){const early=Q.next_election_year===1975||Q.province_election_history.some(s=>s.kind==='general'&&s.year===1975);return early?[1973,1975,1979]:[1973,1977,1981];}
function open(){if(overlay){overlay.querySelector('button').focus();return;}owner=root.dendryUI?.dendryEngine?.state?.qualities;if(!owner)return;P.ensure(owner);root.AnatolianSenate?.ensure(owner);if(!P.active(owner))return;priorFocus=document.activeElement;overlay=document.createElement('div');overlay.className='province-map-backdrop';overlay.id='province-election-overlay';
 const slots=generalElectionYears(owner).map(year=>({year,kind:'general'})).concat([1973,1977,1981].map(year=>({year,kind:'local'}))).concat((root.AnatolianSenate?.schedule||[]).map(e=>({...e,kind:'senate'})));
 for(const snapshot of owner.province_election_history){if(!slots.some(v=>v.kind===snapshot.kind&&v.year===snapshot.year))slots.push({year:snapshot.year,kind:snapshot.kind});}
 overlay.innerHTML='<section class="province-map-window" role="dialog" aria-modal="true" aria-label="Turkey election map"><button class="province-close" aria-label="Close election map">×</button><header class="province-map-toolbar province-map-tabs" role="tablist" aria-label="Election results"><button class="province-current active" role="tab" aria-selected="true">Current polls</button>'+slots.map((v,i)=>'<button class="province-election-tab" role="tab" aria-selected="false" data-slot="'+i+'">'+v.year+' '+(v.kind==='senate'?'Senate '+v.group:v.kind==='general'?'General':'Local')+'</button>').join('')+'</header><div class="province-map-body"></div></section>';
 document.body.append(overlay);document.body.classList.add('province-map-open');const text=document.querySelector('#stats_sidebar .mytooltip'),style=text?getComputedStyle(text):getComputedStyle(document.body);overlay.style.setProperty('--province-party-font-size',style.fontSize);overlay.style.setProperty('--province-party-font-family',style.fontFamily);
 const select=button=>{overlay.querySelectorAll('[role="tab"]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',String(b===button));});};
 overlay.querySelector('.province-close').onclick=close;const currentButton=overlay.querySelector('.province-current');currentButton.onclick=()=>{closeDetail();select(currentButton);render(P.compute(owner,true));};
 overlay.querySelectorAll('.province-election-tab').forEach(button=>{const slot=slots[Number(button.dataset.slot)],snap=owner.province_election_history.filter(s=>s.kind===slot.kind&&s.year===slot.year).slice(-1)[0];button.disabled=!snap;button.title=snap?'View '+stamp(snap):'This election has not been recorded yet.';button.onclick=()=>{closeDetail();select(button);render(snap);};});
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});render(P.compute(owner,true));overlay.querySelector('.province-close').focus();}
document.addEventListener('keydown',e=>{if(!overlay||document.getElementById('map-design-editor'))return;if(e.key==='Escape'){e.preventDefault();if(detail)closeDetail();else close();}if(e.key==='Tab'){const dialog=detail||overlay,focusable=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"],summary')],first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
root.openProvinceElectionMap=open;root.provinceGeneralElectionYears=generalElectionYears;
})(globalThis);
