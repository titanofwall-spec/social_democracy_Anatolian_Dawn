/* Anatolian Dawn — native sandbox controls. Nothing is changed until a control is used. */
(function (root) {
  'use strict';
  const rules = () => root.AnatolianRules;
  const ui = () => root.dendryUI;
  const quality = () => ui()?.dendryEngine?.state?.qualities;
  const whole = (label,key,min,max,tip) => ({label,key,min,max,tip,precision:0});
  const decimal = (label,key,min,max,tip) => ({label,key,min,max,tip,precision:2});
  const percent = (label,key,tip) => ({label,key,min:0,max:100,tip,precision:2});
  const ratio = (label,key,tip) => ({label,key,min:0,max:100,tip,precision:2,scale:100});
  const section = (name,rows) => ({name,rows});
  const organization = (name,prefix) => [decimal(name+' Manpower (thousands)',prefix+'_strength',0,100000,'Number of members, in thousands.'),ratio(name+' Militarization',prefix+'_militancy','Militarization percentage.')];
  const factions=[
    ['km','kemalist_marxists','Kemalist Marxists'],
    ['tw','third_worldists','Third Worldists'],
    ['lk','left_kemalists','Left-Wing Kemalists'],
    ['ok','orthodox_kemalists','Reformist Kemalists'],
    ['rk','right_kemalists','Right-Wing Kemalists']
  ];
  const voters=[
    ['Rural','rural'],['Worker','workers'],['State Employee','state_employees'],
    ['Petty Bourgeoisie','petty_bourgeoisie'],['Capitalist','capitalists'],
    ['Alevi','alevis'],['Kurdish','kurds']
  ];
  function factionName(Q,code,key,fallback) {
    const dictionary=Q.faction_display_names||Q.faction_names||{};
    return String(dictionary[code]||dictionary[key]||Q[key+'_display_name']||Q[key+'_name']||fallback);
  }
  function factionShare(Q,code) {
    const model=rules()?.factionModel(Q);
    return model&&model.total>0&&model.active[code] ? model.averages[code]*100/model.total : 0;
  }
  function categories(Q) {
    const factionRows=[];
    factions.forEach(([code,key,name])=>{
      const title=factionName(Q,code,key,name);
      factionRows.push({label:title+' Strength',type:'faction',code,min:0,max:99.9,precision:2,tip:'Percentage of internal party strength. Updates all six party quarters.'});
      factionRows.push(percent(title+' Dissent',key+'_dissent','Faction dissent percentage.'));
    });
    const pollRows=[];
    voters.forEach(([label,key])=>{
      pollRows.push(percent(label+' CHP Support',key+'_chp','Raw CHP preference within this voter group.'));
      pollRows.push(percent(label+' Voter Potential',key==='kurds'?'kurdish_population_weight':key,'Demographic weight of this voter group in the electoral model.'));
    });
    const left=[
      ...organization('THKP-C','thkpc'),
      ...(Q.tkpml_formed?organization('TKP/ML','tkpml'):[]),
      ...(Q.devyol_formed?organization('DEV-YOL','devyol'):[])
    ].filter(item=>!Q.thkpc_destroyed||!item.key.startsWith('thkpc_'));
    const right=[
      ...organization('Grey Wolves','grey_wolves'),
      ...(Q.raiders_formed?organization('Raiders','raiders'):[]),
      ...organization('TİT','tit')
    ];
    return [
      {name:'Party & Politics',sections:[
        section('Party Resources',[
          whole('Resources','resources',0,1000000,'Political resources available to the CHP.'),
          whole('Fundraising Dues','dues',0,1000000,'Party membership dues and fundraising setting.'),
          percent('Coalition Dissent','coalition_dissent','Dissent within the current governing coalition.')
        ]),
        section('Party Relations',[
          whole('TİP Relation','TIP_relation',0,100,'Also determines relations with Socialist Left after its formation.'),
          whole('AP Relation','AP_relation',0,100),
          whole('CGP Relation','CGP_relation',0,100),
          whole('DP Relation','DP_relation',0,100),
          whole('MSP Relation','MSP_relation',0,100),
          whole('MHP Relation','MHP_relation',0,100),
          whole('TBP Relation','TBP_relation',0,100)
        ]),
        section('Internal Factions',factionRows)
      ]},
      {name:'Polls',sections:[section('CHP Voter Support & Potential',pollRows)]},
      {name:'Defense',sections:[
        section('State Security',[
          decimal('TSK Strength','armed_forces_strength',0,100000,'Armed forces strength.'),
          decimal('Police Strength (Manpower)','police_strength',0,100000,'Police strength in thousands.'),
          ratio('Police Loyalty','police_loyalty','Police loyalty expressed as a percentage.'),
          ratio('Police Militarization','police_militancy','Police militarization expressed as a percentage.')
        ]),
        section('Far Left',left),
        section('Far Right',right),
        section('Kurdish Political Dynamics',[
          ratio('Kurdish Consciousness','kurdish_issue_consciousness','Percentage of Kurdish political consciousness.'),
          ratio('Kurdish Radicalism','kurdish_issue_radicalism','Radicalization within Kurdish political consciousness.'),
          ratio('Kurdish Paramilitary Inclination','kurdish_issue_paramilitarism','Inclination toward paramilitary organization.')
        ])
      ]},
      {name:'Exterior Affairs',sections:[section('International Relations',[
        whole('United States','us_relation',0,100),
        whole('Western Europe','west_relation',0,100),
        whole('Soviet Union','soviet_relation',0,100),
        whole('Middle East','middle_east_relation',0,100)
      ])]},
      {name:'Gameplay',sections:[
        section('Actions',[
          {label:'Budget',type:'action',action:'budget',tip:'Adds exactly one budget point per click.'},
          {label:'Remove All Cooldowns',type:'action',action:'cooldowns',tip:'Resets action cooldowns, without resetting coups, military crises or event progression.'}
        ]),
        section('Game State',[
          ratio('TSK Relation','armed_forces_loyalty','Armed forces loyalty, which influences the risk of intervention.'),
          percent('Status of Democracy','democracystatus','Status of Turkish democracy.')
        ])
      ]}
    ];
  }
  function markCheated(Q) {
    Q.sandbox_cheats_used=1;
    // An independent local record is only an extra check. Offline browser storage is NOT tamper-proof.
    try {
      if (!Q.sandbox_branch_id) Q.sandbox_branch_id='sandbox-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      root.localStorage.setItem('anatolian-dawn-cheated-branch-'+Q.sandbox_branch_id,'1');
    } catch (_) {}
  }
  function cheated(Q) {
    if(!Q) return false;
    if(Q.sandbox_cheats_used) return true;
    try {return !!Q.sandbox_branch_id&&root.localStorage.getItem('anatolian-dawn-cheated-branch-'+Q.sandbox_branch_id)==='1';}
    catch (_) {return false;}
  }
  function refresh(Q) {
    if(rules()?.refreshFactions)rules().refreshFactions(Q);
    if(rules()?.refreshPolls)rules().refreshPolls(Q);
    if(root.updateSidebar)root.updateSidebar();
    if(root.updatePartySidebar)root.updatePartySidebar();
    ui()?.autosave?.();
  }
  const excludedTimers=/^(?:coup|cyprus_|paramilitary_pressure|kurdish_issue|TIP_ultimatum|constitutional_reform|land_reform|economy_health|streetfighting|crisis_urgency|local_election|national_election)/i;
  function act(Q,action) {
    markCheated(Q);
    if(action==='budget')Q.budget=(Number(Q.budget)||0)+1;
    else if(action==='cooldowns'){
      Object.keys(Q).filter(key=>/_timer$/.test(key)&&!excludedTimers.test(key)&&typeof Q[key]==='number').forEach(key=>{Q[key]=0;});
    }
    refresh(Q);
  }
  function read(Q,item) {
    if(item.type==='faction')return factionShare(Q,item.code);
    const n=Number(Q[item.key]);
    return Number.isFinite(n)?n*(item.scale||1):0;
  }
  function set(Q,item,value) {
    const raw=Number(value);
    if(!Number.isFinite(raw)||raw<item.min||raw>item.max){root.alert('Enter a number from '+item.min+' to '+item.max+'.');return false;}
    markCheated(Q);
    if(item.type==='faction') {
      const old=factionShare(Q,item.code);
      rules().adjustFactionStrength(Q,item.code,raw-old);
    } else {
      Q[item.key]=raw/(item.scale||1);
      if(item.key==='kurdish_population_weight') Q.kurds=Q.kurdish_population_weight;
    }
    refresh(Q);
    return true;
  }
  const node=(tag,className,text)=>{
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  function control(Q,item) {
    const row=node('div','sandbox-row'),title=node('label','sandbox-label',item.label);
    if(item.tip){
      const question=node('span','mytooltip sandbox-help',' [?]');
      question.setAttribute('tabindex','0');
      question.appendChild(node('span','mytooltiptext',item.tip));
      title.appendChild(question);
    }
    row.appendChild(title);
    const tools=node('div','sandbox-controls');
    if(item.type==='action'){
      const button=node('button','tab_button',item.action==='budget'?'+1 Budget':'Remove Cooldowns');
      button.type='button';
      button.onclick=()=>{
        if(!root.confirm('Using sandbox cheats disables achievements on this save branch. Continue?'))return;
        act(Q,item.action);button.textContent=item.action==='budget'?'+1 Budget':'Cooldowns Removed';};
      tools.appendChild(button);
    }else{
      const input=node('input','sandbox-number');
      input.type='number';input.step=item.precision===0?'1':'any';
      input.min=String(item.min);input.max=String(item.max);
      input.value=String(Number(read(Q,item).toFixed(item.precision??2)));
      input.setAttribute('aria-label',item.label);
      const button=node('button','tab_button sandbox-set','Set');
      button.type='button';
      const submit=()=>{
        if(!root.confirm('Using sandbox cheats disables achievements on this save branch. Continue?'))return;
        if(set(Q,item,input.value)){input.value=String(Number(read(Q,item).toFixed(item.precision??2)));button.textContent='Set';}
      };
      button.onclick=submit;
      input.addEventListener('keydown',ev=>{if(ev.key==='Enter')submit();});
      tools.append(input,button);
      if(item.scale)tools.appendChild(node('span','sandbox-unit','%'));
    }
    row.appendChild(tools);
    return row;
  }
  let current=0;
  function draw() {
    const Q=quality(),content=document.getElementById('sandbox-content');
    if(!Q||!content)return;
    const items=categories(Q);content.replaceChildren();
    items.forEach((category,index)=>{
      const group=node('div','sandbox-category');
      const head=node('button','tab_button sandbox-category-head'+(index===current?' active':''),category.name);
      head.type='button';head.setAttribute('aria-expanded',String(index===current));
      head.onclick=()=>{current=index===current?-1:index;draw();};
      group.appendChild(head);
      if(index===current){
        const body=node('div','sandbox-category-body');
        category.sections.forEach(sub=>{
          const subhead=node('h3','sandbox-subtitle',sub.name);body.appendChild(subhead);
          sub.rows.forEach(item=>body.appendChild(control(Q,item)));
        });
        group.appendChild(body);
      }
      content.appendChild(group);
    });
    const notice=document.getElementById('sandbox-achievement-notice');
    if(notice)notice.textContent=cheated(Q)?'Achievements disabled for this save branch.':'Using any option here disables achievements for this save branch.';
  }
  function ensure() {
    if(document.getElementById('sandbox-overlay'))return;
    const overlay=node('div','overlay');overlay.id='sandbox-overlay';overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Sandbox Menu');
    const inner=node('div','game-window sandbox-window');
    const header=node('div','sandbox-header');
    header.appendChild(node('h2',null,'Sandbox Menu'));
    const close=node('button','tab_button','Close');close.type='button';close.onclick=hide;
    header.appendChild(close);inner.appendChild(header);
    const note=node('p','sandbox-notice','');note.id='sandbox-achievement-notice';inner.appendChild(note);
    const body=node('div','sandbox-content');body.id='sandbox-content';inner.appendChild(body);
    overlay.appendChild(inner);document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)hide();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.style.display==='block')hide();});
  }
  function show(event) {
    if(event)event.preventDefault();
    const Q=quality();
    if(!Q||!Q.started){root.alert('Start a game to use the Sandbox Menu.');return;}
    ensure();current=0;draw();document.getElementById('sandbox-overlay').style.display='block';
    document.querySelector('#sandbox-overlay .sandbox-category-head')?.focus();
  }
  function hide(){const el=document.getElementById('sandbox-overlay');if(el)el.style.display='none';}
  root.AnatolianSandbox={show,hide,cheated,categories,act,set,read};
  root.showSandboxMenu=show;
})(typeof globalThis!=='undefined'?globalThis:window);
