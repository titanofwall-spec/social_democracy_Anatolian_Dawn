(function(){
  'use strict';
  const normal=s=>String(s||'').normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
  const database=new Map(window.ColdWarGovernmentData.countries.map(c=>[normal(c.name),c]));
  const colorCache=new Map();
  const text=value=>value===null||value===undefined||value===''?'Not available':String(value);
  function date(){
    const q=window.dendryUI?.dendryEngine?.state?.qualities||{};
    const year=Number(q.year)||1972,month=Math.max(1,Math.min(12,Number(q.month)||1)),day=Number(q.week)===2?16:1;
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function hue(ideology){
    const s=normal(ideology);
    if(/marx|lenin|mao|hoxha|tito|communis/.test(s))return 5;
    if(/social democ|center left/.test(s))return 343;
    if(/democratic social|african social|military social|arab social|ba.ath|left wing/.test(s))return 15;
    if(/islam/.test(s))return 145;
    if(/christian democ|christian.*conserv/.test(s))return 225;
    if(/conserv|center right|gaull|right wing|right-wing/.test(s))return 215;
    if(/social liberal/.test(s))return 175;
    if(/liberal/.test(s))return 48;
    if(/agrarian/.test(s))return 95;
    if(/military|authoritarian|dictatorship/.test(s))return 277;
    if(/monarch|royal/.test(s))return 295;
    if(/national|republican|z ion|z ionism|zionism|populis|mobut/.test(s))return 30;
    if(/center|centr|big tent|broad front|transition|independent/.test(s))return 180;
    if(/social/.test(s))return 355;
    return 200;
  }
  function ideologyLabel(value){
    const primary=String(value||'').split('/')[0].trim();
    const aliases={'social liberal':'Social Liberalism','social liberalism':'Social Liberalism','social democracy':'Social Democracy','conservative':'Conservatism','conservatism':'Conservatism','liberal':'Liberalism','liberalism':'Liberalism','independent':'Independent','independents':'Independent','center':'Centrism','centrism':'Centrism'};
    return aliases[normal(primary)]||primary;
  }
  function color(name,ideology){
    const key=normal(ideologyLabel(ideology));
    const fixed={'independent':'#808080','national catholicism':'#DF3D24','social liberalism':'#66CDB5','liberalism':'#F2CD5E','conservatism':'#6B97DE','social democracy':'#F275A3','democratic socialism':'#EB7771','marxism-leninism':'#E56464','centrism':'#75BFCB'};
    if(fixed[key])return fixed[key];
    if(!colorCache.has(key)){
      const n=hash(key),h=(hue(key)+(n%23)-11+360)%360;
      colorCache.set(key,`hsl(${h} ${58+((n>>>5)%19)}% ${65+((n>>>12)%9)}%)`);
    }
    return colorCache.get(key);
  }
  function describeGovernment(value){
    if(!value)return [{name:'Not available',ideology:''}];
    // Use the final top-level parentheses, preserving parenthetical party names such as Congress (I).
    let depth=0,start=-1,end=-1;
    for(let i=0;i<value.length;i++){
      if(value[i]==='('){if(depth===0)start=i;depth++;}
      if(value[i]===')'){depth--;if(depth===0)end=i;}
    }
    let label=value,ideology='',suffix='';
    if(start>=0&&end>start){label=value.slice(0,start).trim();ideology=value.slice(start+1,end);suffix=value.slice(end+1);}
    const parts=label.split(/\s*[–—]\s*|\s+\/\s+/),ideologies=ideology.split(/\s*\/\s*/);
    return parts.map((name,i)=>({name,ideology:ideologyLabel(ideologies.length===parts.length?ideologies[i]:ideology),suffix:i===parts.length-1?suffix:''}));
  }
  const turkish={
    CHP:['Republican People’s Party (CHP)','Social Democracy'],AP:['Justice Party (AP)','Liberal Conservatism'],
    CGP:['Republican Reliance Party (CGP)','Center Right'],DP:['Democratic Party (DP)','Conservatism'],
    MSP:['National Salvation Party (MSP)','Islamism'],TIP:['Workers’ Party of Turkey (TİP)','Democratic Socialism'],
    MHP:['Nationalist Movement Party (MHP)','Nationalism'],I:['Independents','Independent']
  };
  function turkey(){
    const q=window.dendryUI?.dendryEngine?.state?.qualities||{};
    const codes=Object.keys(turkish).filter(code=>Number(q[code+'_in_government'])===1);
    const pm=q.prime_minister_party;
    if(pm){const index=codes.indexOf(pm);if(index>=0)codes.splice(index,1);codes.unshift(pm);}
    const parties=[...new Set(codes)].map(code=>({name:turkish[code]?.[0]||String(code),ideology:ideologyLabel(turkish[code]?.[1]||'Independent')}));
    return {head_of_state:text(q.president),head_of_government:text(q.prime_minister),parties:parties.length?parties:[{name:'Not available',ideology:''}]};
  }
  function record(name, today = date()){
    if(normal(name)==='greenland')name='Denmark';
    if(normal(name)==='turkey')return turkey();
    const entry=database.get(normal(name));
    const period=entry?.periods.find(p=>p.start<=today && p.end>=today);
    const government=normal(name)==='canada' && period?.head_of_government==='Pierre Trudeau'
      ? 'Liberal Party (Social Liberalism)' : period?.government;
    return {head_of_state:text(period?.head_of_state),head_of_government:text(period?.head_of_government),parties:describeGovernment(government)};
  }
  function render(name,tip){
    const today = date();
    const historicalKey = name + ':' + today;
    const isTurkey = normal(name) === 'turkey';
    if (!isTurkey && tip.dataset.governmentKey === historicalKey) return;
    const data = record(name, today);
    const key = isTurkey ? JSON.stringify([name, data]) : historicalKey;
    if (tip.dataset.governmentKey === key) return;
    tip.dataset.governmentKey=key;tip.replaceChildren();
    const title=document.createElement('strong');title.textContent=name;tip.append(title);
    for(const [label,value] of [['Head of State',data.head_of_state],['Head of Government',data.head_of_government]]){
      const row=document.createElement('div'),heading=document.createElement('b');heading.textContent=label+': ';row.append(heading,document.createTextNode(value));tip.append(row);
    }
    const row=document.createElement('div'),heading=document.createElement('b');row.className='cold-war-government-info';heading.className='cold-war-government-label';heading.textContent='Government: ';row.append(heading);
    data.parties.forEach((party,i)=>{
      if(i)row.append(document.createTextNode(' / '));
      const span=document.createElement('span');span.className='cold-war-government-party';span.textContent=party.name;
      if(party.ideology){span.style.color=color(party.name,party.ideology);span.title=party.ideology;}
      row.append(span);

      if(party.suffix)row.append(document.createTextNode(party.suffix));
    });
    const governmentIdeology=ideologyLabel(data.parties.find(p=>p.ideology)?.ideology);
    if(governmentIdeology)row.append(document.createTextNode(' ('+governmentIdeology+')'));
    tip.append(row);
  }
  // Shared ideology colors are independent of country, party and hover order.
  window.ColdWarGovernmentData.countries.forEach(c=>c.periods.forEach(p=>describeGovernment(p.government).forEach(party=>color(party.name,party.ideology))));
  Object.values(turkish).forEach(([name,ideology])=>color(name,ideology));
  window.ColdWarGovernments={render};
}());

