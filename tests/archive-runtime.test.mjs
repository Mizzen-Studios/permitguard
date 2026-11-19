import test from 'node:test';
import assert from 'node:assert/strict';
import { createArchiveRuntime } from '../src/forge/archive.mjs';
import { emptySite } from '../src/server/store.mjs';
const CONFIG = 'archive-config-v1', LEASE = 'archive-month-lease-v1';
const context = { accountId: 'admin' };
const permit = { id: 'permit1', projectId: '10', state: 'CLOSED', closedAt: '2026-11-19T18:00:00Z', photo: 'PRIVATE', workers: ['PRIVATE'] };
const ok = data => ({ ok: true, status: 200, json: async () => structuredClone(data) });
class Filter { and(key, value) { this.key = key; this.value = value; return this; } }
const FilterConditions = { notExists: () => ({ absent: true }), equalTo: value => ({ value }) };
function fixture(shared = new Map()) {
  const calls = [], writes = [];
  let assignments = [{ principal: { type: 'user', id: 'admin' }, operation: { key: 'read', targetType: 'space' } }];
  let isAdmin = true, access = true, page = null, conflicts = 0, hook;
  const kvs = {
    entity: name => { assert.equal(name, 'permitguard-site'); return { get: async key => { calls.push(['get', key]); return structuredClone(shared.get(key)); } }; },
    transact: () => {
      const ops = [];
      const builder = {
        check(key, entity) { ops.push({ key, entity }); return builder; },
        set(key, value, entity) { ops.push({ key, value, entity }); return builder; },
        async execute() {
          for (const op of ops) {
            assert.equal(op.entity.entityName, 'permitguard-site');
            const f = op.entity.conditions, old = shared.get(op.key)?.[f.key];
            if (f.value.absent ? old !== undefined : old !== f.value.value) throw new Error('condition conflict');
          }
          for (const op of ops) if (op.value) shared.set(op.key, structuredClone(op.value));
        }
      }; return builder;
    }
  };
  const api = { asApp() { throw new Error('AS_APP_FORBIDDEN'); }, asUser: () => ({
    requestJira: async path => {
      calls.push(['jira', path]);
      if (path.includes('mypermissions')) return ok({ permissions: { ADMINISTER: { havePermission: isAdmin } } });
      return access ? ok({ id: '10001', fields: { project: { id: '10' } } }) : { ok: false, status: 403 };
    },
    requestConfluence: async (path, options = {}) => {
      calls.push(['confluence', path]);
      if (hook) await hook(path, options);
      if (path.includes('/permissions')) return ok({ results: assignments });
      if (path.includes('/spaces/')) return ok({ id: '123', status: 'current', operations: { results: [{ operation: 'administer', targetType: 'space' }] } });
      if (options.method) {
        writes.push([path, options]);
        if (conflicts-- > 0) { page.version.number++; page.body.storage.value += '<p>Other append</p>'; return { ok: false, status: 409 }; }
        const body = JSON.parse(options.body);
        page = { id: 'page1', spaceId: '123', status: 'current', title: body.title, version: body.version || { number: 1 }, body: { storage: { value: body.body.value } } };
        return ok(page);
      }
      if (path.includes('/pages/page1')) return ok(page);
      return ok({ results: page ? [{ id: 'page1' }] : [] });
    }
  }) };
  const deps = { kvs, Filter, FilterConditions, api, assumeTrustedRoute: path => path };
  return { runtime: createArchiveRuntime(deps), deps, shared, calls, writes,
    configure: extra => createArchiveRuntime(deps).configure({ spaceId: '123', confirmed: true, expectedRevision: shared.get(CONFIG)?.revision ?? null, ...extra }, context),
    permissions: value => { assignments = value; }, admin: value => { isAdmin = value; }, access: value => { access = value; }, conflicts: value => { conflicts = value; }, hook: value => { hook = value; }, page: () => page };
}

