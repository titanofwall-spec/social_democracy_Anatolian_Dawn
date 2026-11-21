(function(root){
'use strict';const P=root.AnatolianProvinces;if(!P||!root.document)return;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.round(Number(v)||0).toLocaleString('en-US'),pct=v=>(100*(Number(v)||0)).toFixed(2)+'%';
const names={rural:'Rural',workers:'Workers',capitalists:'Capitalists',petty_bourgeoisie:'Petty bourgeoisie',state_employees:'State employees',alevis:'Alevis',kurds:'Kurdish population'};
let overlay=null,detail=null,priorFocus=null,current=null,owner=null;
// Cartographic presentation only: no campaign qualities or election data are written.
const atlasNS='http://www.w3.org/2000/svg';
let atlasSerial=0,selectedProvince=null,atlasMapMode='vanilla',atlasShowAllNames=false,atlasVictoryMargins=false,atlasSeatMode='none';
/* Anatolian Dawn election dashboard: full-width fixed map, no zoom (v1). */
function atlasNode(tag,attrs={}){const el=document.createElementNS(atlasNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function atlasButtonState(button,active){button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));}
function marginColor(color,votes){
 const values=Object.values(votes).map(Number).filter(Number.isFinite).sort((a,b)=>b-a),total=values.reduce((a,b)=>a+b,0);
 const margin=total>0?Math.max(0,(values[0]-(values[1]||0))/total):0;
 // 0 to 30 percentage points: 55% to 100% of the original ink over ivory.
 const ink=.55+.45*Math.min(1,margin/.30),rgb=/^#([a-f\d]{6})$/i.exec(color);
 if(!rgb)return color;
 return '#'+[0,2,4].map((offset,i)=>Math.round(parseInt(rgb[1].slice(offset,offset+2),16)*ink+[246,243,232][i]*(1-ink)).toString(16).padStart(2,'0')).join('');
}
 // Provincial seat visualizations (map presentation only; never reallocates seats).
 const seatVisuals=(()=>{
  const RING_OUTER=35.5,RING_INNER=20,BALL_RADIUS=10.2,BALL_STEP=23,SEAT_VISUAL_SCALE=.75;
  const provinceCenters=new Map(P.data.provinces.map(p=>[p.id,p.center]));
  // Keep party order stable across districts and elections, irrespective of vote rank.
  const baseOrder=Object.keys(P.colors);
  const partyRank=k=>{const i=baseOrder.indexOf(k);return i<0?baseOrder.length:i;};
  function seatsFor(p){
   if(!p||!p.seats||typeof p.seats!=='object'||Array.isArray(p.seats))return null;
   const entries=[];let total=0;
   for(const [key,count] of Object.entries(p.seats)){
    if(!Number.isSafeInteger(count)||count<0)return null;
    if(count>0){total+=count;entries.push({key,count});}
   }
   if(total<1||total>500)return null;
   entries.sort((a,b)=>partyRank(a.key)-partyRank(b.key)||a.key.localeCompare(b.key));
   return {entries,total};
  }
  function available(snapshot){
   if(!snapshot||!['general','poll','senate'].includes(snapshot.kind)||snapshot.kind==='poll'&&snapshot.electionKind==='local')return false;
   return Array.isArray(snapshot.provinces)&&snapshot.provinces.some(p=>seatsFor(p)&&provinceCenters.has(p.id));
  }
  function arcPoint(angle,r){return [Math.cos(angle)*r,Math.sin(angle)*r];}
  // A pie wedge under a white center gives a clean, contiguous donut (no angular gaps).
  function wedge(start,end){
   const a=arcPoint(start,RING_OUTER),b=arcPoint(end,RING_OUTER),large=end-start>Math.PI?1:0;
   return `M0 0 L${a[0].toFixed(4)} ${a[1].toFixed(4)} A${RING_OUTER} ${RING_OUTER} 0 ${large} 1 ${b[0].toFixed(4)} ${b[1].toFixed(4)} Z`;
  }
  function segments(entries,total){
   let used=0;
   return entries.map(e=>{const start=360*used/total;used+=e.count;return {...e,start,end:360*used/total};});
  }
  function markers(snapshot,mode){
   if(!available(snapshot)||!['circular','ball'].includes(mode))return [];
   const out=[];
   for(const p of snapshot.provinces){
    const data=seatsFor(p),center=provinceCenters.get(p.id);
    if(!data||!Array.isArray(center)||!center.every(Number.isFinite))continue;
    const cols=mode==='ball'?Math.ceil(Math.sqrt(data.total)):1,rows=mode==='ball'?Math.ceil(data.total/cols):1;
    const width=(mode==='circular'?2*RING_OUTER:(cols-1)*BALL_STEP+2*BALL_RADIUS)*SEAT_VISUAL_SCALE;
    const height=(mode==='circular'?2*RING_OUTER:(rows-1)*BALL_STEP+2*BALL_RADIUS)*SEAT_VISUAL_SCALE;
    out.push({id:p.id,cx:center[0],cy:center[1],...data,cols,rows,width,height});
   }
   // Large delegations are placed first; stable tie-breaking avoids flicker.
   out.sort((a,b)=>b.total-a.total||a.id.localeCompare(b.id));
   const placed=[];
   const offsets=[[0,0]];
   for(const radius of [18,36,54,72,90,108])for(let i=0;i<16;i++){
    const angle=Math.PI*2*i/16;
    offsets.push([Math.round(radius*Math.cos(angle)),Math.round(radius*Math.sin(angle))]);
   }
   for(const item of out){
    let best=null,bestCost=Infinity;
    for(const [dx,dy] of offsets){
     const x=item.cx+dx,y=item.cy+dy;
     const box={left:x-item.width/2,right:x+item.width/2,top:y-item.height/2,bottom:y+item.height/2};
     let overlap=0;
     for(const other of placed){
      const w=Math.max(0,Math.min(box.right+3,other.right+3)-Math.max(box.left-3,other.left-3));
      const h=Math.max(0,Math.min(box.bottom+3,other.bottom+3)-Math.max(box.top-3,other.top-3));
      overlap+=w*h;
     }
     const outside=Math.max(0,-45-box.left)**2+Math.max(0,box.right-1720)**2+Math.max(0,-48-box.top)**2+Math.max(0,box.bottom-765)**2;
     const cost=overlap*4+(dx*dx+dy*dy)*.19+outside*2;
     if(cost<bestCost){bestCost=cost;best={...box,x,y};if(cost===0)break;}
    }
    Object.assign(item,{x:best.x,y:best.y});placed.push(best);
   }
   // Keep source province order for consistent DOM order and accessibility.
   const order=new Map(snapshot.provinces.map((p,i)=>[p.id,i]));
   return out.sort((a,b)=>order.get(a.id)-order.get(b.id));
  }
  function render(layer,snapshot,mode){
   layer.replaceChildren();
   const items=markers(snapshot,mode);
   for(const p of items){
    const g=atlasNode('g',{class:'atlas-seat-marker atlas-seat-'+mode,'data-seat-province':p.id,'data-seat-total':p.total,transform:`translate(${p.x} ${p.y}) scale(${SEAT_VISUAL_SCALE})`,'pointer-events':'none'});
    if(mode==='circular'){
     const segs=segments(p.entries,p.total);
     for(const e of segs){
      const color=P.colors[e.key]||P.colors.other||'#808080';
      if(e.count===p.total)g.append(atlasNode('circle',{r:RING_OUTER,fill:color}));
      else g.append(atlasNode('path',{d:wedge((e.start-90)*Math.PI/180,(e.end-90)*Math.PI/180),fill:color}));
     }
     g.append(atlasNode('circle',{r:RING_OUTER,fill:'none',stroke:'#f0eee8','stroke-width':.85}));
     g.append(atlasNode('circle',{r:RING_INNER,fill:'#fff'}));
     const label=atlasNode('text',{x:0,y:0,'text-anchor':'middle','dominant-baseline':'central','font-size':19,'font-family':'Arial, sans-serif','font-weight':'700',fill:'#111'});
     label.textContent=String(p.total);g.append(label);
    }else{
     // Row-major compact square packing, grouped by party (largest delegation first).
     const ordered=p.entries.slice().sort((a,b)=>b.count-a.count||partyRank(a.key)-partyRank(b.key)||a.key.localeCompare(b.key));
     let n=0;
     for(const e of ordered)for(let i=0;i<e.count;i++){
      const row=Math.floor(n/p.cols),col=n%p.cols;
      const x=(col-(p.cols-1)/2)*BALL_STEP,y=(row-(p.rows-1)/2)*BALL_STEP;
      g.append(atlasNode('circle',{cx:x,cy:y,r:BALL_RADIUS,fill:P.colors[e.key]||P.colors.other||'#808080',stroke:'#202020','stroke-width':1.2}));n++;
     }
    }
    layer.append(g);
   }
   return items;
  }
  return {available,seatsFor,segments,markers,render};
 })();
 root.AnatolianSeatVisuals=seatVisuals;

function setupAtlas(canvas,allowMargin=true,snapshot=null){
 const svg=canvas.querySelector('svg');if(!svg||svg.dataset.atlas)return;svg.dataset.atlas='true';
 const uid='atlas-'+(++atlasSerial),paths=[...svg.querySelectorAll('[data-province]')];
 // Additional sea space leaves room for geographic labels without changing any path.
 const home={x:-85,y:-75,w:1845,h:865};
  svg.setAttribute('viewBox',`${home.x} ${home.y} ${home.w} ${home.h}`);
 const defs=atlasNode('defs');defs.innerHTML=`<filter id="${uid}-shadow" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.8" flood-color="#283c41" flood-opacity=".22"/></filter><linearGradient id="${uid}-ink" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".055"/><stop offset="1" stop-color="#30291d" stop-opacity=".035"/></linearGradient>`;svg.prepend(defs);
 const viewport=atlasNode('g',{class:'atlas-geography'});while(defs.nextSibling)viewport.append(defs.nextSibling);svg.append(viewport);
 const silhouette=atlasNode('g',{class:'atlas-silhouette',filter:`url(#${uid}-shadow)`,'aria-hidden':'true'}),shade=atlasNode('g',{class:'atlas-ink','aria-hidden':'true'});
 for(const path of paths){for(const [group,attrs] of [[silhouette,{fill:'#526366',stroke:'#526366','stroke-width':'3'}],[shade,{fill:`url(#${uid}-ink)`}]]){const copy=atlasNode('path',{d:path.getAttribute('d'),...attrs});group.append(copy);}}
 viewport.prepend(silhouette);viewport.append(shade);
 const physHover=atlasNode('g',{class:'atlas-physical-hover','aria-hidden':'true','pointer-events':'none'});viewport.append(physHover);
  viewport.append(atlasNode('g',{class:'atlas-selection','aria-hidden':'true'}));
  let hoverId=null;
  function clearPhysicalHover(){hoverId=null;physHover.replaceChildren();}
  svg.addEventListener('pointerover',e=>{if(!(canvas.classList.contains('atlas-mode-physical')||canvas.classList.contains('atlas-mode-combined')))return;const p=e.target.closest?.('[data-province]');const id=p?.dataset.province||null;if(id===hoverId)return;clearPhysicalHover();if(p){hoverId=id;for(const q of paths)if(q.dataset.province===id)physHover.append(atlasNode('path',{d:q.getAttribute('d'),fill:'none'}));}});
  svg.addEventListener('pointerleave',clearPhysicalHover);
 const labels=atlasNode('g',{class:'atlas-labels','aria-hidden':'true'});viewport.append(labels);
 const candidates=[];
 const major=["edirne","istanbul","canakkale","bursa","kocaeli","izmir","mugla","antalya","icel","adana","hatay","afyon","konya","ankara","zonguldak","sinop","trabzon","sivas","malatya","tunceli","diyarbakir","erzurum","kars","van"];
 for(const p of [...P.data.provinces].sort((a,b)=>(major.includes(b.id)?1:0)-(major.includes(a.id)?1:0))){const text=atlasNode('text',{class:'atlas-city',x:p.center[0],y:p.center[1],'text-anchor':'middle'});text.textContent=p.id==='istanbul'?'İstanbul':p.id==='izmir'?'İzmir':p.name;labels.append(text);candidates.push({text,major:major.includes(p.id),x:p.center[0],y:p.center[1]});}
 // Sea positions use the original map coordinates; each candidate is checked against land.
 for(const [name,sx,sy,size] of [['Black Sea',860,-30,13],['Aegean Sea',-35,375,10],['Mediterranean Sea',640,755,13],['Sea of Marmara',210,160,9]]){const text=atlasNode('text',{class:'atlas-sea',x:sx,y:sy,'text-anchor':'middle','font-size':size});if(name==='Aegean Sea')text.setAttribute('transform',`rotate(-90 ${sx} ${sy})`);text.textContent=name;labels.append(text);candidates.push({text,sea:true,x:sx,y:sy,size});}
   const controls=document.createElement('div');controls.className='atlas-controls';
   const settingsSlot=canvas.closest('.province-map-window')?.querySelector('.province-map-settings');
   const electionPanel=!!settingsSlot&&allowMargin;
   if(electionPanel){
    controls.classList.add('atlas-customization');
    controls.innerHTML='<div class="atlas-customization-title">Map Customization</div>'+
     '<div class="atlas-customization-group" role="group" aria-label="Map Appearance"><div class="atlas-customization-label">Map Appearance</div><div class="atlas-customization-options atlas-customization-appearance">'+
     '<button type="button" data-atlas-mode="vanilla" aria-pressed="false">Vanilla</button><button type="button" data-atlas-mode="political" aria-pressed="false">Political</button><button type="button" data-atlas-mode="physical" aria-pressed="false">Physical</button><button type="button" data-atlas-mode="combined" aria-pressed="false">Combined</button></div></div>'+
     '<div class="atlas-customization-group" role="group" aria-label="Map Details"><div class="atlas-customization-label">Map Details</div><div class="atlas-customization-options atlas-customization-details">'+
     '<button type="button" data-atlas="labels" aria-pressed="false">All province names</button><button type="button" data-atlas="margin" aria-pressed="false">Victory margins</button></div></div>'+
     '<div class="atlas-customization-group" role="group" aria-label="Seat Representation"><div class="atlas-customization-label">Seat Representation</div><div class="atlas-customization-options atlas-customization-seats">'+
     '<button type="button" data-atlas-seat="none" aria-pressed="false">None</button><button type="button" data-atlas-seat="circular" aria-pressed="false">Circular</button><button type="button" data-atlas-seat="ball" aria-pressed="false">Ball</button></div></div>';
   }else{
    // The municipality map retains its original, independent controls.
    controls.innerHTML='<label><input type="checkbox" data-atlas="labels"> All province names</label><label><input type="checkbox" data-atlas-mode="political" disabled> Political Map</label><label><input type="checkbox" data-atlas-mode="physical" disabled> Physical Map</label><label><input type="checkbox" data-atlas-mode="combined" disabled> Political and Physical Map</label>'+(allowMargin?'<label><input type="checkbox" data-atlas="margin"> Victory margins</label>':'');
   }
  if(settingsSlot)settingsSlot.replaceChildren(controls);else canvas.before(controls);
  canvas.removeAttribute('title');
   const all=controls.querySelector('[data-atlas="labels"]');
   if(!electionPanel)all.checked=atlasShowAllNames;
   const syncDetailButtons=()=>{
    if(!electionPanel)return;
    atlasButtonState(all,atlasShowAllNames);
    atlasButtonState(controls.querySelector('[data-atlas="margin"]'),atlasVictoryMargins);
   };
   syncDetailButtons();
 function layout(){
  if(!svg.isConnected||!svg.getBoundingClientRect().width)return;
  const occupied=[...svg.querySelectorAll('.atlas-seat-markers .atlas-seat-marker')].map(g=>g.getBoundingClientRect()).filter(b=>b.width&&b.height),rect=svg.getBoundingClientRect(),fontScale=home.w/rect.width;
  for(const c of candidates){
   const t=c.text;t.style.display='';
   const baseSize=c.sea?c.size:atlasShowAllNames?9.25:10.5;
   t.setAttribute('font-size',baseSize*fontScale);t.setAttribute('x',c.x);t.setAttribute('y',c.y);
   if(!c.sea&&!c.major&&!atlasShowAllNames){t.style.display='none';continue;}
   let accepted=false;
   const offsets=c.sea?[[0,0]]:[[0,0],[0,-14],[0,14],[-17,0],[17,0],[0,-28],[0,28],[-24,-14],[24,-14],[-24,14],[24,14],...(occupied.length?[[0,-44],[0,44],[-44,0],[44,0],[-34,-34],[34,-34],[-34,34],[34,34],[0,-64],[0,64],[-64,0],[64,0]]:[])];
   for(const [dx,dy] of offsets){
    t.setAttribute('x',c.x+dx*fontScale);t.setAttribute('y',c.y+dy*fontScale);
    const b=t.getBoundingClientRect(),pad=2;
    if(b.left<rect.left+pad||b.right>rect.right-pad||b.top<rect.top+pad||b.bottom>rect.bottom-pad)continue;
    if(occupied.some(a=>b.left<a.right+pad&&b.right>a.left-pad&&b.top<a.bottom+pad&&b.bottom>a.top-pad))continue;
    if(c.sea){const matrix=svg.getScreenCTM();if(!matrix)continue;let land=false;
     for(let sx=b.left;sx<=b.right;sx+=Math.max(2,b.width/30)){for(const sy of [b.top,b.top+b.height/2,b.bottom]){const point=new DOMPoint(sx,sy).matrixTransform(matrix.inverse());if(paths.some(p=>p.isPointInFill(point))){land=true;break;}}if(land)break;}if(land)continue;}
    occupied.push(b);accepted=true;break;
   }
   if(!accepted){
    if(c.major||(!c.sea&&atlasShowAllNames)){
      // If dense seat markers leave no collision-free position, choose the least
      // obstructed valid candidate instead of dropping required province names.
      let best=null,bestScore=Infinity;
      for(const [dx,dy] of offsets){
       t.setAttribute('x',c.x+dx*fontScale);t.setAttribute('y',c.y+dy*fontScale);
       const b=t.getBoundingClientRect();
       if(b.left<rect.left||b.right>rect.right||b.top<rect.top||b.bottom>rect.bottom)continue;
       let score=(dx*dx+dy*dy)*.02;
       for(const a of occupied)score+=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))*5;
       if(score<bestScore){bestScore=score;best=[c.x+dx*fontScale,c.y+dy*fontScale];}
      }
      t.setAttribute('x',best?best[0]:c.x);t.setAttribute('y',best?best[1]:c.y);
      occupied.push(t.getBoundingClientRect());
     }else t.style.display='none';
   }
  }
 }
   if(electionPanel)all.onclick=()=>{atlasShowAllNames=!atlasShowAllNames;syncDetailButtons();layout();};
   else all.onchange=()=>{atlasShowAllNames=all.checked;layout();};
 const margin=controls.querySelector('[data-atlas="margin"]');
   if(margin){
    // The palette can refresh after the map is painted; publish the current
    // state on the canvas so refresh never silently removes margin shading.
    canvas.atlasMarginSync=()=>{
     canvas.dataset.atlasVictoryMargins=String(atlasVictoryMargins);
     for(const p of paths)if(p.atlasColor)p.style.fill=atlasVictoryMargins?marginColor(p.atlasColor,p.atlasVotes):p.atlasColor;
    };
    if(electionPanel)margin.onclick=()=>{atlasVictoryMargins=!atlasVictoryMargins;syncDetailButtons();root.AnatolianSyncVictoryMargins?.();};
    else{margin.checked=atlasVictoryMargins;margin.onchange=()=>{atlasVictoryMargins=margin.checked;root.AnatolianSyncVictoryMargins?.();};}
    canvas.atlasMarginSync();
   }
   // The viewBox is fixed. The browser scales the entire map to its full-width container.
  // Keep only responsive label collision recalculation; no wheel zoom or drag/pan.
  const resize=new ResizeObserver(()=>{if(!svg.isConnected){resize.disconnect();return;}root.requestAnimationFrame(layout);});
  resize.observe(canvas);root.requestAnimationFrame(layout);
 root.AnatolianMapDesign?.attach(svg,canvas);
  // Keep markers above the map textures and below the province labels.
  if(allowMargin){
   const seatLayer=atlasNode('g',{class:'atlas-seat-markers','aria-hidden':'true','pointer-events':'none'});
   viewport.insertBefore(seatLayer,labels);
   const seatAvailable=seatVisuals.available(snapshot);
    const seatInputs=[...controls.querySelectorAll('[data-atlas-seat]')];
    canvas.atlasSeatSync=()=>{
     const effectiveMode=seatAvailable?atlasSeatMode:'none';
     for(const input of seatInputs){
      const mode=input.dataset.atlasSeat;
      input.disabled=!seatAvailable&&mode!=='none';
      if(electionPanel)atlasButtonState(input,effectiveMode===mode);
      else input.checked=seatAvailable&&atlasSeatMode===mode;
      input.title=input.disabled?'No province-level parliamentary seat allocation is available for this election.':'';
     }
     seatVisuals.render(seatLayer,snapshot,effectiveMode);
    root.requestAnimationFrame(layout);
   };
    for(const input of seatInputs)input.addEventListener(electionPanel?'click':'change',()=>{
     atlasSeatMode=electionPanel?input.dataset.atlasSeat:(input.checked?input.dataset.atlasSeat:'none');
    root.AnatolianSyncSeatModes?.();
   });
   canvas.atlasSeatSync();
  }
   for(const input of controls.querySelectorAll('[data-atlas-mode]'))input.addEventListener(electionPanel?'click':'change',()=>{
    atlasMapMode=electionPanel?input.dataset.atlasMode:(input.checked?input.dataset.atlasMode:'vanilla');
    root.AnatolianSyncAtlasModes?.();
   });
  root.AnatolianSyncAtlasModes?.();
 // Reassert the final fill after map-design and palette initialization.
 canvas.atlasMarginSync?.();
 
}
// Session-only map presentation. Election fills, margins and province selection stay untouched.
root.AnatolianSyncAtlasModes=function(){
 const design=root.AnatolianMapDesign,project=design?.getActiveDesign?.();
 const physical=!!design?.hasTexture?.(project,'physical'),political=!!design?.hasTexture?.(project,'political'),combined=!!design?.hasTexture?.(project,'combined');
 const enabled={political,physical,combined};
 if(atlasMapMode!=='vanilla'&&!enabled[atlasMapMode])atlasMapMode='vanilla';
 for(const c of document.querySelectorAll('.province-map-canvas')){
  const controls=c.closest('.province-map-window')?.querySelector('.province-map-settings .atlas-controls')||c.previousElementSibling;if(!controls?.classList.contains('atlas-controls'))continue;
   for(const input of controls.querySelectorAll('[data-atlas-mode]')){
    const mode=input.dataset.atlasMode;
    input.disabled=mode==='vanilla'?false:!enabled[mode];
    if(input.tagName==='BUTTON')atlasButtonState(input,atlasMapMode===mode);
    else input.checked=atlasMapMode===mode;
   input.title=input.disabled?'This map texture is not installed.':'';
  }
  for(const mode of ['political','physical','combined'])c.classList.toggle('atlas-mode-'+mode,atlasMapMode===mode);
   c.atlasMarginSync?.();
 }
};
 root.AnatolianSyncVictoryMargins=function(){
  for(const canvas of document.querySelectorAll('.province-map-canvas'))canvas.atlasMarginSync?.();
 };
 root.AnatolianSyncSeatModes=function(){
  for(const canvas of document.querySelectorAll('.province-map-canvas'))canvas.atlasSeatSync?.();
 };
 function selectProvince(host,id){selectedProvince=id;for(const layer of host.querySelectorAll('.atlas-selection'))layer.replaceChildren();for(const p of host.querySelectorAll('[data-province]')){const selected=p.dataset.province===id;p.classList.toggle('atlas-selected',selected);p.setAttribute('aria-pressed',String(selected));if(selected){const layer=p.closest('svg').querySelector('.atlas-selection');if(layer)for(const cls of ['atlas-selection-halo','atlas-selection-gold'])layer.append(atlasNode('path',{d:p.getAttribute('d'),class:cls}));}}}

