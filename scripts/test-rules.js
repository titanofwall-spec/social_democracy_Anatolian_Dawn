const fs = require('fs'), path = require('path'), assert = require('assert'), vm = require('vm');
const lib = require('dendrynexus/lib/engine.js');
const rules = require('../out/html/rules.js');
require('../out/html/cyprus-atilla1.js');
require('../out/html/cyprus-campaign.js');
// Preserve the legacy campaign fixture; current-campaign tests use the real initializer.
rules.cyprusCampaign.initialize = () => {};
const check = require('./check.js');
const root = path.resolve(__dirname, '..');
const noop = () => {};
const node = {remove:noop, replaceChildren:noop, style:{setProperty:noop}, appendChild:noop, setAttribute:noop, addEventListener:noop,
    offsetWidth:600, classList:{add:noop, remove:noop, toggle:noop}, querySelector:()=>node,
    querySelectorAll:()=>[], getAttribute:()=>'', getElementsByClassName:()=>[], innerHTML:'', textContent:''};
global.document = {createElement:()=>({...node}), getElementById:()=>node, querySelector:()=>node,
    querySelectorAll:()=>[], addEventListener:noop, body:node};
global.Image = function () { return {...node}; };
global.window = {}; global.d3 = null; global.updateCyprusWidth = noop;
global.localStorage = {getItem:()=>null, setItem:noop};
const engineErrors = [], log = console.log;
console.log = (...args) => { if (String(args[0]).startsWith('Error')) engineErrors.push(args.join(' ')); };
function near(actual, expected, label) { assert(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} != ${expected}`); }
function numeric(Q) { for (const [key, value] of Object.entries(Q)) if (typeof value === 'number') assert(Number.isFinite(value), key + ' must remain finite'); }
lib.convertJSONToGame(fs.readFileSync(path.join(root, 'out/game.json'), 'utf8'), (error, game) => {
    if (error) throw error;
    const passed = [];
    function fresh() {
        const ui = new lib.NullUserInterface(); ui.show_portraits = false;
        const engine = new lib.DendryEngine(ui, game);
        window.dendryUI = global.dendryUI = {dendryEngine:engine};
        engine.beginGame([1,2,3,4,5]); engine.goToScene('root.start'); engine.goToScene('root.start_main');
        return engine;
    }
    function test(name, run) {
        engineErrors.length = 0;
        const e = fresh();
        run(e, e.state.qualities);
        assert.deepEqual(engineErrors, [], name + ': engine error');
        numeric(e.state.qualities);
        passed.push(name);
    }
    function action(e, id) { assert(game.scenes[id], id); e._runActions(game.scenes[id].onArrival); }
    function pick(e, id) {
        const choices = e.getCurrentChoices(), index = choices.findIndex(choice => choice.id === id);
        assert(index >= 0, id + ' unavailable in ' + choices.map(choice => choice.id).join(', '));
        assert(!choices[index].unavailable, id + ' must be selectable');
        e.choose(index);
    }
    function tick(e, Q) { Q.month_actions = 1; e.goToScene('post_event'); }
    test('Stable dissent and no progression on navigation', (e,Q) => {
        const keys = ['time','year','month','week','dissent','democracystatus','disk_turkis_conflict','coup_timer','workers_chp','rural_chp','forex_pressure'];
        e.goToScene('post_event');
        const before = keys.map(key => Q[key]), history = Q.economic_records.length;
        for (let i=0;i<20;i++) e.goToScene('post_event');
        assert.deepEqual(keys.map(key=>Q[key]), before); assert.equal(Q.economic_records.length, history);
        const dissent = Q.dissent; tick(e,Q); near(Q.dissent, dissent, 'dissent');
    });
    test('Unhealthy economy changes support only when time passes', (e,Q) => {
        Q.CHP_in_government=1; Q.prime_minister_party='CHP'; Q.base_inflation=100; Q.inflation_modifier=0;
        Q.base_growth=-3; Q.base_unemployment=15; Q.last_economy_month=Q.year*12+Q.month;
        e.goToScene('post_event'); const before=Q.workers_chp;
        for(let i=0;i<5;i++) e.goToScene('post_event'); near(Q.workers_chp,before,'workers support');
        tick(e,Q); assert(Q.workers_chp < before);
    });
    test('Monthly coup chance is not rerolled by navigation', (e,Q) => {
        Q.democracystatus=5; Q.army_in_government=0; Q.tsk_pacified=0; Q.coup_timer=0;
        const random=Math.random; let rolls=0;
        try {
            Math.random=()=>{rolls++; return 0.99;};
            for(let i=0;i<5;i++) e.goToScene('post_event'); assert.equal(rolls,0);
            tick(e,Q); assert.equal(rolls,0); tick(e,Q); assert.equal(rolls,1);
            for(let i=0;i<5;i++) e.goToScene('post_event'); assert.equal(rolls,1);
        } finally { Math.random=random; }
    });
    test('Industrial investment survives turns and charges stated costs', (e,Q) => {
        Q.budget=10; const population=Q.petty_bourgeoisie, supporters=Q.capitalists_chp;
        action(e,'industrial_policy.industry1'); assert.equal(Q.budget,7);
        assert.equal(Q.industrial_production_index,110); assert.equal(Q.capitalists_chp,supporters+5);
        near(Q.petty_bourgeoisie,population,'demographic weight'); tick(e,Q); assert.equal(Q.industrial_production_index,110);
        action(e,'industrial_policy.elektronik'); assert.equal(Q.budget,5);
        action(e,'industrial_policy.koykentindustry'); assert.equal(Q.budget,4);
    });
    test('Economic and military modifier aliases reach production', (e,Q) => {
        const before=Q.industrial_production_index;
        action(e,'economic_policy.importban'); assert.equal(Q.industrial_production_index,before+3);
        tick(e,Q); assert.equal(Q.industrial_production_index,before+3);
        assert(!('industrial_production_index_modifier' in Q));
    });
    test('Labour inflation is retained when the sidebar prepares its display', (e,Q) => {
        const before=Q.inflation; action(e,'labor_affairs.national'); near(Q.inflation,before+0.5,'collective bargaining');
        action(e,'status'); near(Q.inflation,before+0.5,'sidebar must not erase inflation');
        const dp=Q.DP_relation,msp=Q.MSP_relation; action(e,'labor_affairs.kit');
        near(Q.DP_relation,dp-8,'DP relations'); near(Q.MSP_relation,msp-4,'MSP relations');
    });
    test('Structural economic policy survives monthly baseline refresh', (e,Q) => {
        Q.oil=2; e.goToScene('post_event'); near(Q.oil_inflation_effect,15,'oil benefit');
        for(let i=0;i<4;i++) tick(e,Q);
        near(Q.inflation,Q.base_inflation+Q.inflation_modifier-15,'persistent oil benefit');
        Q.year=1978; Q.Tiger=2; e.goToScene('post_event');
        for(let i=0;i<2;i++) tick(e,Q);
        near(Q.inflation,Q.base_inflation+Q.inflation_modifier-45,'Tiger and oil inflation');
        near(Q.economic_growth,Q.base_growth+Q.growth_modifier+3,'Tiger growth');
    });
    test('Cooldowns decrement once per month', (e,Q) => {
        action(e,'intrapartyinfluence'); assert.equal(Q.intraparty_timer,8);
        tick(e,Q); assert.equal(Q.intraparty_timer,8); tick(e,Q); assert.equal(Q.intraparty_timer,7);
        for(let i=0;i<16;i++) tick(e,Q); assert.equal(Q.intraparty_timer,0);
        Q.CHP_party_leader='Ecevit'; assert(e._runPredicate(game.scenes.intrapartyinfluence.viewIf,true));
    });
    test('Every cabinet formation clears the previous cabinet', (e,Q) => {
        Q.AP_in_government=1; Q.MSP_in_government=1; Q.TIP_in_government=1; Q.in_left_front=1;
        Q.education_minister_party='MSP'; Q.chp_seats=260; e.goToScene('national_elections.CHP_majority');
        assert.equal(Q.CHP_in_government,1); assert.equal(Q.AP_in_government,0); assert.equal(Q.MSP_in_government,0);
        assert.equal(Q.TIP_in_government,0); assert.equal(Q.in_left_front,0);
        assert(e._runPredicate(game.scenes['industrial_policy.kredi'].chooseIf,true));
        action(e,'vote_of_no_confidence.caretaker');
        for(const minister of ['foreign','interior','justice','labor','defense','economic','finance','agriculture','education','trade','industrial'])
            assert.equal(Q[minister+'_minister_party'],'I',minister);
        assert.equal(Q.prime_minister_party,'I'); assert.equal(Q.CHP_in_government,0);
    });
    test('Alternative coalition collapses clear ministries and align election clocks', (e,Q) => {
        Q.education_minister_party='CHP'; Q.TIP_in_government=1;
        Q.year=1974; Q.month=11; Q.next_election_time=Q.time+100;
        action(e,'coalition_affairs.bring_down2');
        assert.equal(Q.next_election_time-Q.time,6); assert.equal(Q.next_election_year,1975); assert.equal(Q.next_election_month,2);
        assert.equal(Q.education_minister_party,'I'); assert.equal(Q.TIP_in_government,0);
        Q.education_minister_party='CHP'; action(e,'coalition_affairs.bring_down');
        assert.equal(Q.education_minister_party,'I'); assert.equal(Q.AP_in_government,1);
    });
    test('Action gates use canonical economic, cabinet and leader fields', (e,Q) => {
        Q.economicreform=1; Q.inflation=10; Q.economic_growth=8; Q.unemployed=4;
        Q.west_relation=80; Q.cyprus_problem=2;
        assert(e._runPredicate(game.scenes['foreign_policy.aet'].chooseIf,true));
        Q.AP_in_government=1; assert(!e._runPredicate(game.scenes['foreign_policy.east'].chooseIf,true));
        Q.CHP_party_leader='Ecevit'; Q.dissent=0.5;
        assert(e._runPredicate(game.scenes.party_disunity.viewIf,true));
        Q.year=1974; Q.advisor_action_timer=3; assert(!e._runPredicate(game.scenes['avcioglu.devrim'].chooseIf,true));
    });
    test('Advisor education route reaches a working reform', (e,Q) => {
        Q.CHP_in_government=1; Q.education_minister_party='CHP'; Q.budget=10;
        e.goToScene('ustundag'); pick(e,'ustundag.ministry'); assert.equal(e.state.sceneId,'education_science.ed_menu');
        pick(e,'education_science.onetime'); pick(e,'education_science.curriculum');
        assert.equal(Q.curriculumm,1); assert.equal(Q.budget,8); assert.equal(Q.advisor_action_timer,3);
    });
    test('Avcioglu economy route reaches a working policy', (e,Q) => {
        Q.CHP_in_government=1; Q.economic_minister_party='CHP';
        e.goToScene('avcioglu'); pick(e,'avcioglu.economicpolicy'); assert.equal(e.state.sceneId,'economic_policy.economy_menu');
        const before=Q.inflation; pick(e,'economic_policy.short'); pick(e,'economic_policy.pricecontrols');
        near(Q.inflation,before-3,'price controls'); assert.equal(Q.economic_minister,'Avcıoğlu');
    });
    test('Aksoy records an AET application once', (e,Q) => {
        Q.CHP_in_government=1; Q.west_relation=90;
        e.goToScene('aksoy'); pick(e,'aksoy.AET'); assert.equal(Q.aet,1);
        Q.advisor_action_timer=0; e.goToScene('aksoy'); assert(!e.getCurrentChoices().some(choice=>choice.id==='aksoy.AET'));
    });
    test('Faction gains change congress seats and preserve quarter proportions', (e,Q) => {
        action(e,'status'); action(e,'status.the_party');
        const seats=Q.lk_congress_seats, strength=Q.left_kemalists_strength;
        const model=rules.factionModel(Q), ratio=model.effective(0,'lk')/model.effective(1,'lk');
        action(e,'gunes.theory'); action(e,'status'); action(e,'status.the_party');
        assert(Q.lk_congress_seats>seats); near(Q.left_kemalists_strength,strength+5,'five percentage points');
        const next=rules.factionModel(Q); near(next.effective(0,'lk')/next.effective(1,'lk'),ratio,'quarter proportions');
        assert.equal(['km','lk','ok','rk','tw'].reduce((sum,f)=>sum+Q[f+'_congress_seats'],0),1200);
    });
    test('Polling retains TIP preferences while elections preserve bans and partial transfer', (e,Q) => {
        Q.classes=['workers']; Q.parties=['chp','TIP','AP','other']; Q.workers=1;
        Q.workers_chp=40; Q.workers_TIP=20; Q.workers_AP=40; Q.workers_other=0;
        for(const [banned,endorsement,expectedCHP,expectedTIP] of [[0,0,40,20],[1,0,50,0],[1,1,100*50/90,0]]) {
            Q.TIP_banned=banned; Q.disk_endorsement=endorsement;
            const projection=rules.projectVotes(Q); near(projection.transfer,banned&&endorsement?10:0,'partial transfer');
            near(projection.fractions.chp*100,expectedCHP,'CHP vote'); near(projection.fractions.TIP*100,expectedTIP,'TIP vote');
            rules.refreshVotes(Q); action(e,'status.polls'); assert.equal(Q.TIP_poll_votes,20);assert.equal(Q.chp_poll_votes,40); const poll=[Q.chp_votes,Q.TIP_votes];
            action(e,'election_algorithm'); assert.deepEqual([Q.chp_votes,Q.TIP_votes],poll);
        }
    });
    test('Zero displays, deflation and minimum unemployment remain valid', (e,Q) => {
        Q.forex_pressure=0; Q.industrial_production_index=0; Q.agricultural_production_index=0; action(e,'status');
        assert.equal(Q.forex_pressure_formatted,'0.0'); assert.equal(Q.industrial_index_formatted,'0.0'); assert.equal(Q.agricultural_index_formatted,'0.0');
        Q.inflation_score=-6; Q.base_inflation=-1; Q.inflation_modifier=0; Q.base_unemployment=-5; Q.apply_economy_effects=0;
        action(e,'economy_health_calculator'); assert.equal(Q.inflation_score,-1); assert.equal(Q.unemployed,0.5);
        Q.agriculture_modifier=-1000; action(e,'modify_production_indices'); assert(Number.isFinite(Q.agricultural_product_prices));
    });
    test('Cyprus suppresses domestic turn consumption and the domestic event pool', (e,Q) => {
        Q.year=1974; Q.month=7; Q.week=2;
        e.goToScene('kibrisdarbe');
        const before=[Q.time,Q.year,Q.month,Q.week,Q.economic_records.length];
        Q.month_actions=1;
        e.goToScene('post_event');
        assert.deepEqual([Q.time,Q.year,Q.month,Q.week,Q.economic_records.length],before);
        assert.equal(Q.month_actions,0); assert.equal(Q.has_event,0);
        assert(['main','main.main_easy'].includes(e.state.sceneId));
        for(const id of ['meetingopposition','cyprusintro','ayse','plane']) {
            assert.notEqual(game.scenes[id].title,'The Democratic Party');
            assert(!String(game.scenes[id].subtitle).includes('periphary'));
        }
        e.goToScene('cyprus_briefing_15'); pick(e,'cyprus_briefing_15.continue');
        Q.month=9;Q.week=2;
        const time=Q.time;
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/game.js'),'utf8'));
        window.cyprusAdvanceDay();
        assert.equal(Q.time,time);
        assert.deepEqual([Q.year,Q.month,Q.week,Q.cyprus_day],[1974,7,2,16]);
    });
    test('Pre-operation days advance after the final passage and London follows the earlier briefing', (e,Q) => {
        Q.year=1974;Q.month=7;Q.week=2;Q.flavour_events=0;e.goToScene('kibrisdarbe');
        const time=Q.time,score=Q.cyprus_atilla1_score;
        pick(e,'kibrisdarbe.root');assert.equal(e.state.sceneId,'cyprus_briefing_15');
        pick(e,'cyprus_briefing_15.continue');assert.equal(Q.cyprus_day,16);assert.equal(e.state.sceneId,'meetingopposition');
        pick(e,'meetingopposition.root');assert.equal(Q.cyprus_day,16);assert.equal(e.state.sceneId,'cyprus_briefing_16');
        pick(e,'cyprus_briefing_16.continue');assert.equal(Q.cyprus_day,17);assert.equal(e.state.sceneId,'cyprusintro');
        pick(e,'cyprusintro.a');pick(e,'cyprusintro.b');assert.equal(Q.cyprus_day,17);
        pick(e,'cyprusintro.root');assert.equal(e.state.sceneId,'cyprus_briefing_17');assert.equal(Q.cyprus_day,17);
        for(let day=17;day<20;day++){pick(e,'cyprus_briefing_'+day+'.continue');assert.equal(Q.cyprus_day,day+1);assert.equal(e.state.sceneId,'cyprus_briefing_'+(day+1));}
        pick(e,'cyprus_briefing_20.continue');assert.equal(Q.cyprus_day,20);assert.equal(e.state.sceneId,'cyprus_atilla1_20');
        assert.equal(Q.time,time);assert.equal(Q.cyprus_atilla1_score,score);assert.deepEqual(Q.cyprus_briefings_seen,[15,16,17,18,19,20]);
        assert(!rules.cyprusAtilla1.finishBriefingDay(Q,19));
    });
    test('Cyprus daily calendar reaches the existing exit without an extra turn', (e,Q) => {
        Q.year=1974; Q.month=7; Q.week=2; Q.flavour_events=0; e.goToScene('kibrisdarbe');
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/game.js'),'utf8'));
        Q.cyprus_briefings_seen=[15,16,17,18,19,20]; // This scenario isolates calendar progression.
        const time=Q.time;
        for(let i=0;i<100 && !Q.cyprus_end_shown;i++) {
            const c=rules.cyprusAtilla1, history=c.historyScene(Q);
            if(history) {e.goToScene(history);pick(e,history+'.historical');pick(e,'cyprus_support_return');}
            else if(c.endingReady(Q)) {e.goToScene('cyprus_atilla1_ending');pick(e,'cyprus_atilla1_ending.root');}
            else if(Q.cyprus_month===7 && Q.cyprus_day>=20 && Q.cyprus_day<=24) {
                e.goToScene('cyprus_atilla1_'+Q.cyprus_day);pick(e,'cyprus_atilla1_'+Q.cyprus_day+'.historical');
            } else window.cyprusAdvanceDay();
        }
        assert.equal(Q.cyprus_date_display,'September 1, 1974'); assert.deepEqual([Q.year,Q.month,Q.week],[1974,9,1]);
        assert.equal(Q.time-time,3); assert.equal(e.state.sceneId,'kibrisson');
        const endTime=Q.time; pick(e,'kibrisson.root'); e.goToScene('post_event');
        assert.equal(Q.cyprus_mode,0); assert.equal(Q.time,endTime);
    });
    test('Cyprus date events respect flavour settings and calendar covers October', (e,Q) => {
        Q.year=1974; Q.month=7; Q.week=2; Q.flavour_events=0; e.goToScene('kibrisdarbe');
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/game.js'),'utf8'));
        Q.cyprus_day=23; window.cyprusAdvanceDay(); assert.notEqual(e.state.sceneId,'plane');
        Q.cyprus_day=31; Q.cyprus_month=10; Q.cyprus_year=1974; Q.year=1974; Q.month=10; Q.week=2;
        window.cyprusAdvanceDay(); assert.deepEqual([Q.cyprus_year,Q.cyprus_month,Q.cyprus_day],[1974,11,1]);
    });
    test('Military Resource starting pool and daily supply use all three branch strengths', (e,Q) => {
        const c=rules.cyprusAtilla1;
        for(const [strength,initial,daily] of [[0,8,0],[0.1,11,1],[0.2,22,2],[0.4,25,3],[0.5,29,4],[0.6,44,9],[0.8,54,12],[1,54,12]]) {
            Q.army_land_strength=Q.army_naval_strength=Q.army_aerial_strength=strength;
            assert.equal(c.startingResources(Q),initial); assert.equal(c.dailyResources(Q),daily);
        }
        Q.army_land_strength=1;Q.army_naval_strength=0;Q.army_aerial_strength=0.5;
        Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');
        assert.equal(Q.military_strength,29);assert.equal(Q.cyprus_support_bonus,0);
        const old=Q.military_strength;c.advanceDate(Q);assert.equal(Q.military_strength,old+4);
        delete Q.cyprus_resources_initialized;delete Q.cyprus_support_used;delete Q.cyprus_support_bonus;
        Q.military_strength=9;c.ensureSupport(Q);assert.equal(Q.military_strength,9);assert.deepEqual(Q.cyprus_support_used,{});
    });
    test('Support actions retain three-day cooldowns and cannot award leverage', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.army_land_strength=Q.army_naval_strength=Q.army_aerial_strength=.6;
        Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;Q.military_strength=100;
        const time=Q.time,leverage=Q.leverage_points;
        for(const key of Object.keys(c.supportActions)) {
            Q.cyprus_support_bonus=0;
            assert(c.useSupport(Q,key,'kyrenia'));
            const after=Q.military_strength;
            for(const district of c.districts)assert(!c.useSupport(Q,key,district));
            assert.equal(Q.military_strength,after);assert.equal(c.cooldown(Q,key),3);
        }
        assert.equal(Q.cyprus_day,20);assert.equal(Q.time,time);assert.equal(Q.leverage_points,leverage);
        Q.cyprus_day=22;Q.cyprus_support_bonus=0;assert(!c.useSupport(Q,'reinforce','nicosia'));
        Q.cyprus_day=23;assert(c.useSupport(Q,'reinforce','nicosia'));assert.equal(c.cooldown(Q,'reinforce'),3);
        assert(!c.useSupport(Q,'strike','akrotiri'));assert(!c.useSupport(Q,'strike','dhekelia'));
        assert(!c.useSupport(Q,'__proto__','nicosia'));
    });
    test('Military support stays locked through the July 20 source reading and unlocks on the first operation event', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');
        for(let day=15;day<=20;day++) {Q.cyprus_day=day;const before=Q.military_strength;assert(!c.operationStarted(Q));assert(!c.useSupport(Q,'reinforce','turkish'));assert.equal(Q.military_strength,before);}
        e.goToScene('cyprus_atilla1_20');assert(c.operationStarted(Q));assert(c.useSupport(Q,'reinforce','turkish'));
        Q.cyprus_day=19;assert(!c.operationStarted(Q));
        delete Q.cyprus_operation_started;Q.cyprus_day=21;assert(c.operationStarted(Q));
    });
    test('Turkish and Greek support actions reject the other side before spending', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;Q.military_strength=200;
        for(const [key,action] of Object.entries(c.supportActions)){
            Q.cyprus_support_bonus=0;const before=Q.military_strength;
            assert(!c.useSupport(Q,key,action.side==='turkish'?'greek':'turkish'));assert.equal(Q.military_strength,before);
            assert(c.useSupport(Q,key,action.side));assert.equal(Q.military_strength,before-action.cost);
            assert.equal(Q.cyprus_support_bonus,action.bonus);assert.equal(c.cooldown(Q,key),3);
        }
    });
    test('Tier budgets meet the July 25 spending targets without breaking daily cap or cooldowns', () => {
        const c=rules.cyprusAtilla1;
        const cheap=Object.keys(c.supportActions).filter(k=>c.supportActions[k].cost===4),expensive=Object.keys(c.supportActions).filter(k=>c.supportActions[k].cost===7);
        const groups=[0,1,2].map(i=>[cheap[i*2],cheap[i*2+1],expensive[i*2],expensive[i*2+1]]);
        function start(strength){const Q={cyprus_mode:1,cyprus_year:1974,cyprus_month:7,cyprus_day:15,year:1974,month:7,week:2,army_land_strength:strength,army_naval_strength:strength,army_aerial_strength:strength};c.initialize(Q);c.initializeSupport(Q);while(Q.cyprus_day<20)c.advanceDate(Q);Q.cyprus_operation_started=1;return Q;}
        function spend(Q,keys){for(const k of keys)assert(c.useSupport(Q,k,c.supportActions[k].side),k+': '+c.supportUnavailable(Q,k,c.supportActions[k].side));}
        function next(Q){assert(c.resolve(Q,Q.cyprus_day,'historical',()=>0));assert.equal(Q.cyprus_support_bonus,0);}
        for(const [strength,remainder] of [[.6,2],[.8,42]]){
            const Q=start(strength);for(let day=20;day<=25;day++){spend(Q,groups[(day-20)%3]);assert.equal(Q.cyprus_support_bonus,10);if(day<25)next(Q);}
            assert.equal(Q.military_strength,remainder);assert.equal(Object.values(Q.cyprus_support_early_counts).reduce((a,b)=>a+b,0),24);
            for(const key of Object.keys(c.supportActions))assert.equal(Q.cyprus_support_early_counts[key],2);
        }
        const S=start(.5);spend(S,groups[0]);next(S);spend(S,groups[1]);next(S);spend(S,groups[2].slice(0,2));next(S);next(S);next(S);spend(S,groups[2].slice(2));assert.equal(S.military_strength,3);assert(!c.useSupport(S,cheap[0],'turkish'));
        const A=start(.4);spend(A,groups[0]);next(A);spend(A,groups[1].slice(0,2));next(A);spend(A,groups[1].slice(2));next(A);next(A);next(A);assert.equal(A.military_strength,11);assert(c.supportUnavailable(A,cheap[0],'turkish').includes('once'));
        for(const [strength,limit] of [[.1,3],[.2,6]]){
            const Q=start(strength);spend(Q,cheap.slice(0,Math.min(5,limit)));next(Q);if(limit===6)spend(Q,[cheap[5]]);while(Q.cyprus_day<25)next(Q);
            const before=Q.military_strength;assert(!c.useSupport(Q,expensive[0],c.supportActions[expensive[0]].side));assert.equal(Q.military_strength,before);assert(c.supportUnavailable(Q,expensive[0],c.supportActions[expensive[0]].side).includes('action limit'));
            const restored=JSON.parse(JSON.stringify(Q));c.ensureSupport(restored);assert.equal(Object.values(restored.cyprus_support_early_counts).reduce((a,b)=>a+b,0),limit);
            Q.cyprus_day=26;Q.military_strength=100;assert(c.useSupport(Q,expensive[0],c.supportActions[expensive[0]].side));
        }
    });
    test('Support costs, insufficient funds and the +10 stack limit are enforced before spending', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;
        Q.military_strength=3;assert(!c.useSupport(Q,'reinforce','paphos'));assert.equal(Q.military_strength,3);
        Q.military_strength=30;
        assert(c.useSupport(Q,'smuggle','paphos'));assert.equal(Q.military_strength,23);assert.equal(Q.cyprus_support_bonus,3);
        assert(c.useSupport(Q,'paratrooper','limassol'));assert.equal(Q.military_strength,16);assert.equal(Q.cyprus_support_bonus,6);
        assert(c.useSupport(Q,'bombard','famagusta'));assert.equal(Q.military_strength,12);assert.equal(Q.cyprus_support_bonus,8);
        assert(!c.useSupport(Q,'blockade','famagusta'));assert.equal(Q.military_strength,12);
        assert(c.useSupport(Q,'strike','famagusta'));assert.equal(Q.cyprus_support_bonus,10);assert.equal(Q.military_strength,8);
        assert(!c.useSupport(Q,'naval_supply','turkish'));assert.equal(Q.military_strength,8);
        Q.cyprus_month=8;Q.cyprus_day=14;Q.cyprus_support_bonus=0;assert(!c.useSupport(Q,'bombard','famagusta'));
    });
    test('Next-roll support is consumed once, survives saves, and respects the 80-point ceiling', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;
        Q.army_land_strength=Q.army_aerial_strength=Q.army_naval_strength=0;
        assert(c.useSupport(Q,'reinforce','larnaca'));
        const saved=JSON.parse(JSON.stringify(e.getExportableState()));e.setState(saved);Q=e.state.qualities;
        assert.equal(Q.cyprus_support_bonus,2);assert.equal(c.cooldown(Q,'reinforce'),3);
        assert(c.resolve(Q,20,'historical',()=>0));assert.equal(Q.cyprus_atilla1_results[0].baseScore,0);
        assert.equal(Q.cyprus_atilla1_results[0].supportBonus,2);assert.equal(Q.cyprus_atilla1_results[0].score,2);
        assert.equal(Q.cyprus_support_bonus,0);assert(!c.resolve(Q,20,'historical',()=>0));
        Q.cyprus_support_bonus=6;Q.army_land_strength=Q.army_aerial_strength=Q.army_naval_strength=1;
        assert(c.resolve(Q,21,'historical',()=>1));assert.equal(Q.cyprus_atilla1_results[1].score,80);assert.equal(Q.cyprus_support_bonus,0);
    });
    test('Atilla I tier and inclusive roll boundaries follow the agreed rules', () => {
        const cyprus=rules.cyprusAtilla1;
        for(const [value,tier] of [[0,0],[0.199,0],[0.2,1],[0.399,1],[0.4,2],[0.599,2],[0.6,3],[0.799,3],[0.8,4],[1,4]]) {
            assert.equal(cyprus.militaryTier({army_land_strength:value,army_aerial_strength:value,army_naval_strength:value}),tier);
        }
        for(let tier=0;tier<5;tier++) for(let requirement=1;requirement<4;requirement++) {
            const below=tier<requirement, bonus=Math.max(0,tier-requirement)*5;
            assert.equal(cyprus.roll(tier,requirement,()=>0),below?0:Math.min(80,50+bonus));
            assert.equal(cyprus.roll(tier,requirement,()=>1),below?60:80);
        }
        for(const [score,index] of [[0,0],[19,0],[20,1],[39,1],[40,2],[59,2],[60,3],[80,3]]) assert.equal(cyprus.resultIndex(score),index);
    });
    test('All eleven decisions expose four results and advance exactly one day', () => {
        const cyprus=rules.cyprusAtilla1;
        for(const day of [20,21,22,23,24]) for(const option of Object.keys(cyprus.days[day].actions)) for(let result=0;result<4;result++) {
            const e=fresh(), Q=e.state.qualities;
            Q.year=1974;Q.month=7;Q.week=2;Q.flavour_events=0;e.goToScene('kibrisdarbe');
            Q.cyprus_day=20;Q.cyprus_operation_started=1;Q.army_land_strength=Q.army_naval_strength=Q.army_aerial_strength=0;
            for(let prior=20;prior<day;prior++) assert(cyprus.resolve(Q,prior,'alternative',()=>0));
            e.goToScene('cyprus_atilla1_'+day);e.random.random=()=>result*20/61;
            const before=Q.time;
            pick(e,'cyprus_atilla1_'+day+'.'+option);
            assert.equal(Q.cyprus_atilla1_last_outcome,cyprus.outcomes[result]);
            assert.equal(Q.cyprus_atilla1_results.at(-1).score,result*20);
            assert.equal(Q.cyprus_day,day+1);assert.equal(Q.time,before);
            assert(Q.cyprus_atilla1_last_text.length>30);
            const score=Q.cyprus_atilla1_score, leverage=Q.leverage_points;
            let rerolls=0;assert.equal(cyprus.resolve(Q,day,option,()=>{rerolls++;return 1;}),false);
            e.goToScene('cyprus_atilla1_'+day+'.'+option);
            assert.equal(Q.cyprus_atilla1_score,score);assert.equal(Q.leverage_points,leverage);assert.equal(rerolls,0);
            pick(e,'cyprus_atilla1_continue');
            assert.equal(e.state.sceneId,day===24?'cyprus_history_july25':'cyprus_atilla1_'+(day+1));
        }
    });
    test('Atilla I preserves junction and defensive branches through the merge', () => {
        const cyprus=rules.cyprusAtilla1;
        for(const earlyJunction of [false,true]) for(const halt of [false,true]) {
            const Q={cyprus_mode:1,cyprus_year:1974,cyprus_month:7,cyprus_day:20,army_land_strength:0,army_naval_strength:0,army_aerial_strength:0};
            cyprus.initialize(Q);cyprus.resolve(Q,20,'historical',()=>1);
            cyprus.resolve(Q,21,earlyJunction?'historical':'alternative',()=>1);
            assert.equal(Q.cyprus_atilla1_junction,earlyJunction?1:0);
            assert(cyprus.briefing(Q,22).includes('The General Staff was very pleased')); // Historical evidence remains fixed; the actual junction is tracked separately.
            cyprus.resolve(Q,22,halt?'alternative':'historical',()=>1);
            assert.equal(Q.cyprus_atilla1_junction,earlyJunction||!halt?1:0);
            cyprus.resolve(Q,23,'historical',()=>1);
            assert(Q.cyprus_atilla1_last_text.includes(halt?'severely depleted':'broader defensive perimeter'));
            if(halt) assert(!Q.cyprus_atilla1_frontline.includes('perimeter gained'));
            cyprus.resolve(Q,24,'alternative',()=>1);
            assert.equal(Q.cyprus_atilla1_score,300);assert.equal(Q.cyprus_atilla1_reward,0);
            for(const key of ['july25','july26','july2728','july2930']) {Q.cyprus_day=cyprus.historyEvents[key].day;assert(cyprus.resolveHistory(Q,key,'historical',()=>1));}
            assert.equal(Q.cyprus_atilla1_score,540);assert.equal(Q.cyprus_atilla1_reward,4);
            assert.equal(Q.cyprus_atilla1_junction,earlyJunction||!halt?1:0);
        }
    });
    test('Supplied frontline map stages follow the Cyprus date without changing gameplay state', () => {
        const c=rules.cyprusAtilla1;
        for(const [month,day,name] of [[7,15,'cyprus_map'],[7,19,'cyprus_map'],...Array.from({length:7},(_,i)=>[7,20+i,'frontlines/july-'+(20+i)]),[7,27,'frontlines/july-27-28'],[7,28,'frontlines/july-27-28'],[7,29,'frontlines/july-27-28'],[7,30,'frontlines/july-30-31'],[7,31,'frontlines/july-30-31'],[8,1,'frontlines/august-1'],[8,13,'frontlines/august-1']]) {
            const Q={cyprus_mode:1,cyprus_year:1974,cyprus_month:month,cyprus_day:day,cyprus_target_district:'kyrenia',cyprus_support_bonus:2};
            const saved=JSON.stringify(Q);assert.equal(c.mapImage(Q),'cyprusgame/'+name+'.png');assert.equal(JSON.stringify(Q),saved);
            assert(fs.existsSync(path.join(root,'out/html',c.mapImage(Q))));
        }
        assert.equal(c.mapImage({cyprus_mode:0}),'cyprusgame/cyprus_map.png');
    });
    test('Military tooltips match requirements and descriptions match authored or attributed passages', () => {
        const c=rules.cyprusAtilla1, passages=JSON.parse(fs.readFileSync(path.join(root,'CYPRUS_MILITARY_SOURCE_PASSAGES.json'),'utf8'));
        let count=0;
        for(const [key,parts] of Object.entries(passages)) {
            const id=key==='ending'?'cyprus_atilla1_ending':/^\d+$/.test(key)?'cyprus_atilla1_'+key:'cyprus_history_'+key;
            const source=fs.readFileSync(path.join(root,'source/scenes/events',id+'.scene.dry'),'utf8').replace(/\r\n/g,'\n');
            const authored=JSON.parse(fs.readFileSync(path.join(root,'CYPRUS_AUTHORED_TEXTS.json'),'utf8')).events[key];
            if(authored){for(const paragraph of authored.body.split('\n\n'))assert(source.includes(paragraph),id+' authored paragraph');}
            for(const part of authored?[]:parts) {
                for(const paragraph of key==='ending'?part.text.split('\n\n'):[part.kind==='quotation'?part.text.replace(/\n\n/g,' … '):part.text])assert(source.includes(paragraph),id);
                assert(part.kind==='quotation'?source.includes(part.document):source.includes('PDF page '+part.pdf_page),id);
            }
            if(key==='ending')continue;
            const actions=/^\d+$/.test(key)?c.days[Number(key)].actions:c.historyEvents[key].actions;
            for(const [action,record] of Object.entries(actions)) {
                const tooltip=c.choiceTooltip(id+'.'+action);
                assert(tooltip.includes(action==='historical'?'This is the historical choice.':'This is an alternative choice.'));
                assert(tooltip.includes(['critical','outdated','adequate','good','excellent'][record.requirement]+' state.'));
                assert(tooltip.includes('average land, naval and aerial strength'));
                assert(!/^(Historical|Historical course|Alternative):/.test(record.label));count++;
            }
        }
        assert.equal(count,25);assert.equal(c.choiceTooltip('campaigning.workers'),'');assert.equal(c.choiceTooltip('cyprus_history_missing.historical'),'');
    });
    test('Expanded endings cover 359/360/539/540/720 and pay only at the July 30 ending', () => {
        const c=rules.cyprusAtilla1;
        for(const [total,ending,reward] of [[359,'Failure',0],[360,'Successful',2],[539,'Successful',2],[540,'Massive',4],[720,'Massive',4]]) {
            const Q={cyprus_mode:1,cyprus_year:1974,cyprus_month:7,cyprus_day:20,leverage_points:7,army_land_strength:0,army_naval_strength:0,army_aerial_strength:0};
            c.initialize(Q);const scores=Array(9).fill(total===720?80:total>=539?60:40);scores[8]=total-scores.slice(0,8).reduce((a,b)=>a+b,0);
            for(let i=0;i<9;i++) {
                const score=scores[i];Q.army_land_strength=Q.army_naval_strength=Q.army_aerial_strength=score>60?1:0;
                if(i<5) {assert(c.resolve(Q,20+i,'historical',()=>score>60?1:score/61));assert.equal(c.awardEnding(Q),false);}
                else {const key=['july25','july26','july2728','july2930'][i-5];Q.cyprus_day=c.historyEvents[key].day;assert(c.resolveHistory(Q,key,'historical',()=>score>60?1:score/61));}
                assert.equal(Q.leverage_points,7);
            }
            assert.equal(Q.cyprus_atilla1_score,total);assert.equal(Q.cyprus_atilla1_max_score,720);assert.equal(Q.cyprus_atilla1_ending,ending);
            assert.equal(Q.cyprus_atilla1_reward,reward);assert.equal(Q.cyprus_day,30);assert(c.awardEnding(Q));assert.equal(Q.leverage_points,7+reward);
            assert.equal(c.awardEnding(Q),false);assert.equal(Q.leverage_points,7+reward);assert(c.continueEnding(Q));assert.equal(Q.cyprus_day,31);
            assert(c.continueEnding(Q));assert.equal(Q.cyprus_day,31);
        }
    });
    test('All fourteen late decisions expose four outcomes and resolve once on the scheduled date', () => {
        const c=rules.cyprusAtilla1;
        for(const [key,event] of Object.entries(c.historyEvents)) for(const action of Object.keys(event.actions)) for(let result=0;result<4;result++) {
            const e=fresh(),Q=e.state.qualities;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');
            Q.cyprus_day=event.day;Q.cyprus_month=event.month;Q.army_land_strength=Q.army_naval_strength=Q.army_aerial_strength=0;
            e.goToScene('cyprus_history_'+key);e.random.random=()=>result*20/61;
            pick(e,'cyprus_history_'+key+'.'+action);
            assert.equal(Q.cyprus_history_last_outcome,c.outcomes[result]);assert.equal(Q.cyprus_history_last_text,event.actions[action].text[result]);
            const records=event.stage==='atilla1'?Q.cyprus_atilla1_results:Q.cyprus_post_atilla1_results;
            assert.equal(records.at(-1).score,result*20);assert.equal(Q.cyprus_day,key==='july2930'?30:new Date(Date.UTC(1974,event.month-1,event.day+1)).getUTCDate());
            assert(Q.cyprus_history_seen.includes(key));const before=JSON.stringify(e.getExportableState());
            let rerolls=0;assert.equal(c.resolveHistory(Q,key,action,()=>{rerolls++;return 1;}),false);
            assert.equal(rerolls,0);assert.equal(JSON.stringify(e.getExportableState()),before);
        }
    });
    test('Later rolls keep the July 30 assessment fixed and support survives a saved report choice', (e,Q) => {
        const c=rules.cyprusAtilla1;Q.year=1974;Q.month=7;Q.week=2;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;
        for(let d=20;d<=24;d++)assert(c.resolve(Q,d,'historical',()=>1));
        for(const key of ['july25','july26','july2728','july2930']) {Q.cyprus_day=c.historyEvents[key].day;assert(c.resolveHistory(Q,key,'historical',()=>1));}
        assert(c.awardEnding(Q));assert(c.continueEnding(Q));const ending=[Q.cyprus_atilla1_score,Q.cyprus_atilla1_ending,Q.leverage_points];
        for(const key of ['july31','august1','august213']) {
            const event=c.historyEvents[key];Q.cyprus_month=event.month;Q.cyprus_day=event.day;Q.military_strength=30;
            assert(c.useSupport(Q,key==='july31'?'reinforce':key==='august1'?'strike':'bombard','nicosia'));
            e.goToScene('cyprus_history_'+key);const saved=JSON.parse(JSON.stringify(e.getExportableState()));
            pick(e,'cyprus_history_'+key+'.alternative');const first=JSON.stringify(e.state.qualities.cyprus_post_atilla1_results.at(-1));
            e.setState(saved);pick(e,'cyprus_history_'+key+'.alternative');Q=e.state.qualities;
            assert.equal(JSON.stringify(Q.cyprus_post_atilla1_results.at(-1)),first);
            assert.equal(Q.cyprus_post_atilla1_results.at(-1).supportBonus,2);assert.equal(Q.cyprus_support_bonus,0);
            assert.deepEqual([Q.cyprus_atilla1_score,Q.cyprus_atilla1_ending,Q.leverage_points],ending);
        }
        assert.equal(Q.cyprus_post_atilla1_results.length,3);assert.equal(Q.cyprus_post_atilla1_max_score,240);assert.equal(Q.cyprus_day,14);
    });
    test('Older completed five-day saves extend active chapters without double-paying leverage', () => {
        const c=rules.cyprusAtilla1,Q={cyprus_mode:1,cyprus_year:1974,cyprus_month:7,cyprus_day:25,leverage_points:9,army_land_strength:1,army_naval_strength:1,army_aerial_strength:1};
        c.initialize(Q);delete Q.cyprus_extended_version;
        Q.cyprus_atilla1_results=Array.from({length:5},(_,i)=>({day:20+i,score:60}));Q.cyprus_atilla1_score=300;
        Q.cyprus_atilla1_complete=1;Q.cyprus_atilla1_ending_seen=1;Q.cyprus_atilla1_reward=2;
        for(const key of ['july25','july26','july2728','july2930']) {Q.cyprus_day=c.historyEvents[key].day;assert(c.resolveHistory(Q,key,'historical',()=>1));}
        assert.equal(Q.cyprus_atilla1_ending_seen,0);assert.equal(Q.cyprus_atilla1_reward,4);
        assert(c.awardEnding(Q));assert.equal(Q.leverage_points,11);assert(!c.awardEnding(Q));assert.equal(Q.leverage_points,11);
    });
    test('Atilla I decisions survive save/restore and cannot be skipped', (e,Q) => {
        Q.year=1974;Q.month=7;Q.week=2;Q.flavour_events=0;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;Q.cyprus_briefings_seen=[15,16,17,18,19,20];
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/game.js'),'utf8'));
        window.cyprusAdvanceDay();assert.equal(Q.cyprus_day,20);assert.equal(e.state.sceneId,'cyprus_atilla1_20');
        const before=JSON.parse(JSON.stringify(e.getExportableState()));
        pick(e,'cyprus_atilla1_20.alternative');const first=Q.cyprus_atilla1_results[0];
        const after=JSON.parse(JSON.stringify(e.getExportableState()));
        e.setState(before);pick(e,'cyprus_atilla1_20.alternative');assert.deepEqual(e.state.qualities.cyprus_atilla1_results[0],first);
        e.setState(after);assert.equal(e.state.qualities.cyprus_day,21);assert.deepEqual(e.state.qualities.cyprus_atilla1_results[0],first);
        window.cyprusAdvanceDay();assert.equal(e.state.qualities.cyprus_day,21);assert.equal(e.state.sceneId,'cyprus_atilla1_21');
    });
    test('Atilla I preserves optional stories before the next daily decision', (e,Q) => {
        Q.year=1974;Q.month=7;Q.week=2;Q.flavour_events=1;e.goToScene('kibrisdarbe');Q.cyprus_day=20;Q.cyprus_operation_started=1;Q.cyprus_briefings_seen=[15,16,17,18,19,20];
        e.goToScene('cyprus_atilla1_20');pick(e,'cyprus_atilla1_20.historical');pick(e,'cyprus_atilla1_continue');
        assert.equal(e.state.sceneId,'ayse');pick(e,'ayse.root');assert.equal(e.state.sceneId,'cyprus_atilla1_21');
        pick(e,'cyprus_atilla1_21.alternative');pick(e,'cyprus_atilla1_continue');
        pick(e,'cyprus_atilla1_22.alternative');pick(e,'cyprus_atilla1_continue');
        pick(e,'cyprus_atilla1_23.alternative');pick(e,'cyprus_atilla1_continue');
        assert.equal(e.state.sceneId,'plane');pick(e,'plane.root');assert.equal(e.state.sceneId,'cyprus_atilla1_24');
    });
    test('Eight years of controlled half-month updates remain finite', (e,Q) => {
        for(let i=0;i<192;i++) { tick(e,Q); numeric(Q); }
        assert.deepEqual([Q.year,Q.month],[1980,1]);
    });
    test('Cyprus return restores the normal panel and a chart with a whitespace placeholder', (e,Q) => {
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/game.js'),'utf8'));
        window.statusTabRight='status.cyprus'; Q.cyprus_mode=0;
        window.updateSidebar=window.updatePartySidebar=window.setupCyprusMapClicks=window.updateTitleScreenImages=noop;
        window.onDisplayContent(); assert.equal(window.statusTabRight,'status.the_party');
        Q.started=0; let uninitializedRenders=0;
        window.updateSidebar=window.updatePartySidebar=()=>{uninitializedRenders++;};
        window.onDisplayContent(); assert.equal(uninitializedRenders,0,'title screen must not render hidden game panels');
        Q.started=1;
        const lookup=document.getElementById;
        const svg={parentElement:{offsetWidth:600}, firstElementChild:null, innerHTML:' ', hasChildNodes:()=>true};
        document.getElementById=id=>id==='party-parliament'?svg:node;
        try {
            window.partyParliamentData=[{id:'lk',seats:1200,color:'red',outline:'black'}];
            window._lastParliamentDataKey='600:'+JSON.stringify(window.partyParliamentData);
            window._cachedParliamentSVGContent='<circle></circle>';
            window.renderPartyParliament(); assert.equal(svg.innerHTML,'<circle></circle>');
            svg.firstElementChild={}; svg.innerHTML='existing chart';
            window.renderPartyParliament(); assert.equal(svg.innerHTML,'existing chart');
        } finally {document.getElementById=lookup;}
    });
    test('State checker catches unknown names and ignores comments and text', () => {
        const uses=new Map(check.stateKeys('// Q.ignore_me\nQ.AP_in_goverment = 1; Q["TIP_relation"] += 2; const label="Q.text";').map(key=>[key,new Set()]));
        assert.deepEqual(check.unknownKeys(uses,new Set(['TIP_relation'])),['AP_in_goverment']);
    });
    test('History chart uses actual data dates and accepts empty records', () => {
        let domain, calls=0;
        const chain=new Proxy({}, {get:()=>()=>chain});
        const line=()=>{const fn=()=>'';fn.x=fn.y=()=>fn;return fn;};
        global.d3={select:()=>chain,selectAll:()=>chain,max:(data,fn)=>data.reduce((a,b)=>a===undefined||(fn?fn(b):b)>(fn?fn(a):a)?b:a,undefined),
            min:data=>data.reduce((a,b)=>a===undefined||b<a?b:a,undefined),scaleUtc:(dates)=>{domain=dates;calls++;return ()=>0;},
            scaleLinear:()=>()=>0,axisBottom:()=>chain,axisLeft:()=>chain,timeFormat:()=>noop,line,scaleOrdinal:()=>noop,schemeCategory10:[]};
        vm.runInThisContext(fs.readFileSync(path.join(root,'out/html/d3-linegraph.js'),'utf8'));
        const chart=d3.linegraph(false,true,['chp'],{chp:'red'},{chp:'CHP'},100,0,1);
        chart({each:callback=>callback.call({},[])}); assert.equal(calls,0);
        chart({each:callback=>callback.call({},[{date:'1973-10-01',chp:30},{date:'1969-10-01',chp:20}])});
        assert.equal(domain[0].getFullYear(),1969); assert.equal(domain[1].getFullYear(),1973);
        global.d3=null;
    });
    test('Three swappable members are allowed independently of leader and secretary', (e,Q) => {
        assert.equal(Q.n_advisors,2);
        assert(e._runPredicate(game.scenes['shuffle_leadership.add_isik'].viewIf,true));
        e.goToScene('shuffle_leadership.add_isik');
        assert.equal(Q.n_advisors,3);assert.equal(Q.isik_advisor,1);
        assert(!e._runPredicate(game.scenes['shuffle_leadership.add_erdem'].viewIf,true));
        assert(!e._runPredicate(game.scenes['shuffle_leadership.add_advisors'].chooseIf,true));
        assert.equal(Q.inonu_advisor,1);assert.equal(Q.kirikoglu_advisor,1);
        e.goToScene('shuffle_leadership.remove_isik');
        assert.equal(Q.n_advisors,2);
        assert(e._runPredicate(game.scenes['shuffle_leadership.add_erdem'].viewIf,true));
    });
    test('Reshuffle is always pinned in both difficulties regardless of cooldown or party leader', (e,Q) => {
        const pinned=game.scenes.shuffle_leadership_pinned;
        for(const difficulty of [-1,0])for(const leader of ['İnönü','Ecevit']) {
            Q.difficulty=difficulty;Q.CHP_party_leader=leader;Q.shuffle_leadership_timer=8;
            assert(e._runPredicate(pinned.viewIf,true));
            e.goToScene('shuffle_leadership_pinned');
            assert.equal(Q.shuffle_leadership_timer,0);
            assert.equal(e.state.sceneId,'shuffle_leadership.rm_main');
            assert(e._runPredicate(pinned.viewIf,true));
        }
        assert(!e._runPredicate(game.scenes.shuffle_leadership.viewIf,true),'No duplicate card in the party deck');
    });
    test('GP and MNP names change only at their respective formation events', (e,Q) => {
        assert.equal(Q.CGP_name,'GP');assert.equal(Q.MSP_name,'MNP');
        e.goToScene('rightkemalistsplit');assert.equal(Q.CGP_name,'GP');
        e.goToScene('cgpformation');assert.equal(Q.CGP_name,'CGP');assert.equal(Q.MSP_name,'MNP');
        e.goToScene('msp_formation');assert.equal(Q.MSP_name,'MSP');
        const old={CGP_name:'CGP',year:1972};rules.refreshPartyNames(old,{});assert.equal(old.CGP_name,'GP');assert.equal(old.MSP_name,'MNP');
        const later={};rules.refreshPartyNames(later,{cgpformation:1,msp_formation:1});assert.equal(later.CGP_name,'CGP');assert.equal(later.MSP_name,'MSP');
    });
    test('Every demographic includes all eight party preferences', (e,Q) => {
        rules.refreshPolls(Q);
        for(const group of Q.classes) {
            const total=Q.parties.reduce((sum,party)=>sum+Q[group+'_'+party+'_display'],0);
            assert(Math.abs(total-100)<.5,group+' shares sum to 100');
            for(const party of Q.parties)assert(Number.isFinite(Q[group+'_'+party+'_display']));
        }
        const source=fs.readFileSync(path.join(root,'source/scenes/status.scene.dry'),'utf8');
        const detail=source.slice(source.indexOf('**Detailed results for each demographic**'),source.indexOf('@interior_affairs'));
        for(const group of Q.classes)for(const party of Q.parties)assert(detail.includes(group+'_'+party+'_display'),group+' '+party);
    });
    console.log=log;
    log('PASS: '+passed.length+' repair regression scenarios, including the unchanged TIP abstention/half-transfer rule.');
    if(process.env.REPAIR_RESULTS) fs.writeFileSync(process.env.REPAIR_RESULTS,JSON.stringify({passed,scenes:Object.keys(game.scenes).length},null,2));
});

