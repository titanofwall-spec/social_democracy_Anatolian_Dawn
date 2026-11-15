(function(){
  'use strict';
  const ns='http://www.w3.org/2000/svg',D=2828,H=2825;
  function element(name,attrs){const e=document.createElementNS(ns,name);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));return e;}
  function image(file,x,y,width,ratio,rotation,trimEnd=false){
    const group=element('g',{transform:`translate(${x*D} ${y*D}) rotate(${rotation})`});
    if(trimEnd){
      const defs=element('defs'),clip=element('clipPath',{id:'cold-war-soviet-leading-part',clipPathUnits:'userSpaceOnUse'});
      clip.append(element('rect',{x:0,y:0,width:width*D*.70,height:width*D*ratio}));defs.append(clip);group.append(defs);
    }
    const picture=element('image',{href:'img/'+file,x:0,y:0,width:width*D,height:width*D*ratio,preserveAspectRatio:'xMinYMin meet'});
    if(trimEnd)picture.setAttribute('clip-path','url(#cold-war-soviet-leading-part)');
    group.append(picture);return group;
  }
  function globePath(){
    const mask=window.ColdWarGlobeMask,sx=D/(mask.bounds[2]-mask.bounds[0]+1),sy=H/mask.rows.length;
    let path='';mask.rows.forEach((row,i)=>{path+=(i?'L':'M')+(row[0]*sx)+' '+(i*sy)+' ';});
    for(let i=mask.rows.length-1;i>=0;i--)path+='L'+((mask.rows[i][1]+1)*sx)+' '+((i+1)*sy)+' ';
    return path+'Z';
  }
  function setup(){
    const host=document.querySelector('.cold-war-globe');if(!host||host.querySelector('.cold-war-art'))return;
    const path=globePath();
    for(const outside of [false,true]){
      const svg=element('svg',{viewBox:`0 0 ${D} ${H}`,'aria-hidden':'true',focusable:'false',class:'cold-war-art '+(outside?'cold-war-art-outside':'cold-war-art-inside')});
      const defs=element('defs'),clip=element('clipPath',{id:outside?'cold-war-art-inverse':'cold-war-art-globe',clipPathUnits:'userSpaceOnUse'});
      clip.append(element('path',{d:outside?`M${-3*D} ${-3*D}H${4*D}V${4*D}H${-3*D}Z `+path:path,'clip-rule':outside?'evenodd':'nonzero','fill-rule':outside?'evenodd':'nonzero'}));
      defs.append(clip);svg.append(defs);
      if(!outside)svg.append(image('cold-war-american-eagle.png',-.12,-.02,.43,1200/910,-8));
      const clipped=element('g',{'clip-path':`url(#${outside?'cold-war-art-inverse':'cold-war-art-globe'})`});
      clipped.append(image('cold-war-soviet-future.png',.47,.03,.54,563/797,7,outside));svg.append(clipped);host.append(svg);
    }
  }
  let returnTimer=null;
  function hide(){
    clearTimeout(returnTimer);returnTimer=null;
    document.querySelector('.cold-war-globe')?.classList.add('cold-war-art-hidden');
  }
  function release(){
    if(returnTimer!==null)return;
    returnTimer=setTimeout(()=>{
      returnTimer=null;document.querySelector('.cold-war-globe')?.classList.remove('cold-war-art-hidden');
    },3000);
  }
  function reset(){clearTimeout(returnTimer);returnTimer=null;document.querySelector('.cold-war-globe')?.classList.remove('cold-war-art-hidden');}
  window.ColdWarDecorations={hide,release,reset};
  document.addEventListener('DOMContentLoaded',setup);
}());