function closeDetail(){if(detail){detail.atlasTooltipCleanup?.();detail.remove();detail=null;if(overlay)overlay.querySelector('.province-current')?.focus();}}
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
 return Object.keys(votes).filter(k=>votes[k]>0||seats[k]>0).sort((a,b)=>a==='other'?1:b==='other'?-1:votes[b]-votes[a]).map(k=>{let amount=seats[k]||0;if(s.kind==='local'){if(p)amount=k==='other'?(P.provinceOtherParties.includes(p.winner)?1:0):(p.winner===k?1:0);else amount=P.reportingVotes(s.municipalities,true,formed)[k]||0;}const name=k==='other'?'<img class="province-party-flag" src="img/independent-placeholder.svg" alt=""><span class="province-party-name province-vote-fixed" style="color:#808080;font-weight:bold" tabindex="0">'+(p?'Other':'Others')+'<span class="province-group-tip">'+breakdown()+'</span></span>':styledParty(s,k,votes);return '<tr><th scope="row">'+name+'</th><td>'+num(votes[k])+'</td><td>'+pct(votes[k]/total)+'</td><td>'+num(amount)+'</td></tr>';}).join('');
}
 function attachProvinceOtherTooltip(backdrop){
  const panel=backdrop.querySelector('.province-detail');
  const trigger=panel?.querySelector('.province-vote-fixed');
  const original=trigger?.querySelector('.province-group-tip');
  if(!trigger||!original)return;
  const floating=original.cloneNode(true);
  floating.classList.add('province-group-tip-portal');
  floating.setAttribute('role','tooltip');
  floating.style.display='none';
  document.body.append(floating);
  let visible=false;
  function place(){
   if(!visible||!trigger.isConnected)return;
   const anchor=trigger.getBoundingClientRect();
   floating.style.display='block';
   floating.style.visibility='hidden';
   const box=floating.getBoundingClientRect(),pad=12;
   const left=Math.max(pad,Math.min(anchor.left,window.innerWidth-box.width-pad));
   let top=anchor.top-box.height-8;
   if(top<pad)top=anchor.bottom+8;
   top=Math.max(pad,Math.min(top,window.innerHeight-box.height-pad));
   floating.style.left=left+'px';floating.style.top=top+'px';
   floating.style.visibility='visible';
  }
  function show(){visible=true;place();}
  function hide(){visible=false;floating.style.display='none';}
  function keydown(event){if(event.key==='Escape')hide();}
  trigger.addEventListener('pointerenter',show);
  trigger.addEventListener('pointerleave',hide);
  trigger.addEventListener('focusin',show);
  trigger.addEventListener('focusout',hide);
  trigger.addEventListener('keydown',keydown);
  panel.addEventListener('scroll',place,true);
  window.addEventListener('resize',place);
  backdrop.atlasTooltipCleanup=()=>{
   trigger.removeEventListener('pointerenter',show);
   trigger.removeEventListener('pointerleave',hide);
   trigger.removeEventListener('focusin',show);
   trigger.removeEventListener('focusout',hide);
   trigger.removeEventListener('keydown',keydown);
   panel.removeEventListener('scroll',place,true);
   window.removeEventListener('resize',place);
   floating.remove();
  };
 }
