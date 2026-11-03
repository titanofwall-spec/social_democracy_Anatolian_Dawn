/* Portable, data-only map artwork. This reader can remain when the temporary editor is removed. */
(function(root){
'use strict';
const P=root.AnatolianProvinces||(typeof require==='function'?require('./provinces.js'):null);
if(!P)return;
const NS='http://www.w3.org/2000/svg',FORMAT='anatolian-dawn-map-design',VERSION=1;
const extent={x:-85,y:-75,width:1845,height:865};
const limits={imageBytes:128*1024*1024,imageDataURL:Math.ceil(128*1024*1024/3)*4+128,embeddedData:320*1024*1024,projectBytes:384*1024*1024};
const blends=['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
const fonts=['Georgia','Times New Roman','Arial','Verdana','Courier New'];
const defaults={sea:'#dce6e7',border:'#646963',borderWidth:.8,coast:'#526366',coastWidth:2.1,grain:.055,ink:1,shadow:true,labels:true,cityColor:'#252b28',seaLabelColor:'#5f797e',labelHalo:'#f6f3e8',labelFont:'Georgia'};
const byId=new Map(P.data.provinces.map(p=>[p.id,p]));
const validatedImageSources=new Set();
function hash(s){let n=2166136261;for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619);}return 'fnv1a:'+((n>>>0).toString(16).padStart(8,'0'));}
const geometryHash=hash(P.data.svg);
function clone(o){return Array.isArray(o)?o.map(clone):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,clone(v)])):o;}
function id(){return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,9);}
function layer(name='New layer'){return {id:id(),name,visible:true,locked:false,opacity:1,blend:'normal',clip:'none',provinceId:null,items:[],children:[]};}
function create(){return {format:FORMAT,version:VERSION,geometryHash,name:'My Anatolian atlas',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),extent:{...extent},settings:{...defaults},physicalLayerId:null,palette:{parties:{},entities:{}},layers:[layer('Artwork 1')]};}
function fail(message){throw new Error('Map project: '+message);}
function str(v,max,label){if(typeof v!=='string'||v.length>max)fail(label+' must be text of at most '+max+' characters.');return v;}
function number(v,min,max,label){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(label+' must be between '+min+' and '+max+'.');return v;}
function option(v,choices,label){if(!choices.includes(v))fail('Unsupported '+label+'.');return v;}
function color(v,label,none=false){if(none&&v==='none')return v;if(typeof v!=='string'||!/^#[\da-f]{6}$/i.test(v))fail(label+' must be a six-digit color.');return v;}
function bool(v,label){if(typeof v!=='boolean')fail(label+' must be on or off.');return v;}
function province(v){if(v===null||v===undefined)return null;if(!byId.has(v))fail('Unknown province '+String(v).slice(0,60)+'.');return v;}
function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Expected a project object.');
 if(input.format!==FORMAT||input.version!==VERSION)fail('Unsupported format or version. Use an .admap.json project exported by this editor.');
 if(input.geometryHash!==geometryHash)fail('This project belongs to a different provincial map. Its geometry must match before importing.');
 const out={format:FORMAT,version:VERSION,geometryHash,name:str(input.name,120,'Project name'),createdAt:str(input.createdAt,50,'Creation date'),updatedAt:str(input.updatedAt,50,'Update date'),extent:{...extent},settings:{},physicalLayerId:null,palette:{parties:{},entities:{}},layers:[]};
 if(!input.extent||Object.keys(extent).some(k=>input.extent[k]!==extent[k]))fail('The map coordinate system does not match.');
 const s=input.settings;if(!s||typeof s!=='object')fail('Missing map settings.');
 for(const k of ['sea','border','coast','cityColor','seaLabelColor','labelHalo'])out.settings[k]=color(s[k],k);
 for(const [k,min,max] of [['borderWidth',0,6],['coastWidth',0,10],['grain',0,.3],['ink',0,3]])out.settings[k]=number(s[k],min,max,k);
 for(const k of ['shadow','labels'])out.settings[k]=bool(s[k],k);
 out.settings.labelFont=option(s.labelFont,fonts,'label font');
 const ids=new Set();let itemCount=0,pointCount=0,layerCount=0,imageBytes=0;
 function unique(v){str(v,80,'Object ID');if(!/^[a-zA-Z0-9_-]+$/.test(v)||ids.has(v))fail('Object IDs must be unique.');ids.add(v);return v;}
 function item(i){
  if(!i||typeof i!=='object')fail('Invalid artwork item.');if(++itemCount>5000)fail('A project can contain at most 5,000 objects.');
  const o={id:unique(i.id),type:option(i.type,['brush','eraser','rect','ellipse','line','text','wash','image'],'object type'),x:number(i.x,-10000,10000,'X position'),y:number(i.y,-10000,10000,'Y position'),rotation:number(i.rotation,-360,360,'Rotation'),scale:number(i.scale,.05,20,'Scale'),opacity:number(i.opacity,0,1,'Object opacity'),provinceId:province(i.provinceId),clipProvince:province(i.clipProvince)};
  if(o.type==='brush'||o.type==='eraser'){
   o.color=color(i.color,'Brush color');o.size=number(i.size,.2,300,'Brush size');o.hardness=number(i.hardness,0,1,'Brush hardness');o.brush=option(i.brush,['ink','soft','stipple'],'brush preset');
   if(!Array.isArray(i.points)||!i.points.length||i.points.length>6000)fail('Invalid stroke points.');pointCount+=i.points.length;if(pointCount>150000)fail('The project contains too many stroke points.');
   o.points=i.points.map(p=>{if(!Array.isArray(p)||p.length!==3)fail('Invalid stroke point.');return [number(p[0],-10000,10000,'Stroke X'),number(p[1],-10000,10000,'Stroke Y'),number(p[2],.05,1,'Stroke pressure')];});o.pressure=bool(i.pressure,'Pen pressure');
  }else if(['rect','ellipse','line'].includes(o.type)){
   o.width=number(i.width,-5000,5000,'Object width');o.height=number(i.height,-5000,5000,'Object height');o.fill=color(i.fill,'Shape fill',true);o.stroke=color(i.stroke,'Shape outline',true);o.strokeWidth=number(i.strokeWidth,0,40,'Outline width');o.dash=bool(i.dash,'Dashed outline');
  }else if(o.type==='text'){
   o.text=str(i.text,4000,'Label text');o.font=option(i.font,fonts,'text font');o.size=number(i.size,4,160,'Text size');o.color=color(i.color,'Text color');o.halo=color(i.halo,'Text halo');o.haloWidth=number(i.haloWidth,0,12,'Text halo width');o.bold=bool(i.bold,'Bold');o.italic=bool(i.italic,'Italic');o.align=option(i.align,['start','middle','end'],'text alignment');o.spacing=number(i.spacing,-5,20,'Letter spacing');o.leading=number(i.leading,.7,3,'Line spacing');o.leader=bool(i.leader,'Province leader');
  }else if(o.type==='wash'){
   o.color=color(i.color,'Wash color');o.color2=color(i.color2,'Wash end color');o.kind=option(i.kind,['solid','linear','radial','grain'],'wash type');o.angle=number(i.angle,0,360,'Gradient angle');o.strength=number(i.strength,0,1,'Wash end opacity');
  }else if(o.type==='image'){
   o.width=number(i.width,1,50000,'Image width');o.height=number(i.height,1,50000,'Image height');o.name=str(i.name,120,'Image name');o.src=str(i.src,limits.imageDataURL,'Embedded image');
   if(!validatedImageSources.has(o.src)){if(!/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/.test(o.src))fail('Images must be embedded PNG, JPEG or WebP data.');validatedImageSources.add(o.src);}imageBytes+=o.src.length;if(imageBytes>limits.embeddedData)fail('Embedded image data exceeds 320 MiB.');
   if(i.crop!==undefined){if(!i.crop||typeof i.crop!=='object')fail('Invalid image crop.');o.crop={x:number(i.crop.x,0,1,'Crop left'),y:number(i.crop.y,0,1,'Crop top'),width:number(i.crop.width,.00001,1,'Crop width'),height:number(i.crop.height,.00001,1,'Crop height')};if(o.crop.x+o.crop.width>1.000000001||o.crop.y+o.crop.height>1.000000001)fail('The crop must stay inside the original image.');}
   for(const key of ['lockAspect','flipX','flipY'])if(i[key]!==undefined)o[key]=bool(i[key],key);
  }return o;
 }
 function layers(a,depth){
  if(!Array.isArray(a)||depth>6)fail('Layers can be nested at most six levels.');return a.map(l=>{
   if(!l||typeof l!=='object'||++layerCount>64)fail('A project can contain at most 64 layers.');
   if(!Array.isArray(l.items))fail('Missing layer objects.');
   return {id:unique(l.id),name:str(l.name,100,'Layer name'),visible:bool(l.visible,'Layer visibility'),locked:bool(l.locked,'Layer lock'),opacity:number(l.opacity,0,1,'Layer opacity'),blend:option(l.blend,blends,'blend mode'),clip:option(l.clip,['none','land','sea','province'],'layer clipping'),provinceId:province(l.provinceId),items:l.items.map(item),children:layers(l.children,depth+1)};
  });
 }
 // Sparse, independently editable global palette; older projects omit it.
  const sourcePalette=input.palette||{parties:{},entities:{}};
  if(!sourcePalette||typeof sourcePalette!=='object'||Array.isArray(sourcePalette))fail('Invalid universal color palette.');
  for(const section of ['parties','entities']){
   const entries=sourcePalette[section]||{};
   if(!entries||typeof entries!=='object'||Array.isArray(entries)||Object.keys(entries).length>120)fail('Invalid '+section+' palette.');
   for(const [key,value] of Object.entries(entries)){
    if(key.length>100||!key||['__proto__','constructor','prototype'].includes(key))fail('Invalid palette entry.');
    if(section==='parties'&&!Object.prototype.hasOwnProperty.call(P.colors,key))fail('Unknown party color '+key);
    if(section==='entities'&&root.AnatolianColorPalette&&!Object.prototype.hasOwnProperty.call(root.AnatolianColorPalette.defaults.entities,key))fail('Unknown entity color '+key);
    out.palette[section][key]=color(value,'Palette color '+key);
   }
  }
  out.layers=layers(input.layers,0);if(!out.layers.length)fail('Keep at least one artwork layer.');
  out.physicalLayerId=input.physicalLayerId||null;
  if(out.physicalLayerId&&!out.layers.some(l=>l.id===out.physicalLayerId))fail('Physical map must reference an existing top-level layer.');
  return out;
}
function serialize(doc){return JSON.stringify(validate(doc),null,2);}
function mergeDown(doc,index){
 if(index<=0||index>=doc.layers.length)fail('Choose a layer with another layer below it.');
 const below=doc.layers[index-1],above=doc.layers[index];if(below.locked||above.locked)fail('Unlock both layers before merging.');
 const merged=layer(below.name+' + '+above.name);merged.children=[below,above];doc.layers.splice(index-1,2,merged);return merged.id;
}
function node(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))if(v!==null&&v!==undefined)e.setAttribute(k,v);if(tag==='path')e.style.stroke=attrs.stroke||'none';if(attrs['stroke-width']!==undefined)e.style.strokeWidth=attrs['stroke-width'];return e;}
function position(i){const p=byId.get(i.provinceId);return p?{x:p.center[0]+i.x,y:p.center[1]+i.y}:{x:i.x,y:i.y};}
function imageFrame(i){const c=i.crop||{x:0,y:0,width:1,height:1};return {x:c.x*i.width,y:c.y*i.height,width:c.width*i.width,height:c.height*i.height};}
const imageCache=new Map();
function registerImage(src,blob){if(!imageCache.has(src))imageCache.set(src,{url:URL.createObjectURL(blob),bytes:blob.size});return imageCache.get(src).url;}
function imageSource(src){
 if(imageCache.has(src))return imageCache.get(src).url;
 try{const comma=src.indexOf(','),mime=src.slice(5,src.indexOf(';')),parts=[];for(let offset=comma+1;offset<src.length;offset+=1048576){const decoded=atob(src.slice(offset,offset+1048576)),bytes=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);parts.push(bytes);}return registerImage(src,new Blob(parts,{type:mime}));}catch(error){return src;}
}
function pruneImageCache(sources){for(const [src,item] of imageCache)if(!sources.has(src)&&!document.querySelector('image[href="'+item.url+'"]')){URL.revokeObjectURL(item.url);imageCache.delete(src);validatedImageSources.delete(src);}}
function updateImage(svg,i){const pos=position(i),g=svg.querySelector('[data-image-transform="'+i.id+'"]');if(!g)return;g.setAttribute('transform',`translate(${pos.x} ${pos.y}) rotate(${i.rotation}) scale(${i.scale})`);g.setAttribute('opacity',i.opacity);const image=g.querySelector('image');image.setAttribute('width',i.width);image.setAttribute('height',i.height);const rect=svg.querySelector('[data-image-crop="'+i.id+'"]');if(rect)for(const [k,v] of Object.entries(imageFrame(i)))rect.setAttribute(k,v);g.querySelector('[data-image-flip]').setAttribute('transform',`translate(${i.flipX?i.width:0} ${i.flipY?i.height:0}) scale(${i.flipX?-1:1} ${i.flipY?-1:1})`);}
function strokePath(points){if(points.length===1)return `M${points[0][0]} ${points[0][1]}l.01 0`;let d=`M${points[0][0]} ${points[0][1]}`;for(let n=1;n<points.length-1;n++)d+=`Q${points[n][0]} ${points[n][1]} ${(points[n][0]+points[n+1][0])/2} ${(points[n][1]+points[n+1][1])/2}`;return d+`L${points.at(-1)[0]} ${points.at(-1)[1]}`;}
let serial=0;
function render(svg,doc){
 svg.querySelectorAll('[data-map-design]').forEach(n=>n.remove());if(!doc)return;
 const uid='design-'+(++serial),defs=node('defs',{'data-map-design':'defs'}),art=node('g',{'data-map-design':'art',class:'map-design-art','pointer-events':'none'});svg.prepend(defs);
 const basePaths=[...svg.querySelectorAll('[data-province]')],water=[...svg.querySelectorAll('.turkey-water')];let count=0;
 function fresh(){return uid+'-'+(++count);}
 function mask(kind,provinceId){const id=fresh(),m=node('mask',{id,maskUnits:'userSpaceOnUse',x:extent.x,y:extent.y,width:extent.width,height:extent.height,'mask-type':'luminance'});m.append(node('rect',{...extent,fill:kind==='sea'?'white':'black'}));for(const path of basePaths)if(kind!=='province'||path.dataset.province===provinceId)m.append(node('path',{d:path.getAttribute('d'),fill:kind==='sea'?'black':'white'}));for(const w of water)m.append(node('path',{d:w.getAttribute('d'),fill:kind==='sea'?'white':'black'}));defs.append(m);return 'url(#'+id+')';}
 const masks=new Map();function clipping(kind,pid){const key=kind+':'+pid;if(!masks.has(key))masks.set(key,mask(kind,pid));return masks.get(key);}
 function pattern(color,opacity=1){const id=fresh(),p=node('pattern',{id,width:13,height:13,patternUnits:'userSpaceOnUse'});for(const [x,y,r] of [[1,2,.55],[7,5,.9],[11,11,.55],[3,10,.7],[10,1,.4]])p.append(node('circle',{cx:x,cy:y,r,fill:color,opacity}));defs.append(p);return 'url(#'+id+')';}
 function drawItem(i,erase=false){
  const pos=position(i),g=node('g',{'data-design-item':i.id,transform:`translate(${pos.x} ${pos.y}) rotate(${i.rotation}) scale(${i.scale})`,opacity:i.opacity});
  if(i.type==='brush'||i.type==='eraser'){
   const color=i.brush==='stipple'?pattern(erase?'black':i.color):erase?'black':i.color,attrs={fill:'none',stroke:color,'stroke-width':i.size,'stroke-linecap':'round','stroke-linejoin':'round'};
   if(i.pressure&&i.points.length>1){for(let n=1;n<i.points.length;n++){const a=i.points[n-1],b=i.points[n];g.append(node('path',{...attrs,d:`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`,'stroke-width':i.size*(.25+.75*(a[2]+b[2])/2)}));}}
   else g.append(node('path',{...attrs,d:strokePath(i.points)}));
   if(i.hardness<1){const id=fresh(),xs=i.points.map(p=>p[0]),ys=i.points.map(p=>p[1]),pad=i.size*2,filter=node('filter',{id,filterUnits:'userSpaceOnUse',x:Math.min(...xs)-pad,y:Math.min(...ys)-pad,width:Math.max(...xs)-Math.min(...xs)+pad*2,height:Math.max(...ys)-Math.min(...ys)+pad*2});filter.append(node('feGaussianBlur',{stdDeviation:i.size*(1-i.hardness)/5}));defs.append(filter);g.setAttribute('filter','url(#'+id+')');}
  }else if(['rect','ellipse','line'].includes(i.type)){
   const attrs={fill:i.type==='line'?'none':i.fill,stroke:i.stroke,'stroke-width':i.strokeWidth,'stroke-dasharray':i.dash?'8 5':null};g.append(i.type==='rect'?node('rect',{x:Math.min(0,i.width),y:Math.min(0,i.height),width:Math.abs(i.width),height:Math.abs(i.height),...attrs}):i.type==='ellipse'?node('ellipse',{cx:i.width/2,cy:i.height/2,rx:Math.abs(i.width)/2,ry:Math.abs(i.height)/2,...attrs}):node('line',{x1:0,y1:0,x2:i.width,y2:i.height,...attrs}));
  }else if(i.type==='text'){
   const t=node('text',{'font-family':i.font,'font-size':i.size,fill:i.color,stroke:i.halo,'stroke-width':i.haloWidth,'paint-order':'stroke fill','stroke-linejoin':'round','font-weight':i.bold?'bold':'normal','font-style':i.italic?'italic':'normal','text-anchor':i.align,'letter-spacing':i.spacing});i.text.split('\n').forEach((line,n)=>{const span=node('tspan',{x:0,dy:n?i.size*i.leading:0});span.textContent=line;t.append(span);});g.append(t);
  }else if(i.type==='wash'){
   let fill=i.color;if(i.kind==='grain')fill=pattern(i.color,i.strength);else if(i.kind!=='solid'){
    const id=fresh(),grad=node(i.kind==='radial'?'radialGradient':'linearGradient',{id,...(i.kind==='radial'?{cx:'.5',cy:'.5',r:'.7'}:{x1:0,y1:0,x2:1,y2:0,gradientTransform:`rotate(${i.angle} .5 .5)`})});grad.append(node('stop',{offset:0,'stop-color':i.color}),node('stop',{offset:1,'stop-color':i.color2,'stop-opacity':i.strength}));defs.append(grad);fill='url(#'+id+')';
   }g.append(node('rect',{...extent,fill}));
  }else if(i.type==='image'){
   const f=imageFrame(i),id=fresh(),clip=node('clipPath',{id,clipPathUnits:'userSpaceOnUse'});clip.append(node('rect',{...f,'data-image-crop':i.id}));defs.append(clip);g.setAttribute('data-image-transform',i.id);
   const cropped=node('g',{'clip-path':'url(#'+id+')'}),content=node('g',{'data-image-flip':i.id,transform:`translate(${i.flipX?i.width:0} ${i.flipY?i.height:0}) scale(${i.flipX?-1:1} ${i.flipY?-1:1})`});content.append(node('image',{href:imageSource(i.src),width:i.width,height:i.height,preserveAspectRatio:'none'}));cropped.append(content);g.append(cropped);
  }
  if(i.clipProvince){const outer=node('g',{mask:clipping('province',i.clipProvince),'data-design-item':i.id});g.removeAttribute('data-design-item');outer.append(g);return outer;}return g;
 }
 function drawLayer(l){
  const g=node('g',{'data-design-layer':l.id,opacity:l.opacity,display:l.visible?null:'none',style:'mix-blend-mode:'+l.blend});if(l.clip!=='none')g.setAttribute('mask',clipping(l.clip,l.provinceId));
  let content=node('g');for(const child of l.children)content.append(drawLayer(child));
  for(const i of l.items){if(i.type==='eraser'){
    const id=fresh(),m=node('mask',{id,maskUnits:'userSpaceOnUse',x:extent.x,y:extent.y,width:extent.width,height:extent.height,'mask-type':'luminance'});m.append(node('rect',{...extent,fill:'white'}),drawItem(i,true));defs.append(m);const wrapper=node('g',{mask:'url(#'+id+')'});wrapper.append(content);content=node('g');content.append(wrapper);
   }else{if(i.type==='text'&&i.provinceId&&i.leader){const p=byId.get(i.provinceId),pos=position(i);content.append(node('line',{x1:p.center[0],y1:p.center[1],x2:pos.x,y2:pos.y,stroke:i.color,'stroke-width':.8,opacity:i.opacity,'pointer-events':'none'}));}content.append(drawItem(i));}}
  g.append(content);return g;
 }
 for(const l of doc.layers)if(l.id!==doc.physicalLayerId)art.append(drawLayer(l));
  const physicalLayer=doc.layers.find(l=>l.id===doc.physicalLayerId);
  const physicalAsset=doc===installed&&!preview&&root.AnatolianPhysicalMapAsset;
  let physical=null;
  if(physicalLayer||physicalAsset){
   physical=node('g',{'data-map-design':'physical',class:'map-design-physical','pointer-events':'none',mask:clipping('land')});
   if(physicalLayer)physical.append(drawLayer(physicalLayer));
   if(physicalAsset)physical.append(node('image',{href:physicalAsset,x:0,y:0,width:1675,height:717,preserveAspectRatio:'none'}));
   const edges=node('g',{class:'map-physical-borders'});
   for(const path of basePaths)edges.append(node('path',{d:path.getAttribute('d'),fill:'none',stroke:'#646963','stroke-width':'.8'}));
   physical.append(edges);
  }
 const viewport=svg.querySelector('.atlas-geography')||svg,selection=viewport.querySelector('.atlas-selection');if(selection){viewport.insertBefore(art,selection);if(physical)viewport.insertBefore(physical,art);}else{if(physical)viewport.append(physical);viewport.append(art);}
}
const mounts=new Set();let preview=null,installed=null;
function hasPhysical(doc){return !!doc&&(!!(doc.physicalLayerId&&doc.layers.find(l=>l.id===doc.physicalLayerId)?.items.some(i=>i.type==='image'))||(doc===installed&&!!root.AnatolianPhysicalMapAsset));}
function updatePhysicalControl(canvas){
 const c=canvas.previousElementSibling?.querySelector('[data-atlas="physical"]');if(!c)return;
 const available=hasPhysical(preview||installed);c.disabled=!available;c.title=available?'Show the author-designed physical map.':'No physical map has been installed or previewed yet.';
 if(!available){c.checked=false;canvas.classList.remove('atlas-physical-enabled');}
}
function installedDesign(doc){installed=doc?validate(doc):null;for(const m of mounts){if(!m.svg.isConnected)mounts.delete(m);else{styleMap(m.svg,m.canvas,preview||installed);updatePhysicalControl(m.canvas);}}}
function styleMap(svg,canvas,doc){
  root.AnatolianColorPalette?.apply(doc?.palette||null);
 const s=doc?.settings,vars={'--map-sea':'sea','--map-border':'border','--map-border-width':'borderWidth','--map-coast':'coast','--map-coast-width':'coastWidth','--map-city-color':'cityColor','--map-sea-label-color':'seaLabelColor','--map-label-halo':'labelHalo','--map-label-font':'labelFont','--map-ink-opacity':'ink'};
 for(const [key,name] of Object.entries(vars)){if(s)canvas.style.setProperty(key,String(s[name]));else canvas.style.removeProperty(key);}
 canvas.classList.toggle('map-design-no-labels',!!s&&!s.labels);canvas.classList.toggle('map-design-no-shadow',!!s&&!s.shadow);
 if(s)canvas.style.backgroundImage=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23737870' opacity='${s.grain}' filter='url(%23p)' d='M0 0h120v120H0z'/%3E%3C/svg%3E")`;else canvas.style.removeProperty('background-image');
 render(svg,doc);root.AnatolianColorPalette?.refresh(canvas);
}
function attach(svg,canvas){for(const m of mounts)if(!m.svg.isConnected)mounts.delete(m);mounts.add({svg,canvas});styleMap(svg,canvas,preview||installed);updatePhysicalControl(canvas);}
function setPreview(doc){preview=doc?validate(doc):null;for(const m of mounts){if(!m.svg.isConnected)mounts.delete(m);else{styleMap(m.svg,m.canvas,preview||installed);updatePhysicalControl(m.canvas);}}document.dispatchEvent(new CustomEvent('map-design-preview'));}
const api={create,layer,id,validate,serialize,mergeDown,position,imageFrame,imageSource,registerImage,updateImage,pruneImageCache,clone,geometryHash,extent,limits,defaults,blends,fonts,render,styleMap,attach,setPreview,installedDesign,updatePhysicalControl,hasPhysical,hasPreview:()=>!!preview,getPreview:()=>preview?clone(preview):null};
root.AnatolianMapDesign=api;
if(root.AnatolianMapInstalledDesign&&root.document){try{installedDesign(root.AnatolianMapInstalledDesign);}catch(e){console.error('Installed atlas design is invalid:',e);}}
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
