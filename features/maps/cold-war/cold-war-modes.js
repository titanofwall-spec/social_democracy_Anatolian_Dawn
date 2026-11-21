(function () {
  'use strict';
  const colors={nato:'#385DAF',warsaw:'#A92E2E',american:'#5B7DC5',soviet:'#CA4949',neutral:'#777777'};
  const nato=new Set(['United Kingdom','France','Portugal','Belgium','Netherlands','Luxembourg','West Germany','Denmark','Norway','Iceland','Italy','Greece','Turkey','United States','Canada']);
  const warsaw=new Set(['Soviet Union','East Germany','Poland','Czechoslovakia','Hungary','Romania','Bulgaria']);
  const western=new Set(['Spain','Israel','Saudi Arabia','Jordan','Kuwait','Oman','Bahrain','Qatar','United Arab Emirates','Turkish Cyprus','Guatemala','Honduras','El Salvador','Costa Rica','Dominican Republic','Colombia','Venezuela','Brazil','Morocco','Tunisia','Liberia','Zaire','Kenya']);
  const eastern=new Set(['Cuba','Mongolia','Syria','South Yemen','People’s Republic of the Congo']);
  const dependencies={Greenland:'Denmark','Puerto Rico':'United States','French Guiana':'France'};
  // Half-month boundaries match Q.week: 1 = first half, 2 = second half.
  const stamp=(year,month,half=1)=>year*24+(month-1)*2+(half-1);
  function qualities(){return window.dendryUI?.dendryEngine?.state?.qualities||{};}
  function countryIdImage(q=qualities()){
    // Status 3 represents military division in current and legacy saves.
    const divided=q.cyprus_problem==null
      ? q.cyprus_final_result==='Historical Division'
      : Number(q.cyprus_problem)===3;
    return divided?'img/cold-war-country-ids-detailed-post-cyprus.png?v=1':'img/cold-war-country-ids-detailed.png?v=2';
  }
  function date(){
    const q=qualities();
    const year=Number(q.year)||1972,month=Math.max(1,Math.min(12,Number(q.month)||1)),half=Number(q.week)===2?2:1;
    return {year,month,half,key:stamp(year,month,half)};
  }
  function classify(name,when){
    const t=when.key;name=dependencies[name]||name;
    if(nato.has(name))return 'nato';
    if(warsaw.has(name))return 'warsaw';
    if(name==='Egypt')return t<stamp(1972,7,2)?'soviet':t>=stamp(1979,3,2)?'american':'neutral';
    if(name==='Ethiopia')return t<stamp(1974,9)?'american':t>=stamp(1977,5)?'soviet':'neutral';
    if(name==='Somalia')return t<stamp(1977,11,2)?'soviet':t>=stamp(1980,8,2)?'american':'neutral';
    if(name==='Iran')return t<stamp(1979,2)?'american':'neutral';
    if(name==='Nicaragua')return t<stamp(1979,7,2)?'american':t>=stamp(1980,5,2)?'soviet':'neutral';
    if(name==='Afghanistan')return t>=stamp(1978,12)?'soviet':'neutral';
    if(name==='Iraq')return t>=stamp(1972,4)&&t<stamp(1980,9,2)?'soviet':'neutral';
    if(name==='Jamaica')return t>=stamp(1980,11)?'american':'neutral';
    if(name==='Pakistan')return t>=stamp(1979,4)&&t<stamp(1980,1)?'neutral':'american';
    if(name==='British Honduras (Belize)')return t<stamp(1981,9,2)?'american':'neutral';
    if(name==='Cape Verde'||name==='Portuguese Guinea'){
      const independence=name==='Cape Verde'?stamp(1975,7):stamp(1974,9,2);
      return t<independence?'american':'neutral';
    }
    if(name==='French Territory of the Afars and Issas')return t<stamp(1977,6,2)?'american':'neutral';
    if(western.has(name))return 'american';
    if(eastern.has(name))return 'soviet';
    // Non-alignment, socialism, aid or arms purchases alone do not assign a bloc.
    return 'neutral';
  }
  function color(name,mode,when){
    const category=classify(name,when);
    if(mode==='allegiance' && category!=='nato'&&category!=='warsaw')return colors.neutral;
    return colors[category];
  }
  function overlay(source,mode,when,insideGlobe){
    const {width:w,height:h}=source,c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d'),frame=ctx.createImageData(w,h),lookup=new Map();
    window.ColdWarCountries.forEach(entry=>{
      const rgb=color(entry.name,mode,when);lookup.set(parseInt(entry.hex,16),parseInt(rgb.slice(1),16));
    });
    for(let p=0;p<w*h;p++){
      const i=p*4;if(source.data[i+3]!==255||!insideGlobe(p%w,Math.floor(p/w)))continue;
      const id=(source.data[i]<<16)|(source.data[i+1]<<8)|source.data[i+2],rgb=lookup.get(id);
      if(rgb===undefined)continue;
      frame.data[i]=rgb>>16;frame.data[i+1]=(rgb>>8)&255;frame.data[i+2]=rgb&255;frame.data[i+3]=255;
    }
    ctx.putImageData(frame,0,0);return c;
  }
  window.ColdWarModes={date,countryIdImage,classify,color,overlay};
}());

