// @ts-check
(function(root){
 'use strict';
 var rules=root.AnatolianRules,c=rules.cyprusAtilla1;
 /** @typedef {Record<string,any>} State */
 var old={resolve:c.resolve,resolveHistory:c.resolveHistory,initialize:c.initialize,endingReady:c.endingReady,scene:c.scene,historyScene:c.historyScene,awardEnding:c.awardEnding,continueEnding:c.continueEnding,mapImage:c.mapImage,useSupport:c.useSupport,supportUnavailable:c.supportUnavailable,advanceDate:c.advanceDate,choiceTooltip:c.choiceTooltip};
 var countries=['greece','uk','us'],names={greece:'Greece',uk:'United Kingdom',us:'United States'},attitudes=['Hostile','Suspicious','Neutral','Friendly','Very Friendly'];
 var meetings=['7-29','7-31','8-3','8-6','8-9','8-12','8-13'];
 function active(Q){return Q.cyprus_campaign_version===1;}
 function ordinal(Q){return Date.UTC(Q.cyprus_year,Q.cyprus_month-1,Q.cyprus_day)/86400000;}
 function key(Q){return Q.cyprus_month+'-'+Q.cyprus_day;}
 function attitude(Q,country){return Math.round(rules.clamp(rules.number(Q[country+'_attitude']),-2,2));}
 function shift(Q,country,amount){Q[country+'_attitude']=rules.clamp(attitude(Q,country)+amount,-2,2);}
 function resultIndex(score){return score<20?0:score<45?1:score<70?2:3;}
 function tier(Q){return c.resourceTier(Q);}
 function normalize(Q){
  if(!active(Q))return;
  if(!Array.isArray(Q.cyprus_campaign_meetings))Q.cyprus_campaign_meetings=[];
  if(!Array.isArray(Q.cyprus_atilla2_results))Q.cyprus_atilla2_results=[];
  if(!Q.cyprus_plan_votes||typeof Q.cyprus_plan_votes!=='object')Q.cyprus_plan_votes={denktas:{},gunes:{}};
  if(!Q.cyprus_diplomatic_used||typeof Q.cyprus_diplomatic_used!=='object')Q.cyprus_diplomatic_used={};
 }
 function initialize(Q){
  Object.assign(Q,{cyprus_campaign_failed:0,cyprus_campaign_resume:0,cyprus_best_ending:0,cyprus_campaign_version:1,cyprus_campaign_phase:'atilla1',cyprus_frontline_frozen:0,cyprus_frontline_map_day:0,cyprus_frontline_quality:0,cyprus_early_freeze:0,cyprus_atilla1_end_day:30,cyprus_support_spent:0,cyprus_score_snapshot:0,cyprus_operation_score:0,cyprus_readiness_score:0,cyprus_airport_assured:0,cyprus_un_confrontation:0,cyprus_un_support:0,cyprus_restraint_protection:0,cyprus_juntas_fallen:0,cyprus_diplomatic_opportunity_seen:0,cyprus_negotiation_progress:0,cyprus_plan_votes:{denktas:{},gunes:{}},cyprus_diplomatic_used:{},cyprus_campaign_meetings:[],cyprus_atilla2_results:[],cyprus_atilla2_score:0,cyprus_atilla2_complete:0,cyprus_atilla2_ending_seen:0,cyprus_atilla2_reward_paid:0,cyprus_final_result:'',cyprus_final_seen:0,cyprus_campaign_resolved:0,cyprus_campaign_report:'',cyprus_campaign_last_text:''});
  Q.greece_attitude=-2;
  var west=rules.number(Q.west_relation),us=rules.number(Q.us_relation);
  Q.uk_attitude=west>=75?2:west>=55?1:west>=40?0:west>=15?-1:-2;
  Q.us_attitude=us>=75?2:us>=55?1:us>=40?-1:-2;
  if(Q.hashas_done===1)shift(Q,'us',-2);
  if(!Q.CHP_in_government&&Q.prime_minister_party!=='CHP')settle(Q,'Non-Intervention');
 }
 function freeze(Q,day){Q.cyprus_frontline_frozen=1;Q.cyprus_frontline_map_day=day;}
 function enterDiplomacy(Q,day){
  Q.cyprus_early_freeze=1;Q.cyprus_atilla1_end_day=28;Q.cyprus_campaign_phase='diplomacy';freeze(Q,day);
 }
 function tick(Q){
  if(Q.cyprus_month===7&&Q.cyprus_day>=23&&!Q.cyprus_juntas_fallen){Q.cyprus_juntas_fallen=1;Q.greece_attitude=-1;}
 }
 function finishI(Q){
  if(Q.cyprus_score_snapshot)return;
  normalize(Q);Q.cyprus_operation_score=Q.cyprus_atilla1_results.reduce(function(total,r){return total+rules.number(r.score);},0);
  Q.cyprus_readiness_score=2*(rules.number(Q.cyprus_support_spent)+Math.max(0,rules.number(Q.military_strength)));
  Q.cyprus_atilla1_score=Math.min(720,Q.cyprus_operation_score+Q.cyprus_readiness_score);Q.cyprus_atilla1_max_score=720;
  var defeat=!Q.cyprus_atilla1_junction||Q.cyprus_operation_score<60;
  Q.cyprus_atilla1_ending=defeat?'Failure':Q.cyprus_atilla1_score>=540?'Massive':Q.cyprus_atilla1_score>=360?'Successful':'Failure';
  Q.cyprus_atilla1_reward=defeat?0:Q.cyprus_atilla1_ending==='Massive'?4:Q.cyprus_atilla1_ending==='Successful'?2:0;
  Q.cyprus_atilla1_complete=1;Q.cyprus_score_snapshot=1;Q.cyprus_campaign_failed=defeat?1:0;
 }
 function endingReady(Q){return !!(active(Q)&&!Q.cyprus_atilla1_ending_seen&&Q.cyprus_year===1974&&Q.cyprus_month===7&&Q.cyprus_day>=Q.cyprus_atilla1_end_day&&(Q.cyprus_early_freeze||Q.cyprus_atilla1_complete));}
 function federalEligible(Q){
  if(!active(Q)||Q.cyprus_campaign_resolved||!Q.cyprus_atilla1_ending_seen||Q.cyprus_un_confrontation)return false;
  var military=Q.cyprus_atilla2_complete?Q.cyprus_atilla2_score>=120&&Q.cyprus_frontline_quality>=2:Q.cyprus_early_freeze&&Q.cyprus_atilla1_ending==='Massive'&&Q.cyprus_frontline_quality>=3&&Q.cyprus_restraint_protection;
  return !!(military&&Q.cyprus_atilla1_junction&&Q.cyprus_airport_assured&&Q.cyprus_un_support>=1&&attitude(Q,'uk')>=1&&attitude(Q,'us')>=1&&attitude(Q,'greece')>=-1);
 }
 function canSettle(Q,plan){
  normalize(Q);if(!federalEligible(Q)||!['denktas','gunes'].includes(plan))return false;
  if(Q.cyprus_month===8&&Q.cyprus_day>(Q.cyprus_atilla2_complete?20:14))return false;
  if(Q.cyprus_negotiation_progress<(plan==='gunes'?3:2))return false;
  if(plan==='gunes'&&Q.cyprus_un_support<2)return false;
  return countries.every(function(country){return Q.cyprus_plan_votes[plan][country]===1;});
 }
 function meetingPending(Q){
  if(!active(Q)||Q.cyprus_campaign_resolved)return false;normalize(Q);
  if(Q.cyprus_early_freeze&&!Q.cyprus_atilla1_ending_seen&&Q.cyprus_month===7&&Q.cyprus_day>=24&&Q.cyprus_day<=27)return Q.cyprus_campaign_meetings.indexOf(key(Q))<0;
  if(!Q.cyprus_atilla1_ending_seen)return false;
  if(Q.cyprus_atilla2_complete)return Q.cyprus_month===8&&Q.cyprus_day>=17&&Q.cyprus_day<=19&&Q.cyprus_campaign_meetings.indexOf(key(Q))<0;
  if(Q.cyprus_campaign_phase==='atilla2')return false;
  return meetings.indexOf(key(Q))>=0&&Q.cyprus_campaign_meetings.indexOf(key(Q))<0;
 }
 function pending(Q){
  if(!active(Q)||!Q.cyprus_mode)return null;normalize(Q);
  if(Q.cyprus_campaign_resolved)return Q.cyprus_final_seen?null:'cyprus_campaign_final';
  if(endingReady(Q))return 'cyprus_atilla1_ending';
  if(Q.cyprus_atilla1_ending_seen&&federalEligible(Q)&&!Q.cyprus_diplomatic_opportunity_seen&&!Q.cyprus_atilla2_complete)return 'cyprus_diplomatic_opportunity';
  if(Q.cyprus_campaign_phase==='atilla2'&&!Q.cyprus_atilla2_complete&&Q.cyprus_month===8&&Q.cyprus_day>=14&&Q.cyprus_day<=16&&Q.cyprus_atilla2_results.length===Q.cyprus_day-14)return 'cyprus_atilla2_'+Q.cyprus_day;
  if(Q.cyprus_atilla2_complete&&!Q.cyprus_atilla2_ending_seen)return 'cyprus_atilla2_ending';
  if(Q.cyprus_month===8&&Q.cyprus_day>=14&&!Q.cyprus_atilla2_complete&&Q.cyprus_campaign_phase!=='atilla2')return 'cyprus_geneva_deadline';
  if(Q.cyprus_atilla2_complete&&Q.cyprus_month===8&&Q.cyprus_day>=20)return 'cyprus_geneva_deadline';
  if(meetingPending(Q))return 'cyprus_diplomatic_meeting';
  return null;
 }
 function awardEnding(Q){
  if(!active(Q))return old.awardEnding(Q);
  if(!endingReady(Q))return false;finishI(Q);if(Q.cyprus_atilla1_reward_paid)return false;
  Q.leverage_points=rules.number(Q.leverage_points)+Math.max(0,Q.cyprus_atilla1_reward-rules.number(Q.cyprus_atilla1_reward_paid_amount));
  Q.cyprus_atilla1_reward_paid_amount=Q.cyprus_atilla1_reward;Q.cyprus_atilla1_reward_paid=1;return true;
 }
 function continueEnding(Q){
  if(!active(Q))return old.continueEnding(Q);
  if(!Q.cyprus_atilla1_reward_paid||Q.cyprus_atilla1_ending_seen)return false;
  Q.cyprus_atilla1_ending_seen=1;Q.cyprus_campaign_phase='diplomacy';
  if(Q.cyprus_campaign_failed){settle(Q,'Military Defeat');return true;}
  if(!Q.cyprus_early_freeze&&Q.cyprus_history_advance_pending){Q.cyprus_history_advance_pending=0;c.advanceDate(Q);}
  return true;
 }
 function report(Q,day){
  if(!active(Q))return day>=20&&day<=24?c.days[day].briefing:'';
  var date=Q.cyprus_date_display;
  return date+' — '+(Q.cyprus_frontline_frozen?'Offensive movement remains halted. The line held after the last operation is unchanged; troops are preparing defenses and protecting supply routes.':'Forces remain authorized to consolidate and advance. Further movement must still be earned through the next operation.')+' Current frontlines: '+Q.cyprus_atilla1_frontline+'.';
 }
 function actionLabel(Q,id,action){
  var day=Number(id),event=c.days[day]||c.historyEvents[id];if(!event)return '';
  if(day===24)return event.actions[action].label;
  if(Q.cyprus_frontline_frozen)return action==='historical'?'Coordinate defenses and secure the existing supply routes.':'Maintain the halt and pursue UN-monitored protection and access.';
  return event.actions[action].label;
 }
 function resolve(Q,day,action,random){
  if(!active(Q))return old.resolve(Q,day,action,random);
  if(!Q.cyprus_mode||Q.cyprus_campaign_resolved||Q.cyprus_early_freeze||Q.cyprus_month!==7||Q.cyprus_day!==day||Q.cyprus_atilla1_complete||Q.cyprus_atilla1_results.length!==day-20||!c.days[day]||!c.days[day].actions[action])return false;
  c.ensureSupport(Q);tick(Q);var option=c.days[day].actions[action],bonus=Q.cyprus_support_bonus;
  var base=c.roll(c.militaryTier(Q),option.requirement,random),score=Math.min(80,base+bonus),index=resultIndex(score);
  // Adequate or stronger armies cannot receive the terminal July 21 failure.
  if(day===21&&c.militaryTier(Q)>=2&&score<20){score=20;index=1;}
  var text=option.text[index];
  Q.cyprus_support_bonus=0;
  if(day===21){Q.cyprus_atilla1_junction=index>0?1:0;Q.cyprus_frontline_quality=index;Q.cyprus_atilla1_frontline=['Contracted, separate positions','An exposed connected corridor','A secure connected corridor','A strong connected corridor'][index];}
  if(day===22){Q.cyprus_atilla1_halted=action==='alternative'?1:0;if(action==='historical'&&index>=2)Q.cyprus_atilla1_junction=1;
   Q.cyprus_atilla1_frontline=Q.cyprus_atilla1_junction?(index>=2?'A secure corridor with protected approaches':'An exposed connected corridor'):'Separate coastal and airborne positions';
   Q.cyprus_atilla1_credibility=action==='alternative'?'Offensive orders halted; ceasefire implementation remains contested':'Advance authorized until the ceasefire deadline';
  }
  if(day===23){
   if(index>=2){Q.cyprus_atilla1_junction=1;if(action==='historical')Q.cyprus_atilla1_enemy_damage=index===3?'Remaining resistance rapidly reduced':'Important hostile positions cleared';}
   if(index>0)Q.cyprus_atilla1_frontline=index>=2?'A secure corridor and improved defensive perimeter':'A narrow corridor with contested approaches';
   if((action==='alternative'||Q.cyprus_atilla1_halted)&&index>=2){Q.cyprus_restraint_protection=1;Q.cyprus_un_support=Math.min(2,Q.cyprus_un_support+1);shift(Q,'uk',1);shift(Q,'us',1);Q.cyprus_atilla1_credibility='Restraint and UN protection strengthened diplomatic credibility';}
   else if(!Q.cyprus_atilla1_halted&&action==='historical'){shift(Q,'uk',-1);Q.cyprus_atilla1_credibility='Continued consolidation drew ceasefire complaints';}
   if(action==='alternative'){
    enterDiplomacy(Q,23);
    Q.cyprus_atilla1_halted=1;
    Q.cyprus_frontline_quality=Q.cyprus_atilla1_junction?(index>=2&&Q.cyprus_atilla1_results[2].score>=45?3:index>=1?2:1):0;
    if(Q.cyprus_frontline_quality===3)Q.cyprus_atilla1_frontline='Superior Defensive Position';
    Q.cyprus_airport_assured=1;Q.cyprus_atilla1_access='No attempt to seize the airport; all offensive movement halted';
    if(index<2)Q.cyprus_atilla1_credibility='Offensive movement halted; UN protection remains limited';
   }
  }
  if(day===24){
   Q.cyprus_frontline_quality=Q.cyprus_atilla1_junction?(index>=2&&Q.cyprus_atilla1_results[3].score>=45?3:index>=1?2:1):0;
   Q.cyprus_airport_assured=index>=1?1:0;Q.cyprus_un_confrontation=0;
   Q.cyprus_atilla1_access=index>=2&&action==='alternative'?'UN-monitored access granted; airport remains under UN control':index>=1&&action!=='pressure'?'Turkey promises not to seize the airport; airport remains under UN control':'Airport access unresolved';
   if(action==='alternative'){
    enterDiplomacy(Q,24);Q.cyprus_airport_assured=1;
    if(index>=2){Q.cyprus_restraint_protection=1;Q.cyprus_un_support=2;shift(Q,'uk',1);shift(Q,'us',1);Q.cyprus_atilla1_credibility='Restraint and UN protection strengthened diplomatic credibility; confrontation with UN forces avoided';}
   }else{
    Q.greece_attitude=-2;shift(Q,'uk',action==='pressure'?-2:-1);shift(Q,'us',-1);Q.cyprus_restraint_protection=0;Q.cyprus_un_support=0;
    Q.cyprus_atilla1_credibility=action==='pressure'?'Expansion and pressure for airport control damaged diplomatic credibility':'Continued expansion despite the ceasefire damaged diplomatic credibility';
    text=option.text[index];
   }
   if(index===0)Q.cyprus_atilla1_frontline+='; exposed approaches withdrawn';else Q.cyprus_atilla1_frontline=Q.cyprus_frontline_quality===3?'Superior Defensive Position':'Secure Defensive Position';
  }
  Q.cyprus_atilla1_results.push({day:day,action:action,score:score,baseScore:base,supportBonus:bonus,tier:c.resourceTiers[tier(Q)].name,outcome:c.outcomes[index],text:text});
  Q.cyprus_atilla1_score+=score;Q.cyprus_atilla1_last_outcome=c.outcomes[index];Q.cyprus_atilla1_last_text=text;
  if(day===21&&index===0){finishI(Q);settle(Q,'Military Defeat');}
  c.advanceDate(Q);return true;
 }
 function resolveHistory(Q,id,action,random){
  if(!active(Q))return old.resolveHistory(Q,id,action,random);
  if(c.historyScene(Q)!=='cyprus_history_'+id||!c.historyEvents[id]||!c.historyEvents[id].actions[action])return false;
  c.ensureSupport(Q);var event=c.historyEvents[id],option=event.actions[action],bonus=Q.cyprus_support_bonus;
  var base=c.roll(c.militaryTier(Q),option.requirement,random),score=Math.min(80,base+bonus),index=resultIndex(score);
  var held=Q.cyprus_frontline_frozen;
  var text=held?['Defensive coordination fails and some exposed positions must be abandoned.','The existing line is maintained unevenly; supply problems remain.','Defenses and supply routes are secured without territorial expansion.','Exceptionally coordinated defenses preserve the held line and strengthen security without further expansion.'][index]:option.text[index];
  Q.cyprus_history_seen.push(id);Q.cyprus_support_bonus=0;
  var result={key:id,month:event.month,day:event.day,action:action,score:score,baseScore:base,supportBonus:bonus,tier:c.resourceTiers[tier(Q)].name,outcome:c.outcomes[index],text:text};
  Q.cyprus_history_last_outcome=result.outcome;Q.cyprus_history_last_text=text;
  if(event.stage==='atilla1'){
   Q.cyprus_atilla1_results.push(result);Q.cyprus_atilla1_score+=score;
   if(!held&&index>=2){Q.cyprus_atilla1_frontline+='; '+option.position;Q.cyprus_frontline_quality=Math.max(Q.cyprus_frontline_quality,index);}
   if(action==='alternative'&&['july25','july26','july2728'].includes(id)){freeze(Q,event.day);if(index>=2){Q.cyprus_un_support=Math.min(2,Q.cyprus_un_support+1);shift(Q,'uk',1);shift(Q,'us',1);}}
   if(id==='july25'&&action==='alternative'){enterDiplomacy(Q,25);Q.cyprus_atilla1_halted=1;if(index>=2){Q.cyprus_restraint_protection=1;Q.cyprus_atilla1_credibility='Restraint and UN protection strengthened diplomatic credibility';}}
   if(id==='july2930'){finishI(Q);Q.cyprus_history_advance_pending=1;}else c.advanceDate(Q);
  }else{Q.cyprus_post_atilla1_results.push(result);Q.cyprus_post_atilla1_score+=score;Q.cyprus_post_atilla1_count=Q.cyprus_post_atilla1_results.length;c.advanceDate(Q);}
  return true;
 }
 function meetingBrief(Q){return Q.cyprus_date_display+' — '+(Q.cyprus_atilla1_ending_seen?'The delegations assess guarantees, territorial arrangements and the positions of the three guarantor powers.':'The delegations work towards an earlier conclusion of Geneva I. Offensive movement remains frozen at the last military operation’s resulting line.')+' Greece: '+attitudes[attitude(Q,'greece')+2]+'. United Kingdom: '+attitudes[attitude(Q,'uk')+2]+'. United States: '+attitudes[attitude(Q,'us')+2]+'.';}
 function meetingAvailable(Q,action){if(action==='reject')return true;if(action==='guarantees')return attitude(Q,'greece')>=-1&&attitude(Q,'uk')>=0&&attitude(Q,'us')>=0;return action==='protection'&&attitude(Q,'uk')>=0;}
 function resolveMeeting(Q,action){
  if(!meetingPending(Q)||!meetingAvailable(Q,action))return false;
  Q.cyprus_campaign_meetings.push(key(Q));
  if(action==='reject'){shift(Q,'uk',-1);shift(Q,'us',-1);Q.cyprus_campaign_last_text='Ankara rejects further concessions. The delegations remain divided and foreign confidence weakens.';}
  else{Q.cyprus_negotiation_progress++;Q.leverage_points=rules.number(Q.leverage_points)+1;
   if(action==='protection'){Q.cyprus_un_support=Math.min(2,Q.cyprus_un_support+1);shift(Q,'uk',1);shift(Q,'us',1);}
   Q.cyprus_campaign_last_text=action==='protection'?'Monitoring and civilian protection arrangements strengthen cooperation with the UN. The territorial line remains unchanged.':'Security guarantees bring the delegations closer to an agreement. Turkey earns one diplomatic leverage point.';
  }
  // On the full route a dated field event may still follow on the same day.
  if(!c.historyScene(Q))c.advanceDate(Q);return true;
 }
 function diplomacyUnavailable(Q,country,action){
  if(!active(Q)||!countries.includes(country)||!Q.cyprus_mode||!Q.cyprus_atilla1_ending_seen||Q.cyprus_campaign_resolved||Q.cyprus_campaign_phase==='atilla2'&&!Q.cyprus_atilla2_complete)return 'Diplomatic actions are available after an operation ends.';
  normalize(Q);var cost=action==='gunes'?2:1;
  if(!['improve','denktas','gunes'].includes(action))return 'Unknown diplomatic action.';
  if(action==='improve'){
   if(attitude(Q,country)>=2)return 'This country is already Very Friendly.';
   var last=Q.cyprus_diplomatic_used[country];if(typeof last==='number'&&ordinal(Q)-last<3)return 'Further diplomatic outreach is available after three days.';
  }else{
   if(!federalEligible(Q))return 'The military, airport, restraint and country-attitude requirements are not met.';
   if(Q.cyprus_plan_votes[action][country])return 'This country already supports this plan.';
  }
  if(rules.number(Q.leverage_points)<cost)return 'Not enough diplomatic leverage.';
  return '';
 }
 function diplomaticAction(Q,country,action){
  if(diplomacyUnavailable(Q,country,action))return false;
  Q.leverage_points-=action==='gunes'?2:1;
  if(action==='improve'){shift(Q,country,1);Q.cyprus_diplomatic_used[country]=ordinal(Q);Q.cyprus_campaign_last_text=names[country]+' becomes '+attitudes[attitude(Q,country)+2]+'.';}
  else{Q.cyprus_plan_votes[action][country]=1;Q.cyprus_campaign_last_text=names[country]+' agrees to support the '+(action==='gunes'?'Güneş':'Denktaş')+' proposal, subject to the final conference agreement.';}
  return true;
 }
 function opportunity(Q){if(!federalEligible(Q)||Q.cyprus_diplomatic_opportunity_seen)return false;Q.cyprus_diplomatic_opportunity_seen=1;Q.leverage_points=rules.number(Q.leverage_points)+2;return true;}
 function beginII(Q){
  if(!active(Q)||Q.cyprus_campaign_resolved||!Q.cyprus_atilla1_ending_seen||Q.cyprus_atilla2_results.length||Q.cyprus_month!==8||Q.cyprus_day!==14)return false;
  Q.cyprus_campaign_phase='atilla2';Q.cyprus_frontline_frozen=0;Q.greece_attitude=-2;shift(Q,'uk',-1);shift(Q,'us',-1);Q.cyprus_un_support=0;Q.cyprus_plan_votes={denktas:{},gunes:{}};Q.cyprus_negotiation_progress=0;return true;
 }
 function resolveII(Q,day,action,random){
  if(Q.cyprus_campaign_phase!=='atilla2'||Q.cyprus_month!==8||Q.cyprus_day!==day||Q.cyprus_atilla2_results.length!==day-14||!['historical','alternative'].includes(action))return false;
  c.ensureSupport(Q);var bonus=Q.cyprus_support_bonus,base=c.roll(c.militaryTier(Q),action==='historical'?1:2,random),score=Math.min(80,base+bonus),index=resultIndex(score);
  var texts=action==='historical'?['The offensive stalls and exposes units to heavy losses.','The offensive makes limited gains, leaving important objectives unresolved.','The offensive secures its principal objectives and strengthens Turkey’s military position.','Coordinated advances secure a broad and defensible position, greatly strengthening Turkey’s bargaining power.']:['Reorganization fails to relieve exposed formations.','Supply and coordination improve unevenly, limiting operational progress.','Reinforcements and secure supply routes support a controlled advance.','Strong planning and supply coordination allow exceptional operational progress with more defensible positions.'];
  Q.cyprus_atilla2_results.push({day:day,action:action,score:score,baseScore:base,supportBonus:bonus,outcome:c.outcomes[index],text:texts[index]});Q.cyprus_atilla2_score+=score;Q.cyprus_support_bonus=0;Q.cyprus_campaign_last_text=texts[index];Q.cyprus_campaign_last_outcome=c.outcomes[index];
  if(index>=2)Q.cyprus_frontline_quality=Math.max(Q.cyprus_frontline_quality,index);
  if(day===16){Q.cyprus_atilla2_complete=1;Q.cyprus_atilla1_frontline=Q.cyprus_atilla2_score>=120?'A broad northern military position':'Uneven positions after the second operation';}
  else c.advanceDate(Q);return true;
 }
 function awardII(Q){if(!Q.cyprus_atilla2_complete||Q.cyprus_atilla2_reward_paid)return false;Q.cyprus_atilla2_reward_paid=1;Q.leverage_points=rules.number(Q.leverage_points)+(Q.cyprus_atilla2_score>=180?6:Q.cyprus_atilla2_score>=120?4:0);return true;}
 function continueII(Q){if(!Q.cyprus_atilla2_complete||Q.cyprus_atilla2_ending_seen)return false;Q.cyprus_atilla2_ending_seen=1;Q.cyprus_campaign_phase='diplomacy';if(Q.cyprus_atilla2_score<30){settle(Q,'Military Defeat');return true;}c.advanceDate(Q);return true;}
 function settle(Q,name){
  if(Q.cyprus_campaign_resolved)return false;
  if(name==='Non-Intervention'&&(Q.CHP_in_government||Q.prime_minister_party==='CHP'))return false;
  if(name==='Denktaş Plan'&&!canSettle(Q,'denktas')||name==='Güneş Plan'&&!canSettle(Q,'gunes')||name==='Historical Division'&&!Q.cyprus_atilla2_complete)return false;
  if(!['Non-Intervention','Military Defeat','Return to the 1960 Constitutional Order','Denktaş Plan','Güneş Plan','Historical Division'].includes(name))return false;
  Q.cyprus_final_result=name;Q.cyprus_campaign_resolved=1;Q.cyprus_end_shown=1;
  Q.cyprus_problem=name==='Historical Division'?3:['Denktaş Plan','Güneş Plan'].includes(name)?4:name==='Return to the 1960 Constitutional Order'?2:1;
  Q.cyprus_best_ending=name==='Güneş Plan'&&!Q.cyprus_atilla2_results.length&&Q.cyprus_un_support>=2?1:0;
  return true;
 }
 function exit(Q){Q.cyprus_final_seen=1;Q.cyprus_mode=0;Q.month_actions=0;Q.cyprus_calendar_advance=0;}
 // The legacy helper remains available for saves predating the complete campaign.
 c.resolve=resolve;c.resolveHistory=resolveHistory;
 c.endingReady=function(Q){return active(Q)?endingReady(Q):old.endingReady(Q);};
 c.scene=function(Q){if(!active(Q))return old.scene(Q);if(endingReady(Q))return 'cyprus_atilla1_ending';return !Q.cyprus_atilla1_complete&&!Q.cyprus_early_freeze&&Q.cyprus_month===7&&Q.cyprus_day>=20&&Q.cyprus_day<=24?'cyprus_atilla1_'+Q.cyprus_day:null;};
 c.historyScene=function(Q){return active(Q)&&(Q.cyprus_early_freeze||Q.cyprus_campaign_resolved||Q.cyprus_campaign_phase==='atilla2'||Q.cyprus_atilla2_complete)?null:old.historyScene(Q);};
 c.awardEnding=awardEnding;c.continueEnding=continueEnding;
 c.mapImage=function(Q){if(active(Q)&&Q.cyprus_frontline_frozen){var copy=Object.assign({},Q,{cyprus_month:7,cyprus_day:Q.cyprus_frontline_map_day});return old.mapImage(copy);}return old.mapImage(Q);};
 c.advanceDate=function(Q){old.advanceDate(Q);if(active(Q))tick(Q);};
 c.supportUnavailable=function(Q,id,side){
  if(!active(Q))return old.supportUnavailable(Q,id,side);
  if(Q.cyprus_campaign_resolved)return 'The Cyprus campaign has ended.';
  if(Q.cyprus_early_freeze&&Q.cyprus_campaign_phase!=='atilla2')return 'Military operations have ended on the frozen-frontline route. Support resumes only if Atilla II is authorized.';
  if(Q.cyprus_frontline_frozen&&['strike','bombard','blockade','land_skirmish'].includes(id))return 'Offensive support is unavailable while the territorial freeze is in force.';
  if(Q.cyprus_campaign_phase==='atilla2'&&Q.cyprus_month===8&&Q.cyprus_day>=14&&Q.cyprus_day<=16){
   var a=c.supportActions[id];if(!a)return 'Unknown action.';if(a.side!==side)return 'Select the appropriate side.';if(c.cooldown(Q,id))return 'This action is cooling down.';if(Q.cyprus_support_bonus+a.bonus>10)return 'The next-roll bonus is capped at +10.';if(Q.military_strength<a.cost)return 'Not enough Military Resources.';return '';
  }
  return old.supportUnavailable(Q,id,side);
 };
 c.useSupport=function(Q,id,side){
  if(!active(Q))return old.useSupport(Q,id,side);
  c.ensureSupport(Q);if(c.supportUnavailable(Q,id,side))return false;
  var before=Q.military_strength,accepted;
  if(Q.cyprus_campaign_phase==='atilla2'){var a=c.supportActions[id];Q.military_strength-=a.cost;Q.cyprus_support_bonus+=a.bonus;Q.cyprus_support_used[id]=c.calendarDay?c.calendarDay(Q):ordinal(Q);accepted=true;}
  else accepted=old.useSupport(Q,id,side);
  if(accepted)Q.cyprus_support_spent+=before-Q.military_strength;return accepted;
 };
 c.choiceTooltip=function(id){
  var match=/^cyprus_atilla1_(20|21|22|23|24)\.([a-z]+)$/.exec(id),event=match?c.days[Number(match[1])]:null;
  if(!match){match=/^cyprus_history_([a-z0-9]+)\.([a-z]+)$/.exec(id);if(match)event=c.historyEvents[match[1]];}
  var req=event&&match&&event.actions[match[2]]?event.actions[match[2]].requirement:null;
  if(req===null){match=/^cyprus_atilla2_(14|15|16)\.([a-z]+)$/.exec(id);if(match)req=match[2]==='historical'?1:2;}
  if(req===null)return old.choiceTooltip(id);
  var name=c.levels[req].toLowerCase();return (match[2]==='historical'?'This is the historical choice.':'This is an alternative choice.')+' This operation would require our forces to be in '+(/^[aeiou]/.test(name)?'an':'a')+' '+name+' state. This requirement uses average land, naval and aerial strength.';
 };
 rules.cyprusCampaign={active:active,initialize:initialize,pending:pending,report:report,actionLabel:actionLabel,resultIndex:resultIndex,finishI:finishI,federalEligible:federalEligible,canSettle:canSettle,meetingPending:meetingPending,meetingBrief:meetingBrief,meetingAvailable:meetingAvailable,resolveMeeting:resolveMeeting,diplomacyUnavailable:diplomacyUnavailable,diplomaticAction:diplomaticAction,opportunity:opportunity,beginII:beginII,resolveII:resolveII,awardII:awardII,continueII:continueII,settle:settle,exit:exit,countryName:function(k){return names[k];},attitudeName:function(Q,k){return attitudes[attitude(Q,k)+2];}};
})(typeof globalThis!=='undefined'?globalThis:this);
