const fs=require('fs'),path=require('path'),assert=require('assert');
const rules=require('../out/html/rules.js');require('../out/html/cyprus-atilla1.js');require('../out/html/cyprus-campaign.js');require('../out/html/cyprus-roadmap.js');
const lib=require('dendrynexus/lib/engine.js'),root=path.resolve(__dirname,'..'),c=rules.cyprusAtilla1,rm=rules.cyprusRoadmap,cp=rules.cyprusCampaign;
require('../out/html/data/province-data.js');const provinces=require('../out/html/provinces.js');
const noop=()=>{},node={remove:noop,style:{setProperty:noop},appendChild:noop,setAttribute:noop,addEventListener:noop,offsetWidth:600,classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>node,querySelectorAll:()=>[],getAttribute:()=>'',innerHTML:'',textContent:''};
global.document={createElement:()=>({...node}),getElementById:()=>node,querySelector:()=>node,querySelectorAll:()=>[],addEventListener:noop,body:node};global.Image=function(){return {...node};};global.window={};global.d3=null;global.updateCyprusWidth=noop;global.localStorage={getItem:()=>null,setItem:noop};
const output=console.log,errors=[];console.log=(...args)=>{if(String(args[0]).startsWith('Error'))errors.push(args.join(' '));};
lib.convertJSONToGame(fs.readFileSync(path.join(root,'out/game.json'),'utf8'),(err,game)=>{
 if(err)throw err;let count=0;
 function test(label,run){errors.length=0;run();assert.deepEqual(errors,[],label);count++;output('PASS '+label);}
 function fresh(options={}){const e=new lib.DendryEngine(new lib.NullUserInterface(),game);window.dendryUI=global.dendryUI={dendryEngine:e};e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');Object.assign(e.state.qualities,{year:1974,month:7,week:2,flavour_events:0,CHP_in_government:1,prime_minister_party:'CHP',army_land_strength:.8,army_naval_strength:.8,army_aerial_strength:.8,us_relation:80,west_relation:80,hashas_done:0},options);e.goToScene('kibrisdarbe');e.random.random=()=>1;return e;}
 function pick(e,id){const a=e.getCurrentChoices(),n=a.findIndex(x=>x.id===id);assert(n>=0,'Missing '+id+' at '+e.state.sceneId);assert(!a[n].unavailable,id+' unavailable');e.choose(n);}
 function next(e){const choices=e.getCurrentChoices();assert(choices.some(x=>!x.unavailable),'Dead end '+e.state.sceneId);e.choose(choices.findIndex(x=>!x.unavailable));}
 function prepare(e){for(let i=0;i<40&&e.state.sceneId!=='cyprus_atilla1_20';i++)next(e);assert.equal(e.state.sceneId,'cyprus_atilla1_20');}


 function near(a,b,label,tolerance=1e-7){assert(Math.abs(a-b)<tolerance,label+': '+a+' vs '+b);}
 const N=global.AnatolianNationalCoalition;
 const tick=(Q,months)=>{const t=Q.year*24+(Q.month-1)*2+(Q.week===2?1:0)+months*2;Q.year=Math.floor(t/24);Q.month=Math.floor(t%24/2)+1;Q.week=t%2+1;N.update(Q);};

 const {performance}=require('perf_hooks');const e=fresh(),Q=e.state.qualities;Q.land_reform=3;
 function bench(name,fn,count=20){for(let i=0;i<3;i++)fn();const times=[];for(let i=0;i<count;i++){const start=performance.now();fn();times.push(performance.now()-start);}times.sort((a,b)=>a-b);output(JSON.stringify({name,medianMs:+times[Math.floor(times.length/2)].toFixed(3),p95Ms:+times[Math.min(times.length-1,Math.floor(times.length*.95))].toFixed(3)}));}
 bench('poll projection',()=>provinces.compute(Q,true));bench('unchanged sync',()=>provinces.sync(Q),100);bench('coalition summary',()=>N.snapshot(Q));bench('regional shift',()=>{const clone=JSON.parse(JSON.stringify(Q));provinces.shiftClass(clone,'rural','chp',.01);});bench('Koykent rally',()=>{const clone=JSON.parse(JSON.stringify(Q));clone.koykent_rally_timer=0;N.koykentRally(clone);},5);
});
