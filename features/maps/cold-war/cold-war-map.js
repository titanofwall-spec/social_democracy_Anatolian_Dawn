(function () {
  'use strict';
  let ready, mapReady=false, canvas, ctx, original, pixels, width, height, hoverCanvas, hoverCtx, active = 0;
  let selectedMode='political';
  let halo, haloCtx, hoverBounds, queuedPointer, pointerFrame = 0;
  function updateModeControls(){
    overlay().dataset.mapMode=selectedMode;
    document.querySelectorAll('[data-cold-war-mode]').forEach(button=>{
      const selected=button.dataset.coldWarMode===selectedMode;
      button.setAttribute('aria-checked',String(selected));button.tabIndex=selected?0:-1;
    });
  }
  function selectMode(mode){
    if(!['political','allegiance','divided'].includes(mode))return;
    clear();selectedMode=mode;updateModeControls();setup();
  }
  let layersReady, requestedSource, loadRequest=0, mapRenderer;
  function insideGlobe(x,y) {
    const mask=window.ColdWarGlobeMask;
    const row=mask.rows[Math.min(mask.rows.length-1,Math.floor(y*mask.rows.length/height))];
    const scale=width/(mask.bounds[2]-mask.bounds[0]+1);
    return x>=row[0]*scale && x<(row[1]+1)*scale;
  }
  function renderDisplay() {
    mapRenderer.render(ctx,selectedMode,window.ColdWarModes.date());
    window.ColdWarPresentation.apply(ctx,width,height,original);
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
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    queuedPointer = null;
    if (hoverBounds) {
      const { left, top, w, h } = hoverBounds;
      const padding = 64; // Include the blurred border beyond the country rectangle.
      hoverCtx.clearRect(left - padding, top - padding, w + 2 * padding, h + 2 * padding);
      hoverBounds = null;
    }
    active = 0;
    tooltip().hidden = true;
    if(wasActive)window.ColdWarDecorations.release();
  }
  function paint(id) {
    if (id === active) return;
    clear();
    if (!id) return;
    let left = width, top = height, right = -1, bottom = -1;
    function include(p) {
      const x = p % width, y = Math.floor(p / width);
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    fills[id].forEach(include);
    borders[id].forEach(include);
    if (right < left) return;
    const w = right - left + 1, h = bottom - top + 1;
    hoverBounds = { left, top, w, h };
    const frame = hoverCtx.createImageData(w, h);
    const rgba = frame.data;
    function ink(p, alpha) {
      const i = ((Math.floor(p / width) - top) * w + (p % width - left)) * 4;
      rgba[i] = 84; rgba[i + 1] = 152; rgba[i + 2] = 216; rgba[i + 3] = alpha;
    }
    fills[id].forEach(p => ink(p, 51));
    borders[id].forEach(p => ink(p, 255));
    hoverCtx.putImageData(frame, left, top);
    if (!halo) {
      halo = document.createElement('canvas');
      haloCtx = halo.getContext('2d');
    }
    if (halo.width !== w) halo.width = w;
    if (halo.height !== h) halo.height = h;
    rgba.fill(0);
    borders[id].forEach(p => ink(p, 255));
    haloCtx.putImageData(frame, 0, 0);
    hoverCtx.save();
    hoverCtx.globalCompositeOperation = 'source-over';
    hoverCtx.shadowColor = 'rgba(84,152,216,.85)';
    hoverCtx.shadowBlur = 14;
    hoverCtx.drawImage(halo, left, top);
    hoverCtx.restore();
    active=id;
    const tip=tooltip();
    tip.hidden=false;
    window.ColdWarDecorations.hide();
  }
  function move(event) {
    if (!mapReady) return;
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((event.clientX-rect.left)*width/rect.width);
    const y=Math.floor((event.clientY-rect.top)*height/rect.height);
    paint(x>=0&&y>=0&&x<width&&y<height ? pixels[y*width+x] : 0);
    if (!active) return;
    const tip=tooltip();
    window.ColdWarGovernments.render(names[active],tip);
    const tipWidth = tip.offsetWidth, tipHeight = tip.offsetHeight;
    tip.style.left=Math.max(8,Math.min(event.clientX+16,innerWidth-tipWidth-8))+'px';
    tip.style.top=Math.max(8,Math.min(event.clientY+16,innerHeight-tipHeight-8))+'px';
  }
  function loadImage(src) {
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Could not load '+src.split('?')[0]+'.'));
      image.src=src;
    });
  }
  function initialize() {
    if (canvas) return;
    canvas=document.getElementById('cold-war-map');ctx=canvas.getContext('2d');
    window.ColdWarCountries.forEach(entry=>{
      const id=names.length;names.push(entry.name);keys.set(entry.name,id);fills[id]=[];borders[id]=[];
      const color=parseInt(entry.hex,16);
      if(!byColor.has(color))byColor.set(color,[]);
      byColor.get(color).push(entry.name);
    });
    canvas.addEventListener('pointermove', event => {
      queuedPointer = event;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const latest = queuedPointer;
        queuedPointer = null;
        if (latest) move(latest);
      });
    });
    canvas.addEventListener('pointerleave',event=>{
      if(event.relatedTarget && tooltip().contains(event.relatedTarget))return;
      clear();
    });
    canvas.addEventListener('pointerdown',move);
  }
  function setGeometry(img, terrainImage, politicalOverlay, heightImage) {
    width=canvas.width=img.naturalWidth;height=canvas.height=img.naturalHeight;
    hoverCanvas=document.getElementById('cold-war-hover');hoverCanvas.width=width;hoverCanvas.height=height;hoverCtx=hoverCanvas.getContext('2d');
    // Read country IDs offscreen; never paint the raw ID map to the visible globe.
    const sourceCanvas=document.createElement('canvas');sourceCanvas.width=width;sourceCanvas.height=height;
    const sourceCtx=sourceCanvas.getContext('2d',{willReadFrequently:true});
    sourceCtx.drawImage(img,0,0);original=sourceCtx.getImageData(0,0,width,height);
    pixels=new Uint16Array(width*height);
    fills.forEach(list=>{list.length=0;});
    borders.forEach(list=>{list.length=0;});
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
    mapRenderer=window.ColdWarRenderer.create({
      width,height,source:original,texture:terrainImage,political:politicalOverlay,heightmap:heightImage,insideGlobe
    });
    renderDisplay();
    fitGlobe();
  }
  function setup() {
    const source=window.ColdWarModes.countryIdImage();
    if (ready && requestedSource===source) {
      if (mapReady) renderDisplay();
      return ready;
    }
    requestedSource=source;
    const request=++loadRequest;
    initialize();
    const message=document.getElementById('cold-war-map-message');
    message.hidden=false;
    message.textContent='Loading map…';
    clear();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    mapReady=false;
    overlay().classList.add('is-loading');
    if (!layersReady) {
      layersReady=Promise.all([
        loadImage('img/cold-war-world-texture-base.png?v=1'),
        loadImage('img/cold-war-political-overlay.png?v=1'),
        loadImage('img/cold-war-world-heightmap.png?v=1')
      ]).catch(error=>{layersReady=null;throw error;});
    }
    ready=Promise.all([loadImage(source),layersReady]).then(([img,layers])=>{
      if (request!==loadRequest) return;
      setGeometry(img,...layers);
      mapReady=true;
      message.hidden=true;
    }).catch(error=>{
      if (request!==loadRequest) return;
      ready=null;
      message.hidden=false;
      message.textContent=error.message;
    }).finally(()=>{
      if (request===loadRequest) overlay().classList.remove('is-loading');
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
    clear();selectedMode='political';updateModeControls();
    window.ColdWarDecorations.reset();
    overlay().classList.toggle('is-loading',!mapReady);
    overlay().hidden=false;document.body.classList.add('cold-war-map-open');
    fitGlobe();
    document.getElementById('cold-war-map-close').focus();
    setup();
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


