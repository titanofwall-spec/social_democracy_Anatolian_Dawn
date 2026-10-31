'use strict';
// Self-contained regression test against the repository's actual provincial
// data, turnout, class vote and 450-seat D'Hondt engine.
const assert=require('node:assert/strict');
const R=require('../out/html/rules.js');
const P=require('../out/html/provinces.js'),D=P.data;
const clone=x=>JSON.parse(JSON.stringify(x));
const sum=o=>Object.values(o).reduce((a,b)=>a+(Number(b)||0),0);
const keys=['chp','TIP','CGP','AP','DP','MSP','MHP','TBP','MP','IND','KI','TKP','TSIP','TEP','SDP'];
const near=(a,b,t=1e-7)=>assert(Math.abs(a-b)<t,`Expected ${a} to be within ${t} of ${b}`);
const ceiling=x=>Math.min(.849,x+.15+.60*Math.max(0,.60-x))-.0005;
const cloneAndVotes=p=>p.map(x=>({id:x.id,votes:{...x.votes}}));
let totalCases=0;
function test(label,run){run();console.log('PASS '+label);totalCases++;}
function fixture(){
 const Q={started:1,year:1972,month:7,week:1,classes:D.classes.slice(),parties:keys.slice(),
  province_model_version:1,province_model_enabled:1,province_cell_model_version:2,
  province_saturation_version:1,minor_parties_version:1,
  province_election_history:[],province_initial_parliament:{},
  TIP_banned:0,disk_endorsement:false,socialist_left_formed:0,Amnesty:0,kurdish_independents_unlocked:0,
  kurdish_issue_version:1,kurdish_issue_consciousness:.07,kurdish_issue_radicalism:.02,
  province_independent_factors:Object.fromEntries(D.provinces.map(p=>[p.id,.583333333333])),
  province_pools:Object.fromEntries(D.provinces.map(p=>[p.id,{
   demographics:clone(p.demographics),
   preferences:Object.fromEntries(D.classes.map(c=>[c,P.startingPreferences(p,c)]))}]))};
 for(const k of keys)Q.province_initial_parliament[k]=0;
 // Match game initialization BEFORE measuring the baseline.
 P.sync(Q);R.ensureKurdishIssue(Q);P.sync(Q);
 return Q;
}
function verify(Q,label){
 const s=P.compute(Q,true);
 assert.equal(s.provinces.length,67);
 assert.equal(sum(s.votes),s.totalVotes);
 assert.equal(sum(s.seats),450);
 for(const p of s.provinces){
  near(sum(p.shares),1,1e-8);
  assert.equal(sum(p.seats),P.seatQuotas(Q.year+(Q.month-1+(Q.week-1)/2)/12)[p.id],p.id+' seats');
  assert(Number.isInteger(p.totalVotes)&&p.totalVotes>=0);
  for(const k of Q.parties){
   const v=p.shares[k]||0,nat=s.fractions[k]||0;
   assert(Number.isFinite(v)&&v>=0,`${label}: invalid ${k} ${p.id}`);
   assert(v<=ceiling(nat)+0.00012,`${label}: ${k} ${p.id} ${(v*100).toFixed(3)} > ${(ceiling(nat)*100).toFixed(3)}`);
   if(nat>=.15)assert(v>=.2*nat-.00012,`${label}: ${k} ${p.id} below floor`);
   assert(v<.85,`${label}: ${k} reaches 85% in ${p.id}`);
  }
 }
 const chp=s.provinces.map(p=>p.shares.chp);
 console.log('  '+label+': CHP '+(100*s.fractions.chp).toFixed(2)+'% national, provincial '+(100*Math.min(...chp)).toFixed(2)+'-'+(100*Math.max(...chp)).toFixed(2)+'%');
 return s;
}
function swing(party,steps,year=1972){
 const Q=fixture();Q.year=year;
 for(let i=0;i<steps;i++)for(const c of Q.classes)P.shiftClass(Q,c,party,.02);
 P.sync(Q);return verify(Q,party+' +'+(steps*2)+'pp per class '+year);
}
function targetParty(Q,party,target){
 const old=clone(Q.province_pools);
 let low=-25,high=25;
 const set=z=>{
  Q.province_pools=clone(old);
  for(const p of D.provinces)for(const c of Q.classes){
   const v=Q.province_pools[p.id].preferences[c],start=v[party]||0;
   const odds=Math.exp(z),newShare=start*odds/(1-start+start*odds);
   for(const k of Object.keys(v))v[k]=k===party?newShare:(1-newShare)*v[k]/Math.max(1e-20,1-start);
  }
 };
 for(let i=0;i<45;i++){
  const mid=(low+high)/2;set(mid);
  const now=P.compute(Q,true).fractions[party];
  if(now<target)low=mid;else high=mid;
 }
 set((low+high)/2);P.sync(Q);
}
function syntheticValidation(party,share){
 // Pure ballot balancing: test exact preservation for votes, province turnout
 // and party totals independently from the game's scene initialization.
 const others=keys.filter(k=>k!==party),p=[];
 for(let i=0;i<67;i++){
  const votes=Object.fromEntries(keys.map(k=>[k,0]));
  const raw=i===0?.99:i===1?.005:i===2?.94:share;
  const amount=20000+i*301;
  votes[party]=amount*raw;
  for(let j=0;j<others.length;j++)votes[others[j]]=amount*(1-raw)*(j+1)/(others.length*(others.length+1)/2);
  p.push({id:'test'+i,votes});
 }
 const before=cloneAndVotes(p),beforeTotals=Object.fromEntries(keys.map(k=>[k,p.reduce((a,row)=>a+row.votes[k],0)]));
 P.balanceProvincialVotes(p,keys);
 const afterTotals=Object.fromEntries(keys.map(k=>[k,p.reduce((a,row)=>a+row.votes[k],0)]));
 const overall=sum(beforeTotals);
 for(let i=0;i<p.length;i++){
  near(sum(p[i].votes),sum(before[i].votes),1e-6);
  for(const k of keys){
   const national=afterTotals[k]/overall,local=p[i].votes[k]/sum(p[i].votes);
   assert(local<=ceiling(national)+1e-8,k+' exceeds ceiling');
   if(national>=.15)assert(local+1e-8>=.20*national,k+' below floor');
  }
 }
 for(const k of keys)near(afterTotals[k],beforeTotals[k],1e-6);
}
test('67-province 1972 starting point',()=>{const Q=fixture(),before=clone(Q.province_pools);verify(Q,'1972');assert.deepEqual(Q.province_pools,before);});
test('CHP moderate +12pp',()=>swing('chp',6));
test('CHP strong +24pp',()=>swing('chp',12));
test('CHP exactly 60% nationwide: every province below 75%',()=>{
 const Q=fixture();targetParty(Q,'chp',.60);const s=verify(Q,'CHP 60%');near(s.fractions.chp,.6,3e-5);
 for(const p of s.provinces)assert(p.shares.chp<.75,p.id+' CHP >=75%');
});
test('1977 high-growth path',()=>swing('chp',13,1977));
test('1980 high-growth path',()=>swing('chp',13,1980));
for(const party of ['AP','MSP','MHP','CGP','DP'])test(party+' deconcentrates identically',()=>swing(party,17));
test('CHP growth then decline does not accumulate local extremity',()=>{
 const Q=fixture();for(let i=0;i<14;i++)for(const c of Q.classes)P.shiftClass(Q,c,'chp',.02);
 for(let i=0;i<8;i++)for(const c of Q.classes)P.shiftClass(Q,c,'chp',-.02);
 P.sync(Q);verify(Q,'CHP +28pp then -16pp');
});
test('One-off +1 national point campaigning action',()=>{
 const Q=fixture();const original=verify(Q,'before +1').fractions.chp;
 P.addPollingPoints(Q,1);const after=verify(Q,'after +1').fractions.chp;
 assert(after>=original-0.0001);
});
test('Polls, local elections and general elections have identical vote bounds',()=>{
 const Q=fixture();targetParty(Q,'chp',.55);
 const polls=P.compute(Q,true),gen=P.compute(Q,false),local=P.compute(Q,false,undefined,'local');
 for(const election of [polls,gen,local])for(const p of election.provinces)for(const k of Q.parties){
  const nat=election.fractions[k]||0;
  assert((p.shares[k]||0)<=ceiling(nat)+.00012,`${k} ${p.id} exceeds limit`);
 }
 assert.equal(sum(gen.seats),450);assert.equal(sum(local.seats),450);
});
test('All-party synthetic conservation, every province turnout unchanged',()=>{
 for(const party of ['chp','AP','MSP','MHP','CGP','DP','TIP'])syntheticValidation(party,.60);
});
test('Mathematically impossible >84.8% national monopoly handled without 85% provinces',()=>{
 const Q=fixture();for(const p of D.provinces)for(const c of Q.classes){
  const v=Q.province_pools[p.id].preferences[c];for(const k of Object.keys(v))v[k]=0;
  v.chp=.96;v.AP=.04;
 }
 const s=verify(Q,'national monopoly');near(s.fractions.chp,.848,1e-6);
 for(const p of s.provinces)assert(p.shares.chp<.85);
});
console.log('PASS '+totalCases+' independent scenario groups.');
