/* Anatolian Dawn - Cold War government tooltip inline replacement, compatibility layer v2.
   Self-contained and intentionally leaves Turkey to the game's own state renderer. */
(function(){
  'use strict';
  if(window.__AD_COLD_WAR_GOV_V2__) return;
  window.__AD_COLD_WAR_GOV_V2__=true;
  const DATA=/*__DATABASE__*/;
  const countries=DATA.countries||[];
  const byName=new Map();
  const byColor=new Map();
  const aliases={'usa':'United States','u.s.a.':'United States','united states of america':'United States',
   'uk':'United Kingdom','great britain':'United Kingdom','ussr':'Soviet Union','soviet union':'Soviet Union',
   'frg':'West Germany','federal republic of germany':'West Germany','gdr':'East Germany',
   'prc':'China (PRC)','china':'China (PRC)','belize':'British Honduras (Belize)',
   'djibouti':'French Territory of the Afars and Issas','benin':'Dahomey',
   'burkina faso':'Upper Volta','guinea-bissau':'Portuguese Guinea',
   'western sahara':'Spanish Sahara','cape verde':'Cape Verde','ivory coast':'Ivory Coast',
   'congo brazzaville':'People’s Republic of the Congo','congo (brazzaville)':'People’s Republic of the Congo',
   'democratic republic of the congo':'Zaire','zaire':'Zaire',
   'north yemen':'North Yemen','south yemen':'South Yemen'};
  function normalize(t){return String(t||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();}
  for(const c of countries){byName.set(normalize(c.name),c);const key=String(c.id||'').toUpperCase();
    if(!byColor.has(key)) byColor.set(key,[]);byColor.get(key).push(c);}
  for(const [alias,name] of Object.entries(aliases)) {let entry=byName.get(normalize(name));if(entry)byName.set(normalize(alias),entry);}
  const CSS=`
  .ad-cw-gov-data{padding:8px 9px;margin-top:6px;border-top:1px solid rgba(200,210,220,.3);color:inherit;font:inherit;font-size:12px;line-height:1.45;overflow-wrap:anywhere;pointer-events:none}
  .ad-cw-gov-data .ad-cw-row{display:grid;grid-template-columns:105px minmax(0,1fr);gap:8px;margin:3px 0}
  .ad-cw-gov-data .ad-cw-label{opacity:.72}
  .ad-cw-gov-data .ad-cw-value{font-weight:600}
  .ad-cw-gov-data .ad-cw-title{font-weight:700;margin-bottom:4px}
  .ad-cw-gov-data .ad-cw-party{font-weight:700}
  [class*=\"cold-war\"] [class*=\"menu\"], [id*=\"cold-war\"] [class*=\"menu\"], [class*=\"coldwar\"] [class*=\"sidebar\"]{scrollbar-width:none!important;-ms-overflow-style:none!important;}
  [class*=\"cold-war\"] [class*=\"menu\"]::-webkit-scrollbar,[id*=\"cold-war\"] [class*=\"menu\"]::-webkit-scrollbar,[class*=\"coldwar\"] [class*=\"sidebar\"]::-webkit-scrollbar{width:0!important;display:none!important;}
  `;
  const s=document.createElement('style');s.id='ad-cw-tooltip-style';s.textContent=CSS;(document.head||document.documentElement).appendChild(s);
  let hovered=null,hoverElement=null,currentlyRendering=false;
  function safeText(node){return (node&&node.textContent||'').trim();}
  function countryFromString(raw){
    if(!raw) return null;let val=normalize(raw);if(!val||val.length>120)return null;
    if(val==='turkey'||val==='turkiye'||val==='turkiye cumhuriyeti')return {turkey:true};
    if(byName.has(val))return byName.get(val);
    // Full tooltip labels like "France — 1978" or "France (NATO)".
    for(const [name,c] of byName){if(val.startsWith(name+' ')&&val.length-name.length<=28)return c;}
    return null;
  }
  function fromNode(element){
    if(!element||!element.getAttribute)return null;
    const attrs=['data-country','data-country-name','data-name','data-region','data-region-name','data-country-id','aria-label','title','name','id'];
    let node=element;
    for(let depth=0;node&&depth<5;node=node.parentElement,depth++){
      for(const a of attrs){const c=countryFromString(node.getAttribute(a));if(c)return c;}
      const t=node.querySelector&&node.querySelector(':scope > title');if(t){const c=countryFromString(safeText(t));if(c)return c;}
      if(node.tagName&&node.tagName.toLowerCase()==='path'){
        const color=String(node.getAttribute('fill')||node.style.fill||'').toUpperCase();
        const list=byColor.get(color);if(list&&list.length===1)return list[0];
      }
    }
    return null;
  }
  function findCountry(event){
    const target=event.target;if(!target||!target.closest)return;
    if(target.closest('.ad-cw-gov-data'))return;
    const found=fromNode(target);
    if(found){hovered=found;hoverElement=target;requestUpdate();}
  }
  document.addEventListener('pointerover',findCountry,true);
  document.addEventListener('mouseover',findCountry,true);
  function gameDate(){
    function accept(x){
      if(x instanceof Date&&!Number.isNaN(x.getTime()))return x.toISOString().slice(0,10);
      if(typeof x==='string'){
        const match=x.match(/\b(19(?:7[2-9]|8[01]))[-\/](\d{1,2})[-\/](\d{1,2})\b/);
        if(match)return match[1]+'-'+match[2].padStart(2,'0')+'-'+match[3].padStart(2,'0');
        const year=x.trim().match(/^(197[2-9]|198[01])$/);if(year)return year[1]+'-01-01';
      }
      if(typeof x==='number'&&x>=1972&&x<=1981)return x+'-01-01';
      return null;
    }
    // Avoid invoking game methods: these are read-only probes of known common state names.
    const roots=[window.gameState,window.state,window.game,window.currentGame,window.simulationState,window.coldWarState];
    for(const obj of roots){if(!obj||typeof obj!=='object')continue;
      for(const key of ['currentDate','gameDate','date','current_date','year','currentYear']){
        try{const result=accept(obj[key]);if(result)return result;}catch(e){}
      }
      for(const nest of ['time','calendar','simulation']){
        const inner=obj[nest];if(!inner||typeof inner!=='object')continue;
        for(const key of ['date','currentDate','year','currentYear']){try{const result=accept(inner[key]);if(result)return result;}catch(e){}}
      }
    }
    for(const key of ['gameDate','currentGameDate','currentDate','gameYear','currentYear']){
      try{const result=accept(window[key]);if(result)return result;}catch(e){}
    }
    const selectors=['[data-game-date]','[id*=\"game-date\"]','[class*=\"game-date\"]','[class*=\"date-display\"]','[id*=\"current-date\"]','[id*=\"year-display\"]'];
    for(const sel of selectors){const el=document.querySelector(sel);if(!el)continue;const found=accept(el.getAttribute('data-game-date')||el.textContent);if(found)return found;}
    return null;
  }
  function ideologyColor(government){
    const v=String(government||'').toLowerCase();
    if(/marxis|communis|maoism|hoxhais|leninis|sandinism/.test(v))return '#D84A4A';
    if(/social democ|democratic socialis|labou?r party|socialist party|center left|centre left/.test(v))return '#E77777';
    if(/social liberal|liberalism|liberal party/.test(v))return '#E2BC53';
    if(/christian democ|conservat|center right|centre right|gaullism/.test(v))return '#5C95DB';
    if(/military|dictatorship|authoritarian|fascis|francoist|junta/.test(v))return '#9B8B78';
    if(/monarch|royal/.test(v))return '#B89ADE';
    if(/islamism|islamic republican/.test(v))return '#55B68B';
    if(/nationalis|ba.ath/.test(v))return '#6FBC9E';
    return '#C6C6C6';
  }
  function tooltipElements(){
    const q='[class*=\"tooltip\" i],[id*=\"tooltip\" i],[class*=\"country-info\" i],[id*=\"country-info\" i],[class*=\"country-detail\" i],[id*=\"country-detail\" i]';
    return Array.from(document.querySelectorAll(q)).filter(n=>!n.closest('.ad-cw-gov-data')&&n.getClientRects().length&&n.getBoundingClientRect().width>90&&n.getBoundingClientRect().height>20);
  }
  // Replace content inside the game's original three fields, never append a second panel.
  const FIELDS=[
    {label:/head\s+of\s+state/i,value:'head_of_state'},
    {label:/head\s+of\s+(?:government|govt\.?)/i,value:'head_of_government'},
    {label:/government/i,value:'government'}
  ];
  const EXACT_LABEL=/^\s*(head\s+of\s+state|head\s+of\s+(?:government|govt\.?)|government)\s*:?\s*$/i;
  const PREFIX=/^([\s\u00a0]*(?:head\s+of\s+state|head\s+of\s+(?:government|govt\.?)|government)\s*:\s*)([\s\S]*)$/i;
  function fieldFor(label){const v=normalize(label).replace(/\s+/g,' ');
    if(/^head of state$/.test(v))return 'head_of_state';
    if(/^head of (government|govt)$/.test(v))return 'head_of_government';
    if(/^government$/.test(v))return 'government';return null;
  }
  function colored(node,value,isGovernment){
    if(node.textContent!==value)node.textContent=value;
    if(isGovernment&&node.nodeType===1)node.style.color=ideologyColor(value);
  }
  function replaceField(tooltip,field,value){
    // Prefer updating a text node that contains the label and value together:
    // <div>Head of State: Placeholder</div>.
    const walker=document.createTreeWalker(tooltip,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      if(node.parentElement&&node.parentElement.closest('.ad-cw-gov-data'))continue;
      const match=node.nodeValue.match(PREFIX);
      if(!match||fieldFor(match[1])!==field)continue;
      // Only update if this text node actually has a value after the colon. If label
      // and value have separate nodes, handle the second case below.
      if(match[2].trim()){
        const next=match[1]+value;
        if(node.nodeValue!==next)node.nodeValue=next;
        if(field==='government'){const color=ideologyColor(value);if(node.parentElement.dataset.adGovColor!==color){node.parentElement.style.color=color;node.parentElement.dataset.adGovColor=color;}}
        return true;
      }
    }
    // Typical structured tooltip: <div><b>Head of State:</b> <span>Placeholder</span></div>.
    // Use the smallest DOM element containing an exact label, then replace its sibling value.
    for(const node of nodes){
      if(node.parentElement&&node.parentElement.closest('.ad-cw-gov-data'))continue;
      if(!EXACT_LABEL.test(node.nodeValue)||fieldFor(node.nodeValue)!==field)continue;
      let label=node.parentElement;
      if(!label)continue;
      for(let depth=0;label&&depth<3;label=label.parentElement,depth++){
        if(label===tooltip)break;
        let row=label.parentElement;
        if(!row||row===document.body)continue;
        // Avoid grabbing the entire tooltip: the smallest row must only have one of
        // the three field labels, and not be a wrapper containing other fields.
        const all=normalize(row.textContent);
        const otherFields=FIELDS.filter(f=>f.value!==field&&f.label.test(all)).length;
        if(otherFields)continue;
        const tw=document.createTreeWalker(row,NodeFilter.SHOW_TEXT);
        let candidate=null;
        while(tw.nextNode()){
          const t=tw.currentNode;
          if(t===node||t.parentElement&&t.parentElement.closest('.ad-cw-gov-data'))continue;
          if(!t.nodeValue.trim())continue;
          if(PREFIX.test(t.nodeValue)||EXACT_LABEL.test(t.nodeValue))continue;
          candidate=t;break;
        }
        if(candidate){
          if(candidate.nodeValue!==value)candidate.nodeValue=value;
          if(field==='government'){const color=ideologyColor(value);if(candidate.parentElement.dataset.adGovColor!==color){candidate.parentElement.style.color=color;candidate.parentElement.dataset.adGovColor=color;}}
          return true;
        }
      }
    }
    return false;
  }
  function tooltipCountry(tooltip){
    let country=null;
    for(const attr of ['data-country','data-country-name','data-name']){
      country=countryFromString(tooltip.getAttribute(attr));if(country)return country;
    }
    const candidates=tooltip.querySelectorAll('h1,h2,h3,h4,[class*="title" i],[class*="country-name" i],strong');
    for(const node of Array.from(candidates).slice(0,10)){
      country=countryFromString(safeText(node));if(country)return country;
    }
    // A few game tooltips are plain text rather than wrapped headers.
    const first=(tooltip.innerText||'').split('\n').map(x=>x.trim()).filter(Boolean);
    for(const line of first.slice(0,3)){country=countryFromString(line);if(country)return country;}
    return hovered;
  }
  function render(){
    if(currentlyRendering)return;
    const tooltips=tooltipElements();if(!tooltips.length)return;
    currentlyRendering=true;
    try{
      for(const tooltip of tooltips){
        // Remove the block injected by v1 on every update. It must not remain visible.
        tooltip.querySelectorAll('.ad-cw-gov-data').forEach(n=>n.remove());
        const country=tooltipCountry(tooltip);
        if(!country||country.turkey)continue; // Turkey stays connected to live game state.
        const date=gameDate();
        const record=country.periods.find(p=>date&&p.start<=date&&date<=p.end)
                   ||(!date?country.periods[0]:null);
        if(!record)continue;
        for(const field of FIELDS)replaceField(tooltip,field.value,record[field.value]);
      }
    }finally{currentlyRendering=false;}
  }
  let queued=false;
  function requestUpdate(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
  const observer=new MutationObserver(m=>{
    if(currentlyRendering)return;
    for(const item of m){if(item.target.nodeType===1&&item.target.closest&&item.target.closest('.ad-cw-gov-data'))continue;requestUpdate();break;}
  });
  function start(){if(document.body)observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style','title','data-country']});requestUpdate();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.ADColdWarGovernmentLookup={get:function(name,date){const c=countryFromString(name);return c&&!c.turkey?c.periods.find(p=>p.start<=date&&date<=p.end)||null:null;},version:'2.0',countries:countries.length};
})();
