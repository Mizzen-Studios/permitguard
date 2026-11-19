import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkflowService, evaluateProjection, createTransitionValidator, dryRunTransition } from '../src/integrations/workflow.mjs';
import { checkRestrictedSpace, createConfluenceArchive, closedPermitEntry, lockBoardSnapshot } from '../src/integrations/confluence.mjs';
const at = '2026-11-19T18:00:00.000Z', now = Date.parse(at);
const ok = value => ({ ok: true, status: 200, json: async () => structuredClone(value) });
const admin = { permissions: { ADMINISTER: { havePermission: true } } };
const projection = { schemaVersion: 1, revision: 1, permitId: 'P1', state: 'VERIFY', mode: 'ENFORCE', failMode: 'FAIL_CLOSED', updatedAt: at, start: { cleared: true }, release: { cleared: false } };
test('projection fails closed on absent, malformed, stale, future, unknown action/policy; explicit Warn-only stays NOT CLEARED', () => {
  for (const p of [null, {}, { ...projection, updatedAt: 'bad' }, { ...projection, updatedAt: '2026-11-18' }, { ...projection, updatedAt: '2026-11-20' }, { ...projection, mode: null }, { ...projection, revision: -1 }]) assert.equal(evaluateProjection(p, 'START', { now }).allowed, false);
  assert.equal(evaluateProjection(projection, 'INVALID', { now }).allowed, false);
  assert.equal(evaluateProjection(projection, 'START', { now }).allowed, true);
  assert.equal(evaluateProjection(projection, 'RELEASE', { now }).allowed, false);
  const warn = evaluateProjection({ ...projection, mode: 'WARN_ONLY', start: { cleared: false } }, 'START', { now });
  assert.equal(warn.allowed, true); assert.equal(warn.status, 'NOT CLEARED'); assert.equal(warn.alertRequired, true);
});
test('validator never lets forged cleared property override authoritative denial; errors block', async () => {
  const event = { issue: { id: '100' }, configuration: { action: 'START' } };
  for (const evaluateAuthoritative of [async () => ({ transitionAllowed: false }), async () => { throw Error('outage'); }]) {
    const fn = createTransitionValidator({ loadProjection: async () => projection, evaluateAuthoritative, now: () => now });
    assert.equal((await fn(event)).result, false);
  }
  const fn = createTransitionValidator({ loadProjection: async () => null, evaluateAuthoritative: async () => { throw Error('must not evaluate'); }, now: () => now });
  assert.equal((await fn(event)).result, false);
});
test('workflow pagination, key filtering, disable preserves config and readback', async () => {
  let disabled = false; const calls = [];
  const service = createWorkflowService({ requestJira: async (actor, path, options) => {
    calls.push({ actor, path, options });
    if (actor === 'user') return ok(admin);
    if (options) { const w = options.body.workflows[0]; assert.deepEqual(w.workflowId, { name: 'Sample' }); assert.deepEqual(w.validators[0].configuration, { value: 'keep', tag: 'tag', disabled: true }); disabled = true; return ok({ updateResults: [] }); }
    const startAt = Number(new URL(path, 'https://local').searchParams.get('startAt'));
    if (startAt === 0) return ok({ startAt, maxResults: 1, isLast: false, values: [{ workflowId: { name: 'Empty' }, validators: [] }] });
    return ok({ startAt, maxResults: 1, isLast: true, values: [{ workflowId: { name: 'Sample' }, validators: [{ id: 'rule', key: 'permitguard-start-validator', configuration: { value: 'keep', tag: 'tag', disabled } }, { id: 'foreign', key: 'other', configuration: { value: '' } }] }] });
  } });
  assert.equal((await service.list()).length, 1);
  assert.equal((await service.disable({ workflowName: 'Sample', ruleId: 'rule' })).status, 'DISABLED');
  await assert.rejects(service.disable({ workflowName: 'Sample', ruleId: 'foreign' }), /OWN_RULE_NOT_FOUND/);
  assert.equal((await service.delete()).status, 'UNSUPPORTED');
  assert.equal(calls.filter(c => c.options).length, 1);
});
test('non-admin list disable delete dry-run refused before app calls', async () => {
  const requestJira = async actor => { assert.equal(actor, 'user'); return ok({ permissions: {} }); };
  const svc = createWorkflowService({ requestJira });
  for (const fn of [() => svc.list(), () => svc.disable({}), () => svc.delete(), () => dryRunTransition({ requestJira, issueId: '100', action: 'START' })]) await assert.rejects(fn(), /SITE_ADMIN_REQUIRED/);
});
test('dry-run missing property blocks without writes', async () => {
  const result = await dryRunTransition({ requestJira: async (actor, path, options) => { assert.equal(actor, 'user'); assert.equal(options, undefined); return path.includes('mypermissions') ? ok(admin) : { status: 404 }; }, issueId: '100', action: 'START', now });
  assert.equal(result.wouldBlock, true); assert.equal(result.dryRun, true);
});
const config = { confirmed: true, confirmedBy: 'admin', confirmedAt: at, spaceId: '1', allowedUserIds: ['admin'], allowedGroupIds: ['crew'], defaultGroupIds: ['all'], defaultGroupsVerified: true };
const permission = { principal: { type: 'user', id: 'admin' }, operation: { key: 'read', targetType: 'space' } };
const permit = { id: 'P1', projectId: '100', state: 'CLOSED', closedAt: at };
test('space restriction denies anonymous, roles, default/broad groups, unknown or incomplete permission data', () => {
  assert.equal(checkRestrictedSpace([permission], config).restricted, true);
  for (const p of [{}, { ...permission, principal: { type: 'anonymous', id: '*' } }, { ...permission, principal: { type: 'role', id: 'viewer' } }, { ...permission, principal: { type: 'group', id: 'all' } }, { ...permission, principal: { type: 'group', id: 'unknown' } }]) assert.throws(() => checkRestrictedSpace([p], config));
  assert.throws(() => checkRestrictedSpace([permission], { ...config, confirmed: false }));
  assert.throws(() => checkRestrictedSpace([permission], { ...config, defaultGroupsVerified: false }));
});
function archiveHarness({ configured = config, existing = true, conflict = false, permissions = [permission] } = {}) {
  let stored = '<p>Prior content</p>', version = 1, writes = 0, didConflict = false;
  const service = createConfluenceArchive({ requireAdmin: async () => {}, loadConfig: async () => configured, withMonthLock: async (_key, fn) => fn(), requestConfluence: async (path, options) => {
    if (options) {
      writes++;
      if (conflict && !didConflict) { didConflict = true; stored += '<p>Concurrent human edit</p>'; version++; return { ok: false, status: 409 }; }
      if (options.method === 'PUT') { assert.equal(options.body.version.number, version + 1); assert.ok(options.body.body.value.startsWith(stored)); version++; }
      stored = options.body.body.value; return ok({ id: '2' });
    }
    if (path.includes('/permissions')) return ok({ results: permissions });
    if (path.includes('/spaces/')) return ok({ id: '1', status: 'current', operations: { results: [{ operation: 'administer', targetType: 'space' }] } });
    if (path.startsWith('/wiki/api/v2/pages?')) return ok({ results: existing ? [{ id: '2' }] : [] });
    return ok({ id: '2', spaceId: '1', title: 'PermitGuard closed permits 2026-11', status: 'current', version: { number: version }, body: { storage: { value: stored } } });
  } });
  return { service, get writes() { return writes; }, get stored() { return stored; } };
}
test('archive appends once; retries version conflict using latest body without overwriting human edits', async () => {
  const h = archiveHarness({ conflict: true });
  assert.equal((await h.service.append(permit)).status, 'APPENDED');
  assert.match(h.stored, /Concurrent human edit/);
  assert.equal((await h.service.append(permit)).status, 'ALREADY_ARCHIVED');
  assert.equal(h.writes, 2);
});
test('archive first month creates one page and unconfirmed/unrestricted/nonclosed input never writes', async () => {
  const fresh = archiveHarness({ existing: false }); assert.equal((await fresh.service.append(permit)).status, 'APPENDED'); assert.equal(fresh.writes, 1);
  for (const options of [{ configured: { ...config, confirmed: false } }, { permissions: [{ ...permission, principal: { type: 'group', id: 'all' } }] }]) { const h = archiveHarness(options); await assert.rejects(h.service.append(permit)); assert.equal(h.writes, 0); }
  const h = archiveHarness(); await assert.rejects(h.service.append({ ...permit, state: 'ACTIVE' }), /CLOSED_PERMIT_REQUIRED/); assert.equal(h.writes, 0);
});
test('archive escaping and snapshot contract label timestamp state never live', () => {
  assert.ok(!closedPermitEntry({ ...permit, id: '<script>' }).html.includes('<script>'));
  const s = lockBoardSnapshot({ permits: [{ id: 'P1', state: 'CLOSED', revision: 2 }], capturedAt: at, now: now + 600001, connected: true });
  assert.equal(s.live, false); assert.equal(s.stale, true); assert.match(s.label, /not live/); assert.equal(s.permits[0].state, 'CLOSED'); assert.equal(s.capturedAt, at);
});
