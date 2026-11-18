(function () {
  'use strict';
  let lighting, grid, outlines, cachedWidth=0,cachedHeight=0;
  // Same camera fit used to reproject the texture and heightmap.
  const camera=[-.3094103493438249,1.140392782715497,.0014731136752282041,1743.0073649127287,1419.418613913839,1416.0282656985542,4.74177463922032];
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function globePath(ctx,w,h){
    const mask=window.ColdWarGlobeMask,rows=mask.rows;
    const sx=w/(mask.bounds[2]-mask.bounds[0]+1),sy=h/rows.length;
    ctx.beginPath();
    rows.forEach((row,i)=>{const x=row[0]*sx,y=i*sy;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
    for(let i=rows.length-1;i>=0;i--)ctx.lineTo((rows[i][1]+1)*sx,(i+1)*sy);
    ctx.closePath();
  }
  function project(lon,lat,w,h){
    const [lon0,lat0,roll,scale,cx,cy,d]=camera,dl=lon-lon0;
    const x=Math.cos(lat)*Math.sin(dl);
    const y=Math.cos(lat0)*Math.sin(lat)-Math.sin(lat0)*Math.cos(lat)*Math.cos(dl);
    const z=Math.sin(lat0)*Math.sin(lat)+Math.cos(lat0)*Math.cos(lat)*Math.cos(dl);
    if(z<1/d)return null;
    const factor=(d-1)/(d-z);
    return [(cx+scale*factor*(x*Math.cos(roll)-y*Math.sin(roll)))*w/2828,(cy-scale*factor*(x*Math.sin(roll)+y*Math.cos(roll)))*h/2825];
  }
  function build(w,h,source){
    lighting=canvas(w,h);const light=lighting.getContext('2d');
    light.save();globePath(light,w,h);light.clip();
    // Brighter upper-left daylight, fading into a deep navy lower-right terminator.
    // All lighting remains clipped to the globe; country colors and hit tests are untouched.
    const key=light.createRadialGradient(w*.23,h*.20,0,w*.30,h*.28,w*.76);
    key.addColorStop(0,'rgba(231,244,255,.54)');key.addColorStop(.25,'rgba(201,229,255,.38)');key.addColorStop(.60,'rgba(162,208,247,.12)');key.addColorStop(1,'rgba(162,208,247,0)');
    light.fillStyle=key;light.fillRect(0,0,w,h);
    const shade=light.createLinearGradient(w*.16,h*.12,w*.91,h*.95);
    shade.addColorStop(0,'rgba(6,16,40,0)');shade.addColorStop(.28,'rgba(6,16,40,.01)');shade.addColorStop(.46,'rgba(6,16,40,.12)');shade.addColorStop(.68,'rgba(6,16,40,.38)');shade.addColorStop(.88,'rgba(6,16,40,.62)');shade.addColorStop(1,'rgba(6,16,40,.76)');
    light.fillStyle=shade;light.fillRect(0,0,w,h);
    const limb=light.createRadialGradient(w*.45,h*.42,w*.22,w*.5,h*.5,w*.71);
    limb.addColorStop(0,'rgba(7,20,46,0)');limb.addColorStop(.58,'rgba(7,20,46,.02)');limb.addColorStop(.82,'rgba(7,20,46,.14)');limb.addColorStop(1,'rgba(7,20,46,.32)');
    light.fillStyle=limb;light.fillRect(0,0,w,h);
    light.restore();
    outlines=canvas(w,h);const outlineCtx=outlines.getContext('2d');
    const stroke=canvas(w,h),strokeCtx=stroke.getContext('2d'),frame=strokeCtx.createImageData(w,h);
    for(let i=0;i<source.data.length;i+=4){
      if(source.data[i]===0&&source.data[i+1]===0&&source.data[i+2]===0&&source.data[i+3]===255){frame.data[i]=84;frame.data[i+1]=152;frame.data[i+2]=216;frame.data[i+3]=255;}
    }
    strokeCtx.putImageData(frame,0,0);outlineCtx.shadowColor='rgba(84,152,216,.22)';outlineCtx.shadowBlur=5;outlineCtx.drawImage(stroke,0,0);
    grid=canvas(w,h);const lines=grid.getContext('2d');
    lines.save();globePath(lines,w,h);lines.clip();lines.strokeStyle='#5498d8';lines.globalAlpha=.12;lines.shadowColor='rgba(84,152,216,.7)';lines.shadowBlur=14;lines.lineWidth=1.6;lines.lineCap='round';
    const rad=Math.PI/180;
    function curve(coordinates){
      lines.beginPath();let started=false;
      for(const [lon,lat] of coordinates){const point=project(lon*rad,lat*rad,w,h);if(!point){started=false;continue;}if(!started){lines.moveTo(...point);started=true;}else lines.lineTo(...point);}
      lines.stroke();
    }
    for(let lon=-180;lon<180;lon+=15){const points=[];for(let lat=-90;lat<=90;lat+=.5)points.push([lon,lat]);curve(points);}
    for(let lat=-75;lat<=75;lat+=15){const points=[];for(let lon=-180;lon<=180;lon+=.5)points.push([lon,lat]);curve(points);}
    lines.restore();cachedWidth=w;cachedHeight=h;
  }
  function apply(ctx,w,h,source){
    if(cachedWidth!==w||cachedHeight!==h)build(w,h,source);
    ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=1;ctx.filter='none';
    ctx.drawImage(lighting,0,0);ctx.drawImage(outlines,0,0);ctx.drawImage(grid,0,0);ctx.restore();
  }
  window.ColdWarPresentation={apply};
}());
