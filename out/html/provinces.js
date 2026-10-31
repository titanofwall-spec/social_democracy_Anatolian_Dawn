/* Provincial population, demographic and election model. */
(function(root){
'use strict';
const D=root.AnatolianProvinceData;if(!D)return;
const R=root.AnatolianRules,classes=D.classes,rows=D.provinces,byId=Object.fromEntries(rows.map(p=>[p.id,p]));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sum=o=>{let total=0;for(const k of Object.keys(o))total+=n(o[k]);return total;},copy=o=>JSON.parse(JSON.stringify(o));
const norm=o=>{const t=sum(o),out={};for(const k of Object.keys(o))out[k]=t?n(o[k])/t:0;return out;};
const date=Q=>clamp(n(Q.year,1972)+(n(Q.month,1)-1+(n(Q.week,1)-1)/2)/12,1970,1981);
function nationalPopulation(y){y=clamp(y,1970,1981);if(y>1980)return Math.round(D.nationalPopulation[1980]+(y-1980)*(D.nationalPopulation[1980]-D.nationalPopulation[1979]));const a=Math.floor(y),b=Math.min(a+1,1980);return Math.round(D.nationalPopulation[a]+(D.nationalPopulation[b]-D.nationalPopulation[a])*(y-a));}
function distribute(values,total){const keys=Object.keys(values),t=sum(values)||1,out={},remainders=[];let used=0;for(const k of keys){const v=values[k]/t*total;out[k]=Math.floor(v);used+=out[k];remainders.push([k,v-out[k]]);}remainders.sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])));for(let i=0;i<total-used;i++)out[remainders[i%remainders.length][0]]++;return out;}
let populationYear,populationCache;
function populations(y,Q){const state=Q&&Q.dynamic_demographic_state;if(state&&state.provinces&&state.year===Math.floor(y)&&root.AnatolianDynamicDemographics){return root.AnatolianDynamicDemographics.populations(Q);}if(y===populationYear)return {...populationCache};const result=calculatePopulations(y);populationYear=y;populationCache=result;return {...result};}
function calculatePopulations(y){const a=y<=1975?1970:1975,b=a+5,t=clamp((y-a)/5,0,1.2);return distribute(Object.fromEntries(rows.map(p=>[p.id,p.population[a]+(p.population[b]-p.population[a])*t])),nationalPopulation(y));}
// Each province/class owns its preferences. National class fields are derived
// compatibility outputs; changes made by existing policies are broadcast once.
const startingCache=new WeakMap();
function startingPreferences(row,c){let cached=startingCache.get(row);if(!cached){cached={};startingCache.set(row,cached);}if(!cached[c])cached[c]=calculateStartingPreferences(row,c);return {...cached[c]};}
function calculateStartingPreferences(row,c){const v=norm(row.classPreferences[c]),other=n(v.other),out={...v};delete out.other;const tbp=other*(c==='alevis'?.85:.005),mp=Math.min(.0069,other*.7/4.3,other-tbp);out.TBP=tbp;out.MP=mp;out[c==='kurds'?'KI':'IND']=Math.max(0,other-tbp-mp);return norm(out);}
function active(Q){return Q.province_model_version===1&&Q.province_model_enabled!==0&&Q.province_cell_model_version===2&&Q.classes.length===7;}
function ensure(Q){if(!Q.started||!Array.isArray(Q.parties)||!Q.parties.includes('TBP'))return;
 if(Q.province_cell_model_version!==2){Q.province_model_version=1;Q.province_model_enabled=1;Q.province_cell_model_version=2;Q.province_pools=Object.fromEntries(rows.map(p=>[p.id,{demographics:copy(p.demographics),preferences:Object.fromEntries(classes.map(c=>[c,startingPreferences(p,c)]))}]));Q.province_election_history=Q.province_election_history||[];Q.province_initial_parliament=Q.province_initial_parliament||Object.fromEntries(Q.parties.map(k=>[k,n(Q[k+'_seats'])]));delete Q.province_aggregate_mirror;for(const k of ['province_class_drivers','province_last_class_weights','province_preference_baseline','province_tendency_version','province_party_roster','old_demographics'])delete Q[k];}
 if(!Q.province_independent_factors)Q.province_independent_factors=Object.fromEntries(rows.map(p=>[p.id,.5+Math.random()/6]));sync(Q);migrateHistory(Q);if(root.AnatolianNationalCoalition)root.AnatolianNationalCoalition.ensure(Q);
}
// Regional affinity weights gains toward strongholds. As a coalition expands beyond its
// supplied starting support, further gains deepen local support before spreading into rival territory.
// The weighted target remains unchanged; no province-win limit or starting-vote rewrite is applied.
function shiftClass(Q,c,party,delta){
 // Preserve the original model's region-specific electoral affinities.
 // Later ballot balancing, not uncontrolled growth, enforces universal ceilings.
 if(!delta)return;
 const pop=populations(date(Q),Q),cells=rows.map(p=>({v:Q.province_pools[p.id].preferences[c],w:pop[p.id]*demographics(Q,p.id)[c]}));
 const weight=cells.reduce((a,x)=>a+x.w,0)||1;
 const base=cells.reduce((a,x)=>a+x.w*n(x.v[party]),0)/weight;
 const target=clamp(base+delta,0,1);
 const initial=rows.reduce((a,p)=>a+pop[p.id]*demographics(Q,p.id)[c]*n(startingPreferences(p,c)[party]),0)/weight;
 const expansion=Math.max(0,base-initial);
 const concentration=clamp(1.5+8*expansion+200*Math.pow(Math.max(0,expansion-.15),2),1.5,8);
 for(const cell of cells){
  cell.p=clamp(n(cell.v[party]),.000001,.999999);
  cell.affinity=delta>0?clamp(Math.pow(cell.p/Math.max(.000001,base),concentration),.02,6):clamp(Math.sqrt(Math.max(.000001,base)/cell.p),.3,3);
 }
 const share=(cell,k)=>{const odds=Math.pow(k,cell.affinity);return cell.p*odds/(1-cell.p+cell.p*odds);};
 let lo=.000000001,hi=1000000000;
 for(let i=0;i<36;i++){
  const mid=Math.sqrt(lo*hi),average=cells.reduce((a,x)=>a+x.w*share(x,mid),0)/weight;
  if(average<target)lo=mid;else hi=mid;
 }
 const factor=Math.sqrt(lo*hi);
 for(const cell of cells){
  const v=cell.v,next=share(cell,factor),rest=Object.keys(v).filter(k=>k!==party);
  const restTotal=rest.reduce((a,k)=>a+n(v[k]),0);
  v[party]=next;
  for(const k of rest)v[k]=restTotal?n(v[k])*(1-next)/restTotal:0;
 }
}
function demographics(Q,id){return norm(Q.province_pools[id].demographics);}
function sync(Q){if(!active(Q))return;const prior=Q.province_aggregate_mirror;
 if(prior)for(const c of classes){const old=n(prior[c]),next=n(Q[c]);if(old>0&&Math.abs(next-old)>1e-8)for(const p of rows)Q.province_pools[p.id].demographics[c]*=Math.max(0,next/old);
 const changes=Q.parties.map(k=>({k,delta:n(Q[c+'_'+k])-n(prior[c+'_'+k])})).filter(x=>Math.abs(x.delta)>=1e-8&&R.partyAvailable(Q,x.k));if(changes.length){const before=Object.fromEntries(rows.map(p=>[p.id,n(Q.province_pools[p.id].preferences[c].chp)]));for(const {k,delta}of changes){shiftClass(Q,c,k,delta/100);}if(root.AnatolianNationalCoalition)for(const p of rows)root.AnatolianNationalCoalition.limitCell(Q,c,before[p.id],Q.province_pools[p.id].preferences[c]);}}


 const pop=populations(date(Q),Q),total=sum(pop),aggregate=Object.fromEntries(classes.map(c=>[c,0])),preferences=Object.fromEntries(classes.map(c=>[c,Object.fromEntries(Q.parties.map(k=>[k,0]))]));
 for(const p of rows){const m=demographics(Q,p.id);for(const c of classes){const count=pop[p.id]*m[c],v=Q.province_pools[p.id].preferences[c];aggregate[c]+=count;for(const k of Q.parties)preferences[c][k]+=count*n(v[k]);}}
 const mirror={};for(const c of classes){Q[c]=mirror[c]=100*aggregate[c]/total;for(const k of Q.parties){const field=c+'_'+k;Q[field]=mirror[field]=R.partyAvailable(Q,k)?100*preferences[c][k]/(aggregate[c]||1):0;}}
 Q.province_aggregate_mirror=mirror;Q.kurdish_population_weight=Q.kurds;Q.province_population_total=total;if(root.AnatolianNationalCoalition)root.AnatolianNationalCoalition.observe(Q);
}
function preferenceContext(Q){return {available:Object.fromEntries(Q.parties.map(k=>[k,R.partyAvailable(Q,k)])),kiAvailable:R.partyAvailable(Q,'KI'),conscious:R.consciousShares(Q),consciousness:clamp(n(Q.kurdish_issue_consciousness,.07),0,1),radicalism:clamp(n(Q.kurdish_issue_radicalism,.02),0,1),mpFactor:R.mpFactor(Q)};}
function classPreferences(Q,id,c,ordinaryOnly=false,context){const ctx=context||preferenceContext(Q),values=Q.province_pools[id].preferences[c],raw={};for(const k of Q.parties)raw[k]=ctx.available[k]?n(values[k]):0;if(Q.socialist_left_formed){const tip=n(raw.TIP);raw.TIP=tip*.20;for(const[k,v]of [['TKP',.25],['TSIP',.25],['TEP',.10],['SDP',.20]])raw[k]=n(raw[k])+tip*v;}const shares=norm(raw);if(c==='kurds'&&!ordinaryOnly){const C=ctx.consciousness,rad=ctx.radicalism;for(const k of Q.parties)shares[k]*=1-C;for(const[k,v]of Object.entries(ctx.conscious))shares[k]=n(shares[k])+C*(1-rad)*v/100;if(ctx.kiAvailable)shares.KI=n(shares.KI)+C*rad;}if(Object.prototype.hasOwnProperty.call(shares,'MP')){const old=n(shares.MP);shares.MP=Math.min(old,sum(shares)*.0069)*ctx.mpFactor;const lost=old-shares.MP;shares.AP=n(shares.AP)+lost/2;shares.MHP=n(shares.MHP)+lost/2;}return shares;}