function showProvince(id){if(!overlay)return;const p=current.provinces.find(p=>p.id===id);if(!p)return;closeDetail();detail=document.createElement('div');detail.className='province-detail-backdrop';detail.innerHTML='<section class="province-detail" role="dialog" aria-modal="true" aria-labelledby="province-detail-title"><button class="province-close" aria-label="Close province details">×</button><p class="province-kicker">'+esc(current.kind==='poll'?'Current projection':stamp(current))+'</p><h2 id="province-detail-title">'+esc(p.name)+'</h2><div class="province-detail-summary"><strong>'+num(p.population)+'</strong> residents · '+num(p.totalVotes)+' '+(current.kind==='poll'?'projected valid votes':'valid votes')+'</div><h3>Population and demographics</h3><table><thead><tr><th>Demographic</th><th>Share</th><th>People</th></tr></thead><tbody>'+Object.entries(p.demographics).map(([k,v])=>'<tr><th>'+esc(names[k])+'</th><td>'+pct(v)+'</td><td>'+num(p.demographicCounts?.[k]??v*p.population)+'</td></tr>').join('')+'</tbody></table><h3>Province election results</h3><table><thead><tr><th>Party</th><th>Votes</th><th>Share</th><th>'+ (current.kind==='local'?'Municipality':'Seats')+'</th></tr></thead><tbody>'+partyRows(current,p)+'</tbody></table><details><summary>Voting preferences by demographic</summary><p>Each demographic has its own provincial voting preferences.</p><table><tbody>'+Object.entries(p.classPreferences||{}).map(([c,v])=>'<tr><th>'+esc(names[c])+'</th><td>'+Object.entries(v).filter(([k,n])=>n>0).map(([k,n])=>esc(P.label(owner,k))+': '+pct(n)).join(', ')+'</td></tr>').join('')+'</tbody></table></details></section>';document.body.append(detail);attachProvinceOtherTooltip(detail);detail.querySelector('button').onclick=closeDetail;detail.addEventListener('click',e=>{if(e.target===detail)closeDetail();});detail.querySelector('button').focus();}
function render(s){
 current=s;
 const body=overlay.querySelector('.province-map-body'),ledger=overlay.querySelector('.province-map-ledger');
 ledger.innerHTML='<h3>'+(s.kind==='local'?'Local election results':'National results')+'</h3><table><thead><tr><th>Party</th><th>Votes</th><th>Share</th><th>'+(s.kind==='local'?'Municipalities':'Seats')+'</th></tr></thead><tbody>'+partyRows(s)+'</tbody></table><p class="province-map-note">'+(s.legacyReconstruction?'Imported from an older save. National vote shares are preserved. Provincial figures and absolute vote counts are reconstructed estimates.'+(s.legacyNationalSeatsPreserved?' The saved national seat totals are preserved.':' National seat totals are estimated.')+'':'')+'</p>';
 body.innerHTML='<div class="province-map-heading"><h2>'+esc(s.kind==='poll'?'Current polling projection':stamp(s))+'</h2><span>'+num(s.totalPopulation)+' residents · '+num(s.totalVotes)+' valid votes</span></div><div class="province-map-canvas">'+turkeyMapSvg()+'</div><div class="province-map-parliament"><h3>'+(s.kind==='senate'?'Republican Senate':'TBMM')+' · '+(s.kind==='poll'?'Projected distribution':s.kind==='local'?'Parliament at this election':'Election result')+'</h3>'+parliament(s.senateComposition||s.parliamentSeats||s.seats)+'<p>'+(s.kind==='senate'?'150 elected senators · 15 appointed members · Permanent members shown separately · 50 elected seats renewed':'450 MPs · Majority: 226')+'</p></div>';
 if(s.kind==='local')body.querySelector('.province-map-parliament').remove();else if(s.kind==='senate')root.AnatolianSenate.renderChamber(overlay.querySelector('.province-parliament'),owner,s);else drawParliament(s.parliamentSeats||s.seats);
 paintMap(body,s,owner,id=>showProvince(id));
}