test('explicit verified configuration, server confirmation, bounded full allowlist and revision CAS', async () => {
  const f = fixture();
  assert.deepEqual(await f.runtime.configuration(context), { configured: false, revision: null });
  await assert.rejects(f.runtime.appendClosed(permit, context), /ADMIN_CONFIRMATION_REQUIRED/);
  await assert.rejects(f.configure({ confirmed: false }), /ADMIN_CONFIRMATION_REQUIRED/);
  await assert.rejects(f.configure({ allowedUserIds: ['other'] }), /INVALID_ALLOWED_USERS/);
  await assert.rejects(f.configure({ allowedUserIds: Array(51).fill('admin') }), /INVALID_ALLOWED_USERS/);
  const result = await f.configure({ confirmedBy: 'fake', confirmedAt: '1900-01-01' });
  assert.equal(result.confirmedBy, 'admin'); assert.notEqual(result.confirmedAt, '1900-01-01');
  assert.equal(f.writes.length, 0);
  await assert.rejects(f.configure({ expectedRevision: null }), /ARCHIVE_CONFIG_CONFLICT/);
  assert.deepEqual((await f.runtime.configuration(context)).allowedUserIds, ['admin']);
  f.admin(false); await assert.rejects(f.configure(), /SITE_ADMIN_REQUIRED/);
  await assert.rejects(f.runtime.configuration(context), /SITE_ADMIN_REQUIRED/);
});

for (const type of ['group', 'anonymous', 'role', 'access-class']) for (const key of ['read', 'write']) {
  test('rejects ' + type + ' assignment even for ' + key, async () => {
    const f = fixture();
    f.permissions([{ principal: { type, id: 'broad' }, operation: { key, targetType: 'space' } }]);
    await assert.rejects(f.configure({ allowedGroupIds: ['broad'], defaultGroupsVerified: true }), /NAMED_USERS_ONLY/);
    assert.equal(f.shared.size, 0); assert.equal(f.writes.length, 0);
  });
}

