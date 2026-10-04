// Shared simulation rules. Loaded before the compiled story in the browser.
// @ts-check
(function (/** @type {any} */ root) {
    'use strict';
    /** @typedef {Record<string, any>} GameState */
    /** @typedef {{year?:number,oil_inflation_effect?:number,tiger_1978_effect_applied?:boolean,tiger_1979_effect_applied?:boolean,tiger_1980_effect_applied?:boolean,base_inflation?:number,inflation_modifier?:number,inflation?:number,base_growth?:number,growth_modifier?:number,economic_growth?:number,base_unemployment?:number,unemployment_modifier?:number,unemployed?:number,base_industry_index?:number,industry_modifier?:number,industrial_production_index?:number,base_agriculture_index?:number,agriculture_modifier?:number,agricultural_production_index?:number,forex_pressure?:number,agricultural_consumption?:number,agricultural_product_prices?:number,industrial_player_modifier?:number,agricultural_player_modifier?:number}} EconomyState */
    /** @param {unknown} value @param {number} [fallback] */
    function number(value, fallback) {
        return typeof value === 'number' && Number.isFinite(value) ? value : (fallback === undefined ? 0 : fallback);
    }
    /** @param {number} value @param {number} min @param {number} max */
    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    /** Derive headline values; policy actions change the modifiers, never these results.
     * @param {EconomyState} Q */
    function refreshEconomy(Q) {
        var tigerActive = (Q.year === 1978 && Q.tiger_1978_effect_applied) ||
            (Q.year === 1979 && Q.tiger_1979_effect_applied) || (Q.year === 1980 && Q.tiger_1980_effect_applied);
        Q.inflation = number(Q.base_inflation) + number(Q.inflation_modifier) - number(Q.oil_inflation_effect) - (tigerActive ? 30 : 0);
        Q.economic_growth = number(Q.base_growth) + number(Q.growth_modifier) + (tigerActive ? 3 : 0);
        Q.unemployed = Math.max(0.5, number(Q.base_unemployment) + number(Q.unemployment_modifier));
        Q.industrial_production_index = Math.max(0, number(Q.base_industry_index, 100) + number(Q.industry_modifier));
        Q.agricultural_production_index = Math.max(0, number(Q.base_agriculture_index, 100) + number(Q.agriculture_modifier));
        Q.forex_pressure = clamp(number(Q.forex_pressure), 0, 100);
        Q.agricultural_product_prices = number(Q.agricultural_consumption) / Math.max(1, Q.agricultural_production_index);
        Q.industrial_player_modifier = number(Q.industry_modifier);
        Q.agricultural_player_modifier = number(Q.agriculture_modifier);
    }
    var weights = [0.20, 0.15, 0.25, 0.20, 0.10, 0.10];
    var factions = ['km', 'lk', 'ok', 'rk', 'tw'];
    var globalFactions = ['kemalist_marxists', 'left_kemalists', 'orthodox_kemalists', 'right_kemalists', 'third_worldists'];
    /** Pure quarter model, shared by simulation and displays. @param {GameState} Q */
    function factionModel(Q) {
        /** @type {Record<string, number>} */
        var bonuses = {km: 0, lk: 0, ok: 0, rk: 0, tw: 0};
        String(Q._advisor_factions || '').split(',').forEach(function (pair) {
            var parts = pair.split(':');
            if (Q[parts[0] + '_advisor'] === 1 && Object.prototype.hasOwnProperty.call(bonuses, parts[1])) bonuses[parts[1]] += 1;
        });
        /** @type {Record<string, boolean>} */
        var active = {km: true, lk: true, ok: !Q.orthodox_kemalist_destruction,
            rk: !Q.right_kemalist_split && !Q.right_kemalists_resign, tw: !!Q.third_worldists_enabled};
        /** @type {Record<string, number>} */
        var averages = {};
        /** @param {number} quarter @param {string} faction */
        function effective(quarter, faction) {
            return Math.max(0, number(Q['q' + quarter + '_' + faction + '_str']) + (quarter === 2 ? bonuses[faction] : 0));
        }
        factions.forEach(function (faction) {
            averages[faction] = weights.reduce(function (sum, weight, quarter) { return sum + weight * effective(quarter, faction); }, 0);
        });
        var total = factions.reduce(function (sum, faction) { return sum + (active[faction] ? averages[faction] : 0); }, 0);
        return {bonuses: bonuses, active: active, averages: averages, total: total, effective: effective};
    }
    /** @param {GameState} Q */
    function refreshFactions(Q) {
        var model = factionModel(Q);
        var dissent = 0;
        factions.forEach(function (faction, index) {
            var share = model.active[faction] && model.total > 0 ? 100 * model.averages[faction] / model.total : 0;
            Q[globalFactions[index] + '_strength'] = share;
            var factionDissent = clamp(number(Q[globalFactions[index] + '_dissent']), 0, 99);
            Q[globalFactions[index] + '_dissent'] = factionDissent;
            dissent += share * factionDissent / 10000;
        });
        Q.dissent = clamp(dissent, 0, 0.95);
        Q.dissent_percent = Q.dissent * 100;
    }
    /** Legacy faction gains are percentage points of party strength. Preserve quarter proportions.
     * @param {GameState} Q @param {string} faction @param {number} points */
    function adjustFactionStrength(Q, faction, points) {
        var model = factionModel(Q);
        if (!model.active[faction] || model.total <= 0) return;
        var current = model.averages[faction];
        var others = model.total - current;
        if (others <= 0) return;
        var targetShare = clamp(current / model.total + points / 100, 0, 0.999);
        var target = others * targetShare / (1 - targetShare);
        for (var quarter = 0; quarter < weights.length; quarter++) {
            var value = current > 0 ? model.effective(quarter, faction) * target / current : target;
            Q['q' + quarter + '_' + faction + '_str'] = value - (quarter === 2 ? model.bonuses[faction] : 0);
        }
        refreshFactions(Q);
    }
    var ministries = ['foreign', 'interior', 'justice', 'labor', 'defense', 'economic', 'finance', 'agriculture', 'education', 'trade', 'industrial'];
    var coalitionFlags = ['in_democratic_coalition', 'in_grand_coalition', 'in_left_front', 'in_popular_front', 'in_msp_coalition',
        'in_emergency_government', 'in_minority_government', 'in_unity_government', 'in_right_coalition', 'in_CHP_majority', 'CHP_toleration', 'CHP_caretaker'];
    /** Clear all cabinet ownership before a new formation or caretaker transition. @param {GameState} Q */
    function resetCabinet(Q) {
        ['CHP', 'AP', 'TIP', 'MSP', 'MHP', 'CGP', 'DP', 'I'].forEach(function (party) { Q[party + '_in_government'] = 0; });
        coalitionFlags.forEach(function (flag) { Q[flag] = 0; });
        ministries.forEach(function (ministry) { Q[ministry + '_minister_party'] = 'I'; Q[ministry + '_minister'] = 'Vacant'; });
        Q.prime_minister = 'Independent caretaker';
        Q.prime_minister_party = 'I';
        Q.coalition_dissent = 0;
        Q.TIP_coalition_dissent = 0;
        Q.minority_government = 0;
    }
    /** Pure projection: retain the existing TIP ban and partial DISK endorsement transfer.
     * @param {GameState} Q */
    function projectVotes(Q) {
        /** @type {string[]} */ var parties = Q.parties;
        /** @type {string[]} */ var classes = Q.classes;
        /** @type {Record<string, number>} */ var classShares = {};
        /** @type {Record<string, number>} */ var support = {};
        parties.forEach(function (party) { support[party] = 0; });
        classes.forEach(function (demographic) {
            var total = parties.reduce(function (sum, party) { return sum + Math.max(0, number(Q[demographic + '_' + party])); }, 0);
            parties.forEach(function (party) {
                var raw = Math.max(0, number(Q[demographic + '_' + party]));
                var share = total > 0 ? 100 * raw / total : 0;
                classShares[demographic + '_' + party] = share;
                support[party] += number(Q[demographic]) * (Q.old_demographics ? raw : share);
            });
        });
        // A banned TIP abstains; only half its support transfers with DISK endorsement.
        var transfer = Q.TIP_banned && Q.disk_endorsement ? support.TIP / 2 : 0;
        if (Q.TIP_banned) { support.chp += transfer; support.TIP = 0; }
        var totalSupport = parties.reduce(function (sum, party) { return sum + support[party]; }, 0);
        if (totalSupport <= 0) { support.other = 1; totalSupport = 1; }
        /** @type {Record<string, number>} */ var fractions = {};
        parties.forEach(function (party) { fractions[party] = support[party] / totalSupport; });
        return {classShares: classShares, support: support, fractions: fractions, transfer: transfer};
    }
    /** Update derived polling/election fields, leaving demographic preferences intact. @param {GameState} Q */
    function refreshVotes(Q) {
        var projection = projectVotes(Q);
        Object.keys(projection.classShares).forEach(function (key) {
            Q[key + '_normalized'] = projection.classShares[key]; Q[key + '_display'] = Math.round(projection.classShares[key]);
        });
        Q.parties.forEach(function (/** @type {string} */ party) {
            var decimal = Math.round(projection.fractions[party] * 1000) / 10;
            Q[party + '_support'] = projection.support[party];
            Q[party + '_normalized'] = projection.fractions[party];
            Q[party + '_votes_dec'] = decimal;
            Q[party + '_votes'] = Q.use_decimals ? decimal : Math.round(projection.fractions[party] * 100);
            Q[party + '_votes_disp'] = Q.use_decimals ? decimal : decimal.toFixed(1);
            Q[party + '_votes_display'] = Q[party + '_votes'];
        });
    }
    root.AnatolianRules = {number: number, clamp: clamp, refreshEconomy: refreshEconomy, factionModel: factionModel,
        refreshFactions: refreshFactions, adjustFactionStrength: adjustFactionStrength, resetCabinet: resetCabinet,
        projectVotes: projectVotes, refreshVotes: refreshVotes};
    if (typeof module !== 'undefined' && module.exports) module.exports = root.AnatolianRules;
}(typeof globalThis !== 'undefined' ? globalThis : window));
