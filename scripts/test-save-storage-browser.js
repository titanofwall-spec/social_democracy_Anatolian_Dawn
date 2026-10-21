const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/umutc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../out/html');
const exportPath=path.join(require('os').tmpdir(),'anatolian-dawn-save-regression-'+process.pid+'.txt');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(root,'.'+rel+(rel==='/'?'index.html':''));if(!p.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.mp3':'audio/mpeg','.m4a':'audio/mp4','.png':'image/png'})[path.extname(p)]||'application/octet-stream');const data=fs.readFileSync(p),range=req.headers.range;if(range){const m=/bytes=(\d+)-(\d*)/.exec(range),start=Number(m[1]),end=m[2]?Number(m[2]):data.length-1;res.statusCode=206;res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+data.length);res.setHeader('Content-Length',end-start+1);res.end(data.subarray(start,end+1));}else{res.setHeader('Accept-Ranges','bytes');res.end(data);}}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.dendryUI&&window.AnatolianRules);
await page.evaluate(()=>{const e=dendryUI.dendryEngine;e.beginGame([1,2,3,4,5]);e.goToScene('root.start');e.goToScene('root.start_main');dendryUI.animate=false;jQuery.fx.off=true;window.changeTab('status.polls','poll_tab');});


assert.deepEqual(await page.evaluate(()=>AnatolianSenate.totals(dendryUI.dendryEngine.state.qualities)),{AP:87,chp:34,CGP:11,DP:8,MHP:1,IND:9});


const alerts=[];page.on('dialog',async d=>{alerts.push(d.message());await d.accept();});
await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;for(const year of [1973,1977,1981]){Object.assign(Q,{year,month:10,week:2});AnatolianProvinces.applyElection(Q,'general');Q.month=12;AnatolianProvinces.applyElection(Q,'local');}for(const event of AnatolianSenate.schedule){Object.assign(Q,{year:event.year,month:event.month,week:event.week});AnatolianSenate.elect(Q,event);}});

const size=await page.evaluate(()=>JSON.stringify(dendryUI.dendryEngine.getExportableState()).length);assert(size>1000000);
await page.evaluate(()=>{try{for(let i=0;i<100;i++)localStorage.setItem('_quota_fixture_'+i,'x'.repeat(100000));}catch(error){}});
await page.locator('#header-links a').filter({hasText:'Save/Load'}).click();
for(let i=0;i<8;i++){await page.waitForFunction(i=>document.getElementById('save_button_'+i).onclick!==null,i);await page.evaluate(i=>dendryUI.dendryEngine.state.qualities.resources=64+i,i);await page.locator('#save_button_'+i).click();await page.waitForFunction(i=>document.getElementById('save_button_'+i).textContent==='Load',i);}
await page.reload();await page.waitForFunction(()=>window.dendryUI?._durableSavesInstalled);await page.locator('#header-links a').filter({hasText:'Save/Load'}).click();await page.waitForFunction(()=>document.getElementById('save_button_7').textContent==='Load');
await page.locator('#save_button_7').click();await page.waitForFunction(()=>dendryUI.dendryEngine.state.qualities.resources===71);await page.evaluate(()=>dendryUI.waitForSaves());
await page.evaluate(async()=>{dendryUI.dendryEngine.state.qualities.resources=88;await dendryUI.quickSave();dendryUI.dendryEngine.state.qualities.resources=0;await dendryUI.quickLoad();});assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),88);
await page.evaluate(async()=>{dendryUI.dendryEngine.state.qualities.resources=101;await dendryUI.autosave();dendryUI.dendryEngine.state.qualities.resources=102;await dendryUI.autosave();dendryUI.dendryEngine.state.qualities.resources=0;await dendryUI.loadSlot('a1');});assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),101);

const failed=await page.evaluate(async()=>{const u=dendryUI,original=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(name,mode){const tx=original.apply(this,arguments);if(mode==='readwrite')queueMicrotask(()=>tx.abort());return tx;};u.dendryEngine.state.qualities.resources=333;try{return await u.saveSlot('7');}finally{IDBDatabase.prototype.transaction=original;}});assert.equal(failed,false);assert(alerts.some(s=>s.includes('Your previous saves have been kept')));await page.evaluate(()=>dendryUI.loadSlot('7'));assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),71);
await page.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('_quota_fixture_'))localStorage.removeItem(k);});

