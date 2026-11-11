require('../out/html/macro-economy.js');
const fs=require('fs'),path=require('path'),assert=require('assert'),R=require('../out/html/rules.js'),P=require('../out/html/peoples-sector.js'),lib=require('dendrynexus/lib/engine.js');
require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...a)=>{if(String(a[0]).startsWith('Error'))errors.push(a.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(__dirname,'../out/game.json'),'utf8'),(err,game)=>{if(err)throw err;let count=0;
function test(title,f){errors.length=0;f();assert.deepEqual(errors,[]);count++;output('PASS '+title);}
function fresh(){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1973,month:1,week:1,CHP_in_government:1,economic_minister_party:'CHP',finance_minister_party:'CHP',agriculture_minister_party:'CHP',labor_minister_party:'CHP',budget:100,cyprus_mode:0});return e;}
const M=require('../out/html/macro-economy.js');const A=require('../out/html/card-actions.js');const originalFresh=fresh;const Qof=()=>fresh().state.qualities;const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' != '+b);



const ministryActionLogs={};
function chooseScene(e,id) {
  const choices=e.getCurrentChoices();
  const index=choices.findIndex(c=>c.id===id);
  assert(index>=0,'Missing cabinet choice '+id+' at '+e.state.sceneId);
  assert(!choices[index].unavailable,'Cabinet choice unavailable: '+id);
  e.choose(index);
}
function cabinetChoice(e,q,root,submenu,id) {
  if((q[root+'_timer']||0)>0 || q.CHP_in_government!==1)return false;
  const menu=game.scenes[submenu.length?submenu[submenu.length-1]:root];
  const options=e._compileChoices(menu);
  if(!options.some(c=>c.id===id&&!c.unavailable))return false;
  e.goToScene(root); // Actual cabinet card: applies cooldown and consumes action.
  for(const hop of submenu)chooseScene(e,hop);
  chooseScene(e,id); // Real player choice, not a direct variable edit or onArrival call.
  return true;
}
function planMinistry(name,q,t,e,plan) {
  if(t===0){q.budget=1;q.flavour_events=0;ministryActionLogs[name]=[];}
  if(t%2)return;
  for(const [root,submenu,id,limit] of plan){
    if(ministryActionLogs[name].filter(x=>x.id===id).length>=limit)continue;
    if(cabinetChoice(e,q,root,submenu,id)){
      ministryActionLogs[name].push({year:q.year,month:q.month,id,budget:q.budget});
      return;
    }
  }
}

