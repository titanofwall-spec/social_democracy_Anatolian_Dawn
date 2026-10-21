const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');

const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;window.changeTab('status.polls','poll_tab');});



await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;Object.assign(Q,{year:1979,month:2,week:1});AnatolianKurdishOrganizations.update(Q);window.changeTab('status.social_issues','social_issues_tab');});
for(const dark of [false,true]){
 await page.evaluate(dark=>document.body.classList.toggle('dark-mode',dark),dark);
 const trigger=page.locator('[data-kurdish-organizations="support"]');assert.equal(await trigger.count(),1);await trigger.hover();assert.equal(await page.locator('#leader-tooltip-layer').count(),0);
 const before=await page.evaluate(()=>JSON.stringify(dendryUI.dendryEngine.state.qualities.kurdish_org_state));
 await trigger.click();const dialog=page.getByRole('dialog',{name:'KG / Political Support',exact:true});await dialog.waitFor();assert.equal(await dialog.locator('.kurdish-organizations-scroll>span').count(),11);
 const box=await dialog.boundingBox();assert(box.width<=400&&box.height<=500);
 assert(await dialog.getByText('T-KDP',{exact:true}).isVisible());assert((await dialog.innerText()).includes('Active members: Not configured'));
 assert(await dialog.locator('.kurdish-organizations-scroll').evaluate(el=>getComputedStyle(el).overflowY==='scroll'&&el.scrollHeight>el.clientHeight));
 await dialog.locator('.kurdish-organizations-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);assert(await dialog.getByText('Tekoşin',{exact:true}).isVisible());
 await page.keyboard.press('Escape');assert.equal(await page.locator('.kurdish-organizations-dialog').count(),0);assert(await trigger.evaluate(el=>document.activeElement===el));
 assert.equal(await page.evaluate(()=>JSON.stringify(dendryUI.dendryEngine.state.qualities.kurdish_org_state)),before);
}
await page.evaluate(()=>window.changeTab('status.paramilitaries','paramilitary_tab'));
await page.locator('[data-kurdish-organizations="paramilitary"]').click();await page.getByRole('dialog',{name:'Kurdish Paramilitaries',exact:true}).waitFor();assert.equal(await page.locator('.kurdish-organizations-scroll>span').count(),11);
await page.getByRole('button',{name:'Close Kurdish organizations'}).click();assert.equal(await page.locator('.kurdish-organizations-dialog').count(),0);
await page.setViewportSize({width:360,height:640});await page.locator('[data-kurdish-organizations="paramilitary"]').click();const small=await page.locator('.kurdish-organizations-dialog').boundingBox();assert(small.x>=0&&small.x+small.width<=360&&small.y>=0&&small.y+small.height<=640);
await page.locator('.kurdish-organizations-backdrop').click({position:{x:2,y:2}});assert.equal(await page.locator('.kurdish-organizations-dialog').count(),0);
assert.deepEqual(errors,[]);console.log('PASS Chrome: both real sidebar triggers, no hover tooltips, eleven scrollable organization records, light/dark modes, mobile bounds, close/Escape/backdrop, focus restoration and read-only state.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