// A legacy localStorage slot remains readable without conversion or deletion.
await page.evaluate(async()=>{const u=dendryUI;u.save_prefix+='_legacy';u.dendryEngine.state.qualities.resources=123;localStorage.setItem(u.save_prefix+'_0',JSON.stringify(u.dendryEngine.getExportableState()));localStorage.setItem(u.save_prefix+'_timestamp_0','Legacy save');u.dendryEngine.state.qualities.resources=0;await u.loadSlot('0');});assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),123);
await page.evaluate(()=>dendryUI.showSaveSlots());
for(let p=0;p<10;p++){
 assert.equal(await page.locator('#save-page-label').innerText(),'Page '+(p+1)+' / 10');
 assert.equal(await page.locator('#save-slot-rows .save_button').count(),15);
 const slot=p*10+9;await page.waitForFunction(slot=>document.getElementById('save_button_'+slot)?.onclick!==null,slot);
 await page.evaluate(slot=>{dendryUI.dendryEngine.state.qualities.resources=500+slot;},slot);
 await page.locator('#save_button_'+slot).click();await page.waitForFunction(slot=>document.getElementById('save_button_'+slot).textContent==='Load',slot);
 if(p<9)await page.getByRole('button',{name:'Next save page',exact:true}).click();
}
assert(await page.getByRole('button',{name:'Next save page',exact:true}).isDisabled());
await page.evaluate(()=>dendryUI.loadSlot('99')); assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),599);
await page.evaluate(()=>dendryUI.showSaveSlots());
await page.waitForFunction(()=>document.getElementById('export_button_99')?.onclick!==null&&!document.getElementById('export_button_99').disabled); console.log('Checking last-page export');const lastDownload=page.waitForEvent('download');await page.locator('#export_button_99').click();await (await lastDownload).saveAs(exportPath);assert.equal(JSON.parse(fs.readFileSync(exportPath,'utf8')).qualities.resources,599);
await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources=0);await page.locator('#import_save').setInputFiles(exportPath);await page.waitForFunction(()=>dendryUI.dendryEngine.state.qualities.resources===599);await page.waitForFunction(()=>document.getElementById('save').style.display==='none');
await page.reload();await page.waitForFunction(()=>window.dendryUI?._durableSavesInstalled);await page.evaluate(()=>{dendryUI.save_prefix+='_legacy';dendryUI.showSaveSlots();});
for(let p=0;p<9;p++)await page.getByRole('button',{name:'Next save page',exact:true}).click();
await page.waitForFunction(()=>document.getElementById('save_button_99').textContent==='Load');await page.evaluate(()=>dendryUI.loadSlot('99')); assert.equal(await page.evaluate(()=>dendryUI.dendryEngine.state.qualities.resources),599);
const timed=await page.evaluate(async()=>{const u=dendryUI,Q=u.dendryEngine.state.qualities;u.save_prefix+='_timed';Object.assign(Q,{year:1974,month:1,week:1});delete Q.save_autosave_calendar;
 const records=async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(AnatolianSaveStorage.databaseName,1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{return await Promise.all(['a2','a3','a4'].map(slot=>new Promise((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get(u.save_prefix+'_'+slot);r.onsuccess=()=>resolve(r.result?JSON.parse(r.result.data).qualities.month:null);r.onerror=()=>reject(r.error);})));}finally{db.close();}};
 const snapshots=[];await u.autosave();snapshots.push(await records());Q.month=2;Q.week=2;await u.autosave();snapshots.push(await records());Q.month=3;Q.week=1;await u.autosave();snapshots.push(await records());Q.month=5;await u.autosave();snapshots.push(await records());await u.saveSlot('99');await u.loadSlot('99');u.dendryEngine.state.qualities.month=7;await u.autosave();snapshots.push(await records());await u.autosave();snapshots.push(await records());return snapshots;});
assert.deepEqual(timed,[[null,null,null],[null,null,null],[3,null,null],[5,5,null],[7,5,7],[7,5,7]]);
await page.evaluate(()=>{const Q=dendryUI.dendryEngine.state.qualities;document.getElementById('content').innerHTML=AnatolianSenate.html(Q)+AnatolianKurdishOrganizations.organizationHtml(Q);});
for(const label of ['Appointed','MBK','Ex Presidents']){const el=page.locator('#content .wide_tooltip-wrap').filter({hasText:label}).first();assert.equal(await el.locator('.wide_tooltip-tip').count(),1);await el.hover();assert.equal(await page.locator('#leader-tooltip-layer .wide_tooltip-tip').count(),1);}
await page.evaluate(()=>dendryUI.waitForSaves());assert.deepEqual(errors,[]);console.log('PASS Chrome: large campaign, ten save pages, slot 100 reload/export/import, 2/4/6-month autosaves, legacy and failure recovery, and Senate portrait-style tooltips.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));if(fs.existsSync(exportPath))fs.unlinkSync(exportPath);}})().catch(e=>{console.error(e);process.exitCode=1;});
