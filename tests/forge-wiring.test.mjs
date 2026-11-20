import test from 'node:test';
import assert from 'node:assert/strict';
import { createForgeWiring } from '../src/forge/actions.mjs';
const context = { accountId: 'real-user', extension: { issue: { id: '10001' } } };
const ok = data => ({ ok: true, status: 200, json: async () => data });
function setup(overrides = {}) {
  const calls = [];
  const wiring = createForgeWiring({ now: () => '2026-11-19T18:00:00.000Z',
    dispatch: async (...args) => { calls.push(args); return { permit: null, actorId: args[2].accountId, revision: 1 }; },
    requestJira: async () => ok({ id: '10001', fields: { project: { id: '10' } } }), ...overrides });
  return { ...wiring, calls, call: (operation, payload = {}, ctx = context) => wiring.resolver({ payload: { operation, payload }, context: ctx }) };
}
test('UI dispatch keeps only trusted identity and issue', async () => {
  const w = setup();
  const r = await w.call('get_state', { actorId: 'attacker', projectId: 'wrong', context: { accountId: 'attacker' } });
  assert.equal(r.actorId, 'real-user'); assert.equal(r.capabilities.archiveConfig, false);
  assert.deepEqual(w.calls[0][2], context);
});
test('no payload identity or issue fallback; no-issue administration is truthful', async () => {
  const w = setup();
  assert.equal((await w.call('get_state', {}, {})).code, 'AUTHENTICATED_ACTOR_REQUIRED');
  const r = await w.call('get_state', { issueId: '10001' }, { accountId: 'real-user', issueId: '10001' });
  assert.equal(r.view, 'ADMINISTRATION'); assert.ok(r.uninstall.instructions); assert.ok(r.scopes); assert.equal('readiness' in r, false); assert.equal(w.calls.length, 0);
  assert.equal((await w.call('create_permit', { issueId: '10001' }, { accountId: 'real-user' })).code, 'ISSUE_CONTEXT_REQUIRED');
});
test('macro without issue is timestamped empty snapshot, never live', async () => {
  const w = setup(); const r = await w.call('get_snapshot', {}, { accountId: 'real-user' });
  assert.deepEqual(r.permits, []); assert.equal(r.live, false); assert.equal(r.connected, false); assert.equal(r.capturedAt, '2026-11-19T18:00:00.000Z');
});
test('action key is independently authorized as user then canonicalized', async () => {
  const requests = []; const w = setup({ requestJira: async (...args) => { requests.push(args); return ok({ id: '10001', fields: { project: { id: '10' } } }); } });
  await w.checkReadiness({ issueKey: 'PG-1', actorId: 'fake', projectId: 'fake' }, { accountId: 'real-user' });
  assert.deepEqual(requests[0], ['user', '/rest/api/3/issue/PG-1?fields=project']);
  assert.deepEqual(w.calls[0], ['check_readiness', {}, { accountId: 'real-user', issueId: '10001' }]);
});
test('action permission denial prevents dispatch; input actor cannot authenticate', async () => {
  const w = setup({ requestJira: async () => ({ ok: false, status: 403 }) });
  assert.equal((await w.checkReadiness({ issueId: '10001' }, { accountId: 'real-user' })).code, 'ISSUE_ACCESS_REQUIRED');
  assert.equal((await w.checkReadiness({ issueId: '10001', accountId: 'fake', context: { accountId: 'fake' } })).code, 'AUTHENTICATED_ACTOR_REQUIRED'); assert.equal(w.calls.length, 0);
});
test('activation action can only propose and strips confirmation claims', async () => {
  const w = setup(); const r = await w.requestActivation({ issueId: '10001', verifierId: 'human', operation: 'confirm_activation', confirmedAtEquipment: true, actorId: 'fake' }, { accountId: 'real-user' });
  assert.deepEqual(w.calls[0][0], 'request_activation'); assert.deepEqual(w.calls[0][1], { verifierId: 'human' }); assert.equal(r.humanConfirmationRequired, true); assert.equal(r.activationAuthority, false);
});
test('owned rules include disposable probe; disable confirms owned readback; delete unsupported', async () => {
  let disabled = false; const requests = [];
  const w = setup({ requestJira: async (who, path, options) => {
    requests.push({ who, path, options });
    if (who === 'user') return ok({ permissions: { ADMINISTER: { havePermission: true } } });
    if (options?.method === 'PUT') { disabled = true; return ok({ updateResults: [] }); }
    return ok({ startAt: 0, isLast: true, values: [{ workflowId: { name: 'Demo' }, validators: [{ id: 'own', key: 'permitguard-probe-validator', configuration: { value: '{}', disabled } }, { id: 'foreign', key: 'other-app' }] }] });
  } });
  assert.equal((await w.call('list_rules')).rules[0].validators.length, 1);
  assert.equal((await w.call('disable_rule', { workflowName: 'Demo', ruleId: 'own', expectedRuleId: 'own', expectedWorkflowId: { name: 'Demo' } })).status, 'DISABLED');
  assert.equal((await w.call('delete_rule')).code, 'FORGE_DELETE_NOT_SUPPORTED');
  const before = requests.filter(r => r.options?.method === 'PUT').length;
  assert.equal((await w.call('disable_rule', { workflowName: 'Demo', ruleId: 'foreign' })).ok, false);
  assert.equal(requests.filter(r => r.options?.method === 'PUT').length, before);
});
test('dry-run uses trusted issue, is nonauthoritative and fails closed on missing projection', async () => {
  const requests = []; const w = setup({ requestJira: async (who, path) => {
    requests.push({ who, path });
    if (path.includes('mypermissions')) return ok({ permissions: { ADMINISTER: { havePermission: true } } });
    if (path.includes('/properties/')) return { ok: false, status: 404 };
    return ok({ id: '10001', fields: { project: { id: '10' } } });
  } });
  const r = await w.call('dry_run', { action: 'START', issueId: '99999' });
  assert.equal(r.dryRun, true); assert.equal(r.allowed, false); assert.equal(r.authoritative, false);
  assert.ok(requests.some(r => r.path.includes('/issue/10001/properties/'))); assert.ok(requests.every(r => !r.path.includes('99999')));
});
test('archive config explicit pending and exception details never escape', async () => {
  const w = setup({ dispatch: async () => { throw new Error('secret issue and lock data'); } });
  assert.equal((await w.call('set_archive_config', {})).code, 'ARCHIVE_CONFIG_PENDING');
  const r = await w.call('get_state'); assert.equal(r.code, 'PERMITGUARD_UNAVAILABLE'); assert.equal(JSON.stringify(r).includes('secret'), false);
});

