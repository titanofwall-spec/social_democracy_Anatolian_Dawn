const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');

const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;window.changeTab('status.polls','poll_tab');});




await page.evaluate(()=>{const e=dendryUI.dendryEngine,Q=e.state.qualities;Object.assign(Q,{year:1973,month:10,week:2,president:'Fahri Korutürk'});Q.senate_state.president1973='Fahri Korutürk';e.goToScene('senate_election.results');});
const svg=page.locator('.senate-election-parliament').last();assert.equal(await svg.locator('[data-senate-group="elected"]').count(),150);assert.equal(await svg.locator('[data-senate-group="appointed"]').count(),15);assert.equal(await svg.locator('[data-party="MBK"]').count(),18);assert.equal(await svg.locator('[data-party="former-president"]').count(),2);
assert.deepEqual(await svg.locator('[data-party="MBK"]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('fill')))]),['#5b7387']);assert.deepEqual(await svg.locator('[data-party="former-president"]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('fill')))]),['#ff0000']);
await svg.screenshot({path:require('os').tmpdir()+'/anatolian-senate-chamber.png'});
await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;Object.assign(Q,{year:1975,month:10,week:2});AnatolianSenate.elect(Q,AnatolianSenate.schedule[1]);Object.assign(Q,{year:1981,month:6,week:1});openProvinceElectionMap();});
await page.getByRole('tab',{name:'1975 Senate A',exact:true}).click();const mapSvg=page.locator('.province-parliament');assert.equal(await mapSvg.locator('[data-senate-group="elected"]').count(),150);assert.equal(await mapSvg.locator('[data-party="former-president"]').count(),1);
await page.getByRole('tab',{name:'1973 Senate C',exact:true}).click();assert.equal(await mapSvg.locator('[data-party="former-president"]').count(),2);
await page.evaluate(()=>document.body.classList.add('dark-mode'));assert.equal(await mapSvg.locator('[data-senate-group="appointed"]').count(),15);
assert.deepEqual(errors,[]);console.log('PASS Chrome: election event and archived map use separate permanent/elected/appointed blocks, correct counts and colors, and date-preserved former presidents.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