test('durable lease contends across runtimes and releases; metadata-only idempotent append', async () => {
  const f = fixture(); await f.configure();
  let entered, release;
  const ready = new Promise(resolve => { entered = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  let blocked = false;
  f.hook(async path => { if (!blocked && path.includes('/spaces/123?')) { blocked = true; entered(); await wait; } });
  const first = f.runtime.appendClosed(permit, context);
  await ready;
  const other = createArchiveRuntime(f.deps);
  await assert.rejects(other.appendClosed(permit, context), /ARCHIVE_BUSY/);
  await assert.rejects(f.configure(), /ARCHIVE_BUSY/);
  release(); await first; f.hook(null);
  assert.equal(f.shared.get(LEASE).data.token, null);
  assert.equal((await other.appendClosed(permit, context)).status, 'ALREADY_ARCHIVED');
  assert.equal(f.writes.length, 1);
  assert.ok(!f.writes[0][1].body.includes('PRIVATE'));
  assert.equal(f.shared.size, 2);
});

test('expired durable lease recovered; version conflicts refetch and preserve concurrent page text', async () => {
  const f = fixture(); await f.configure(); await f.runtime.appendClosed(permit, context);
  f.shared.set(LEASE, { revision: 20, data: { token: 'abandoned', expiresAt: 1, month: 'old' } });
  f.conflicts(2);
  const result = await f.runtime.appendClosed({ ...permit, id: 'permit2' }, context);
  assert.equal(result.status, 'APPENDED'); assert.equal(f.writes.length, 4);
  assert.match(f.page().body.storage.value, /Other append/);
  assert.equal(f.shared.get(LEASE).data.token, null);
});

test('conflict retries bounded and own lease released on error', async () => {
  const f = fixture(); await f.configure(); await f.runtime.appendClosed(permit, context);
  f.conflicts(9);
  await assert.rejects(f.runtime.appendClosed({ ...permit, id: 'permit2' }, context), /VERSION_CONFLICT_RETRY_EXHAUSTED/);
  assert.equal(f.writes.length, 4); assert.equal(f.shared.get(LEASE).data.token, null);
});

test('restriction changes stop publication; lease takeover is not released by old owner', async () => {
  const f = fixture(); await f.configure();
  f.permissions([{ principal: { type: 'group', id: 'everyone' }, operation: { key: 'read', targetType: 'space' } }]);
  await assert.rejects(f.runtime.appendClosed(permit, context), /NAMED_USERS_ONLY/);
  assert.equal(f.writes.length, 0); assert.equal(f.shared.get(LEASE).data.token, null);
  f.hook(async () => { const row = f.shared.get(LEASE); f.shared.set(LEASE, { revision: row.revision + 1, data: { token: 'new-owner', expiresAt: Date.now() + 25000 } }); });
  await assert.rejects(f.runtime.appendClosed(permit, context), /ARCHIVE_LEASE_LOST/);
  assert.equal(f.shared.get(LEASE).data.token, 'new-owner');
});

test('snapshot authorizes asUser before aggregate read; canonical numeric ID only, no other permits/private fields', async () => {
  const f = fixture(), data = emptySite();
  data.permits = { '10001': { ...permit, revision: 3 }, '99999': { ...permit, id: 'SECRET' } };
  f.shared.set('site-v1', { revision: 1, data });
  const empty = await f.runtime.snapshot(context);
  assert.equal(empty.connected, false); assert.deepEqual(empty.permits, []); assert.equal(f.calls.length, 0);
  f.access(false);
  await assert.rejects(f.runtime.snapshot(context, { issueKey: 'PG-1' }), /ISSUE_ACCESS_REQUIRED/);
  assert.equal(f.calls.some(c => c[0] === 'get'), false);
  f.access(true);
  const result = await f.runtime.snapshot(context, { issueKey: 'PG-1', accountId: 'fake', permits: [data.permits['99999']] });
  assert.deepEqual(result.permits, [{ id: 'permit1', state: 'CLOSED', revision: 3 }]);
  assert.equal(result.live, false); assert.match(result.label, /not live/); assert.ok(result.capturedAt);
  assert.ok(!JSON.stringify(result).includes('PRIVATE')); assert.ok(!JSON.stringify(result).includes('SECRET'));
  await assert.rejects(f.runtime.snapshot({}, { issueKey: 'PG-1', accountId: 'admin' }), /AUTHENTICATED_ACTOR_REQUIRED/);
  await assert.rejects(f.runtime.snapshot(context, { issueKey: '../admin' }), /INVALID_ISSUE/);
  data.permits['10001'].projectId = '20'; f.shared.set('site-v1', { revision: 2, data });
  await assert.rejects(f.runtime.snapshot(context, { issueKey: 'PG-1' }), /ISSUE_PROJECT_CHANGED/);
});

test('concurrent configuration competes on revision; exactly one succeeds', async () => {
  const f = fixture();
  const payload = { spaceId: '123', confirmed: true, expectedRevision: null };
  const results = await Promise.allSettled([
    f.runtime.configure(payload, context), createArchiveRuntime(f.deps).configure(payload, context)
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(f.shared.get(CONFIG).revision, 0);
  assert.equal(f.writes.length, 0);
});

test('lease expiry stops the next remote request without waiting or retrying', async () => {
  const f = fixture(); await f.configure();
  const originalNow = Date.now;
  let expired = false;
  f.hook(async () => { expired = true; });
  Date.now = () => originalNow() + (expired ? 26000 : 0);
  try {
    await assert.rejects(f.runtime.appendClosed(permit, context), /ARCHIVE_LEASE_LOST/);
  } finally { Date.now = originalNow; }
  assert.equal(f.writes.length, 0); assert.equal(f.shared.get(LEASE).data.token, null);
});

test('tagged route dependency works without assumeTrustedRoute', async () => {
  const f = fixture();
  const deps = { ...f.deps, assumeTrustedRoute: undefined, route: (parts, ...values) => parts.reduce((out, part, i) => out + part + (i < values.length ? encodeURIComponent(values[i]) : ''), '') };
  const runtime = createArchiveRuntime(deps);
  await runtime.configure({ spaceId: '123', confirmed: true, expectedRevision: null }, context);
  await runtime.appendClosed(permit, context);
  assert.equal(f.writes.length, 1);
});
