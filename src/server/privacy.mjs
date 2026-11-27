import { createHash } from 'node:crypto';
const need = (ok, code) => { if (!ok) throw new Error(code); };
export const validAccount = value => typeof value === 'string' && value !== 'unknown' && /^[A-Za-z0-9:-]{1,128}$/.test(value);
const validTime = value => {
  if (typeof value !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:[.][0-9]+)?(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const year=Number(value.slice(0,4)), month=Number(value.slice(5,7)), day=Number(value.slice(8,10));
  const leap=year%4===0 && (year%100!==0 || year%400===0);
  return month>=1 && month<=12 && day>=1 && day<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1] && Number(value.slice(11,13))<24 && Number(value.slice(14,16))<60 && Number(value.slice(17,19))<60;
};
const identityKeys = new Set(['actorId','accountId','verifierId','requestedBy','confirmedBy','sampleOwner']);
const identityArrays = new Set(['workers','verifierIds','allowedUserIds']);
const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** Structured-field inventory only. Event times are NOT profile retrieval times.
 * retrievalAges must come from a future trusted provenance store, never client input. */
export function privacyInventory({ site, archiveConfig = null, retrievalAges = {} }) {
  need(site?.schemaVersion === 1, 'PRIVACY_STORAGE_INVALID');
  need(Buffer.byteLength(JSON.stringify({site,archiveConfig})) <= 220000, 'PRIVACY_INVENTORY_LIMIT');
  const found = new Set(); let invalidIdentityCount = 0, nodes = 0;
  const add = id => { if (id === 'unknown') return; if (validAccount(id)) found.add(id); else invalidIdentityCount++; };
  function scan(value, depth = 0) {
    need(depth <= 32 && ++nodes <= 30000, 'PRIVACY_INVENTORY_LIMIT');
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (identityKeys.has(key) && item != null) add(item);
      else if (identityArrays.has(key)) { need(Array.isArray(item), 'PRIVACY_STORAGE_INVALID'); item.forEach(add); }
      else if (key !== 'data' && item && typeof item === 'object') scan(item, depth + 1);
    }
  }
  scan(site); if (archiveConfig) scan(archiveConfig);
  const accounts = [...found].sort().map(accountId => ({accountId, updatedAt: validTime(retrievalAges[accountId]) ? retrievalAges[accountId] : null}));
  return {accounts, invalidIdentityCount, unknownAgeCount:accounts.filter(a=>!a.updatedAt).length,
    coverage:'STRUCTURED_SITE_AND_ARCHIVE_CONFIG_ONLY', complete:false,
    gaps:['QR_KVS_KEYS_NOT_ENUMERATED','CONFLUENCE_ARCHIVE_AND_VERSIONS','FREE_TEXT_AND_PHOTO_SUBJECTS','PROVIDER_LOGS_BACKUPS_SUPPORT'],
    fingerprint:fingerprint({site,archiveConfig,retrievalAges})};
}
/** Content-bound cursor reveals no identity. */
export function inventoryPage(inventory, {cursor = null, limit = 90} = {}) {
  need(Number.isInteger(limit) && limit >= 1 && limit <= 90, 'PRIVACY_BATCH_LIMIT');
  let offset = 0;
  if (cursor !== null) {
    need(typeof cursor === 'string' && cursor.length <= 100 && /^[a-f0-9]{64}:[0-9]+$/.test(cursor), 'PRIVACY_CURSOR_INVALID');
    const [hash, number] = cursor.split(':'); offset = Number(number);
    need(hash === inventory.fingerprint, 'PRIVACY_CURSOR_STALE');
    need(Number.isSafeInteger(offset) && offset > 0 && offset < inventory.accounts.length, 'PRIVACY_CURSOR_INVALID');
  }
  const accounts = inventory.accounts.slice(offset, offset + limit);
  const next = offset + accounts.length;
  return {accounts, nextCursor:next < inventory.accounts.length ? inventory.fingerprint + ':' + next : null};
}
/** One <=90-account SDK call; caller owns durable cycle/cursor/action tracking.
 * No retries, timers, writes, scheduling or erasure. */
