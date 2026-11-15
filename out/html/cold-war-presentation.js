(function () {
  'use strict';
  let lighting, grid, cachedWidth=0,cachedHeight=0;
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
  function build(w,h){
    lighting=canvas(w,h);const light=lighting.getContext('2d');
    light.save();globePath(light,w,h);light.clip();
    // Wide key light rather than a spotlight; dark side remains cool navy.
    const key=light.createRadialGradient(w*.23,h*.18,0,w*.29,h*.25,w*.96);
    key.addColorStop(0,'rgba(218,236,255,0.13)');key.addColorStop(.45,'rgba(168,207,243,0.055)');key.addColorStop(1,'rgba(168,207,243,0)');
    light.fillStyle=key;light.fillRect(0,0,w,h);
    const shade=light.createLinearGradient(w*.17,h*.1,w*.93,h*.96);
    shade.addColorStop(0,'rgba(9,21,48,0)');shade.addColorStop(.40,'rgba(9,21,48,0.015)');shade.addColorStop(.72,'rgba(9,21,48,0.095)');shade.addColorStop(1,'rgba(9,21,48,0.23)');
    light.fillStyle=shade;light.fillRect(0,0,w,h);
    light.restore();
    grid=canvas(w,h);const lines=grid.getContext('2d');
    lines.save();globePath(lines,w,h);lines.clip();lines.strokeStyle='#5498d8';lines.globalAlpha=.23;lines.lineWidth=1.6;lines.lineCap='round';
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
  function apply(ctx,w,h){
    if(cachedWidth!==w||cachedHeight!==h)build(w,h);
    ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=1;ctx.filter='none';
    ctx.drawImage(lighting,0,0);ctx.drawImage(grid,0,0);ctx.restore();
  }
  window.ColdWarPresentation={apply};
}());
