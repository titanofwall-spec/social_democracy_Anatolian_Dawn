const assert=require('assert');require('../out/html/rules.js');const M=require('../out/html/municipalities.js');
const Q={year:1974,month:1,week:1,resources:100,CHP_in_government:1,municipalities_controlled:20,total_municipalities:67};
const advance=t=>{const n=M.now(Q)+t;Q.year=Math.floor(n/24);Q.month=Math.floor(n%24/2)+1;Q.week=n%2+1;};
assert.equal(M.levels(Q).Sanitation,'Failing to Keep Up');assert.equal(M.geceLevels(Q).Infrastructure,'Nonexistent');assert(!Q.municipal_development);assert(M.html(Q).includes('Municipalities Controlled: 20/67'));assert(!Q.municipal_development,'Rendering must not mutate saves');
for(const [id,d]of Object.entries(M.definitions)){
 if(d.parent)assert.equal(M.count(Q,d.parent),d.required);
 for(let i=0;i<d.max;i++){assert.equal(M.reason(Q,id),'',id);assert(M.apply(Q,id));assert.equal(M.count(Q,id),i+1);if(i<d.max-1){assert(M.reason(Q,id));advance(d.cooldown-1);assert(M.reason(Q,id));advance(1);}}
 assert(M.reason(Q,id));assert(!M.apply(Q,id));
}
assert.deepEqual(Object.values(M.levels(Q)),['Near 1970s Standards','Widespread Paved Roads','Keeping Pace with Urban Growth','Significant Cultural and Economic Opportunities']);
assert.deepEqual(Object.values(M.geceLevels(Q)),['Significantly Slowed','Widespread Infrastructure','Evolving into Apartment Districts','Near Urban Standards','Local Factories Forming']);
const restored=JSON.parse(JSON.stringify(Q));assert.deepEqual(M.levels(restored),M.levels(Q));assert(M.progress(restored).includes('4/4'));console.log('PASS municipal development, endpoints, exact half-month cooldown boundaries, old-save defaults and save roundtrip');

for(const govt of [0,1]){const q={year:1974,month:1,week:1,resources:5,budget:5,CHP_in_government:govt};for(const id of ['libraries','halkekmek','roads','connect','regularization','planning','transport','industry'])if(!govt)assert(M.reason(q,id));assert(M.apply(q,'migration'));assert.equal(q.resources,govt?5:4);assert.equal(q.budget,5);assert(!M.html(q).includes('Land Regularization:'));}assert.equal(M.definitions.regularization.max,4);assert.equal(M.definitions.infrastructure.max,2);assert.equal(M.definitions.transport.max,3);const legacy={municipal_development:{counts:{regularization:8,infrastructure:4,transport:6},dates:{}}};assert.equal(M.count(legacy,'regularization'),4);assert.equal(M.geceLevels(legacy).Infrastructure,'Widespread Infrastructure');

require('../out/html/data/province-data.js');
const winners=M.startingMunicipalWinners;
assert.deepEqual(Object.keys(winners).sort(),globalThis.AnatolianProvinceData.provinces.map(p=>p.id).sort());
assert.deepEqual(Object.values(winners).reduce((o,k)=>(o[k]=(o[k]||0)+1,o),{}),{chp:21,IND:8,GP:3,AP:35});
assert.equal(winners.adana,'chp');assert.equal(winners.ankara,'AP');assert.equal(winners.kahramanmaras,'chp');assert.equal(winners.urfa,'AP');assert.equal(winners.hakkari,'GP');
const empty={province_election_history:[]},before=JSON.stringify(empty);assert.equal(M.controlSnapshot(empty),null);assert.equal(JSON.stringify(empty),before);
const local1={kind:'local',year:1973,provinces:[{id:'adana',winner:'AP'}]},local2={kind:'local',year:1977,provinces:[{id:'ankara',winner:'chp'}]};
assert.strictEqual(M.controlSnapshot({province_election_history:[local1,{kind:'general',year:1977},local2]}),local2);
assert.equal(M.startingMunicipalWinners.adana,'chp');
console.log('PASS all 67 supplied 1968 winners, CHP 21/67, name aliases, pure fallback, and latest-local-election replacement');
