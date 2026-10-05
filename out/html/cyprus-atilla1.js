// Atilla I decisions share one event per day; saved results retain the path taken.
// @ts-check
(function (/** @type {any} */ root) {
    'use strict';
    var rules = root.AnatolianRules;
    /** @typedef {Record<string, any>} State */
    var levels = ['Critical', 'Outdated', 'Adequate', 'Good', 'Excellent'];
    var outcomes = ['Failure', 'Mid', 'Successful', 'Massive'];
    /** @type {Record<string,{month:number,day:number,title:string,text:string,stage:string,actions:Record<string,{label:string,requirement:number,text:string[],position:string}>}>} */
    var historyEvents = {
    "july25": {
        "month": 7,
        "day": 25,
        "title": "25 July 1974 — Geneva opens amid continued fighting",
        "text": "Geneva I opens with Turkey, Greece and Britain negotiating the ceasefire and the island's future. The airport remains under UN control, with Turkish troops to its north and National Guard troops to its south.\n\nThe latest UN account describes gains made during 24 July around northern Lefkoşa, including the Omorphita and Trakhonas areas, Hermes Street and positions near the British High Commission. These are local changes within the city, not the capture of British military bases. West of Lefkoşa, troops have reached the vicinity of Alayköy/Gerolakkos; this report does not yet establish occupation of the village.",
        "actions": {
            "historical": {
                "label": "Continue consolidating positions while opening the Geneva talks.",
                "requirement": 1,
                "text": [
                    "Local operations become disorganized and bring little improvement to the line. Ceasefire complaints overshadow the opening negotiations.",
                    "Some exposed positions are strengthened, but coordination remains uneven. Turkey enters the talks with unresolved military vulnerabilities.",
                    "Local consolidation improves the northern Lefkoşa positions while Turkey begins negotiations. Continued movement draws complaints about the ceasefire.",
                    "Effective coordination secures more defensible local positions and dependable supply routes. Turkey opens the talks from a stronger position, although expansion increases diplomatic pressure."
                ],
                "position": "local positions consolidated during the opening Geneva talks"
            },
            "alternative": {
                "label": "Freeze offensive movement and seek UN-monitored protection and supply arrangements.",
                "requirement": 2,
                "text": [
                    "Protection arrangements fail to materialize. Exposed positions remain vulnerable, and restraint brings little practical improvement.",
                    "The halt is mostly observed and limited liaison is established. Some positions remain difficult to supply.",
                    "Existing positions are held securely while monitored liaison and supply arrangements reduce immediate risks. The line is not expanded.",
                    "Disciplined restraint preserves existing gains and effective coordination substantially improves supply and protection arrangements without offensive expansion."
                ],
                "position": "positions held without offensive expansion; UN liaison pursued"
            }
        },
        "stage": "atilla1"
    },
    "july26": {
        "month": 7,
        "day": 26,
        "title": "26 July 1974 — The enclave expands",
        "text": "Reports covering the evening of 25 July and the morning of 26 July confirm Alayköy/Gerolakkos under Turkish occupation. Most of the remaining salient in the Trakhonas–Omorphita area of northern Lefkoşa has also been occupied.\n\nTanks and troops move south along the Girne road and then east towards Değirmenlik/Kythrea. Other troops reach the vicinity of Çamlıbel/Myrtou, while parts of the road towards Alayköy come under Turkish control. These movements do not establish the capture of Çamlıbel or Değirmenlik. The ceasefire holds more steadily elsewhere on the island.",
        "actions": {
            "historical": {
                "label": "Secure Alayköy and improve the western and eastern approaches to the enclave.",
                "requirement": 1,
                "text": [
                    "The attacks stall with losses. Forward positions remain exposed and the intended western gains are not secured.",
                    "Troops gain some approaches, but resistance prevents a secure western extension. Movements towards Çamlıbel and Değirmenlik do not establish either town’s capture.",
                    "Alayköy is secured and the approaches to the enclave improve. Troops reach towards Çamlıbel and move eastwards, without capturing Çamlıbel or Değirmenlik.",
                    "A well-coordinated advance secures Alayköy and additional defensible approaches. The enclave is stronger, but pressure from ceasefire violations rises; Çamlıbel and Değirmenlik remain outside confirmed control."
                ],
                "position": "western approaches strengthened; advances distinguished from town captures"
            },
            "alternative": {
                "label": "Concentrate reinforcements on a coherent defensive perimeter rather than extending the advance.",
                "requirement": 2,
                "text": [
                    "Poorly coordinated deployments leave gaps and force withdrawals from exposed ground.",
                    "Reinforcements stabilize most positions, but some routes and flanks remain insecure.",
                    "A connected defensive perimeter and improved supply routes protect the ground already held. No additional town is taken.",
                    "Careful deployment and rapid fortification greatly reduce the threat to the existing line without a new territorial offensive."
                ],
                "position": "defensive perimeter reinforced without additional town captures"
            }
        },
        "stage": "atilla1"
    },
    "july2728": {
        "month": 7,
        "day": 28,
        "title": "27–28 July 1974 — Fighting on the flanks",
        "text": "Turkish positions are consolidated around Photta, while Ayios Ermolaos/Şirinevler is reported Turkish-held. Buffavento Castle has also been occupied. The reports confirm these positions by 28 July without identifying an exact capture time for each.\n\nHeavy fighting begins around Koutsoventis on the evening of 27 July, but the village remains in National Guard hands on the afternoon of 28 July. Fighting then develops along the coast near Ayios Epiktitos/Çatalköy. Alsancak/Karavas, Lapta/Lapithos and Çamlıbel/Myrtou remain outside Turkish control in this account.",
        "actions": {
            "historical": {
                "label": "Consolidate the western positions and press the mountain and coastal approaches.",
                "requirement": 1,
                "text": [
                    "Attacks against strong positions fail. Losses and scattered deployments weaken the flanks without securing the intended objectives.",
                    "Western positions are steadied, but the eastern attacks make limited progress. The contested villages remain unresolved.",
                    "Western positions are consolidated and control of Buffavento improves the mountain flank. Koutsoventis remains contested or outside control, and coastal fighting continues near Çatalköy.",
                    "Troops secure commanding mountain positions and stronger approaches on both flanks. Local military advantage grows, but the operation does not establish the capture of Alsancak, Lapta or Çamlıbel."
                ],
                "position": "mountain positions and western approaches consolidated"
            },
            "alternative": {
                "label": "Stop new assaults and fortify the positions already held while seeking local ceasefire arrangements.",
                "requirement": 2,
                "text": [
                    "Coordination fails and exposed units must fall back. Attempts at a local ceasefire achieve little.",
                    "Most positions hold, but fortification is incomplete and occasional clashes continue.",
                    "Existing positions are fortified and local arrangements reduce fighting. The line is preserved without fresh village assaults.",
                    "Strong defensive preparation and effective liaison protect the existing line and substantially reduce local clashes. No new offensive expansion is attempted."
                ],
                "position": "existing flanks fortified; new assaults halted"
            }
        },
        "stage": "atilla1"
    },
    "july2930": {
        "month": 7,
        "day": 30,
        "title": "29–30 July 1974 — Geneva I concludes",
        "text": "Fighting continues near Ayios Epiktitos/Çatalköy on 29 July. On 30 July, the UN reports only sporadic shooting around the edges of the main enclave; it does not identify a substantial new advance for that day.\n\nGeneva I concludes with a declaration requiring the areas controlled by opposing armed forces not to be extended. The ministers agree on a UN-supervised security zone around the Turkish-held area and the evacuation of Greek or Greek Cypriot forces from Turkish Cypriot enclaves, which are to receive UN protection. The declaration records the existence in practice of two autonomous administrations, while leaving the wider constitutional settlement for further negotiations.",
        "actions": {
            "historical": {
                "label": "Conclude Geneva I and accept the declaration against further territorial expansion.",
                "requirement": 1,
                "text": [
                    "Confused orders and continued local clashes undermine implementation. Turkey closes Geneva I with a vulnerable line and little confidence in the ceasefire arrangements.",
                    "The declaration is accepted, but disputed positions and supply difficulties remain. The military line is only partly stabilized.",
                    "Turkey accepts the declaration and organizes its existing positions around the agreed ceasefire framework. Geneva I concludes without a general new advance.",
                    "Clear orders and strong military liaison stabilize the existing line and support practical security arrangements. Turkey closes Geneva I with an unusually coherent military position."
                ],
                "position": "Geneva I ceasefire framework accepted"
            },
            "alternative": {
                "label": "Prioritize joint verification of local positions and reciprocal adjustments under UN supervision.",
                "requirement": 2,
                "text": [
                    "Verification fails over access and disputed positions. Some exposed ground is abandoned without workable reciprocal arrangements.",
                    "Limited verification reduces uncertainty, but several local boundaries remain disputed.",
                    "Joint verification clarifies key positions and reciprocal local adjustments improve the defensibility of the line without a general advance.",
                    "Effective verification and well-managed local adjustments produce clear boundaries, more reliable supply and strong ceasefire credibility."
                ],
                "position": "local positions verified and reciprocal adjustments pursued"
            }
        },
        "stage": "atilla1"
    },
    "july31": {
        "month": 7,
        "day": 31,
        "title": "31 July 1974 — Local advances after Geneva",
        "text": "Renewed fighting west of Girne is followed by the National Guard's withdrawal from Alsancak/Karavas and Lapta/Lapithos. Withdrawal does not by itself establish that Turkish troops have occupied both towns completely.\n\nTurkish forces advance approximately one kilometre west from Ayios Ermolaos/Şirinevler, and approximately five hundred metres south near the Lefkoşa racecourse. These are local adjustments to the frontline, rather than a general breakout across northern Cyprus.",
        "actions": {
            "historical": {
                "label": "Continue limited advances around Şirinevler and the western Lefkoşa approaches.",
                "requirement": 1,
                "text": [
                    "Local attacks fail and force withdrawals from exposed positions. The new ceasefire framework is damaged without useful gains.",
                    "Small gains are made, but resistance prevents the intended local improvements and diplomatic complaints grow.",
                    "Troops improve their positions with limited movement west of Şirinevler and south near the Lefkoşa racecourse. Withdrawal from Alsancak and Lapta is not treated as proof of their complete capture.",
                    "Well-coordinated local advances secure better defensive approaches on the western flank. The gains remain limited and provoke serious concerns about compliance with Geneva."
                ],
                "position": "limited western advances after Geneva"
            },
            "alternative": {
                "label": "Hold the Geneva positions and request UN verification of opposing withdrawals.",
                "requirement": 2,
                "text": [
                    "Verification fails and unclear orders leave exposed units vulnerable. Some positions are lost.",
                    "Most troops hold their ground, but verification and resupply remain incomplete.",
                    "The existing line holds and liaison clarifies important withdrawals. No offensive territorial extension occurs.",
                    "Clear defensive orders and effective verification preserve the line, reduce uncertainty and strengthen Turkey’s ceasefire credibility."
                ],
                "position": "Geneva positions held; opposing withdrawals checked"
            }
        },
        "stage": "post"
    },
    "august1": {
        "month": 8,
        "day": 1,
        "title": "1 August 1974 — Into southern Alsancak",
        "text": "Turkish troops enter the southern part of Alsancak/Karavas, but remain outside Lapta/Lapithos. Firing and shelling continue to the west and southwest of Girne.\n\nIn the evening, Turkish forces enter Bellapais. This is the entry recorded in the UN's account of 1 August; earlier reports had already described Greek Cypriots there under UN protection. The airport in Lefkoşa remains outside Turkish control.",
        "actions": {
            "historical": {
                "label": "Secure southern Alsancak and consolidate the Bellapais approaches.",
                "requirement": 1,
                "text": [
                    "The movement stalls under resistance. Units fail to secure the intended approaches and suffer losses.",
                    "Troops establish some forward positions, but southern Alsancak and the Bellapais approaches remain incompletely secured.",
                    "Southern Alsancak and the Bellapais approaches are secured. The operation does not establish control of Lapta as a whole.",
                    "Strong coordination secures the intended approaches and makes the local defensive line more coherent. Further movement still carries a ceasefire cost."
                ],
                "position": "southern Alsancak and Bellapais approaches strengthened"
            },
            "alternative": {
                "label": "Maintain the existing line and pursue monitored access instead of new entry into disputed areas.",
                "requirement": 2,
                "text": [
                    "Access talks fail and confused deployments expose units to attack. The intended defensive improvement does not occur.",
                    "Limited liaison is achieved, while some supply routes remain vulnerable.",
                    "Monitored access and careful deployment strengthen the positions already held without a new offensive entry.",
                    "Effective agreements and disciplined deployment improve supply, civilian access and military security while preserving the existing territorial line."
                ],
                "position": "existing positions supplied through monitored arrangements"
            }
        },
        "stage": "post"
    },
    "august213": {
        "month": 8,
        "day": 13,
        "title": "2–13 August 1974 — The uneasy ceasefire",
        "text": "The ceasefire has reduced fighting across much of the island, but has not frozen every local position. In the Alsancak–Lapta area, Turkish troops move their forward line approximately three hundred metres west on 4 August. A larger assault follows on 6 August, with Turkish troops entering Lapta and fighting continuing around both towns into 7 August.\n\nAlong the Lefkoşa Green Line, Turkish Cypriot fighters move into houses beyond the line and erect roadblocks on 7 August. Later exchanges of fire occur around the Kythrea forest, the northeastern edge of the enclave and the Lefkoşa–Larnaca district boundary. These incidents do not establish the capture of Değirmenlik/Kythrea.\n\nOn 11–12 August, the National Guard withdraws from several Turkish Cypriot villages and town sectors in the south and west. UNFICYP assumes their protection; these withdrawals are not advances by the Turkish Army. Apart from the Alsancak–Lapta operation and small movements within Lefkoşa, the UN's retrospective account records no broad new expansion before 14 August. Negotiations continue while the island remains divided by an uneasy ceasefire.",
        "actions": {
            "historical": {
                "label": "Prepare the reinforced army for renewed operations if Geneva fails.",
                "requirement": 1,
                "text": [
                    "Preparations expose serious coordination and supply weaknesses. The army enters the next phase poorly organized.",
                    "Reinforcements improve readiness, but uneven supply and coordination leave important weaknesses.",
                    "Troops and equipment are organized for the next phase, with working supply routes and coordinated deployment. Earlier local gains remain distinct from a general advance.",
                    "Thorough preparation produces a well-supplied and coordinated force, ready to respond quickly if negotiations fail. This result does not itself begin a new offensive."
                ],
                "position": "reinforced force prepared for the next phase"
            },
            "alternative": {
                "label": "Prioritize defensive readiness and give negotiations more time under a strict territorial freeze.",
                "requirement": 2,
                "text": [
                    "Defensive preparation and liaison both fall short. Vulnerable positions remain and the additional diplomatic time produces little security.",
                    "Defences improve in places, but supply and monitoring arrangements remain incomplete.",
                    "A disciplined territorial freeze and reinforced defences protect existing positions while negotiations continue.",
                    "Strong defensive preparation and effective monitoring reduce immediate military risks, preserving the existing line and giving negotiations a more stable setting."
                ],
                "position": "defensive readiness improved; territorial freeze maintained"
            }
        },
        "stage": "post"
    }
};
    var districts = ['nicosia','famagusta','paphos','limassol','larnaca','kyrenia'];
    /** @type {Record<string,{branch:string,label:string,cost:number,bonus:number}>} */
    var supportActions = {
        reinforce: {branch:'land',label:'Reinforce troops',cost:4,bonus:2},
        smuggle: {branch:'land',label:'Deliver weapons and supplies to TMT',cost:7,bonus:3},
        strike: {branch:'air',label:'Provide close air support',cost:4,bonus:2},
        paratrooper: {branch:'air',label:'Deploy airborne reinforcements',cost:7,bonus:3},
        bombard: {branch:'naval',label:'Provide naval fire support',cost:4,bonus:2},
        blockade: {branch:'naval',label:'Interdict opposing supply routes',cost:7,bonus:3}
    };
    /** @param {State} Q */
    function averageStrength(Q) {
        return (rules.clamp(rules.number(Q.army_land_strength),0,1) +
            rules.clamp(rules.number(Q.army_naval_strength),0,1) +
            rules.clamp(rules.number(Q.army_aerial_strength),0,1)) / 3;
    }
    /** @param {State} Q */
    function startingResources(Q) { return 12 + Math.round(28 * averageStrength(Q)); }
    /** @param {State} Q */
    function dailyResources(Q) { return Math.round(4 * averageStrength(Q)); }
    /** @param {State} Q */
    function initializeSupport(Q) {
        Q.military_strength = startingResources(Q);
        Q.cyprus_support_bonus = 0;
        Q.cyprus_support_used = {};
        Q.cyprus_resources_initialized = 1;
    }
    /** Preserve resources in legacy saves; missing new fields start safely.
     * @param {State} Q */
    function ensureSupport(Q) {
        if (!Q.cyprus_resources_initialized) {
            Q.military_strength = typeof Q.military_strength === 'number' && Number.isFinite(Q.military_strength) ?
                Math.max(0,Math.round(Q.military_strength)) : startingResources(Q);
            Q.cyprus_resources_initialized = 1;
        }
        if (!Q.cyprus_support_used || typeof Q.cyprus_support_used !== 'object' || Array.isArray(Q.cyprus_support_used)) Q.cyprus_support_used = {};
        Q.cyprus_support_bonus = rules.clamp(rules.number(Q.cyprus_support_bonus),0,6);
    }
    /** @param {State} Q */
    function replenishResources(Q) {
        ensureSupport(Q);
        Q.military_strength = rules.number(Q.military_strength) + dailyResources(Q);
    }
    /** @param {State} Q */
    function calendarDay(Q) { return Math.floor(Date.UTC(Q.cyprus_year,Q.cyprus_month - 1,Q.cyprus_day) / 86400000); }
    /** @param {State} Q @param {string} key */
    function cooldown(Q,key) {
        var last = Q.cyprus_support_used && Q.cyprus_support_used[key];
        return typeof last === 'number' ? Math.max(0,3 - (calendarDay(Q) - last)) : 0;
    }
    /** @param {State} Q @param {string} key @param {string} district */
    function supportUnavailable(Q,key,district) {
        if (!Object.prototype.hasOwnProperty.call(supportActions,key)) return 'Unknown support action.';
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month < 7 || Q.cyprus_month > 8 || (Q.cyprus_month === 7 && Q.cyprus_day < 15) || (Q.cyprus_month === 8 && Q.cyprus_day > 13)) return 'No upcoming operation roll.';
        if (districts.indexOf(district) < 0) return 'Select one of the six Cyprus districts.';
        var wait = cooldown(Q,key);
        if (wait) return 'Available in ' + wait + (wait === 1 ? ' day.' : ' days.');
        var action = supportActions[key];
        if (rules.number(Q.cyprus_support_bonus) + action.bonus > 6) return 'The next-roll bonus is capped at +6.';
        if (rules.number(Q.military_strength) < action.cost) return 'Not enough Military Resources.';
        return '';
    }
    /** @param {State} Q @param {string} key @param {string} district */
    function useSupport(Q,key,district) {
        ensureSupport(Q);
        if (supportUnavailable(Q,key,district)) return false;
        var action = supportActions[key];
        Q.military_strength -= action.cost;
        Q.cyprus_support_bonus += action.bonus;
        Q.cyprus_support_used[key] = calendarDay(Q);
        return true;
    }
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
        Q.cyprus_extended_version = 2;
        Q.cyprus_history_seen = [];
        Q.cyprus_history_advance_pending = 0;
        Q.cyprus_history_last_outcome = '';
        Q.cyprus_history_last_text = '';
        Q.cyprus_post_atilla1_results = [];
        Q.cyprus_post_atilla1_score = 0;
        Q.cyprus_post_atilla1_count = 0;
        Q.cyprus_post_atilla1_max_score = 240;
        Q.cyprus_atilla1_max_score = 720;
        Q.cyprus_atilla1_reward_paid = 0;
        Q.cyprus_atilla1_reward_paid_amount = 0;
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
    function briefingScene(Q) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month !== 7 ||
            Q.cyprus_day < 15 || Q.cyprus_day > 20) return null;
        var seen = Array.isArray(Q.cyprus_briefings_seen) ? Q.cyprus_briefings_seen : [];
        return seen.indexOf(Q.cyprus_day) < 0 ? 'cyprus_briefing_' + Q.cyprus_day : null;
    }
    /** @param {State} Q */
    function endingReady(Q) {
        return !!(Q.cyprus_mode && Q.cyprus_year === 1974 && Q.cyprus_atilla1_complete &&
            !Q.cyprus_atilla1_ending_seen && (Q.cyprus_month > 7 || (Q.cyprus_month === 7 && Q.cyprus_day >= 30)));
    }
    /** @param {State} Q */
    function scene(Q) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974) return null;
        if (Q.cyprus_month === 7 && Q.cyprus_day >= 20 && Q.cyprus_day <= 24 && !Q.cyprus_atilla1_complete) return 'cyprus_atilla1_' + Q.cyprus_day;
        return endingReady(Q) ? 'cyprus_atilla1_ending' : null;
    }
    /** @param {State} Q */
    function historyScene(Q) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974) return null;
        var seen = Array.isArray(Q.cyprus_history_seen) ? Q.cyprus_history_seen : [];
        var key = Object.keys(historyEvents).find(function(id) {
            var event = historyEvents[id];
            return event.month === Q.cyprus_month && event.day === Q.cyprus_day && seen.indexOf(id) < 0;
        });
        return key ? 'cyprus_history_' + key : null;
    }
    /** Upgrade active older campaigns without reclaiming previously granted leverage.
     * @param {State} Q */
    function ensureExtended(Q) {
        if (!Array.isArray(Q.cyprus_atilla1_results)) initialize(Q);
        if (Q.cyprus_extended_version !== 2) {
            Q.cyprus_atilla1_reward_paid_amount = Q.cyprus_atilla1_complete ? rules.number(Q.cyprus_atilla1_reward) : 0;
            Q.cyprus_atilla1_reward_paid = Q.cyprus_atilla1_complete ? 1 : 0;
            Q.cyprus_extended_version = 2;
            if (Q.cyprus_month === 7 && Q.cyprus_day <= 30 && Q.cyprus_atilla1_results.length <= 5) {
                Q.cyprus_atilla1_complete = 0; Q.cyprus_atilla1_ending_seen = 0; Q.cyprus_atilla1_reward_paid = 0;
                Q.cyprus_atilla1_ending = ''; Q.cyprus_atilla1_reward = 0;
                Q.cyprus_atilla1_max_score = 720;
            } else Q.cyprus_atilla1_max_score = Math.max(400,Q.cyprus_atilla1_results.length * 80);
        }
        if (!Array.isArray(Q.cyprus_history_seen)) Q.cyprus_history_seen = [];
        if (!Array.isArray(Q.cyprus_post_atilla1_results)) Q.cyprus_post_atilla1_results = [];
        Q.cyprus_post_atilla1_score = rules.number(Q.cyprus_post_atilla1_score);
        Q.cyprus_post_atilla1_count = Q.cyprus_post_atilla1_results.length;
        Q.cyprus_post_atilla1_max_score = 240;
    }
    /** @param {State} Q */
    function finishExtended(Q) {
        if (Q.cyprus_atilla1_complete) return;
        var maximum = Q.cyprus_atilla1_results.length * 80;
        Q.cyprus_atilla1_max_score = maximum;
        Q.cyprus_atilla1_ending = Q.cyprus_atilla1_score >= maximum * 0.75 ? 'Massive' : Q.cyprus_atilla1_score >= maximum * 0.5 ? 'Successful' : 'Failure';
        Q.cyprus_atilla1_reward = Q.cyprus_atilla1_ending === 'Massive' ? 4 : Q.cyprus_atilla1_ending === 'Successful' ? 2 : 0;
        Q.cyprus_atilla1_complete = 1;
    }
    /** @param {State} Q */
    function awardEnding(Q) {
        ensureExtended(Q);
        if (!endingReady(Q) || historyScene(Q) || Q.cyprus_atilla1_reward_paid) return false;
        var previous = rules.number(Q.cyprus_atilla1_reward_paid_amount);
        Q.leverage_points = rules.number(Q.leverage_points) + Math.max(0,Q.cyprus_atilla1_reward - previous);
        Q.cyprus_atilla1_reward_paid_amount = Math.max(previous,Q.cyprus_atilla1_reward);
        Q.cyprus_atilla1_reward_paid = 1;
        return true;
    }
    /** @param {State} Q */
    function continueEnding(Q) {
        ensureExtended(Q);
        if (!Q.cyprus_atilla1_reward_paid) return false;
        Q.cyprus_atilla1_ending_seen = 1;
        if (Q.cyprus_history_advance_pending) {
            Q.cyprus_history_advance_pending = 0;
            advanceDate(Q);
        }
        return true;
    }
    /** @param {State} Q @param {string} key @param {string} action @param {()=>number} random */
    function resolveHistory(Q,key,action,random) {
        if (!Object.prototype.hasOwnProperty.call(historyEvents,key) || historyScene(Q) !== 'cyprus_history_' + key) return false;
        var event = historyEvents[key];
        if (!Object.prototype.hasOwnProperty.call(event.actions,action)) return false;
        ensureExtended(Q); ensureSupport(Q);
        var option = event.actions[action], tier = militaryTier(Q);
        var baseScore = roll(tier,option.requirement,random), supportBonus = Q.cyprus_support_bonus;
        var score = Math.min(80,baseScore + supportBonus), index = resultIndex(score);
        var result = {key:key,month:event.month,day:event.day,action:action,score:score,baseScore:baseScore,
            supportBonus:supportBonus,tier:levels[tier],outcome:outcomes[index],text:option.text[index]};
        Q.cyprus_history_seen.push(key);
        Q.cyprus_support_bonus = 0;
        Q.cyprus_history_last_outcome = outcomes[index];
        Q.cyprus_history_last_text = option.text[index];
        if (event.stage === 'atilla1') {
            Q.cyprus_atilla1_results.push(result); Q.cyprus_atilla1_score += score;
            if (index >= 2) Q.cyprus_atilla1_frontline += '; ' + option.position;
            if (key === 'july2930') {
                finishExtended(Q);
                // Show the chapter ending on July 30 before moving into July 31.
                Q.cyprus_history_advance_pending = 1;
            } else advanceDate(Q);
        } else {
            Q.cyprus_post_atilla1_results.push(result); Q.cyprus_post_atilla1_score += score;
            Q.cyprus_post_atilla1_count = Q.cyprus_post_atilla1_results.length;
            advanceDate(Q);
        }
        return true;
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
        var week = Q.cyprus_day <= 15 ? 1 : 2;
        var previous = new Date(Date.UTC(Q.cyprus_year,Q.cyprus_month - 1,Q.cyprus_day - 1));
        var matches = Q.year === previous.getUTCFullYear() && Q.month === previous.getUTCMonth() + 1 && Q.week === (previous.getUTCDate() <= 15 ? 1 : 2);
        var boundary = Q.cyprus_day === 1 || Q.cyprus_day === 16;
        if (boundary && matches) { Q.cyprus_calendar_advance = 1; Q.month_actions = 1; }
        else if (!Q.cyprus_calendar_advance) {
            Q.year = Q.cyprus_year; Q.month = Q.cyprus_month; Q.week = week; Q.month_actions = 0;
        }
        replenishResources(Q);
    }
    /** Resolve once, with the engine's seeded generator so saving preserves the result.
     * @param {State} Q @param {number} day @param {string} action @param {()=>number} random */
    function resolve(Q, day, action, random) {
        if (!Array.isArray(Q.cyprus_atilla1_results)) initialize(Q);
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month !== 7 || Q.cyprus_day !== day ||
            Q.cyprus_atilla1_complete || Q.cyprus_atilla1_results.length !== day - 20 || !days[day] || !days[day].actions[action]) return false;
        var tier = militaryTier(Q), requirement = days[day].actions[action].requirement;
        ensureSupport(Q);
        var baseScore = roll(tier, requirement, random), supportBonus = Q.cyprus_support_bonus;
        var score = Math.min(80,baseScore + supportBonus), index = resultIndex(score);
        Q.cyprus_support_bonus = 0;
        var text = narrative(Q, day, action, index);
        Q.cyprus_atilla1_results.push({day:day,action:action,score:score,baseScore:baseScore,supportBonus:supportBonus,tier:levels[tier],outcome:outcomes[index],text:text});
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
        return true;
    }
    rules.cyprusAtilla1 = {supportActions:supportActions,districts:districts,startingResources:startingResources,
        dailyResources:dailyResources,initializeSupport:initializeSupport,ensureSupport:ensureSupport,
        replenishResources:replenishResources,cooldown:cooldown,supportUnavailable:supportUnavailable,useSupport:useSupport,
        historyEvents:historyEvents,historyScene:historyScene,resolveHistory:resolveHistory,endingReady:endingReady,awardEnding:awardEnding,continueEnding:continueEnding,
        days:days,levels:levels,outcomes:outcomes,militaryTier:militaryTier,roll:roll,
        resultIndex:resultIndex,initialize:initialize,briefingScene:briefingScene,scene:scene,briefing:briefing,resolve:resolve,advanceDate:advanceDate};
    if (typeof module !== 'undefined' && module.exports) module.exports = rules.cyprusAtilla1;
}(typeof globalThis !== 'undefined' ? globalThis : window));
