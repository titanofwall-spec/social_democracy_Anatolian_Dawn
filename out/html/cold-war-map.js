(function () {
  'use strict';
  let ready, canvas, ctx, original, displayed, pixels, width, height, active = 0;
  let terrainImage, politicalOverlay, mapRenderer;
  function insideGlobe(x,y) {
    const mask=window.ColdWarGlobeMask;
    const row=mask.rows[Math.min(mask.rows.length-1,Math.floor(y*mask.rows.length/height))];
    const scale=width/(mask.bounds[2]-mask.bounds[0]+1);
    return x>=row[0]*scale && x<(row[1]+1)*scale;
  }
  function renderDisplay() {
    mapRenderer.render(ctx);
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
    if (active && displayed) ctx.putImageData(displayed,0,0);
    active = 0;
    tooltip().hidden = true;
  }
  function paint(id) {
    if (id === active) return;
    clear();
    if (!id) return;
    const frame = new ImageData(new Uint8ClampedArray(displayed.data),width,height);
    const a = frame.data;
    fills[id].forEach(p => {
      const i=p*4;
      a[i]=Math.round(a[i]*.80+84*.20);
      a[i+1]=Math.round(a[i+1]*.80+152*.20);
      a[i+2]=Math.round(a[i+2]*.80+216*.20);
    });
    borders[id].forEach(p => {const i=p*4;a[i]=84;a[i+1]=152;a[i+2]=216;});
    ctx.putImageData(frame,0,0);
    const halo=document.createElement('canvas');halo.width=width;halo.height=height;
    const haloCtx=halo.getContext('2d'),haloPixels=haloCtx.createImageData(width,height);
    borders[id].forEach(p=>{const i=p*4;haloPixels.data[i]=84;haloPixels.data[i+1]=152;haloPixels.data[i+2]=216;haloPixels.data[i+3]=255;});
    haloCtx.putImageData(haloPixels,0,0);
    ctx.save();ctx.globalCompositeOperation='source-atop';ctx.shadowColor='rgba(84,152,216,.85)';ctx.shadowBlur=14;ctx.drawImage(halo,0,0);ctx.restore();
    active=id;
    const tip=tooltip();
    tip.replaceChildren();
    const title=document.createElement('strong');title.textContent=names[id];tip.append(title);
    ['Head of State: Placeholder','Head of Government: Placeholder','Government: Placeholder'].forEach(text=>{
      const line=document.createElement('div');line.textContent=text;tip.append(line);
    });
    tip.hidden=false;
  }
  function move(event) {
    if (!pixels) return;
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((event.clientX-rect.left)*width/rect.width);
    const y=Math.floor((event.clientY-rect.top)*height/rect.height);
    paint(x>=0&&y>=0&&x<width&&y<height ? pixels[y*width+x] : 0);
    if (!active) return;
    const tip=tooltip();
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
        canvas.addEventListener('pointerleave',clear);
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
    const fitWidth=Math.max(1,Math.min(stage.clientWidth,stage.clientHeight*ratio));
    globe.style.width=fitWidth+'px';globe.style.height=(fitWidth/ratio)+'px';
  }
  window.showColdWarMap=function(){
    overlay().hidden=false;document.body.classList.add('cold-war-map-open');
    fitGlobe();
    document.getElementById('cold-war-map-close').focus();
    setup().catch(error=>{const msg=document.getElementById('cold-war-map-message');msg.hidden=false;msg.textContent=error.message;});
  };
  window.hideColdWarMap=function(){
    clear();overlay().hidden=true;document.body.classList.remove('cold-war-map-open');
    const button=document.getElementById('cold-war-map-button');if(button)button.focus();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const stage=document.querySelector('.cold-war-map-stage');
    if(window.ResizeObserver)new ResizeObserver(fitGlobe).observe(stage);
    window.addEventListener('resize',fitGlobe);
    document.getElementById('cold-war-map-close').addEventListener('click',window.hideColdWarMap);
    document.addEventListener('keydown',event=>{
      if(overlay().hidden)return;
      if(event.key==='Escape'){event.preventDefault();window.hideColdWarMap();}
      if(event.key==='Tab'){
        const controls=Array.from(overlay().querySelectorAll('button,select,input')).filter(el=>!el.disabled && el.getClientRects().length);
        const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey && (document.activeElement===first || !overlay().contains(document.activeElement))){event.preventDefault();last.focus();}
        else if(!event.shiftKey && (document.activeElement===last || !overlay().contains(document.activeElement))){event.preventDefault();first.focus();}
      }
    });
  });
}());
