import { randomUUID } from 'node:crypto';
import { createConfluenceArchive, lockBoardSnapshot } from '../integrations/confluence.mjs';
import { ENTITY, forgeStore } from '../server/store.mjs';

const CONFIG = 'archive-config-v1';
// One reusable durable lease row bounds storage (serializes all monthly appends).
const LEASE = 'archive-month-lease-v1';
const LEASE_MS = 25000;
const need = (ok, code) => { if (!ok) throw new Error(code); };
const conflict = error => /condition|conflict/i.test(String(error?.code || '') + ' ' + String(error?.message || ''));
const actor = context => { need(typeof context?.accountId === 'string' && context.accountId.trim(), 'AUTHENTICATED_ACTOR_REQUIRED'); return context.accountId; };
const userId = value => typeof value === 'string' && value.length > 0 && value.length <= 200 && /^[A-Za-z0-9:_-]+$/.test(value);

/** Minimum additional granular scopes: read:space:confluence,
 * read:space.permission:confluence, read:page:confluence, write:page:confluence.
 * Existing Jira read/manage scopes and storage:app are also required. No live-site claim.
 * All remote operations use the current invocation's asUser identity.
 */
export function createArchiveRuntime({ kvs, Filter, FilterConditions, api, route, assumeTrustedRoute }) {
  const store = forgeStore({ kvs, Filter, FilterConditions });
  need(api?.asUser && (route || assumeTrustedRoute), 'ARCHIVE_ADAPTER_REQUIRED');
  const readRow = async key => {
    const row = await kvs.entity(ENTITY).get(key);
    need(!row || (Number.isSafeInteger(row.revision) && row.revision >= 0 && row.data), 'ARCHIVE_STORAGE_INVALID');
    return row;
  };
  const condition = row => new Filter().and('revision', row ? FilterConditions.equalTo(row.revision) : FilterConditions.notExists());
  const entity = row => ({ entityName: ENTITY, conditions: condition(row) });
  const next = (row, data) => ({ revision: row ? row.revision + 1 : 0, data });
  async function admin(context) {
    actor(context);
    const path = assumeTrustedRoute ? assumeTrustedRoute('/rest/api/3/mypermissions?permissions=ADMINISTER') : route`/rest/api/3/mypermissions?permissions=ADMINISTER`;
    const response = await api.asUser().requestJira(path);
    need(response?.ok, 'SITE_ADMIN_REQUIRED');
    need((await response.json()).permissions?.ADMINISTER?.havePermission === true, 'SITE_ADMIN_REQUIRED');
  }
  // Helper-generated paths only; never accept a client URL. Tagged routes retain Forge escaping.
  function confluenceRoute(path) {
    if (assumeTrustedRoute) return assumeTrustedRoute(path);
    const u = new URL(path, 'https://local.invalid');
    let m;
    if ((m = u.pathname.match(/^\/wiki\/api\/v2\/spaces\/([A-Za-z0-9_-]+)$/))) return route`/wiki/api/v2/spaces/${m[1]}?include-operations=true`;
    if ((m = u.pathname.match(/^\/wiki\/api\/v2\/spaces\/([A-Za-z0-9_-]+)\/permissions$/))) {
      return u.searchParams.has('cursor') ? route`/wiki/api/v2/spaces/${m[1]}/permissions?limit=250&cursor=${u.searchParams.get('cursor')}` : route`/wiki/api/v2/spaces/${m[1]}/permissions?limit=250`;
    }
    if ((m = u.pathname.match(/^\/wiki\/api\/v2\/pages\/([A-Za-z0-9_-]+)$/))) return u.search ? route`/wiki/api/v2/pages/${m[1]}?body-format=storage` : route`/wiki/api/v2/pages/${m[1]}`;
    need(u.pathname === '/wiki/api/v2/pages', 'INVALID_ARCHIVE_ROUTE');
    return u.search ? route`/wiki/api/v2/pages?space-id=${u.searchParams.get('space-id')}&title=${u.searchParams.get('title')}&status=current&limit=2` : route`/wiki/api/v2/pages`;
  }
  function archive(config, context, withMonthLock, beforeRequest = async () => {}) {
    return createConfluenceArchive({
      requireAdmin: () => admin(context), loadConfig: async () => config, withMonthLock,
      requestConfluence: async (path, options = {}) => {
        await beforeRequest();
        const response = await api.asUser().requestConfluence(confluenceRoute(path), {
          ...options, ...(options.body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(options.body) } : {})
        });
        // Stricter than the generic helper: reject EVERY non-user assignment, even non-read.
        if (/\/permissions(?:\?|$)/.test(path) && response?.ok) {
          const body = await response.json();
          need(Array.isArray(body.results) && body.results.every(p => p.principal?.type === 'user' && config.allowedUserIds.includes(p.principal.id)), 'NAMED_USERS_ONLY');
          return { ok: true, status: response.status, json: async () => body };
        }
        return response;
      }
    });
  }
  async function configure(payload, context) {
    const accountId = actor(context);
    await admin(context);
    need(payload?.confirmed === true && typeof payload.spaceId === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(payload.spaceId), 'ADMIN_CONFIRMATION_REQUIRED');
    const users = payload.allowedUserIds === undefined ? [accountId] : payload.allowedUserIds;
    need(Array.isArray(users) && users.length > 0 && users.length <= 50 && users.every(userId) && users.includes(accountId), 'INVALID_ALLOWED_USERS');
    const current = await readRow(CONFIG);
    need(payload.expectedRevision === (current?.revision ?? null), 'ARCHIVE_CONFIG_CONFLICT');
    const config = { spaceId: payload.spaceId, allowedUserIds: [...new Set(users)], allowedGroupIds: [], defaultGroupIds: [], defaultGroupsVerified: true,
      confirmed: true, confirmedBy: accountId, confirmedAt: new Date().toISOString() };
    await archive(config, context).validateConfiguredSpace();
    const lease = await readRow(LEASE);
    need(!lease?.data.token || lease.data.expiresAt <= Date.now(), 'ARCHIVE_BUSY');
    const row = next(current, config);
    await kvs.transact().check(LEASE, entity(lease)).set(CONFIG, row, entity(current)).execute();
    return { configured: true, revision: row.revision, ...structuredClone(config) };
  }
  async function configuration(context) {
    await admin(context);
    const row = await readRow(CONFIG);
    return row ? { configured: true, revision: row.revision, ...structuredClone(row.data) } : { configured: false, revision: null };
  }
  async function appendClosed(permit, context) {
    await admin(context);
    const configRow = await readRow(CONFIG);
    need(configRow?.data.confirmed === true, 'ADMIN_CONFIRMATION_REQUIRED');
    const config = configRow.data;
    need(config.allowedUserIds?.includes(actor(context)), 'UNAPPROVED_ARCHIVE_USER');
    const withMonthLock = async (month, fn) => {
      const old = await readRow(LEASE);
      need(!old?.data.token || old.data.expiresAt <= Date.now(), 'ARCHIVE_BUSY');
      const token = randomUUID(), expiresAt = Date.now() + LEASE_MS;
      const owned = next(old, { token, expiresAt, month });
      try { await kvs.transact().check(CONFIG, entity(configRow)).set(LEASE, owned, entity(old)).execute(); }
      catch (error) { if (conflict(error)) throw new Error('ARCHIVE_BUSY'); throw error; }
      const check = async () => {
        const [lease, configNow] = await Promise.all([readRow(LEASE), readRow(CONFIG)]);
        need(lease?.revision === owned.revision && lease.data.token === token && Date.now() < expiresAt && configNow?.revision === configRow.revision, 'ARCHIVE_LEASE_LOST');
      };
      try { return await fn(check); }
      finally {
        const lease = await readRow(LEASE);
        if (lease?.revision === owned.revision && lease.data.token === token) {
          try { await kvs.transact().set(LEASE, next(lease, { token: null, expiresAt: 0, month: null }), entity(lease)).execute(); }
          catch (error) { if (!conflict(error)) throw error; }
        }
      }
    };
    let checkLease = async () => { throw new Error('ARCHIVE_LEASE_REQUIRED'); };
    return archive(config, context, (month, fn) => withMonthLock(month, async check => { checkLease = check; return fn(); }), () => checkLease()).append(permit);
  }
  async function snapshot(context, payload = {}) {
    actor(context);
    const input = payload.issueKey ?? context?.extension?.issue?.id ?? context?.issueId;
    if (!input) return lockBoardSnapshot({ permits: [], capturedAt: new Date().toISOString(), connected: false });
    need(typeof input === 'string' && input.length <= 100 && /^(?:[0-9]+|[A-Za-z][A-Za-z0-9_]*-[1-9][0-9]*)$/.test(input), 'INVALID_ISSUE');
    const path = assumeTrustedRoute ? assumeTrustedRoute('/rest/api/3/issue/' + encodeURIComponent(input) + '?fields=project') : route`/rest/api/3/issue/${input}?fields=project`;
    const response = await api.asUser().requestJira(path);
    need(response?.ok, 'ISSUE_ACCESS_REQUIRED');
    const issue = await response.json();
    need(typeof issue.id === 'string' && /^[0-9]+$/.test(issue.id) && issue.fields?.project?.id, 'INVALID_ISSUE');
    const row = await store.read();
    let permit = row.data.permits[issue.id];
    // Product installations can have separate storage partitions. Read only the
    // authorized work item's NONAUTHORITATIVE integration property as fallback.
    if (!permit) {
      const propertyPath = assumeTrustedRoute ? assumeTrustedRoute('/rest/api/3/issue/' + issue.id + '/properties/permitguard.snapshot') : route`/rest/api/3/issue/${issue.id}/properties/permitguard.snapshot`;
      const propertyResponse = await api.asUser().requestJira(propertyPath);
      if (propertyResponse.ok) {
        const value = (await propertyResponse.json()).value;
        need(value?.schemaVersion === 1 && typeof value.permitId === 'string' && Number.isSafeInteger(value.revision), 'INVALID_SNAPSHOT_PROPERTY');
        permit = { id:value.permitId, projectId:String(issue.fields.project.id), state:value.state, revision:value.revision, activeLockCount:value.activeLockCount };
      } else need(propertyResponse.status === 404, 'SNAPSHOT_PROPERTY_UNAVAILABLE');
    }
    need(!permit || permit.projectId === String(issue.fields.project.id), 'ISSUE_PROJECT_CHANGED');
    return lockBoardSnapshot({ permits: permit ? [permit] : [], capturedAt: new Date().toISOString(), connected: true });
  }
  return { configure, appendClosed, configuration, snapshot };
}
