/* Provincial population, demographic and election model. */
(function(root){
'use strict';
const D=root.AnatolianProvinceData;if(!D)return;
const R=root.AnatolianRules,classes=D.classes,rows=D.provinces,byId=Object.fromEntries(rows.map(p=>[p.id,p]));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sum=o=>Object.values(o).reduce((a,b)=>a+n(b),0),copy=o=>JSON.parse(JSON.stringify(o));
const norm=o=>{const t=sum(o);return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,t?n(v)/t:0]));};
const date=Q=>clamp(n(Q.year,1972)+(n(Q.month,1)-1+(n(Q.week,1)-1)/2)/12,1970,1980);
function nationalPopulation(y){y=clamp(y,1970,1980);const a=Math.floor(y),b=Math.min(a+1,1980);return Math.round(D.nationalPopulation[a]+(D.nationalPopulation[b]-D.nationalPopulation[a])*(y-a));}
function distribute(values,total){const keys=Object.keys(values),t=sum(values)||1,out={},remainders=[];let used=0;for(const k of keys){const v=values[k]/t*total;out[k]=Math.floor(v);used+=out[k];remainders.push([k,v-out[k]]);}remainders.sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])));for(let i=0;i<total-used;i++)out[remainders[i%remainders.length][0]]++;return out;}
function populations(y){const a=y<=1975?1970:1975,b=a+5,t=clamp((y-a)/5,0,1);return distribute(Object.fromEntries(rows.map(p=>[p.id,p.population[a]+(p.population[b]-p.population[a])*t])),nationalPopulation(y));}
function prefs(Q){return Object.fromEntries(classes.map(c=>{const d=R.demographicShares(Q,c);return [c,c==='kurds'?norm(d.raw):Object.fromEntries(Object.entries(d.shares).map(([k,v])=>[k,v/100]))];}));}
function fixed(Q,m){const C=clamp(n(Q.kurdish_issue_consciousness,.2),0,1),rad=clamp(n(Q.kurdish_issue_radicalism,.25),0,1),result={};for(const [p,v]of Object.entries(R.consciousShares(Q)))result[p]=m.kurds*C*(1-rad)*v/100;if(R.partyAvailable(Q,'KI'))result.KI=m.kurds*C*rad;return result;}
function voteMix(Q,m,preferences,weights){const out=Object.fromEntries(Q.parties.map(p=>[p,0])),C=clamp(n(Q.kurdish_issue_consciousness,.2),0,1);for(const c of classes){const raw={};for(const p of Q.parties)raw[p]=n(preferences[c][p])*n(weights[p],1);const shares=norm(raw),free=m[c]*(c==='kurds'?1-C:1);for(const p of Q.parties)out[p]+=free*n(shares[p]);}for(const[p,v]of Object.entries(fixed(Q,m)))out[p]=n(out[p])+v;return out;}
function baselineTarget(Q,p,y){
 const source=D.preferenceTargets[p.id],groups=['TIP','chp','CGP','AP','DP','MSP','MHP','other'],desired=Object.fromEntries(groups.map(k=>[k,0]));
 for(const c of classes)for(const k of groups)desired[k]+=p.demographics[c]*n(source[c][k]);
 const floors=fixed(Q,p.demographics),floorGroups=Object.fromEntries(groups.map(k=>[k,0])),group=k=>groups.includes(k)?k:'other';for(const[k,v]of Object.entries(floors))floorGroups[group(k)]+=v;
 const reference=norm(desired);let low=0,high=1;for(let i=0;i<70;i++){const mid=(low+high)/2,total=groups.reduce((a,k)=>a+Math.max(floorGroups[k],reference[k]*mid),0);if(total>1)high=mid;else low=mid;}for(const k of groups)desired[k]=Math.max(floorGroups[k],reference[k]*(low+high)/2);
 const result=Object.fromEntries(Q.parties.map(k=>[k,groups.includes(k)?desired[k]:0]));const minor=Q.parties.filter(k=>group(k)==='other'),base=voteMix(Q,p.demographics,D.baselinePreferences,Object.fromEntries(Q.parties.map(k=>[k,1]))),scores=norm(Object.fromEntries(minor.map(k=>[k,Math.max(0,n(base[k])-n(floors[k]))]))),available=Math.max(0,desired.other-floorGroups.other);
 for(const k of minor)result[k]=n(floors[k])+available*n(scores[k]);return norm(R.mpVotes({...Q,year:1973,month:10,week:1},result));
}
function target(Q,p,y){
 const source=D.preferenceTargets[p.id],groups=['TIP','chp','CGP','AP','DP','MSP','MHP','other'],desired=Object.fromEntries(groups.map(k=>[k,0])),reference=p.elections[y];
 const remainderKeys=groups.filter(k=>!Object.prototype.hasOwnProperty.call(reference.votes,k)),appeal={};
 for(const k of remainderKeys)appeal[k]=classes.reduce((total,c)=>total+p.demographics[c]*n(source[c][k]),0);
 const split=norm(appeal);for(const k of groups)desired[k]=reference.votes[k]===undefined?reference.remainder/reference.total*n(split[k]):reference.votes[k]/reference.total;
 const floors=fixed(Q,p.demographics),floorGroups=Object.fromEntries(groups.map(k=>[k,0])),group=k=>groups.includes(k)?k:'other';for(const[k,v]of Object.entries(floors))floorGroups[group(k)]+=v;
 const referenceShares=norm(desired);let low=0,high=1;for(let i=0;i<70;i++){const mid=(low+high)/2,total=groups.reduce((a,k)=>a+Math.max(floorGroups[k],referenceShares[k]*mid),0);if(total>1)high=mid;else low=mid;}for(const k of groups)desired[k]=Math.max(floorGroups[k],referenceShares[k]*(low+high)/2);
 const result=Object.fromEntries(Q.parties.map(k=>[k,groups.includes(k)?desired[k]:0]));const minor=Q.parties.filter(k=>group(k)==='other'),base=voteMix(Q,p.demographics,D.baselinePreferences,Object.fromEntries(Q.parties.map(k=>[k,1]))),scores=norm(Object.fromEntries(minor.map(k=>[k,Math.max(0,n(base[k])-n(floors[k]))]))),available=Math.max(0,desired.other-floorGroups.other);
 for(const k of minor)result[k]=n(floors[k])+available*n(scores[k]);return norm(R.mpVotes({...Q,year:1973,month:10,week:1},result));
}
function fit(Q,p,y,preferences,desired=target(Q,p,y)){const weights=Object.fromEntries(Q.parties.map(k=>[k,1]));for(let i=0;i<160;i++){const got=norm(voteMix(Q,p.demographics,preferences,weights));let error=0;for(const k of Q.parties){error=Math.max(error,Math.abs(n(got[k])-n(desired[k])));if(n(got[k])>1e-10)weights[k]=clamp(weights[k]*n(desired[k])/got[k],1e-8,1e8);}if(error<1e-9)break;}return weights;}
function active(Q){return Q.province_model_version===1&&Q.province_model_enabled!==0&&Q.classes.length===7&&Q.parties.includes('TBP');}
function ensure(Q){if(!Q.started||!Array.isArray(Q.parties)||!Q.parties.includes('TBP'))return;
 if(Q.province_model_version!==1){delete Q.province_tendency_version;Q.province_model_version=1;Q.province_model_enabled=1;Q.province_pools={};Q.province_class_drivers=Object.fromEntries(classes.map(c=>[c,1]));Q.province_last_class_weights=Object.fromEntries(classes.map(c=>[c,n(Q[c])]));Q.province_election_history=[];Q.province_initial_parliament=Object.fromEntries(Q.parties.map(k=>[k,n(Q[k+'_seats'])]));for(const p of rows)Q.province_pools[p.id]={demographics:copy(p.demographics),preferenceWeights:{}};}
 if(Q.province_tendency_version!==4||Q.province_party_roster!==Q.parties.join(',')){const initial=copy(D.baselinePreferences||prefs(Q)),calibrationQ={...Q,kurdish_issue_consciousness:.2,kurdish_issue_radicalism:.25};Q.province_preference_baseline=copy(initial);for(const p of rows){const weights=fit(calibrationQ,p,1973,initial,baselineTarget(calibrationQ,p)),pool=Q.province_pools[p.id];pool.weights1973=weights;pool.weights1977=fit(calibrationQ,p,1977,initial);}Q.province_tendency_version=4;Q.province_party_roster=Q.parties.join(',');}
 if(!Q.province_independent_factors)Q.province_independent_factors=Object.fromEntries(rows.map(p=>[p.id,.5+Math.random()/6]));
 sync(Q);
 migrateHistory(Q);
}
function sync(Q){if(!active(Q))return;for(const c of classes){const last=n(Q.province_last_class_weights[c]);if(last>0&&Math.abs(n(Q[c])-last)>1e-6)Q.province_class_drivers[c]=Math.max(0,n(Q.province_class_drivers[c],1)*n(Q[c])/last);}const pop=populations(date(Q)),total=sum(pop),aggregate=Object.fromEntries(classes.map(c=>[c,0]));for(const p of rows){const m=demographics(Q,p.id);for(const c of classes)aggregate[c]+=pop[p.id]*m[c];}for(const c of classes){Q[c]=100*aggregate[c]/total;Q.province_last_class_weights[c]=Q[c];}Q.kurdish_population_weight=Q.kurds;Q.province_population_total=total;}
function demographics(Q,id){const pool=Q.province_pools[id];return norm(Object.fromEntries(classes.map(c=>[c,Math.max(0,n(pool.demographics[c]))*Math.max(0,n(Q.province_class_drivers[c],1))])));}
function seatQuotas(y){const t=clamp((y-1973)/4,0,1);return distribute(Object.fromEntries(rows.map(p=>[p.id,p.elections[1973].seatsTotal+(p.elections[1977].seatsTotal-p.elections[1973].seatsTotal)*t])),450);}
function dhondt(votes,seats,eligible){const out=Object.fromEntries(Object.keys(votes).map(p=>[p,0]));let keys=Object.keys(votes).filter(p=>n(votes[p])>0&&(!eligible||eligible(p)));if(!keys.length)keys=Object.keys(votes).sort((a,b)=>votes[b]-votes[a]).slice(0,1);for(let i=0;i<seats;i++){keys.sort((a,b)=>votes[b]/(out[b]+1)-votes[a]/(out[a]+1)||a.localeCompare(b));out[keys[0]]++;}return out;}
// Preserve voter pools and nationwide support while redistributing each party's free
// electorate toward its historical provincial strongholds. Fixed Kurdish pools remain fixed.
function regionalize(Q,cells,provinceRows,kind){
 const keys=Q.parties,raw=Object.fromEntries(keys.map(k=>[k,0])),locked=Object.fromEntries(keys.map(k=>[k,0]));
 for(const cell of cells)for(const k of keys){raw[k]+=cell.free[k]+cell.fixed[k];locked[k]+=cell.fixed[k];}
 const references=Object.fromEntries(provinceRows.map(row=>[row.id,{a:target(Q,byId[row.id],1973),b:target(Q,byId[row.id],1977),baseline:baselineTarget(Q,byId[row.id])}]));
 const total=sum(raw),strength=clamp((n(raw.chp)/(total||1)-.333)/(.4138-.333),0,1),nationalTarget={...raw};
 if(kind==='local'){
  // These are mayoral contests. Council votes are retained separately as a cross-check.
  const generalA=norm(Object.fromEntries(keys.map(k=>[k,rows.reduce((total,p)=>total+n(references[p.id].a[k])*p.elections[1973].total,0)]))),generalB=norm(Object.fromEntries(keys.map(k=>[k,rows.reduce((total,p)=>total+n(references[p.id].b[k])*p.elections[1977].total,0)]))),a=norm(D.localElections[1973].mayoralVotes),b=norm(D.localElections[1977].mayoralVotes),scores={};
  for(const k of keys){const ga=n(generalA[k]),gb=n(generalB[k]);const ratio=((1-strength)*n(a[k])+strength*n(b[k]))/Math.max(.0001,(1-strength)*ga+strength*gb);scores[k]=raw[k]*ratio;}
  // Removed parties and inactive socialist members are never reintroduced.
  let low=0,high=total/Math.max(1,sum(scores));for(let i=0;i<60;i++){const mid=(low+high)/2;if(keys.reduce((a,k)=>a+Math.max(locked[k],scores[k]*mid),0)>total)high=mid;else low=mid;}for(const k of keys)nationalTarget[k]=Math.max(locked[k],scores[k]*(low+high)/2);
 }
 const coefficients={};for(const row of provinceRows){const p=byId[row.id],base=references[p.id].baseline,historicalBase=references[p.id].a,top=references[p.id].b,h=Object.fromEntries(keys.map(k=>[k,(1-strength)*n(historicalBase[k])+strength*n(top[k])])),floor=fixed(Q,row.demographics);
  for(const y of [1973,1977]){const winner=D.localElections[y].winners[p.id],blend=y===1973?1-strength:strength;if(!keys.includes(winner))continue;if(kind==='local'){const largest=Math.max(...keys.filter(k=>k!==winner).map(k=>n(h[k])));h[winner]=Math.max(h[winner],largest*(1+1.6*blend));}else h[winner]*=1+.08*blend*strength;}
  const normalized=norm(h),national=D.historicalNational[1977];coefficients[p.id]=Object.fromEntries(keys.map(k=>{const affinity=Math.pow(Math.max(.000001,n(normalized[k])-n(floor[k]))/Math.max(.000001,n(base[k])-n(floor[k])),1.5),nationalShare=national.votes[k]===undefined?n(normalized[k]):national.votes[k]/national.total,concentration=Math.pow(Math.max(.001,n(normalized[k]))/Math.max(.001,nationalShare),strength*.75);return [k,affinity*concentration];}));
 }
 for(const cell of cells){cell.total=sum(cell.free);for(const k of keys)cell.free[k]=Math.max(1e-15,cell.free[k])*coefficients[cell.id][k];}
 const targets=Object.fromEntries(keys.map(k=>[k,Math.max(0,nationalTarget[k]-locked[k])]));
 // At the 1977 national benchmark, urban gains cannot spread without limit.
 // Higher-than-historical nationwide support still opens additional headroom.
 const overflow=clamp((n(nationalTarget.chp)/(total||1)-.4138)/(1-.4138),0,1),provinceCells=Object.fromEntries(provinceRows.map(p=>[p.id,cells.filter(c=>c.id===p.id)])),caps={};
 for(const p of provinceRows){const history=byId[p.id].elections,ceiling=Math.max(history[1973].votes.chp/history[1973].total,history[1977].votes.chp/history[1977].total),pc=provinceCells[p.id],eligible=pc.reduce((a,c)=>a+c.total+sum(c.fixed),0),minimum=pc.reduce((a,c)=>a+c.fixed.chp,0);caps[p.id]=Math.max(0,eligible*(ceiling+(1-ceiling)*overflow)-minimum);}
 for(let iteration=0;iteration<160;iteration++){
  const columns=Object.fromEntries(keys.map(k=>[k,0]));for(const cell of cells)for(const k of keys)columns[k]+=cell.free[k];
  for(const cell of cells)for(const k of keys)cell.free[k]*=columns[k]?targets[k]/columns[k]:0;
  for(const cell of cells){const size=sum(cell.free);if(size)for(const k of keys)cell.free[k]*=cell.total/size;}
  for(const id of Object.keys(provinceCells)){const pc=provinceCells[id],support=pc.reduce((a,c)=>a+c.free.chp,0);if(support>caps[id]+1e-8){const factor=caps[id]/support;for(const cell of pc){const loss=cell.free.chp*(1-factor),other=sum(cell.free)-cell.free.chp;cell.free.chp*=factor;if(other>0)for(const k of keys)if(k!=='chp')cell.free[k]+=loss*cell.free[k]/other;}}}
  if(iteration%10===9){const check=Object.fromEntries(keys.map(k=>[k,0]));for(const cell of cells)for(const k of keys)check[k]+=cell.free[k];if(keys.every(k=>Math.abs(check[k]-targets[k])<.001))break;}
 }
 // Remove the last floating-point fitting residual without changing a class pool
 // or exceeding any provincial CHP ceiling.
 const actual=Object.fromEntries(keys.map(k=>[k,0])),byProvince=Object.fromEntries(provinceRows.map(p=>[p.id,provinceCells[p.id].reduce((a,c)=>a+c.free.chp,0)]));for(const cell of cells)for(const k of keys)actual[k]+=cell.free[k];
 const delta=Object.fromEntries(keys.map(k=>[k,targets[k]-actual[k]]));
 for(const recipient of keys.filter(k=>delta[k]>.000001))for(const donor of keys.filter(k=>delta[k]<-.000001))for(const cell of cells){let amount=Math.min(delta[recipient],-delta[donor],cell.free[donor]);if(recipient==='chp')amount=Math.min(amount,Math.max(0,caps[cell.id]-byProvince[cell.id]));if(amount<=0)continue;cell.free[donor]-=amount;cell.free[recipient]+=amount;delta[recipient]-=amount;delta[donor]+=amount;if(recipient==='chp')byProvince[cell.id]+=amount;if(donor==='chp')byProvince[cell.id]-=amount;}
 return strength;
}
function roundProvinceVotes(prov,totals){
 const keys=Object.keys(totals),total=sum(totals),rowTargets=distribute(Object.fromEntries(prov.map(p=>[p.id,sum(p.votes)])),total),columns=Object.fromEntries(keys.map(k=>[k,prov.reduce((a,p)=>a+n(p.votes[k]),0)])),remaining={...totals},rowRemaining={},candidates=[];
 for(const p of prov){const out={};for(const k of keys){const value=columns[k]?n(p.votes[k])*totals[k]/columns[k]:0;out[k]=Math.floor(value);remaining[k]-=out[k];candidates.push({p,k,fraction:value-out[k]});}p.votes=out;rowRemaining[p.id]=rowTargets[p.id]-sum(out);if(rowRemaining[p.id]<0){for(const k of keys.slice().sort((a,b)=>out[b]-out[a])){const cut=Math.min(out[k],-rowRemaining[p.id]);out[k]-=cut;remaining[k]+=cut;rowRemaining[p.id]+=cut;if(!rowRemaining[p.id])break;}}}
 candidates.sort((a,b)=>b.fraction-a.fraction||a.p.id.localeCompare(b.p.id)||a.k.localeCompare(b.k));for(const {p,k}of candidates)if(rowRemaining[p.id]>0&&remaining[k]>0){p.votes[k]++;rowRemaining[p.id]--;remaining[k]--;}
 for(const p of prov)for(const k of keys){const amount=Math.min(rowRemaining[p.id],remaining[k]);if(amount>0){p.votes[k]+=amount;rowRemaining[p.id]-=amount;remaining[k]-=amount;}}for(const p of prov){p.totalVotes=sum(p.votes);p.shares=norm(p.votes);}
}
function compute(Q,polling=true,independentFactors,kind='general'){
 R.ensureKurdishIssue(Q);sync(Q);const y=date(Q),pop=populations(y),preferences=prefs(Q),t=clamp((y-1973)/4,0,1),prov=[],cells=[],votes=Object.fromEntries(Q.parties.map(p=>[p,0])),classVotes=Object.fromEntries(classes.map(c=>[c,Object.fromEntries(Q.parties.map(p=>[p,0]))]));let transfer=0;
 for(const p of rows){const pool=Q.province_pools[p.id],m=demographics(Q,p.id),weights={};for(const k of Q.parties)weights[k]=n(pool.weights1973[k],1)*Math.max(0,n(pool.preferenceWeights[k],1));
  const turnoutA=p.elections[1973].total/(p.population[1970]+(p.population[1975]-p.population[1970])*.6),turnoutB=p.elections[1977].total/(p.population[1975]+(p.population[1980]-p.population[1975])*.4),valid=pop[p.id]*(turnoutA+(turnoutB-turnoutA)*t);
  for(const c of classes){const only=Object.fromEntries(classes.map(k=>[k,k===c?1:0])),cv=R.mpVotes(Q,voteMix(Q,only,preferences,weights)),floors=c==='kurds'?fixed(Q,only):{},free={},locked={};for(const k of Q.parties){locked[k]=valid*m[c]*(k==='MP'&&kind!=='local'?n(cv[k]):n(floors[k]));free[k]=Math.max(0,valid*m[c]*n(cv[k])-locked[k]);}cells.push({id:p.id,c,free,fixed:locked});}
  prov.push({id:p.id,name:p.name,population:pop[p.id],demographics:m,demographicCounts:distribute(m,pop[p.id]),votes:Object.fromEntries(Q.parties.map(k=>[k,0])),totalVotes:0,shares:{},seats:{},preferenceWeights:weights});
 }
 const baseline=Object.fromEntries(prov.map(p=>[p.id,Object.fromEntries(Q.parties.map(k=>[k,0]))]));for(const cell of cells)for(const k of Q.parties)baseline[cell.id][k]+=cell.free[k]+cell.fixed[k];
 const baselineNational=Object.fromEntries(Q.parties.map(k=>[k,0]));for(const p of prov){const v=baseline[p.id];if(!polling&&Q.socialist_left_formed)for(const k of ['TKP','TSIP','TEP','SDP']){v.TIP+=n(v[k]);v[k]=0;}if(!polling&&Q.TIP_banned){if(Q.disk_endorsement)v.chp+=v.TIP/2;v.TIP=0;}const rounded=distribute(v,Math.round(sum(v)));for(const k of Q.parties)baselineNational[k]+=n(rounded[k]);}
 const strength=kind==='national-only'?0:regionalize(Q,cells,prov,kind),lookup=Object.fromEntries(prov.map(p=>[p.id,p]));
 for(const cell of cells)for(const k of Q.parties){const value=cell.free[k]+cell.fixed[k];lookup[cell.id].votes[k]+=value;classVotes[cell.c][k]+=value;}
 for(const p of prov){let pv=p.votes;if(!polling&&Q.socialist_left_formed)for(const k of ['TKP','TSIP','TEP','SDP']){pv.TIP+=n(pv[k]);pv[k]=0;}
  if(!polling&&Q.TIP_banned){const v=pv.TIP;if(Q.disk_endorsement){pv.chp+=v/2;transfer+=v/2;}pv.TIP=0;}p.votes=pv;
 }
 const roundTargets=kind==='local'?distribute(Object.fromEntries(Q.parties.map(k=>[k,prov.reduce((a,p)=>a+n(p.votes[k]),0)])),Math.round(prov.reduce((a,p)=>a+sum(p.votes),0))):baselineNational;roundProvinceVotes(prov,roundTargets);for(const p of prov)for(const k of Q.parties)votes[k]+=p.votes[k];
 const fractions=norm(votes),quota=seatQuotas(y),seats=Object.fromEntries(Q.parties.map(k=>[k,0])),electionVotes={};
 for(const p of prov){const v={...p.votes};if(polling&&Q.socialist_left_formed)for(const k of ['TKP','TSIP','TEP','SDP']){v.TIP+=n(v[k]);v[k]=0;}if(polling&&Q.TIP_banned){if(Q.disk_endorsement)v.chp+=v.TIP/2;v.TIP=0;}p.electionVotes=v;for(const k of Q.parties)electionVotes[k]=n(electionVotes[k])+n(v[k]);}
 const ef=norm(electionVotes);for(const p of prov){const adjusted={...p.electionVotes};p.independentFactor=n((independentFactors||Q.province_independent_factors)[p.id],.583333333333);if(adjusted.IND)adjusted.IND*=p.independentFactor;p.seats=dhondt(adjusted,quota[p.id],k=>!Q[k+'_banned']&&(!Q.constitutional_reform||n(ef[k])*100>=n(Q.electoral_threshold)));for(const k of Q.parties)seats[k]+=n(p.seats[k]);p.winner=Object.keys(p.votes).sort((a,b)=>p.votes[b]-p.votes[a])[0];}
 const classShares={};for(const c of classes){const shares=norm(classVotes[c]);for(const k of Q.parties)classShares[c+'_'+k]=100*n(shares[k]);}
 return {provinces:prov,votes,fractions,seats,classShares,support:votes,transfer,totalPopulation:sum(pop),totalVotes:sum(votes),year:Q.year,month:Q.month,week:Q.week,kind:'poll',electionKind:kind,regionalStrength:strength,minorSplitEstimated:true,localPreferenceEstimated:kind==='local'};
}
function projectVotes(Q,polling){return compute(Q,!!polling);}
function applyElection(Q,kind){if(!active(Q))return;const key=kind+':'+Q.year+':'+Q.month+':'+Q.week;const existing=Q.province_election_history.find(s=>s.key===key);const snap=existing?copy(existing):compute(Q,false,Object.fromEntries(rows.map(p=>[p.id,.5+Math.random()/6])),kind);snap.key=key;snap.kind=kind;snap.socialistLeftFormed=!!Q.socialist_left_formed;snap.partyNames=Object.fromEntries(Q.parties.map(k=>[k,label(Q,k)]));snap.partyKeys=Q.parties.slice();if(kind==='local'){const lastGeneral=Q.province_election_history.filter(s=>s.kind==='general').slice(-1)[0];snap.parliamentSeats=copy(lastGeneral?.seats||Q.province_initial_parliament);snap.municipalities=Object.fromEntries(Q.parties.map(k=>[k,0]));for(const p of snap.provinces)snap.municipalities[p.winner]++;for(const k of Q.parties){Q[k+'_local_seats']=snap.municipalities[k];Q[k+'_local_votes']=100*n(snap.fractions[k]);Q[k+'_local_votes_disp']=(100*n(snap.fractions[k])).toFixed(1);}Q.local_total_seats=67;const sorted=Q.parties.slice().sort((a,b)=>snap.municipalities[b]-snap.municipalities[a]||snap.votes[b]-snap.votes[a]);Q.local_largest_party_key=sorted[0];Q.local_second_party_key=sorted[1];}
 else{for(const k of Q.parties){Q[k+'_seats']=snap.seats[k];Q[k+'_r']=100*n(snap.fractions[k]);}Q.total_seats=450;Q.largest_party_key=Q.parties.slice().sort((a,b)=>snap.votes[b]-snap.votes[a])[0];}if(!existing)Q.province_election_history.push(copy(snap));}
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
function addPollingPoints(Q,points){const target=clamp(compute(Q,true).fractions.chp*100+points,0,100),original=Object.fromEntries(classes.map(c=>[c,Object.fromEntries(Q.parties.map(k=>[k,Math.max(0,n(Q[c+'_'+k]))]))]));function set(factor){for(const c of classes){const raw=original[c],total=sum(raw),old=n(raw.chp),next=total?total*(old*factor)/(total-old+old*factor):0;for(const k of Q.parties)Q[c+'_'+k]=k==='chp'?next:(total>old?raw[k]*(total-next)/(total-old):0);}}let lo=.000001,hi=1000000;for(let i=0;i<40;i++){const mid=Math.sqrt(lo*hi);set(mid);if(compute(Q,true,undefined,'national-only').fractions.chp*100<target)lo=mid;else hi=mid;}set(Math.sqrt(lo*hi));R.refreshPolls(Q);}
const colors={other:'#808080',chp:'#E3000F',AP:'#750a6f',CGP:'#5b7387',DP:'#4a4d04',MSP:'#054521',MHP:'#954B00',TIP:'#8B0000',TKP:'#820b09',TSIP:'#abab1a',TEP:'#ad673b',SDP:'#a83a32',TBP:'#c51b32',MP:'#242018',IND:'#808080',KI:'#c2d93f'};
const provinceOtherParties=['MP','TBP','IND','KI'];
function reportingVotes(votes,national,socialistFormed){const keys=national?R.otherPollParties:provinceOtherParties,result={...votes};if(socialistFormed)for(const k of ['TKP','TSIP','TEP','SDP']){result.TIP=n(result.TIP)+n(result[k]);delete result[k];}result.other=0;for(const k of keys){result.other+=n(result[k]);delete result[k];}return result;}
function label(Q,p){return ({chp:'CHP',TIP:'TİP',TSIP:'TSİP',CGP:Q.CGP_name||'GP',MSP:Q.MSP_name||'MNP',IND:'Independents',KI:'Kurdish Independents',other:'Other'})[p]||p;}
root.AnatolianProvinces={ensure,active,sync,compute,addPollingPoints,projectVotes,applyElection,populations,nationalPopulation,demographics,seatQuotas,dhondt,label,colors,reportingVotes,provinceOtherParties,calibrationTarget:target,baselineCalibrationTarget:baselineTarget,data:D};
if(typeof module!=='undefined')module.exports=root.AnatolianProvinces;
})(globalThis);
