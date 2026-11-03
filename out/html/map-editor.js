/* Temporary local authoring UI. map-design.js owns the portable file format and renderer. */
(function(root){
'use strict';
const D=root.AnatolianMapDesign,P=root.AnatolianProvinces;if(!D||!root.document)return;
const KEY='anatolian-map-editor-draft-v1',BACKUP=KEY+'-backup',NS='http://www.w3.org/2000/svg';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(P.data.provinces.map(p=>[p.id,p]));
let shell=null,canvas=null,svg=null,doc=null,selectedLayer=null,selectedItem=null,selectedProvince=null,tool='move',history=[],future=[],saved='',timer=null,drawFrame=0,gesture=null,clipboard=null,priorFocus=null,sourceSvg=null;
let view={...D.extent},grid=false,neutral=false,closing=false,lastExported='',editorMapMode='combined';
// Keep image bytes once; undo snapshots contain lightweight references, never base64 copies.
const imagePool=new Map(),imageKeys=new Map(),persistedImages=new Set();let dbPromise=null,saveTail=Promise.resolve(),opening=false;
function snapshot(){return JSON.stringify(doc,(key,value)=>{if(key==='src'&&typeof value==='string'&&value.startsWith('data:image/')){let id=imageKeys.get(value);if(!id){id=D.id();imageKeys.set(value,id);imagePool.set(id,value);}return {$image:id};}return value;});}
function restoreSnapshot(data){return JSON.parse(data,(key,value)=>{if(key==='src'&&value?.$image){if(!imagePool.has(value.$image))throw Error('A saved image is missing. Import your exported project to restore it.');return imagePool.get(value.$image);}return value;});}
function imageRefs(data){return [...new Set([...data.matchAll(/"\$image":"([a-zA-Z0-9_-]+)"/g)].map(m=>m[1]))];}
function database(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('anatolian-map-editor',1);request.onupgradeneeded=()=>{request.result.createObjectStore('documents');request.result.createObjectStore('images');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Browser draft storage is busy in another tab.'));});return dbPromise;}
function requestValue(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function readDraft(key='current'){
 try{const db=await database(),record=await requestValue(db.transaction('documents').objectStore('documents').get(key));if(record){const refs=imageRefs(record);await Promise.all(refs.map(async id=>{if(imagePool.has(id))return;const src=await requestValue(db.transaction('images').objectStore('images').get(id));if(typeof src!=='string')throw Error('Missing stored image');imagePool.set(id,src);imageKeys.set(src,id);persistedImages.add(id);}));return D.validate(restoreSnapshot(record));}}
 catch(error){/* Older small drafts remain available if IndexedDB cannot be read. */}
 try{const raw=localStorage.getItem(key==='current'?KEY:BACKUP);return raw?D.validate(JSON.parse(raw)):null;}catch(error){return null;}
}
function autosave(){
 clearTimeout(timer);timer=null;if(!doc)return Promise.resolve();const record=snapshot(),assets=imageRefs(record),values=new Map(assets.map(id=>[id,imagePool.get(id)])),owner=shell;
 const job=async()=>{
  try{const db=await database(),pending=assets.filter(id=>!persistedImages.has(id)),tx=db.transaction(['documents','images'],'readwrite'),done=new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Autosave interrupted'));}),store=tx.objectStore('documents');
   const old=store.get('current');old.onsuccess=()=>{if(old.result&&old.result!==record)store.put(old.result,'backup');store.put(record,'current');};
   for(const id of pending)tx.objectStore('images').put(values.get(id),id);await done;pending.forEach(id=>persistedImages.add(id));saved=record;if(shell===owner)message('Draft and full-resolution images saved in this browser. Export project for a portable backup.');
   // Retain only the current/previous checkpoint on disk; session undo retains its own assets.
   try{const backup=await requestValue(db.transaction('documents').objectStore('documents').get('backup')),keep=new Set([...assets,...imageRefs(backup||'')]),keys=await requestValue(db.transaction('images').objectStore('images').getAllKeys()),orphans=keys.filter(k=>!keep.has(k));if(orphans.length){const cleanup=db.transaction('images','readwrite');for(const key of orphans){cleanup.objectStore('images').delete(key);persistedImages.delete(key);}await new Promise((resolve,reject)=>{cleanup.oncomplete=resolve;cleanup.onerror=()=>reject(cleanup.error);});}}catch(error){/* Storage cleanup must not invalidate a completed autosave. */}
  }catch(error){
   try{const data=JSON.stringify(restoreSnapshot(record));if(data.length>3500000)throw error;const prior=localStorage.getItem(KEY);if(prior&&prior!==data)localStorage.setItem(BACKUP,prior);localStorage.setItem(KEY,data);saved=record;if(shell===owner)message('Draft saved locally. Export project for a portable backup.');}
   catch(fallback){if(shell===owner)message('Browser storage could not save this draft. Export project now to protect your full-resolution images.',true);}
  }
  return saved===record;
 };saveTail=saveTail.then(job,job);return saveTail;
}
function pruneHistoryImages(){const live=new Set([...history,...future,snapshot()].flatMap(imageRefs));if(clipboard?.src){const key=imageKeys.get(clipboard.src);if(key)live.add(key);}for(const [key,src] of imagePool)if(!live.has(key)){imagePool.delete(key);imageKeys.delete(src);}D.pruneImageCache(new Set(imagePool.values()));}

let cropMode=false;
function imageProperties(i){const f=D.imageFrame(i),c=i.crop||{x:0,y:0,width:1,height:1};return attr('Visible width','imageWidth',f.width*i.scale,'number',1,50000,.5)+attr('Visible height','imageHeight',f.height*i.scale,'number',1,50000,.5)+check('Lock aspect ratio','lockAspect',i.lockAspect!==false)+`<button class="me-wide" type="button" data-action="crop-image">${cropMode?'Done cropping':'Crop image (C)'}</button>`+attr('Crop left %','cropX',+(c.x*100).toFixed(3),'number',0,99.999,.1)+attr('Crop top %','cropY',+(c.y*100).toFixed(3),'number',0,99.999,.1)+attr('Crop width %','cropWidth',+(c.width*100).toFixed(3),'number',.001,100,.1)+attr('Crop height %','cropHeight',+(c.height*100).toFixed(3),'number',.001,100,.1)+check('Flip horizontal','flipX',!!i.flipX)+check('Flip vertical','flipY',!!i.flipY)+'<button type="button" data-action="reset-crop">Reset crop</button><button type="button" data-action="reset-image-transform">Reset rotation / scale</button><button class="me-wide" type="button" data-action="fit-image">Fit visible image to map</button><p class="me-muted me-wide">Drag the corner/edge handles to resize. Drag the round handle to rotate; Shift snaps rotation. Crop mode trims the image without deleting the original. Shift temporarily toggles aspect locking while resizing. Embedded image: '+esc(i.name)+'.</p>';}
function imageNode(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;}
function rotatePoint(p,angle){const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return {x:p.x*c-p.y*s,y:p.x*s+p.y*c};}
function imageWorld(i,p){const o=D.position(i),q=rotatePoint({x:p.x*i.scale,y:p.y*i.scale},i.rotation);return {x:o.x+q.x,y:o.y+q.y};}
function imageLocal(i,p){const o=D.position(i),q=rotatePoint({x:p.x-o.x,y:p.y-o.y},-i.rotation);return {x:q.x/i.scale,y:q.y/i.scale};}
function setImageOrigin(i,p){const anchor=byId.get(i.provinceId);i.x=p.x-(anchor?anchor.center[0]:0);i.y=p.y-(anchor?anchor.center[1]:0);}
function drawImageHandles(overlay,i){
 const f=D.imageFrame(i),o=D.position(i),g=imageNode('g',{transform:`translate(${o.x} ${o.y}) rotate(${i.rotation}) scale(${i.scale})`,class:cropMode?'me-image-frame me-cropping':'me-image-frame'}),unit=view.width/svg.getBoundingClientRect().width/i.scale,entry=allLayers().find(x=>x.layer.id===selectedLayer),locked=[entry.layer,...entry.ancestors].some(l=>l.locked||!l.visible);
 if(cropMode){g.append(imageNode('image',{href:D.imageSource(i.src),x:0,y:0,width:i.width,height:i.height,opacity:.22,preserveAspectRatio:'none','pointer-events':'none',transform:`translate(${i.flipX?i.width:0} ${i.flipY?i.height:0}) scale(${i.flipX?-1:1} ${i.flipY?-1:1})`}));}
 g.append(imageNode('rect',{...f,class:'me-object-outline'}));
 if(!locked){for(const [name,hx,hy] of [['nw',0,0],['n',.5,0],['ne',1,0],['e',1,.5],['se',1,1],['s',.5,1],['sw',0,1],['w',0,.5]]){const handle=imageNode('rect',{x:f.x+f.width*hx-unit*4,y:f.y+f.height*hy-unit*4,width:unit*8,height:unit*8,'data-image-handle':name,class:'me-image-handle','pointer-events':'all','aria-label':(cropMode?'Crop ':'Resize ')+name});handle.style.pointerEvents='all';g.append(handle);}
  if(!cropMode){g.append(imageNode('line',{x1:f.x+f.width/2,y1:f.y,x2:f.x+f.width/2,y2:f.y-28*unit,class:'me-rotation-stem'}));const handle=imageNode('circle',{cx:f.x+f.width/2,cy:f.y-28*unit,r:unit*5,'data-image-handle':'rotate',class:'me-image-handle me-rotate-handle','pointer-events':'all','aria-label':'Rotate image'});handle.style.pointerEvents='all';g.append(handle);}}
 overlay.append(g);
}
function startImageGesture(e,pt,before){
 const hit=e.target.closest?.('[data-image-handle]'),i=currentObject();if(!hit||i?.type!=='image')return false;if(!editable())return true;
 const original={...i,crop:{...(i.crop||{x:0,y:0,width:1,height:1})}},f=D.imageFrame(original),name=hit.dataset.imageHandle,hx=name.includes('e')?1:name.includes('w')?0:.5,hy=name.includes('s')?1:name.includes('n')?0:.5;
 gesture={kind:name==='rotate'?'image-rotate':cropMode?'image-crop':'image-resize',pointer:e.pointerId,before,item:i,original,frame:f,handle:name,fx:1-hx,fy:1-hy,fixed:imageWorld(original,{x:f.x+f.width*(1-hx),y:f.y+f.height*(1-hy)}),center:imageWorld(original,{x:f.x+f.width/2,y:f.y+f.height/2}),start:pt};
 svg.setPointerCapture(e.pointerId);return true;
}
function updateImageGesture(g,pt,e){
 const i=g.item,o=g.original,f=g.frame,local=imageLocal(o,pt),h=g.handle;
 if(g.kind==='image-crop'){
  let x=f.x,y=f.y,right=f.x+f.width,bottom=f.y+f.height;const minX=o.width*.00001,minY=o.height*.00001;
  if(h.includes('w'))x=Math.max(0,Math.min(right-minX,local.x));if(h.includes('e'))right=Math.min(o.width,Math.max(x+minX,local.x));if(h.includes('n'))y=Math.max(0,Math.min(bottom-minY,local.y));if(h.includes('s'))bottom=Math.min(o.height,Math.max(y+minY,local.y));
  i.crop={x:x/o.width,y:y/o.height,width:(right-x)/o.width,height:(bottom-y)/o.height};
 }else if(g.kind==='image-rotate'){
  let angle=o.rotation+(Math.atan2(pt.y-g.center.y,pt.x-g.center.x)-Math.atan2(g.start.y-g.center.y,g.start.x-g.center.x))*180/Math.PI;if(e.shiftKey)angle=Math.round(angle/15)*15;i.rotation=((angle+540)%360)-180;
  const q=rotatePoint({x:(f.x+f.width/2)*i.scale,y:(f.y+f.height/2)*i.scale},i.rotation);setImageOrigin(i,{x:g.center.x-q.x,y:g.center.y-q.y});
 }else{
  const delta=rotatePoint({x:(pt.x-g.fixed.x)/o.scale,y:(pt.y-g.fixed.y)/o.scale},-o.rotation),horizontal=h.includes('e')||h.includes('w'),vertical=h.includes('n')||h.includes('s');
  let w=horizontal?Math.max(1,delta.x*(h.includes('w')?-1:1)):f.width,height=vertical?Math.max(1,delta.y*(h.includes('n')?-1:1)):f.height;const locked=(o.lockAspect!==false)!==!!e.shiftKey;
  if(locked){if(!horizontal)w=height*f.width/f.height;else if(!vertical)height=w*f.height/f.width;else if(w/f.width>=height/f.height)height=w*f.height/f.width;else w=height*f.width/f.height;const cap=Math.min(1,50000*o.crop.width/w,50000*o.crop.height/height);w*=cap;height*=cap;}
  i.width=Math.max(1,Math.min(50000,w/o.crop.width));i.height=Math.max(1,Math.min(50000,height/o.crop.height));const nf=D.imageFrame(i),q=rotatePoint({x:(nf.x+nf.width*g.fx)*i.scale,y:(nf.y+nf.height*g.fy)*i.scale},i.rotation);setImageOrigin(i,{x:g.fixed.x-q.x,y:g.fixed.y-q.y});
 }
}
function imagePropertyChange(i,key,value){
 if(key==='imageWidth'||key==='imageHeight'){
  const f=D.imageFrame(i),ratio=key==='imageWidth'?value/(f.width*i.scale):value/(f.height*i.scale);
  if(i.lockAspect!==false){i.width*=ratio;i.height*=ratio;}else if(key==='imageWidth')i.width*=ratio;else i.height*=ratio;return true;
 }
 const cropKeys={cropX:'x',cropY:'y',cropWidth:'width',cropHeight:'height'};if(cropKeys[key]){i.crop={...(i.crop||{x:0,y:0,width:1,height:1}),[cropKeys[key]]:value/100};return true;}
 return false;
}

const brush={color:'#6b5437',size:24,opacity:.35,hardness:.5,preset:'soft',clip:false};
const shape={fill:'#bba873',stroke:'#5b4a32',strokeWidth:2,noFill:false,dash:false};
const text={text:'Province label',font:'Georgia',size:22,color:'#252b28',halo:'#f6f3e8',haloWidth:2,bold:false,italic:false,align:'middle',spacing:0,leading:1.2,leader:true,anchor:true};
function $(s){return shell?.querySelector(s);}
function allLayers(a=doc.layers,out=[],ancestors=[]){for(const l of a){out.push({layer:l,ancestors});allLayers(l.children,out,[...ancestors,l]);}return out;}
function currentLayer(){return allLayers().find(x=>x.layer.id===selectedLayer)?.layer||doc.layers.at(-1);}
function currentObject(){return currentLayer()?.items.find(i=>i.id===selectedItem)||null;}
function editable(layerId=selectedLayer){const entry=allLayers().find(x=>x.layer.id===layerId);if(!entry)return false;if([entry.layer,...entry.ancestors].some(l=>l.locked||!l.visible)){message('This layer or its group is hidden or locked. Choose an unlocked, visible layer.',true);return false;}return true;}
function message(s,error=false){const status=$('.me-status');if(status){status.textContent=s;status.classList.toggle('me-error',error);}}

function trimHistory(stack){let size=stack.reduce((n,s)=>n+s.length,0);while(stack.length>1&&(stack.length>60||size>16000000))size-=stack.shift().length;}
function remember(before,stamp=true){if(before!==snapshot()){history.push(before);trimHistory(history);future=[];if(stamp)doc.updatedAt=new Date().toISOString();pruneHistoryImages();queueSave();}updateHistory();}
function change(fn,stamp=true){const before=snapshot();try{fn();D.validate(doc);remember(before,stamp);refresh();}catch(e){doc=restoreSnapshot(before);message(e.message,true);refreshPanels();}}

function queueSave(){clearTimeout(timer);timer=setTimeout(autosave,450);}
function undo(){if(!history.length)return;future.push(snapshot());trimHistory(future);doc=restoreSnapshot(history.pop());selectedItem=null;reconcile();queueSave();refresh();}
function redo(){if(!future.length)return;history.push(snapshot());trimHistory(history);doc=restoreSnapshot(future.pop());selectedItem=null;reconcile();queueSave();refresh();}
function reconcile(){if(!allLayers().some(x=>x.layer.id===selectedLayer))selectedLayer=doc.layers.at(-1).id;}
function updateHistory(){if(!shell)return;$('[data-action="undo"]').disabled=!history.length;$('[data-action="redo"]').disabled=!future.length;}
function attr(label,key,value,type='number',min='',max='',step='1',scope='object'){return `<label>${label}<input data-${scope}="${key}" type="${type}" value="${esc(value)}"${min!==''?' min="'+min+'"':''}${max!==''?' max="'+max+'"':''} step="${step}"></label>`;}
function check(label,key,value,scope='object'){return `<label class="me-check"><input type="checkbox" data-${scope}="${key}"${value?' checked':''}> ${label}</label>`;}
function select(label,key,value,choices,scope='object'){return `<label>${label}<select data-${scope}="${key}">${choices.map(c=>{const [v,n]=Array.isArray(c)?c:[c,c];return `<option value="${esc(v)}"${value===v?' selected':''}>${esc(n)}</option>`;}).join('')}</select></label>`;}
function refreshPanels(){
 if(!shell)return;reconcile();const l=currentLayer(),i=currentObject();
 $('.me-project-name').value=doc.name;$('.me-image-toolbar').hidden=i?.type!=='image';$('.me-image-mode').textContent=cropMode?'Done cropping (C)':'Crop (C)';$('[data-image-lock]').checked=i?.lockAspect!==false;
 $('.me-layer-list').innerHTML=[...doc.layers].reverse().map(layerRow).join('');
 $('.me-layer-properties').innerHTML=attr('Layer name','name',l.name,'text','','','','layer')+select('Blend mode','blend',l.blend,D.blends,'layer')+attr('Opacity','opacity',l.opacity,'range',0,1,.01,'layer')+select('Clip artwork to','clip',l.clip,[['none','No clipping'],['land','All land'],['sea','Water only'],['province','One province']],'layer')+(l.clip==='province'?select('Clipping province','provinceId',l.provinceId||'',provinceOptions(),'layer'):'')+`<p class="me-muted">${l.items.length} direct objects${l.children.length?' · '+l.children.length+' preserved sublayers':''}. Locked or hidden groups protect their children.</p>`;
 $('.me-objects').innerHTML=[...l.items].reverse().map(o=>`<button type="button" data-item="${o.id}" class="${selectedItem===o.id?'active':''}">${esc(o.type==='text'?o.text.slice(0,35)||'Empty label':o.type==='image'?o.name:o.type)}${o.provinceId?' · '+esc(byId.get(o.provinceId).name):''}</button>`).join('')||'<p class="me-muted">Draw on the map to add artwork to this layer.</p>';
 $('.me-object-properties').innerHTML=i?objectProperties(i):'<p class="me-muted">Use Move/select to click an object, or select it in the object list.</p>';
 $('.me-physical-state').textContent=doc.physicalLayerId?(doc.physicalLayerId===selectedLayer?'Editing the physical map layer · image tools are available.':'Physical layer exists · select it to align the map.'):'No physical map yet · create a physical layer, then paste an image.';
  $('[data-action="physical-layer"]').textContent=doc.physicalLayerId?'Select physical map layer':'Create physical map layer';
  $('[data-action="political-layer"]').textContent=doc.politicalLayerId?'Select political map layer':'Create political map layer';
  $('[data-action="combined-layer"]').textContent=doc.combinedLayerId?'Select combined map layer':'Create political + physical map layer';
  refreshTextureSettings();
  $('.me-province-name').textContent=selectedProvince?byId.get(selectedProvince).name:'No province selected';
 $('[data-action="merge"]').disabled=doc.layers.findIndex(l=>l.id===selectedLayer)<=0;
 $('[data-action="ungroup"]').disabled=!l.children.length;
 updateHistory();refreshToolOptions();refreshMapSettings();refreshPaletteSettings();
}
function layerRow(l,depth=0){return `<div class="me-layer-row${l.id===selectedLayer?' active':''}" style="--layer-depth:${depth}"><button type="button" data-visibility="${l.id}" aria-label="${l.visible?'Hide':'Show'} ${esc(l.name)}" title="Toggle layer visibility">${l.visible?'◉':'○'}</button><button type="button" data-lock="${l.id}" aria-label="${l.locked?'Unlock':'Lock'} ${esc(l.name)}" title="Toggle layer lock">${l.locked?'◆':'◇'}</button><button type="button" data-layer="${l.id}">${esc(l.name)}${l.children.length?' ▾':''}</button></div>`+[...l.children].reverse().map(c=>layerRow(c,depth+1)).join('');}
function provinceOptions(){return [['','No province'],...P.data.provinces.map(p=>[p.id,p.id==='istanbul'?'İstanbul':p.name])];}
function objectProperties(i){
 let html=attr('X / anchored offset','x',i.x,'number',-10000,10000,.5)+attr('Y / anchored offset','y',i.y,'number',-10000,10000,.5)+attr('Rotation °','rotation',i.rotation,'number',-360,360,1)+attr('Scale','scale',i.scale,'number',.05,20,.05)+attr('Object opacity','opacity',i.opacity,'range',0,1,.01)+select('Attached province','provinceId',i.provinceId||'',provinceOptions())+select('Clip this object','clipProvince',i.clipProvince||'',provinceOptions());
 if(i.type==='text')html+='<label class="me-wide">Label text<textarea data-object="text" rows="3">'+esc(i.text)+'</textarea></label>'+select('Font','font',i.font,D.fonts)+attr('Text size','size',i.size,'number',4,160)+attr('Text color','color',i.color,'color')+attr('Halo color','halo',i.halo,'color')+attr('Halo width','haloWidth',i.haloWidth,'number',0,12,.5)+select('Alignment','align',i.align,[['start','Left'],['middle','Center'],['end','Right']])+attr('Letter spacing','spacing',i.spacing,'number',-5,20,.2)+attr('Line spacing','leading',i.leading,'number',.7,3,.1)+check('Bold','bold',i.bold)+check('Italic','italic',i.italic)+check('Province leader line','leader',i.leader);
 else if(['brush','eraser'].includes(i.type))html+=attr('Brush size','size',i.size,'number',.2,300,.5)+attr('Color','color',i.color,'color')+attr('Hardness','hardness',i.hardness,'range',0,1,.01)+select('Brush finish','brush',i.brush,['ink','soft','stipple']);
 else if(['rect','ellipse','line'].includes(i.type))html+=attr('Width','width',i.width,'number',-5000,5000)+attr('Height','height',i.height,'number',-5000,5000)+attr('Fill','fill',i.fill==='none'?'#bba873':i.fill,'color')+check('No fill','noFill',i.fill==='none')+attr('Outline','stroke',i.stroke==='none'?'#5b4a32':i.stroke,'color')+attr('Outline width','strokeWidth',i.strokeWidth,'number',0,40,.5)+check('Dashed outline','dash',i.dash);
 else if(i.type==='wash')html+=select('Wash type','kind',i.kind,['solid','linear','radial','grain'])+attr('Start / grain color','color',i.color,'color')+attr('End color','color2',i.color2,'color')+attr('Gradient angle','angle',i.angle,'number',0,360)+attr('End / grain opacity','strength',i.strength,'range',0,1,.01);
 else if(i.type==='image')html+=imageProperties(i);
 return html;
}
function refreshToolOptions(){
 const target=$('.me-tool-options');let html='';
 if(tool==='brush'||tool==='eraser')html=select('Brush preset','preset',brush.preset,[['ink','Hard round'],['soft','Soft round'],['stipple','Stipple / grain']],'brush')+attr('Size (map units)','size',brush.size,'number',.2,300,.5,'brush')+attr('Color','color',brush.color,'color','','','','brush')+attr('Flow / opacity','opacity',brush.opacity,'range',0,1,.01,'brush')+attr('Hardness','hardness',brush.hardness,'range',0,1,.01,'brush')+check('Clip stroke to selected province','clip',brush.clip,'brush');
 else if(tool==='text')html='<label class="me-wide">New label<textarea data-text="text" rows="2">'+esc(text.text)+'</textarea></label>'+select('Font','font',text.font,D.fonts,'text')+attr('Size','size',text.size,'number',4,160,1,'text')+attr('Text color','color',text.color,'color','','','','text')+attr('Halo','halo',text.halo,'color','','','','text')+check('Attach to clicked province','anchor',text.anchor,'text')+check('Draw leader line','leader',text.leader,'text')+check('Bold','bold',text.bold,'text')+check('Italic','italic',text.italic,'text');
 else if(['rect','ellipse','line'].includes(tool))html=attr('Fill','fill',shape.fill,'color','','','','shape')+attr('Outline','stroke',shape.stroke,'color','','','','shape')+attr('Outline width','strokeWidth',shape.strokeWidth,'number',0,40,.5,'shape')+check('No fill','noFill',shape.noFill,'shape')+check('Dashed outline','dash',shape.dash,'shape');
 else html='<p class="me-muted">'+({move:'Click artwork to select it; drag to move. Shift-click a province to select its anchor. Arrow keys nudge; Shift nudges 10 units.',province:'Click any province to select it for clipping and attached text.',pan:'Drag to move the view. Wheel zooms toward your cursor. Space temporarily pans with any tool.',eyedropper:'Click a province or colored artwork to sample its base color into the brush.'}[tool]||'')+'</p>';
 target.innerHTML=html;
 for(const b of shell.querySelectorAll('[data-tool]'))b.classList.toggle('active',b.dataset.tool===tool);
 $('.me-tool-name').textContent={move:'Move/select',brush:'Brush',eraser:'Eraser',text:'Text',rect:'Rectangle',ellipse:'Ellipse',line:'Line',province:'Province anchor',pan:'Hand/pan',eyedropper:'Eyedropper'}[tool];
}
function refreshMapSettings(){const s=doc.settings;$('.me-map-settings').innerHTML=attr('Sea color','sea',s.sea,'color','','','','setting')+attr('Provincial borders','border',s.border,'color','','','','setting')+attr('Border width','borderWidth',s.borderWidth,'number',0,6,.1,'setting')+attr('Coast color','coast',s.coast,'color','','','','setting')+attr('Coast width','coastWidth',s.coastWidth,'number',0,10,.1,'setting')+attr('Paper grain','grain',s.grain,'range',0,.3,.005,'setting')+attr('Printed ink shading','ink',s.ink,'range',0,3,.05,'setting')+attr('City label color','cityColor',s.cityColor,'color','','','','setting')+attr('Sea label color','seaLabelColor',s.seaLabelColor,'color','','','','setting')+attr('Label halo','labelHalo',s.labelHalo,'color','','','','setting')+select('Base label font','labelFont',s.labelFont,D.fonts,'setting')+check('Existing city and sea labels','labels',s.labels,'setting')+check('Faint coastline shadow','shadow',s.shadow,'setting');}
function refreshTextureSettings(){
 const host=$('.me-texture-settings');if(!host)return;
 const labels={political:'Political texture',physical:'Physical texture',combined:'Political + physical texture (unique file)'};
 host.innerHTML=['political','physical','combined'].map(kind=>{
  const l=doc.layers.find(l=>l.id===doc[kind+'LayerId']);if(!l)return '<p class="me-muted">'+labels[kind]+': not created yet.</p>';
  const position=doc.layers.indexOf(l)+1;
  return `<div class="me-texture-card" data-texture-kind="${kind}"><strong>${labels[kind]} · layer ${position} of ${doc.layers.length}</strong>`+
   check('Visible in selected mode','visible',l.visible,'texture')+
   select('Blend mode','blend',l.blend,D.blends,'texture')+
   attr('Layer opacity ('+Math.round(l.opacity*100)+'%)','opacity',l.opacity,'range',0,1,.01,'texture')+
   select('Clipping','clip',l.clip,[['none','No clipping'],['land','Land only'],['sea','Water only'],['province','One province']],'texture')+
   (l.clip==='province'?select('Clip province','provinceId',l.provinceId||'',provinceOptions(),'texture'):'')+
   `<button type="button" data-action="texture-select-${kind}">Select &amp; edit layer</button></div>`;
 }).join('');
 const selector=$('[data-editor-map-mode]');if(selector)selector.value=editorMapMode;
}
function refreshPaletteSettings(){
 const palette=root.AnatolianColorPalette,parts=$('.me-palette-parties'),entities=$('.me-palette-entities');
 if(!palette||!parts||!entities)return;
 const lists=palette.lists();
 for(const [section,holder] of [['parties',parts],['entities',entities]]){
  holder.innerHTML=lists[section].map(entry=>{
   const current=doc.palette?.[section]?.[entry.key]||entry.color,changed=current.toLowerCase()!==entry.color.toLowerCase();
   return `<div class="me-palette-row"><label><span>${esc(entry.name)}</span><input type="color" data-palette-section="${section}" data-palette-key="${esc(entry.key)}" value="${esc(current)}" aria-label="Color for ${esc(entry.name)}"></label><input type="text" class="me-palette-hex" data-palette-section="${section}" data-palette-key="${esc(entry.key)}" value="${esc(current.toUpperCase())}" maxlength="7" aria-label="Hex code for ${esc(entry.name)}"><button type="button" data-palette-reset="${esc(entry.key)}" data-palette-section="${section}" ${changed?'':'disabled'} title="Restore original color">Reset</button></div>`;
  }).join('');
 }
}
function paint(){drawFrame=0;if(!shell)return;const editing=currentObject();if(gesture&&editing?.type==='image'&&(gesture.kind.startsWith('image-')||gesture.kind==='move'))D.updateImage(svg,editing);else D.styleMap(svg,canvas,doc);svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.width} ${view.height}`);canvas.classList.toggle('me-grid',grid);canvas.dataset.editorMapMode=editorMapMode;for(const path of svg.querySelectorAll('[data-province]')){if(neutral){if(!path.dataset.meOriginalFill)path.dataset.meOriginalFill=path.style.fill;path.style.fill='#c8bfa7';}else if(path.dataset.meOriginalFill){path.style.fill=path.dataset.meOriginalFill;delete path.dataset.meOriginalFill;}}
  svg.querySelectorAll('.me-selection,.me-province-highlight').forEach(n=>n.remove());
  const overlay=document.createElementNS(NS,'g');overlay.setAttribute('class','me-selection');overlay.setAttribute('pointer-events','none');
  if(selectedProvince)for(const p of svg.querySelectorAll('[data-province]'))if(p.dataset.province===selectedProvince){const outline=document.createElementNS(NS,'path');outline.setAttribute('d',p.getAttribute('d'));outline.setAttribute('class','me-province-highlight');overlay.append(outline);}
  const item=selectedItem&&svg.querySelector('[data-design-item="'+selectedItem+'"]');if(editing?.type==='image')drawImageHandles(overlay,editing);else if(item){try{const b=item.getBoundingClientRect(),inv=svg.getScreenCTM().inverse(),a=new DOMPoint(b.left,b.top).matrixTransform(inv),z=new DOMPoint(b.right,b.bottom).matrixTransform(inv),rect=document.createElementNS(NS,'rect');for(const [k,v] of Object.entries({x:a.x-3,y:a.y-3,width:z.x-a.x+6,height:z.y-a.y+6,class:'me-object-outline'}))rect.setAttribute(k,v);overlay.append(rect);}catch(e){/* Detached render during close. */}}
  svg.append(overlay);$('.me-zoom-label').textContent=Math.round(D.extent.width/view.width*100)+'%';
}
function schedulePaint(){if(!drawFrame)drawFrame=requestAnimationFrame(paint);}
function refresh(){refreshPanels();paint();}
function world(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
function provinceAt(pt){for(const p of [...svg.querySelectorAll('[data-province]')].reverse())if(p.isPointInFill(new DOMPoint(pt.x,pt.y)))return p.dataset.province;return null;}
function objectAt(e){const layers=[];function walk(a,protectedByParent=false){for(const l of a){const protectedLayer=protectedByParent||!l.visible||l.locked;if(protectedLayer||[doc.physicalLayerId,doc.politicalLayerId,doc.combinedLayerId].includes(l.id)&&selectedLayer!==l.id)continue;walk(l.children,protectedLayer);layers.push(l);}}walk(doc.layers);for(const l of layers.reverse())for(const i of [...l.items].reverse()){if(i.type==='eraser')continue;if(i.type==='image'){const pt=imageLocal(i,world(e)),f=D.imageFrame(i);if(pt.x>=f.x&&pt.x<=f.x+f.width&&pt.y>=f.y&&pt.y<=f.y+f.height)return {layer:l,item:i};continue;}const el=svg.querySelector('[data-design-item="'+i.id+'"]');if(!el)continue;const b=el.getBoundingClientRect();if(e.clientX>=b.left-4&&e.clientX<=b.right+4&&e.clientY>=b.top-4&&e.clientY<=b.bottom+4)return {layer:l,item:i};}return null;}
function baseItem(type,pt){return {id:D.id(),type,x:pt.x,y:pt.y,rotation:0,scale:1,opacity:1,provinceId:null,clipProvince:null};}
function fit(){view={...D.extent};paint();}
function zoom(factor,at){const width=Math.max(D.extent.width/10,Math.min(D.extent.width*1.5,view.width/factor)),ratio=width/view.width,p=at||{x:view.x+view.width/2,y:view.y+view.height/2};view={x:p.x-(p.x-view.x)*ratio,y:p.y-(p.y-view.y)*ratio,width,height:width*D.extent.height/D.extent.width};boundView();paint();}
function boundView(){view.x=Math.max(D.extent.x-view.width*.85,Math.min(D.extent.x+D.extent.width-view.width*.15,view.x));view.y=Math.max(D.extent.y-view.height*.85,Math.min(D.extent.y+D.extent.height-view.height*.15,view.y));}
let space=false;
function pointerDown(e){
 if(closing||gesture||(e.button!==0&&e.button!==1))return;e.preventDefault();canvas.focus({preventScroll:true});const pt=world(e),before=snapshot(),active=space||e.button===1?'pan':tool;
 if(active!=='pan'&&startImageGesture(e,pt,before))return;
 if(active==='pan'){gesture={kind:'pan',pointer:e.pointerId,point:pt};}
 else if(active==='province'||(active==='move'&&e.shiftKey)){selectedProvince=provinceAt(pt);refresh();return;}
 else if(active==='eyedropper'){const hit=objectAt(e),pid=provinceAt(pt),p=pid&&svg.querySelector('[data-province="'+pid+'"]'),color=hit?.item.color||hit?.item.fill||p?.style.fill;if(color){const c=document.createElement('canvas').getContext('2d');c.fillStyle=color;brush.color=c.fillStyle;tool='brush';refreshToolOptions();message('Sampled '+brush.color+' into the brush.');}return;}
 else if(active==='move'){const hit=objectAt(e);if(!hit){selectedItem=null;selectedProvince=provinceAt(pt);refresh();return;}selectedLayer=hit.layer.id;selectedItem=hit.item.id;gesture={kind:'move',pointer:e.pointerId,point:pt,x:hit.item.x,y:hit.item.y,item:hit.item,before};refreshPanels();}
 else{
  if(!editable())return;const l=currentLayer();let item;
  if(['brush','eraser'].includes(active)){
   if(brush.clip&&!selectedProvince){message('Select a province with the Province tool before using constrained strokes.',true);return;}
   item={...baseItem(active,pt),color:brush.color,size:brush.size,opacity:brush.opacity,hardness:brush.preset==='ink'?1:brush.hardness,brush:brush.preset,points:[[0,0,Math.max(.05,e.pressure||.5)]],pressure:e.pointerType==='pen',clipProvince:brush.clip?selectedProvince:null};
  }else if(active==='text'){
   const pid=provinceAt(pt)||selectedProvince;item={...baseItem('text',pt),...text};delete item.anchor;if(text.anchor&&pid){item.provinceId=pid;item.x-=byId.get(pid).center[0];item.y-=byId.get(pid).center[1];selectedProvince=pid;}
   change(()=>{l.items.push(item);selectedItem=item.id;});tool='move';refreshToolOptions();return;
  }else item={...baseItem(active,pt),width:0,height:0,fill:shape.noFill?'none':shape.fill,stroke:shape.stroke,strokeWidth:shape.strokeWidth,dash:shape.dash};
  l.items.push(item);selectedItem=item.id;gesture={kind:'draw',pointer:e.pointerId,point:pt,item,before};
 }
 svg.setPointerCapture(e.pointerId);schedulePaint();
}
function pointerMove(e){if(!gesture){if(['brush','eraser'].includes(tool)){let cursor=svg.querySelector('.me-brush-cursor');if(!cursor){cursor=document.createElementNS(NS,'circle');cursor.setAttribute('class','me-brush-cursor');svg.append(cursor);}const pt=world(e);cursor.setAttribute('cx',pt.x);cursor.setAttribute('cy',pt.y);cursor.setAttribute('r',brush.size/2);}return;}if(gesture.pointer!==e.pointerId)return;e.preventDefault();const pt=world(e),g=gesture;
 if(g.kind.startsWith('image-'))updateImageGesture(g,pt,e);
 else if(g.kind==='pan'){view.x+=g.point.x-pt.x;view.y+=g.point.y-pt.y;boundView();svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.width} ${view.height}`);}
 else if(g.kind==='move'){g.item.x=g.x+pt.x-g.point.x;g.item.y=g.y+pt.y-g.point.y;}
 else if(g.item.points){const points=g.item.points,last=points.at(-1),x=pt.x-g.item.x,y=pt.y-g.item.y;if(points.length<6000&&Math.hypot(x-last[0],y-last[1])>Math.max(.4,g.item.size*.025))points.push([x,y,Math.max(.05,e.pressure||.5)]);}
 else{g.item.width=pt.x-g.point.x;g.item.height=pt.y-g.point.y;if(e.shiftKey&&g.item.type!=='line'){const size=Math.max(Math.abs(g.item.width),Math.abs(g.item.height));g.item.width=Math.sign(g.item.width||1)*size;g.item.height=Math.sign(g.item.height||1)*size;}}
 schedulePaint();
}
function pointerUp(e,cancel=false){if(!gesture||gesture.pointer!==e.pointerId)return;const g=gesture;gesture=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(g.before){if(cancel)doc=restoreSnapshot(g.before);else{try{D.validate(doc);remember(g.before);}catch(err){doc=restoreSnapshot(g.before);message(err.message,true);}}}refresh();}
function duplicateObject(){const i=currentObject();if(!i||!editable())return;change(()=>{const copy=D.clone(i);copy.id=D.id();copy.x+=12;copy.y+=12;currentLayer().items.push(copy);selectedItem=copy.id;});}
function parentList(id,a=doc.layers){for(const l of a){if(l.id===id)return a;const nested=parentList(id,l.children);if(nested)return nested;}return null;}
function freshIds(l){l.id=D.id();for(const i of l.items)i.id=D.id();for(const child of l.children)freshIds(child);return l;}
function crc32(bytes){let c=0xffffffff;for(const v of bytes){c^=v;for(let b=0;b<8;b++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function zipArchive(files){const enc=new TextEncoder(),out=[],central=[];let offset=0;const u16=n=>[n&255,n>>>8&255],u32=n=>[n&255,n>>>8&255,n>>>16&255,n>>>24&255];
 for(const [name,bytes] of files){const n=enc.encode(name),crc=crc32(bytes),size=bytes.length;if(size>0xffffffff)throw Error('File exceeds ZIP format limit.');
  const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(n.length),...u16(0),...n]);out.push(local,bytes);
  central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(n.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...n]));offset+=local.length+size;
 }
 const centralSize=central.reduce((n,x)=>n+x.length,0),tail=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralSize),...u32(offset),...u16(0)]);
 return new Blob([...out,...central,tail],{type:'application/zip'});
}
async function bakedTexturePNG(kind){
 const id=doc[kind+'LayerId'],layer=doc.layers.find(l=>l.id===id);
 const allImages=l=>[...l.items.filter(i=>i.type==='image'),...l.children.flatMap(allImages)];
 if(!layer||!allImages(layer).length)return null;
 // Bake the image, crop, strokes, and clipping into a transparent PNG.
 // Keep the OUTER blend, opacity, visibility and layer order in the exported project.
 // They are applied at runtime, not baked twice into the image.
 const baked=D.clone(doc),bakedLayer=baked.layers.find(l=>l.id===id);
 bakedLayer.blend='normal';bakedLayer.opacity=1;bakedLayer.visible=true;
 const parsed=new DOMParser().parseFromString(P.data.svg,'image/svg+xml').documentElement;
 D.render(parsed,baked);
 const defs=parsed.querySelector('[data-map-design="defs"]'),art=parsed.querySelector('.map-design-'+kind);
 if(!defs||!art)throw Error('Could not render the '+kind+' texture layer.');
 const frame=document.createElementNS(NS,'svg');frame.setAttribute('xmlns',NS);frame.setAttribute('width','1675');frame.setAttribute('height','717');frame.setAttribute('viewBox','0 0 1675 717');frame.append(defs.cloneNode(true),art.cloneNode(true));
 for(const image of frame.querySelectorAll('image')){
  const item=allImages(layer).find(i=>i.id===image.closest('[data-design-item]')?.getAttribute('data-design-item'));
  if(item)image.setAttribute('href',item.src);
 }
 frame.querySelector('.map-design-'+kind)?.removeAttribute('class');
 const svgBlob=new Blob([new XMLSerializer().serializeToString(frame)],{type:'image/svg+xml'}),url=URL.createObjectURL(svgBlob);
 try{
  const image=new Image();image.src=url;await image.decode();
  const c=document.createElement('canvas');c.width=1675;c.height=717;
  const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas unavailable.');ctx.drawImage(image,0,0);
  const png=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG rendering failed.')),'image/png'));
  return new Uint8Array(await png.arrayBuffer());
 }finally{URL.revokeObjectURL(url);}
}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),12000);}
async function download(){if(gesture){message('Finish the current stroke before exporting.',true);return;}
 try{
  if(shell?.contains(document.activeElement))document.activeElement.blur();await autosave();
  const data=D.serialize(doc),bytes=new TextEncoder().encode(data);
  if(bytes.byteLength>D.limits.projectBytes)throw Error('Project exceeds 384 MiB.');
  const base=doc.name.trim().replace(/[^\p{L}\p{N}_-]+/gu,'-').slice(0,80)||'Anatolian-atlas';
  // Each mode has its own PNG. The combined mode is NEVER generated by stacking other modes.
  const [political,physical,combined]=await Promise.all(['political','physical','combined'].map(bakedTexturePNG));
  const images={political,physical,combined};
  if(Object.values(images).some(Boolean)){
   const textures={version:2,defaultMode:'vanilla',rendering:'independent',modes:['political','physical','combined']};
   for(const kind of textures.modes){
    const l=doc.layers.find(l=>l.id===doc[kind+'LayerId']);
    textures[kind]=l?{name:l.name,visible:l.visible,opacity:l.opacity,blend:l.blend,clip:l.clip,provinceId:l.provinceId,layerId:l.id,asset:images[kind]?kind+'-map.png':null}:null;
   }
   const files=[[base+'.admap.json',bytes],['texture-settings.json',new TextEncoder().encode(JSON.stringify(textures,null,2))]];
   for(const kind of textures.modes)if(images[kind])files.push([kind+'-map.png',images[kind]]);
   saveBlob(zipArchive(files),base+'.admap.zip');
   message('Exported editable design, independent mode settings and '+Object.entries(images).filter(([,v])=>v).map(([k])=>k).join(', ')+' PNG(s). Install with the v6 export installer.');
  }else{
   saveBlob(new Blob([bytes],{type:'application/json'}),base+'.admap.json');
   message('Exported editable design JSON. No map textures were added.');
  }
  lastExported=snapshot();
 }catch(e){message('Export failed: '+e.message,true);}
}
function importDoc(value){const valid=D.validate(typeof value==='string'?JSON.parse(value):value);change(()=>{doc=valid;selectedLayer=doc.layers.at(-1).id;selectedItem=null;selectedProvince=null;},false);fit();message('Project imported. Its layers, text, images and editable strokes are intact.');}
async function importFile(file){if(!file)return;if(file.size>D.limits.projectBytes){message('Project files must be smaller than 384 MiB.',true);return;}try{importDoc(await file.text());}catch(e){message('Import failed: '+e.message,true);}}
async function importImage(file,label=null,targetId=selectedLayer){
 if(!file||!shell)return;if(gesture){message('Finish the current stroke before adding an image.',true);return;}if(!editable(targetId))return;
 if(file.size>D.limits.imageBytes||!['image/png','image/jpeg','image/webp'].includes(file.type)){message('Choose a PNG, JPEG or WebP image up to 128 MiB.',true);return;}
 const targetDoc=doc,targetShell=shell,targetLayer=allLayers().find(x=>x.layer.id===targetId)?.layer,frame={...view};
 try{const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}),image=new Image();image.src=D.registerImage(src,file);await image.decode();
  if(shell!==targetShell||doc!==targetDoc)return;if(gesture){message('Finish the current stroke, then paste the image again.',true);return;}if(!editable(targetId)||!allLayers().some(x=>x.layer===targetLayer))return;
  const ratio=Math.min(1,Math.min(1200,frame.width*.85)/image.naturalWidth,Math.min(900,frame.height*.85)/image.naturalHeight),width=Math.max(1,image.naturalWidth*ratio),height=Math.max(1,image.naturalHeight*ratio),item={...baseItem('image',{x:frame.x+frame.width/2-width/2,y:frame.y+frame.height/2-height/2}),src,name:(label||file.name||'Imported image').slice(0,120),width,height,crop:{x:0,y:0,width:1,height:1},lockAspect:true,flipX:false,flipY:false};
  change(()=>{if([doc.physicalLayerId,doc.politicalLayerId,doc.combinedLayerId].includes(targetId))targetLayer.items=targetLayer.items.filter(i=>i.type!=='image');targetLayer.items.push(item);selectedLayer=targetId;selectedItem=item.id;for(const kind of ['political','physical','combined'])if(doc[kind+'LayerId']===targetId)editorMapMode=kind;tool='move';});
 }catch(error){if(shell===targetShell)message('The selected image could not be decoded.',true);}
}
// Use the browser's paste event so copied images work without clipboard-read permission.
const OBJECT_MIME='application/x-anatolian-map-object';
function editingField(target){return !!target?.closest?.('input,textarea,select,[contenteditable="true"]');}
function copyEvent(e){
 if(!shell||editingField(e.target)||gesture||!currentObject())return;
 clipboard=D.clone(currentObject());
 if(!e.clipboardData)return;
 try{e.clipboardData.setData(OBJECT_MIME,JSON.stringify({format:'anatolian-map-editor-object',version:1,item:clipboard}));e.clipboardData.setData('text/plain',clipboard.type==='text'?clipboard.text:'Map artwork: '+clipboard.type);e.preventDefault();e.stopImmediatePropagation();message('Object copied. Paste it into any unlocked layer.');}catch(error){message('Object copied within this editor.');}
}
function pasteObject(item){
 if(!editable())return;
 try{const copy=D.clone(item);copy.id=D.id();const probe=D.create();probe.layers[0].items=[copy];D.validate(probe);change(()=>{copy.x+=12;copy.y+=12;currentLayer().items.push(copy);selectedItem=copy.id;tool='move';});}catch(error){message('Could not paste this artwork: '+error.message,true);}
}
function pasteEvent(e){
 if(!shell||editingField(e.target))return;
 const data=e.clipboardData;if(!data)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(gesture){message('Finish the current stroke before pasting.',true);return;}
 // External images must win over an older object in the editor's internal clipboard.
 const images=[...data.items].filter(i=>i.kind==='file'&&i.type.startsWith('image/'));
 const file=images.map(i=>i.getAsFile()).find(Boolean)||[...data.files].find(f=>f.type.startsWith('image/'));
 if(file){importImage(file,'Pasted map image');return;}
 const raw=data.getData(OBJECT_MIME);
 if(raw){try{if(raw.length>D.limits.projectBytes)throw Error('The copied object is too large.');const parsed=JSON.parse(raw);if(parsed.format!=='anatolian-map-editor-object'||parsed.version!==1)throw Error('Unsupported copied artwork.');pasteObject(parsed.item);}catch(error){message('Could not paste this artwork: '+error.message,true);}return;}
 if(!data.types.length&&clipboard){pasteObject(clipboard);return;}
 message('No image in the clipboard. Copy the actual map image or a screenshot, then press Ctrl+V here. You can also use Import texture / image.',true);
}
async function pasteImageButton(){
 if(gesture){message('Finish the current stroke before pasting.',true);return;}if(!editable())return;
 if(!navigator.clipboard?.read){message('Click the map and press Ctrl+V to paste an image. This browser does not support the Paste image button.',true);return;}
 const targetShell=shell,targetDoc=doc,targetId=selectedLayer;
 try{const items=await navigator.clipboard.read();if(shell!==targetShell||doc!==targetDoc)return;
  for(const item of items){const type=['image/png','image/jpeg','image/webp'].find(t=>item.types.includes(t));if(type){const blob=await item.getType(type);if(shell!==targetShell||doc!==targetDoc)return;await importImage(new File([blob],'pasted-map.'+(type==='image/jpeg'?'jpg':type.split('/')[1]),{type}),'Pasted map image',targetId);return;}}
  message('The clipboard has no PNG, JPEG or WebP image. Copy the map image itself and try Ctrl+V, or use Import texture / image.',true);
 }catch(error){if(shell===targetShell)message('Clipboard access was unavailable. Click the map and press Ctrl+V, or use Import texture / image.',true);}
}

