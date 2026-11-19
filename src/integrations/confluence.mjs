const assert = (ok, code) => { if (!ok) throw new Error(code); };
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
async function json(response) { assert(response?.ok, 'CONFLUENCE_HTTP_' + response?.status); return response.json(); }
const id = value => { assert(/^[A-Za-z0-9_-]+$/.test(value), 'INVALID_ID'); return value; };
/** Explicit read allowlist only. Role/access-class/anonymous and unknown assignment forms refuse publication. */
export function checkRestrictedSpace(assignments, config) {
  assert(config?.confirmed === true && config.confirmedBy && config.confirmedAt && Number.isFinite(Date.parse(config.confirmedAt)), 'ADMIN_CONFIRMATION_REQUIRED');
  assert(Array.isArray(assignments) && assignments.length > 0, 'PERMISSIONS_UNKNOWN');
  const readers = [];
  for (const entry of assignments) {
    assert(entry?.operation?.key && entry.operation.targetType && entry.principal?.type && entry.principal.id, 'PERMISSIONS_UNKNOWN');
    // Refuse unknown principal kinds even on non-read permissions: RBAC may confer read implicitly.
    assert(['user', 'group'].includes(entry.principal.type), 'BROAD_OR_ROLE_ACCESS');
    if (entry.operation.key === 'read' && entry.operation.targetType === 'space') {
      const allowed = entry.principal.type === 'user' ? config.allowedUserIds : config.allowedGroupIds;
      assert(Array.isArray(allowed) && allowed.includes(entry.principal.id), 'UNAPPROVED_READER');
      assert(!(config.defaultGroupIds ?? []).includes(entry.principal.id), 'DEFAULT_GROUP_ACCESS');
      readers.push(entry.principal);
    }
  }
  assert(readers.length > 0 && config.defaultGroupsVerified === true, 'RESTRICTIONS_UNVERIFIED');
  return { restricted: true, readers };
}
export function closedPermitEntry(permit) {
  assert(permit?.state === 'CLOSED' && permit.id && permit.projectId && Number.isFinite(Date.parse(permit.closedAt)), 'CLOSED_PERMIT_REQUIRED');
  const key = encodeURIComponent(permit.projectId) + ':' + encodeURIComponent(permit.id);
  const marker = '<p>PermitGuard record ' + escape(key) + '</p>';
  return { month: new Date(permit.closedAt).toISOString().slice(0, 7), marker,
    html: marker + '<p>Closed permit ' + escape(permit.id) + ' | project ' + escape(permit.projectId) + ' | closed ' + escape(permit.closedAt) + ' | state CLOSED</p>' };
}
/** All calls as current user. No app/user impersonation. withMonthLock MUST serialize creation
 * using durable transactional app storage; an in-memory lock is insufficient across invocations. */
