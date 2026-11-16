/* Cyprus-only media lifecycle and decoded frontline transitions. */
(function(root){'use strict';
const tracks=['music/gercekkibris1.m4a','music/cyprus.m4a','music/cyprus1.m4a'];
const normalTracks=["music/50yilmarsi.mp3", "music/Yeni_Bir_Turkiye.mp3", "music/Oy_Gulum_Oy.mp3", "music/Canim_Ecevit.mp3", "music/Dısarda_Kar_Yagiyor.mp3", "music/Sev_Kardesim_Senay.mp3", "music/Neye_Geldim_Dunyaya.mp3", "music/Kumsaldaki_Izler_Juanito.mp3", "music/Semiramis_Pekkan_Senden_Vazgecemem.mp3", "music/Genclik_Basimda_Duman.mp3", "music/Ersan_Erdura_Acılar_Surekli_Olamaz.mp3", "music/Juanito_Arkadasimin_Askisin.mp3", "music/Nilufer_dunya_donuyor.mp3", "music/Nilufer_selam_soyle.mp3", "music/gozleri_aska_gulen.mp3", "music/herkeskendinebenzer.mp3", "music/helvaci.mp3", "music/gecevakti.mp3", "music/dostlarbenihatirlasin.mp3", "music/sultanıyegah.mp3", "music/omurbiteryolbitmez.mp3", "music/Tamirci_Ciragi.mp3", "music/bahceleregeldibahar.mp3", "music/gozlerikaradilber.mp3", "music/kecivurdumcayira.mp3"];
const special='music/karaoglan-rally.mp3',normalBackground='img/map_4.jpg',cyprusBackground='img/harekat2.jpg';
const active=Q=>Number(Q?.cyprus_mode)>0&&!Q.cyprus_campaign_resolved;
const cyprusBg=url=>/img\/(?:harekat2|kibriss)\.jpg(?:\?|$)/.test(String(url));
let ui,normal=null,inCampaign=false,musicOwned=false,lastBackgroundMode=null,lastMap='',pendingMaps=new Map(),requests=new WeakMap();
function play(audio){const result=audio.play();if(result?.catch)result.catch(()=>{});}
function stop(audio){if(!audio)return;if(root.jQuery)root.jQuery(audio).stop(true,false);audio.pause();audio.onended=null;audio.loop=false;}
function playlist(list,first,audio,shuffle=false){stop(ui.currentAudio);ui.audioPlaylist=list.slice();ui.audioQueue=[];const selected=list.includes(first)?first:list[0];ui.currentAudio=audio||new Audio(selected);ui.currentAudioURL=selected;if(!audio)ui.currentAudio.src=selected;ui.currentAudio.loop=false;ui.currentAudio.volume=1;ui.currentAudio.onended=function(){if(ui.currentAudio!==this)return;const index=ui.audioPlaylist.indexOf(ui.currentAudioURL),next=ui.audioPlaylist[shuffle&&ui.audioPlaylist.length>1?(index+1+Math.floor(Math.random()*(ui.audioPlaylist.length-1)))%ui.audioPlaylist.length:(index+1)%ui.audioPlaylist.length];ui.currentAudioURL=next;this.src=next;if(!ui.disable_audio)play(this);};if(!ui.disable_audio)play(ui.currentAudio);}
function rememberNormal(){const list=(ui.audioPlaylist||[]).filter(t=>t&&t!=='none'&&t!=='null'&&!tracks.includes(t)&&t!==special);if(list.length)normal={list:list.slice(),url:list.includes(ui.currentAudioURL)?ui.currentAudioURL:list[0],audio:!tracks.includes(ui.currentAudioURL)&&ui.currentAudioURL!==special?ui.currentAudio:null};}
function resumeNormal(){if(!ui)return;const saved=normal;playlist(saved?.list?.length?saved.list:normalTracks,saved?.url,saved?.audio,true);musicOwned=false;inCampaign=false;}
function sync(){if(!ui?.dendryEngine?.state)return;const state=ui.dendryEngine.state,Q=state.qualities,on=active(Q),celebrating=['cyprus_campaign_final','cyprus_sarachane_rally'].includes(state.sceneId)&&ui.currentAudioURL===special;
 if(on&&!inCampaign){rememberNormal();inCampaign=true;musicOwned=true;playlist(tracks,tracks[0]);}
 else if(!on&&!celebrating&&(musicOwned||tracks.includes(ui.currentAudioURL)||ui.currentAudioURL===special))resumeNormal();
 else if(on&&inCampaign&&!tracks.includes(ui.currentAudioURL))playlist(tracks,tracks[0]);
 if(on!==lastBackgroundMode||(cyprusBg(state.bg)&&!on)){lastBackgroundMode=on;if(on||cyprusBg(state.bg))ui.setBg(on?(cyprusBg(state.bg)?state.bg:cyprusBackground):normalBackground);}
}
function install(target){if(target._cyprusPresentationInstalled)return;ui=target;ui._cyprusPresentationInstalled=true;const rawAudio=ui.audio,rawBg=ui.setBg,rawRestore=ui.dendryEngine.setState;
 ui.audio=function(spec){if(active(this.dendryEngine.state.qualities)){sync();return;}const result=rawAudio.call(this,spec);if(!musicOwned)rememberNormal();return result;};
 ui.setBg=function(url){const state=this.dendryEngine.state,on=active(state.qualities),related=cyprusBg(url)||cyprusBg(state.bg);let next=url;if(on&&!cyprusBg(next))next=cyprusBackground;else if(!on&&cyprusBg(next))next=normalBackground;if(on||related)state.bg=next;const animated=this.animate_bg;if(on||related){this.animate_bg=false;if(root.jQuery)root.jQuery('#bg1,#bg2').stop(true,false);}try{const result=rawBg.call(this,next);if((on||related)&&root.jQuery)root.jQuery('#bg1').css('opacity',1);return result;}finally{this.animate_bg=animated;}};
 ui.dendryEngine.setState=function(state){const result=rawRestore.call(this,state);sync();return result;};sync();
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
root.AnatolianCyprusPresentation={install,sync,updateMap,resumeNormal,tracks,normalTracks,active};
})(globalThis);