const scenarios = {

  ministryIndustrial(q,t,e) {
    planMinistry('ministryIndustrial',q,t,e,[
      ['industrial_policy',[],'industrial_policy.industry1',1],
      ['industrial_policy',[],'industrial_policy.elektronik',1],
      ['industrial_policy',[],'industrial_policy.demiryolu',1],
      ['industrial_policy',[],'industrial_policy.kredi',20],
      ['economic_policy',['economic_policy.mid'],'economic_policy.export',15],
      ['economic_policy',['economic_policy.short'],'economic_policy.debt',4]
    ]);
  },
  ministryAgriculture(q,t,e) {
    planMinistry('ministryAgriculture',q,t,e,[
      ['agricultural_policy',['agricultural_policy.regular'],'agricultural_policy.cooperative',3],
      ['agricultural_policy',['agricultural_policy.regular'],'agricultural_policy.east',3],
      ['industrial_policy',[],'industrial_policy.kobi',20],
      ['economic_policy',['economic_policy.short'],'economic_policy.pricecontrols',5],
      ['fiscal_policy',['fiscal_policy.yearly'],'fiscal_policy.avans',5]
    ]);
  },
  ministryMixed(q,t,e) {
    planMinistry('ministryMixed',q,t,e,[
      ['industrial_policy',[],'industrial_policy.industry1',1],
      ['agricultural_policy',['agricultural_policy.regular'],'agricultural_policy.cooperative',3],
      ['industrial_policy',[],'industrial_policy.elektronik',1],
      ['agricultural_policy',['agricultural_policy.regular'],'agricultural_policy.east',3],
      ['industrial_policy',[],'industrial_policy.demiryolu',1],
      ['industrial_policy',[],'industrial_policy.kredi',20],
      ['economic_policy',['economic_policy.mid'],'economic_policy.export',15],
      ['economic_policy',['economic_policy.short'],'economic_policy.debt',4]
    ]);
  },

  baseline() {},
  repeatedControls(q,t,e) {if(t%6===0)e._runActions(game.scenes['economic_policy.pricecontrols'].onArrival);},
  supplyAndFX(q,t) {
    if(t===24){q.industry_modifier+=10;q.agriculture_modifier+=8;}
    if(t===72)q.forex_pressure=100;
    if(t===96){q.forex_pressure=35;q.forex_pressure_drift=0;}
  },
  monetaryAndTiger(q,t) {
    if(t===48)q.macro_m2_growth=3;
    if(t===96)q.macro_m2_growth=25;
    if(q.year>=1978 && q.year<=1980)q['tiger_'+q.year+'_effect_applied']=1;
  }
};
for(const [name,policy] of Object.entries(scenarios))test('1973-1981 half-month economic playthrough: '+name,()=>{
  const e=fresh();let q=e.state.qualities;
  Object.assign(q,{macro_model:null,last_economy_month:null,month_actions:0,week:1,
    flavour_events:0,forex_pressure_drift:2,oil_crisis_effect_applied:0,tsk_pacified:1});
  e.random.random=()=>1;M.ensure(q);let snapshots=0;
  const ys=[q.macro_model.y],ps=[q.macro_model.price];
  const start=q.year*12+q.month;
  for(let t=0;t<216;t++){
    policy(q,t,e);q.month_actions=1;e.goToScene('post_event');
    const expected=start+Math.floor((t+1)/2);
    assert.equal(q.macro_model.lastMonth,expected,'exactly one update per calendar month');
    const s=q.macro_model;
    for(const k of ['y','price','m2','potential','inflation','growth','expectation'])assert(Number.isFinite(s[k]),name+' '+k);
    assert(s.y>0 && s.price>0 && s.m2>0);assert(s.inflation>-100);
    assert(Math.abs(s.demandGap)<=25);assert((q.price_control_coverage||0)<=.55);
    if(t%2===1){
      ys.push(s.y);ps.push(s.price);const i=ys.length-1;
      if(i>=12){near(q.economic_growth,100*(s.y/ys[i-12]-1));near(q.inflation,100*(s.price/ps[i-12]-1));}
      const before=JSON.stringify(s);q.month_actions=0;e.goToScene('post_event');assert.equal(JSON.stringify(s),before,'navigation cannot advance economy');
      if(i%12===0){
        const saved=JSON.parse(JSON.stringify(q));
        assert.deepEqual(saved.macro_model,q.macro_model);
        e.state.qualities=saved;q=saved;M.ensure(q);snapshots++;
      }
    }
  }
  assert.equal(q.year,1982);assert.equal(q.month,1);assert.equal(snapshots,9);
  if(name.startsWith('ministry')) {
    const actual=ministryActionLogs[name]||[];
    assert(actual.length>=5,name+' did not exercise real ministry actions: '+JSON.stringify(actual));
    assert(actual.some(x=>x.id.startsWith('industrial_policy')||x.id.startsWith('agricultural_policy')),
      'No real production-focused ministry action: '+name);
    output(JSON.stringify({actualCabinetPlaythrough:name,actions:actual.length,
      firstActions:actual.slice(0,8),lastActions:actual.slice(-6),
      potential:q.macro_model.potential,health:q.health_economy_status}));
  }
  if(name==='repeatedControls'){assert(q.inflation>0);assert(q.black_market_risk>1);}
  output(JSON.stringify({scenario:name,year:q.year,inflation:q.inflation,growth:q.economic_growth,
    unemployment:q.unemployed,health:q.health_economy_status}));
});
output('PASS '+count+' full-horizon economic scenarios.');
});
