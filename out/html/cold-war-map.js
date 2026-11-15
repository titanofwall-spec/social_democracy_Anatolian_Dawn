(function () {
  'use strict';
  let ready, canvas, ctx, original, displayed, pixels, width, height, active = 0;
  let terrainImage, terrainView = true;
  const displayColors = new Map(Object.entries({"#FFFFFF":"#1E1E2E","#5392D0":"#C9385D","#A5C039":"#A5C039","#CE612C":"#3971E4","#41B98B":"#F2CD5E","#BA32C8":"#277446","#3B36C4":"#C1AB08","#8BD572":"#D2893F","#DA6CA9":"#49BBD5","#77C1CF":"#666057","#DFCF68":"#AB1212","#AB6FD8":"#99745D","#4ECA71":"#6F4747","#D14749":"#2484F7","#5576C3":"#CDD4E4","#D94A69":"#647DAF","#8068CA":"#B70623","#D69D5C":"#C3C8D1","#5EDB57":"#437F3F","#C3CE3B":"#5CB3E1","#D382B9":"#D6A043","#A64ABF":"#D24646","#9AD742":"#7D0D18","#CE4BBE":"#D6668B","#62D0BD":"#3CAE98","#7D86D8":"#F97D5D","#CA5A3F":"#D7C448","#35D483":"#309100","#D35F87":"#484982","#4396C7":"#A52C43","#CDA456":"#1485ED","#8050D3":"#E93B3B","#B8A36C":"#689853","#D85E72":"#8A4197","#79B4C5":"#423163","#C18A51":"#C18A51","#9275BA":"#7E9142","#E4BE65":"#9882BF","#68AD82":"#9EB2BB","#CD769F":"#9EB2BB","#7795D4":"#7795D4","#AFB85D":"#AFB85D","#B478C4":"#AE7171","#D99C74":"#9882BF","#E08A57":"#E08A57","#D7B44F":"#DEBB5B","#9C6CBB":"#ABBE98","#65B78D":"#BD5697","#C785AB":"#D2893F","#8CBF76":"#4C913F","#4A87D9":"#D6733D","#ADD053":"#B4DE4A","#BF39C0":"#E36D3B","#32C89A":"#43B179","#B97241":"#EBAC24","#4ABF8D":"#F2CD5E","#3E2CCE":"#CF5C8A","#4FC436":"#4FC436","#D572A0":"#D572A0","#6CC0DA":"#6CC0DA","#CFCA77":"#77CFC1","#B668DF":"#B668DF","#6FD895":"#6FD895","#CA574E":"#CA574E","#4766D1":"#4766D1","#8EC355":"#8EC355","#D742BA":"#D742BA","#4BCEC1":"#4BCEC1","#D0A562":"#D0A562","#835CD6":"#835CD6","#68CA6B":"#68CA6B","#DB577A":"#DB577A","#5FA0D3":"#5FA0D3","#B3C743":"#B3C743","#BA3BCE":"#65B78D","#7A4FD9":"#7A4FD9","#E3A75A":"#E3A75A","#46B8A8":"#46B8A8","#CF5C8A":"#2C7ACE","#7BC94E":"#7BC94E","#6E83D1":"#6E83D1","#E0C953":"#E0C953","#C565C1":"#C565C1","#62A1D9":"#437F3F","#B8D54A":"#3971E4","#B39DB2":"#9882BF","#52B5D8":"#52B5D8","#3F41CA":"#A9CE9C","#99D87D":"#DF9E43","#DD78B5":"#516DAC","#82CAD3":"#753B40","#E2CE74":"#B27263","#AD7BDB":"#477161","#56CD72":"#ABBE98","#D35057":"#D35057","#E19A43":"#E19A43","#6294C8":"#6294C8","#BD65A2":"#BD65A2","#73C95A":"#73C95A","#A5C46F":"#A5C46F","#8E3B28":"#40A0A7","#5F83D2":"#2B7826","#E28B52":"#E28728","#C75DAE":"#9882BF","#68C8C1":"#AC8151","#C84365":"#CC2E2E","#64B6D4":"#64B6D4"}).map(([id,color])=>[parseInt(id.slice(1),16),parseInt(color.slice(1),16)]));
  function insideGlobe(x,y) {
    const mask=window.ColdWarGlobeMask;
    const row=mask.rows[Math.min(mask.rows.length-1,Math.floor(y*mask.rows.length/height))];
    const scale=width/(mask.bounds[2]-mask.bounds[0]+1);
    return x>=row[0]*scale && x<(row[1]+1)*scale;
  }
  function renderDisplay() {
    displayed=new ImageData(new Uint8ClampedArray(original.data),width,height);
    const source=original.data,target=displayed.data;
    for(let p=0;p<width*height;p++){
      const i=p*4;
      if(!insideGlobe(p%width,Math.floor(p/width))){target[i+3]=0;continue;}
      const color=displayColors.get(number(source[i],source[i+1],source[i+2]));
      if(color===undefined || source[i+3]!==255)continue;
      target[i]=color>>16;target[i+1]=(color>>8)&255;target[i+2]=color&255;
    }
    if(terrainView && terrainImage){
      ctx.clearRect(0,0,width,height);
      ctx.drawImage(terrainImage,0,0,width,height);
      displayed=ctx.getImageData(0,0,width,height);
      // Outlines remain sourced from the untouched country-ID image.
      for(let p=0;p<width*height;p++){
        const i=p*4;
        if(source[i]===0 && source[i+1]===0 && source[i+2]===0 && source[i+3]===255){
          displayed.data[i]=0;displayed.data[i+1]=0;displayed.data[i+2]=0;
        }
      }
    }
    ctx.putImageData(displayed,0,0);
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
          terrainImage=await new Promise((resolve,reject)=>{
            const terrain=new Image();terrain.onload=()=>resolve(terrain);terrain.onerror=reject;
            terrain.src='img/cold-war-world-relief.png';
          });
        }catch(_){terrainView=false;document.getElementById('cold-war-view-toggle').disabled=true;}
        renderDisplay();
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
    document.getElementById('cold-war-view-toggle').addEventListener('click',()=>{
      if(!original || !terrainImage)return;
      clear();terrainView=!terrainView;renderDisplay();
      const button=document.getElementById('cold-war-view-toggle');
      button.textContent=terrainView?'Political colors':'Terrain';
      button.setAttribute('aria-label',terrainView?'Show political colors':'Show terrain');
    });
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
