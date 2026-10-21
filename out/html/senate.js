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
 Object.assign(snap,{key:id,kind:'senate',group:e.group,year:e.year,month:e.month,week:e.week,provinces,votes,seats,totalVotes:sum(votes),totalPopulation:provinces.reduce((a,p)=>a+p.population,0),socialistLeftFormed:!!Q.socialist_left_formed,partyNames:Object.fromEntries(snap.partyKeys.map(k=>[k,P.label(Q,k)])),senateComposition:totals(Q),senatePermanent:{mbk:18,former:former(atElection)},senateAppointed:15});
 snap.fractions=Object.fromEntries(Object.entries(votes).map(([k,v])=>[k,v/(snap.totalVotes||1)]));
 Q.province_election_history.push(copy(snap));if(!s.completed.includes(id))s.completed.push(id);return snap;
}
function pendingDeath(Q){const s=state(Q),now=stamp(Q),winner=s.president1973||Q.president;return ['İsmet İnönü','Cevdet Sunay',winner].filter((n,i,a)=>n&&a.indexOf(n)===i).find(n=>deaths[n]&&now>=deaths[n]&&!s.deathEvents.includes(n))||null;}
function acknowledgeDeath(Q){const n=pendingDeath(Q);if(n)ensure(Q).deathEvents.push(n);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tip=(label,body)=>'<span class="wide_tooltip-wrap" tabindex="0">'+label+'<span class="wide_tooltip-tip">'+body+'</span></span>';
function html(Q){const names=former(Q),t=totals(Q),rows=Object.keys(t).filter(k=>t[k]>0).sort((a,b)=>['IND','KI'].includes(a)?(['IND','KI'].includes(b)?a.localeCompare(b):1):['IND','KI'].includes(b)?-1:t[b]-t[a]||a.localeCompare(b)).map(k=>{const name=['IND','KI'].includes(k)?'Ind':P.label(Q,k),label=['IND','KI'].includes(k)?'<b style="color:'+P.colors[k]+'">Ind</b>':root.formatPartyLabel?root.formatPartyLabel(escape(name)):'<b style="color:'+(P.colors[k]||'#808080')+'">'+escape(name)+'</b>';return label+' '+t[k];}).join(', ');return '<p>'+tip('Appointed',appointed)+': 15</p><p>Permanent: '+tip('<b style="color:#5b7387">MBK</b>',mbk)+' 18, '+tip('Ex Presidents',names.map(n=>escape(n.name)+' ('+n.entry+')').join('<br>'))+' '+names.length+'</p><p>Elected: '+rows+'</p>';}
function assemblyHtml(Q){const ordered=['AP','TIP','CGP','DP','TBP','MP','MHP','MSP','TKP','TSIP','TEP','SDP'],label=k=>'<b style="color:'+(P.colors[k]||'#808080')+'">'+escape(['IND','KI'].includes(k)?'Ind':P.label(Q,k))+'</b>: '+(Q[k+'_seats']||0),others=ordered.slice();for(const k of (Q.parties||[]))if(k!=='chp'&&!ordered.includes(k)&&!['IND','KI'].includes(k))others.push(k);others.push('IND');if(Q.kurdish_independents_unlocked||Q.Amnesty)others.push('KI');return '<p>National Assembly compositions (seats):</p><p>'+label('chp')+'</p><p>'+others.map(label).join(' ')+'</p><p>Majority required: '+(Q.majority_threshold||226)+' seats</p>';}
function nextElectionHtml(Q){const s=state(Q),e=schedule.find(e=>!s.completed.includes(key(e))&&(e.year>Q.year||(e.year===Q.year&&(e.month>Q.month||e.month===Q.month))));return e?['January','February','March','April','May','June','July','August','September','October','November','December'][e.month-1]+' '+e.year+' (Week '+e.week+', Group '+e.group+')':'None scheduled';}
// Separate permanent and appointed blocks flank the 150-seat elected semicircle.
function chamberHtml(Q,snapshot){const seats=snapshot?.senateComposition||totals(Q),at=snapshot?{...Q,year:snapshot.year,month:snapshot.month,week:snapshot.week}:Q,permanent=snapshot?.senatePermanent||{mbk:18,former:former(at)},appointed=snapshot?.senateAppointed??15,positions=[];
for(const [row,total]of [19,22,24,26,28,31].entries())for(let i=0;i<total;i++){const angle=Math.PI-i*Math.PI/(total-1),radius=170+30*row;positions.push({x:450+radius*Math.cos(angle),y:370-radius*Math.sin(angle),angle,row});}
positions.sort((a,b)=>b.angle-a.angle||b.row-a.row);let index=0;
const dot=(x,y,color,title,group,party='')=>'<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="10.5" fill="'+color+'" data-senate-group="'+group+'" data-party="'+party+'"><title>'+escape(title)+'</title></circle>';
let out='<g class="senate-elected">';for(const [party,total]of Object.entries(seats).filter(([k,v])=>v>0).sort((a,b)=>(a[0]==='chp'?1:b[0]==='chp'?-1:0)||b[1]-a[1]||a[0].localeCompare(b[0]))){for(let i=0;i<total&&index<positions.length;i++){const pos=positions[index++];out+=dot(pos.x,pos.y,P.colors[party]||'#808080',P.label(at,party)+' · Elected','elected',party);}}out+='</g><g class="senate-permanent">';
const permanentSeats=Array.from({length:permanent.mbk},()=>({color:P.colors.CGP,title:'MBK · Permanent',party:'MBK'})).concat(permanent.former.map(p=>({color:'#ff0000',title:p.name+' · Former President',party:'former-president'})));
permanentSeats.forEach((seat,i)=>{const column=Math.floor(i/10),row=i%10;out+=dot(28+column*28,118+row*28,seat.color,seat.title,'permanent',seat.party);});out+='</g><g class="senate-appointed">';for(let i=0;i<appointed;i++){const column=Math.floor(i/10),row=i%10;out+=dot(872-column*28,118+row*28,'#00bcd4','Appointed senator','appointed');}out+='</g><g fill="currentColor" text-anchor="middle" font-family="inherit"><text x="450" y="310" font-size="18">REPUBLICAN</text><text x="450" y="336" font-size="18">SENATE</text><text x="55" y="420" font-size="15">Permanent</text><text x="450" y="420" font-size="15">150 Elected</text><text x="845" y="420" font-size="15">Appointed</text></g>';return out;}
function renderChamber(svg,Q,snapshot){svg.setAttribute('viewBox','0 0 900 440');svg.setAttribute('role','img');svg.setAttribute('aria-label','Republican Senate: 150 elected senators, 15 appointed senators and permanent members');svg.style.width='100%';svg.style.maxWidth='900px';svg.style.height='auto';svg.style.color='var(--text-color)';svg.innerHTML=chamberHtml(Q,snapshot);}
root.AnatolianSenate={assemblyHtml,nextElectionHtml,schedule,data:D,deaths,initial,ensure,update,recordPresident,totals,former,due,elect,pendingDeath,acknowledgeDeath,html,chamberHtml,renderChamber};if(typeof module!=='undefined')module.exports=root.AnatolianSenate;
})(globalThis);


