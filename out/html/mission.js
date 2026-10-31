/* Anatolian Dawn: read-only Köykent mission and agricultural economy status. */
(function(root){'use strict';
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const cap=(v,limit)=>Math.max(0,Math.min(limit,Math.floor(n(v))));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function levels(Q){
  const adopted=n(Q.land_reform)===3,progress=cap(Q.koykent_progress,7),funding=cap(Q.yatirimm,3);
  const land=cap(Q.landreform_done,6),formation=cap(Q.cooperative_done,3),umbrella=cap(Q.ps_umbrella_expansions,4),bank=cap(Q.ps_bank_funding,4);
  return {
    'Köykent Programme':!adopted?'Not Adopted':progress>=7?'Implemented':'Adopted',
    'Rural Concentration':!adopted?'Not Available':progress>0?'Initiated':land<3?'Awaiting Three Completed Land Distributions':'Ready to Begin',
    'Nationwide Expansion':n(Q.spreadd)>0?'Under Construction':'Not Started',
    'Köykent Funding':['Not Funded','Initial Funding','Expanded Funding','Fully Funded'][funding],
    'Local Industries':n(Q.koykenttt)>0?'Promoted':'Not Promoted',
    'Educational Opportunities':n(Q.koykentegitimm)>0?'Expanded':'Not Expanded',
    'Distribution of Land':land>=6?'Completion of Distribution':land>=4?'Significant Progress':land>=2?'Distribution of Largest Monopolies':'Severely Unequal',
    'Cooperative Formation':['Marginal','Increasing','Significant','Deeply Engrained'][formation],
    'Cooperative Umbrella Organizations':umbrella>=4?'Region Wide':umbrella>=2?'Large Scale':Q.cooperative_umbrella_established?'Emerging':'Decentralized',
    'Cooperative Credit':bank>=4?'Cooperative Bank Domination':bank>=2?'Cooperative Bank Significance':Q.cooperative_bank_founded?'Emerging Credit Options':'Unreliable Credit Options'
  };
}
function html(Q){
  const l=levels(Q),progress=cap(Q.koykent_progress,7),land=cap(Q.landreform_done,6),section=(title,fields)=>
    '<h3>'+escape(title)+'</h3>'+fields.map(k=>'<p>'+escape(k)+': '+escape(l[k])+'</p>').join('');
  const pending=cap(Q.land_distribution_pending_stage,6),now=n(Q.year)*24+(n(Q.month)-1)*2+(n(Q.week)===2?1:0);
  const remaining=pending?Math.max(0,Math.ceil((n(Q.land_distribution_due_tick)-now)/2)):0;
  return '<h2>Köykent Mission</h2>'+section('Policy and Planning',['Köykent Programme','Rural Concentration'])+
    section('Infrastructure and Investment',['Nationwide Expansion','Köykent Funding'])+
    section('Economic and Social Development',['Local Industries','Educational Opportunities'])+
    '<p>Implementation Progress: '+progress+' / 7</p>'+
    '<p><small>Implementation milestones are distinct from the long-term socioeconomic maturation of Köykent settlements.</small></p>'+
    '<h2>Agricultural Economy</h2>'+section('Distribution of Land',['Distribution of Land'])+
    '<p>Completed distributions: '+land+' / 6</p>'+
    (pending?'<p>Distribution '+pending+' in progress; approximately '+remaining+' month(s) remaining until benefits and next stage.</p>':'')+
    '<h3>Co-operativization of the Economy</h3>'+
    '<p>Formation: '+escape(l['Cooperative Formation'])+'</p>'+
    '<p>Umbrella Organizations: '+escape(l['Cooperative Umbrella Organizations'])+'</p>'+
    '<p>Credit: '+escape(l['Cooperative Credit'])+'</p>';
}
const api={levels,html};root.AnatolianMission=api;
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
