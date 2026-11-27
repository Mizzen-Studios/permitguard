import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createService } from '../src/server/service.mjs';
import { emptySite } from '../src/server/store.mjs';
import { jiraAdapters } from '../src/server/jira.mjs';
// Local contracts only. No distribution link, browser, production or site API call.
const route = (parts, ...values) => parts.reduce((s, p, i) => s + p + (values[i] ?? ''), '');

test('judge sample requires both trusted key and description marker', async () => {
  for (const [key, description, expected] of [
    ['PGSAMPLE', '[PermitGuard dedicated sample project]', true],
    ['REAL', '[PermitGuard dedicated sample project]', false],
    ['PGSAMPLE', 'Real work', false]
  ]) {
    const api = { asUser: () => ({ requestJira: async path => {
      assert.equal(path, '/rest/api/3/project/42');
      return { ok: true, json: async () => ({ key, description }) };
    } }) };
    assert.equal(await jiraAdapters(api, route).projectIsSample('42'), expected);
  }
});

test('fresh judge minimal quickstart gives PLAN, not inherited ACTIVE clearance', async () => {
  let row = { revision: null, data: emptySite() };
  const store = { atomic: true, read: async () => structuredClone(row), commit: async (expected, data) => {
    assert.equal(expected, row.revision);
    row = { revision: expected === null ? 0 : expected + 1, data: structuredClone(data) };
    return row.revision;
  } };
  const dispatch = createService({ store,
    authorize: async c => ({ actorId: 'judge-self', issueId: '100', projectId: '42', isProjectAdmin: true, canEdit: c.edit !== false }),
    projectIsSample: async () => true,
    validatePeople: async ids => assert.deepEqual(ids, ['judge-self']),
    now: () => '2026-11-25T00:00:00Z', uuid: () => 'local-only'
  });
  const call = (op, payload = {}, context = {}) => dispatch(op, payload, context);
  let s = await call('get_state');
  assert.equal(s.policy.mode, 'WARN_ONLY'); assert.equal(s.permit, null); assert.equal(s.equipment.length, 0);
  await assert.rejects(call('load_sample'), /confirmation/);
  await assert.rejects(call('load_sample', { confirmed: true }, { edit: false }), /EDIT_ISSUES/);
  s = await call('load_sample', { confirmed: true });
  assert.equal(s.equipment.length, 6); assert.equal(s.policy.mode, 'ENFORCE'); assert.equal(s.policy.failMode, 'FAIL_CLOSED');
  const pump = s.equipment.find(e => e.name === 'Cooling-water pump');
  assert.ok(pump); assert.equal(pump.isolationPoints[0].highEnergy, false);
  s = await call('create_permit', { crewId: 'Judge demo', equipmentIds: [pump.id], workers: ['judge-self'], verifierIds: ['judge-self'] });
  assert.equal(s.permit.state, 'PLAN'); assert.equal(s.release.status, 'NOT CLEARED');
  const before = structuredClone(row), result = await call('check_readiness');
  assert.equal(result.phase, 'PLAN'); assert.equal(result.scope, 'WORK_START');
  assert.equal(result.status, 'NOT CLEARED'); assert.equal(result.releaseStatus, 'NOT CLEARED'); assert.equal(result.operational, false);
  assert.match(result.message, /Work start only: NOT CLEARED/); assert.deepEqual(row, before);
  await assert.rejects(call('load_sample', { confirmed: true }), /permits open/);
});

test('README primary quickstart matches accepted Warn-only seed, distinct from advanced sample setup',()=>{
 const source=readFileSync(new URL('../static/permit-app/app.js',import.meta.url),'utf8');const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
 assert.ok(source.includes('Load six demo equipment items (Warn-only)'));assert.ok(readme.includes('Load six demo equipment items (Warn-only)'));
 assert.ok(readme.includes('apps icon under the issue title'));assert.ok(readme.includes('Do not rely on'));assert.ok(readme.includes('OWNER-REPORTED PASS'));assert.ok(readme.includes('Production2.4.0'));assert.ok(readme.includes('Broader fresh-site lifecycle remains NOT_RUN'));assert.ok(readme.includes('separate verified **PGSAMPLE**'));assert.ok(readme.includes('not a requirement for ordinary Warn-only onboarding'));
});
