(function () {
  'use strict';
  let ready, canvas, ctx, original, displayed, pixels, width, height, active = 0;
  const storageKey = 'anatolian-cold-war-palette-v1';
  const palette = Object.create(null);
  let editing = false, renderPending = false;
  function hex(value) { return '#' + value.toString(16).padStart(6,'0').toUpperCase(); }
  function initializePalette() {
    palette['#FFFFFF']='#FFFFFF';
    window.ColdWarCountries.forEach(e=>{palette['#'+e.hex.toUpperCase()]='#'+e.hex.toUpperCase();});
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(saved && saved.assignments) Object.keys(palette).forEach(id=>{
        if(/^#[0-9a-f]{6}$/i.test(saved.assignments[id]||''))palette[id]=saved.assignments[id].toUpperCase();
      });
    } catch (_) { /* The editor remains usable without browser storage. */ }
  }
  function documentPalette() {
    return {schema:'anatolian-dawn-cold-war-palette',version:1,
      assignments:{...palette},
      countries:window.ColdWarCountries.map(e=>({name:e.name,id:'#'+e.hex.toUpperCase(),color:palette['#'+e.hex.toUpperCase()]})),
      sea:{id:'#FFFFFF',color:palette['#FFFFFF']}};
  }
  function redraw() {
    if(!original)return;
    const selected=active;clear();
    displayed=new ImageData(new Uint8ClampedArray(original.data),width,height);
    const source=original.data, target=displayed.data;
    const colors=new Map(Object.entries(palette).map(([id,color])=>[parseInt(id.slice(1),16),parseInt(color.slice(1),16)]));
    for(let i=0;i<source.length;i+=4){
      const color=colors.get(number(source[i],source[i+1],source[i+2]));
      if(color===undefined || source[i+3]!==255)continue;
      target[i]=color>>16;target[i+1]=(color>>8)&255;target[i+2]=color&255;
    }
    ctx.putImageData(displayed,0,0);
    if(selected)paint(selected);
  }
  function syncPicker() {
    const id=document.getElementById('cold-war-palette-country').value;
    document.getElementById('cold-war-palette-color').value=palette[id];
    document.getElementById('cold-war-palette-hex').textContent=palette[id];
  }
  function choose(event) {
    if(!editing || !pixels)return;
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((event.clientX-rect.left)*width/rect.width),y=Math.floor((event.clientY-rect.top)*height/rect.height);
    if(x<0||y<0||x>=width||y>=height)return;
    const p=y*width+x,i=p*4;
    const color=number(original.data[i],original.data[i+1],original.data[i+2]);
    const id=hex(color);
    if(Object.hasOwn(palette,id)){
      document.getElementById('cold-war-palette-country').value=id;syncPicker();
    }
  }
  function setupEditor() {
    initializePalette();
    const select=document.getElementById('cold-war-palette-country');
    const options=[{name:'Sea / ocean',hex:'FFFFFF'},...window.ColdWarCountries];
    const seen=new Set();
    options.forEach(entry=>{
      const id='#'+entry.hex.toUpperCase();if(seen.has(id))return;seen.add(id);
      const option=document.createElement('option');option.value=id;
      option.textContent=id==='#FFFFFF' ? 'Sea / ocean' : window.ColdWarCountries.filter(e=>e.hex===entry.hex).map(e=>e.name).join(' / ');
      select.append(option);
    });
    select.addEventListener('change',syncPicker);syncPicker();
    document.getElementById('cold-war-palette-toggle').addEventListener('click',()=>{
      editing=!editing;clear();
      document.getElementById('cold-war-palette-editor').hidden=!editing;
      const button=document.getElementById('cold-war-palette-toggle');
      button.setAttribute('aria-expanded',String(editing));button.textContent=editing?'Close editor':'Edit colors';
    });
    document.getElementById('cold-war-palette-color').addEventListener('input',event=>{
      palette[select.value]=event.target.value.toUpperCase();
      document.getElementById('cold-war-palette-hex').textContent=palette[select.value];
      const status=document.getElementById('cold-war-palette-status');
      try{localStorage.setItem(storageKey,JSON.stringify(documentPalette()));status.textContent='Saved in this browser. Export to keep a portable copy.';}
      catch(_){status.textContent='Browser saving unavailable. Export before leaving.';}
      if(!renderPending){renderPending=true;requestAnimationFrame(()=>{renderPending=false;redraw();});}
    });
    document.getElementById('cold-war-palette-export').addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(documentPalette(),null,2)+'\n'],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='cold-war-map-palette.json';document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),10000);
      document.getElementById('cold-war-palette-status').textContent='Palette exported. Send the JSON when you’re finished.';
    });
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
      a[i]=Math.round(a[i]*.76+255*.24);
      a[i+1]=Math.round(a[i+1]*.76+210*.24);
      a[i+2]=Math.round(a[i+2]*.76);
    });
    borders[id].forEach(p => {const i=p*4;a[i]=255;a[i+1]=210;a[i+2]=0;});
    ctx.putImageData(frame,0,0);
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
      img.onload=()=>{try {
        width=canvas.width=img.naturalWidth;height=canvas.height=img.naturalHeight;
        ctx.drawImage(img,0,0);original=ctx.getImageData(0,0,width,height);
        pixels=new Uint16Array(width*height);
        const a=original.data;
        for(let p=0;p<pixels.length;p++) {
          const i=p*4;if(a[i+3]!==255)continue;
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
        canvas.addEventListener('pointerdown',event=>{move(event);choose(event);});
        redraw();
        document.getElementById('cold-war-map-message').hidden=true;
        resolve();
      }catch(error){reject(error);}};
      img.src='img/cold-war-country-ids.png';
    });
    return ready;
  }
  window.showColdWarMap=function(){
    overlay().hidden=false;document.body.classList.add('cold-war-map-open');
    document.getElementById('cold-war-map-close').focus();
    setup().catch(error=>{const msg=document.getElementById('cold-war-map-message');msg.hidden=false;msg.textContent=error.message;});
  };
  window.hideColdWarMap=function(){
    clear();overlay().hidden=true;document.body.classList.remove('cold-war-map-open');
    const button=document.getElementById('cold-war-map-button');if(button)button.focus();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    setupEditor();
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
