const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');

const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;window.changeTab('status.polls','poll_tab');});




await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;Object.assign(Q,{year:1973,month:10,week:2});AnatolianProvinces.applyElection(Q,'general');Object.assign(Q,{month:12});AnatolianProvinces.applyElection(Q,'local');AnatolianSenate.elect(Q,AnatolianSenate.schedule[0]);openProvinceElectionMap();});
await page.waitForFunction(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('turkey-physical-overlay.png')));
for(const dark of [false,true]){await page.evaluate(dark=>document.body.classList.toggle('dark-mode',dark),dark);
for(const tab of ['Current polls','1973 General','1973 Local','1973 Senate C']){
 await page.getByRole('tab',{name:tab,exact:true}).click();const image=page.locator('#province-election-overlay .turkey-physical-overlay');assert.equal(await image.count(),1);assert.deepEqual(await image.evaluate(el=>({blend:getComputedStyle(el).mixBlendMode,pointer:getComputedStyle(el).pointerEvents,last:el===el.parentElement.lastElementChild})),{blend:'multiply',pointer:'none',last:true});
 if(tab!=='1973 Senate C'){await page.locator('#province-election-overlay [data-province="ankara"]').click();await page.locator('.province-detail').waitFor();await page.getByRole('button',{name:'Close province details'}).click();}
}
}
await page.getByRole('tab',{name:'Current polls',exact:true}).click();await page.evaluate(()=>document.body.classList.remove('dark-mode'));await page.locator('#province-election-overlay .province-map-canvas').screenshot({path:require('os').tmpdir()+'/anatolian-physical-overlay.png'});
await page.getByRole('button',{name:'Close election map',exact:true}).click();
await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{municipality_control_level:2,municipality_timer:0,cyprus_mode:0});e.playPinnedCard('municipalities');});assert.equal(await page.locator('.municipal-control-map .turkey-physical-overlay').count(),1);await page.locator('.municipal-control-map [data-province="ankara"]').click();await page.locator('.province-detail').waitFor();await page.getByRole('button',{name:'Close province details'}).click();await page.getByRole('button',{name:'Close election map',exact:true}).click();
await page.evaluate(()=>dendryUI.dendryEngine.goToScene('senate_election.results'));assert.equal(await page.locator('.election-results-map .turkey-physical-overlay').last().count(),1);
assert.deepEqual(errors,[]);console.log('PASS Chrome: Multiply terrain layer on polls, general/local/Senate maps, municipality card and election event; clickable province detail overlays in both themes.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
