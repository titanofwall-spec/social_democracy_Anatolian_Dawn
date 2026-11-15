(function(){
  'use strict';
  const ns='http://www.w3.org/2000/svg',D=2828,H=2825;
  function element(name,attrs){const e=document.createElementNS(ns,name);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));return e;}
  const wipes=[];
  let progress=0,targetProgress=0,animation=null;
  function updateWipes(){
    const feather=.12,boundary=1+feather-progress*(1+2*feather);
    wipes.forEach(({gradient,vertical,length})=>{
      gradient.setAttribute(vertical?'y1':'x1',(boundary-feather)*length);
      gradient.setAttribute(vertical?'y2':'x2',(boundary+feather)*length);
    });
  }
  function animateTo(target){
    if(target===targetProgress)return;
    if(animation!==null)cancelAnimationFrame(animation);
    targetProgress=target;
    const from=progress,start=performance.now(),duration=Math.max(1,650*Math.abs(target-from));
    function tick(now){
      const t=Math.min(1,(now-start)/duration),eased=t*t*(3-2*t);
      progress=from+(target-from)*eased;updateWipes();
      animation=t<1?requestAnimationFrame(tick):null;
    }
    animation=requestAnimationFrame(tick);
  }
  function image(file,x,y,width,ratio,rotation,fadeId=null){
    const group=element('g',{transform:`translate(${x*D} ${y*D}) rotate(${rotation})`});
    const imageWidth=width*D,imageHeight=imageWidth*ratio;
    if(fadeId){
      const defs=element('defs');
      const vertical=file==='cold-war-american-eagle.png';
      const gradient=element('linearGradient',{id:fadeId+'-gradient',gradientUnits:'userSpaceOnUse',x1:vertical?0:imageWidth*.70,y1:vertical?imageHeight*.70:0,x2:vertical?0:imageWidth,y2:vertical?imageHeight:0});
      gradient.append(element('stop',{offset:0,'stop-color':'white','stop-opacity':1}),element('stop',{offset:1,'stop-color':'white','stop-opacity':0}));
      const mask=element('mask',{id:fadeId,maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0,width:imageWidth,height:imageHeight,style:'mask-type:alpha'});
      mask.append(element('rect',{x:0,y:0,width:imageWidth,height:imageHeight,fill:'url(#'+fadeId+'-gradient)'}));
      defs.append(gradient,mask);group.append(defs);
    }
    const picture=element('image',{href:'img/'+file,x:0,y:0,width:imageWidth,height:imageHeight,preserveAspectRatio:'xMinYMin meet'});
    if(fadeId)picture.setAttribute('mask','url(#'+fadeId+')');
    // A second, independent mask sweeps across the permanent edge fade.
    const motionId=fadeId+'-motion',vertical=file==='cold-war-american-eagle.png';
    const defs=element('defs'),gradient=element('linearGradient',{id:motionId+'-gradient',gradientUnits:'userSpaceOnUse',x1:0,y1:0,x2:vertical?0:imageWidth,y2:vertical?imageHeight:0});
    gradient.append(element('stop',{offset:0,'stop-color':'white','stop-opacity':1}),element('stop',{offset:1,'stop-color':'white','stop-opacity':0}));
    const motion=element('mask',{id:motionId,maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0,width:imageWidth,height:imageHeight,style:'mask-type:alpha'});
    motion.append(element('rect',{x:0,y:0,width:imageWidth,height:imageHeight,fill:'url(#'+motionId+'-gradient)'}));
    defs.append(gradient,motion);group.append(defs);
    const animated=element('g',{mask:'url(#'+motionId+')'});animated.append(picture);group.append(animated);
    wipes.push({gradient,vertical,length:vertical?imageHeight:imageWidth});updateWipes();return group;
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
      if(!outside)svg.append(image('cold-war-american-eagle.png',-.12,-.02,.43,1200/910,-8,'cold-war-eagle-fade'));
      const clipped=element('g',{'clip-path':`url(#${outside?'cold-war-art-inverse':'cold-war-art-globe'})`});
      clipped.append(image('cold-war-soviet-future.png',.37,.03,.54,563/797,7,outside?'cold-war-soviet-fade-outside':'cold-war-soviet-fade-inside'));svg.append(clipped);host.append(svg);
    }
  }
  let returnTimer=null;
  function hide(){
    clearTimeout(returnTimer);returnTimer=null;
    animateTo(1);
  }
  function release(){
    if(returnTimer!==null)return;
    returnTimer=setTimeout(()=>{
      returnTimer=null;animateTo(0);
    },3000);
  }
  function reset(){clearTimeout(returnTimer);returnTimer=null;if(animation!==null)cancelAnimationFrame(animation);animation=null;progress=targetProgress=0;updateWipes();}
  window.ColdWarDecorations={hide,release,reset};
  document.addEventListener('DOMContentLoaded',setup);
}());

