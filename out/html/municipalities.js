(function(root){'use strict';
// User-supplied 1968 provincial-capital winners; ownership only, no invented vote totals.
const startingMunicipalWinners=Object.freeze({
  "adana": "chp",
  "artvin": "chp",
  "bilecik": "chp",
  "bingol": "chp",
  "canakkale": "chp",
  "corum": "chp",
  "diyarbakir": "chp",
  "gumushane": "chp",
  "hatay": "chp",
  "kars": "chp",
  "kocaeli": "chp",
  "malatya": "chp",
  "kahramanmaras": "chp",
  "siirt": "chp",
  "sinop": "chp",
  "sivas": "chp",
  "tokat": "chp",
  "trabzon": "chp",
  "tunceli": "chp",
  "yozgat": "chp",
  "zonguldak": "chp",
  "balikesir": "IND",
  "bursa": "IND",
  "cankiri": "IND",
  "elazig": "IND",
  "kirklareli": "IND",
  "kirsehir": "IND",
  "nevsehir": "IND",
  "nigde": "IND",
  "hakkari": "GP",
  "mardin": "GP",
  "van": "GP",
  "adiyaman": "AP",
  "afyon": "AP",
  "agri": "AP",
  "amasya": "AP",
  "ankara": "AP",
  "antalya": "AP",
  "aydin": "AP",
  "bitlis": "AP",
  "bolu": "AP",
  "burdur": "AP",
  "denizli": "AP",
  "edirne": "AP",
  "erzincan": "AP",
  "erzurum": "AP",
  "eskisehir": "AP",
  "gaziantep": "AP",
  "giresun": "AP",
  "isparta": "AP",
  "icel": "AP",
  "istanbul": "AP",
  "izmir": "AP",
  "kastamonu": "AP",
  "kayseri": "AP",
  "konya": "AP",
  "kutahya": "AP",
  "manisa": "AP",
  "mugla": "AP",
  "mus": "AP",
  "ordu": "AP",
  "rize": "AP",
  "sakarya": "AP",
  "samsun": "AP",
  "tekirdag": "AP",
  "urfa": "AP",
  "usak": "AP"
});
function controlSnapshot(Q){const local=(Q.province_election_history||[]).filter(s=>s.kind==='local');return local.length?local[local.length-1]:null;}
const now=Q=>(Number(Q.year)||1970)*24+((Number(Q.month)||1)-1)*2+(Q.week===2?1:0);
const definitions={waterlines:{max:3,cost:1,cooldown:6},publictransport:{max:4,cost:1,cooldown:6},libraries:{max:2,cost:1,cooldown:6},halkekmek:{max:2,cost:2,cooldown:6},roads:{max:3,cost:1,cooldown:6},migration:{max:1,cost:0,cooldown:12},infrastructure:{max:2,cost:0,cooldown:12},connect:{max:1,cost:0,parent:'infrastructure',required:2},regularization:{max:4,cost:0,cooldown:12},planning:{max:1,cost:0,parent:'regularization',required:4},transport:{max:3,cost:0,cooldown:8},industry:{max:3,cost:0,cooldown:8}};
function state(Q){return Q.municipal_development||{counts:{},dates:{}};}
const halved=['migration','infrastructure','regularization','transport','industry'];
function count(Q,id){const s=state(Q),value=s.counts[id]||0;return s.version===2||!halved.includes(id)?value:Math.ceil(value/2);}
function cost(Q,id){return Q.CHP_in_government?0:(definitions[id].cost||1);}
function reason(Q,id){const d=definitions[id];if(!d)return 'Unknown municipal programme.';if(!Q.CHP_in_government&&!['waterlines','publictransport','migration','infrastructure'].includes(id))return 'CHP must be in government.';if(count(Q,id)>=d.max)return 'This programme is fully completed.';if(d.parent&&count(Q,d.parent)<d.required)return 'Complete all '+d.required+' rounds of the preceding programme first.';const date=state(Q).dates[id];if(date!==undefined&&now(Q)-date<(d.cooldown||0))return 'This programme is already underway. More time is needed before another round can begin.';if((Number(Q.resources)||0)<cost(Q,id))return 'Not enough resources.';return '';}
function apply(Q,id){if(reason(Q,id))return false;const d=definitions[id];if(!Q.municipal_development)Q.municipal_development={counts:{},dates:{}};const s=Q.municipal_development;if(s.version!==2){for(const k of halved)s.counts[k]=count(Q,k);s.version=2;}s.counts[id]=count(Q,id)+1;s.dates[id]=now(Q);Q.resources-=cost(Q,id);const effects={waterlines:{workers_chp:1,petty_bourgeoisie_chp:1,state_employees_chp:1},publictransport:{workers_chp:3,state_employees_chp:1},libraries:{workers_chp:2,state_employees_chp:1,petty_bourgeoisie_chp:1},halkekmek:{workers_chp:5,petty_bourgeoisie_chp:3,state_employees_chp:2,AP_relation:-5}};for(const [k,v]of Object.entries(effects[id]||{}))Q[k]=(Number(Q[k])||0)+v;if(root.AnatolianCardActions)root.AnatolianCardActions.commit(Q);return true;}
const labels={transport:['Gutted Since the DP Era','Rebuilding','Early Expansion','Beginning to Rival Cars','Near 1970s Standards'],roads:['Widespread Unpaved Roads','Initial Paving Efforts','Major Roads Paved','Widespread Paved Roads'],sanitation:['Failing to Keep Up','Early Expansion','Modernizing','Keeping Pace with Urban Growth'],services:['Few and Far Between','Expanding Services','Established Municipal Services','Significant Cultural and Economic Opportunities']};
function levels(Q){return {'Public Transportation':labels.transport[count(Q,'publictransport')],'Urban Roads':labels.roads[count(Q,'roads')],Sanitation:labels.sanitation[count(Q,'waterlines')],'Public Services':labels.services[Math.min(3,count(Q,'libraries')+count(Q,'halkekmek'))]};}
function geceLevels(Q){return {'Stream of Immigration':['Rampant','Slowing Down','Significantly Slowed'][count(Q,'migration')*2],Infrastructure:['Nonexistent','Bare-Bones','Building Up','Vital Necessities Provided','Widespread Infrastructure'][count(Q,'infrastructure')*2],'Gecekondu Sprawl':['Chaotic Expansion','Gradual Transformation','Unsafe Construction Being Cleared','Planned Redevelopment','Evolving into Apartment Districts'][count(Q,'planning')?4:Math.min(2,Math.ceil(count(Q,'regularization')/2))],'Public Transportation':['Nonexistent','Bare-Bones','Building Up','Essential Coverage','Near Urban Standards'][Math.ceil(count(Q,'transport')*4/3)],'Economic Sector':['Dependent on City Centers','Bare-Bones Local Economy','Emerging Small Businesses','Workshops and Local Industry','Local Factories Forming'][Math.ceil(count(Q,'industry')*4/3)]};}
const rows=o=>Object.entries(o).map(([k,v])=>'<p>'+k+': '+v+'</p>').join('');
function progress(Q){return rows({'Migration Restrictions':count(Q,'migration')+'/1','Infrastructure Integration':count(Q,'infrastructure')+'/2','Land Regularization':count(Q,'regularization')+'/4','Public Transport & Services':count(Q,'transport')+'/3','Economic Integration':count(Q,'industry')+'/3','Urban Connections':count(Q,'connect')+'/1','Large-Scale Urban Planning':count(Q,'planning')+'/1'});}
function municipalHtml(Q){return '<h1 class="game-section-title">Municipalities</h1><p>Municipalities Controlled: '+(Q.municipalities_controlled||0)+'/'+(Q.total_municipalities||67)+'</p>'+rows(levels(Q));}
function geceHtml(Q){return '<h1 class="game-section-title">Gecekondu Issue</h1>'+rows(geceLevels(Q));}
function html(Q){return municipalHtml(Q)+geceHtml(Q);}

const api={startingMunicipalWinners,controlSnapshot,now,definitions,cost,count,reason,apply,levels,geceLevels,progress,municipalHtml,geceHtml,html};root.AnatolianMunicipalities=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
