/* Anatolian Dawn — annual provincial population and dominant-socioeconomic-identity simulation.
 * This is an incremental layer over AnatolianProvinces, NOT a second election engine.
 * All population/class changes are committed once at a December->January boundary.
 */
(function(root){
'use strict';
const D=root.AnatolianProvinceData, P=root.AnatolianProvinces;
if(!D||!P)return;
const CL=D.classes.slice(), EPS=1e-9;
const num=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sum=o=>Object.values(o).reduce((a,b)=>a+num(b),0);
const keys=o=>Object.keys(o||{});
const copy=o=>JSON.parse(JSON.stringify(o));
const provinceRows=D.provinces;
const rowById=Object.fromEntries(provinceRows.map(p=>[p.id,p]));
const LIVES=['agriculture','wage','small','public','capital'];
const occupation={rural:'agriculture',workers:'wage',petty_bourgeoisie:'small',state_employees:'public',capitalists:'capital'};
const key=(g,h,e,z)=>[g,h,e,z].join('|');
const parse=k=>k.split('|');
const kMaturity=Q=>clamp((num(Q.koykent_progress)/7),0,1);
const kc=Q=>num(Q.land_reform)===3?kMaturity(Q):0;
const percentage=(v,max)=>clamp(num(v)/max,0,1);
const histNat=y=>{
  const n=D.nationalPopulation;
  if(n[y]!==undefined)return n[y];
  if(y>1980)return n[1980]+(y-1980)*(n[1980]-n[1979]);
  return n[1970];
};
function baselinePop(y){
  const from=y<=1975?1970:1975,to=from+5,t=(y-from)/5;
  const estimates=Object.fromEntries(provinceRows.map(p=>[p.id,Math.max(1,p.population[from]+t*(p.population[to]-p.population[from]))]));
  const wanted=histNat(y),denom=sum(estimates);
  return Object.fromEntries(keys(estimates).map(id=>[id,wanted*estimates[id]/denom]));
}
function roundedPopulation(state){
  const ids=keys(state.provinces),out={},pending=[],total=Math.round(ids.reduce((a,id)=>a+sum(state.provinces[id].cells),0));
  let used=0;
  ids.forEach(id=>{const v=sum(state.provinces[id].cells);out[id]=Math.floor(v);used+=out[id];pending.push({id,fract:v-out[id]});});
  pending.sort((a,b)=>b.fract-a.fract||a.id.localeCompare(b.id));
  for(let i=0;i<total-used;i++)out[pending[i].id]++;
  return out;
}
function buildBaselineUrban(pop,demographics){
  // Explicit ESTIMATE: provincial urban/rural census series isn't provided by province-data.js.
  // Do not equate Taşra identity with residence; calibrate national urban share only.
  const share={},target=.395,ids=keys(pop);
  const logit=x=>Math.log(x/(1-x)),sig=x=>1/(1+Math.exp(-x));
  const signal=id=>{
    const v=demographics[id];
    return 1.5*num(v.workers)+.8*num(v.state_employees)+.3*num(v.petty_bourgeoisie);
  };
  let lo=-8,hi=8;
  for(let i=0;i<50;i++){
    const m=(lo+hi)/2,mean=ids.reduce((a,id)=>a+pop[id]*sig(m+3*signal(id)),0)/sum(pop);
    if(mean<target)lo=m;else hi=m;
  }
  const midpoint=(lo+hi)/2;
  ids.forEach(id=>share[id]=clamp(sig(midpoint+3*signal(id)),.08,.92));
  return share;
}
function seed(Q){
  P.ensure(Q);
  // Repair the known Siirt import error in legacy saves only if the exact old
  // unedited baseline is still present; preserve intentional player edits.
  const siirt=Q.province_pools&&Q.province_pools.siirt&&Q.province_pools.siirt.demographics;
  if(siirt&&Math.abs(num(siirt.kurds)-.008)<1e-8&&Math.abs(num(siirt.rural)-.742)<1e-8){
    Object.assign(siirt,{workers:.022,capitalists:.003,petty_bourgeoisie:.016,state_employees:.012,rural:.149,alevis:.010,kurds:.788});
    delete Q.province_aggregate_mirror;P.sync(Q);
  }
  const year=Math.max(1972,num(Q.year,1972)),baseline=baselinePop(year);
  const demographics=Object.fromEntries(provinceRows.map(p=>[p.id,P.demographics(Q,p.id)]));
  const urban=buildBaselineUrban(baseline,demographics),provinces={};
  provinceRows.forEach(p=>{
    const cells={};
    CL.forEach(g=>{
      const h=g==='kurds'?'kurds':g==='alevis'?'alevis':'other';
      ['rural','urban'].forEach(z=>{
        // Initial livelihood of identity-defined households is UNKNOWN; this is a cautious
        // prior based on their residence, not a new ethnic or religious population count.
        const livelihoods=occupation[g]?{[occupation[g]]:1}:(z==='rural'?{agriculture:.74,wage:.18,small:.06,public:.02}:{agriculture:.12,wage:.57,small:.22,public:.09});
        Object.entries(livelihoods).forEach(([e,w])=>cells[key(g,h,e,z)]=baseline[p.id]*demographics[p.id][g]*w*(z==='urban'?urban[p.id]:1-urban[p.id]));
      });
    });
    provinces[p.id]={cells,urbanAccess:urban[p.id],built:.0,maturity:.0,housing:.0,services:.0};
  });
  Q.dynamic_demographic_state={version:1,year,provinces,urbanBaselineEstimated:true,lastYearProcessed:year-1};
  return Q.dynamic_demographic_state;
}
function ensure(Q){
  if(!Q||!Q.started||!Q.province_pools)return null;
  const st=Q.dynamic_demographic_state;
  if(st&&st.version===1&&st.provinces&&keys(st.provinces).length===provinceRows.length)return st;
  return seed(Q);
}
function cohortTotal(prov){return sum(prov.cells);}
function zonal(prov,z){let s=0;for(const[k,v]of Object.entries(prov.cells))if(k.endsWith('|'+z))s+=v;return s;}
function shares(prov){const totals=Object.fromEntries(CL.map(c=>[c,0]));for(const[k,v]of Object.entries(prov.cells))totals[parse(k)[0]]+=v;const total=sum(totals)||1;return Object.fromEntries(CL.map(c=>[c,totals[c]/total]));}
function redistribute(st,flows,toZone){
  // Two-phase transfer: migrants are drawn only from the pre-migration cohort
  // snapshot. Incoming residents cannot migrate a second time that year.
  const outgoing={};
  for(const [origin,dest,amount] of flows){
    if(origin===dest||amount<=EPS)continue;
    outgoing[origin]=(outgoing[origin]||0)+amount;
  }
  const source=Object.fromEntries(keys(outgoing).map(id=>[id,{...st.provinces[id].cells}]));
  const totals=Object.fromEntries(keys(source).map(id=>[id,sum(source[id])]));
  const scale=Object.fromEntries(keys(source).map(id=>[id,Math.min(1,.20*totals[id]/Math.max(EPS,outgoing[id]))]));
  // Subtract everything first; additions come from the untouched snapshot.
  for(const origin of keys(source)){
    const fraction=outgoing[origin]*scale[origin]/Math.max(EPS,totals[origin]);
    for(const[k,v]of Object.entries(source[origin]))st.provinces[origin].cells[k]-=v*fraction;
  }
  for(const [origin,dest,amount] of flows){
    if(origin===dest||amount<=EPS)continue;
    const fraction=amount*scale[origin]/Math.max(EPS,totals[origin]);
    for(const[k,v]of Object.entries(source[origin])){
      const parts=parse(k);if(toZone)parts[3]=toZone;
      const target=parts.join('|');
      st.provinces[dest].cells[target]=(st.provinces[dest].cells[target]||0)+v*fraction;
    }
  }
}

function exchangeResidence(prov,count){
  const rural=zonal(prov,'rural'),fraction=clamp(count/Math.max(1,rural),0,.10);
  for(const[k,v]of Object.entries(prov.cells))if(k.endsWith('|rural')){
    const delta=v*fraction;prov.cells[k]-=delta;
    const dest=k.slice(0,-5)+'urban';prov.cells[dest]=(prov.cells[dest]||0)+delta;
  }
}
function safeDev(Q,id){
  // Optional existing geographic allocations: used only when their state is present.
  const record=(Q.province_development&&Q.province_development[id])||
    (Q.province_investments&&Q.province_investments[id])||{};
  return {industry:clamp(num(record.industry),0,100),services:clamp(num(record.services),0,100),housing:clamp(num(record.housing),0,100),agriculture:clamp(num(record.agriculture),0,100)};
}
function municipality(Q,id){
  const m=root.AnatolianMunicipalities;
  const modern=!!m&&typeof m.count==='function';
  return {infrastructure:modern?num(m.count(Q,'infrastructure')):0,
    migration:modern?num(m.count(Q,'migration')):0,
    industry:modern?num(m.count(Q,'industry')):0,
    transport:modern?num(m.count(Q,'transport')):0,
    // Current municipal actions are national game variables, not province-specific investments.
    id};
}
function annualOpportunities(Q,st){
  const result={},nationalGrowth=clamp(num(Q.economic_growth)/100,-.15,.20),
    employment=clamp(1-num(Q.unemployed,8)/100,0,1),
    production=clamp((num(Q.industrial_production_index,100)-100)/100,-.4,1.5),
    farm=clamp((num(Q.agricultural_production_index,100)-100)/100,-.4,1.5),
    koykent=kc(Q),municipal=municipality(Q),
    road=percentage(Q.demiryoluu,1);
  for(const p of provinceRows){
    const id=p.id,s=st.provinces[id],pop=cohortTotal(s),dem=shares(s),dev=safeDev(Q,id);
    // Existing industrial centres receive more organic private-sector investment;
    // Köykent produces a distinct rural-regional opportunity channel.
    const historicalIndustry=clamp(dem.workers*.95+dem.petty_bourgeoisie*.25,.03,.7);
    const hinterland=clamp(1-historicalIndustry*1.4,.18,1);
    const koykentLocal=koykent*hinterland*(.25+.75*percentage(Q.yatirimm,3))
      *(.50+.50*percentage(Q.koykenttt,1));
    const jobs=clamp(.015+production*.024+nationalGrowth*.1+dev.industry*.007
        +koykentLocal*.055,0,.18)*employment;
    const small=clamp(.004+jobs*.16+dev.services*.002+koykentLocal*.012,0,.05);
    const publicJobs=clamp(.002+dev.services*.001+num(Q.koykentegitimm)*koykentLocal*.007,0,.035);
    const ruralImprovement=clamp(farm*.15+dev.agriculture*.02+koykentLocal*.45,0,1);
    const housing=clamp(.02+dev.housing*.03+municipal.infrastructure*.03+koykentLocal*.15,0,.5);
    const attractiveness=clamp(.30+historicalIndustry*.6+jobs*4+small*2+publicJobs*3+dev.industry*.13
          +road*.15+municipal.transport*.02+housing*.3,0,10);
    result[id]={jobs,small,publicJobs,ruralImprovement,housing,attractiveness,koykentLocal,
      displaced:clamp(.002+Math.max(0,farm)*.007,0,.018),dev};
  }
  return result;
}
function historicalRedistribution(st,prevYear,nextYear){
  const prior=baselinePop(prevYear),next=baselinePop(nextYear),ratio=sum(next)/sum(prior);
  const flows=Object.fromEntries(keys(prior).map(id=>[id,next[id]-prior[id]*ratio]));
  const sources=keys(flows).filter(id=>flows[id]<-EPS),sinks=keys(flows).filter(id=>flows[id]>EPS);
  let i=0,j=0;
  const supply=Object.fromEntries(sources.map(id=>[id,-flows[id]])),demand=Object.fromEntries(sinks.map(id=>[id,flows[id]]));
  const transfers=[];
  while(i<sources.length&&j<sinks.length){
    const a=sources[i],b=sinks[j],amount=Math.min(supply[a],demand[b]);
    transfers.push([a,b,amount]);
    supply[a]-=amount;demand[b]-=amount;
    if(supply[a]<EPS)i++;if(demand[b]<EPS)j++;
  }
  return transfers;
}
function policyMigration(Q,st,op){
  const ids=keys(st.provinces),developmentIntensity=clamp(
    Math.max(0,num(Q.industry_modifier))/80 + kc(Q)*.3+
    ids.reduce((a,id)=>a+op[id].dev.industry,0)/(100*ids.length),0,1.5);
  if(developmentIntensity<EPS)return [];
  const yearlyRate=clamp(.0035*developmentIntensity,0,.012);
  const snapshot=Object.fromEntries(ids.map(id=>[id,cohortTotal(st.provinces[id])]));
  const transfers=[];
  for(const origin of ids){
    const from=st.provinces[origin],local=op[origin];
    const ruralFraction=zonal(from,'rural')/Math.max(1,snapshot[origin]);
    // Köykent reduces the need for long-distance moves by improving local alternatives.
    const demand=snapshot[origin]*yearlyRate*(.6+.8*ruralFraction)*(1-.75*local.koykentLocal);
    const attractions=[];let total=0;
    for(const dest of ids){if(dest===origin)continue;
      const d=op[dest],p=st.provinces[dest],targetPop=Math.max(1,snapshot[dest]);
      const pressure=clamp(zonal(p,'urban')/targetPop-p.housing-.4,0,1);
      const score=Math.exp(clamp(2.5*(d.attractiveness-local.attractiveness)-pressure, -8, 8));
      const distance=(rowById[origin].center&&rowById[dest].center)?
        Math.hypot(rowById[origin].center[0]-rowById[dest].center[0],rowById[origin].center[1]-rowById[dest].center[1]):600;
      const weight=score/(1+distance/280);attractions.push([dest,weight]);total+=weight;
    }
    if(total<EPS)continue;
    // Mass conservation: disburse from the original population without overdraw.
    for(const [dest,w]of attractions)transfers.push([origin,dest,demand*w/total]);
  }
  return transfers;
}
function shiftOccupation(prov,op){
  const total=cohortTotal(prov)||1;
  const budgets={wage:total*op.jobs,small:total*op.small,public:total*op.publicJobs};
  // Existing occupation stays intact; only a small share of rural/agricultural workers
  // is available for annual transition, bounded by newly viable opportunities.
  for(const [k,value]of Object.entries({...prov.cells})){
    const [g,h,e,z]=parse(k);
    if(e!=='agriculture'||value<EPS)continue;
    const displaced=clamp(op.displaced*(1-op.ruralImprovement*.2)+op.jobs*.68+op.koykentLocal*.025,0,.18);
    let moving=value*displaced;
    for(const target of ['wage','small','public']){
      const a=Math.min(moving,budgets[target]);
      if(a<EPS)continue;
      prov.cells[k]-=a;
      const next=key(g,h,target,z);prov.cells[next]=(prov.cells[next]||0)+a;
      budgets[target]-=a;moving-=a;
    }
  }
  // Wage earners can establish small enterprises when commercial opportunities exist.
  for(const [k,value]of Object.entries({...prov.cells})){
    const [g,h,e,z]=parse(k);
    if(e!=='wage'||value<EPS)continue;
    const a=Math.min(value*.004,budgets.small);
    if(a>0){prov.cells[k]-=a;const dst=key(g,h,'small',z);prov.cells[dst]=(prov.cells[dst]||0)+a;budgets.small-=a;}
  }
}
function identityScore(g,h,e,z,Q,op){
  const loc=op.koykentLocal;
  const match={workers:e==='wage'?3:0,capitalists:e==='capital'?4:0,
    petty_bourgeoisie:e==='small'?3.6:0,state_employees:e==='public'?3.4:0,
    rural:e==='agriculture'?2.4:0,
    kurds:h==='kurds'?2.9+clamp(num(Q.kurdish_issue_consciousness,.08),0,1): -99,
    alevis:h==='alevis'?2.9: -99};
  if((g==='kurds'&&h!=='kurds')||(g==='alevis'&&h!=='alevis'))return -99;
  const sector=(g==='workers'?op.jobs*4:g==='petty_bourgeoisie'?op.small*5:g==='state_employees'?op.publicJobs*6:0);
  const ruralChange=g==='rural'&&z==='rural'?op.ruralImprovement*.7:0;
  const social=g==='workers'&&e==='wage'?num(Q.disk_relation,40)/300:0;
  return num(match[g],0)+sector+ruralChange+social+(g==='rural'?loc*.1:0);
}
function transitionIdentity(prov,Q,op){
  const changes={};
  for(const [k,pop]of Object.entries(prov.cells)){
    if(pop<EPS)continue;
    const [g,h,e,z]=parse(k),old=identityScore(g,h,e,z,Q,op);
    const scores=CL.filter(dst=>dst!==g).map(dst=>[dst,identityScore(dst,h,e,z,Q,op)]).filter(x=>x[1]>-50);
    if(!scores.length)continue;
    const best=Math.max(...scores.map(x=>x[1]));
    const maxSwitch=(g==='kurds'||g==='alevis')?.065:.18;
    const impetus=clamp((best-old-.25)/3,0,1);
    const switching=pop*maxSwitch*impetus;
    if(switching<EPS)continue;
    const weights=scores.map(([dest,score])=>[dest,Math.exp(clamp((score-best)*1.2,-30,0))]);
    const denom=weights.reduce((a,x)=>a+x[1],0);
    changes[k]=(changes[k]||0)-switching;
    for(const [dest,w]of weights){const target=key(dest,h,e,z);changes[target]=(changes[target]||0)+switching*w/denom;}
  }
  for(const[k,delta]of Object.entries(changes))prov.cells[k]=Math.max(0,num(prov.cells[k])+delta);
}
function endYear(Q,completedYear){
  if(!Q||!Q.started)return false;
  const st=ensure(Q);if(!st)return false;
  const nextYear=completedYear+1;
  if(st.year>=nextYear||st.lastYearProcessed>=completedYear)return false;
  if(st.year!==completedYear)return false; // Never silently skip or replay a year.
  P.sync(Q); // Apply any existing direct demographic/poll actions first.
  // Keep hidden cohorts aligned with the current authoritative province_pools shares.
  // Existing actions sometimes alter the national compatibility fields directly.
  for(const p of provinceRows){
    const prov=st.provinces[p.id],actual=shares(prov),target=P.demographics(Q,p.id),total=cohortTotal(prov);
    for(const [k,v] of Object.entries(prov.cells)){
      const g=parse(k)[0],scale=actual[g]>EPS?target[g]/actual[g]:0;
      prov.cells[k]=v*scale;
    }
    for(const g of CL)if(actual[g]<EPS&&target[g]>EPS){
      const k=key(g,g==='kurds'?'kurds':g==='alevis'?'alevis':'other',occupation[g]||'agriculture','rural');
      prov.cells[k]=(prov.cells[k]||0)+total*target[g];
    }
  }
  const referenceBefore=histNat(completedYear),referenceAfter=histNat(nextYear),natural=clamp(referenceAfter/referenceBefore,.97,1.06);
  for(const p of provinceRows){const prov=st.provinces[p.id];for(const k of keys(prov.cells))prov.cells[k]*=natural;}
  const baselineTransfers=historicalRedistribution(st,completedYear,nextYear);
  const opportunities=annualOpportunities(Q,st);
  for(const p of provinceRows){
    const s=st.provinces[p.id],op=opportunities[p.id],construction=kc(Q);
    s.built=clamp(Math.max(s.built,construction),0,1); // Milestones represent established infrastructure, not mature institutions.
    const operational=clamp(1-num(Q.unemployed,8)/100,0,1);
    s.maturity=clamp(s.maturity+Math.max(0,s.built-s.maturity)*(.10+.06*operational),0,1);
    s.services=clamp(s.services+Math.max(0,s.maturity-s.services)*.17,0,1);
    s.housing=clamp(s.housing+op.housing*.06,0,1);
  }
  const policyTransfers=policyMigration(Q,st,opportunities);
  redistribute(st,baselineTransfers.concat(policyTransfers),'urban');
  for(const p of provinceRows){
    const prov=st.provinces[p.id],op=opportunities[p.id];
    const rural=zonal(prov,'rural');
    // Local Köykent centers can urbanize while residents stay within their province.
    exchangeResidence(prov,rural*clamp(.001+op.koykentLocal*.016+op.dev.services*.005,0,.06));
    shiftOccupation(prov,op);
    transitionIdentity(prov,Q,op);
    const sharesAfter=shares(prov);
    Q.province_pools[p.id].demographics=sharesAfter;
  }
  st.year=nextYear;st.lastYearProcessed=completedYear;
  st.population=roundedPopulation(st);
  st.urbanShare=Object.fromEntries(provinceRows.map(p=>[p.id,zonal(st.provinces[p.id],'urban')/Math.max(1,cohortTotal(st.provinces[p.id]))]));
  st.koykentConstruction=kc(Q);st.koykentMaturity=provinceRows.reduce((a,p)=>a+st.provinces[p.id].maturity*cohortTotal(st.provinces[p.id]),0)/Math.max(1,sum(st.population));
  // The existing province model's national compatibility mirror must be refreshed,
  // otherwise the next polling sync could treat its old national shares as a policy edit.
  delete Q.province_aggregate_mirror;
  P.sync(Q);
  Q.dynamic_demographics_last_summary={year:nextYear,population:sum(st.population),urbanization:100*provinceRows.reduce((a,p)=>a+zonal(st.provinces[p.id],'urban'),0)/Math.max(1,sum(st.population)),koykentMaturity:st.koykentMaturity};
  return true;
}
function populations(Q){const st=Q&&Q.dynamic_demographic_state;if(!st||!st.provinces)return null;return {...(st.population||roundedPopulation(st))};}
const api={ensure,endYear,populations,baselinePop,shares,annualOpportunities,version:1};
root.AnatolianDynamicDemographics=api;
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
