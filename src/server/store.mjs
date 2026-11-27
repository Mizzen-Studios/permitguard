import { createHash } from 'node:crypto';
/** Documented conditional CES transaction; no ordinary kvs.set fallback. */
export const ENTITY = 'permitguard-site';
export const SITE_KEY = 'site-v1';
export const MAX_BYTES = 180000;
/** Conservative byte allowance, not stored data or erasure. Every growth write must
 * leave room for each currently outstanding own-lock removal, ACTIVE->RELEASE and
 * close-out. Does not guarantee all future photos/verifications or recover legacy-full rows.
 * Timestamp reserve64bytes covers trusted ISO timestamps; revision allowance32bytes
 * exceeds serialized safe-integer growth. Known actor/lock IDs are measured as UTF-8.
 */
const bytes = value => Buffer.byteLength(JSON.stringify(value), 'utf8');
const STAMP_RESERVE = '0'.repeat(64);
export function lifecycleCapacity(data) {
  let reservedBytes = 0;
  const auditSize = (actorId, action, details={}) => bytes({actorId,at:STAMP_RESERVE,action,...details}) + 1 + 32;
  const largestAudit = (people,action) => Math.max(0,...(people||[]).map(actor=>auditSize(actor,action)));
  for (const permit of Object.values(data.permits||{})) {
    if(permit.state==='CLOSED') continue;
    for(const lock of permit.locks||[]) if(!lock.removedAt) reservedBytes += auditSize(lock.actorId,'PERSONAL_LOCK_REMOVED',{lockId:lock.lockId}) + bytes(STAMP_RESERVE); // null -> string, conservatively do not subtract null
    if(permit.state==='ACTIVE') reservedBytes += largestAudit(permit.workers,'RELEASE_REQUESTED') + 16;
    reservedBytes += largestAudit(permit.verifierIds,'PERMIT_ARCHIVED') + bytes({closedAt:STAMP_RESERVE}) + 32;
  }
  const usedBytes=bytes(data);
  return {usedBytes,reservedBytes,remainingBytes:MAX_BYTES-usedBytes-reservedBytes,limitBytes:MAX_BYTES};
}
export function requireLifecycleCapacity(data, {previousBudget=null,allowDraining=false}={}) {
 const budget=lifecycleCapacity(data);
 if(budget.remainingBytes<0 && !(allowDraining===true && previousBudget?.remainingBytes<0 && budget.usedBytes<=MAX_BYTES && budget.remainingBytes>previousBudget.remainingBytes)) throw new Error('LIFECYCLE_CAPACITY_RESERVED: no records changed; new evidence or planning must leave room for recorded lock removal and close-out');
 return budget;
}
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

/** Bounded latest challenge per authenticated actor/issue. Not an operational revision.
 * Final authorization is bound to the site's CAS revision; any successful site write
 * invalidates the token, so replay/concurrent consumption cannot authorize another write.
 */
export function forgeChallenges(kvs) {
 const key=(actorId,issueId)=>'pg-qr-v2:'+createHash('sha256').update(JSON.stringify([actorId,issueId])).digest('hex');
 return {put: c=>kvs.set(key(c.actorId,c.issueId),c),get:(actorId,issueId)=>kvs.get(key(actorId,issueId))};
}