function seatQuotas(y){const t=clamp((y-1973)/4,0,1);return distribute(Object.fromEntries(rows.map(p=>[p.id,p.elections[1973].seatsTotal+(p.elections[1977].seatsTotal-p.elections[1973].seatsTotal)*t])),450);}
function dhondt(votes,seats,eligible){const out=Object.fromEntries(Object.keys(votes).map(p=>[p,0]));let keys=Object.keys(votes).filter(p=>n(votes[p])>0&&(!eligible||eligible(p)));if(!keys.length)keys=Object.keys(votes).sort((a,b)=>votes[b]-votes[a]).slice(0,1);for(let i=0;i<seats&&keys.length;i++){let best=keys[0];for(let j=1;j<keys.length;j++){const k=keys[j],difference=votes[k]/(out[k]+1)-votes[best]/(out[best]+1);if(difference>0||(difference===0&&k.localeCompare(best)<0))best=k;}out[best]++;}return out;}
function roundProvinceVotes(prov,totals){
 const keys=Object.keys(totals),total=sum(totals),rowTargets=distribute(Object.fromEntries(prov.map(p=>[p.id,sum(p.votes)])),total),columns=Object.fromEntries(keys.map(k=>[k,prov.reduce((a,p)=>a+n(p.votes[k]),0)])),remaining={...totals},rowRemaining={},candidates=[];
 for(const p of prov){const out={};for(const k of keys){const value=columns[k]?n(p.votes[k])*totals[k]/columns[k]:0;out[k]=Math.floor(value);remaining[k]-=out[k];candidates.push({p,k,fraction:value-out[k]});}p.votes=out;rowRemaining[p.id]=rowTargets[p.id]-sum(out);if(rowRemaining[p.id]<0){for(const k of keys.slice().sort((a,b)=>out[b]-out[a])){const cut=Math.min(out[k],-rowRemaining[p.id]);out[k]-=cut;remaining[k]+=cut;rowRemaining[p.id]+=cut;if(!rowRemaining[p.id])break;}}}
 candidates.sort((a,b)=>b.fraction-a.fraction||a.p.id.localeCompare(b.p.id)||a.k.localeCompare(b.k));for(const {p,k}of candidates)if(rowRemaining[p.id]>0&&remaining[k]>0){p.votes[k]++;rowRemaining[p.id]--;remaining[k]--;}
 for(const p of prov)for(const k of keys){const amount=Math.min(rowRemaining[p.id],remaining[k]);if(amount>0){p.votes[k]+=amount;rowRemaining[p.id]-=amount;remaining[k]-=amount;}}for(const p of prov){p.totalVotes=sum(p.votes);p.shares=norm(p.votes);}
}
// ANATOLIAN_UNIVERSAL_BALANCE_V5
// Preserve provincial political geography when imposing the all-party ceilings.
// Constrained 2x2 province/party transfers preserve every province turnout and
// each nationwide party total. Avoid the older uniform nationwide averaging,
// which artificially flipped provincial winners.
const PROVINCE_ABSOLUTE_MAX=.849;
const PROVINCE_NATIONAL_EDGE_CAP=.848;
function applyProvincialVoteBalance(provinces,partyKeys){
 if(!provinces.length||!partyKeys.length)return;
 const national=Object.fromEntries(partyKeys.map(k=>[k,0]));
 let total=0;
 for(const p of provinces){const row=sum(p.votes);total+=row;for(const k of partyKeys)national[k]+=Math.max(0,n(p.votes[k]));}
 if(!(total>0))return;
 for(const k of partyKeys)national[k]/=total;
 const leader=partyKeys.reduce((best,k)=>national[k]>national[best]?k:best,partyKeys[0]);
 if(national[leader]>PROVINCE_NATIONAL_EDGE_CAP){
  // This national average cannot satisfy the maximum in every province.
  const fallback=partyKeys.filter(k=>k!==leader&&national[k]>0);
  const alternatives=fallback.length?fallback:partyKeys.filter(k=>k!==leader);
  if(!alternatives.length)return;
  const otherNation=alternatives.reduce((a,k)=>a+national[k],0);
  for(const p of provinces){const row=sum(p.votes);p.votes[leader]=row*PROVINCE_NATIONAL_EDGE_CAP;
   for(const k of partyKeys)if(k!==leader)p.votes[k]=row*(1-PROVINCE_NATIONAL_EDGE_CAP)*(otherNation>0?national[k]/otherNation:(k===alternatives[0]?1:0));}
  return;
 }
 const len=provinces.length;
 const row=provinces.map(p=>sum(p.votes));
 const cap={},floor={};
 for(const k of partyKeys){
  const a=national[k];
  cap[k]=Math.min(PROVINCE_ABSOLUTE_MAX,a+.15+.60*Math.max(0,.60-a))-.0005;
  floor[k]=a>=.15?.20*a:0;
 }
 const initialWinner=provinces.map(p=>partyKeys.reduce((best,k)=>n(p.votes[k])>n(p.votes[best])?k:best,partyKeys[0]));
 // Maximum transfer x in a province that retains the current first-place
 // party. A move raises k by direction*x and reduces j by the same amount.
 function winnerRoom(i,k,j,direction){
  const w=initialWinner[i],v=provinces[i].votes;
  let limit=Infinity;
  for(const other of partyKeys)if(other!==w){
   const dw=(w===k?direction:w===j?-direction:0);
   const dt=(other===k?direction:other===j?-direction:0);
   if(dw<dt)limit=Math.min(limit,Math.max(0,(n(v[w])-n(v[other]))/(dt-dw)));
  }
  return limit;
 }
 function swap(i,q,k,j,direction,amount){
  // In i, k changes by direction*x; in q it changes by -direction*x.
  const vi=provinces[i].votes,vq=provinces[q].votes;
  vi[k]+=direction*amount;vi[j]-=direction*amount;
  vq[k]-=direction*amount;vq[j]+=direction*amount;
 }
 // Iterate real vote-bound violations. Prefer changes that do not flip a
 // province's leader, but retain a second pass for unavoidable corrections.
 for(let pass=0;pass<32;pass++){
  let moved=0,largest=0;
  const wrong=[];
  for(let i=0;i<len;i++)if(row[i]>0)for(const k of partyKeys){
   const v=n(provinces[i].votes[k]);
   const lo=row[i]*floor[k],hi=row[i]*cap[k];
   const error=v>hi?v-hi:v<lo?lo-v:0;
   if(error>row[i]*1e-10){wrong.push({i,k,over:v>hi,need:error});largest=Math.max(largest,error/row[i]);}
  }
  if(!wrong.length)return;
  wrong.sort((a,b)=>b.need/row[b.i]-a.need/row[a.i]);
  for(const issue of wrong){
   const {i,k,over}=issue,vi=provinces[i].votes;
   const remaining=over?n(vi[k])-row[i]*cap[k]:row[i]*floor[k]-n(vi[k]);
   if(remaining<=row[i]*1e-10)continue;
   let best=null;
   for(let q=0;q<len;q++)if(q!==i&&row[q]>0){
    const vq=provinces[q].votes;
    const kCapacity=over?row[q]*cap[k]-n(vq[k]):n(vq[k])-row[q]*floor[k];
    if(kCapacity<=0)continue;
    for(const j of partyKeys)if(j!==k){
     const jCapacity=over?Math.min(n(vq[j])-row[q]*floor[j],row[i]*cap[j]-n(vi[j])):
      Math.min(n(vi[j])-row[i]*floor[j],row[q]*cap[j]-n(vq[j]));
     const available=Math.min(remaining,kCapacity,jCapacity);
     if(available<=row[i]*1e-11)continue;
     const direction=over?-1:1;
     const noFlip=Math.min(available,winnerRoom(i,k,j,direction),winnerRoom(q,k,j,-direction));
     const safe=noFlip>row[i]*1e-11;
     const amount=safe?noFlip:available;
     // Preserve historical winners before maximizing the amount transferred.
     if(!best||(safe&&!best.safe)||(safe===best.safe&&amount>best.amount))best={q,j,amount,safe,direction};
    }
   }
   if(best){swap(i,best.q,k,best.j,best.direction,best.amount);moved++;}
  }
  if(!moved)break;
 }
 // If the bounded swaps are insufficient, conservative global mixing
 // guarantees the legal ceiling/floor without inventing or losing votes.
 // This fallback is deliberately only for an otherwise unresolved case.
 let mix=0;
 for(let i=0;i<len;i++)if(row[i]>0)for(const k of partyKeys){
  const local=n(provinces[i].votes[k])/row[i],avg=national[k];
  if(local>cap[k]&&local>avg)mix=Math.max(mix,(local-cap[k])/(local-avg));
  if(local<floor[k]&&local<avg)mix=Math.max(mix,(floor[k]-local)/(avg-local));
 }
 if(mix>0){mix=clamp(mix+1e-9,0,1);for(let i=0;i<len;i++)for(const k of partyKeys)
  provinces[i].votes[k]=(1-mix)*n(provinces[i].votes[k])+mix*row[i]*national[k];}
}
function compute(Q,polling=true,independentFactors,kind='general',includeTemporary=true,totalsOnly=false){
 R.ensureKurdishIssue(Q);const context=preferenceContext(Q),y=date(Q),pop=populations(y,Q),t=clamp((y-1973)/4,0,1),prov=[],votes=Object.fromEntries(Q.parties.map(p=>[p,0])),classVotes=Object.fromEntries(classes.map(c=>[c,Object.fromEntries(Q.parties.map(p=>[p,0]))]));let transfer=0;
 for(const p of rows){const m=demographics(Q,p.id),turnoutA=p.elections[1973].total/(p.population[1970]+(p.population[1975]-p.population[1970])*.6),turnoutB=p.elections[1977].total/(p.population[1975]+(p.population[1980]-p.population[1975])*.4),valid=pop[p.id]*(turnoutA+(turnoutB-turnoutA)*t),pv=Object.fromEntries(Q.parties.map(k=>[k,0])),perClass={};
  for(const c of classes){const cv=classPreferences(Q,p.id,c,false,context);perClass[c]=cv;for(const k of Q.parties){const count=valid*m[c]*n(cv[k]);pv[k]+=count;classVotes[c][k]+=count;}}
  prov.push({id:p.id,name:p.name,population:pop[p.id],demographics:m,demographicCounts:distribute(m,pop[p.id]),classVoteCounts:Object.fromEntries(classes.map(c=>[c,valid*m[c]])),votes:pv,totalVotes:0,shares:{},seats:{},classPreferences:perClass});
 }
 if(includeTemporary&&root.AnatolianNationalCoalition)root.AnatolianNationalCoalition.applyTemporary(Q,prov,classVotes);
 const nc=root.AnatolianNationalCoalition,endorsement=nc&&kind!=='local'?nc.endorsementFactor(Q,prov):null;
 for(const p of prov){let pv=p.votes;if(!polling&&Q.socialist_left_formed)for(const k of ['TKP','TSIP','TEP','SDP']){pv.TIP+=n(pv[k]);pv[k]=0;}
  if(!polling&&kind!=='local'&&nc){if(endorsement!==null){const moved=n(pv.TIP)*endorsement;pv.TIP-=moved;pv.chp+=moved;transfer+=moved;}else transfer+=nc.tactical(Q,pv);}
  if(!polling&&Q.TIP_banned){const v=pv.TIP;if(!Q.socialist_left_formed&&Q.disk_endorsement&&(!nc||kind==='local')){pv.chp+=v/2;transfer+=v/2;}pv.TIP=0;}p.votes=pv;
 }
 applyProvincialVoteBalance(prov,Q.parties);
 const roundTargets=distribute(Object.fromEntries(Q.parties.map(k=>[k,prov.reduce((a,p)=>a+n(p.votes[k]),0)])),Math.round(prov.reduce((a,p)=>a+sum(p.votes),0)));if(totalsOnly)return {votes:roundTargets,fractions:norm(roundTargets),totalVotes:sum(roundTargets),totalPopulation:sum(pop),transfer};roundProvinceVotes(prov,roundTargets);for(const p of prov)for(const k of Q.parties)votes[k]+=p.votes[k];
 const fractions=norm(votes),quota=seatQuotas(y),seats=Object.fromEntries(Q.parties.map(k=>[k,0])),electionVotes={};
 for(const p of prov){const v={...p.votes};if(polling&&Q.socialist_left_formed)for(const k of ['TKP','TSIP','TEP','SDP']){v.TIP+=n(v[k]);v[k]=0;}if(polling&&Q.TIP_banned)v.TIP=0;p.electionVotes=v;for(const k of Q.parties)electionVotes[k]=n(electionVotes[k])+n(v[k]);}
 const ef=norm(electionVotes);for(const p of prov){const adjusted={...p.electionVotes};p.independentFactor=n((independentFactors||Q.province_independent_factors)[p.id],.583333333333);if(adjusted.IND)adjusted.IND*=p.independentFactor;p.seats=dhondt(adjusted,quota[p.id],k=>!Q[k+'_banned']&&(!Q.constitutional_reform||n(ef[k])*100>=n(Q.electoral_threshold)));for(const k of Q.parties)seats[k]+=n(p.seats[k]);const candidates=kind==='local'?{...p.electionVotes}:p.votes;if(kind==='local'){for(const k of ['IND','KI'])if(candidates[k])candidates[k]*=p.independentFactor;p.localCandidateVotes=candidates;}p.winner=Object.keys(candidates).sort((a,b)=>candidates[b]-candidates[a]||a.localeCompare(b))[0];}
 const classShares={};for(const c of classes){const shares=norm(classVotes[c]);for(const k of Q.parties)classShares[c+'_'+k]=100*n(shares[k]);}
 return {provinces:prov,votes,fractions,seats,classShares,support:votes,transfer,totalPopulation:sum(pop),totalVotes:sum(votes),year:Q.year,month:Q.month,week:Q.week,kind:'poll',electionKind:kind,votingModel:D.votingModel,minorSplitEstimated:true};
}
// Same ballot totals and rounding, without district sorting, map data or seat allocation.
function pollingTotals(Q,includeTemporary=true,polling=true){return compute(Q,polling,undefined,'general',includeTemporary,true);}
function projectVotes(Q,polling){return compute(Q,!!polling);}
function applyElection(Q,kind){if(!active(Q))return;const key=kind+':'+Q.year+':'+Q.month+':'+Q.week;const existing=Q.province_election_history.find(s=>s.key===key);const snap=existing?copy(existing):compute(Q,false,Object.fromEntries(rows.map(p=>[p.id,.5+Math.random()/6])),kind);snap.key=key;snap.kind=kind;snap.socialistLeftFormed=!!Q.socialist_left_formed;snap.partyNames=Object.fromEntries(Q.parties.map(k=>[k,label(Q,k)]));snap.partyKeys=Q.parties.slice();if(kind==='local'){const lastGeneral=Q.province_election_history.filter(s=>s.kind==='general').slice(-1)[0];snap.parliamentSeats=copy(lastGeneral?.seats||Q.province_initial_parliament);snap.municipalities=Object.fromEntries(Q.parties.map(k=>[k,0]));for(const p of snap.provinces)snap.municipalities[p.winner]++;for(const k of Q.parties){Q[k+'_local_seats']=snap.municipalities[k];Q[k+'_local_votes']=100*n(snap.fractions[k]);Q[k+'_local_votes_disp']=(100*n(snap.fractions[k])).toFixed(1);}Q.local_total_seats=67;const sorted=Q.parties.slice().sort((a,b)=>snap.municipalities[b]-snap.municipalities[a]||snap.votes[b]-snap.votes[a]);Q.local_largest_party_key=sorted[0];Q.local_second_party_key=sorted[1];}
 else{for(const k of Q.parties){Q[k+'_seats']=snap.seats[k];Q[k+'_r']=100*n(snap.fractions[k]);}Q.total_seats=450;Q.largest_party_key=Q.parties.slice().sort((a,b)=>snap.votes[b]-snap.votes[a])[0];}if(!existing){Q.province_election_history.push(copy(snap));if(root.AnatolianNationalCoalition)root.AnatolianNationalCoalition.election(Q,snap);}}
