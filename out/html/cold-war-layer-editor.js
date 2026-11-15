(function () {
  'use strict';
  const MODES = ['source-over','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
  const LABELS = { 'source-over':'Normal', 'color-dodge':'Color dodge', 'color-burn':'Color burn', 'hard-light':'Hard light', 'soft-light':'Soft light' };
  const STORAGE = 'anatolian-cold-war-layers-v1';
  const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
  const defaults=(kind,name,extra={})=>({id:crypto.randomUUID(),kind,name,visible:true,opacity:100,blend:'source-over',saturation:100,contrast:100,color:'#FFFFFF',strength:100,blur:1,azimuth:315,altitude:45,gamma:1,heightContrast:100,invert:false,...extra});

  function create(options) {
    const {width:w,height:h,source,texture,political,heightmap,relief,onChange,insideGlobe}=options;
    const panel=document.getElementById('cold-war-layer-tools');
    const cache=new Map(), images=new Map();
    let layers=[defaults('texture','World texture',{saturation:56}),defaults('height','Heightmap relief',{blend:'multiply'}),defaults('political','Country colors',{blend:'multiply'}),defaults('borders','Black outlines'),defaults('ids','Country ID map',{visible:false}),defaults('sea','Sea color',{visible:false,color:'#1E1E2E'}),defaults('relief','Previous baked relief',{visible:false}),defaults('heightmap','Raw heightmap',{visible:false})];
    let selected=layers[2].id, pending=false, status='Changes save in this browser. Export a copy before clearing browser data.';
    const mask=makeCanvas(w,h), maskCtx=mask.getContext('2d');
    const maskPixels=maskCtx.createImageData(w,h);
    const borders=makeCanvas(w,h),borderCtx=borders.getContext('2d'),borderPixels=borderCtx.createImageData(w,h);
    const ids=makeCanvas(w,h),idCtx=ids.getContext('2d'),idPixels=new ImageData(new Uint8ClampedArray(source.data),w,h);
    const sea=makeCanvas(w,h),seaCtx=sea.getContext('2d'),seaPixels=seaCtx.createImageData(w,h);
    for(let p=0;p<w*h;p++) {
      const i=p*4,inside=insideGlobe(p%w,Math.floor(p/w));
      maskPixels.data[i]=maskPixels.data[i+1]=maskPixels.data[i+2]=255;maskPixels.data[i+3]=inside?255:0;
      if(!inside){idPixels.data[i+3]=0;continue;}
      if(source.data[i]===0&&source.data[i+1]===0&&source.data[i+2]===0&&source.data[i+3]===255)borderPixels.data[i+3]=255;
      if(source.data[i]===255&&source.data[i+1]===255&&source.data[i+2]===255)seaPixels.data[i+3]=255;
    }
    maskCtx.putImageData(maskPixels,0,0);borderCtx.putImageData(borderPixels,0,0);idCtx.putImageData(idPixels,0,0);seaCtx.putImageData(seaPixels,0,0);
    const heightCanvas=makeCanvas(w,h),hc=heightCanvas.getContext('2d');hc.drawImage(heightmap,0,0,w,h);
    const heights=hc.getImageData(0,0,w,h).data;
    const baseHeight=new Float32Array(w*h);
    for(let p=0;p<w*h;p++)baseHeight[p]=heights[p*4]/255;

    function sanitize(list) {
      if(!Array.isArray(list)||list.length<1||list.length>40)throw Error('Use a palette file containing 1–40 layers.');
      return list.map(raw=>{
        if(!['texture','height','political','borders','ids','sea','relief','heightmap','fill','image'].includes(raw.kind))throw Error('Unknown layer type.');
        if(raw.kind==='image' && !/^data:image\/(png|jpeg|webp);base64,/i.test(raw.image||''))throw Error('Image layers must contain PNG, JPEG or WebP data.');
        return defaults(raw.kind,String(raw.name||raw.kind).slice(0,80),{
          id:crypto.randomUUID(),visible:raw.visible!==false,opacity:bounded(raw.opacity,0,100,100),blend:MODES.includes(raw.blend)?raw.blend:'source-over',
          saturation:bounded(raw.saturation,0,200,100),contrast:bounded(raw.contrast,0,200,100),color:/^#[a-f0-9]{6}$/i.test(raw.color||'')?raw.color:'#FFFFFF',
          strength:bounded(raw.strength,0,400,100),blur:bounded(raw.blur,0,12,1),azimuth:bounded(raw.azimuth,0,360,315),altitude:bounded(raw.altitude,5,90,45),
          gamma:bounded(raw.gamma,.2,3,1),heightContrast:bounded(raw.heightContrast,0,300,100),invert:raw.invert===true,...(raw.kind==='image'?{image:raw.image}:{})
        });
      });
    }
    function snapshot(){return {schema:'anatolian-dawn-cold-war-layers',version:1,layers};}
    function message(text){status=text;const el=panel.querySelector('[data-status]');if(el)el.textContent=text;}
    function save(){try{localStorage.setItem(STORAGE,JSON.stringify(snapshot()));message('Saved in this browser. Export JSON to keep a portable copy.');}catch(_){message('Browser storage is full or unavailable. Export JSON to keep these changes.');}}
    function changed(){save();if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;try{onChange();}catch(error){message(error.message);}});}}
    function loadImage(layer){
      if(images.has(layer.id))return images.get(layer.id);
      const image=new Image();images.set(layer.id,image);
      image.onload=()=>{cache.delete(layer.id);onChange();};image.onerror=()=>message('Could not load image layer '+layer.name);image.src=layer.image;
      return image;
    }
    function smooth(values,radius){
      if(radius<1)return values;
      const temp=new Float32Array(values.length),result=new Float32Array(values.length),n=radius*2+1;
      for(let y=0;y<h;y++){
        const row=y*w;let sum=0;
        for(let k=-radius;k<=radius;k++)sum+=values[row+Math.max(0,Math.min(w-1,k))];
        for(let x=0;x<w;x++){temp[row+x]=sum/n;sum+=values[row+Math.min(w-1,x+radius+1)]-values[row+Math.max(0,x-radius)];}
      }
      for(let x=0;x<w;x++){
        let sum=0;for(let k=-radius;k<=radius;k++)sum+=temp[Math.max(0,Math.min(h-1,k))*w+x];
        for(let y=0;y<h;y++){result[y*w+x]=sum/n;sum+=temp[Math.min(h-1,y+radius+1)*w+x]-temp[Math.max(0,y-radius)*w+x];}
      }
      return result;
    }
    function heightLayer(layer){
      const c=makeCanvas(w,h),cx=c.getContext('2d'),frame=cx.createImageData(w,h);
      const values=smooth(baseHeight,Math.round(layer.blur));
      const az=layer.azimuth*Math.PI/180,alt=layer.altitude*Math.PI/180;
      const lx=Math.sin(az)*Math.cos(alt),ly=-Math.cos(az)*Math.cos(alt),lz=Math.sin(alt);
      const contrast=layer.heightContrast/100,sign=layer.invert?-1:1;
      const adjusted=v=>Math.pow(Math.max(0,Math.min(1,(v-.5)*contrast+.5)),1/layer.gamma);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const p=y*w+x,i=p*4;
        const dx=(adjusted(values[y*w+Math.min(w-1,x+1)])-adjusted(values[y*w+Math.max(0,x-1)]))*sign*layer.strength*.025;
        const dy=(adjusted(values[Math.min(h-1,y+1)*w+x])-adjusted(values[Math.max(0,y-1)*w+x]))*sign*layer.strength*.025;
        const light=(-dx*lx-dy*ly+lz)/Math.sqrt(1+dx*dx+dy*dy);
        // Flat ground is white, making Multiply neutral when relief strength is zero.
        const value=Math.round(255*Math.max(0,Math.min(1,light/Math.max(.1,lz))));
        frame.data[i]=frame.data[i+1]=frame.data[i+2]=value;frame.data[i+3]=maskPixels.data[i+3];
      }
      cx.putImageData(frame,0,0);return c;
    }
    function layerCanvas(layer){
      const key=JSON.stringify([layer.kind,layer.saturation,layer.contrast,layer.color,layer.strength,layer.blur,layer.azimuth,layer.altitude,layer.gamma,layer.heightContrast,layer.invert]);
      const cached=cache.get(layer.id);if(cached&&cached.key===key)return cached.canvas;
      let image={texture,political,borders,ids,relief,heightmap}[layer.kind];
      if(layer.kind==='height')image=heightLayer(layer);
      if(layer.kind==='image'){image=loadImage(layer);if(!image.complete||!image.naturalWidth)return null;}
      const c=makeCanvas(w,h),cx=c.getContext('2d');
      cx.filter='saturate('+layer.saturation+'%) contrast('+layer.contrast+'%)';
      if(layer.kind==='fill'||layer.kind==='sea'){
        cx.fillStyle=layer.color;cx.fillRect(0,0,w,h);
      }else if(image)cx.drawImage(image,0,0,w,h);
      cx.filter='none';cx.globalCompositeOperation='destination-in';cx.drawImage(layer.kind==='sea'?sea:mask,0,0);cx.globalCompositeOperation='source-over';
      cache.set(layer.id,{key,canvas:c});return c;
    }
    function render(ctx){
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,w,h);
      try{
        for(const layer of layers){
          if(!layer.visible||layer.opacity===0)continue;
          const c=layerCanvas(layer);if(!c)continue;
          ctx.globalAlpha=layer.opacity/100;
          ctx.globalCompositeOperation=layer.blend;
          if(ctx.globalCompositeOperation!==layer.blend)throw Error('This browser does not support '+layer.blend+'.');
          ctx.drawImage(c,0,0);
        }
      }finally{ctx.restore();}
    }
    const numberControl=(label,prop,value,min,max,step=1)=>'<label>'+label+'<input type="range" data-prop="'+prop+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"><output data-value="'+prop+'">'+value+'</output></label>';
    function drawUI(){
      const layer=layers.find(l=>l.id===selected)||layers[0];selected=layer.id;
      panel.innerHTML='<div class="cw-layer-layout"><div><p>Layers · top first</p><select data-list size="7" aria-label="Layer stack"></select><div class="cw-layer-actions"><button data-action="up">Move up</button><button data-action="down">Move down</button><button data-action="duplicate">Duplicate</button><button data-action="delete">Delete</button></div><label>New layer<select data-new-kind><option value="fill">Color fill</option><option value="texture">World texture</option><option value="height">Heightmap relief</option><option value="political">Country colors</option><option value="borders">Black outlines</option><option value="ids">Country IDs</option><option value="sea">Sea color</option><option value="relief">Previous baked relief</option><option value="heightmap">Raw heightmap</option></select></label><div class="cw-layer-actions"><button data-action="add">Add layer</button><button data-action="image">Import image layer</button></div></div><div class="cw-layer-properties"><label>Name<input data-prop="name" type="text" maxlength="80"></label><label class="cw-inline"><input data-prop="visible" type="checkbox">Visible</label><label>Layer effect<select data-prop="blend"></select></label>'+numberControl('Opacity (%)','opacity',layer.opacity,0,100)+numberControl('Saturation (%)','saturation',layer.saturation,0,200)+numberControl('Contrast (%)','contrast',layer.contrast,0,200)+((layer.kind==='fill'||layer.kind==='sea')?'<label>Color<input type="color" data-prop="color" value="'+layer.color+'"></label>':'')+(layer.kind==='height'?'<fieldset><legend>Heightmap relief</legend>'+numberControl('Relief strength','strength',layer.strength,0,400)+numberControl('Smoothing (pixels)','blur',layer.blur,0,12)+numberControl('Light direction (°)','azimuth',layer.azimuth,0,360)+numberControl('Light elevation (°)','altitude',layer.altitude,5,90)+numberControl('Height contrast (%)','heightContrast',layer.heightContrast,0,300)+numberControl('Height gamma','gamma',layer.gamma,.2,3,.05)+'<label class="cw-inline"><input type="checkbox" data-prop="invert">Invert relief</label></fieldset>':'')+'</div></div><div class="cw-layer-actions"><button data-action="export">Export JSON</button><button data-action="import">Import JSON</button></div><p data-status role="status"></p><p class="cw-layer-note">Country detection stays fixed. Gold hover borders and highlights always render above this stack. Imported images stretch to the globe canvas and use its cutout.</p><input type="file" data-file="image" accept="image/png,image/jpeg,image/webp" hidden><input type="file" data-file="json" accept="application/json,.json" hidden>';
      const list=panel.querySelector('[data-list]');
      [...layers].reverse().forEach(l=>{const opt=document.createElement('option');opt.value=l.id;opt.textContent=(l.visible?'● ':'○ ')+l.name;opt.selected=l.id===selected;list.append(opt);});
      panel.querySelector('[data-prop="name"]').value=layer.name;
      panel.querySelector('[data-prop="visible"]').checked=layer.visible;
      const blend=panel.querySelector('[data-prop="blend"]');
      MODES.forEach(mode=>{const opt=document.createElement('option');opt.value=mode;opt.textContent=LABELS[mode]||mode[0].toUpperCase()+mode.slice(1);opt.selected=mode===layer.blend;blend.append(opt);});
      const invert=panel.querySelector('[data-prop="invert"]');if(invert)invert.checked=layer.invert;
      message(status);
    }
    panel.addEventListener('input',event=>{
      const prop=event.target.dataset.prop;if(!prop)return;
      const layer=layers.find(l=>l.id===selected);if(!layer)return;
      layer[prop]=event.target.type==='checkbox'?event.target.checked:event.target.type==='range'?Number(event.target.value):event.target.value;
      const output=panel.querySelector('[data-value="'+prop+'"]');if(output)output.value=layer[prop];
      if(prop==='name'||prop==='visible'){
        const option=Array.from(panel.querySelector('[data-list]').options).find(o=>o.value===layer.id);
        option.textContent=(layer.visible?'● ':'○ ')+layer.name;
      }
      changed();
    });
    panel.addEventListener('change',event=>{
      if(event.target.matches('[data-list]')){selected=event.target.value;drawUI();}
    });
    panel.addEventListener('click',event=>{
      const action=event.target.dataset.action;if(!action)return;
      const index=layers.findIndex(l=>l.id===selected),layer=layers[index];
      if(action==='export'){
        const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cold-war-map-layers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);return;
      }
      if(action==='import'||action==='image'){panel.querySelector('[data-file="'+(action==='import'?'json':'image')+'"]').click();return;}
      if(action==='up'&&index<layers.length-1)[layers[index],layers[index+1]]=[layers[index+1],layers[index]];
      if(action==='down'&&index>0)[layers[index],layers[index-1]]=[layers[index-1],layers[index]];
      if(action==='delete'){if(layers.length===1){message('Keep at least one layer.');return;}layers.splice(index,1);cache.delete(layer.id);images.delete(layer.id);selected=layers[Math.min(index,layers.length-1)].id;}
      if(action==='add'||action==='duplicate'){
        if(layers.length>=40){message('The editor supports up to 40 layers.');return;}
        const kind=panel.querySelector('[data-new-kind]').value;
        const added=action==='duplicate'?{...layer,id:crypto.randomUUID(),name:layer.name+' copy'}:defaults(kind,'New '+kind,{blend:kind==='height'||kind==='political'?'multiply':'source-over'});
        layers.push(added);selected=added.id;
      }
      drawUI();changed();
    });
    panel.addEventListener('change',async event=>{
      const kind=event.target.dataset.file,file=event.target.files&&event.target.files[0];if(!kind||!file)return;
      try{
        if(kind==='json'){
          if(file.size>30000000)throw Error('This layer file is too large.');
          const data=JSON.parse(await file.text());if(data.schema!=='anatolian-dawn-cold-war-layers'||data.version!==1)throw Error('Choose a Cold War layer-editor JSON export.');
          const imported=sanitize(data.layers);layers=imported;cache.clear();images.clear();selected=layers[0].id;
        }else{
          if(layers.length>=40)throw Error('The editor supports up to 40 layers.');
          if(file.size>12000000)throw Error('Choose an image smaller than 12 MB.');
          const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
          const added=sanitize([{kind:'image',name:file.name,image:data}])[0];layers.push(added);selected=added.id;
        }
        drawUI();changed();
      }catch(error){message(error.message||'Could not read this file.');}
    });
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
      if(saved&&saved.schema==='anatolian-dawn-cold-war-layers'&&saved.version===1){layers=sanitize(saved.layers);selected=layers[0].id;}
    }catch(_){status='Saved settings could not be restored; using the original layer stack.';}
    drawUI();
    return {render};
  }
  window.ColdWarLayerEditor={create};
}());

