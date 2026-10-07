// Cyprus campaign roadmap: July 20 through August 30, plus later implementation.
(function(root){
 'use strict';
 var r=root.AnatolianRules,c=r.cyprusAtilla1,legacy=r.cyprusCampaign;
 var previous={resolve:c.resolve,resolveHistory:c.resolveHistory,scene:c.scene,historyScene:c.historyScene,endingReady:c.endingReady,awardEnding:c.awardEnding,continueEnding:c.continueEnding,advanceDate:c.advanceDate,mapImage:c.mapImage,supportUnavailable:c.supportUnavailable,useSupport:c.useSupport,choiceTooltip:c.choiceTooltip};
 var names={uk:'United Kingdom',us:'United States',greece:'Greece'},stances=['Hostile','Suspicious','Neutral','Friendly','Very Friendly'];
 function active(Q){return Q.cyprus_campaign_version===2;}
 function number(v){return r.number(v);}
 function shift(Q,country,delta){Q[country+'_attitude']=r.clamp(number(Q[country+'_attitude'])+delta,-2,2);}
 function stamp(Q){return Q.cyprus_month+'-'+Q.cyprus_day;}
 function initFields(Q){
  Object.assign(Q,{cyprus_roadmap_seen:[],cyprus_geneva_advance_days:[],cyprus_ceasefire_days:[],cyprus_geneva_leverage:0,cyprus_diplomatic_turns:0,cyprus_selected_plan:'',cyprus_poppy_penalty:Q.hashas_done===1?1:0,cyprus_gunes_backing:0,cyprus_gunes_agreed:0,cyprus_northern_canton:0,cyprus_gunes_announced:0,cyprus_implementation_pending:0,cyprus_implementation_complete:0,cyprus_later_negotiations:0,cyprus_later_last_turn:'',cyprus_roadmap_event_title:'',cyprus_roadmap_event_text:'',cyprus_roadmap_report:'',cyprus_roadmap_outcome:''});
 }
 function initialize(Q){legacy.initialize(Q);initFields(Q);Q.cyprus_campaign_version=2;Q.cyprus_atilla1_end_day=30;}
 function migrate(Q){
  if(Q.cyprus_campaign_version!==1)return;
  if(Q.cyprus_campaign_resolved){
   if(Q.cyprus_final_result==='Historical Division'&&Q.cyprus_atilla2_complete){
    var votes=Q.cyprus_plan_votes||{},chosen=Object.keys(votes.denktas||{}).length>Object.keys(votes.gunes||{}).length?'denktas':'gunes';
    initFields(Q);Q.cyprus_selected_plan=chosen;Q.cyprus_campaign_version=2;
   }
   return;
  }
  if(!Q.cyprus_mode)return;
  var frozen=Q.cyprus_frontline_frozen,oldVotes=Q.cyprus_plan_votes||{},plan=Q.cyprus_selected_plan||(Object.keys(oldVotes.denktas||{}).length>Object.keys(oldVotes.gunes||{}).length?'denktas':'');initFields(Q);Q.cyprus_campaign_version=2;Q.cyprus_atilla1_end_day=30;Q.cyprus_selected_plan=plan||'';
  if(frozen){Q.cyprus_early_freeze=1;Q.cyprus_atilla1_halted=1;addCeasefireDays(Q,number(Q.cyprus_frontline_map_day),Math.min(28,Q.cyprus_month>7?28:Q.cyprus_day-1));}
  (Q.cyprus_atilla1_results||[]).forEach(function(result){var day=result.day||({july25:25,july26:26,july2728:28})[result.key];if(day>=25&&day<=28&&result.action==='historical'&&Q.cyprus_geneva_advance_days.indexOf(day)<0)Q.cyprus_geneva_advance_days.push(day);});
  if(Q.cyprus_month===8&&Q.cyprus_day>=12)Q.cyprus_selected_plan=plan||'gunes';
  if(Q.cyprus_month===8&&Q.cyprus_day>=14&&Q.cyprus_campaign_phase!=='atilla2'){Q.cyprus_selected_plan=Q.cyprus_selected_plan||'gunes';}
 }
 function tick(Q){if(Q.cyprus_month>7||Q.cyprus_day>=23){if(!Q.cyprus_juntas_fallen){Q.cyprus_juntas_fallen=1;Q.greece_attitude=-1;}if(Q.cyprus_geneva_advance_days.length)Q.greece_attitude=-2;}}
 function advance(Q,days){for(var i=0;i<(days||1);i++){previous.advanceDate(Q);tick(Q);}return true;}
 function freeze(Q,day){if(!Q.cyprus_frontline_frozen){Q.cyprus_frontline_map_day=day;Q.cyprus_frontline_frozen=1;}Q.cyprus_early_freeze=1;Q.cyprus_atilla1_halted=1;Q.cyprus_campaign_phase='ceasefire';Q.cyprus_support_bonus=0;}
 function recordAdvance(Q,day){if(day>=25&&Q.cyprus_geneva_advance_days.indexOf(day)<0){Q.cyprus_geneva_advance_days.push(day);shift(Q,'uk',-1);shift(Q,'us',-1);Q.greece_attitude=-2;Q.cyprus_atilla1_credibility='Operations continued during Geneva I; foreign confidence weakened';}}
 function finishI(Q){
  if(Q.cyprus_score_snapshot)return;Q.cyprus_operation_score=Q.cyprus_atilla1_results.reduce(function(s,x){return s+number(x.score);},0);
  Q.cyprus_readiness_score=2*(number(Q.cyprus_support_spent)+Math.max(0,number(Q.military_strength)));
  Q.cyprus_atilla1_score=Math.min(720,Q.cyprus_operation_score+Q.cyprus_readiness_score);Q.cyprus_atilla1_max_score=720;
  Q.cyprus_campaign_failed=!Q.cyprus_atilla1_junction||Q.cyprus_operation_score<60?1:0;
  Q.cyprus_atilla1_ending=Q.cyprus_campaign_failed?'Failure':Q.cyprus_atilla1_score>=540?'Massive':Q.cyprus_atilla1_score>=360?'Successful':'Failure';
  var base=Q.cyprus_campaign_failed?0:Q.cyprus_atilla1_ending==='Massive'?4:Q.cyprus_atilla1_ending==='Successful'?2:0;
  Q.cyprus_geneva_leverage=Q.cyprus_campaign_failed?0:Math.max(0,base+Q.cyprus_ceasefire_days.length*2-Q.cyprus_geneva_advance_days.length);
  Q.cyprus_atilla1_reward=Q.cyprus_geneva_leverage;Q.cyprus_atilla1_complete=1;Q.cyprus_score_snapshot=1;
 }
 function endingReady(Q){return active(Q)&&Q.cyprus_month===7&&Q.cyprus_day===30&&!Q.cyprus_atilla1_ending_seen&&Q.cyprus_roadmap_seen.indexOf('geneva1')>=0;}
 function awardEnding(Q){if(!active(Q))return previous.awardEnding(Q);if(!endingReady(Q)||Q.cyprus_atilla1_reward_paid)return false;finishI(Q);Q.leverage_points=number(Q.leverage_points)+Q.cyprus_atilla1_reward;Q.cyprus_atilla1_reward_paid=1;Q.cyprus_atilla1_reward_paid_amount=Q.cyprus_atilla1_reward;return true;}
 function continueEnding(Q){if(!active(Q))return previous.continueEnding(Q);if(!Q.cyprus_atilla1_reward_paid||Q.cyprus_atilla1_ending_seen)return false;Q.cyprus_atilla1_ending_seen=1;Q.cyprus_campaign_phase='diplomacy';if(Q.cyprus_campaign_failed)settle(Q,'Military Defeat');else advance(Q);return true;}
 function availableMilitary(Q,day){return active(Q)&&Q.cyprus_mode&&!Q.cyprus_campaign_resolved&&!Q.cyprus_frontline_frozen&&Q.cyprus_month===7&&Q.cyprus_day===day&&day>=20&&day<=28&&!Q.cyprus_atilla1_complete&&!Q.cyprus_atilla1_results.some(function(x){return x.day===day;});}
 function militaryOption(day,action){return day<=24?c.days[day].actions[action]:c.historyEvents[day===25?'july25':day===26?'july26':'july2728'].actions[action];}
 function resolveMilitary(Q,day,action,random){
  if(!availableMilitary(Q,day)||!militaryOption(day,action))return false;
  c.ensureSupport(Q);tick(Q);var option=militaryOption(day,action),bonus=number(Q.cyprus_support_bonus),base=c.roll(c.militaryTier(Q),option.requirement,random),score=Math.min(80,base+bonus);
  if(day===21&&c.militaryTier(Q)>=2)score=Math.max(20,score);
  var index=legacy.resultIndex(score),text=option.text[index];Q.cyprus_support_bonus=0;
  if(day===21){Q.cyprus_atilla1_junction=index?1:0;Q.cyprus_frontline_quality=index;Q.cyprus_atilla1_frontline=index>=3?'Superior Defensive Position':index>=2?'A secure connected corridor':index?'An exposed connected corridor':'Separate positions; junction failed';}
  if(day>=22&&index>=2){Q.cyprus_frontline_quality=Math.max(Q.cyprus_frontline_quality,index);Q.cyprus_atilla1_frontline=Q.cyprus_frontline_quality>=3?'Superior Defensive Position':'A secure connected corridor';Q.cyprus_atilla1_enemy_damage=index===3?'Key attacking formations severely depleted':'Opposing formations substantially weakened';}
  if(day===24){
   Q.cyprus_airport_assured=action==='pressure'?0:1;Q.cyprus_un_confrontation=0;
   Q.cyprus_atilla1_access=action==='alternative'&&index>=2?'UN-monitored access granted; airport remains under UN control':action!=='pressure'?'Turkey promises not to seize the airport; airport remains under UN control':'Airport access disputed; UN control remains';
   if(action==='pressure')text=['Pressure around the airport produces no useful gain; Turkish troops remain outside the UN perimeter.','Our troops improve a few approaches without entering the UN-held airport.','Our troops strengthen the approaches around the airport while avoiding direct contact with UN forces.','Our troops secure commanding approaches without entering the UN perimeter; the airport remains under international control.'][index];
  }
  Q.cyprus_atilla1_results.push({day:day,action:action,score:score,baseScore:base,supportBonus:bonus,tier:c.resourceTiers[c.resourceTier(Q)].name,outcome:c.outcomes[index],text:text});
  Q.cyprus_atilla1_score+=score;Q.cyprus_atilla1_last_outcome=c.outcomes[index];Q.cyprus_atilla1_last_text=text;Q.cyprus_history_last_outcome=c.outcomes[index];Q.cyprus_history_last_text=text;
  if(day===21&&!index){finishI(Q);settle(Q,'Military Defeat');return true;}
  if(day>=22&&action==='alternative'){
   freeze(Q,day);Q.cyprus_restraint_protection=1;Q.cyprus_atilla1_credibility='Offensive movement halted; UN protection and ceasefire implementation prioritized';
   Q.cyprus_un_support=Math.max(1,number(Q.cyprus_un_support));Q.cyprus_airport_assured=1;
   if(day<24)Q.cyprus_atilla1_access='Turkey promises not to seize the airport; airport remains under UN control';
   Q.cyprus_atilla1_last_text=''+text+' All further offensive movement is now prohibited. The frontline is frozen, and the remaining July events concern ceasefire enforcement and protection of Turkish communities.';
   Q.cyprus_history_last_text=Q.cyprus_atilla1_last_text;
   // The halt choice itself implements today's ceasefire programme.
   addCeasefireDays(Q,day,day);Q.cyprus_roadmap_seen.push('ceasefire-'+day);
  }else recordAdvance(Q,day);
  advance(Q);return true;
 }
 function addCeasefireDays(Q,first,last){for(var d=first;d<=last;d++)if(d>=22&&d<=28&&Q.cyprus_ceasefire_days.indexOf(d)<0)Q.cyprus_ceasefire_days.push(d);}
 var ceasefire={22:['The ceasefire must hold','Turkey calls on Greek forces to halt their movements. Our troops stop offensive operations, reinforce the line already held and report any renewed fighting to the United Nations.'],23:['Orders must reach the militias','The juntas have fallen, but Greek Cypriot formations have not all stopped fighting. Ankara demands that the new authorities halt their movements and make the ceasefire effective. Our soldiers reinforce their positions without seeking new ground.'],24:['Protection for Turkish villages','Reports from exposed Turkish villages make clear that a ceasefire between armies is not enough. Turkey demands protection for the civilians still outside its lines and requests UN monitoring. The airport remains under UN control, while our troops strengthen the frozen perimeter.'],25:['Geneva I begins','The delegations meet in Geneva while reports of attacks on Turkish villages continue. Turkey calls for the remaining attacks to stop and for Britain and the United States to press the Greek authorities. Our forces reinforce their existing lines; no territorial expansion is authorized.'],26:['Violations must be recorded','Turkey protests movements by Greek units that violate the ceasefire. Our delegation asks for the reports to be investigated rather than ignored. The troops on Cyprus reinforce the line and remain ready to defend it, but they do not advance.'],27:['Evidence from the villages','On July 27–28, the Turkish delegation presents evidence of continued attacks against Turkish Cypriots. It asks for reliable protection, local ceasefire arrangements and proper investigation of the incidents. The army reinforces its positions while the diplomats work to make the truce effective.'],28:['Evidence from the villages','The Turkish delegation continues presenting evidence of attacks against Turkish Cypriots. Its demands concern protection and ceasefire enforcement. Turkish troops hold and reinforce the same line.']};
 function eventKey(Q){
  if(Q.cyprus_month===7){if(Q.cyprus_day>=22&&Q.cyprus_day<=28&&Q.cyprus_frontline_frozen)return 'ceasefire-'+Q.cyprus_day;if(Q.cyprus_day===29||Q.cyprus_day===30)return 'geneva1';if(Q.cyprus_day===31)return 'declaration';}
  if(Q.cyprus_month===8){if(Q.cyprus_campaign_phase==='implementation'){return Q.cyprus_day===15?'notification':Q.cyprus_day===21?'canton':Q.cyprus_day===30?'announcement':'';}if(Q.cyprus_campaign_phase==='atilla2')return Q.cyprus_day>=14&&Q.cyprus_day<=18?'atilla2-'+Q.cyprus_day:'';if(Q.cyprus_day===8||Q.cyprus_day===9)return 'geneva2-opening';if(Q.cyprus_day>=10&&Q.cyprus_day<=14)return 'geneva2-'+Q.cyprus_day;}
  return '';
 }
 function pending(Q){
  migrate(Q);if(!active(Q))return legacy.pending(Q);if(!Q.cyprus_mode)return null;tick(Q);
  if(Q.cyprus_campaign_resolved)return Q.cyprus_final_seen?null:'cyprus_campaign_final';
  if(endingReady(Q))return 'cyprus_atilla1_ending';
  var id=eventKey(Q);if(id&&Q.cyprus_roadmap_seen.indexOf(id)<0)return 'cyprus_roadmap_event';
  if(availableMilitary(Q,Q.cyprus_day)&&Q.cyprus_day>=27)return 'cyprus_roadmap_military';
  return null;
 }
 var events={
  geneva1:['29–30 July 1974 — Geneva I concludes','The delegations have reached the end of the First Geneva Conference. They accept a framework for the ceasefire and agree that the political future of Cyprus must be discussed at a second conference. Turkey will have to turn its military position into a lasting settlement.\n\nThe military phase of Atilla I is over. The line will now remain fixed. The record of the campaign, and the days spent pursuing diplomacy rather than continuing operations during Geneva I, will determine the leverage available in the next round.'],
  declaration:['31 July 1974 — The declaration must be implemented','Turkey confirms that the decisions of Geneva I and the ceasefire will be fully implemented. Its troops will hold their positions, while the delegations prepare for the next conference.\n\nBetween August 1 and 8, there will be four diplomatic turns. Use the British and American flags to improve their attitudes towards Turkey. Every diplomatic action, or Skip 2 Days, uses one turn.'],
  'geneva2-opening':['8–9 August 1974 — Geneva II begins','Geneva II opens with two main questions: the decisions accepted at the first conference but still not implemented, and the constitutional structure of Cyprus. The ceasefire line, prisoners and the safety of Turkish villages are referred to expert committees.\n\nMavros objects to discussing constitutional matters before Denktaş and Clerides arrive. Güneş sees another attempt to delay the negotiations. A new conference will achieve little if it avoids the question for which it was called.'],
  'geneva2-10':['10 August 1974 — Two communities, five parties','A dispute breaks out over the place of Denktaş and Clerides. Are they members of one delegation representing the Republic of Cyprus, or equal representatives of its two communities? The Turkish side secures a five-party conference.\n\nTurkey and Denktaş ask for a federal arrangement based on geographical separation. Clerides maintains that the 1960 Constitution is still legally valid and that the conference cannot impose a new one under the threat of Turkish force. Mavros and Callaghan support him.\n\nThe Turkish delegation argues that restoring the old system would restore the conditions that produced the crisis. Denktaş and Clerides will meet privately tomorrow and try to find a solution.'],
  'geneva2-11':['11 August 1974 — Another meeting without agreement','Denktaş and Clerides meet, but fail to reach an agreement. Patience in Ankara is running out. Ecevit makes clear that Turkey is prepared to resume military operations if the other side refuses any concession.\n\nKissinger suggests considering a multi-zone federal system instead of a single Turkish zone and a single Greek zone. Güneş finds the idea reasonable. It offers another way of seeking geographical autonomy without insisting on one continuous Turkish region.'],
  'geneva2-12':['12 August 1974 — Two plans on the table','Güneş presents two proposals. The Denktaş Plan would establish a clearly defined Turkish region in the north and a Greek region in the south within a federal Cyprus. The Güneş Plan would establish six geographically separate autonomous Turkish cantons under a federal structure.\n\nCallaghan says the Denktaş proposal will never be accepted, but suggests that the Greek Cypriot side may consider the second plan. Turkey must now choose which proposal to pursue.\n\nThe Güneş diplomatic route requires Britain to be at least Neutral, America to be Friendly or Very Friendly, no pre-crisis lifting of the poppy ban, and a strong military position supported by restraint, airport guarantees and UN cooperation.'],
  'geneva2-13':['13 August 1974 — The demand for more time','The Greek Cypriot side asks for another thirty-six to forty-eight hours. Güneş refuses: the delegates can contact their governments immediately, and the constitutional question was the reason for convening this conference. He warns that another postponement could turn the crisis into years of further negotiations.'],
  'geneva2-14':['14 August 1974 — Clear answers','Güneş asks for answers to three questions: will a new system based on geographical regions be accepted, will approximately 34% of the island pass to Turkish Cypriot administration, and will a security zone west of the existing Turkish-held territory be accepted?'],
  notification:['15 August 1974 — From agreement to administration','The governments, community leaders and relevant institutions are informed of the Güneş agreement. Implementation begins today. The army remains on its existing line while civilian officials prepare the six-canton federal arrangement.'],
  canton:['21 August 1974 — The northern canton','During the first week of implementation, the largest Turkish canton in northern Cyprus is established under the Güneş agreement. Officials begin transferring administrative responsibilities and arranging the guarantees accepted at Geneva. The remaining implementation work continues under international supervision.'],
  announcement:['30 August 1974 — The Güneş Plan is announced','The Güneş Plan is formally announced. Cyprus will have a federal structure with six geographically separate autonomous Turkish cantons. The agreement has been achieved without Atilla II.\n\nThe minigame ends here. The implementation process that began on August 15 will continue, and a later report will confirm when the full arrangement is in force.']
 };
 function prepareEvent(Q){
  var id=eventKey(Q),data=events[id];if(id.indexOf('ceasefire-')===0)data=[(Q.cyprus_day===27?'27–28 July 1974':Q.cyprus_date_display)+' — '+ceasefire[Q.cyprus_day][0],ceasefire[Q.cyprus_day][1]];
  if(id.indexOf('atilla2-')===0)data=[Q.cyprus_date_display+' — Atilla II',iiBrief(Q.cyprus_day)];
  if(!data)return false;
  Q.cyprus_roadmap_event_title=data[0];var text=data[1];
  if(id==='geneva2-13')text=Q.cyprus_selected_plan==='denktas'?'The Greek Cypriot representatives categorically reject the Denktaş Plan. The argument becomes more hostile than at any earlier stage of Geneva II. The session ends early, with neither side willing to move from its position.':text+(gunesEligible(Q)?'\n\nLater that day, Güneş meets with Kissinger. The multi-zone proposal grew partly from Kissinger’s own suggestion, and the American secretary agrees to support it.':'\n\nThere is no meeting with Kissinger. Turkey has not secured the political conditions needed for American backing of the plan.');
  if(id==='geneva2-14')text=Q.cyprus_selected_plan==='denktas'?'The Denktaş proposal remains rejected. The conference has failed to produce the geographical settlement demanded by Turkey. Ankara orders Atilla II to begin.':text+(Q.cyprus_gunes_backing?'\n\nKissinger presses Britain to support the proposal. Callaghan accepts the American pressure, and the Greek representatives begin negotiating the three points. Around noon, they accept the Güneş Plan.':'\n\nClerides asks for another forty-eight hours. Güneş refuses and declares that, from Turkey’s perspective, the conference is over. Ankara prepares to resume the operation.');
  Q.cyprus_roadmap_event_text=text.replace(/\n\n/g,'<br><br>');return true;
 }
 function eventIs(Q,type){return active(Q)&&eventKey(Q)===type;}
 function ceasefireAvailable(Q){return active(Q)&&eventKey(Q).indexOf('ceasefire-')===0;}
 function ordinaryEvent(Q){var id=eventKey(Q);return !!id&&!ceasefireAvailable(Q)&&id!=='geneva2-12'&&id.indexOf('atilla2-')!==0;}
 function resolveEvent(Q,action){
  var id=eventKey(Q);if(!id||Q.cyprus_roadmap_seen.indexOf(id)>=0)return false;
  if(ceasefireAvailable(Q)){
   if(!['demand','monitor'].includes(action))return false;var end=Q.cyprus_day===27?28:Q.cyprus_day;addCeasefireDays(Q,Q.cyprus_day,end);
   if(action==='monitor'){Q.cyprus_un_support=Math.min(2,number(Q.cyprus_un_support)+1);shift(Q,'uk',1);shift(Q,'us',1);}
   Q.cyprus_restraint_protection=1;Q.cyprus_airport_assured=1;Q.cyprus_atilla1_access='Turkey promises not to seize the airport; airport remains under UN control';
   Q.cyprus_frontline_quality=Math.min(3,Math.max(1,number(Q.cyprus_frontline_quality))+1);Q.cyprus_atilla1_frontline=Q.cyprus_frontline_quality===3?'Superior Defensive Position':'Reinforced defensive corridor';
   Q.cyprus_atilla1_credibility='Restraint and UN protection strengthened diplomatic credibility; confrontation with UN forces avoided';
   Q.cyprus_roadmap_report=action==='monitor'?'UN monitoring and civilian protection are reinforced. Our soldiers improve their defenses without changing the frontline.':'Turkey presents its demand and evidence of ceasefire violations. The army reinforces the frozen line; no new advance is authorized.';
   Q.cyprus_roadmap_seen.push(id);advance(Q,end-Q.cyprus_day+1);return true;
  }
  if(id==='geneva2-12'){
   if(!['gunes','denktas'].includes(action))return false;Q.cyprus_selected_plan=action;Q.cyprus_roadmap_report='Turkey chooses the '+(action==='gunes'?'Güneş':'Denktaş')+' Plan. The delegation will seek a clear response before the conference deadline.';
  }else if(action!=='continue')return false;
  Q.cyprus_roadmap_seen.push(id);
  if(id==='geneva1'){freeze(Q,Math.min(28,Q.cyprus_day));Q.cyprus_early_freeze=Q.cyprus_ceasefire_days.length?1:0;if(Q.cyprus_ceasefire_days.length)Q.cyprus_un_support=Math.min(2,number(Q.cyprus_un_support)+1);advance(Q,30-Q.cyprus_day);finishI(Q);return true;}
  if(id==='geneva2-opening'){Q.cyprus_campaign_phase='geneva2';advance(Q,10-Q.cyprus_day);return true;}
  if(id==='geneva2-13')Q.cyprus_gunes_backing=Q.cyprus_selected_plan==='gunes'&&gunesEligible(Q)?1:0;
  if(id==='geneva2-14'){
   if(Q.cyprus_selected_plan==='gunes'&&Q.cyprus_gunes_backing){Q.cyprus_gunes_agreed=1;Q.cyprus_campaign_phase='implementation';Q.cyprus_implementation_pending=1;advance(Q);}
   else beginII(Q);return true;
  }
  if(id==='notification'){advance(Q,6);return true;}
  if(id==='canton'){Q.cyprus_northern_canton=1;advance(Q,9);return true;}
  if(id==='announcement'){Q.cyprus_gunes_announced=1;settle(Q,'Güneş Plan');return true;}
  advance(Q);return true;
 }
 function gunesEligible(Q){return active(Q)&&!Q.cyprus_campaign_failed&&!Q.cyprus_poppy_penalty&&number(Q.uk_attitude)>=0&&number(Q.us_attitude)>=1&&Q.cyprus_atilla1_ending==='Massive'&&Q.cyprus_frontline_quality>=3&&Q.cyprus_atilla1_junction&&Q.cyprus_airport_assured&&Q.cyprus_restraint_protection&&number(Q.cyprus_un_support)>=2&&!Q.cyprus_un_confrontation;}
 function diplomacyUnavailable(Q,country,action){
  if(!active(Q))return legacy.diplomacyUnavailable(Q,country,action);
  if(!Q.cyprus_mode||Q.cyprus_campaign_resolved||!Q.cyprus_atilla1_ending_seen||Q.cyprus_month!==8||Q.cyprus_day<1||Q.cyprus_day>=8||Q.cyprus_diplomatic_turns>=4)return 'Diplomatic outreach is available during the four turns of August 1–8.';
  if(country!=='uk'&&country!=='us')return 'Use this period to approach Britain or the United States.';
  if(action!=='improve')return 'Choose the federal proposal at the August 12 conference.';
  if(number(Q[country+'_attitude'])>=2)return 'This country is already Very Friendly.';
  if(number(Q.leverage_points)<1)return 'Requires one Leverage Point.';return '';
 }
 function diplomaticAction(Q,country,action){if(!active(Q))return legacy.diplomaticAction(Q,country,action);if(diplomacyUnavailable(Q,country,action))return false;Q.leverage_points--;shift(Q,country,1);Q.cyprus_diplomatic_turns++;Q.cyprus_campaign_last_text=names[country]+' becomes '+stances[Math.round(number(Q[country+'_attitude']))+2]+'. Two days pass while the delegation conducts its contacts.';advance(Q,2);return true;}
 function skip(Q){if(!active(Q)||!Q.cyprus_mode||pending(Q)||c.briefingScene(Q)||c.scene(Q)||c.historyScene(Q))return false;if(Q.cyprus_month===8&&Q.cyprus_day>=1&&Q.cyprus_day<8){Q.cyprus_diplomatic_turns++;advance(Q,2);}else advance(Q);return true;}
 function skipLabel(Q){return active(Q)&&Q.cyprus_month===8&&Q.cyprus_day>=1&&Q.cyprus_day<8?'Skip 2 Days':'Skip Day';}
 function beginII(Q){if(!active(Q))return legacy.beginII(Q);if(Q.cyprus_campaign_resolved||Q.cyprus_month!==8||Q.cyprus_day!==14)return false;Q.cyprus_campaign_phase='atilla2';Q.cyprus_frontline_frozen=0;Q.greece_attitude=-2;shift(Q,'uk',-1);shift(Q,'us',-1);Q.cyprus_atilla2_results=[];Q.cyprus_atilla2_score=0;Q.cyprus_support_bonus=0;return true;}
 function iiBrief(day){return ({14:'Atilla II begins. The reinforced army moves to establish the territorial position that negotiations failed to secure. The operation will succeed, though today’s command decision still affects its pace and cost.',15:'The offensive continues. Coastal and inland formations coordinate their movements while the commanders protect the supply routes behind them.',16:'The army advances towards a broad northern position. The task is now to connect and consolidate the gains of the second operation.',17:'The remaining objectives are approached. The General Staff directs the formations to secure their flanks and organize the territory already taken.',18:'The second operation reaches its conclusion. The army secures a territorial division broadly corresponding to the historical outcome. A federal settlement will now require renewed diplomacy after the minigame.'})[day];}
 function resolveII(Q,day,action,random){
  if(!active(Q))return legacy.resolveII(Q,day,action,random);
  var id='atilla2-'+day;if(Q.cyprus_campaign_phase!=='atilla2'||Q.cyprus_day!==day||Q.cyprus_month!==8||Q.cyprus_roadmap_seen.indexOf(id)>=0||!['historical','alternative'].includes(action))return false;
  // Reinforcements guarantee a successful second operation; support still improves its result.
  var raw=c.roll(c.militaryTier(Q),action==='historical'?1:2,random),base=Math.max(45,raw),bonus=number(Q.cyprus_support_bonus),score=Math.min(80,base+bonus),index=legacy.resultIndex(score);
  Q.cyprus_atilla2_results.push({day:day,action:action,rawRoll:raw,baseScore:base,supportBonus:bonus,score:score,outcome:c.outcomes[index]});Q.cyprus_atilla2_score+=score;Q.cyprus_support_bonus=0;Q.cyprus_roadmap_seen.push(id);Q.cyprus_roadmap_outcome=c.outcomes[index];Q.cyprus_roadmap_report=score>=70?'The formations reach their objectives with exceptional coordination. The territorial position is secured and supply routes remain open.':'The formations achieve their objectives. Resistance and supply demands slow parts of the advance, but the operation continues towards its guaranteed military result.';
  Q.cyprus_frontline_quality=Math.max(2,number(Q.cyprus_frontline_quality));Q.cyprus_atilla1_frontline='A broad northern military position';
  if(day===18){Q.cyprus_atilla2_complete=1;Q.cyprus_atilla2_ending_seen=1;Q.cyprus_atilla2_reward_paid=1;settle(Q,'Historical Division');}else advance(Q);return true;
 }
 function settle(Q,name){
  if(!active(Q))return legacy.settle(Q,name);if(Q.cyprus_campaign_resolved)return false;
  if(name==='Non-Intervention'&&(Q.CHP_in_government||Q.prime_minister_party==='CHP'))return false;
  if(name==='Güneş Plan'&&!Q.cyprus_gunes_agreed)return false;if(name==='Historical Division'&&!Q.cyprus_atilla2_complete)return false;
  if(!['Military Defeat','Non-Intervention','Güneş Plan','Historical Division'].includes(name))return false;
  Q.cyprus_final_result=name;Q.cyprus_campaign_resolved=1;Q.cyprus_end_shown=1;Q.cyprus_problem=name==='Historical Division'?3:name==='Güneş Plan'?4:1;Q.cyprus_best_ending=name==='Güneş Plan'&&!Q.cyprus_atilla2_complete?1:0;
  return true;
 }
 function laterRequirements(Q){
  if(Q.cyprus_campaign_version!==2||Q.cyprus_mode||Q.cyprus_problem!==3||!Q.cyprus_atilla2_complete)return 'Available after the second operation ends with a divided island.';
  // Match the existing relationship display, including fractional relation values.
  var highest=Q.cyprus_selected_plan==='denktas',threshold=highest?74.9:64.9;
  if(Q.foreign_minister_party!=='CHP')return 'CHP must control the Foreign Ministry.';
  return number(Q.us_relation)<=threshold||number(Q.west_relation)<=threshold?'Both United States and Western Europe relations must be '+(highest?'Very Friendly.':'Friendly.') : '';
 }
 function laterUnavailable(Q){return laterRequirements(Q)||(Q.cyprus_later_negotiations>=(Q.cyprus_selected_plan==='denktas'?6:4)?'The terms are ready; choose to implement the negotiated plan.':Q.cyprus_later_last_turn===Q.year+'-'+Q.month+'-'+Q.week?'A negotiation round has already been held this period.':'');}
 function laterCanImplement(Q){return !laterRequirements(Q)&&Q.cyprus_later_negotiations>=(Q.cyprus_selected_plan==='denktas'?6:4);}
 function implementLater(Q){if(!laterCanImplement(Q))return false;Q.cyprus_problem=4;Q.cyprus_final_result=Q.cyprus_selected_plan==='denktas'?'Denktaş Plan':'Güneş Plan';Q.cyprus_implementation_complete=1;Q.cyprus_implementation_pending=0;Q.cyprus_best_ending=0;Q.cyprus_roadmap_report='The '+Q.cyprus_final_result+' is accepted. The negotiated federal arrangements can now be implemented, replacing the military division with a political settlement.';return true;}
 function laterNegotiate(Q){
  if(laterUnavailable(Q))return false;Q.cyprus_later_negotiations++;Q.cyprus_later_last_turn=Q.year+'-'+Q.month+'-'+Q.week;var required=Q.cyprus_selected_plan==='denktas'?6:4;Q.cyprus_roadmap_report='Cyprus negotiations: '+Q.cyprus_later_negotiations+' / '+required+' rounds completed.';
  if(Q.cyprus_later_negotiations>=required)Q.cyprus_roadmap_report+=' The terms of the federal plan are ready. We can now choose to implement the agreement.';return true;
 }
 function implementationReady(Q){return Q.cyprus_campaign_version===2&&Q.cyprus_gunes_announced&&Q.cyprus_implementation_pending&&!Q.cyprus_mode&&!Q.cyprus_implementation_complete&&(Q.year>1974||(Q.year===1974&&Q.month>=11));}
 c.resolve=function(Q,d,a,rng){return active(Q)?resolveMilitary(Q,d,a,rng):previous.resolve(Q,d,a,rng);};
 c.resolveHistory=function(Q,id,a,rng){if(!active(Q))return previous.resolveHistory(Q,id,a,rng);var day=id==='july25'?25:id==='july26'?26:0;return day?resolveMilitary(Q,day,a,rng):false;};
 c.scene=function(Q){if(!active(Q))return previous.scene(Q);return availableMilitary(Q,Q.cyprus_day)&&Q.cyprus_day<=24?'cyprus_atilla1_'+Q.cyprus_day:null;};
 c.historyScene=function(Q){if(!active(Q))return previous.historyScene(Q);return availableMilitary(Q,Q.cyprus_day)&&Q.cyprus_day===25?'cyprus_history_july25':availableMilitary(Q,Q.cyprus_day)&&Q.cyprus_day===26?'cyprus_history_july26':null;};
 c.endingReady=function(Q){return active(Q)?endingReady(Q):previous.endingReady(Q);};c.awardEnding=awardEnding;c.continueEnding=continueEnding;
 c.advanceDate=function(Q){return active(Q)?advance(Q):previous.advanceDate(Q);};
 function endingMap(Q){
  if(!Q.cyprus_campaign_resolved)return '';
  var maps={'Güneş Plan':'gunes','Denktaş Plan':'denktas','Historical Division':'historical','Non-Intervention':'unitary','Military Defeat':'unitary','Return to the 1960 Constitutional Order':'unitary','Return to the 1962 Constitutional Order':'unitary'};
  return maps[Q.cyprus_final_result]?'cyprusgame/endings/'+maps[Q.cyprus_final_result]+'.png':'';
 }
 c.mapImage=function(Q){var finalMap=endingMap(Q);if(finalMap)return finalMap;return active(Q)&&Q.cyprus_frontline_frozen?previous.mapImage(Object.assign({},Q,{cyprus_campaign_version:0,cyprus_month:7,cyprus_day:Q.cyprus_frontline_map_day})):previous.mapImage(Q);};
 c.supportUnavailable=function(Q,id,side){if(!active(Q))return previous.supportUnavailable(Q,id,side);if(Q.cyprus_month===7&&Q.cyprus_day>28)return 'Atilla I has no further offensive rolls.';if(Q.cyprus_frontline_frozen||Q.cyprus_atilla1_complete&&Q.cyprus_campaign_phase!=='atilla2')return 'Offensive operations have ended; the frozen line cannot be expanded.';if(Q.cyprus_campaign_phase==='atilla2'){var a=c.supportActions[id];if(!a||a.side!==side)return 'Choose the matching side.';if(c.cooldown(Q,id))return 'This action is cooling down.';if(number(Q.cyprus_support_bonus)+a.bonus>10)return 'The next-roll bonus is capped at +10.';return number(Q.military_strength)<a.cost?'Not enough Military Resources.':'';}return previous.supportUnavailable(Q,id,side);};
 c.useSupport=function(Q,id,side){if(!active(Q))return previous.useSupport(Q,id,side);c.ensureSupport(Q);if(c.supportUnavailable(Q,id,side))return false;var a=c.supportActions[id];Q.military_strength-=a.cost;Q.cyprus_support_bonus+=a.bonus;Q.cyprus_support_spent+=a.cost;Q.cyprus_support_used[id]=Math.floor(Date.UTC(Q.cyprus_year,Q.cyprus_month-1,Q.cyprus_day)/86400000);if(Q.cyprus_month===7&&Q.cyprus_day<=25)Q.cyprus_support_early_counts[id]=number(Q.cyprus_support_early_counts[id])+1;return true;};
 c.choiceTooltip=function(id){if(id==='cyprus_roadmap_military.historical'||id==='cyprus_roadmap_event.offensive')return 'This is the historical choice. This operation would require our forces to be in an outdated state.';if(id==='cyprus_roadmap_military.alternative'||id==='cyprus_roadmap_event.supply')return 'This is an alternative choice. This operation would require our forces to be in an adequate state.';return previous.choiceTooltip(id);};
 var api=Object.assign({},legacy,{active:function(Q){return active(Q)||legacy.active(Q);},initialize:initialize,pending:pending,finishI:function(Q){return active(Q)?finishI(Q):legacy.finishI(Q);},federalEligible:function(Q){return active(Q)?gunesEligible(Q):legacy.federalEligible(Q);},canSettle:function(Q,p){return active(Q)?false:legacy.canSettle(Q,p);},diplomacyUnavailable:diplomacyUnavailable,diplomaticAction:diplomaticAction,beginII:beginII,resolveII:resolveII,settle:settle,opportunity:function(Q){return active(Q)?false:legacy.opportunity(Q);},countryName:function(k){return names[k];},attitudeName:function(Q,k){return stances[Math.round(number(Q[k+'_attitude']))+2];}});
 r.cyprusCampaign=api;
 r.cyprusRoadmap={endingMap:endingMap,active:active,pending:pending,availableMilitary:availableMilitary,prepareEvent:prepareEvent,eventIs:eventIs,ceasefireAvailable:ceasefireAvailable,ordinaryEvent:ordinaryEvent,resolveEvent:resolveEvent,resolveMilitary:resolveMilitary,gunesEligible:gunesEligible,skip:skip,skipLabel:skipLabel,laterUnavailable:laterUnavailable,laterNegotiate:laterNegotiate,laterCanImplement:laterCanImplement,implementLater:implementLater,implementationReady:implementationReady,
  militaryBrief:function(Q){Q.cyprus_roadmap_event_title=Q.cyprus_date_display+' — '+(Q.cyprus_day===27?'Fighting on the flanks':'The final advances');Q.cyprus_roadmap_event_text=(Q.cyprus_day===27?'The army still has permission to clear hostile positions around its flanks. Every further day of operations during Geneva I weakens foreign confidence, but the commanders argue that a better perimeter will strengthen Turkey’s position.':'Geneva I is approaching its conclusion. The army can make one last effort to improve the perimeter, or halt now and place its remaining demands in the hands of the delegation. Further military movement will damage relations again.');},
  exit:function(Q){legacy.exit(Q);},
  roadmapEvents:events};
})(typeof globalThis!=='undefined'?globalThis:this);
