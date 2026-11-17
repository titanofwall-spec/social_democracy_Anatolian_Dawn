const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
let now=0,content='',nextTimer=1;const timers=new Map();
class AudioStub{constructor(src){this.src=src;this.paused=true;this.volume=1;this.loop=false;this.currentTime=0;this.duration=120;this.ended=false;this.plays=0;}play(){this.paused=false;this.plays++;return Promise.resolve();}pause(){this.paused=true;}getAttribute(){return this.src;}}
const ctx={Audio:AudioStub,Date:{now:()=>now},setInterval:cb=>{const id=nextTimer++;timers.set(id,cb);return id;},clearInterval:id=>timers.delete(id),document:{querySelector:()=>({textContent:content}),querySelectorAll:()=>[]}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../out/html/cyprus-presentation.js'),'utf8'),ctx);
const api=ctx.AnatolianCyprusPresentation,normal='music/50yilmarsi.mp3',ui={currentAudio:new AudioStub(normal),currentAudioURL:normal,audioPlaylist:[normal],audioQueue:[],disable_audio:false,setBg:()=>{},audio:()=>{},dendryEngine:{state:{sceneId:'main',qualities:{cyprus_mode:0}},setState(state){this.state=state;}}};
api.install(ui);const state=ui.dendryEngine.state,Q=state.qualities;
Object.assign(Q,{cyprus_mode:1,cyprus_campaign_resolved:0});api.sync();assert.equal(ui.currentAudioURL,api.tracks[0]);
Object.assign(Q,{cyprus_campaign_resolved:1});state.sceneId='cyprus_campaign_final';api.startEndingMusic();const ending=ui.currentAudio;assert.equal(ui.currentAudioURL,'music/karaoglan-rally.mp3');assert(ending.loop);
state.sceneId='cyprus_gratitude';api.sync();assert.strictEqual(ui.currentAudio,ending);state.sceneId='cyprus_sarachane_rally';api.startEndingMusic();assert.strictEqual(ui.currentAudio,ending);
api.finishEndingMusic();state.sceneId='main';Q.cyprus_mode=0;api.sync();assert.strictEqual(ui.currentAudio,ending);assert(!ending.paused);assert(!ending.loop);
ending.currentTime=118;ending.ontimeupdate();assert(Math.abs(ending.volume-.4)<1e-9);ending.ended=true;ending.onended();assert.equal(ui.currentAudioURL,normal);assert(ending.paused);assert.equal(ui.currentAudio.volume,1);
console.log('PASS Ending music spans settlement, Gratitude and rally, finishes naturally, fades and restores normal music');
Object.assign(Q,{cyprus_mode:1,cyprus_campaign_resolved:0});state.sceneId='song-event';content='Our soldiers played Bir Gece Ansızın Gelebilirim.';api.sync();assert.equal(ui.currentAudioURL,'music/bir-gece-event.mp3');const song=ui.currentAudio;state.sceneId='main';content='';api.sync();assert.strictEqual(ui.currentAudio,song);now+=2500;for(const cb of [...timers.values()])cb();assert(Math.abs(song.volume-.5)<1e-9);now+=2500;for(const cb of [...timers.values()])cb();assert(song.paused);assert.equal(ui.currentAudioURL,api.tracks[0]);assert.equal(timers.size,0);
console.log('PASS Named song event starts supplied MP3 and cross-event exit fades for five seconds before Cyprus soundtrack resumes');
state.sceneId='cyprus_campaign_final';Q.cyprus_campaign_resolved=1;api.startEndingMusic();const abandoned=ui.currentAudio;ui.dendryEngine.setState({sceneId:'main',qualities:{cyprus_mode:0,cyprus_campaign_resolved:0}});assert(abandoned.paused);assert.equal(ui.currentAudioURL,normal);
ui.disable_audio=true;api.startEventSong();assert.equal(ui.currentAudio.plays,0);
console.log('PASS Save restoration clears obsolete event music, and event tracks respect muted audio');