function migrateHistory(Q){
 if(Q.province_history_migrating)return;Q.province_history_migrating=1;
 try{
 const records=(Q.election_records||[]).map(r=>{const d=new Date(r.date);return {kind:'general',year:d.getFullYear(),month:d.getMonth()+1,week:1,shares:r};});
 if(Q.last_local_election_year)records.push({kind:'local',year:Q.last_local_election_year,month:Q.last_local_election_month||12,week:Q.last_local_election_week||1,shares:Object.fromEntries(Q.parties.map(k=>[k,n(Q[k+'_local_votes'],n(Q[k+'_local_support']))]))});
 for(const record of records){if(!Number.isFinite(record.year)||Q.province_election_history.some(s=>s.kind===record.kind&&s.year===record.year&&s.month===record.month))continue;
 const shares=norm(Object.fromEntries(Object.entries(record.shares).filter(([k,v])=>k!=='date'&&Number.isFinite(Number(v))&&Number(v)>=0)));if(!sum(shares))continue;
 const historical=copy(Q);Object.assign(historical,{year:record.year,month:record.month,week:record.week,province_history_migrating:1});
 const snap=compute(historical,true),total=snap.totalVotes,keys=Object.keys(shares),targets=distribute(shares,total);
 // Scale each saved party column exactly; no claim that pre-map saves contained district votes.
 for(const k of keys){const values=Object.fromEntries(snap.provinces.map(p=>[p.id,n(p.votes[k],1)+.000001])),column=distribute(values,targets[k]);for(const p of snap.provinces)p.votes[k]=column[p.id];}
 snap.votes=targets;snap.fractions=shares;snap.seats=Object.fromEntries(keys.map(k=>[k,0]));snap.partyKeys=keys;snap.partyNames=Object.fromEntries(keys.map(k=>[k,label(historical,k)]));snap.socialistLeftFormed=record.year>=1975&&!!Q.socialist_left_formed_last_election;
 const quota=seatQuotas(date(historical));for(const p of snap.provinces){p.votes=Object.fromEntries(keys.map(k=>[k,n(p.votes[k])]));p.totalVotes=sum(p.votes);p.shares=norm(p.votes);p.winner=keys.slice().sort((a,b)=>p.votes[b]-p.votes[a])[0];const adjusted={...p.votes};if(adjusted.IND)adjusted.IND*=p.independentFactor;p.seats=dhondt(adjusted,quota[p.id]);for(const k of keys)snap.seats[k]+=p.seats[k];}
 if(record.kind==='general'&&record===records.filter(r=>r.kind==='general').slice(-1)[0]&&sum(Q.province_initial_parliament)===450){snap.seats=copy(Q.province_initial_parliament);snap.legacyNationalSeatsPreserved=true;}
 if(record.kind==='local'){snap.municipalities=Object.fromEntries(keys.map(k=>[k,n(Q[k+'_local_seats'])]));snap.parliamentSeats=copy(Q.province_initial_parliament);}
 Object.assign(snap,{key:record.kind+':'+record.year+':'+record.month+':'+record.week,kind:record.kind,year:record.year,month:record.month,week:record.week,legacyReconstruction:true});Q.province_election_history.push(snap);
 }
 }finally{delete Q.province_history_migrating;}
}
function addPollingPoints(Q,points){ensure(Q);const coalition=root.AnatolianNationalCoalition,beforeCells=coalition?copy(Q.province_pools):null,coalitionState=coalition?copy(Q.national_coalition):null,beforeMirror=coalition?copy(Q.province_aggregate_mirror):null;const before=pollingTotals(Q).fractions.chp,target=clamp(before+points/100,0,1),original=copy(Q.province_pools);function set(f){for(const p of rows)for(const c of classes){const v=copy(original[p.id].preferences[c]);v.chp=n(v.chp)*f;Q.province_pools[p.id].preferences[c]=norm(v);}delete Q.province_aggregate_mirror;sync(Q);}let lo=.000001,hi=1000000;for(let i=0;i<40;i++){const mid=Math.sqrt(lo*hi);set(mid);if(pollingTotals(Q).fractions.chp<target)lo=mid;else hi=mid;}set(Math.sqrt(lo*hi));if(coalition){Q.national_coalition=coalitionState;for(const p of rows)for(const c of classes)coalition.limitCell(Q,c,n(beforeCells[p.id].preferences[c].chp),Q.province_pools[p.id].preferences[c],n(beforeMirror[c+'_chp'])/100);delete Q.province_aggregate_mirror;sync(Q);}R.refreshPolls(Q);}
const colors={other:'#808080',chp:'#E3000F',AP:'#750a6f',CGP:'#5b7387',DP:'#4a4d04',MSP:'#054521',MHP:'#954B00',TIP:'#8B0000',TKP:'#820b09',TSIP:'#abab1a',TEP:'#ad673b',SDP:'#a83a32',TBP:'#c51b32',MP:'#242018',IND:'#808080',KI:'#c2d93f'};
const provinceOtherParties=['MP','TBP','IND','KI'];
function reportingVotes(votes,national,socialistFormed){const keys=national?R.otherPollParties:provinceOtherParties,result={...votes};if(socialistFormed)for(const k of ['TKP','TSIP','TEP','SDP']){result.TIP=n(result.TIP)+n(result[k]);delete result[k];}result.other=0;for(const k of keys){result.other+=n(result[k]);delete result[k];}return result;}
function label(Q,p){return ({chp:'CHP',TIP:'TİP',TSIP:'TSİP',CGP:Q.CGP_name||'MGP',MSP:Q.MSP_name||'MNP',IND:'Independents',KI:'Kurdish Independents',other:'Other'})[p]||p;}
root.AnatolianProvinces={balanceProvincialVotes:applyProvincialVoteBalance,ensure,active,sync,shiftClass,compute,pollingTotals,addPollingPoints,projectVotes,applyElection,populations,nationalPopulation,demographics,seatQuotas,dhondt,label,colors,reportingVotes,provinceOtherParties,classPreferences,startingPreferences,data:D};
if(typeof module!=='undefined')module.exports=root.AnatolianProvinces;
})(globalThis);

