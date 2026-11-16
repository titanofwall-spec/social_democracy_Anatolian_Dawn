/* Anatolian Dawn - native Sandbox Menu; numeric fields only. */
(function (root) {
  'use strict';
  const R = () => root.AnatolianRules;
  const U = () => root.dendryUI;
  const Q = () => U()?.dendryEngine?.state?.qualities;
  const entry = (label, key, min, max, explanation, scale=1) => ({label,key,min,max,explanation,scale});
  const pct = (label,key,explanation) => entry(label,key,0,100,explanation);
  const ratio = (label,key,explanation) => entry(label,key,0,100,explanation,100);
  const count = (label,key,explanation) => entry(label,key,0,1000000,explanation);
  const factionDefinitions = [
    ['km','kemalist_marxists','Kemalist Marxists'],
    ['tw','third_worldists','Third Worldists'],
    ['lk','left_kemalists','Left-Wing Kemalists'],
    ['ok','orthodox_kemalists','Reformist Kemalists'],
    ['rk','right_kemalists','Right-Wing Kemalists']
  ];
  const demographics = [
    ['Rural','rural'],['Worker','workers'],['State Employee','state_employees'],
    ['Petty Bourgeoisie','petty_bourgeoisie'],['Capitalist','capitalists'],
    ['Alevi','alevis'],['Kurdish','kurds']
  ];
  const sec = (name,rows) => ({name,rows});
  const org = (name,key) => [
    entry(name+' Manpower (thousands)',key+'_strength',0,100000,'Number of members, in thousands.'),
    ratio(name+' Militarization',key+'_militancy','Militarization of this organization.')
  ];
  function nameFor(Q,abbr,key,defaultName) {
    const names=Q.faction_display_names||Q.faction_names||{};
    return String(names[abbr]||names[key]||Q[key+'_display_name']||Q[key+'_name']||defaultName);
  }
  function factionShare(Q,abbr) {
    const model=R().factionModel(Q);
    return model.active[abbr]&&model.total>0 ? model.averages[abbr]/model.total*100 : 0;
  }
  function categories(Q) {
    const factions=[];
    factionDefinitions.forEach(([abbr,key,defaultName])=>{
      const title=nameFor(Q,abbr,key,defaultName);
      factions.push({label:title+' Strength',faction:abbr,min:0,max:100,
        explanation:'Percentage of CHP faction influence. Changes the six source quarters.'});
      factions.push(pct(title+' Dissent',key+'_dissent','Dissent within this faction.'));
    });
    const polls=[];
    demographics.forEach(([name,key])=>{
      polls.push({...pct(name+' CHP Support',key+'_chp','Direct cheat override of CHP support in this voter group.'),supportGroup:key});
      polls.push({label:name+' Voter Potential',potential:key,min:0,max:100,
        explanation:'Directly overrides this group’s voter potential without changing its population weight.'});
    });
    const left=[...(Q.thkpc_destroyed?[]:org('THKP-C','thkpc')),
      ...(Q.tkpml_formed?org('TKP/ML','tkpml'):[]),
      ...(Q.devyol_formed?org('DEV-YOL','devyol'):[])];
    const right=[...org('Grey Wolves','grey_wolves'),
      ...(Q.raiders_formed?org('Raiders','raiders'):[]),...org('TIT','tit')];
    return [
      {name:'Party & Politics',sections:[
        sec('Resources & Coalition',[
          count('Resources','resources','CHP political resources.'),
          count('Fundraising Dues','dues','Membership dues/fundraising setting.'),
          pct('Coalition Dissent','coalition_dissent','Dissent in the governing coalition.')]),
        sec('Party Relations',[
          pct('TIP Relation','TIP_relation','Also controls Socialist Left relations following its formation.'),
          pct('AP Relation','AP_relation'),pct('CGP Relation','CGP_relation'),
          pct('DP Relation','DP_relation'),pct('MSP Relation','MSP_relation'),
          pct('MHP Relation','MHP_relation'),pct('TBP Relation','TBP_relation')]),
        sec('Party Factions',factions)]},
      {name:'Polls',sections:[sec('Voter Groups',polls),
        sec('Temporary Polling Cheats',[{label:'10 year long temporary +1% polling',action:'temporary-polling',
          explanation:'Adds one national CHP polling percentage point per click, lasting ten years, shown as a single Temporary Political Effect.'}])]},
      {name:'Defense',sections:[
        sec('State Security',[
          entry('TSK Strength','armed_forces_strength',0,100000,'Turkish Armed Forces strength.'),
          entry('Police Strength (Manpower)','police_strength',0,100000,'Police manpower, in thousands.'),
          ratio('Police Loyalty','police_loyalty','Police loyalty.'),
          ratio('Police Militarization','police_militancy','Police militarization.')]),
        sec('Far Left',left),sec('Far Right',right),
        sec('Kurdish Political Dynamics',[
          ratio('Kurdish Consciousness','kurdish_issue_consciousness','Political consciousness.'),
          ratio('Kurdish Radicalism','kurdish_issue_radicalism','Political radicalism.'),
          ratio('Kurdish Paramilitary Inclination','kurdish_issue_paramilitarism','Inclination toward paramilitary organizations.')])]},
      {name:'Exterior Affairs',sections:[sec('Foreign Relations',[
        pct('United States','us_relation'),pct('Western Europe','west_relation'),
        pct('Soviet Union','soviet_relation'),pct('Middle East','middle_east_relation')])]},
      {name:'Gameplay',sections:[
        sec('Actions',[{label:'Budget',action:'budget',explanation:'Each click adds one budget point.'},
          {label:'Remove All Cooldowns',action:'cooldowns',explanation:'Clears action cooldowns, not coup/event progress.'}]),
        sec('Game State',[
          ratio('TSK Relation','armed_forces_loyalty','Armed Forces loyalty and likelihood of a coup.'),
          pct('Status of Democracy','democracystatus','Status of Turkish democracy.')])]}
    ];
  }
  function cheated(q) {
    if (!q) return false;
    if (q.sandbox_cheats_used) return true;
    try { return !!q.sandbox_branch_id && root.localStorage.getItem('anatolian-dawn-cheat-'+q.sandbox_branch_id)==='1'; }
    catch (_) { return false; }
  }
  function markCheated(q) {
    q.sandbox_cheats_used=1;
    if (!q.sandbox_branch_id) q.sandbox_branch_id='branch-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
    try {root.localStorage.setItem('anatolian-dawn-cheat-'+q.sandbox_branch_id,'1');}
    catch (_) {} // Offline game storage is not tamper-proof.
  }
  function confirmCheat(q) {
    return cheated(q)||root.confirm('Using the Sandbox Menu permanently disables achievements on this save branch. Continue?');
  }
  function recalculate(q) {
    R()?.refreshFactions?.(q);
    R()?.refreshPolls?.(q);
    root.updateSidebar?.();
    root.updatePartySidebar?.();
    U()?.autosave?.();
  }
  const nonCooldown=/^(?:coup|cyprus_|paramilitary_pressure|kurdish_issue|TIP_ultimatum|streetfighting|economic_reform|election)/i;
  function action(q,kind) {
    if (kind==='temporary-polling'&&!root.AnatolianNationalCoalition) {
      root.alert('National Coalition is not available.');return false;
    }
    if (!confirmCheat(q)) return false;
    markCheated(q);
    if (kind==='temporary-polling') {
      const coalition=root.AnatolianNationalCoalition;
      const state=coalition.ensure(q);
      const title='Temporary 10 year cheat', id='sandbox-ten-year-polling';
      const matches=state.temporary.filter(e=>e.id===id||e.title===title);
      const existing=matches[0];
      const points=matches.reduce((sum,e)=>sum+(Number(e.points)||0),0)+1;
      const tick=(Number(q.year)||1972)*24+((Number(q.month)||1)-1)*2+(Number(q.week)===2?1:0);
      const effect=existing||{id,title};
      Object.assign(effect,{id,title,points,remaining:240,lastTick:tick,decayVersion:3,sandboxFixed:true});
      state.temporary=state.temporary.filter(e=>e!==existing&&!matches.includes(e));
      state.temporary.push(effect);
    }
    if (kind==='budget')q.budget=(Number(q.budget)||0)+1;
    if (kind==='cooldowns') Object.keys(q).filter(k=>k.endsWith('_timer')&&!nonCooldown.test(k)&&typeof q[k]==='number').forEach(k=>{q[k]=0;});
    recalculate(q);
    return true;
  }
  function valueOf(q,item) {
    if (item.faction) return factionShare(q,item.faction);
    if (item.potential || item.supportGroup) {
      const nc=root.AnatolianNationalCoalition;
      const saved=q.national_coalition?.sandboxPollOverrides;
      if (item.potential) {
        const v=saved?.potential?.[item.potential];
        return Number.isFinite(v)?v*100:(nc?nc.reach(q,item.potential)*100:0);
      }
      const v=saved?.support?.[item.supportGroup];
      return Number.isFinite(v)?v*100:(Number(q[item.key])||0);
    }
    const val=Number(q[item.key]);
    return Number.isFinite(val)?val*(item.scale||1):0;
  }
  function apply(q,item,input) {
    const n=Number(input);
    if (input.trim()===''||!Number.isFinite(n)||n<item.min||n>item.max) {
      root.alert('Enter a number between '+item.min+' and '+item.max+'.');
      return false;
    }
    if (item.faction&&!R().factionModel(q).active[item.faction]) {
      root.alert('This faction is not currently active.');return false;
    }
    if ((item.potential||item.supportGroup)&&!root.AnatolianNationalCoalition) {
      root.alert('National Coalition is not available.');return false;
    }
    if (!confirmCheat(q))return false;
    markCheated(q);
    if (item.potential||item.supportGroup) {
      const s=root.AnatolianNationalCoalition.ensure(q);
      if(!s.sandboxPollOverrides)s.sandboxPollOverrides={support:{},potential:{}};
      if(!s.sandboxPollOverrides.support)s.sandboxPollOverrides.support={};
      if(!s.sandboxPollOverrides.potential)s.sandboxPollOverrides.potential={};
      if(item.potential)s.sandboxPollOverrides.potential[item.potential]=n/100;
      else s.sandboxPollOverrides.support[item.supportGroup]=n/100;
      // Never write demographic Q[c] weights: those represent population, not reach.
      recalculate(q);
      return true;
    }
    if(item.faction) {
      if(n===100) {
        const model=R().factionModel(q);
        for (const other of ['km','tw','lk','ok','rk']) {
          if(other===item.faction||!model.active[other])continue;
          for(let i=0;i<6;i++)q['q'+i+'_'+other+'_str']=i===2?-model.bonuses[other]:0;
        }
        R().refreshFactions(q);
      } else R().adjustFactionStrength(q,item.faction,n-factionShare(q,item.faction));
    }
    else {
      q[item.key]=n/(item.scale||1);
      if(item.key==='kurdish_population_weight')q.kurds=q.kurdish_population_weight;
    }
    recalculate(q);
    return true;
  }
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function row(q,item){
    const wrap=el('div','sandbox-row');
    const label=el('label','sandbox-label',item.label);
    if(item.explanation){
      const tooltip=el('span','mytooltip sandbox-help',' [?]');tooltip.tabIndex=0;
      tooltip.appendChild(el('span','mytooltiptext',item.explanation));label.appendChild(tooltip);
    }
    wrap.appendChild(label);
    const right=el('div','sandbox-controls');
    if(item.action){
      const button=el('button','tab_button',item.action==='budget'?'+1 Budget':item.action==='cooldowns'?'Remove Cooldowns':'+1% (10 Years)');
      button.type='button';button.onclick=()=>{if(action(q,item.action))render();};right.appendChild(button);
    }else{
      const input=el('input','sandbox-number');input.type='number';input.step='any';
      input.min=item.min;input.max=item.max;input.value=String(Number(valueOf(q,item).toFixed(2)));
      input.setAttribute('aria-label',item.label);label.htmlFor='';
      const button=el('button','tab_button sandbox-set','Set');button.type='button';
      const commit=()=>{if(apply(q,item,input.value))render();};
      button.onclick=commit;input.onkeydown=event=>{if(event.key==='Enter')commit();};
      right.append(input,button);
      if(item.scale||item.max===100)right.appendChild(el('span','sandbox-unit','%'));
    }
    wrap.appendChild(right);return wrap;
  }
  let openIndex=0;
  function render(){
    const q=Q(),box=document.getElementById('sandbox-content');if(!q||!box)return;
    box.replaceChildren();
    categories(q).forEach((cat,i)=>{
      const group=el('div','sandbox-category');
      const head=el('button','tab_button sandbox-category-head'+(openIndex===i?' active':''),cat.name);
      head.type='button';head.setAttribute('aria-expanded',String(openIndex===i));
      head.onclick=()=>{openIndex=(openIndex===i?-1:i);render();};
      group.appendChild(head);
      if(i===openIndex){
        const body=el('div','sandbox-category-body');
        cat.sections.forEach(sec=>{
          body.appendChild(el('h3','sandbox-subtitle',sec.name));
          sec.rows.forEach(item=>body.appendChild(row(q,item)));
        });group.appendChild(body);
      }
      box.appendChild(group);
    });
    const note=document.getElementById('sandbox-notice');
    if(note)note.textContent=cheated(q)?'Achievements disabled on this save branch.':'Using any cheat will disable achievements on this save branch.';
  }
  function hide(){const box=document.getElementById('sandbox-overlay');if(box)box.style.display='none';}
  function ensure(){
    if(document.getElementById('sandbox-overlay'))return;
    const overlay=el('div','overlay');overlay.id='sandbox-overlay';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Sandbox Menu');
    const panel=el('div','game-window sandbox-window');
    const header=el('div','sandbox-header');header.appendChild(el('h2','','Sandbox Menu'));
    const close=el('button','tab_button','Close');close.type='button';close.onclick=hide;header.appendChild(close);
    panel.appendChild(header);
    const note=el('p','sandbox-notice','');note.id='sandbox-notice';panel.appendChild(note);
    const content=el('div','sandbox-content');content.id='sandbox-content';panel.appendChild(content);
    overlay.appendChild(panel);document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)hide();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.style.display==='block')hide();});
  }
  function show(event){
    event?.preventDefault?.();const q=Q();
    if(!q||!q.started){root.alert('Start a game before using the Sandbox Menu.');return;}
    ensure();openIndex=0;render();document.getElementById('sandbox-overlay').style.display='block';
  }
  root.AnatolianSandbox={show,hide,cheated,categories,action,apply,valueOf};
  root.showSandboxMenu=show;
})(typeof globalThis!=='undefined'?globalThis:window);
