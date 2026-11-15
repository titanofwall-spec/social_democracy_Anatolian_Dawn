(function () {
  'use strict';
  let ready, canvas, ctx, original, pixels, width, height, active = 0;
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
    if (active && original) ctx.putImageData(original,0,0);
    active = 0;
    tooltip().hidden = true;
  }
  function paint(id) {
    if (id === active) return;
    clear();
    if (!id) return;
    const frame = new ImageData(new Uint8ClampedArray(original.data),width,height);
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
        canvas.addEventListener('pointerdown',move);
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
    document.getElementById('cold-war-map-close').addEventListener('click',window.hideColdWarMap);
    document.addEventListener('keydown',event=>{
      if(overlay().hidden)return;
      if(event.key==='Escape'){event.preventDefault();window.hideColdWarMap();}
      if(event.key==='Tab'){event.preventDefault();document.getElementById('cold-war-map-close').focus();}
    });
  });
}());