export async function reportPrivacyBatch({ accounts, reportPersonalData }) {
  need(Array.isArray(accounts) && accounts.length <= 90 && accounts.every(a => a && validAccount(a.accountId) && validTime(a.updatedAt)) && new Set(accounts.map(a=>a.accountId)).size === accounts.length, 'PRIVACY_REPORT_INPUT_INVALID');
  need(typeof reportPersonalData === 'function', 'PRIVACY_REPORT_ADAPTER_REQUIRED');
  if (!accounts.length) return {status:'EMPTY',actions:[],erasurePerformed:false};
  let updates;
  try { updates = await reportPersonalData(accounts.map(({accountId,updatedAt})=>({accountId,updatedAt}))); }
  catch (error) {
    const status = Number(error?.status);
    const raw = error?.headers?.get?.('Retry-After');
    const seconds = typeof raw === 'string' && /^[0-9]{1,8}$/.test(raw) ? Number(raw) : null;
    return {status:'UNCONFIRMED',code:status===429?'RATE_LIMITED':'PRIVACY_REPORT_FAILED',retryAfterSeconds:seconds,actions:[],erasurePerformed:false,advanceCursor:false};
  }
  need(Array.isArray(updates) && updates.length <= accounts.length && updates.every(a=>a && accounts.some(sent=>sent.accountId===a.accountId) && ['closed','updated'].includes(a.status)) && new Set(updates.map(a=>a.accountId)).size === updates.length, 'PRIVACY_REPORT_RESPONSE_INVALID');
  return {status:updates.length?'REPORTED_ACTIONS_PENDING':'REPORTED_NO_ACTIONS',actions:updates.map(a=>({accountId:a.accountId,reason:a.status,requiredAction:a.status==='closed'?'ERASURE_REVIEW_REQUIRED':'ERASE_OR_REFRESH_REVIEW_REQUIRED'})),erasurePerformed:false,advanceCursor:false,requiresDurableCheckpoint:true,cycleHeaderAvailable:false};
}
/** Planning only: closed records still require policy and external-copy review. */
export function privacyPlan(site, accountId, {closedBefore = null} = {}) {
  need(validAccount(accountId), 'PRIVACY_ACCOUNT_INVALID');
  need(closedBefore === null || validTime(closedBefore), 'PRIVACY_RETENTION_INVALID');
  const inventory = privacyInventory({site});
  const records = Object.values(site.permits || {}).filter(permit=>privacyInventory({site:{schemaVersion:1,permits:{one:permit}}}).accounts.some(a=>a.accountId===accountId));
  let activeLocks = 0, openPermits = 0, reviewCandidates = 0, missingCloseAge = 0;
  for (const p of records) {
    const outstanding = (p.locks || []).filter(l=>!l.removedAt).length;
    activeLocks += outstanding;
    if (p.state !== 'CLOSED' || outstanding) {openPermits++; continue;}
    const closedAt = [...(p.audit || [])].reverse().find(a=>a.action==='PERMIT_ARCHIVED')?.at;
    if (!validTime(closedAt)) missingCloseAge++;
    else if (closedBefore && Date.parse(closedAt) < Date.parse(closedBefore)) reviewCandidates++;
  }
  return {dryRun:true,complete:false,coverage:inventory.coverage,gaps:inventory.gaps,erasurePerformed:false,mutationSupported:false,associatedPermits:records.length,activeLocks,openPermits,reviewCandidates,missingCloseAge,
    retentionPolicyApproved:false,reportingAgeUnknown:inventory.accounts.some(a=>a.accountId===accountId&&!a.updatedAt),
    disposition:activeLocks||openPermits?'SAFETY_HOLD_REQUIRES_HUMAN_RECONCILIATION':'POLICY_AND_EXTERNAL_COPY_REVIEW_REQUIRED',
    warning:'No removal, anonymisation, clearance or compliance is asserted. A safety hold is not a legal exemption from erasure obligations.'};
}
