/* Campaign music and Cyprus frontline transitions. */
(function(root){'use strict';
const tracks=['music/gercekkibris1.m4a','music/cyprus.m4a','music/cyprus1.m4a'];
const normalTracks=["music/50yilmarsi.mp3", "music/Yeni_Bir_Turkiye.mp3", "music/Oy_Gulum_Oy.mp3", "music/Canim_Ecevit.mp3", "music/Dısarda_Kar_Yagiyor.mp3", "music/Sev_Kardesim_Senay.mp3", "music/Neye_Geldim_Dunyaya.mp3", "music/Kumsaldaki_Izler_Juanito.mp3", "music/Semiramis_Pekkan_Senden_Vazgecemem.mp3", "music/Genclik_Basimda_Duman.mp3", "music/Ersan_Erdura_Acılar_Surekli_Olamaz.mp3", "music/Juanito_Arkadasimin_Askisin.mp3", "music/Nilufer_dunya_donuyor.mp3", "music/Nilufer_selam_soyle.mp3", "music/gozleri_aska_gulen.mp3", "music/herkeskendinebenzer.mp3", "music/helvaci.mp3", "music/gecevakti.mp3", "music/dostlarbenihatirlasin.mp3", "music/sultanıyegah.mp3", "music/omurbiteryolbitmez.mp3", "music/Tamirci_Ciragi.mp3", "music/bahceleregeldibahar.mp3", "music/gozlerikaradilber.mp3", "music/kecivurdumcayira.mp3"];
const special='music/karaoglan-rally.mp3',normalBackground='img/map_4.jpg',cyprusBackground='img/harekat2.jpg';
const active=Q=>Number(Q?.cyprus_mode)>0&&!Q.cyprus_campaign_resolved;
const cyprusBg=url=>/img\/(?:harekat2|kibriss)\.jpg(?:\?|$)/.test(String(url));
let feature=null;
let ui,normal=null,inCampaign=false,musicOwned=false,lastBackgroundMode=null,lastMap='',pendingMaps=new Map(),requests=new WeakMap();
function play(audio){const result=audio.play();if(result?.catch)result.catch(()=>{});}
function stop(audio){if(!audio)return;if(root.jQuery)root.jQuery(audio).stop(true,false);audio.pause();audio.onended=null;audio.loop=false;}
function playlist(list,first,audio,shuffle=false){stop(ui.currentAudio);ui.audioPlaylist=list.slice();ui.audioQueue=[];const selected=list.includes(first)?first:list[0];ui.currentAudio=audio||new Audio(selected);ui.currentAudioURL=selected;if(!audio)ui.currentAudio.src=selected;ui.currentAudio.loop=false;ui.currentAudio.volume=1;ui.currentAudio.onended=function(){if(ui.currentAudio!==this)return;const index=ui.audioPlaylist.indexOf(ui.currentAudioURL),next=ui.audioPlaylist[shuffle&&ui.audioPlaylist.length>1?(index+1+Math.floor(Math.random()*(ui.audioPlaylist.length-1)))%ui.audioPlaylist.length:(index+1)%ui.audioPlaylist.length];ui.currentAudioURL=next;this.src=next;if(!ui.disable_audio)play(this);};if(!ui.disable_audio)play(ui.currentAudio);}
function rememberNormal(){const list=(ui.audioPlaylist||[]).filter(t=>t&&t!=='none'&&t!=='null'&&!tracks.includes(t)&&t!==special);if(list.length)normal={list:list.slice(),url:list.includes(ui.currentAudioURL)?ui.currentAudioURL:list[0],audio:!tracks.includes(ui.currentAudioURL)&&ui.currentAudioURL!==special?ui.currentAudio:null};}
function resumeNormal(){if(!ui)return;const saved=normal;playlist(saved?.list?.length?saved.list:normalTracks,saved?.url,saved?.audio,true);musicOwned=false;inCampaign=false;}
function startFeature(url,kind,scene){
 if(!ui)return;
 if(feature&&feature.url===url){feature.scene=scene||feature.scene;return;}
 if(!active(ui.dendryEngine.state.qualities)&&!inCampaign)rememberNormal();
 stop(ui.currentAudio);const audio=new Audio(url);
 feature={url,kind,scene,audio,released:false};ui.currentAudio=audio;ui.currentAudioURL=url;ui.audioPlaylist=[url];ui.audioQueue=[];audio.volume=1;audio.loop=true;
 audio.ontimeupdate=function(){if(feature?.audio===audio&&feature.released&&Number.isFinite(audio.duration)){const left=audio.duration-audio.currentTime;if(left<=5)audio.volume=Math.max(0,Math.min(1,left/5));}};
 audio.onended=function(){if(feature?.audio!==audio)return;if(feature.released)restoreFeature(audio);};
 if(!ui.disable_audio)play(audio);
}
function restoreFeature(audio){if(feature?.audio!==audio)return;stop(audio);feature=null;const Q=ui.dendryEngine.state.qualities;if(active(Q)){playlist(tracks,tracks[0]);inCampaign=true;musicOwned=true;}else resumeNormal();}
function fadeFeature(){const f=feature;if(!f||f.fading)return;f.fading=true;const start=f.audio.volume,began=Date.now();const timer=setInterval(()=>{if(feature!==f){clearInterval(timer);return;}const progress=Math.min(1,(Date.now()-began)/5000);f.audio.volume=start*(1-progress);if(progress>=1){clearInterval(timer);restoreFeature(f.audio);}},100);}
function startEndingMusic(){startFeature(special,'ending');}
function finishEndingMusic(){if(!feature||feature.kind!=='ending')return;feature.released=true;feature.audio.loop=false;if(feature.audio.ended)fadeFeature();}
function startEventSong(){startFeature('music/bir-gece-event.mp3','event',ui?.dendryEngine?.state?.sceneId);}
function sync(){if(!ui?.dendryEngine?.state)return;const state=ui.dendryEngine.state,Q=state.qualities,on=active(Q),celebrating=['cyprus_campaign_final','cyprus_sarachane_rally'].includes(state.sceneId)&&ui.currentAudioURL===special;
 if(/^cyprus_(atilla1_ending|atilla2_ending|campaign_final)$/.test(state.sceneId)&&typeof document!=='undefined')document.querySelectorAll('#content h2').forEach(el=>el.classList.add('cyprus-ending-level'));
 const eventText=typeof document!=='undefined'?(document.querySelector('#content')?.textContent||''):'';
 if(!feature&&on&&/bir\s+gece\s+ans[ıi]z[ıi]n\s+gelebilirim/i.test(eventText))startEventSong();
 if(feature){if(feature.kind==='event'&&state.sceneId!==feature.scene)fadeFeature();else if(feature.kind==='ending'&&!feature.released&&!['cyprus_campaign_final','cyprus_campaign_final.root','cyprus_gratitude','cyprus_gratitude.continue','cyprus_sarachane_rally','cyprus_sarachane_rally.finish'].includes(state.sceneId))finishEndingMusic();}
 else if(on&&!inCampaign){rememberNormal();inCampaign=true;musicOwned=true;playlist(tracks,tracks[0]);}
 else if(!on&&!celebrating&&(musicOwned||tracks.includes(ui.currentAudioURL)||ui.currentAudioURL===special))resumeNormal();
 else if(on&&inCampaign&&!tracks.includes(ui.currentAudioURL))playlist(tracks,tracks[0]);
 if(on!==lastBackgroundMode||(cyprusBg(state.bg)&&!on)){lastBackgroundMode=on;if(on||cyprusBg(state.bg))ui.setBg(on?(cyprusBg(state.bg)?state.bg:cyprusBackground):normalBackground);}
}
function install(target){if(target._cyprusPresentationInstalled)return;ui=target;ui._cyprusPresentationInstalled=true;const rawAudio=ui.audio,rawBg=ui.setBg,rawRestore=ui.dendryEngine.setState;
 ui.audio=function(spec){if(feature)return;if(active(this.dendryEngine.state.qualities)){sync();return;}const result=rawAudio.call(this,spec);if(!musicOwned)rememberNormal();return result;};
 ui.setBg=function(url){const state=this.dendryEngine.state,on=active(state.qualities),related=cyprusBg(url)||cyprusBg(state.bg);let next=url;if(on&&!cyprusBg(next))next=cyprusBackground;else if(!on&&cyprusBg(next))next=normalBackground;if(on||related)state.bg=next;const animated=this.animate_bg;if(on||related){this.animate_bg=false;if(root.jQuery)root.jQuery('#bg1,#bg2').stop(true,false);}try{const result=rawBg.call(this,next);if((on||related)&&root.jQuery)root.jQuery('#bg1').css('opacity',1);return result;}finally{this.animate_bg=animated;}};
 ui.dendryEngine.setState=function(state){const result=rawRestore.call(this,state);if(feature&&((feature.kind==='event'&&this.state.sceneId!==feature.scene)||(feature.kind==='ending'&&!/^cyprus_(campaign_final|gratitude|sarachane_rally)(\.|$)/.test(this.state.sceneId)))){stop(feature.audio);feature=null;}sync();return result;};sync();
}
const frontlineOrder=['pre-operation','july-20','july-21','july-22','july-23','july-24','july-25','july-26','july-27-28','july-30-31','august-1','atilla2-day1','atilla2-day2','atilla2-day3','atilla2-day4'].map(n=>'cyprusgame/frontlines/'+n+'.png');
function mapUrl(source){return (frontlineOrder.includes(source)||source==='cyprusgame/cyprus_map.png')?source+'?v=half-20261031':source;}
function decoded(source){if(pendingMaps.has(source))return pendingMaps.get(source);const image=new Image(),promise=new Promise((resolve,reject)=>{image.onload=()=>{const ready=image.decode?image.decode():Promise.resolve();ready.then(()=>resolve(image),reject);};image.onerror=()=>reject(new Error('Could not load Cyprus map '+source));image.src=mapUrl(source);});pendingMaps.set(source,promise);while(pendingMaps.size>3)pendingMaps.delete(pendingMaps.keys().next().value);promise.catch(()=>{if(pendingMaps.get(source)===promise)pendingMaps.delete(source);});return promise;}
function setHref(image,source){image.setAttribute('href',source);image.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',source);}
function updateMap(image,source){const url=mapUrl(source);if(image.dataset.desiredMap===url)return;image.dataset.desiredMap=url;const token={};requests.set(image,token);const existing=image.getAttribute('href')||image.getAttributeNS('http://www.w3.org/1999/xlink','href');if(!image.getAttribute('href')||existing==='cyprusgame/cyprus_map.png')setHref(image,lastMap||existing);
 decoded(source).then(()=>{if(!image.isConnected||requests.get(image)!==token)return;const previous=image.getAttribute('href'),group=image.parentElement;group.querySelectorAll('[data-cyprus-map-transition]').forEach(n=>n.remove());let old;
  const animate=previous&&previous!==url&&ui?.animate!==false&&!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(animate){old=image.cloneNode(true);old.removeAttribute('id');old.dataset.cyprusMapTransition='true';old.style.pointerEvents='none';old.setAttribute('aria-hidden','true');group.appendChild(old);}
  setHref(image,url);lastMap=url;if(old){const animation=old.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-in-out'});animation.finished.catch(()=>{}).then(()=>old.remove());}
  root.setupCyprusSideClicks?.();root.updateCyprusTerritoryHighlight?.();
  const index=frontlineOrder.indexOf(source);if(index>=0&&index+1<frontlineOrder.length)decoded(frontlineOrder[index+1]).catch(()=>{});
 }).catch(()=>{/* Retain the previous decoded map if a request fails. */if(requests.get(image)===token)delete image.dataset.desiredMap;});
}
root.AnatolianCyprusPresentation={install,sync,startEndingMusic,finishEndingMusic,startEventSong,updateMap,resumeNormal,tracks,normalTracks,active};
})(globalThis);
