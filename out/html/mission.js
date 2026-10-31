/* Anatolian Dawn: read-only mission summaries, reusing existing action state. */
(function(root){'use strict';
const n=(v)=>Number.isFinite(Number(v))?Number(v):0;
function levels(Q){
  const adopted=n(Q.land_reform)===3,progress=Math.max(0,Math.min(7,n(Q.koykent_progress))),funding=Math.max(0,Math.min(3,n(Q.yatirimm)));
  return {
    'Köykent Programme':!adopted?'Not Adopted':progress>=7?'Implemented':'Adopted',
    'Rural Concentration':progress>0?'Initiated':'Not Started',
    'Nationwide Expansion':n(Q.spreadd)>0?'Under Construction':'Not Started',
    'Köykent Funding':['Not Funded','Initial Funding','Expanded Funding','Fully Funded'][funding],
    'Local Industries':n(Q.koykenttt)>0?'Promoted':'Not Promoted',
    'Educational Opportunities':n(Q.koykentegitimm)>0?'Expanded':'Not Expanded'
  };
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function html(Q){
  const l=levels(Q),progress=Math.max(0,Math.min(7,n(Q.koykent_progress))),section=(title,fields)=>
    '<h3>'+escape(title)+'</h3>'+fields.map(k=>'<p>'+escape(k)+': '+escape(l[k])+'</p>').join('');
  return '<h2>Köykent Mission</h2>'+section('Policy and Planning',['Köykent Programme','Rural Concentration'])+
    section('Infrastructure and Investment',['Nationwide Expansion','Köykent Funding'])+
    section('Economic and Social Development',['Local Industries','Educational Opportunities'])+
    '<p>Implementation Progress: '+progress+' / 7</p>'+
    '<p><small>Implementation milestones are distinct from the long-term socioeconomic maturation of Köykent settlements.</small></p>';
}
const api={levels,html};root.AnatolianMission=api;
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
