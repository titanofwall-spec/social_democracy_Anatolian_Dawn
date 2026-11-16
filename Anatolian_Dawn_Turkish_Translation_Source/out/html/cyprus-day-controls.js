/* ANATOLIAN DAWN: Cyprus day controls attached to the existing frontline map.
   Presentation only. The original cyprusAdvanceDay() still owns game progression. */
(function(root){
  'use strict';
  if(root.AnatolianCyprusDayControls) return;
  const oldRender = root.renderCyprusCommandPanel;
  if(typeof oldRender !== 'function'){
    throw new Error('Cyprus day controls must load after game.js');
  }
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  function currentDate(Q){
    if(typeof Q.cyprus_date_display === 'string' && Q.cyprus_date_display.trim()){
      return Q.cyprus_date_display.trim();
    }
    const month=months[Number(Q.cyprus_month)] || 'Cyprus';
    return month+' '+(Number(Q.cyprus_day)||1)+', '+(Number(Q.cyprus_year)||1974);
  }
  function currentLabel(Q){
    if(typeof root.cyprusPendingScene === 'function' && root.cyprusPendingScene(Q)){
      return 'Continue operation';
    }
    const roadmap=root.AnatolianRules && root.AnatolianRules.cyprusRoadmap;
    return roadmap && typeof roadmap.skipLabel === 'function'
      ? roadmap.skipLabel(Q) : 'Skip Day';
  }
  function makeBar(){
    const bar=document.createElement('div');
    bar.id='cyprus-map-day-bar';
    bar.className='cyprus-map-day-bar';
    bar.setAttribute('role','group');
    bar.setAttribute('aria-label','Cyprus daily map controls');
    const date=document.createElement('span');
    date.id='cyprus-map-day-date';
    date.className='cyprus-map-day-date';
    date.setAttribute('aria-live','polite');
    const button=document.createElement('button');
    button.type='button';
    button.id='cyprus-map-day-action';
    button.className='tab_button cyprus-map-day-action';
    button.addEventListener('click',function(){
      if(typeof root.cyprusAdvanceDay === 'function') root.cyprusAdvanceDay();
    });
    bar.append(date,button);
    return bar;
  }
  function sync(){
    const state=root.dendryUI && root.dendryUI.dendryEngine && root.dendryUI.dendryEngine.state;
    const Q=state && state.qualities;
    const panel=document.getElementById('cyprus-command-panel');
    const map=panel && panel.querySelector('#cyprus-map-wrap');
    if(!Q || !Q.cyprus_mode || Q.cyprus_campaign_resolved || !map){return;}
    let bar=panel.querySelector('#cyprus-map-day-bar');
    if(!bar){bar=makeBar();}
    if(bar.nextElementSibling!==map) panel.insertBefore(bar,map);
    const date=bar.querySelector('#cyprus-map-day-date');
    const button=bar.querySelector('#cyprus-map-day-action');
    date.textContent=currentDate(Q);
    button.textContent=currentLabel(Q);
    button.disabled=!!Q.cyprus_end_shown;
    button.setAttribute('aria-label',button.textContent+' — '+date.textContent);
  }
  root.renderCyprusCommandPanel=function(){
    const result=oldRender.apply(this,arguments);
    sync();
    return result;
  };
  root.AnatolianCyprusDayControls={sync:sync,currentLabel:currentLabel,currentDate:currentDate};
})(typeof globalThis!=='undefined'?globalThis:window);
