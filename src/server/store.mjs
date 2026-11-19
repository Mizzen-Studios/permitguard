/** Documented conditional CES transaction; no ordinary kvs.set fallback. */
export const ENTITY = 'permitguard-site';
export const SITE_KEY = 'site-v1';
export const MAX_BYTES = 180000;
export const emptySite = () => ({ schemaVersion: 1, permits: {}, projects: {}, evidence: {}, challenges: {} });
export function forgeStore({ kvs, Filter, FilterConditions }) {
  if (!kvs?.transact || !Filter || !FilterConditions?.notExists || !FilterConditions?.equalTo) throw new Error('ATOMIC_STORAGE_UNAVAILABLE');
  return {
    atomic: true,
    async read() {
      const row = await kvs.entity(ENTITY).get(SITE_KEY);
      if (!row) return { revision: null, data: emptySite() };
      if (!Number.isSafeInteger(row.revision) || row.data?.schemaVersion !== 1) throw new Error('STORAGE_INVALID');
      return structuredClone(row);
    },
    async commit(expected, data) {
      if (Buffer.byteLength(JSON.stringify(data), 'utf8') > MAX_BYTES) throw new Error('SITE_CAPACITY_REACHED: no records omitted; archive/export design required');
      const condition = expected === null ? FilterConditions.notExists() : FilterConditions.equalTo(expected);
      const revision = expected === null ? 0 : expected + 1;
      // Every mutation, including close, competes on this one site-wide revision.
      await kvs.transact().set(SITE_KEY, { revision, data }, { entityName: ENTITY, conditions: new Filter().and('revision', condition) }).execute();
      return revision;
    }
  };
}

/** Explicit maintenance probe: separate synthetic CES row; never reads operational permits.
 * Caller must authorize the maintenance endpoint. Leaves one bounded synthetic row.
 */
export async function storageHealth({ kvs, Filter, FilterConditions, key = 'health-v1' }) {
  if (key !== 'health-v1') throw new Error('HEALTH_KEY_FORBIDDEN');
  const current = await kvs.entity(ENTITY).get(key);
  if (current && (!Number.isSafeInteger(current.revision) || current.data?.synthetic !== true)) throw new Error('HEALTH_ROW_INVALID');
  const expected = current?.revision ?? null;
  const revision = expected === null ? 0 : expected + 1;
  const condition = expected === null ? FilterConditions.notExists() : FilterConditions.equalTo(expected);
  await kvs.transact().set(key, { revision, data: { synthetic: true } }, { entityName: ENTITY, conditions: new Filter().and('revision', condition) }).execute();
  const checked = await kvs.entity(ENTITY).get(key);
  if (checked?.revision !== revision || checked.data?.synthetic !== true) throw new Error('HEALTH_READBACK_CONFLICT');
  // A stale conditional write must fail. Never retry an uncertain write.
  let staleRejected = false;
  try { await kvs.transact().set(key, { revision: revision + 1, data: { synthetic: true } }, { entityName: ENTITY, conditions: new Filter().and('revision', condition) }).execute(); }
  catch (error) {
    // Network/permission errors are not proof of a compare-and-swap rejection.
    if (/condition|conflict/i.test(String(error?.code || '') + ' ' + String(error?.message || ''))) staleRejected = true;
    else throw error;
  }
  if (!staleRejected) throw new Error('ATOMIC_STORAGE_PROBE_FAILED');
  return { synthetic: true, operationalPermitsRead: false, conditionalWrite: true, readback: true, staleWriteRejected: true };
}
