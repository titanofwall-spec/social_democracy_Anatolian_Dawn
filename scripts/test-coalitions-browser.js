const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');

const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);

await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;Object.assign(e.state.qualities,{year:1973,month:10,week:2,chp_seats:185,AP_seats:149,CGP_seats:13,MSP_seats:48,DP_seats:45,largest_party_key:'chp',CGP_relation:60,AP_relation:60,MSP_relation:60});AnatolianCoalitions.start(e.state.qualities);e.goToScene('coalition_negotiations');});
async function pick(id){await page.evaluate(id=>{const e=dendryUI.dendryEngine,c=e.getCurrentChoices(),i=c.findIndex(c=>c.id===id);if(i<0||c[i].unavailable)throw Error('Unavailable '+id+' at '+e.state.sceneId+': '+JSON.stringify(c));e.choose(i);},id);}
assert((await page.locator('#content').innerText()).includes('the mandate to form the government is given'));
await pick('coalition_negotiations.first_attempt');
assert((await page.locator('#content').innerText()).includes('not great enough'));
await pick('coalition_negotiations.skip_unviable');
assert((await page.locator('#content').innerText()).includes('Deniz Baykal'));
await pick('coalition_negotiations.attempt');await pick('coalition_negotiations.open_talks');
assert((await page.locator('#content').innerText()).includes('Room 280'));
assert((await page.locator('#content').innerText()).includes('Kamil Kırıkoğlu'));
await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;Q.party_secretary='Eyüboğlu';Q.party_secretary_id='eyuboglu';});
assert((await page.evaluate(()=>AnatolianCoalitions.eventText(dendryUI.dendryEngine.state.qualities,'talks'))).includes('Orhan Eyüboğlu'));
await pick('coalition_negotiations.msp_postponement');
assert((await page.locator('#content').innerText()).includes('postponed until May 1974'));
await pick('coalition_negotiations.negotiate_after_msp');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.sceneId),'coalition_negotiations.ministries');
const quota=await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.coalition_formation.pending.quota);
for(const m of ['foreign','interior','justice','labor','defense','economic','finance','agriculture','education','industrial'].slice(0,quota))await pick('coalition_negotiations.min_'+m);
await pick('coalition_negotiations.powers');
assert((await page.locator('#content').innerText()).includes('1. Demand Concessions'));
assert((await page.locator('#content').innerText()).includes('2. Offer Concessions'));
await pick('coalition_negotiations.claims');
assert.equal((await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).filter(c=>c.id==='coalition_negotiations.player_koykent').length,1);
await pick('coalition_negotiations.player_koykent');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.sceneId),'coalition_negotiations.claims');
assert.equal(await page.evaluate(()=>AnatolianCoalitions.counts(dendryUI.dendryEngine.state.qualities.coalition_formation.pending.rights).player),5);
await pick('coalition_negotiations.player_koykent');
await pick('coalition_negotiations.player_ministry_agriculture');
assert(!(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>['coalition_negotiations.player_list_4','coalition_negotiations.player_list_5','coalition_negotiations.player_list_6'].includes(c.id)));
await pick('coalition_negotiations.claims');
assert(!(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id.includes('_list_')));
assert(!(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id==='coalition_negotiations.player_ministry_education'));
assert((await page.locator('#content').innerText()).includes('3 contested affairs'));
await pick('coalition_negotiations.player_ministry_defense');
assert((await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id==='coalition_negotiations.player_list_96'));
await pick('coalition_negotiations.player_list_96');await pick('coalition_negotiations.powers');
assert(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices().find(c=>c.id==='coalition_negotiations.sign').canChoose===false));
await pick('coalition_negotiations.concessions');await pick('coalition_negotiations.partner_ministry_defense');
await pick('coalition_negotiations.partner_list_98');
const party=page.locator('#content .mytooltip').filter({hasText:'MSP'}).first();assert(await party.count());await party.hover();assert(await page.locator('#leader-tooltip-layer').isVisible());
assert(!(await page.locator('#content').innerText()).match(/\bpartner\b/i));
await pick('coalition_negotiations.powers');await pick('coalition_negotiations.sign');
assert.deepEqual(await page.evaluate(()=>AnatolianCoalitions.counts(dendryUI.dendryEngine.state.qualities.coalition_government.rights)),{player:1,partner:1});
assert(await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;return !AnatolianCoalitions.powerAccess(Q,'education_science.koykent')&&!e._runPredicate(e.game.scenes.education_science.viewIf,true);}));
const result=await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities,C=AnatolianCoalitions;Q.resources=10;Q.budget=100;Q.speculativee=0;const a=C.data.find(a=>a.row===6),before=Q.resources;e.goToScene(a.scenes[0]);const paid=before-Q.resources;const Y=Q.coalition_government.yellowUses;const blocked=C.data.find(a=>a.row===parseInt(Object.keys(Q.coalition_government.rights).find(k=>Q.coalition_government.rights[k]==='partner').split('-')[1]));const previous=e.state.sceneId;e.goToScene(blocked.scenes[0]);return {paid,Y,blocked:e.state.sceneId===previous,parties:C.ensure(Q).partners,active:C.active(Q),gov:Q.CHP_in_government,majority:Q.in_CHP_majority,seats:Q.chp_seats,installed:e._coalitionInstalled,scene:e.state.sceneId,resources:Q.resources,hook:e.__changeScene.toString().slice(0,180),mapped:Object.keys(C.byScene).length,reason:C.reason(Q,a.scenes[0]),id:a.scenes[0]};});
assert.equal(result.paid,1);assert.equal(result.Y,1);assert(result.blocked);assert.deepEqual(result.parties,['MSP']);
for(const dark of [false,true]){await page.evaluate(dark=>{document.body.classList.toggle('dark-mode',dark);const e=dendryUI.dendryEngine;e.state.qualities.coalition_dissent=20;e.goToScene('coalition_affairs');},dark);assert((await page.locator('#content').innerText()).includes('Unresolved uses: 1'));}
await page.screenshot({path:path.resolve(__dirname,'../../tmp/coalition-browser.png'),fullPage:true});
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{year:1973,chp_seats:150,AP_seats:200,CGP_seats:50,MSP_seats:40,DP_seats:10,largest_party_key:'AP',CGP_relation:60});AnatolianCoalitions.start(Q);e.goToScene('coalition_negotiations');});
assert((await page.locator('#content').innerText()).includes('the mandate to form the government is given'));
await pick('coalition_negotiations.first_attempt');await pick('coalition_negotiations.open_talks');
assert((await page.locator('#content').innerText()).includes('final months of the Memorandum period'));
assert(!(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id==='coalition_negotiations.negotiate'));
await pick('coalition_negotiations.npc_negotiate');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.sceneId),'coalition_negotiations.right_offer');
assert((await page.locator('#content').innerText()).includes('an agreement has finally been reached!'));
assert.equal(await page.locator('.coalition-cabinet li').count(),10);
await page.screenshot({path:path.resolve(__dirname,'../../tmp/authored-coalition-cabinet.png'),fullPage:false});
assert(!(await page.locator('#content').innerText()).includes('Demand Concessions'));
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.CHP_in_government),0);
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{year:1973,chp_seats:185,AP_seats:149,CGP_seats:13,MSP_seats:48,DP_seats:45,largest_party_key:'chp',AP_relation:60,MSP_relation:60});AnatolianCoalitions.start(Q);const f=Q.coalition_formation;f.index=2;f.stage='attempt';e.goToScene('coalition_negotiations.attempt');});
await pick('coalition_negotiations.open_talks');
assert((await page.locator('#content').innerText()).includes('Sadi Irmak'));
await pick('coalition_negotiations.accept_nonpartisan');
const apQuota=await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.coalition_formation.pending.quota);
for(const m of ['foreign','interior','justice','labor','defense','economic','finance','agriculture','education','industrial'].slice(0,apQuota))await pick('coalition_negotiations.min_'+m);
await pick('coalition_negotiations.powers');await pick('coalition_negotiations.sign');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.prime_minister),'Sadi Irmak');
assert((await page.locator('.coalition-cabinet').innerText()).includes('Deputy Prime Ministers:'));
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;AnatolianCoalitions.start(Q);const f=Q.coalition_formation;f.leader='AP';f.round='second';f.attempts=['CHP'];f.stage='attempt';e.goToScene('coalition_negotiations.attempt');});
await pick('coalition_negotiations.open_talks');
assert((await page.locator('#content').innerText()).includes('The audacity!'));
assert.deepEqual(await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices().filter(c=>c.canChoose).map(c=>c.id)),['coalition_negotiations.reject']);
await pick('coalition_negotiations.reject');await pick('coalition_negotiations.route');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.sceneId),'coalition_negotiations.talu');
await pick('coalition_negotiations.refuse_talu');
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.prime_minister),'Naim Talu');
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{month:12,local_largest_party_key:'chp',chp_local_votes_dec:37.36,chp_r:33.3});AnatolianCoalitions.afterLocal(Q);e.goToScene('coalition_negotiations.route');});
assert((await page.locator('#content').innerText()).includes('At last, some good news!'));
await pick('coalition_negotiations.first_attempt');await pick('coalition_negotiations.open_talks');
assert((await page.locator('#content').innerText()).includes('neither Mr. Ecevit nor Mr. Erbakan'));
await pick('coalition_negotiations.reject');await pick('coalition_negotiations.route');await pick('coalition_negotiations.right_final');await pick('coalition_negotiations.attempt');await pick('coalition_negotiations.open_talks');await pick('coalition_negotiations.npc_negotiate');
assert((await page.locator('#content').innerText()).includes('Ferruh Bozbeyli'));
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.DP_in_government),0);
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.DP_external_support),1);
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{year:1973,chp_seats:150,AP_seats:230,largest_party_key:'AP'});AnatolianCoalitions.start(Q);e.goToScene('coalition_negotiations');});
await pick('coalition_negotiations.ap_majority');assert.equal(await page.locator('.coalition-cabinet li').count(),10);
assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.AP_in_government),1);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;Object.assign(e.state.qualities,{year:1975,month:10,week:2});e.goToScene('senate_election.results');});
assert((await page.locator('#content').innerText()).includes('Seat changes:'));
assert((await page.locator('#content').innerText()).indexOf('Seat changes:')>(await page.locator('#content').innerText()).indexOf('Elected:'));
for(const relation of [5,6,15,30,90]){await page.evaluate(relation=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{year:1973,month:10,week:2,largest_party_key:'chp',chp_seats:185,AP_seats:149,AP_relation:relation});AnatolianCoalitions.start(Q);Q.coalition_formation.attempts=['AP'];Q.coalition_formation.index=0;e.goToScene('coalition_negotiations.attempt');},relation);const choices=await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices()),open=choices.find(c=>c.id==='coalition_negotiations.open_talks');assert.equal(open.canChoose,relation>5);if(relation>5){await pick('coalition_negotiations.open_talks');assert((await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id==='coalition_negotiations.accept_nonpartisan'&&c.canChoose));}else assert(choices.some(c=>c.id==='coalition_negotiations.skip_unviable'&&c.canChoose));}
for(const [year,headings]of [[1974,['PKK is founded','TKSP/DHKD is founded']],[1975,['KİP/DDKD/KÖİP/PPKK is founded']],[1976,['Kawa is founded','Rizgarî is founded']],[1978,['Kawa fractures','KUK is founded','Têkoşîn is founded']],[1979,['Rızgarî splits']]]){await page.evaluate(year=>{const e=dendryUI.dendryEngine;Object.assign(e.state.qualities,{year,month:12,week:1});e.goToScene('kurdish_org_founding_'+year);},year);const text=await page.locator('#content').innerText();for(const heading of headings)assert(text.replace(/\s+/g,' ').includes(heading),heading);assert(!text.includes('Placeholder'));assert((await page.evaluate(()=>dendryUI.dendryEngine.getCurrentChoices())).some(c=>c.id==='kurdish_org_founding_'+year+'.acknowledge'&&c.canChoose));}
assert.deepEqual(errors,[]);console.log('PASS Chrome: authored first/renewed 1973 branches, dynamic secretary, Irmak acceptance, compulsory Demirel refusal, Talu caretaker, AP and opposition cabinet automation, DP external support, ministry ownership and balanced concessions.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});









