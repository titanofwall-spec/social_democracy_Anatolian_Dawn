'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../out/html/rules.js');
const scene = p => fs.readFileSync(path.join(__dirname, '../source/scenes', p), 'utf8');

{
  const q = {
    CGP_relation: 42, cgp_relation: 99, workers_chp: 38,
    worker_chp: 55, AP_workers: 63, I_government: 1,
    CHP_leader: 'Ecevit', industry_modifier: 7,
    industrial_player_modifier: 99, agricultural_player_modifier: 11,
    land_reform_level: 2
  };
  R.migrateStateAliases(q);
  assert.equal(q.CGP_relation, 42, 'canonical value must beat stale alias');
  assert.equal(q.workers_chp, 38, 'worker support must not be overwritten');
  assert.equal(q.workers_AP, 63, 'missing canonical value must be imported');
  assert.equal(q.I_in_government, 1);
  assert.equal(q.CHP_party_leader, 'Ecevit');
  assert.equal(q.industry_modifier, 7);
  for (const retired of ['cgp_relation','worker_chp','AP_workers','I_government',
    'CHP_leader','industrial_player_modifier','agricultural_player_modifier','land_reform_level']) {
    assert.equal(Object.prototype.hasOwnProperty.call(q, retired), false, 'retired '+retired);
  }
  const previous = JSON.stringify(q);
  R.migrateStateAliases(q);
  assert.equal(JSON.stringify(q), previous, 'migration must be idempotent');
}
{
  const q = {
    year: 1973, base_inflation: 15.8, base_growth: 5.2, base_unemployment: 6.5,
    base_industry_index: 112, industry_modifier: 3,
    base_agriculture_index: 100, agriculture_modifier: 0,
    agricultural_consumption: 121, forex_pressure: 45
  };
  R.refreshEconomy(q);
  assert.equal(q.industrial_production_index, 115);
  assert.equal(q.agricultural_production_index, 100);
  assert.equal(q.agricultural_product_prices, 1.21);
  assert.equal(q.agricultural_price_status, 'Very High');
  assert.equal(q.industrial_player_modifier, undefined);
  assert.equal(q.agricultural_player_modifier, undefined);
  for (const [v,label] of [[1.20,'High'],[1.10,'High'],[0.90,'Sufficient'],
    [0.80,'Low'],[0.79,'Very Low']]) assert.equal(R.agriculturalPriceStatus(v), label);
}
{
  const q = {landreform_done:6, ps_mines_nationalized:1, ps_petrol_nationalized:1,
    kitt:1, ps_iyak_reformed:1, healthinspectionss:1, ps_security:1,
    Amnesty:1, moderationn:1, resistt:1, halkegitimm:1, koykentegitimm:1,
    curriculumm:1, studentt:1, legalizee:2, social_equal_pay:1, maternityy:3,
    peoples_sector_integrated:1};
  const before=JSON.stringify(q), s=R.interiorPolicyStatuses(q);
  assert.equal(s.land_reform_status,'Land Reform');
  assert.equal(s.natural_resources_policy,'Public');
  assert.equal(s.workplace_democracy_status,'Strong');
  assert.equal(s.peoples_sector_status,'Robust');
  assert.equal(s.workplace_safety_status,'Safe');
  assert.equal(s.judicial_reform_status,'Progressive');
  assert.equal(s.education_funding_status,'Generous');
  assert.equal(s.education_curriculum_status,'Progressive');
  assert.equal(s.womens_legal_status,'Expanded Rights');
  assert.equal(s.womens_workplace_status,'Broad Protection');
  assert.equal(JSON.stringify(q),before,'status projection cannot mutate policy state');
}
{
  const cgp=scene('events/cumhurbaskanligi1.scene.dry');
  assert(cgp.includes('CGP_relation += 3;'));
  assert(!/\bcgp_relation\b/.test(cgp));
  const fiscal=scene('government_affairs/fiscal_policy.scene.dry');
  assert(fiscal.includes('workers_chp += 4*(1 - dissent)'));
  assert(!/\bworker_chp\b/.test(fiscal));
  const media=scene('party_affairs/media.scene.dry');
  assert(!/\bI_government\b/.test(media));
  assert(media.includes('view-if: I_in_government == 0'));
  const parliament=scene('government_affairs/parliamentary_resolution.scene.dry');
  assert(!/Q\.chp_seats\s*=\s*Math\.round\(450/.test(parliament));
  for (const key of ['tip_seats','cgp_seats','dp_seats','msp_seats','mhp_seats'])
    assert(!new RegExp('\\b'+key+'\\b').test(parliament),'retired seat key '+key);
  assert(parliament.includes('Q.parliamentary_total = yes_votes + no_votes + abstentions;'));
}
console.log('PASS: canonical state migration, production/price formula, policy projections and source key regressions');
