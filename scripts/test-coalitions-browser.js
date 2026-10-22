const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');

const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);

await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;Object.assign(e.state.qualities,{year:1973,month:10,week:2,chp_seats:185,AP_seats:149,CGP_seats:13,MSP_seats:48,DP_seats:45,largest_party_key:'chp',CGP_relation:60,AP_relation:60,MSP_relation:60});AnatolianCoalitions.start(e.state.qualities);e.goToScene('coalition_negotiations');});
async function pick(id){await page.evaluate(id=>{const e=dendryUI.dendryEngine,c=e.getCurrentChoices(),i=c.findIndex(c=>c.id===id);if(i<0||c[i].unavailable)throw Error('Unavailable '+id+' at '+e.state.sceneId+': '+JSON.stringify(c));e.choose(i);},id);}
await pick('coalition_negotiations.first_attempt');
assert((await page.locator('#content').innerText()).includes('Placeholder'));
await pick('coalition_negotiations.reject');await pick('coalition_negotiations.route');
await pick('coalition_negotiations.negotiate');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.sceneId),'coalition_negotiations.ministries');
const quota=await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.coalition_formation.pending.quota);
for(const m of ['foreign','interior','justice','labor','defense','economic','finance','agriculture','education','industrial'].slice(0,quota))await pick('coalition_negotiations.min_'+m);
await pick('coalition_negotiations.powers');await pick('coalition_negotiations.claims');
assert((await page.locator('#content').innerText()).includes('Demand contested affairs of the Defense Ministry'));
assert((await page.locator('#content').innerText()).includes('3 contested affairs'));
assert(!(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id.includes('_list_')));
await pick('coalition_negotiations.player_ministry_defense');await pick('coalition_negotiations.powers');
assert(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices().find(c=>c.id==='coalition_negotiations.sign').canChoose===false));
await pick('coalition_negotiations.concessions');
assert((await page.locator('#content').innerText()).includes('Concede contested affairs of the Education Ministry'));
await pick('coalition_negotiations.partner_ministry_education');await pick('coalition_negotiations.powers');await pick('coalition_negotiations.sign');
assert.deepEqual(await page.evaluate(()=>AnatolianCoalitions.counts(dendryUI.dendryEngine.state.qualities.coalition_government.rights)),{player:3,partner:3});
const result=await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities,C=AnatolianCoalitions;Q.resources=10;Q.budget=100;Q.speculativee=0;const a=C.data.find(a=>a.row===6),before=Q.resources;e.goToScene(a.scenes[0]);const paid=before-Q.resources;const Y=Q.coalition_government.yellowUses;const blocked=C.data.find(a=>a.row===parseInt(Object.keys(Q.coalition_government.rights).find(k=>Q.coalition_government.rights[k]==='partner').split('-')[1]));const previous=e.state.sceneId;e.goToScene(blocked.scenes[0]);return {paid,Y,blocked:e.state.sceneId===previous,parties:C.ensure(Q).partners,active:C.active(Q),gov:Q.CHP_in_government,majority:Q.in_CHP_majority,seats:Q.chp_seats,installed:e._coalitionInstalled,scene:e.state.sceneId,resources:Q.resources,hook:e.__changeScene.toString().slice(0,180),mapped:Object.keys(C.byScene).length,reason:C.reason(Q,a.scenes[0]),id:a.scenes[0]};});
assert.equal(result.paid,1);assert.equal(result.Y,1);assert(result.blocked);assert.deepEqual(result.parties,['MSP']);
for(const dark of [false,true]){await page.evaluate(dark=>{document.body.classList.toggle('dark-mode',dark);const e=dendryUI.dendryEngine;e.state.qualities.coalition_dissent=20;e.goToScene('coalition_affairs');},dark);assert((await page.locator('#content').innerText()).includes('Unresolved uses: 1'));}
await page.screenshot({path:path.resolve(__dirname,'../../tmp/coalition-browser.png'),fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS Chrome: interactive formation, ministry quota, ministry-wide bundles with visible affair counts, balanced totals, binding concessions, repeat-use resource gate, dissent breakdown and light/dark rendering.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});



