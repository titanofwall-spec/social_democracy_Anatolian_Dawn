(function(root){'use strict';
const P=root.AnatolianProvinces||(typeof require==='function'?require('./provinces.js'):null),D=root.AnatolianSenateData||(typeof require==='function'?require('./data/senate-data.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x)),sum=x=>Object.values(x).reduce((a,b)=>a+b,0),stamp=Q=>Q.year*10000+Q.month*100+(Q.week===2?16:1);
// 1981 is the continued constitutional schedule in the game's alternate timeline.
const schedule=[{year:1973,month:10,week:2,group:'C'},{year:1975,month:10,week:2,group:'A'},{year:1977,month:6,week:1,group:'B'},{year:1979,month:10,week:2,group:'C'},{year:1981,month:6,week:1,group:'A'}];
const deaths={'İsmet İnönü':19731225,'Cevdet Sunay':19820522,'Fahri Korutürk':19871012,'Faruk Gürler':19750823,'Tekin Arıburun':19930812};
const appointed='Chosen by the President, they were elected for a six-year term from among individuals who had rendered significant service to society, held a university degree, and had reached the age of 40. At least ten of these members were required to be chosen from among independents. Should a vacancy arise for any reason, the person elected to fill the seat would serve out the remainder of the term of the member they replaced. These senators formed a group within the Senate, electing one of their own as their leader and operating as a collective unit.';
const mbk='The National Unity Committee is a military junta consisting of thirty-eight members of the Turkish Armed Forces, which seized political power by overthrowing the Democrat Party government in a coup on May 27, 1960, and was subsequently led by General Cemal Gürsel, the Commander of the Turkish Land Forces.';
function initial(){return {version:2,provinces:Object.fromEntries(D.provinces.map(p=>[p.id,copy(p.initial)])),completed:[],deathEvents:[],president1973:null};}
function state(Q){return Q.senate_state||initial();}
function totals(Q){const result={};for(const seats of Object.values(state(Q).provinces))for(const [k,v]of Object.entries(seats))result[k]=(result[k]||0)+v;return result;}
function ensure(Q){if(Q.senate_state){const s=Q.senate_state;if(s.version<2){for(const p of D.provinces){if(!s.completed.some(id=>id.endsWith(':'+p.group)))s.provinces[p.id]=copy(p.initial);}s.version=2;}return s;}Q.senate_state=initial();P.ensure(Q);return Q.senate_state;}
function recordPresident(Q){const s=ensure(Q);s.president1973=Q.president;}
function update(Q){const s=ensure(Q);if(!s.president1973&&stamp(Q)>=19730416)s.president1973=Q.president;}
function former(Q){const now=stamp(Q),winner=state(Q).president1973||Q.president,result=[];
 if(now>=19721120&&now<deaths['İsmet İnönü'])result.push({name:'İsmet İnönü',entry:'20 November 1972'});
 if(now>=19730328&&now<deaths['Cevdet Sunay']&&!(winner==='Cevdet Sunay'&&now<19800406))result.push({name:'Cevdet Sunay',entry:'28 March 1973'});
 if(now>=19800406&&winner&&winner!=='Cevdet Sunay'&&deaths[winner]&&now<deaths[winner])result.push({name:winner,entry:'6 April 1980'});
 return result;
}
const key=e=>'senate:'+e.year+':'+e.group;
function due(Q){const s=state(Q);return schedule.find(e=>Q.year===e.year&&(Q.month>e.month||(Q.month===e.month&&Q.week>=e.week))&&!s.completed.includes(key(e)))||null;}
function elect(Q,e=due(Q)){
 if(!e)return null;const s=ensure(Q),id=key(e),existing=(Q.province_election_history||[]).find(x=>x.key===id);if(existing)return existing;
 // Senate returns never write lower-house votes, seats, or general election dates.
 const atElection={...copy(Q),year:e.year,month:e.month,week:e.week},snap=P.compute(atElection,false),provinces=snap.provinces.filter(p=>D.provinces.some(d=>d.id===p.id&&d.group===e.group));
 snap.partyKeys=Object.keys(snap.votes);const votes=Object.fromEntries(snap.partyKeys.map(k=>[k,0])),seats={...votes};
 for(const p of provinces){const config=D.provinces.find(d=>d.id===p.id),adjusted={...p.electionVotes};if(adjusted.IND)adjusted.IND*=p.independentFactor;p.seats=P.dhondt(adjusted,config.seats);s.provinces[p.id]=copy(p.seats);for(const k of snap.partyKeys){votes[k]+=p.votes[k]||0;seats[k]+=p.seats[k]||0;}}
 Object.assign(snap,{key:id,kind:'senate',group:e.group,year:e.year,month:e.month,week:e.week,provinces,votes,seats,totalVotes:sum(votes),totalPopulation:provinces.reduce((a,p)=>a+p.population,0),socialistLeftFormed:!!Q.socialist_left_formed,partyNames:Object.fromEntries(snap.partyKeys.map(k=>[k,P.label(Q,k)])),senateComposition:totals(Q)});
 snap.fractions=Object.fromEntries(Object.entries(votes).map(([k,v])=>[k,v/(snap.totalVotes||1)]));
 Q.province_election_history.push(copy(snap));if(!s.completed.includes(id))s.completed.push(id);return snap;
}
function pendingDeath(Q){const s=state(Q),now=stamp(Q),winner=s.president1973||Q.president;return ['İsmet İnönü','Cevdet Sunay',winner].filter((n,i,a)=>n&&a.indexOf(n)===i).find(n=>deaths[n]&&now>=deaths[n]&&!s.deathEvents.includes(n))||null;}
function acknowledgeDeath(Q){const n=pendingDeath(Q);if(n)ensure(Q).deathEvents.push(n);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(label,body)=>'<span class="mytooltip" tabindex="0">'+label+'<span class="mytooltiptext">'+body+'</span></span>';
function html(Q){const names=former(Q),t=totals(Q),rows=Object.keys(t).filter(k=>t[k]>0).sort((a,b)=>t[b]-t[a]||a.localeCompare(b)).map(k=>{const name=P.label(Q,k),label=root.formatPartyLabel?root.formatPartyLabel(escape(name)):'<b style="color:'+(P.colors[k]||'#808080')+'">'+escape(name)+'</b>';return label+' '+t[k];}).join(', ');return '<p>'+tip('Appointed',appointed)+': 15</p><p>Permanent: '+tip('<b style="color:#5b7387">MBK</b>',mbk)+' 18, '+tip('Ex Presidents',names.map(n=>escape(n.name)+' ('+n.entry+')').join('<br>'))+' '+names.length+'</p><p>Elected: '+rows+'</p>';}
root.AnatolianSenate={schedule,data:D,deaths,initial,ensure,update,recordPresident,totals,former,due,elect,pendingDeath,acknowledgeDeath,html};if(typeof module!=='undefined')module.exports=root.AnatolianSenate;
})(globalThis);