export function createConfluenceArchive({ requestConfluence, requireAdmin, loadConfig, withMonthLock }) {
  async function restrictionCheck(config) {
    const spaceId = id(config.spaceId);
    const space = await json(await requestConfluence('/wiki/api/v2/spaces/' + spaceId + '?include-operations=true'));
    assert(space.id === spaceId && space.status === 'current', 'SPACE_UNAVAILABLE');
    assert(space.operations?.results?.some(o => o.operation === 'administer' && o.targetType === 'space'), 'SPACE_ADMIN_REQUIRED');
    const permissions = []; let path = '/wiki/api/v2/spaces/' + spaceId + '/permissions?limit=250';
    for (let i = 0; i < 100; i++) {
      const data = await json(await requestConfluence(path));
      assert(Array.isArray(data.results), 'PERMISSIONS_UNKNOWN'); permissions.push(...data.results);
      const next = data._links?.next;
      if (!next) return checkRestrictedSpace(permissions, config);
      const url = new URL(next, 'https://local.invalid');
      // Only preserve cursor, never follow a server-provided arbitrary URL or another space.
      assert(url.pathname === '/wiki/api/v2/spaces/' + spaceId + '/permissions' || url.pathname === '/spaces/' + spaceId + '/permissions', 'INVALID_PERMISSION_PAGE');
      assert(url.searchParams.get('cursor'), 'INVALID_PERMISSION_CURSOR');
      path = '/wiki/api/v2/spaces/' + spaceId + '/permissions?limit=250&cursor=' + encodeURIComponent(url.searchParams.get('cursor'));
    }
    throw new Error('PERMISSION_PAGE_LIMIT');
  }
  return {
    async append(permit) {
      await requireAdmin();
      const config = await loadConfig();
      // Validate configuration before even attempting the lock/any write.
      assert(config?.confirmed === true && config.spaceId && config.confirmedBy, 'ADMIN_CONFIRMATION_REQUIRED');
      assert(typeof withMonthLock === 'function', 'DURABLE_MONTH_LOCK_REQUIRED');
      const entry = closedPermitEntry(permit);
      return withMonthLock(config.spaceId + ':' + entry.month, async () => {
        const title = 'PermitGuard closed permits ' + entry.month;
        await restrictionCheck(config);
        const found = await json(await requestConfluence('/wiki/api/v2/pages?space-id=' + id(config.spaceId) + '&title=' + encodeURIComponent(title) + '&status=current&limit=2'));
        assert(Array.isArray(found.results) && found.results.length <= 1 && !found._links?.next, 'AMBIGUOUS_MONTH_PAGE');
        let pageId = found.results[0]?.id;
        if (!pageId) {
          await restrictionCheck(config);
          const created = await json(await requestConfluence('/wiki/api/v2/pages', { method: 'POST', body: { spaceId: config.spaceId, status: 'current', title, body: { representation: 'storage', value: '<p>PermitGuard monthly closed register. Decision support only.</p>' + entry.html } } }));
          assert(created.id, 'CREATE_UNCONFIRMED');
          return { status: 'APPENDED', pageId: created.id, month: entry.month };
        }
        for (let attempt = 0; attempt < 3; attempt++) {
          const page = await json(await requestConfluence('/wiki/api/v2/pages/' + id(pageId) + '?body-format=storage'));
          assert(page.spaceId === config.spaceId && page.title === title && page.status === 'current' && Number.isInteger(page.version?.number) && typeof page.body?.storage?.value === 'string', 'INVALID_MONTH_PAGE');
          if (page.body.storage.value.includes(entry.marker)) return { status: 'ALREADY_ARCHIVED', pageId, month: entry.month };
          await restrictionCheck(config); // no write when restriction status is stale/uncertain
          const result = await requestConfluence('/wiki/api/v2/pages/' + id(pageId), { method: 'PUT', body: { id: pageId, status: 'current', title: page.title, body: { representation: 'storage', value: page.body.storage.value + entry.html }, version: { number: page.version.number + 1, message: 'Append closed permit' } } });
          if (result.status === 409) continue; // refetch full latest body; never retry an old overwrite
          await json(result);
          return { status: 'APPENDED', pageId, month: entry.month };
        }
        throw new Error('VERSION_CONFLICT_RETRY_EXHAUSTED');
      });
    },
    async validateConfiguredSpace() { await requireAdmin(); return restrictionCheck(await loadConfig()); }
  };
}
/** Macro backend contract. Caller must authorize access to every permit before supplying it. */
export function lockBoardSnapshot({ permits, capturedAt, connected = false, now = Date.now(), maxAgeMs = 300000 }) {
  assert(Array.isArray(permits) && Number.isFinite(Date.parse(capturedAt)), 'SNAPSHOT_REQUIRED');
  const age = now - Date.parse(capturedAt);
  assert(age >= 0, 'FUTURE_SNAPSHOT');
  return { kind: 'PERMITGUARD_LOCK_BOARD_SNAPSHOT', live: false, capturedAt, stale: age > maxAgeMs, connected: connected === true,
    label: 'Snapshot at ' + capturedAt + ' — not live; consult current PermitGuard state before acting.',
    permits: permits.map(p => { assert(p.id && ['PLAN', 'LOCK', 'VERIFY', 'ACTIVE', 'RELEASE', 'CLOSED'].includes(p.state), 'INVALID_PERMIT'); return { id: p.id, state: p.state, revision: p.revision, ...(Number.isInteger(p.activeLockCount) ? {activeLockCount:p.activeLockCount} : {}) }; }) };
}
