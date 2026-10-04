// Atilla I decisions share one event per day; saved results retain the path taken.
// @ts-check
(function (/** @type {any} */ root) {
    'use strict';
    var rules = root.AnatolianRules;
    /** @typedef {Record<string, any>} State */
    var levels = ['Critical', 'Outdated', 'Adequate', 'Good', 'Excellent'];
    var outcomes = ['Failure', 'Mid', 'Successful', 'Massive'];
    /** @param {State} Q */
    function militaryTier(Q) {
        var average = (rules.number(Q.army_land_strength) + rules.number(Q.army_aerial_strength) + rules.number(Q.army_naval_strength)) / 3;
        // Use the same 0–1 branch strengths as military policy and the status panel.
        return average >= 0.8 ? 4 : average >= 0.6 ? 3 : average >= 0.4 ? 2 : average >= 0.2 ? 1 : 0;
    }
    /** @param {number} tier @param {number} requirement @param {()=>number} random */
    function roll(tier, requirement, random) {
        var minimum = tier >= requirement ? 50 : 0;
        var maximum = tier >= requirement ? 80 : 60;
        var draw = rules.clamp(random(), 0, 1 - Number.EPSILON);
        return Math.min(80, minimum + Math.floor(draw * (maximum - minimum + 1)) + Math.max(0, tier - requirement) * 5);
    }
    /** @param {number} score */
    function resultIndex(score) { return score < 20 ? 0 : score < 40 ? 1 : score < 60 ? 2 : 3; }
    /** @type {Record<number, {title:string,briefing:string,actions:Record<string,{label:string,requirement:number,text:string[]}>}>} */
    var days = {
        20: {title:'A foothold, not a front', briefing:'Troops have landed near Pentemili, Pınarbaşı and Gönyeli, but remain separated. Resistance and unloading difficulties threaten the beachhead.', actions:{
            historical:{label:'Historical: Advance toward a junction with the airborne forces.',requirement:1,text:[
                'The advance stalls before reaching the airborne forces. Casualties and congested landing approaches slow reinforcement, leaving a small, lightly equipped coastal force on the island.',
                'Troops gain some ground inland, but the junction remains incomplete. Reinforcements continue landing unevenly; enough arrive to sustain the foothold, though heavy support remains limited.',
                'The coastal force advances while holding the landing area. A substantial force and essential equipment come ashore, but unloading remains difficult and the airborne troops are still separated from the beachhead.',
                'The advance secures the beachhead’s immediate approaches and eases pressure on unloading. More troops, armour and supplies reach the island than expected, giving the next day’s operation a strong starting position. The full junction remains unfinished.']},
            alternative:{label:'Alternative: Secure the beachhead and unload heavier support first, prolonging the inland forces’ isolation.',requirement:3,text:[
                'The beachhead holds narrowly, but attempts to organize unloading achieve little. Only limited reinforcements and equipment come ashore, while the delay leaves inland troops under increasing pressure.',
                'The landing area becomes more orderly and additional supplies reach the coast. Some heavy equipment is unloaded, but slower progress limits the buildup and leaves the airborne forces facing another night without relief.',
                'The beachhead is secured and unloading proceeds steadily. Reinforcements, armour and supplies establish a well-supported coastal force, although the airborne troops remain isolated and must hold their positions until the advance resumes.',
                'Strong coordination secures the landing area and clears unloading bottlenecks. A large, well-equipped force assembles ashore with ample supplies for the next advance. The airborne troops remain isolated, but the coastal force is exceptionally well prepared to reach them.']}
        }},
        21: {title:'The second wave',briefing:'Overnight fighting has exposed the disconnected positions. Reinforcements await departure from Mersin as ceasefire pressure grows.',actions:{
            historical:{label:'Historical: Dispatch reinforcements and prioritize the junction.',requirement:1,text:[
                'Resistance and poor coordination stall the advance. Forward units withdraw from exposed ground, leaving the coastal and airborne positions separated. The frontline gains little and contracts in places.',
                'Turkish forces capture several approaches between the landing positions, but resistance prevents a continuous corridor. The frontline expands modestly, while isolated units remain vulnerable.',
                'Turkish forces make substantial progress toward joining the beachhead with the airborne positions. Key approaches are secured, but gaps and contested ground leave the junction unfinished.',
                'The advance establishes an early corridor between the coastal and airborne forces. Turkish troops secure its immediate approaches, creating a broader, connected frontline before ceasefire pressure brings further constraints.']},
            alternative:{label:'Alternative: Dispatch reinforcements to secure existing positions.',requirement:2,text:[
                'Reinforcements are drawn into defensive fighting before positions can be strengthened. Exposed outposts are abandoned, narrowing the frontline while the coastal and airborne forces remain separated.',
                'Reinforcements stabilize the existing positions and secure a few nearby approaches. The frontline expands slightly, but the gap between coastal and airborne forces remains unresolved.',
                'Reinforced units secure surrounding heights, villages and defensive approaches through limited advances. The frontline broadens into more defensible positions, although a continuous corridor remains incomplete.',
                'Well-coordinated local advances secure commanding ground and substantially enlarge the defended positions. The gap between coastal and airborne forces narrows, leaving a strong basis for completing the junction, but less territorial reach than an equally successful advance focused on linking them.']}
        }},
        22: {title:'Before the ceasefire',briefing:'',actions:{
            historical:{label:'Historical: Accept the ceasefire and pursue the junction—or secure its flanks if already established—before the deadline.',requirement:1,text:[
                'The advance stalls with losses and little additional ground secured.',
                'Turkish forces capture some approaches before the deadline.',
                'Turkish forces establish the junction before the deadline.',
                'Turkish forces complete the junction and secure additional ground protecting it.']},
            alternative:{label:'Alternative: Accept the ceasefire and halt offensive movement immediately.',requirement:2,text:[
                'The halt is poorly coordinated, leaving forward units exposed and forcing withdrawals from some positions. No further expansion occurs, and either the remaining gap or the existing corridor’s vulnerability worsens.',
                'Most units halt in place, but uneven coordination forces small local withdrawals. The frontline changes little.',
                'Units establish a coordinated defensive line across the ground already held. No further territory is gained, but existing positions are preserved.',
                'A disciplined halt preserves virtually all gains and allows rapid fortification and redistribution of support. No offensive expansion occurs, but Turkey retains its strongest available defensive line.']}
        }},
        23: {title:'A ceasefire without security',briefing:'The regime in Athens collapses: the Greek junta decides to hand power to Karamanlis, while Clerides replaces Sampson in Cyprus. Fighting continues despite the ceasefire, leaving insecure approaches and exposed communities. The political transition opens new diplomatic opportunities, but further Turkish advances risk damaging ceasefire credibility.',actions:{
            historical:{label:'Historical course: Continue consolidation while entering diplomatic talks.',requirement:1,text:[
                'Local operations become disorganized, causing losses and weakening Turkey’s bargaining position.',
                'Turkey gains limited military advantage while opening contacts with the new governments.',
                'Turkey enters diplomatic exchanges from a stronger position.',
                'Turkey gains substantial bargaining strength as opposing forces struggle to reorganize.']},
            alternative:{label:'Alternative: Halt offensive movement and seek UN protection for exposed communities.',requirement:2,text:[
                'Protection arrangements fail to materialize, while confused defensive orders allow opposing forces to exploit exposed positions. Turkey loses military advantage and receives little practical benefit from its restraint.',
                'The halt improves diplomatic contacts, but UN protection remains limited. Defensive engagements inflict some losses on opposing units, while exposed communities and insecure approaches remain unresolved.',
                'Turkey maintains the halt and repels attacks with crippling losses to the formations involved. UN cooperation brings protection to some exposed communities, strengthening Turkey’s diplomatic position without further territorial expansion.',
                'Well-coordinated defenses inflict severe losses on attacking formations while Turkish forces hold their ground. Effective UN protection arrangements reduce threats to exposed communities, giving Turkey a substantial military and diplomatic advantage as the new governments seek negotiations.']}
        }},
        24: {title:'The airport confrontation',briefing:'Karamanlis takes office in Greece as the ceasefire is being cemented. Where Turkish advances have reached Nicosia airport, troops face UN-held positions; elsewhere, Ankara presses its demands through diplomatic channels. Britain opposes any seizure, raising the risk of confrontation before Geneva.',actions:{
            historical:{label:'Historical: Promise not to seize the airport by force.',requirement:1,text:[
                'Orders reach forward units unevenly, provoking confrontations and diplomatic pressure. Turkey pulls back from exposed approaches to prevent further escalation, leaving a less favorable final frontline.',
                'The assurance prevents a major confrontation, but uncertainty over local boundaries leaves some positions difficult to supply or defend. Turkey retains most of its ground without resolving access.',
                'Clear orders prevent clashes with UN troops. Turkish forces retain their defensible positions outside the airport, establishing a stable final frontline while the airport remains under UN control.',
                'Close coordination with UN commanders settles disputed local boundaries and reduces the need for withdrawals. Turkey preserves its strongest defensible positions outside the airport and enters Geneva with improved ceasefire credibility. Airport access remains subject to separate agreement.']},
            alternative:{label:'Alternative: Negotiate UN-supervised arrangements for the approaches and access.',requirement:2,text:[
                'Talks break down over withdrawals and inspection rights. Turkish troops leave some exposed approaches under pressure, weakening the final frontline without obtaining access guarantees.',
                'Temporary arrangements reduce confrontation, but only limited liaison or humanitarian movement is agreed. Most positions remain intact, while broader access and disputed approaches remain unresolved.',
                'Negotiators secure monitored routes and clearly defined positions around the airport. Turkey accepts limited local adjustments while preserving its main frontline and obtaining agreed humanitarian and supply access.',
                'A workable agreement establishes monitored access, reciprocal local withdrawals and clear separation from UN positions. Turkey retains a strong final frontline with more reliable supply arrangements, though the airport remains under UN control.']},
            pressure:{label:'Alternative: Maintain the demand for control, risking escalation.',requirement:3,text:[
                'Pressure on the airport triggers a confrontation and a firm British response. Turkey abandons exposed forward positions to contain the crisis, entering Geneva with a weaker frontline and damaged credibility.',
                'The demand produces a tense standoff without concessions. Turkish forces hold most existing positions, but troops committed to the confrontation leave other sectors harder to defend. Airport control and access remain unresolved.',
                'Turkey sustains pressure without opening fire and obtains negotiations over disputed approaches. Limited reciprocal adjustments improve its final defensive line, but the demand for airport control remains unmet and diplomatic relations deteriorate.',
                'Strong positions and disciplined restraint persuade Britain and the UN to broker wider arrangements for the surrounding approaches and monitored access. Turkey secures a favorable final defensive line, but the airport stays under UN control and its threat of escalation carries a diplomatic cost.']}
        }}
    };
    /** @param {State} Q */
    function initialize(Q) {
        Q.cyprus_atilla1_results = [];
        Q.cyprus_atilla1_score = 0;
        Q.cyprus_atilla1_complete = 0;
        Q.cyprus_atilla1_ending_seen = 0;
        Q.cyprus_atilla1_ending = '';
        Q.cyprus_atilla1_reward = 0;
        Q.cyprus_atilla1_junction = 0;
        Q.cyprus_atilla1_halted = 0;
        Q.cyprus_atilla1_frontline = 'Separate coastal and airborne positions';
        Q.cyprus_atilla1_enemy_damage = 'No crippling losses confirmed';
        Q.cyprus_atilla1_access = 'No airport access agreement';
        Q.cyprus_atilla1_credibility = 'Ceasefire not yet established';
        Q.cyprus_atilla1_last_outcome = '';
        Q.cyprus_atilla1_last_text = '';
    }
    /** @param {State} Q */
    function scene(Q) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month !== 7) return null;
        if (Q.cyprus_day >= 20 && Q.cyprus_day <= 24 && !Q.cyprus_atilla1_complete) return 'cyprus_atilla1_' + Q.cyprus_day;
        if (Q.cyprus_day === 25 && Q.cyprus_atilla1_complete && !Q.cyprus_atilla1_ending_seen) return 'cyprus_atilla1_ending';
        return null;
    }
    /** @param {State} Q @param {number} day */
    function briefing(Q, day) {
        if (day === 22) return Q.cyprus_atilla1_junction ?
            'Coastal and airborne forces are connected, but the corridor’s flanks remain exposed. The afternoon ceasefire leaves little time to secure nearby heights and widen the narrow position.' :
            'Reinforcements are arriving, but coastal and airborne forces remain separated. The afternoon ceasefire leaves little time to establish a continuous corridor.';
        return days[day].briefing;
    }
    /** @param {State} Q @param {number} day @param {string} action @param {number} index */
    function narrative(Q, day, action, index) {
        var text = days[day].actions[action].text[index];
        if (day === 22 && action === 'historical') {
            if (Q.cyprus_atilla1_junction) return [
                text + ' The existing corridor retains exposed flanks as the ceasefire begins.',
                text + ' The existing corridor gains limited protection, but vulnerable stretches remain.',
                'Turkish forces secure key heights and approaches before the deadline, widening the existing corridor into a more defensible position.',
                'Turkish forces achieve a broader advance across the existing corridor’s flanks, entering the ceasefire with substantially stronger positions.'
            ][index];
            if (index === 0) text += ' The incomplete junction remains unresolved as the ceasefire begins.';
            if (index === 1) text += ' The incomplete junction draws closer to completion.';
        }
        if (day === 22 && action === 'alternative' && index > 0) text += Q.cyprus_atilla1_junction ?
            (index === 1 ? ' The existing corridor remains narrow.' : ' The established corridor is held securely.') :
            ' The junction remains incomplete and the airborne forces remain separated.';
        if (day === 23 && action === 'historical') text += Q.cyprus_atilla1_halted ? [
            ' Defensive engagements fail to disrupt opposing forces.',
            ' Defensive fighting disrupts some opposing units without crippling their ability to attack.',
            ' Concentrated defensive fire inflicts crippling losses on attacking formations, weakening their ability to threaten Turkish positions.',
            ' Failed attacks leave key opposing formations severely depleted, sharply reducing their ability to renew operations without changing the frontline.'
        ][index] : [
            ' Attempts to expand stall.',
            ' Troops secure a few additional positions. Ceasefire complaints constrain diplomatic gains.',
            ' Troops capture additional commanding ground, expanding the frontline despite protests over ceasefire violations.',
            ' Troops secure a broader defensive perimeter, though ceasefire violations provoke serious diplomatic pressure.'
        ][index];
        return text;
    }
    /** @param {State} Q */
    function advanceDate(Q) {
        var date = new Date(Date.UTC(Q.cyprus_year, Q.cyprus_month - 1, Q.cyprus_day + 1));
        Q.cyprus_year = date.getUTCFullYear(); Q.cyprus_month = date.getUTCMonth() + 1; Q.cyprus_day = date.getUTCDate();
        Q.cyprus_date_display = ['January','February','March','April','May','June','July','August','September','October','November','December'][Q.cyprus_month - 1] + ' ' + Q.cyprus_day + ', ' + Q.cyprus_year;
        Q.military_strength = rules.number(Q.military_strength) +
            (rules.number(Q.army_land_strength) + rules.number(Q.army_aerial_strength) + rules.number(Q.army_naval_strength)) / 3 * 10;
    }
    /** @param {State} Q */
    function finish(Q) {
        if (Q.cyprus_atilla1_complete || Q.cyprus_atilla1_results.length !== 5) return;
        Q.cyprus_atilla1_ending = Q.cyprus_atilla1_score >= 300 ? 'Massive' : Q.cyprus_atilla1_score >= 200 ? 'Successful' : 'Failure';
        Q.cyprus_atilla1_reward = Q.cyprus_atilla1_score >= 300 ? 4 : Q.cyprus_atilla1_score >= 200 ? 2 : 0;
        Q.leverage_points = rules.number(Q.leverage_points) + Q.cyprus_atilla1_reward;
        Q.cyprus_atilla1_complete = 1;
    }
    /** Resolve once, with the engine's seeded generator so saving preserves the result.
     * @param {State} Q @param {number} day @param {string} action @param {()=>number} random */
    function resolve(Q, day, action, random) {
        if (!Array.isArray(Q.cyprus_atilla1_results)) initialize(Q);
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month !== 7 || Q.cyprus_day !== day ||
            Q.cyprus_atilla1_complete || Q.cyprus_atilla1_results.length !== day - 20 || !days[day] || !days[day].actions[action]) return false;
        var tier = militaryTier(Q), requirement = days[day].actions[action].requirement;
        var score = roll(tier, requirement, random), index = resultIndex(score);
        var text = narrative(Q, day, action, index);
        Q.cyprus_atilla1_results.push({day:day,action:action,score:score,tier:levels[tier],outcome:outcomes[index],text:text});
        Q.cyprus_atilla1_score += score;
        Q.cyprus_atilla1_last_outcome = outcomes[index]; Q.cyprus_atilla1_last_text = text;
        if (day === 21) {
            Q.cyprus_atilla1_junction = action === 'historical' && index === 3 ? 1 : 0;
            Q.cyprus_atilla1_frontline = Q.cyprus_atilla1_junction ? 'An early connected corridor' :
                ['Contracted, separate positions','Modestly expanded, separate positions','Expanded, separate positions','Strong, separate defensive positions'][index];
        }
        if (day === 22) {
            Q.cyprus_atilla1_halted = action === 'alternative' ? 1 : 0;
            if (action === 'historical' && index >= 2) {
                Q.cyprus_atilla1_junction = 1;
                Q.cyprus_atilla1_frontline = index === 3 ? 'A broader corridor with secured flanks' : 'A connected, defensible corridor';
            } else if (index === 0) Q.cyprus_atilla1_frontline += '; exposed positions withdrawn';
            else if (action === 'alternative' && index >= 2) Q.cyprus_atilla1_frontline += '; defenses consolidated without further expansion';
            Q.cyprus_atilla1_credibility = action === 'alternative' ? 'Offensive movement halted immediately' : 'Advance continued until the ceasefire deadline';
        }
        if (day === 23) {
            var defensive = action === 'alternative' || Q.cyprus_atilla1_halted;
            if (defensive && index >= 2) Q.cyprus_atilla1_enemy_damage = index === 3 ? 'Key attacking formations severely depleted' : 'Attacking formations suffered crippling losses';
            if (!defensive && index > 0) {
                Q.cyprus_atilla1_frontline += index === 3 ? '; a broader defensive perimeter gained' : '; additional commanding ground gained';
                Q.cyprus_atilla1_credibility = 'Further advances drew ceasefire protests';
            }
            if (action === 'alternative' && index >= 2) Q.cyprus_atilla1_credibility = 'Restraint and UN protection strengthened diplomatic credibility';
        }
        if (day === 24) {
            if (index === 0) Q.cyprus_atilla1_frontline += '; exposed approaches abandoned during the airport crisis';
            if (action !== 'historical' && index >= 2) Q.cyprus_atilla1_access = action === 'alternative' || index === 3 ? 'UN-monitored access agreed; airport remains under UN control' : 'Negotiations opened; airport control and access unresolved';
            if (action === 'pressure') Q.cyprus_atilla1_credibility = 'Pressure over airport control damaged diplomatic relations';
            else if (index >= 2) Q.cyprus_atilla1_credibility += '; confrontation with UN troops avoided';
        }
        advanceDate(Q);
        finish(Q);
        return true;
    }
    rules.cyprusAtilla1 = {days:days,levels:levels,outcomes:outcomes,militaryTier:militaryTier,roll:roll,
        resultIndex:resultIndex,initialize:initialize,scene:scene,briefing:briefing,resolve:resolve,advanceDate:advanceDate};
    if (typeof module !== 'undefined' && module.exports) module.exports = rules.cyprusAtilla1;
}(typeof globalThis !== 'undefined' ? globalThis : window));
