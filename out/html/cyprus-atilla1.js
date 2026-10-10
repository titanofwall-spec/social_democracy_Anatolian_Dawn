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
        "title": "25 July, 1974: Beginning of Geneva Conference",
        "text": "Mert Zorlu described what he had seen in those days, during the ceasefire, as follows:\n\n“They brought us down from Ankara in a day and left us on the island by helicopter on 22 July. There was continual fighting. The Beşparmak Mountains were swarming with Greek Cypriot and Greek soldiers. Throughout the ceasefire this situation continued. Whenever fire came from somewhere, we immediately advanced and took the hill... The Greek soldiers in particular were big, giant-like men. They fought fiercely, but the Greek Cypriots immediately ran away...”\n\nOn July 25, the First Geneva Conference was held under the management of British Foreign Minister Callaghan with the participation of Turkish Foreign Minister Turan Güneş, Greek Foreign Minister George Mavros, and the observers William Buffum and Joseph Sisco from America, and observing delegates from the UN and USSR. The real goal of the conference was to finally establish the ceasefire and freeze the frontlines; the Greeks and British fervently wanted Turks to stop, or even retreat to their frontlines on July 22, while the primary desire of the Turkish side was to stop Greek and Cypriot attacks on the Turkish villages that had caused gruesome civilian deaths.\n\nWhile the UN had failed to enforce the ceasefire throughout the island, the beginning of the conference had seen the frontlines largely stop moving by July 25; if we were to make any further advances, they would be limited in scope but still valuable; in retrospect, we could also genuinely stop any further advances as a show of goodwill and seek diplomatic solutions. Our immediate objective was saving the lives of Turkish Cypriots not under occupation; we could do this either through further invasions to scare the Greeks or stopping altogether to have Britain and America press the Greeks to control Cypriot militias.",
        "actions": {
            "historical": {
                "label": "Continue limited advances to pressure the Greek side and protect exposed Turkish communities",
                "requirement": 1,
                "text": [
                    "The attempt to use further advances as leverage achieved little. Turkish units became drawn into scattered fighting without securing positions of lasting value, while reports of continued movement undermined Ankara’s position at Geneva. The Greek and British delegations seized upon the renewed fighting as evidence that Turkey was unwilling to respect the ceasefire, while exposed Turkish communities elsewhere remained vulnerable despite the additional military effort.",
                    "Our forces carried out several limited advances in response to hostile fire and secured a number of nearby positions. These movements improved the safety of parts of the Turkish-held zone, but did little to alter the wider situation of exposed communities. At Geneva, the continued movement of the front created friction with Britain and Greece, though the negotiations remained intact.",
                    "Carefully controlled advances cleared several threatening positions and strengthened the security of the Turkish corridor without provoking a wider escalation. The pressure placed on the Greek side reinforced Ankara’s warning that attacks on Turkish communities would carry territorial consequences. Although the British and Greek delegations protested, Turkey entered the next stage of the Geneva talks from a stronger military position.",
                    "The limited offensive achieved far more than expected. Our forces rapidly seized several strategically useful heights and approaches in response to hostile activity, further restricting Greek and Greek Cypriot freedom of movement while avoiding a major battle. The gains strengthened both the security of the Turkish-held zone and Ankara’s bargaining position at Geneva, making clear that continued attacks on Turkish communities could only worsen the Greek position."
                ],
                "position": "local positions consolidated during the opening Geneva talks"
            },
            "alternative": {
                "label": "Halt all further advances and seek Anglo-American pressure against attacks on Turkish communities",
                "requirement": 2,
                "text": [
                    "Turkey fully halted offensive movement, but the expected diplomatic pressure failed to provide effective protection. Britain and the United States issued appeals for restraint without securing firm compliance from Greek or Greek Cypriot forces, while reports of violence against isolated Turkish communities continued. Ankara had demonstrated good faith, but entered the negotiations having surrendered its remaining military leverage without receiving adequate guarantees in return.",
                    "Our forces ceased all offensive movement and the government concentrated its efforts on Geneva. Britain and the United States increased pressure on the Greek delegation and called for an end to attacks on Turkish communities, though enforcement remained uneven. The fighting diminished in several areas, but the safety of more isolated communities remained dependent upon international supervision.",
                    "The complete halt strengthened Ankara’s diplomatic position immediately. Britain and the United States, now unable to accuse Turkey of violating the ceasefire, placed greater pressure on Athens and the Greek Cypriot authorities to restrain their forces and protect Turkish communities. Violence declined noticeably, while Turkey entered the substantive negotiations at Geneva with increased international credibility.",
                    "Turkey’s restraint transformed the atmosphere of the conference. With offensive operations fully suspended, Britain and the United States concentrated their pressure on the Greek side and secured strong commitments regarding the protection of Turkish communities and enforcement of the ceasefire. Ankara entered the negotiations with its existing territorial gains intact, considerable diplomatic legitimacy, and the argument that any further breakdown of peace could no longer be blamed upon Turkey."
                ],
                "position": "positions held without offensive expansion; UN liaison pursued"
            }
        },
        "stage": "atilla1"
    },
    "july26": {
        "month": 7,
        "day": 26,
        "title": "26 July 1974: The Enclave Expands",
        "text": "Despite the beginning of the Geneva Conference and the official ceasefire remaining in effect, our forces in Cyprus had continued to expand their positions wherever it was considered necessary for the security of the Turkish-held area. With the second wave now fully arriving and our forces increasingly consolidating their positions, the territory under our control continued to grow even as our diplomats sat across the table from the Greeks and British in Geneva.\n\nThis situation had increasingly enraged the Greek delegation. Greek Foreign Minister Mavros, pointing toward the maps showing our advances since the ceasefire of 22 July, warned the other delegations that Turkey had expanded its positions by nearly one hundred square kilometres:\n\n“Gentlemen, the news reaching us is extremely worrying. Turkey has embarked on another major occupation in Cyprus. Clerides can no longer bear it. The situation is extremely critical. Look at the maps: you will see the Turks' expansion of nearly one hundred square kilometres since 22 July. In these circumstances, the conference will continue without me. The Greek government cannot remain at this conference any longer...”\n\nFor the Greeks, our continued advances were increasingly becoming proof that Turkey was merely using the ceasefire and the Geneva negotiations as a cover to improve its military position. For us however, the situation was considerably less simple. The ceasefire had repeatedly failed to prevent attacks against our forces or the Turkish Cypriot population, and many of our positions still remained exposed and difficult to defend. Every additional hill, road and village under our control reduced this danger and strengthened our hand at the negotiating table.\n\nHowever, we could not continue such actions forever while simultaneously expecting the Geneva Conference to survive. Every further advance increased the possibility of the Greek delegation abandoning negotiations entirely and gave Britain another opportunity to accuse us of violating the ceasefire. We could therefore continue our consolidation and expansion wherever our commanders considered it necessary, accepting the diplomatic consequences in exchange for a stronger position on the island, or finally order our forces to stop all offensive movement and allow Geneva to determine what came next.",
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
        "title": "27–28 July 1974: Fighting on the Flanks",
        "text": "Our refusal to freeze the frontlines had ensured that the ceasefire remained increasingly theoretical. While the Geneva negotiations dragged on without meaningful agreement, our forces continued attempting to remove hostile positions around the edges of the Turkish-held enclave and establish a more defensible perimeter before any political settlement could permanently freeze the situation on the ground.\n\nAt the experts' meeting in Geneva, which continued until seven in the morning of 28 July, neither side had managed to move significantly from its existing position. The Greeks demanded that the UN peacekeeping force be placed inside a very narrow security zone and insisted upon the withdrawal, supply restrictions and non-increase of foreign troops on the island. They also demanded the return of refugees to their homes and continued to reject our efforts to create a broader territorial arrangement for the Turkish Cypriot community. The Turkish delegation, meanwhile, remained unwilling to accept a settlement that would return the island to the same insecure conditions that had existed before our intervention.\n\nWhile the diplomats argued, fighting continued around the flanks of our positions. The villages of Karavas, Lapithos and Myrtou remained under the control of the National Guard, while Turkish forces had succeeded in occupying Buffavento Castle. These positions were increasingly important for the security of our western and mountain approaches, but taking them would require yet another expansion of our territory during a ceasefire that we were already being accused of ignoring.\n\nThe military situation therefore once again presented us with the same question. We could continue clearing hostile positions around our flanks, strengthen the western approaches and take strategically valuable ground before Geneva succeeded in freezing the frontlines. Such actions would improve our military position but could further undermine the conference and strengthen Greek claims that Turkey had no intention of respecting the ceasefire. Alternatively, we could finally halt our forces at their present positions and place our remaining demands entirely in the hands of our delegation at Geneva.",
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
        "title": "29–30 July 1974: Geneva I Concludes",
        "text": "The First Geneva Conference had now reached its final days, but despite days of negotiations, little meaningful progress had been achieved. Our forces had continued to expand and consolidate their positions throughout the conference, taking advantage of the ineffective ceasefire whenever enemy fire or exposed positions provided justification for further movement. For the Greek delegation and increasingly for the British, these actions had become proof that Turkey was negotiating in Geneva while simultaneously changing the reality on the ground.\n\nThe airport question had only worsened the situation. British Foreign Minister Callaghan had blown the matter increasingly out of proportion, treating the status of Nicosia Airport almost as a question of British prestige and repeatedly allowing the issue to dominate negotiations far beyond its real importance. With Turkish forces having already accepted that the airport itself would not be taken, the continuing British insistence on the matter became another source of unnecessary tension in a conference already struggling to produce an agreement.\n\nAt the conference, the airport question was once again being discussed, and the British delegation insisted that its formula be accepted. Eventually, Turan Güneş intervened:\n\n“This conference must end. Mr. Callaghan, let us leave the airport question to the technicians and take it up at the second conference... If you accept this, I would like to speak privately with Mr. Mavros.”\n\nDespite all of these disputes, Geneva had not been entirely meaningless. By the end of the conference, something that had failed to exist since the ceasefire of 22 July had finally begun to emerge on the island: an actual halt in the movement of the frontlines. Both Turkish and Greek forces were increasingly holding their positions rather than attempting further expansion, and the ceasefire was finally beginning to resemble one in practice rather than merely on paper.\n\nFor the Turkish Cypriot population, this alone was of immense importance. The threat posed by roaming Greek Cypriot militias and continued attacks had not disappeared, but with the fronts finally stabilizing and international attention now firmly focused on enforcing the ceasefire, the danger facing isolated Turkish communities had become considerably smaller than it had been only days earlier.\n\nYet our actions throughout the conference had come with a cost. Britain had grown increasingly hostile toward our continued advances, Greece accused us of using Geneva merely to legitimize territorial expansion, and even the United States had become increasingly concerned by the constant movement of Turkish forces despite repeated ceasefire demands. Militarily, however, our position was now incomparably stronger than it had been when the operation began.\n\nAtilla I had achieved what it could achieve.\n\nOur forces had landed successfully, established the junction between the coastal and airborne formations, taken Kyrenia, secured a continuous Turkish-held corridor and consolidated the mountain and western approaches. The immediate danger of the Turkish Cypriot community being crushed had been broken, while the Greek Junta and the Sampson government had both fallen during the crisis.\n\nBut the solution of the Cyprus question could no longer be found through another hill, village or road.\n\nWith the frontlines finally frozen and Geneva I drawing to its conclusion, the military phase was over. What came next would be slower, more complicated and perhaps even more dangerous in its own way. Turkey would now have to turn the military position created by Atilla I into a permanent political settlement through a long game of diplomacy...",
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
        "text": "“Turkish forces advanced approximately 1000 metres west from Ayios Ermolaos … approximately 500 metres south from a point near the Nicosia race course”",
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
        "text": "“Turkish forces had entered the southern part of Karavas but remained outside Lapithos … in the evening of 1 August entered Bellapais.”",
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
        "text": "“Turkish troops advanced their forward positions approximately 300 metres westward from their previous lines at AMR WE205118.”\n\n“On 12 August, the National Guard evacuated the Turkish sectors of Larnaca/Scala and Paphos/Ktima.”\n\nTurkey had completed its First Cyprus Peace Operation. On 13 August 1974, the Turkish, Greek, British, Turkish Cypriot and Greek Cypriot delegations had sat down at the table for peace in the United Nations Palace in Geneva.",
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
    var resourceTiers = [
        {name:'Horrible',starting:8,daily:0,limit:2},
        {name:'Decrepit',starting:12,daily:1,limit:3},
        {name:'Poor',starting:22,daily:2,limit:6},
        {name:'Adequate',starting:40,daily:3,limit:Infinity},
        {name:'Sufficient',starting:46,daily:4,limit:Infinity},
        {name:'Good',starting:97,daily:7,limit:Infinity},
        {name:'Excellent',starting:102,daily:8,limit:Infinity}
    ];
    /** @param {State} Q */
    function resourceTier(Q) {
        var strength=averageStrength(Q);
        return strength>=0.8?6:strength>=0.6?5:strength>=0.5?4:strength>=0.4?3:strength>=0.2?2:strength>=0.1?1:0;
    }
    /** @param {State} Q */
    function startingResources(Q) { return resourceTiers[resourceTier(Q)].starting; }
    /** @param {State} Q */
    function dailyResources(Q) {
        if(Q.cyprus_month===7 && Q.cyprus_day<=20)return 0;
        var tier=resourceTier(Q);
        return Q.cyprus_month>7 || Q.cyprus_day>25 ? [0,0,1,1,2,3,5][tier] : resourceTiers[tier].daily;
    }
    /** @param {State} Q */
    function initializeSupport(Q) {
        Q.military_strength = startingResources(Q);
        Q.cyprus_support_bonus = 0;
        Q.cyprus_target_side = '';
        Q.cyprus_operation_started = 0;
        Q.cyprus_intro_seen = 0;
        Q.cyprus_opposition_seen = 0;
        Q.cyprus_preop_resume = 0;
        Q.cyprus_support_used = {};
        Q.cyprus_support_early_counts = {};
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
        if (!Q.cyprus_support_early_counts || typeof Q.cyprus_support_early_counts !== 'object' || Array.isArray(Q.cyprus_support_early_counts)) {
            Q.cyprus_support_early_counts={};
            // Old saves retain resources and at least the support uses recorded by their cooldowns.
            Object.keys(supportActions).forEach(function(key){var day=Q.cyprus_support_used[key];if(typeof day==='number'&&day>=Date.UTC(1974,6,20)/86400000&&day<=Date.UTC(1974,6,25)/86400000)Q.cyprus_support_early_counts[key]=1;});
        }
        Q.cyprus_support_bonus = rules.clamp(rules.number(Q.cyprus_support_bonus),0,10);
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
    /** @param {State} Q */
    function operationStarted(Q) {
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month < 7 || (Q.cyprus_month === 7 && Q.cyprus_day < 20)) return false;
        return !!(Q.cyprus_operation_started || Q.cyprus_month > 7 || Q.cyprus_day > 20 || (Array.isArray(Q.cyprus_atilla1_results) && Q.cyprus_atilla1_results.length));
    }
    /** @param {State} Q @param {string} key @param {string} district */
    function supportUnavailable(Q,key,district) {
        if (!Object.prototype.hasOwnProperty.call(supportActions,key)) return 'Unknown support action.';
        if (!operationStarted(Q)) return 'Military actions unlock when the July 20 operation begins.';
        if (!Q.cyprus_mode || Q.cyprus_year !== 1974 || Q.cyprus_month < 7 || Q.cyprus_month > 8 || (Q.cyprus_month === 7 && Q.cyprus_day < 15) || (Q.cyprus_month === 8 && Q.cyprus_day > 13)) return 'No upcoming operation roll.';
        if (district !== 'turkish' && district !== 'greek' && districts.indexOf(district) < 0) return 'Select Turkish or Greek positions.';
        if ((district === 'turkish' || district === 'greek') && supportActions[key].side !== district) return 'This action is for the other side.';
        if(Q.cyprus_month===7&&Q.cyprus_day<=25){
            var tier=resourceTier(Q),counts=Q.cyprus_support_early_counts||{};
            var used=Object.keys(supportActions).reduce(function(total,k){return total+rules.number(counts[k]);},0);
            if(used>=resourceTiers[tier].limit)return resourceTiers[tier].name+' forces have reached their action limit through July 25.';
            if((tier===3||tier===4)&&rules.number(counts[key])>=1)return 'This action can be used once through July 25 at this military tier.';
        }
        var wait = cooldown(Q,key);
        if (wait) return 'Available in ' + wait + (wait === 1 ? ' day.' : ' days.');
        var action = supportActions[key];
        if (rules.number(Q.cyprus_support_bonus) + action.bonus > 10) return 'The next-roll bonus is capped at +10.';
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
        if(Q.cyprus_month===7&&Q.cyprus_day<=25)Q.cyprus_support_early_counts[key]=rules.number(Q.cyprus_support_early_counts[key])+1;
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
    "20": {
        "title": "A foothold, not a front",
        "briefing": "As the 6th Marine Regiment held the road immediately behind the beach, the soldiers of the 50th Infantry Regiment began moving forward and organizing themselves. Scattered machine-gun fire started from the surrounding area, but it was not difficult to silence it. Landing thirty-one ships one after another on the tiny beach was no easy task. The fleet had already begun taking up positions for shore bombardment... Turkish jets were sweeping the areas around Kyrenia and Nicosia, but dropping far fewer bombs than expected. The order “Do not fire unless fired upon” was still in their ears... Two landing ships that had run aground were left where they were... Scattered fire was answered.\n\nThe Commando Brigade was increasingly making parachute landings in the area at Strait held by the Turkish Cypriot fighters. Although they encountered scattered gunfire, their landing and assembly were fairly easy. General Ersin, commanding them, used the fighters' radios to send “We have arrived safely” to Akıncı, the Commander of the Land Forces, in Adana. The following order came from Adana: “Join the forces landing from the sea without losing any time.”\n\nForces remain authorized to consolidate and advance. Our immediate goals were to form a junction between the airborne units and the marine forces through the Beşparmak Mountain Passages. However, if we believe that our airborne units have the capability to keep resisting, we can delay the inland expansion for a while longer as we secure the beach to unload heavier support first. Either option would still allow us to move to secure the junction, but in one we risk the lives of our airborne units while in the other we accept less logistical superiority.\n\nCurrent frontlines: Separate coastal and airborne positions.",
        "actions": {
            "historical": {
                "label": "Advance toward a junction with the airborne forces.",
                "requirement": 1,
                "text": [
                    "The inland advance stalled under resistance, leaving the airborne units isolated. Fighting around the landing approaches disrupted unloading, and only a limited force with little heavy equipment assembled ashore.",
                    "The troops secured some ground beyond the beach, but the route towards the airborne positions remained contested. Reinforcements and supplies continued arriving, although congestion prevented much of the heavier support from reaching the advancing units.",
                    "The advance secured the beachhead’s immediate approaches and reduced pressure on the landing area. A substantial force and essential equipment came ashore, preparing the coastal troops to continue towards the airborne positions the following day. The junction remained incomplete.",
                    "A coordinated advance pushed opposing forces away from the landing approaches and opened more room for unloading. More troops, armour and supplies assembled ashore than expected, giving the coastal force an exceptionally strong starting position for the next day. The airborne units still awaited the completion of the junction."
                ]
            },
            "alternative": {
                "label": "Secure the beachhead and unload heavier support before advancing inland.",
                "requirement": 3,
                "text": [
                    "Attempts to organize the beachhead achieved little while enemy fire continued disrupting the landing area. Few additional troops and heavy weapons came ashore, leaving the coastal force poorly prepared and the isolated airborne units under increasing pressure.",
                    "The beachhead became more orderly, allowing additional reinforcements, ammunition and some heavy equipment to land. However, unloading remained uneven, and the coastal force gained only a modest improvement in strength while the airborne units endured another day without relief.",
                    "The troops secured the beachhead and organized dependable unloading routes. Reinforcements, armour and supplies established a well-supported coastal force, ready to begin the inland advance the following day. The airborne units retained their positions, but their relief had been delayed.",
                    "Strong coordination cleared the unloading bottlenecks and established a secure landing area. A large, well-equipped force assembled ashore with ample ammunition and supplies for the inland advance. The airborne units remained isolated, but the coastal troops were exceptionally well prepared to reach them."
                ]
            }
        }
    },
    "21": {
        "title": "Beşparmak Mountains",
        "briefing": "The air bombardment had begun on the island in the morning as our Marine and Airborne units kept advancing to form a junction and broke the first night's enemy blockage. By the next morning, the second wave of our forces would advance. In the meantime, the Kyrenia-Nicosia road was yet to be brought under control. As our forces approached the passage, the firing continued in the caves in the Beşparmak Mountains, and the pockets of resistance seemed endless.",
        "actions": {
            "historical": {
                "label": "Press the advance through the Beşparmak passages and force the junction",
                "requirement": 1,
                "text": [
                    "The attempt to break through the Beşparmak passages collapsed under sustained resistance. Units advancing from the coast were unable to overcome the fortified positions commanding the approaches, while the isolated airborne formations came under increasing pressure. With the coastal and airborne forces unable to unite and the landing force no longer capable of sustaining the offensive, the operation had failed.",
                    "After difficult fighting through the Beşparmak approaches, our forces finally broke through the remaining resistance and established contact between the coastal and airborne formations. The junction was secured, although casualties, scattered enemy positions and continued fighting along the Kyrenia–Nicosia road left the newly united front poorly organized and under considerable pressure.",
                    "Our forces steadily cleared the principal resistance blocking the mountain passages and established the long-awaited junction between the coastal and airborne formations. Important sections of the Kyrenia–Nicosia road were brought under control, while the united force reorganized and prepared to continue the offensive from a considerably stronger position.",
                    "The advance through the Beşparmak passages proceeded with exceptional speed and coordination. Resistance along the main approaches was broken, the Kyrenia–Nicosia road was secured across the critical sector, and the coastal and airborne formations joined with limited disruption. By the end of the operation, a strong and coherent front had been established with enough momentum to immediately prepare for further advances."
                ]
            },
            "alternative": {
                "label": "Clear the mountain resistance and wait for the second wave before forcing the junction",
                "requirement": 2,
                "text": [
                    "The attempt to methodically clear the Beşparmak positions failed to suppress the resistance controlling the mountain approaches. The arrival of additional troops could not compensate for the inability of the existing formations to advance, while the isolated airborne forces became increasingly vulnerable. Unable to establish the junction or secure a sustainable front, the operation had failed.",
                    "The additional time allowed several dangerous positions to be cleared before the second wave entered the fighting. Once reinforced, our forces pushed through the remaining resistance and established the junction between the coastal and airborne formations. The united front was secured, though delays and persistent pockets of resistance limited its immediate ability to continue the advance.",
                    "Systematic clearing operations secured the main approaches through the Beşparmak Mountains before the second wave was committed. Reinforced formations then advanced inland and successfully joined the airborne units, creating a stable continuous front. The Kyrenia–Nicosia corridor was substantially secured and the united force was well supplied for subsequent operations.",
                    "The delay proved exceptionally effective. The principal fortified positions were identified and destroyed, supply routes were organized, and the second wave entered the battle under highly favorable conditions. The reinforced coastal formations rapidly completed the junction with the airborne troops, secured the critical mountain passages and established an exceptionally strong continuous front with substantial forces and equipment ready for the next phase."
                ]
            }
        }
    },
    "22": {
        "title": "UN Ceasefire!",
        "briefing": "In Cyprus, with the achievement of the junction, the pressure of the previous night had been relieved; most importantly, the Turkish forces had managed to enter the city by 11:00; with it, the Greek line collapsed and both the 251st and 306th battalions were forced to retreat from Kyrenia. Despite some Turkish tanks sustaining damage, the 241st battalion would also be pushed away and the 306th battalion's captain would be captured. While the complete takeover of the city had not been achieved today, it was only a matter of time.\n\nIn the meantime, the completion of the junction saw the Airborne and Marine forces aiming at removing all resistance in the Beşparmak Mountains—however many had been left by our prior operations. The General Staff was very pleased that our forces had managed to achieve their objectives. With our military might proven to the world, and the Second Wave landing while our forces in the field were advancing, the United Nations Security Council had commenced an emergency meeting the day we started our operations and had now demanded a ceasefire.\n\nIt is not possible to refuse this ceasefire without utterly destroying our diplomatic stance. However, both we and the UN knew that regardless of our actions the Greeks, or at the very least Cypriot militias, would continue their actions, and there was the serious question of the state of our military positions, the safety of our soldiers and the very basic question of whether we had done enough. Therefore, the most logical action appeared to be accepting the ceasefire while moving as much as possible to secure our flanks until the deadline, and keeping up our responses and advances whenever we entered into conflict with the enemy forces. Or we could also demonstrate our level-headedness and confidence and halt all of our offensive movement; such action this early would only be sensible if we are truly confident of our military state and in our prospect of achieving a peaceful diplomatic resolution without any further military action.",
        "actions": {
            "historical": {
                "label": "Accept the ceasefire and secure our flanks before the deadline",
                "requirement": 1,
                "text": [
                    "The attempt to improve our positions before the ceasefire produced the opposite result. Units pushing beyond the newly established corridor encountered determined resistance and became disorganized, while several exposed positions came under counterattack. Although the ceasefire eventually froze the fighting, our forces entered it with unnecessary casualties, vulnerable flanks and a front more difficult to defend than before.",
                    "Our forces continued limited operations until the ceasefire deadline, clearing several positions and improving some of the approaches around the Kyrenia–Gönyeli–Nicosia corridor. Resistance prevented a broader advance, but the principal gains of the previous days were preserved and the connected front remained intact when the ceasefire came into effect.",
                    "The remaining hours were used effectively. Our forces pushed hostile formations away from the most vulnerable sections of the corridor, cleared several remaining pockets in the Beşparmak Mountains and strengthened the approaches around Kyrenia. By the time the ceasefire took effect, the connected Turkish position had become considerably easier to defend and the second-wave forces were beginning to consolidate the gains.",
                    "The final advance before the deadline proceeded exceptionally well. Remaining resistance along the critical approaches was rapidly broken, the flanks of the Kyrenia–Gönyeli–Nicosia corridor were secured, and the arrival of armour and second-wave formations allowed the newly captured territory to be organized into a strong defensive position. When the ceasefire began, our forces held a coherent and well-supported front from which any renewed fighting could be met from a position of strength."
                ]
            },
            "alternative": {
                "label": "Accept the ceasefire and halt offensive movement immediately",
                "requirement": 2,
                "text": [
                    "The immediate halt gave opposing forces an opportunity to recover before the ceasefire had fully taken effect. Greek Cypriot formations exploited gaps around the newly established corridor, renewed pressure against exposed units and forced our troops into several defensive engagements. The decision preserved Turkey's diplomatic position, but left the military front dangerously unsettled and squandered much of the advantage gained during the previous two days.",
                    "Our forces halted their offensive movements and confined themselves largely to defending the positions already taken. Sporadic fighting continued around Kyrenia and the Beşparmak Mountains, but the connected corridor survived intact until the ceasefire. Turkey demonstrated clear compliance with the United Nations demand, though several exposed positions and pockets of enemy resistance remained unresolved.",
                    "The order to halt was carried out in good discipline. Despite continued provocations and scattered resistance, our troops held the territory already secured without being drawn into unnecessary advances. The second-wave formations reinforced the existing positions, allowing Turkey to enter the ceasefire with a stable connected corridor while presenting itself internationally as having complied promptly with the United Nations.",
                    "The immediate halt succeeded without sacrificing the military position. Our troops maintained complete control of the connected corridor, repelled localized attacks without expanding the fighting and used the arrival of the second wave to strengthen existing defenses rather than seek further ground. Turkey therefore entered the ceasefire with both a secure military position and an exceptionally strong diplomatic argument that it had respected the United Nations decision from the moment it was issued."
                ]
            }
        }
    },
    "23": {
        "title": "A Ceasefire on Paper Only",
        "briefing": "Our continuing military advances have seen the end of the Greek Junta with Karamanlis's arrival, followed immediately by Sampson's overthrow and his replacement by Clerides. These events were met with mixed feelings in Turkey, for in every Turk's mind, Karamanlis was known as a man who had signed the London-Zurich agreements despite Makarios and believed in Turkish-Greek friendship... Clerides too had always inspired sympathy with his moderate and reasonable attitude. The accession of these two figures had increased the hopes for a path to a solution for Cyprus to open. In the circles of our government, the voices saying \"Having brought democracy to Greece\" were loud; a softer atmosphere had emerged with the arrival of Karamanlis as the possibility of new and wide-ranging cooperation emerged between Turkey and Greece...\n\nHowever, these hopes and prayers were met with dissatisfaction because of the Greek side's ferment and absolute, unmovable rejection of any prospect of territorial autonomy for Turks in Cyprus, which was the central point of our Denktaş Plan, which had sought to create a Turkish zone in the North of Cyprus that'd make up 34% of the island as a federal state inside a united Cypriot republic.\n\nAnd in Cyprus, the ceasefire existed only in words. Turkey was continually massing troops to make up for the diplomatic shortfall and trying to establish itself fully on the territory it held and ensure its security further. Small skirmishes continued in the Beşparmak Mountains and the complete takeover of Kyrenia was still not achieved. With the ceasefire appearing even less effective than expected, the Turkish army kept advancing as its Airborne forces had entered the districts of Nicosia yesterday and were now moving westward toward the airport.\n\nOur military advances since yesterday had varying degrees of success, and we once again possessed the possibility of continuing to advance while maintaining diplomatic talks, or we could finally adhere to an increasingly weaker ceasefire to show good faith; however, we would be relying on the UN, an organization that was incapable of enforcing its ceasefire, to provide protection to exposed Turkish communities across Cyprus from frenzied Cypriot Militias...",
        "actions": {
            "historical": {
                "label": "Continue consolidation while entering diplomatic talks",
                "requirement": 1,
                "text": [
                    "Our efforts to improve the existing positions achieved little. Resistance in Kyrenia and the Beşparmak Mountains continued, while advances around Nicosia exposed several units without producing meaningful territorial gains. The ceasefire remained fragile, but our attempts to exploit it had brought additional casualties without substantially improving the security of the Turkish-held corridor.",
                    "Our forces continued expanding cautiously around the positions already held, suppressing several pockets of resistance and strengthening parts of the corridor. Limited progress was made around Kyrenia and towards Nicosia Airport, though enemy activity and the scattered nature of the fighting prevented a broader consolidation. Diplomatic talks continued alongside an increasingly uncertain ceasefire.",
                    "Continued pressure allowed our forces to clear important remaining positions around Kyrenia and strengthen the approaches through the Beşparmak Mountains. Airborne formations around Nicosia also improved their positions while avoiding an uncontrolled expansion of the front. Turkey entered the diplomatic talks with a more defensible military position while preserving the possibility of further action should negotiations fail.",
                    "Our forces made exceptional use of the ineffective ceasefire. Remaining resistance around the principal Turkish positions was rapidly reduced, the corridor was widened and secured, and advances around Nicosia placed our troops in commanding positions near the airport and surrounding approaches. With the army increasingly entrenched and reinforced, Turkey entered negotiations from a position of considerable military strength while retaining the ability to resume the offensive."
                ]
            },
            "alternative": {
                "label": "Halt offensive movement and seek UN protection for exposed communities",
                "requirement": 2,
                "text": [
                    "All offensive movement was halted and responsibility for protecting the remaining exposed Turkish communities was placed upon the United Nations. The UN proved unable to establish effective protection beyond the Turkish-held zone, while armed groups continued operating across the island. Turkey had demonstrated complete compliance with the ceasefire, but entered negotiations with vulnerable communities still beyond its reach and little means of altering the situation without abandoning the policy it had just adopted.",
                    "Our forces ceased offensive operations and consolidated the territory already under their control. The United Nations established only limited protection for Turkish communities outside the corridor, and sporadic violence continued in several areas. Nevertheless, Turkey's immediate compliance strengthened its diplomatic position and brought the military phase of the crisis to an end as attention shifted toward negotiations.",
                    "The offensive was brought to a disciplined halt while our forces secured their existing positions and transferred responsibility for exposed communities to international supervision. UN involvement provided a degree of protection, while Turkey's clear adherence to the ceasefire strengthened its standing in the negotiations. With the front stabilized, the government now turned fully toward securing its objectives through diplomacy.",
                    "The decision to halt was implemented without weakening the positions already won. Turkish forces consolidated the corridor, the United Nations successfully expanded its presence around vulnerable communities, and the continuing restraint of our army gave Ankara considerable diplomatic credibility. The military phase ended with Turkey holding a secure bridgehead and entering negotiations able to argue that it had fully respected the ceasefire despite continued provocations."
                ]
            }
        }
    },
    "24": {
        "title": "You Shall Not Pass!",
        "briefing": "Our Airborne units, supplied by the Marines and the second wave of soldiers, after having secured many gains in Northern districts of Nicosia, were now advancing westward to take over the Nicosia Airport. The British Foreign Minister, who increasingly acted less and less as a neutral figure, had decided to make the situation of the airport a matter of prestige; in doing so, he could both give the passive British a role to play and \"save\" the airport. Under Callaghan's orders, when Turkish commanders pressed the peacekeeping forces that were made up of British troops to leave the airport, Secretary-General Waldheim telephoned Prime Minister Bülent Ecevit and conveyed that \"if the Turkish army advanced, a clash with UN forces would ensue, Britain would launch a direct air strike, and this would lead to a war between Turkey and the UN/Britain.\", fearing that a British threat might not be enough, he had then moved to meet with Kissinger to bring them on their side as well.\n\nNATO Secretary-General Luns telephoned Deputy Permanent Representative Turgut Tülümen in Brussels and said, “Please do not take the airport. It turns out it is not in your hands, as you have claimed. If you advance, there may be a clash with the British in the peacekeeping force.”\n\nThe British delegation's rapid and nonsensical, almost enraging response had made it clear as day that the British Foreign Minister and his delegation were clearly hostile to Turks; it appeared that they were fully willing to doom the entire NATO structure over the matter. This had made it clear that we would not take over the airport; however, we still had options; we could gain the promise that, as a neutral entity, the airport would not be used by the Greek and Cypriot forces in exchange for promising no takeover attempts, or we could go further, accept UN control, request neutrality and negotiate monitored access and movement across the airport in exchange for freezing advances around the airport. Or we could, while knowing it would still not result in a takeover, keep demanding the airport while continuing our advances around it for further tension.",
        "actions": {
            "historical": {
                "label": "Continue limited expansion, promising not to seize the airport by force.",
                "requirement": 1,
                "text": [
                    "The attempt to secure guarantees over the airport produced little beyond vague assurances. UN and British representatives refused to accept Turkish conditions in binding form, while Greek Cypriot forces continued operating close enough to the airport to leave its neutrality in doubt. Our troops remained outside the perimeter, and the confrontation ended without either territorial or diplomatic advantage.",
                    "The United Nations agreed in principle that the airport should not be used to support Greek or Greek Cypriot military operations. Turkish forces ceased attempts to enter the grounds but maintained pressure around the surrounding approaches. The immediate confrontation eased, though enforcement of the arrangement remained uncertain and our commanders continued to watch the airport closely.",
                    "A workable understanding was reached. The airport would remain outside Greek and Greek Cypriot military use, while Turkish forces undertook not to attempt its seizure. UN troops maintained control of the installation and our units were free to consolidate their positions around its approaches, removing the immediate danger of a Turkish-British confrontation without abandoning further military operations elsewhere.",
                    "The confrontation was turned into a useful compromise. The United Nations formally guaranteed the airport's military neutrality and established clear restrictions preventing its use by Greek or Greek Cypriot forces. In return, Turkey abandoned any attempt to enter the airport itself while retaining freedom to strengthen the surrounding front. The threat of a clash with Britain receded without materially limiting our wider campaign."
                ]
            },
            "alternative": {
                "label": "Accept UN control, negotiate monitored access and freeze further advances.",
                "requirement": 2,
                "text": [
                    "Turkey halted its movement around the airport and accepted United Nations control, but negotiations produced only limited guarantees over access and neutrality. The airport remained outside Turkish influence, while international supervision proved less effective than Ankara had hoped. Nevertheless, the government had committed itself to ending further offensive operations and turned fully toward diplomacy.",
                    "The airport was placed firmly under United Nations control and Turkish advances around it ceased. Arrangements were made to preserve its neutrality and establish limited monitored movement through the area. Although Turkey gained little additional leverage, the immediate crisis with Britain and the UN was brought to an end. With further offensive action suspended, the military phase now gave way to negotiations.",
                    "A comprehensive agreement placed the airport under neutral UN administration, prohibited its military use by either side and established monitored access and movement acceptable to Turkey. Our forces froze their positions without surrendering any territory already secured. The confrontation ended peacefully, giving Ankara a stronger diplomatic position as the government formally shifted its efforts from battlefield consolidation to negotiations.",
                    "The government transformed the airport crisis into a major diplomatic success. UN control was accompanied by firm guarantees of neutrality, transparent monitoring and dependable Turkish access arrangements, while all parties recognized the existing Turkish military positions around Nicosia. By voluntarily freezing further advances at the height of its leverage, Ankara entered diplomacy with both its military gains intact and a powerful claim to restraint and good faith."
                ]
            },
            "pressure": {
                "label": "Continue expansion and maintain the demand for airport control.",
                "requirement": 3,
                "text": [
                    "The attempt to pressure the United Nations backfired. Turkish movements around the airport alarmed the British contingent and brought the opposing forces dangerously close to an armed confrontation. Our troops gained little useful ground, while diplomatic pressure mounted rapidly from Britain, NATO and the United States. The airport remained beyond our reach and the advance achieved nothing sufficient to justify the crisis it created.",
                    "Our forces continued tightening their positions around the airport without crossing into the UN-held perimeter. The growing pressure forced further negotiations over its status, but British and UN troops refused to withdraw. No clash occurred, yet the airport remained outside Turkish control and tensions with our allies increased considerably.",
                    "Sustained pressure allowed our units to improve their positions around the airport and dominate several surrounding approaches while carefully avoiding direct contact with UN troops. The installation itself remained under international control, but its practical freedom of use was sharply reduced. Turkey gained a stronger tactical position at the cost of worsening relations with Britain and increasing international demands for restraint.",
                    "Our forces executed the pressure campaign with exceptional discipline. Turkish units secured commanding positions around nearly every important approach to the airport, effectively containing it without entering the UN perimeter or giving British troops grounds to open fire. The airport remained formally outside our hands, but its military value to the opposing side was drastically reduced. Ankara entered the next stage of the crisis with a powerful local position—alongside dangerously heightened tensions with Britain, NATO and the United Nations."
                ]
            }
        }
    }
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
    rules.cyprusAtilla1 = {resourceTiers:resourceTiers,resourceTier:resourceTier,supportActions:supportActions,districts:districts,startingResources:startingResources,
        dailyResources:dailyResources,initializeSupport:initializeSupport,ensureSupport:ensureSupport,
        replenishResources:replenishResources,cooldown:cooldown,supportUnavailable:supportUnavailable,useSupport:useSupport,
        operationStarted:operationStarted,finishBriefingDay:finishBriefingDay,mapImage:mapImage,choiceTooltip:choiceTooltip,historyEvents:historyEvents,historyScene:historyScene,resolveHistory:resolveHistory,endingReady:endingReady,awardEnding:awardEnding,continueEnding:continueEnding,
        days:days,levels:levels,outcomes:outcomes,militaryTier:militaryTier,roll:roll,
        resultIndex:resultIndex,initialize:initialize,briefingScene:briefingScene,scene:scene,briefing:briefing,resolve:resolve,advanceDate:advanceDate};
    if (typeof module !== 'undefined' && module.exports) module.exports = rules.cyprusAtilla1;
}(typeof globalThis !== 'undefined' ? globalThis : window));
