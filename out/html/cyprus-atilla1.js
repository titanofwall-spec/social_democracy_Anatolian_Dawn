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
        "text": "Mert Zorlu described what he had seen in those days, during the ceasefire, as follows:\n\n“They brought us down from Ankara in a day and left us on the island by helicopter on 22 July. There was continual fighting. The Beşparmak Mountains were swarming with Greek Cypriot and Greek soldiers. Throughout the ceasefire this situation continued. Whenever fire came from somewhere, we immediately advanced and took the hill... The Greek soldiers in particular were big, giant-like men. They fought fiercely, but the Greek Cypriots immediately ran away...”\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 272–273 — English translation of the source excerpt.",
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
        "text": "“Gentlemen, the news reaching us is extremely worrying. Turkey has embarked on another major occupation in Cyprus. Clerides can no longer bear it. The situation is extremely critical. Look at the maps: you will see the Turks' expansion of nearly one hundred square kilometres since 22 July. In these circumstances, the conference will continue without me. The Greek government cannot remain at this conference any longer...”\n\nMavros, quoted in Mehmet Ali Birand, 30 Sıcak Gün, PDF page 295 — English translation of the source excerpt.",
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
        "text": "At the experts' meeting, which lasted until seven on Sunday morning, the parties had done no more than maintain their positions. Important articles were still unsettled. For example, the Greeks wanted the peacekeeping force placed in the security zone and, in direct opposition to Turkey's proposal, wanted the zone to be very narrow. They wanted the withdrawal, supply and non-increase of all foreign troops on the island explicitly included in the agreement, and insisted that the refugees return to their homes... The most useful aspect of this meeting, which lasted until morning, was that the disputed points had been identified on paper. The Greek delegation would not make concessions. It had not departed from the view that constitutional issues should be settled between the Cypriots.\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 317 — English translation of the source excerpt.\n\n“The villages of Karavas, Lapithos and Myrtou remain in National Guard hands. … Buffavento Castle has been occupied by Turkish forces.”\n\n[S/11353/Add.10, paragraph 2–3 — UN report excerpt.](https://digitallibrary.un.org/record/484479/files/S_11353_Add.10-EN.pdf)",
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
        "text": "At the conference, the airport question was being discussed, and the British were insisting that their formula be accepted. Güneş intervened:\n\n“This conference must end. Mr. Callaghan, let us leave the airport question to the technicians and take it up at the second conference... If you accept this, I would like to speak privately with Mr. Mavros.”\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 357 — English translation of the source excerpt.",
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
        "text": "“Turkish forces advanced approximately 1000 metres west from Ayios Ermolaos … approximately 500 metres south from a point near the Nicosia race course”\n\n[S/11353/Add.12, paragraph 2 — UN report excerpt.](https://digitallibrary.un.org/record/484532/files/S_11353_Add.12-EN.pdf)",
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
        "text": "“Turkish forces had entered the southern part of Karavas but remained outside Lapithos … in the evening of 1 August entered Bellapais.”\n\n[S/11353/Add.13, paragraph 2 — UN report excerpt.](https://digitallibrary.un.org/record/484550/files/S_11353_Add.13-EN.pdf)",
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
        "text": "“Turkish troops advanced their forward positions approximately 300 metres westward from their previous lines at AMR WE205118.”\n\n[S/11353/Add.15, paragraph 2 — UN report excerpt.](https://digitallibrary.un.org/record/484572/files/S_11353_Add.15-EN.pdf)\n\n“On 12 August, the National Guard evacuated the Turkish sectors of Larnaca/Scala and Paphos/Ktima.”\n\n[S/11353/Add.20, paragraph 3 — UN report excerpt.](https://digitallibrary.un.org/record/484623/files/S_11353_Add.20-EN.pdf)\n\nTurkey had completed its First Cyprus Peace Operation. On 13 August 1974, the Turkish, Greek, British, Turkish Cypriot and Greek Cypriot delegations had sat down at the table for peace in the United Nations Palace in Geneva.\n\nMehmet Ali Birand, Diyet, PDF page 19 — English translation of the source excerpt.",
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
    /** @type {Record<string,{branch:string,side:string,label:string,cost:number,bonus:number}>} */
    var supportActions = {
        reinforce:{branch:'land',side:'turkish',label:'Reinforce defensive positions',cost:4,bonus:2},
        smuggle:{branch:'land',side:'turkish',label:'Deliver supplies and entrench troops',cost:7,bonus:3},
        strike:{branch:'air',side:'greek',label:'Strike opposing military positions',cost:4,bonus:2},
        paratrooper:{branch:'air',side:'turkish',label:'Deliver airborne reinforcements',cost:7,bonus:3},
        bombard:{branch:'naval',side:'greek',label:'Shell opposing military positions',cost:4,bonus:2},
        blockade:{branch:'naval',side:'greek',label:'Disrupt opposing supply routes',cost:7,bonus:3},
        land_recon:{branch:'land',side:'greek',label:'Scout opposing positions',cost:4,bonus:2},
        land_skirmish:{branch:'land',side:'greek',label:'Conduct a limited skirmish',cost:7,bonus:3},
        air_supply:{branch:'air',side:'turkish',label:'Deliver supplies by air',cost:4,bonus:2},
        air_recon:{branch:'air',side:'greek',label:'Fly reconnaissance missions',cost:7,bonus:3},
        naval_supply:{branch:'naval',side:'turkish',label:'Escort supply ships',cost:4,bonus:2},
        naval_plan:{branch:'naval',side:'turkish',label:'Coordinate reinforcement landings',cost:7,bonus:3}
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
        Q.cyprus_target_side = '';
        Q.cyprus_intro_seen = 0;
        Q.cyprus_opposition_seen = 0;
        Q.cyprus_preop_resume = 0;
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
        if (district !== 'turkish' && district !== 'greek' && districts.indexOf(district) < 0) return 'Select Turkish or Greek positions.';
        if ((district === 'turkish' || district === 'greek') && supportActions[key].side !== district) return 'This action is for the other side.';
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
    function mapImage(Q) {
        var original = 'cyprusgame/cyprus_map.png';
        if (!Q.cyprus_mode || Number(Q.cyprus_year) !== 1974) return original;
        var month = Number(Q.cyprus_month), day = Number(Q.cyprus_day);
        if (month < 7 || (month === 7 && day < 20)) return original;
        var stage = month > 7 ? 'august-1' : day >= 30 ? 'july-30-31' : day >= 27 ? 'july-27-28' : 'july-' + day;
        return 'cyprusgame/frontlines/' + stage + '.png';
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
        20: {title:'A foothold, not a front', briefing:"As the 6th Marine Regiment held the road immediately behind the beach, the soldiers of the 50th Infantry Regiment began moving forward and organizing themselves. Scattered machine-gun fire started from the surrounding area, but it was not difficult to silence it. Landing thirty-one ships one after another on the tiny beach was no easy task. The fleet had already begun taking up positions for shore bombardment... Turkish jets were sweeping the areas around Kyrenia and Nicosia, but dropping far fewer bombs than expected. The order “Do not fire unless fired upon” was still in their ears... Two landing ships that had run aground were left where they were... Scattered fire was answered.\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 135 — English translation of the source excerpt.\n\nThe Commando Brigade was increasingly making parachute landings in the area at Boğaz held by the Turkish Cypriot fighters. Although they encountered scattered gunfire, their landing and assembly were fairly easy. General Ersin, commanding them, used the fighters' radios to send “We have arrived safely” to Akıncı, the Commander of the Land Forces, in Adana. The following order came from Adana: “Join the forces landing from the sea without losing any time.”\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 136 — English translation of the source excerpt.", actions:{
            historical:{label:'Advance toward a junction with the airborne forces.',requirement:1,text:[
                'The advance stalls before reaching the airborne forces. Casualties and congested landing approaches slow reinforcement, leaving a small, lightly equipped coastal force on the island.',
                'Troops gain some ground inland, but the junction remains incomplete. Reinforcements continue landing unevenly; enough arrive to sustain the foothold, though heavy support remains limited.',
                'The coastal force advances while holding the landing area. A substantial force and essential equipment come ashore, but unloading remains difficult and the airborne troops are still separated from the beachhead.',
                'The advance secures the beachhead’s immediate approaches and eases pressure on unloading. More troops, armour and supplies reach the island than expected, giving the next day’s operation a strong starting position. The full junction remains unfinished.']},
            alternative:{label:'Secure the beachhead and unload heavier support first, prolonging the inland forces’ isolation.',requirement:3,text:[
                'The beachhead holds narrowly, but attempts to organize unloading achieve little. Only limited reinforcements and equipment come ashore, while the delay leaves inland troops under increasing pressure.',
                'The landing area becomes more orderly and additional supplies reach the coast. Some heavy equipment is unloaded, but slower progress limits the buildup and leaves the airborne forces facing another night without relief.',
                'The beachhead is secured and unloading proceeds steadily. Reinforcements, armour and supplies establish a well-supported coastal force, although the airborne troops remain isolated and must hold their positions until the advance resumes.',
                'Strong coordination secures the landing area and clears unloading bottlenecks. A large, well-equipped force assembles ashore with ample supplies for the next advance. The airborne troops remain isolated, but the coastal force is exceptionally well prepared to reach them.']}
        }},
        21: {title:'The second wave',briefing:"The bombardment that had begun on the island in the morning broke the first night's blockage, and the advance resumed... But the troop reinforcements—the second wave—would reach the island the following morning. The Kyrenia–Nicosia road still had not been brought under control. Fire continued from the caves in the Beşparmak Mountains, and the pockets of resistance seemed endless.\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 188–189 — English translation of the source excerpt.",actions:{
            historical:{label:'Dispatch reinforcements and prioritize the junction.',requirement:1,text:[
                'Resistance and poor coordination stall the advance. Forward units withdraw from exposed ground, leaving the coastal and airborne positions separated. The frontline gains little and contracts in places.',
                'Turkish forces capture several approaches between the landing positions, but resistance prevents a continuous corridor. The frontline expands modestly, while isolated units remain vulnerable.',
                'Turkish forces make substantial progress toward joining the beachhead with the airborne positions. Key approaches are secured, but gaps and contested ground leave the junction unfinished.',
                'The advance establishes an early corridor between the coastal and airborne forces. Turkish troops secure its immediate approaches, creating a broader, connected frontline before ceasefire pressure brings further constraints.']},
            alternative:{label:'Dispatch reinforcements to secure existing positions.',requirement:2,text:[
                'Reinforcements are drawn into defensive fighting before positions can be strengthened. Exposed outposts are abandoned, narrowing the frontline while the coastal and airborne forces remain separated.',
                'Reinforcements stabilize the existing positions and secure a few nearby approaches. The frontline expands slightly, but the gap between coastal and airborne forces remains unresolved.',
                'Reinforced units secure surrounding heights, villages and defensive approaches through limited advances. The frontline broadens into more defensible positions, although a continuous corridor remains incomplete.',
                'Well-coordinated local advances secure commanding ground and substantially enlarge the defended positions. The gap between coastal and airborne forces narrows, leaving a strong basis for completing the junction, but less territorial reach than an equally successful advance focused on linking them.']}
        }},
        22: {title:'Before the ceasefire',briefing:"In Cyprus, the pressure of the previous night had been relieved, but the Greek Cypriots were again becoming active after dark. The KYRENIA–GÖNYELİ–NICOSIA link had been established, however inadequately. Yet resistance continued inside Kyrenia, and fighting continued in the pockets in the Beşparmak Mountains. The airborne troops and those who had landed from the sea were about to join up. The General Staff was very pleased that the force, which had been fighting on the island for two days without reinforcements, had achieved this—in fact, this was the real success. The second-wave forces had set out on Sunday night, 21 July, and were about to reach the island. There were heavy tanks and armoured vehicles, and they would consolidate control over the area that had been captured.\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 228 — English translation of the source excerpt.",actions:{
            historical:{label:'Accept the ceasefire and pursue the junction—or secure its flanks if already established—before the deadline.',requirement:1,text:[
                'The advance stalls with losses and little additional ground secured.',
                'Turkish forces capture some approaches before the deadline.',
                'Turkish forces establish the junction before the deadline.',
                'Turkish forces complete the junction and secure additional ground protecting it.']},
            alternative:{label:'Accept the ceasefire and halt offensive movement immediately.',requirement:2,text:[
                'The halt is poorly coordinated, leaving forward units exposed and forcing withdrawals from some positions. No further expansion occurs, and either the remaining gap or the existing corridor’s vulnerability worsens.',
                'Most units halt in place, but uneven coordination forces small local withdrawals. The frontline changes little.',
                'Units establish a coordinated defensive line across the ground already held. No further territory is gained, but existing positions are preserved.',
                'A disciplined halt preserves virtually all gains and allows rapid fortification and redistribution of support. No offensive expansion occurs, but Turkey retains its strongest available defensive line.']}
        }},
        23: {title:'A ceasefire without security',briefing:"In Turkey, Karamanlis's arrival, followed immediately by Sampson's overthrow and his replacement by Clerides, was met with mixed feelings. In every Turk's mind, Karamanlis was known as a man who had signed the London–Zurich agreements despite Makarios and believed in Turkish–Greek friendship... Clerides too had always inspired sympathy with his moderate and reasonable attitude. These two leaders' accession increased hopes that “the way to a solution in Cyprus would open”... In government circles, the boast “We have brought democracy to Greece” prevailed. A softer atmosphere had emerged... With Karamanlis's arrival, an entirely new and wide-ranging cooperation could be established between Turkey and Greece...\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 255 — English translation of the source excerpt.\n\nIn Cyprus, however, the ceasefire existed only in words. Turkey was continually massing troops to make up the shortfall and trying to establish itself fully on the territory it held and ensure its security. The Beşparmak Mountains could not be cleared. Even in Kyrenia there was still resistance—contrary to what the newspapers were saying. The Turkish army was advancing little by little, both to silence the fire coming from the other side and to secure its own safety. The troops in Nicosia had also begun approaching the airport. From time to time, these expansions did go too far... The Turkish units were trying to make up the shortfall...\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 255 — English translation of the source excerpt.",actions:{
            historical:{label:'Continue consolidation while entering diplomatic talks.',requirement:1,text:[
                'Local operations become disorganized, causing losses and weakening Turkey’s bargaining position.',
                'Turkey gains limited military advantage while opening contacts with the new governments.',
                'Turkey enters diplomatic exchanges from a stronger position.',
                'Turkey gains substantial bargaining strength as opposing forces struggle to reorganize.']},
            alternative:{label:'Halt offensive movement and seek UN protection for exposed communities.',requirement:2,text:[
                'Protection arrangements fail to materialize, while confused defensive orders allow opposing forces to exploit exposed positions. Turkey loses military advantage and receives little practical benefit from its restraint.',
                'The halt improves diplomatic contacts, but UN protection remains limited. Defensive engagements inflict some losses on opposing units, while exposed communities and insecure approaches remain unresolved.',
                'Turkey maintains the halt and repels attacks with crippling losses to the formations involved. UN cooperation brings protection to some exposed communities, strengthening Turkey’s diplomatic position without further territorial expansion.',
                'Well-coordinated defenses inflict severe losses on attacking formations while Turkish forces hold their ground. Effective UN protection arrangements reduce threats to exposed communities, giving Turkey a substantial military and diplomatic advantage as the new governments seek negotiations.']}
        }},
        24: {title:'The airport confrontation',briefing:"Callaghan had made the incident a matter of prestige. In this way, he could both give the passive British a role to play and “save” the airport, which had great symbolic value. As Turkish commanders pressed the peacekeeping forces, made up of British troops, to “leave the airport,” Secretary-General Waldheim not only telephoned Ecevit but then went to Washington and asked Kissinger to help on the matter...\n\nNATO Secretary-General Luns telephoned Deputy Permanent Representative Turgut Tülümen in Brussels and said, “Please do not take the airport. It turns out it is not in your hands, as you have claimed. If you advance, there may be a clash with the British in the peacekeeping force.”\n\nThe airport really was not in our hands. When it had been surrounded, a message saying “it is ours” had been sent... The situation could not be understood with certainty.\n\nMehmet Ali Birand, 30 Sıcak Gün, PDF page 261 — English translation of the source excerpt.",actions:{
            historical:{label:'Promise not to seize the airport by force.',requirement:1,text:[
                'Orders reach forward units unevenly, provoking confrontations and diplomatic pressure. Turkey pulls back from exposed approaches to prevent further escalation, leaving a less favorable final frontline.',
                'The assurance prevents a major confrontation, but uncertainty over local boundaries leaves some positions difficult to supply or defend. Turkey retains most of its ground without resolving access.',
                'Clear orders prevent clashes with UN troops. Turkish forces retain their defensible positions outside the airport, establishing a stable final frontline while the airport remains under UN control.',
                'Close coordination with UN commanders settles disputed local boundaries and reduces the need for withdrawals. Turkey preserves its strongest defensible positions outside the airport and enters Geneva with improved ceasefire credibility. Airport access remains subject to separate agreement.']},
            alternative:{label:'Negotiate UN-supervised arrangements for the approaches and access.',requirement:2,text:[
                'Talks break down over withdrawals and inspection rights. Turkish troops leave some exposed approaches under pressure, weakening the final frontline without obtaining access guarantees.',
                'Temporary arrangements reduce confrontation, but only limited liaison or humanitarian movement is agreed. Most positions remain intact, while broader access and disputed approaches remain unresolved.',
                'Negotiators secure monitored routes and clearly defined positions around the airport. Turkey accepts limited local adjustments while preserving its main frontline and obtaining agreed humanitarian and supply access.',
                'A workable agreement establishes monitored access, reciprocal local withdrawals and clear separation from UN positions. Turkey retains a strong final frontline with more reliable supply arrangements, though the airport remains under UN control.']},
            pressure:{label:'Maintain the demand for control, risking escalation.',requirement:3,text:[
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
        if (Q.cyprus_day === 16 && seen.indexOf(16) < 0 && !Q.cyprus_opposition_seen) return 'meetingopposition';
        if (Q.cyprus_day === 17 && seen.indexOf(17) < 0 && !Q.cyprus_intro_seen) return 'cyprusintro';
        return seen.indexOf(Q.cyprus_day) < 0 ? 'cyprus_briefing_' + Q.cyprus_day : null;
    }
    /** Advance only after all passages belonging to a pre-operation day are complete.
     * @param {State} Q @param {number} day */
    function finishBriefingDay(Q,day) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month !== 7 || Q.cyprus_day !== day || day >= 20 || !Array.isArray(Q.cyprus_briefings_seen) || Q.cyprus_briefings_seen.indexOf(day) < 0) return false;
        advanceDate(Q);
        Q.cyprus_preop_resume = 1;
        return true;
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
    /** @param {string} choiceId */
    function choiceTooltip(choiceId) {
        var match = /^cyprus_atilla1_(20|21|22|23|24)\.([a-z]+)$/.exec(choiceId);
        var action = match ? days[Number(match[1])].actions[match[2]] : undefined;
        if (!match) {
            match = /^cyprus_history_([a-z0-9]+)\.([a-z]+)$/.exec(choiceId);
            if (match && Object.prototype.hasOwnProperty.call(historyEvents,match[1])) action = historyEvents[match[1]].actions[match[2]];
        }
        if (!match || !action) return '';
        var tier = ['critical','outdated','adequate','good','excellent'][action.requirement];
        var article = /^[aeiou]/.test(tier) ? 'an' : 'a';
        return (match[2] === 'historical' ? 'This is the historical choice.' : 'This is an alternative choice.') +
            ' This operation would require our forces to be in ' + article + ' ' + tier + ' state.' +
            ' This requirement uses average land, naval and aerial strength.';
    }
    /** @param {State} Q @param {number} day */
    function briefing(Q, day) {
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
        finishBriefingDay:finishBriefingDay,mapImage:mapImage,choiceTooltip:choiceTooltip,historyEvents:historyEvents,historyScene:historyScene,resolveHistory:resolveHistory,endingReady:endingReady,awardEnding:awardEnding,continueEnding:continueEnding,
        days:days,levels:levels,outcomes:outcomes,militaryTier:militaryTier,roll:roll,
        resultIndex:resultIndex,initialize:initialize,briefingScene:briefingScene,scene:scene,briefing:briefing,resolve:resolve,advanceDate:advanceDate};
    if (typeof module !== 'undefined' && module.exports) module.exports = rules.cyprusAtilla1;
}(typeof globalThis !== 'undefined' ? globalThis : window));
