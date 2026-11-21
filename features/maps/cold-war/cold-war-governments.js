(function(){
  'use strict';
  const normal=s=>String(s||'').normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
  const database=new Map(window.ColdWarGovernmentData.countries.map(c=>[normal(c.name),c]));
  const text=value=>value===null||value===undefined||value===''?'Not available':String(value);
  function date(){
    const q=window.dendryUI?.dendryEngine?.state?.qualities||{};
    const year=Number(q.year)||1972,month=Math.max(1,Math.min(12,Number(q.month)||1)),day=Number(q.week)===2?16:1;
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  function ideologyLabel(value){
    const primary=String(value||'').split('/')[0].trim();
    const aliases={'social liberal':'Social Liberalism','social liberalism':'Social Liberalism','social democracy':'Social Democracy','conservative':'Conservatism','conservatism':'Conservatism','liberal':'Liberalism','liberalism':'Liberalism','independent':'Independent','independents':'Independent','center':'Centrism','centrism':'Centrism'};
    return aliases[normal(primary)]||primary;
  }
  const ideologyGroups = [
    {
      name: 'Social democracy and center-left',
      color: '#e3000f',
      ideologies: ['Social Democracy', 'Center Left']
    },
    {
      name: 'Socialism and left-wing movements',
      color: '#b90202',
      ideologies: ['African Socialism', 'Arab Socialism', 'Ba’athism', 'Cooperative Socialism',
        'Democratic Socialism', 'Left Wing', 'Military Socialism', 'Sandinismo', 'Third International Theory']
    },
    {
      name: 'Communist and communist currents',
      color: '#780000',
      ideologies: ['Hoxhaism', 'Maoism', 'Marxism-Leninism', 'National Communism', 'Post-Mao transition',
        'Scientific Socialism', 'Socialism with Chinese characteristics, emerging', 'Titoism']
    },
    {
      name: 'Liberalism and centrism',
      color: '#ebbd33',
      ideologies: ['Centrism', 'Liberalism', 'National Liberalism', 'Reformism', 'Social Liberalism',
        'Agrarianism', 'Bourguibism']
    },
    {
      name: 'Conservatism and center-right',
      color: '#315fac',
      ideologies: ['Authoritarian Conservatism', 'Center Right', 'Christian Democracy', 'Conservatism',
        'Gaullism', 'Liberal Conservatism', 'Modernizing Conservatism', 'National Catholicism', 'Right Wing']
    },
    {
      name: 'Nationalism and nationalist movements',
      color: '#954b00',
      ideologies: ['African Nationalism', 'Arab Nationalism', 'Authoritarian Nationalism', 'Cypriot Nationalism',
        'Greek Nationalism', 'Hutu Nationalism', 'Institutional Revolutionary Nationalism', 'Labor Zionism',
        'Mobutism', 'Nationalism', 'One-party Nationalism']
    },
    {
      name: 'Islamic political movements',
      color: '#054521',
      ideologies: ['Islamic Conservatism', 'Islamic Republicanism', 'Islamism']
    },
    {
      name: 'Monarchism',
      color: '#84257f',
      ideologies: ['Monarchism', 'Monarchism; contested sovereignty', 'Personalist Monarchy', 'Traditional Monarchy']
    },
    {
      name: 'Authoritarian and military rule',
      color: '#5b7387',
      ideologies: ['Authoritarianism', 'Military Authoritarianism', 'Military Populism', 'One-party rule',
        'Personalist Authoritarianism', 'Personalist Dictatorship', 'Right-wing Authoritarianism', 'Torrijismo']
    },
    {
      name: 'Coalitions, transitions, and nonpartisan government',
      color: '#808080',
      ideologies: ['Big Tent', 'Broad Front', 'Consociational', 'Democratic Transition', 'Independent',
        'Multi-faction coalition', 'Technocracy', 'Transitional']
    }
  ];
  const ideologyColors = new Map();
  ideologyGroups.forEach(group => {
    group.ideologies.forEach(ideology => ideologyColors.set(normal(ideology), group.color));
  });
  function color(name, ideology) {
    return ideologyColors.get(normal(ideologyLabel(ideology))) || '#808080';
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

