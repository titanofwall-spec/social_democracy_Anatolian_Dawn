const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');
const artifacts=process.env.LAYOUT_ARTIFACTS || require('os').tmpdir();
const server=http.createServer((req,res)=>{const rel=new URL(req.url,'http://localhost').pathname;const p=path.join(root,rel==='/'?'index.html':decodeURIComponent(rel));try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});
(async()=>{let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});
await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;});
const report=[];
for(const width of [1502,1440,1200,900,561,560,390])for(const wide of [false,true]){
 await page.setViewportSize({width,height:1000});
 await page.evaluate(wide=>{document.querySelector('#content').classList.toggle('wide-mode',wide);document.querySelector('#tools_wrapper').classList.toggle('wide-mode',wide);},wide);
 await page.waitForTimeout(100);
 const layout=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {menu:box('#header-links'),title:box('.ad-title-stack'),left:box('#stats_sidebar'),right:box('#party_sidebar'),position:getComputedStyle(document.querySelector('#tools_wrapper')).position};});
 if(width>560){assert(Math.abs(layout.left.top-layout.menu.top)<1,JSON.stringify(layout));assert(Math.abs(layout.right.top-layout.menu.top)<1,JSON.stringify(layout));}else{assert.equal(layout.position,'static');assert(layout.left.top>=layout.menu.bottom);assert(layout.right.top>=layout.left.bottom);}
 assert(Math.abs(layout.title.bottom-layout.menu.top)<1);
 for(const label of ['Save/Load','Options','Library','Achievements','Sandbox']){
  await page.locator('#header-links a').filter({hasText:label,exact:true}).click();
  const overlay=await page.evaluate(()=>{const title=document.querySelector('.ad-title-stack').getBoundingClientRect();const x=title.left+Math.min(70,title.width/2),y=title.top+10;return document.elementsFromPoint(x,y).find(el=>el.matches('.overlay, .overlay *'))?.closest('.overlay')?.id;});
  // Library is an in-page view, all modal menu items must cover the title.
  if(label!=='Library')assert(overlay,'Title is above '+label+' at '+width);
  if(width===1502&&!wide&&label==='Save/Load')await page.screenshot({path:path.join(artifacts,'save-load.png')});
  await page.evaluate(()=>{document.querySelectorAll('.overlay').forEach(el=>el.style.display='none');});
 }
 report.push({width,wide,menuTop:layout.menu.top,leftTop:layout.left.top,rightTop:layout.right.top});
 if(width===1502&&!wide)await page.screenshot({path:path.join(artifacts,'desktop.png')});
 if(width===390&&!wide)await page.screenshot({path:path.join(artifacts,'mobile.png'),fullPage:true});
}
assert.deepEqual(errors,[]);console.log(JSON.stringify(report,null,2));console.log('PASS: 14 responsive layouts, all five menu actions, modal layering, no browser errors.');
}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