function action(name){
 if(closing)return;
 if(gesture&&name!=='close'){message('Finish or cancel the current gesture first.',true);return;}
 switch(name){
 case 'political-layer':{
    const existing=doc.layers.find(l=>l.id===doc.politicalLayerId);
    if(existing){selectedLayer=existing.id;selectedItem=existing.items.find(i=>i.type==='image')?.id||null;tool='move';editorMapMode='political';refresh();}
    else change(()=>{const l=D.layer('Political texture · player toggle');l.clip='land';doc.layers.push(l);doc.politicalLayerId=l.id;selectedLayer=l.id;selectedItem=null;tool='move';editorMapMode='political';});
    message('Political texture layer selected. Paste or import your texture, then adjust blend, opacity and layer order.');break;
   }
  case 'combined-layer':{
    const existing=doc.layers.find(l=>l.id===doc.combinedLayerId);
    if(existing){selectedLayer=existing.id;selectedItem=existing.items.find(i=>i.type==='image')?.id||null;tool='move';editorMapMode='combined';refresh();}
    else change(()=>{const l=D.layer('Political + physical map · independent texture');l.clip='land';doc.layers.push(l);doc.combinedLayerId=l.id;selectedLayer=l.id;selectedItem=null;tool='move';editorMapMode='combined';});
    message('Combined mode has its OWN image. Paste or import your dedicated combined texture, then align it and choose its blend/opacity.');break;
   }
  case 'physical-layer':{
   const existing=doc.layers.find(l=>l.id===doc.physicalLayerId);
   if(existing){selectedLayer=existing.id;selectedItem=existing.items.find(i=>i.type==='image')?.id||null;tool='move';editorMapMode='physical';refresh();}
    else change(()=>{const l=D.layer('Physical map · player toggle');l.clip='land';doc.layers.push(l);doc.physicalLayerId=l.id;selectedLayer=l.id;selectedItem=null;tool='move';editorMapMode='physical';});
    message('Physical map is separate from electoral artwork. Paste Ctrl+V or import an image, then drag, crop, rotate, resize or use exact position fields.');break;
  }
  case 'texture-select-physical':case 'texture-select-political':case 'texture-select-combined':{
    const kind=name.slice('texture-select-'.length),layer=doc.layers.find(l=>l.id===doc[kind+'LayerId']);
    if(layer){selectedLayer=layer.id;selectedItem=layer.items.find(i=>i.type==='image')?.id||null;tool='move';editorMapMode=kind;refresh();}break;
   }
   case 'reset-all-colors':change(()=>{doc.palette={parties:{},entities:{}};});message('Party and entity colors restored to game defaults.');break;
  case 'paste-image':pasteImageButton();break;
 case 'flip-image-x':case 'flip-image-y':if(currentObject()?.type==='image'&&editable())change(()=>{const i=currentObject(),key=name==='flip-image-x'?'flipX':'flipY';i[key]=!i[key];});break;
 case 'crop-image':if(currentObject()?.type==='image'&&editable()){cropMode=!cropMode;tool='move';refresh();message(cropMode?'Drag the crop handles to trim the image. The original stays intact.':'Crop saved. Drag the blue handles to resize.');}break;
 case 'reset-crop':if(currentObject()?.type==='image'&&editable())change(()=>{currentObject().crop={x:0,y:0,width:1,height:1};});break;
 case 'reset-image-transform':if(currentObject()?.type==='image'&&editable())change(()=>{const i=currentObject();i.rotation=0;i.scale=1;i.flipX=false;i.flipY=false;});break;
 case 'fit-image':{const i=currentObject();if(i?.type==='image'&&editable())change(()=>{const f=D.imageFrame(i),ratio=Math.min(1675/f.width,717/f.height);i.width=Math.max(1,i.width*ratio);i.height=Math.max(1,i.height*ratio);const next=D.imageFrame(i);i.x=(1675-next.width)/2-next.x;i.y=(717-next.height)/2-next.y;i.scale=1;i.rotation=0;i.provinceId=null;});break;}
 case 'close':close();break;case 'undo':undo();break;case 'redo':redo();break;case 'export':download();break;case 'import':$('.me-import').click();break;case 'image':$('.me-image-import').click();break;
 case 'new':change(()=>{doc=D.create();selectedLayer=doc.layers[0].id;selectedItem=null;selectedProvince=null;});fit();break;
 case 'recover':readDraft('backup').then(backup=>{if(!shell)return;if(backup)importDoc(backup);else message('No earlier local backup exists yet.');});break;
 case 'preview':try{D.setPreview(doc);close();}catch(e){message(e.message,true);}break;
 case 'stop-preview':D.setPreview(null);message('The ordinary game map has been restored.');break;
 case 'fit':fit();break;case 'zoom-in':zoom(1.25);break;case 'zoom-out':zoom(.8);break;case 'grid':grid=!grid;paint();break;case 'neutral':neutral=!neutral;paint();break;
 case 'add-layer':change(()=>{const l=D.layer('Artwork '+(doc.layers.length+1));doc.layers.push(l);selectedLayer=l.id;selectedItem=null;});break;
 case 'delete-layer':{const l=currentLayer();if(!editable())return;change(()=>{if(l.id===doc.physicalLayerId)doc.physicalLayerId=null;if(l.id===doc.politicalLayerId)doc.politicalLayerId=null;if(l.id===doc.combinedLayerId)doc.combinedLayerId=null;const a=parentList(l.id);if(a===doc.layers&&a.length===1)throw Error('Keep at least one layer.');a.splice(a.indexOf(l),1);selectedItem=null;reconcile();});break;}
 case 'duplicate-layer':{const l=currentLayer();change(()=>{const copy=freshIds(D.clone(l));copy.name=(l.name+' copy').slice(0,100);const a=parentList(l.id);a.splice(a.indexOf(l)+1,0,copy);selectedLayer=copy.id;selectedItem=null;});break;}
 case 'layer-up':case 'layer-down':{const l=currentLayer();if(!editable())return;change(()=>{const a=parentList(l.id),at=a.indexOf(l),next=at+(name==='layer-up'?1:-1);if(next>=0&&next<a.length){a.splice(at,1);a.splice(next,0,l);}});break;}
 case 'merge':if([doc.physicalLayerId,doc.politicalLayerId,doc.combinedLayerId].some(id=>id&&[doc.layers.findIndex(l=>l.id===selectedLayer),doc.layers.findIndex(l=>l.id===selectedLayer)-1].some(n=>doc.layers[n]?.id===id))){message('Physical map layer cannot be merged with ordinary artwork.',true);break;}change(()=>{selectedLayer=D.mergeDown(doc,doc.layers.findIndex(l=>l.id===selectedLayer));selectedItem=null;});break;
 case 'ungroup':{const l=currentLayer();if(!editable())return;change(()=>{if(!l.children.length)return;if(l.opacity!==1||l.blend!=='normal'||l.clip!=='none'||l.items.length)throw Error('Ungroup requires group opacity 1, Normal blending, no clipping and no direct objects. This keeps its appearance unchanged.');const a=parentList(l.id),at=a.indexOf(l);a.splice(at,1,...l.children);selectedLayer=l.children.at(-1).id;});break;}
 case 'wash':if(editable())change(()=>{const i={...baseItem('wash',{x:0,y:0}),kind:'linear',color:'#f8e9bf',color2:'#554a31',angle:90,strength:1,opacity:.2};currentLayer().items.push(i);selectedItem=i.id;});break;
 case 'delete-object':if(currentObject()&&editable())change(()=>{const l=currentLayer();l.items=l.items.filter(i=>i.id!==selectedItem);selectedItem=null;});break;
 case 'duplicate-object':duplicateObject();break;
 case 'object-front':case 'object-back':if(currentObject()&&editable())change(()=>{const l=currentLayer(),i=currentObject();l.items.splice(l.items.indexOf(i),1);if(name==='object-front')l.items.push(i);else l.items.unshift(i);});break;
 case 'help':$('.me-help').hidden=!$('.me-help').hidden;break;
 }
}
function value(e){return e.type==='checkbox'?e.checked:e.type==='range'||e.type==='number'?Number(e.value):e.value;}
function handleChange(e){const el=e.target;if(el.hasAttribute('data-image-lock')){if(currentObject()?.type==='image'&&editable())change(()=>{currentObject().lockAspect=el.checked;});return;}if(el._meBefore){const before=el._meBefore;delete el._meBefore;remember(before);refresh();return;}if(el.matches('.me-project-name')){change(()=>{doc.name=el.value.slice(0,120);});return;}
 for(const [scope,obj] of [['brush',brush],['shape',shape],['text',text]])if(el.dataset[scope]){obj[el.dataset[scope]]=value(el);if(scope==='brush'&&el.dataset.brush==='preset')brush.hardness=brush.preset==='ink'?1:brush.preset==='soft'?.25:.8;refreshToolOptions();return;}
 if(el.dataset.paletteSection&&el.dataset.paletteKey){const section=el.dataset.paletteSection,key=el.dataset.paletteKey,palette=root.AnatolianColorPalette;
   if(!palette||!Object.prototype.hasOwnProperty.call(palette.defaults[section]||{},key))return;
   if(!/^#[0-9a-f]{6}$/i.test(el.value)){message('Enter a six-digit hex color, such as #E3000F.',true);return;}
   change(()=>{doc.palette ||= {parties:{},entities:{}};doc.palette[section][key]=el.value;});return;}
  if(el.dataset.editorMapMode){editorMapMode=el.value;refresh();return;}
  if(el.dataset.texture){
   const kind=el.closest('[data-texture-kind]')?.dataset.textureKind;
   const l=doc.layers.find(l=>l.id===doc[kind+'LayerId']);if(!l)return;
   if(l.locked){message('Unlock this texture layer before editing its appearance.',true);refreshPanels();return;}
   change(()=>{const key=el.dataset.texture;l[key]=key==='provinceId'?(el.value||null):value(el);
    if(l.clip==='province'&&!l.provinceId)l.provinceId=selectedProvince||P.data.provinces[0].id;
   });return;
  }
  if(el.dataset.setting){change(()=>{doc.settings[el.dataset.setting]=value(el);});return;}
 if(el.dataset.layer){const l=currentLayer(),entry=allLayers().find(x=>x.layer.id===l.id);if([l,...entry.ancestors].some(p=>p.locked)){message('Unlock this layer and its group before changing its properties.',true);refreshPanels();return;}change(()=>{l[el.dataset.layer]=el.dataset.layer==='provinceId'?el.value||null:value(el);if(l.clip==='province'&&!l.provinceId){if(!selectedProvince)throw Error('Pick a province with the Province anchor tool before enabling province clipping.');l.provinceId=selectedProvince;}});return;}
 if(el.dataset.object){if(!editable())return;const i=currentObject();if(!i)return;change(()=>{const key=el.dataset.object;if(i.type==='image'&&imagePropertyChange(i,key,value(el)))return;if(key==='provinceId'){const old=D.position(i),pid=el.value||null,p=byId.get(pid);i.provinceId=pid;i.x=old.x-(p?p.center[0]:0);i.y=old.y-(p?p.center[1]:0);}else if(key==='clipProvince')i.clipProvince=el.value||null;else if(key==='noFill')i.fill=el.checked?'none':shape.fill;else i[key]=value(el);});}
}
function keydown(e){if(!shell)return;if(closing){e.preventDefault();e.stopImmediatePropagation();return;}
 if(gesture&&e.key!=='Escape'){e.preventDefault();e.stopImmediatePropagation();return;}
 if(e.key==='Tab'){const nodes=[...shell.querySelectorAll('button:not(:disabled),input,select,textarea,[tabindex="0"]')].filter(n=>n.getClientRects().length&&!n.closest('[hidden]'));if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}e.stopImmediatePropagation();return;}
 const input=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName),mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(mod&&['s','o'].includes(k)){e.preventDefault();e.stopImmediatePropagation();if(k==='s')download();else $('.me-import').click();return;}
 if(input){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();e.target.blur();}return;}
 e.stopImmediatePropagation();
 if(mod&&k==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();}else if(mod&&k==='y'){e.preventDefault();redo();}
 else if(mod&&k==='c'&&currentObject()){clipboard=D.clone(currentObject());/* The native copy event writes our artwork format. */}
 else if(mod&&k==='v'){/* Allow the native paste event to supply images or copied artwork. */}
 else if(mod&&k==='d'){e.preventDefault();duplicateObject();}
 else if(e.key==='Escape'){e.preventDefault();if(gesture){const g=gesture;pointerUp({pointerId:g.pointer},true);}else if(!$('.me-help').hidden)$('.me-help').hidden=true;else if(cropMode){cropMode=false;refresh();}else if(selectedItem){selectedItem=null;refresh();}else close();}
 else if(e.key===' '){e.preventDefault();space=true;canvas.classList.add('me-space-pan');}
 else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();action('delete-object');}
 else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&currentObject()&&editable()){e.preventDefault();change(()=>{const i=currentObject(),n=e.shiftKey?10:1;if(e.key==='ArrowUp')i.y-=n;if(e.key==='ArrowDown')i.y+=n;if(e.key==='ArrowLeft')i.x-=n;if(e.key==='ArrowRight')i.x+=n;});}
 else if(k==='c'&&!mod&&currentObject()?.type==='image')action('crop-image');
 else if(k==='f')fit();else if(k==='+'||k==='=')zoom(1.25);else if(k==='-')zoom(.8);
 else if(k==='['||k===']'){brush.size=Math.max(.2,Math.min(300,brush.size+(k==='['?-2:2)));refreshToolOptions();}
 else if({v:'move',b:'brush',e:'eraser',t:'text',r:'rect',o:'ellipse',l:'line',h:'pan',p:'province',i:'eyedropper'}[k]){tool={v:'move',b:'brush',e:'eraser',t:'text',r:'rect',o:'ellipse',l:'line',h:'pan',p:'province',i:'eyedropper'}[k];refreshToolOptions();}
}
async function close(){if(!shell||closing)return;if(gesture)pointerUp({pointerId:gesture.pointer},true);closing=true;const ok=await autosave();closing=false;if(!ok&&snapshot()!==lastExported){message('Browser storage could not save your images. Export project first, then close again to protect your work.',true);return;}cancelAnimationFrame(drawFrame);drawFrame=0;shell.remove();shell=null;canvas=null;svg=null;space=false;document.body.classList.remove('map-editor-open');document.removeEventListener('keydown',keydown,true);document.removeEventListener('copy',copyEvent,true);document.removeEventListener('paste',pasteEvent,true);priorFocus?.focus();D.setPreview(D.getPreview());}
async function open(source){if(opening)return;
 if(shell){$('[data-action="close"]').focus();return;}sourceSvg=source||document.querySelector('#province-election-overlay .province-map-canvas svg')||document.querySelector('.province-map-canvas svg');if(!sourceSvg)return;
 priorFocus=document.activeElement;if(!doc){opening=true;try{doc=await readDraft()||D.create();selectedLayer=doc.layers.at(-1).id;saved=snapshot();}finally{opening=false;}}if(!sourceSvg.isConnected)return;cropMode=false;
 shell=document.createElement('div');shell.className='map-editor-backdrop';shell.id='map-design-editor';shell.innerHTML=markup();document.body.append(shell);document.body.classList.add('map-editor-open');canvas=$('.me-canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Map editing canvas');svg=sourceSvg.cloneNode(true);svg.querySelectorAll('[data-map-design],.me-selection').forEach(n=>n.remove());svg.querySelector('.atlas-selection')?.replaceChildren();for(const p of svg.querySelectorAll('[data-province]')){p.classList.remove('atlas-selected');p.removeAttribute('tabindex');p.removeAttribute('role');p.removeAttribute('aria-pressed');}svg.removeAttribute('data-atlas');svg.setAttribute('role','img');svg.setAttribute('aria-label','Editable map artwork');svg.style.touchAction='none';canvas.append(svg);view={...D.extent};selectedItem=null;
 shell.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.paletteReset){const section=b.dataset.paletteSection,key=b.dataset.paletteReset,entries=root.AnatolianColorPalette?.defaults?.[section];if(entries&&Object.prototype.hasOwnProperty.call(entries,key))change(()=>{delete doc.palette[section][key];});}else if(b.dataset.imageCommand)action(b.dataset.imageCommand);else if(b.dataset.action)action(b.dataset.action);else if(b.dataset.tool){tool=b.dataset.tool;refreshToolOptions();}else if(b.dataset.layer){selectedLayer=b.dataset.layer;selectedItem=null;for(const kind of ['political','physical','combined'])if(doc[kind+'LayerId']===selectedLayer)editorMapMode=kind;refresh();}else if(b.dataset.visibility||b.dataset.lock){const id=b.dataset.visibility||b.dataset.lock,l=allLayers().find(x=>x.layer.id===id).layer;change(()=>{if(b.dataset.visibility)l.visible=!l.visible;else l.locked=!l.locked;});}else if(b.dataset.item){selectedItem=b.dataset.item;refresh();}});
 shell.addEventListener('change',handleChange);shell.addEventListener('input',e=>{const el=e.target;if(el.type!=='range')return;const target=el.dataset.texture?doc.layers.find(l=>l.id===doc[el.closest('[data-texture-kind]')?.dataset.textureKind+'LayerId']):el.dataset.setting?doc.settings:el.dataset.object?currentObject():el.dataset.layer?currentLayer():null,key=el.dataset.texture||el.dataset.setting||el.dataset.object||el.dataset.layer;if(!target)return;if(el.dataset.object&&!editable())return;if(el.dataset.layer&&allLayers().find(x=>x.layer.id===selectedLayer).ancestors.concat(currentLayer()).some(l=>l.locked))return;const before=snapshot();if(!el._meBefore)el._meBefore=before;target[key]=Number(el.value);schedulePaint();});$('.me-import').onchange=e=>{importFile(e.target.files[0]);e.target.value='';};$('.me-image-import').onchange=e=>{importImage(e.target.files[0]);e.target.value='';};
 svg.addEventListener('pointerdown',pointerDown);svg.addEventListener('pointermove',pointerMove);svg.addEventListener('pointerleave',()=>svg.querySelector('.me-brush-cursor')?.remove());svg.addEventListener('pointerup',e=>pointerUp(e));svg.addEventListener('pointercancel',e=>pointerUp(e,true));svg.addEventListener('wheel',e=>{e.preventDefault();if(!gesture)zoom(Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*.002),world(e));},{passive:false});svg.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('keydown',keydown,true);document.addEventListener('copy',copyEvent,true);document.addEventListener('paste',pasteEvent,true);refresh();message('Each map mode has its own independent texture, including combined mode. Blend, opacity and clipping are exported for the final game.');$('[data-action="close"]').focus();
}
function markup(){return `<section class="me-window" role="dialog" aria-modal="true" aria-labelledby="me-title"><header class="me-header"><strong id="me-title">Map Design Studio <small>temporary admin tools</small></strong><input class="me-project-name" aria-label="Project name" maxlength="120"><button data-action="undo" title="Ctrl+Z">Undo</button><button data-action="redo" title="Ctrl+Shift+Z">Redo</button><button data-action="import">Import project</button><button data-action="export" class="me-primary" title="Ctrl+S">Export design + map textures</button><button data-action="preview">Preview in game</button><button data-action="help">Help</button><button data-action="close" aria-label="Close map editor">×</button></header><div class="me-workspace"><aside class="me-left"><section><h3>Tools <span class="me-tool-name"></span></h3><div class="me-tools">${[['move','Move / select (V)'],['pan','Hand / pan (H)'],['brush','Brush (B)'],['eraser','Eraser (E)'],['text','Text (T)'],['rect','Rectangle (R)'],['ellipse','Ellipse (O)'],['line','Line (L)'],['province','Province anchor (P)'],['eyedropper','Eyedropper (I)']].map(([k,n])=>`<button data-tool="${k}">${n}</button>`).join('')}</div><div class="me-tool-options me-fields"></div><p class="me-anchor">Province: <strong class="me-province-name"></strong></p><button data-action="wash">Add gradient / color / grain wash</button><button data-action="paste-image">Paste image (Ctrl+V)</button><div class="me-physical-tools"><h3>Map texture layers</h3><button data-action="combined-layer" class="me-primary">Create political + physical map layer</button><p class="me-muted">This is a THIRD, separate texture. Import your unique combined image here; the game will not mix the political and physical images.</p><button data-action="political-layer" class="me-primary">Create political map layer</button><p class="me-muted">Political texture: pasted image overlay on the existing party-color map.</p><h3>Custom physical map</h3><button data-action="physical-layer" class="me-primary">Create physical map layer</button><p class="me-physical-state me-muted"></p><p class="me-muted">Select this separate layer before pasting a physical map. Use Move/select, image handles, crop, opacity and exact X/Y values to align it. Other layers stay on the electoral map.</p></div><div class="me-texture-mode"><label>Studio texture preview<select data-editor-map-mode><option value="combined">Political and Physical Map (own texture)</option><option value="political">Political Map</option><option value="physical">Physical Map</option><option value="vanilla">Vanilla (no textures)</option></select></label></div><div class="me-texture-settings"></div><button data-action="image">Import texture / image</button><p class="me-muted">Create/select a layer, paste a copied map image, then choose Overlay or Multiply in its blend mode.</p></section><details><summary>Base map styling</summary><div class="me-map-settings me-fields"></div></details><details class="me-palette-section"><summary>Universal party &amp; entity colors</summary><p class="me-muted">Changes to these colors apply to every province, election map, seat diagram and palette-backed game label. Editing colors does not affect votes or party identity. Similar historical names share their party's color.</p><button type="button" data-action="reset-all-colors">Reset all colors</button><h3>Political parties</h3><div class="me-palette-parties"></div><h3>Organizations and entities</h3><div class="me-palette-entities"></div></details><details><summary>Project &amp; view</summary><button data-action="new">New project (undoable)</button><button data-action="recover">Recover previous autosave</button><button data-action="stop-preview">Stop game preview</button><button data-action="neutral">Toggle neutral land preview</button><p class="me-muted">Neutral preview is a workspace aid; it is not exported. Party colors remain dynamic in the game.</p></details></aside><main class="me-center"><div class="me-viewbar"><button data-action="zoom-out">−</button><span class="me-zoom-label">100%</span><button data-action="zoom-in">+</button><button data-action="fit">Fit map (F)</button><button data-action="grid">Grid</button><span>Wheel: zoom · Space + drag: pan · Shift: square / circle</span></div><div class="me-image-toolbar" hidden><strong>Image</strong><button type="button" data-image-command="crop-image" class="me-image-mode">Crop (C)</button><button type="button" data-image-command="reset-crop">Reset crop</button><button type="button" data-image-command="fit-image">Fit to map</button><button type="button" data-image-command="flip-image-x">Flip ↔</button><button type="button" data-image-command="flip-image-y">Flip ↕</button><label><input type="checkbox" data-image-lock checked> Lock proportions</label><span>Drag edges/corners to resize · Round handle rotates</span></div><div class="me-canvas-wrap"><div class="me-canvas province-map-canvas"></div></div><div class="me-help" hidden><h3>Make your map, keep it editable</h3><p>1. Add a layer, choose its blend mode and opacity. Clip it to land, water or a province.</p><p>2. Pick a province with P. Paint with B, erase the current layer with E, or click with T to attach text to the province. Switch to V to move objects and edit their properties.</p><p>3. Add gradients, grain washes, shapes or embedded texture images. Drag layer order with the Up/Down buttons. Merge preserves sublayers so the look and editability survive.</p><p>4. Preview in game checks your artwork against live election colors. Reopen the editor to continue. Export the .admap.json project and send that file back for permanent integration.</p><p>Shortcuts: Ctrl+S export; Ctrl+O import; Ctrl+Z undo; Ctrl+Shift+Z redo; Ctrl+V pastes copied images or editor objects; Ctrl+C/D copy/duplicate object; Delete removes selected object; arrow keys nudge (Shift = 10 units); [ ] brush size; F fit; +/- zoom. Escape deselects, cancels a gesture or closes.</p><p>The eraser removes earlier artwork on its current layer only. Later strokes remain editable. Custom text is positioned in map units and remains visible without automatic collision hiding; you control its placement. Browser autosave is local to this browser and address; exported projects are your portable backups.</p><button data-action="help">Close help</button></div></main><aside class="me-right"><section><h3>Layers <small>top = front</small></h3><div class="me-layer-actions"><button data-action="add-layer">+ Layer</button><button data-action="duplicate-layer">Duplicate</button><button data-action="delete-layer">Delete</button><button data-action="layer-up">↑ Up</button><button data-action="layer-down">↓ Down</button><button data-action="merge">Merge down</button><button data-action="ungroup">Ungroup</button></div><div class="me-layer-list"></div><div class="me-layer-properties me-fields"></div></section><section><h3>Objects on this layer</h3><div class="me-objects"></div><div class="me-object-actions"><button data-action="duplicate-object">Duplicate</button><button data-action="delete-object">Delete</button><button data-action="object-front">Bring front</button><button data-action="object-back">Send back</button></div><div class="me-object-properties me-fields"></div></section></aside></div><footer class="me-status" role="status" aria-live="polite"></footer><input type="file" class="me-import" accept=".json,.admap.json,application/json" hidden><input type="file" class="me-image-import" accept="image/png,image/jpeg,image/webp" hidden></section>`;}
function mount(canvas){const controls=canvas.previousElementSibling;if(!controls?.classList.contains('atlas-controls')||controls.querySelector('[data-map-editor]'))return;const button=document.createElement('button');button.type='button';button.dataset.mapEditor='open';button.textContent='Admin: edit map';button.onclick=()=>open(canvas.querySelector('svg'));controls.append(button);const stop=document.createElement('button');stop.type='button';stop.dataset.mapEditor='stop';stop.textContent='Stop design preview';stop.hidden=!D.hasPreview();stop.onclick=()=>D.setPreview(null);controls.append(stop);}
document.addEventListener('map-design-preview',()=>{for(const b of document.querySelectorAll('[data-map-editor="stop"]'))b.hidden=!D.hasPreview();});
document.addEventListener('keyup',e=>{if(e.key===' '){space=false;canvas?.classList.remove('me-space-pan');}});root.addEventListener('blur',()=>{space=false;});
root.addEventListener('beforeunload',e=>{if(shell&&doc&&snapshot()!==saved&&snapshot()!==lastExported){autosave();if(snapshot()!==saved){e.preventDefault();e.returnValue='';}}});
root.AnatolianMapEditor={open,close,mount,flushDraft:()=>autosave(),getDocument:()=>doc?D.clone(doc):null,importDocument:importDoc,exportDocument:()=>D.serialize(doc)};
})(globalThis);