function paintMap(host,s,Q,onSelect){
 const provinceById=new Map(s.provinces.map(p=>[p.id,p]));
 for(const path of host.querySelectorAll('[data-province]')){const p=provinceById.get(path.dataset.province);if(!p){path.style.fill='#808080';path.removeAttribute('tabindex');path.style.cursor='default';const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent='Not voting in this Senate renewal';path.append(title);continue;}const formed=s.socialistLeftFormed??(s.kind==='poll'?!!Q.socialist_left_formed:false),votes=P.reportingVotes(p.votes,false,formed),winner=s.kind==='local'?(P.provinceOtherParties.includes(p.winner)?'other':p.winner):Object.keys(votes).sort((a,b)=>votes[b]-votes[a])[0];path.dataset.atlasParty=winner;path.atlasColor=P.colors[winner]||'#808080';path.atlasVotes=p.votes;path.style.fill=path.atlasColor;const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=p.name+': '+(formed&&winner==='TIP'?'Socialist Left':P.label(Q,winner))+' '+pct(votes[winner]/p.totalVotes);path.append(title);path.onclick=()=>{selectProvince(host,p.id);onSelect(p.id);};path.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectProvince(host,p.id);onSelect(p.id);}};}
 for(const canvas of host.querySelectorAll('.province-map-canvas'))setupAtlas(canvas,true,s);
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
  // Display order: 1973 Senate / General / Local; 1975 Senate; 1977 General / Local;
  // 1977 Senate; 1981 General / Local; 1979 Senate; 1981 Senate; Current polls last.
  // Keep any additional elections from saves, immediately before Current polls.
  const scheduledGeneral=generalElectionYears(owner);
  const displaySlots=[
   ['senate',1973],['general',1973],['local',1973],
   ['senate',1975],['general',scheduledGeneral[1]],['local',1977],
   ['senate',1977],['general',scheduledGeneral[2]],['local',1981],
   ['senate',1979],['senate',1981]
  ];
  const slotOrder=slot=>{const i=displaySlots.findIndex(([kind,year])=>slot.kind===kind&&slot.year===year);return i<0?displaySlots.length:i;};
  slots.sort((a,b)=>slotOrder(a)-slotOrder(b));
 overlay.innerHTML='<section class="province-map-window" role="dialog" aria-modal="true" aria-label="Turkey election map"><button class="province-close" aria-label="Close election map">×</button><div class="province-map-dashboard"><div class="province-map-dashboard-left"><header class="province-map-toolbar province-map-tabs" role="tablist" aria-label="Election results">'+slots.map((v,i)=>'<button class="province-election-tab" role="tab" aria-selected="false" data-slot="'+i+'">'+v.year+' '+(v.kind==='senate'?'Senate '+v.group:v.kind==='general'?'General':'Local')+'</button>').join('')+'<button class="province-current active" role="tab" aria-selected="true">Current polls</button></header><div class="province-map-settings" role="group" aria-label="Map display settings"></div></div><aside class="province-map-ledger"></aside></div><div class="province-map-body"></div></section>';
 document.body.append(overlay);document.body.classList.add('province-map-open');const text=document.querySelector('#stats_sidebar .mytooltip'),style=text?getComputedStyle(text):getComputedStyle(document.body);overlay.style.setProperty('--province-party-font-size',style.fontSize);overlay.style.setProperty('--province-party-font-family',style.fontFamily);
 const select=button=>{overlay.querySelectorAll('[role="tab"]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',String(b===button));});};
 overlay.querySelector('.province-close').onclick=close;const currentButton=overlay.querySelector('.province-current');currentButton.onclick=()=>{closeDetail();select(currentButton);render(P.compute(owner,true));};
 overlay.querySelectorAll('.province-election-tab').forEach(button=>{const slot=slots[Number(button.dataset.slot)],snap=owner.province_election_history.filter(s=>s.kind===slot.kind&&s.year===slot.year).slice(-1)[0];button.disabled=!snap;button.title=snap?'View '+stamp(snap):'This election has not been recorded yet.';button.onclick=()=>{closeDetail();select(button);render(snap);};});
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});render(P.compute(owner,true));overlay.querySelector('.province-close').focus();}
document.addEventListener('keydown',e=>{if(!overlay)return;if(e.key==='Escape'){e.preventDefault();if(detail)closeDetail();else close();}if(e.key==='Tab'){const dialog=detail||overlay,focusable=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"],summary')],first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
root.openProvinceElectionMap=open;root.provinceGeneralElectionYears=generalElectionYears;
})(globalThis);

/* Anatolian Dawn election dashboard: ordered tabs and fixed Others tooltip (v2). */

/* Anatolian Dawn provincial seat visualizations (v3): circular and ball. */

/* Anatolian Dawn provincial seat visualizations (v5): 25% smaller than v3 (75% original). */

/* Anatolian Dawn election dashboard: Map Customization buttons (v6). */

/* Anatolian Dawn: Options, victory margins and provincial tooltip fixes (v7). */