test('Rovo uses trusted function principal; numeric platform issue IDs canonicalize', async () => {
 const w=setup();
 await w.checkReadiness({context:{jira:{issueId:10001}},accountId:'fake'},{principal:{accountId:'real-user'}});
 assert.deepEqual(w.calls[0],['check_readiness',{}, {accountId:'real-user',issueId:'10001'}]);
 const denied=await w.checkReadiness({issueKey:'PG-1',context:{principal:{accountId:'fake'}}},{});
 assert.equal(denied.code,'AUTHENTICATED_ACTOR_REQUIRED');
});

test('QR validation errors are specific and safe; opaque SDK errors remain redacted',async()=>{
 for(const code of ['QR_VALUE_MISMATCH','ACTIVATION_EQUIPMENT_REQUIRED','QR_CHALLENGE_EXPIRED']){const w=setup({dispatch:async()=>{throw new Error(code);}});const r=await w.call('confirm_activation');assert.equal(r.code,code);assert.notEqual(r.code,'PERMITGUARD_UNAVAILABLE');assert.ok(r.message.length>20);assert.equal(r.requiresRefresh,code==='QR_CHALLENGE_EXPIRED');}
 const w=setup({dispatch:async()=>{throw new Error('private account secret endpoint');}});assert.equal((await w.call('confirm_activation')).requiresRefresh,true);
});
