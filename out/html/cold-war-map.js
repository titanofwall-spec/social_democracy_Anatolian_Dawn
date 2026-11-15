(function () {
  'use strict';
  let ready, canvas, ctx, original, displayed, pixels, width, height, hoverCanvas, hoverCtx, active = 0;
  let selectedMode='political';
  function updateModeControls(){
    overlay().dataset.mapMode=selectedMode;
    document.querySelectorAll('[data-cold-war-mode]').forEach(button=>{
      const selected=button.dataset.coldWarMode===selectedMode;
      button.setAttribute('aria-checked',String(selected));button.tabIndex=selected?0:-1;
    });
  }
  function selectMode(mode){
    if(!['political','allegiance','divided'].includes(mode))return;
    clear();selectedMode=mode;updateModeControls();if(mapRenderer)renderDisplay();
  }
  let terrainImage, politicalOverlay, mapRenderer;
  function insideGlobe(x,y) {
    const mask=window.ColdWarGlobeMask;
    const row=mask.rows[Math.min(mask.rows.length-1,Math.floor(y*mask.rows.length/height))];
    const scale=width/(mask.bounds[2]-mask.bounds[0]+1);
    return x>=row[0]*scale && x<(row[1]+1)*scale;
  }
  function renderDisplay() {
    mapRenderer.render(ctx,selectedMode,window.ColdWarModes.date());
    window.ColdWarPresentation.apply(ctx,width,height,original);
    displayed=ctx.getImageData(0,0,width,height);
  }
  const fills = [], borders = [], names = [''];
  const byColor = new Map();
  const keys = new Map();
  function number(r,g,b) { return (r << 16) | (g << 8) | b; }
  function overlay() { return document.getElementById('cold-war-map-overlay'); }
  function tooltip() { return document.getElementById('cold-war-map-tooltip'); }
  // Shared IDs need location only to distinguish their separately named territories.
  // These divisions apply to this fixed source projection, never to screen coordinates.
  function country(color, x, y) {
    const choices = byColor.get(color);
    if (!choices) return 0;
    let name = choices[0];
    if (choices.length > 1) {
      if (color === 0xab6fd8) name = x < width * .55 ? 'Greenland' : 'Denmark';
      if (color === 0xce612c) name = x < width * .5 ? 'French Guiana' : 'France';
      if (color === 0xcda456) name = y > height * .62 ? 'Puerto Rico' : 'United States';
    }
    return keys.get(name);
  }
  function clear() {
    const wasActive=!!active;
    if (active && displayed) ctx.putImageData(displayed,0,0);
    if(hoverCtx)hoverCtx.clearRect(0,0,width,height);
    active = 0;
    tooltip().hidden = true;
    if(wasActive)window.ColdWarDecorations.release();
  }
  function paint(id) {
    if (id === active) return;
    clear();
    if (!id) return;
    const frame = hoverCtx.createImageData(width,height);
    const a = frame.data;
    fills[id].forEach(p => {
      const i=p*4;
      a[i]=84;
      a[i+1]=152;
      a[i+2]=216;a[i+3]=51;
    });
    borders[id].forEach(p => {const i=p*4;a[i]=84;a[i+1]=152;a[i+2]=216;a[i+3]=255;});
    hoverCtx.putImageData(frame,0,0);
    const halo=document.createElement('canvas');halo.width=width;halo.height=height;
    const haloCtx=halo.getContext('2d'),haloPixels=haloCtx.createImageData(width,height);
    borders[id].forEach(p=>{const i=p*4;haloPixels.data[i]=84;haloPixels.data[i+1]=152;haloPixels.data[i+2]=216;haloPixels.data[i+3]=255;});
    haloCtx.putImageData(haloPixels,0,0);
    hoverCtx.save();hoverCtx.globalCompositeOperation='source-over';hoverCtx.shadowColor='rgba(84,152,216,.85)';hoverCtx.shadowBlur=14;hoverCtx.drawImage(halo,0,0);hoverCtx.restore();
    active=id;
    const tip=tooltip();
    window.ColdWarGovernments.render(names[id],tip);
    tip.hidden=false;
    window.ColdWarDecorations.hide();
  }
  function move(event) {
    if (!pixels) return;
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((event.clientX-rect.left)*width/rect.width);
    const y=Math.floor((event.clientY-rect.top)*height/rect.height);
    paint(x>=0&&y>=0&&x<width&&y<height ? pixels[y*width+x] : 0);
    if (!active) return;
    const tip=tooltip();
    window.ColdWarGovernments.render(names[active],tip);
    tip.style.left=Math.max(8,Math.min(event.clientX+16,innerWidth-tip.offsetWidth-8))+'px';
    tip.style.top=Math.max(8,Math.min(event.clientY+16,innerHeight-tip.offsetHeight-8))+'px';
  }
  function setup() {
    if (ready) return ready;
    ready=new Promise((resolve,reject)=>{
      canvas=document.getElementById('cold-war-map');ctx=canvas.getContext('2d');
      window.ColdWarCountries.forEach(entry=>{
        const id=names.length;names.push(entry.name);keys.set(entry.name,id);fills[id]=[];borders[id]=[];
        const color=parseInt(entry.hex,16);
        if(!byColor.has(color))byColor.set(color,[]);
        byColor.get(color).push(entry.name);
      });
      const img=new Image();
      img.onerror=()=>reject(new Error('The country map could not be loaded.'));
      img.onload=async ()=>{try {
        width=canvas.width=img.naturalWidth;height=canvas.height=img.naturalHeight;
        hoverCanvas=document.getElementById('cold-war-hover');hoverCanvas.width=width;hoverCanvas.height=height;hoverCtx=hoverCanvas.getContext('2d');
        ctx.drawImage(img,0,0);original=ctx.getImageData(0,0,width,height);
        pixels=new Uint16Array(width*height);
        const a=original.data;
        for(let p=0;p<pixels.length;p++) {
          const i=p*4;if(a[i+3]!==255 || !insideGlobe(p%width,Math.floor(p/width)))continue;
          const id=country(number(a[i],a[i+1],a[i+2]),p%width,Math.floor(p/width));
          if(id){pixels[p]=id;fills[id].push(p);}
        }
        // Eight immediate neighbors only; never flood-fill the connected border network.
        for(let p=0;p<pixels.length;p++) {
          const i=p*4;if(a[i]||a[i+1]||a[i+2]||a[i+3]!==255)continue;
          const x=p%width,y=Math.floor(p/width),seen=[];
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            if((!dx&&!dy)||x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;
            const id=pixels[(y+dy)*width+x+dx];
            if(id&&!seen.includes(id)){borders[id].push(p);seen.push(id);}
          }
        }
        canvas.addEventListener('pointermove',move);
        canvas.addEventListener('pointerleave',event=>{
          if(event.relatedTarget && tooltip().contains(event.relatedTarget))return;
          clear();
        });
        canvas.addEventListener('pointerdown',move);
        try {
          const loadImage=src=>new Promise((resolve,reject)=>{
            const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;
          });
          let heightImage;
          [terrainImage,politicalOverlay,heightImage]=await Promise.all([
            loadImage('img/cold-war-world-texture-base.png?v=1'),
            loadImage('img/cold-war-political-overlay.png?v=1'),
            loadImage('img/cold-war-world-heightmap.png?v=1')
          ]);
          mapRenderer=window.ColdWarRenderer.create({width,height,source:original,texture:terrainImage,political:politicalOverlay,heightmap:heightImage,insideGlobe});
        }catch(error){
          throw new Error('The globe layers could not be loaded. '+error.message);
          
        }
        renderDisplay();
        fitGlobe();
        document.getElementById('cold-war-map-message').hidden=!!mapRenderer;
        resolve();
      }catch(error){reject(error);}};
      img.src='img/cold-war-country-ids-detailed.png?v=1';
    });
    return ready;
  }
  function fitGlobe(){
    const stage=document.querySelector('.cold-war-map-stage');
    const globe=document.querySelector('.cold-war-globe');
    if(!stage||!globe||overlay().hidden)return;
    const ratio=(width||2828)/(height||2825);
    const fitWidth=Math.max(1,Math.min(stage.clientWidth/1.44,stage.clientHeight*ratio/1.18));
    globe.style.width=fitWidth+'px';globe.style.height=(fitWidth/ratio)+'px';
  }
  window.showColdWarMap=function(){
    selectMode('political');
    window.ColdWarDecorations.reset();
    overlay().hidden=false;document.body.classList.add('cold-war-map-open');
    fitGlobe();
    document.getElementById('cold-war-map-close').focus();
    setup().catch(error=>{const msg=document.getElementById('cold-war-map-message');msg.hidden=false;msg.textContent=error.message;});
  };
  window.hideColdWarMap=function(){
    clear();window.ColdWarDecorations.reset();overlay().hidden=true;document.body.classList.remove('cold-war-map-open');
    const button=document.getElementById('cold-war-map-button');if(button)button.focus();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    tooltip().addEventListener('pointerenter',()=>{if(active)window.ColdWarDecorations.hide();});
    tooltip().addEventListener('pointerleave',clear);
    const modeButtons=Array.from(document.querySelectorAll('[data-cold-war-mode]'));
    modeButtons.forEach((button,index)=>{
      button.addEventListener('click',()=>selectMode(button.dataset.coldWarMode));
      button.addEventListener('keydown',event=>{
        const offset=event.key==='ArrowRight'||event.key==='ArrowDown'?1:event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:0;
        if(!offset&&event.key!=='Home'&&event.key!=='End')return;
        event.preventDefault();const target=event.key==='Home'?0:event.key==='End'?modeButtons.length-1:(index+offset+modeButtons.length)%modeButtons.length;
        modeButtons[target].focus();selectMode(modeButtons[target].dataset.coldWarMode);
      });
    });
    const stage=document.querySelector('.cold-war-map-stage');
    if(window.ResizeObserver)new ResizeObserver(fitGlobe).observe(stage);
    window.addEventListener('resize',fitGlobe);
    document.getElementById('cold-war-map-close').addEventListener('click',window.hideColdWarMap);
    document.addEventListener('keydown',event=>{
      if(overlay().hidden)return;
      if(event.key==='Escape'){event.preventDefault();window.hideColdWarMap();}
      if(event.key==='Tab'){
        const controls=Array.from(overlay().querySelectorAll('button,select,input')).filter(el=>!el.disabled && el.tabIndex>=0 && el.getClientRects().length);
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey && (document.activeElement===first || !overlay().contains(document.activeElement))){event.preventDefault();last.focus();}
        else if(!event.shiftKey && (document.activeElement===last || !overlay().contains(document.activeElement))){event.preventDefault();first.focus();}
      }
    });
  });
}());


