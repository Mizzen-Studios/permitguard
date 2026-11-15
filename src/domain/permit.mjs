/** Pure decision-support model. Server adapters must authenticate actors, authorize project
 * administration, persist atomically, and establish trusted QR/presence/photo evidence.
 * Never accept those assertions directly from an untrusted client. Not safety certification.
 */
export const STATES = Object.freeze(['PLAN', 'LOCK', 'VERIFY', 'ACTIVE', 'RELEASE', 'CLOSED']);
export const DEFAULT_POLICY = Object.freeze({ mode: 'WARN_ONLY', failMode: 'FAIL_CLOSED' });
const requireValue = (ok, message) => { if (!ok) throw new Error(message); };
const present = value => typeof value === 'string' && value.trim().length > 0;
const copy = value => structuredClone(value);
const audit = (permit, actorId, at, action, details = {}) => {
  requireValue(present(actorId) && present(at) && Number.isFinite(Date.parse(at)), 'Authenticated actor and valid timestamp required');
  permit.audit.push({ actorId, at, action, ...details });
};
export function configurePolicy(current, changes, { isProjectAdmin }) {
  requireValue(isProjectAdmin === true, 'Project administrator required');
  const next = { ...DEFAULT_POLICY, ...current, ...changes };
  requireValue(['WARN_ONLY', 'ENFORCE'].includes(next.mode), 'Invalid enforcement mode');
  requireValue(['FAIL_CLOSED', 'FAIL_OPEN_WITH_ALERT'].includes(next.failMode), 'Invalid failure mode');
  return next;
}
export function createPermit({ id, projectId, equipment, crewId, workers, verifierIds }) {
  requireValue(present(id) && present(projectId) && present(crewId), 'Permit, project and crew required');
  requireValue(equipment?.length > 0 && workers?.length > 0 && verifierIds?.length > 0, 'Equipment, workers and named verifier required');
  requireValue(new Set(workers).size === workers.length && workers.every(present), 'Unique authenticated workers required');
  requireValue(new Set(verifierIds).size === verifierIds.length && verifierIds.every(present), 'Unique named verifiers required');
  const points = equipment.flatMap(e => e.isolationPoints.map(p => ({ ...p, equipmentId: e.id })));
  requireValue(new Set(equipment.map(e => e.id)).size === equipment.length && equipment.every(e => present(e.id)), 'Unique equipment IDs required');
  requireValue(points.length > 0 && points.every(p => present(p.id) && present(p.energyType) && typeof p.highEnergy === 'boolean'), 'Valid isolation points required');
  requireValue(new Set(points.map(p => p.id)).size === points.length, 'Isolation point IDs must be unique');
  return { id, projectId, crewId, equipment: copy(equipment), workers: [...workers], verifierIds: [...verifierIds], state: 'PLAN', locks: [], verifications: [], activations: [], audit: [], revision: 0 };
}
const pointsFor = permit => permit.equipment.flatMap(e => e.isolationPoints.map(p => ({ ...p, equipmentId: e.id })));
const nextRevision = permit => { permit.revision += 1; return permit; };
export function beginLocking(original, actorId, at) {
  requireValue(original.state === 'PLAN', 'Permit must be in Plan');
  requireValue(original.workers.includes(actorId), 'Assigned worker required');
  const p = copy(original); p.state = 'LOCK'; audit(p, actorId, at, 'LOCKING_STARTED'); return nextRevision(p);
}
export function applyLock(original, { pointId, lockId, actorId, name, at, photoRef }, policy = DEFAULT_POLICY) {
  requireValue(['LOCK', 'VERIFY'].includes(original.state), 'Locks can only be applied before activation');
  requireValue(original.workers.includes(actorId), 'Only an assigned worker can apply their personal lock');
  requireValue(pointsFor(original).some(p => p.id === pointId), 'Unknown isolation point');
  requireValue(present(lockId) && present(name), 'Lock ID and worker name required');
  requireValue(!original.locks.some(l => l.lockId === lockId && !l.removedAt), 'Lock ID already applied');
  requireValue(!original.locks.some(l => l.pointId === pointId && l.actorId === actorId && !l.removedAt), 'Worker already has a lock on this point');
  requireValue(policy.mode !== 'ENFORCE' || present(photoRef), 'Lock photo required in Enforce mode');
  const p = copy(original);
  p.locks.push({ pointId, lockId, actorId, name, appliedAt: at, photoRef: photoRef || null, crewId: p.crewId, removedAt: null });
  p.verifications = []; // Any changed isolation evidence invalidates all prior verification.
  audit(p, actorId, at, 'PERSONAL_LOCK_APPLIED', { pointId, lockId }); return nextRevision(p);
}
function isolationIssues(permit, policy) {
  const reasons = [];
  for (const point of pointsFor(permit)) {
    for (const worker of permit.workers) {
      const lock = permit.locks.find(l => l.pointId === point.id && l.actorId === worker && !l.removedAt);
      if (!lock) reasons.push({ code: 'MISSING_LOCK', pointId: point.id, actorId: worker, message: worker + "'s personal lock is missing on " + point.id });
      else if (policy.mode === 'ENFORCE' && !present(lock.photoRef)) reasons.push({ code: 'MISSING_PHOTO', pointId: point.id, actorId: worker, message: 'Lock photo required for ' + lock.lockId });
    }
  }
  return reasons;
}
export function beginVerification(original, actorId, at, policy = DEFAULT_POLICY) {
  requireValue(original.state === 'LOCK', 'Permit must be in Lock');
  requireValue(original.workers.includes(actorId), 'Assigned worker required');
  requireValue(isolationIssues(original, policy).length === 0, 'Every assigned worker must lock every planned isolation point first');
  const p = copy(original); p.state = 'VERIFY'; audit(p, actorId, at, 'VERIFICATION_REQUESTED'); return nextRevision(p);
}
export function verifyPoint(original, { pointId, actorId, at, qrPointId, confirmedAtEquipment }) {
  requireValue(original.state === 'VERIFY', 'Permit must be in Verify');
  requireValue(original.verifierIds.includes(actorId), 'Named verifier required');
  requireValue(pointsFor(original).some(p => p.id === pointId), 'Unknown isolation point');
  requireValue(qrPointId === pointId && confirmedAtEquipment === true, 'Scan this isolation point QR and confirm at the equipment');
  requireValue(!original.verifications.some(v => v.pointId === pointId && v.actorId === actorId), 'Verifier already confirmed this point');
  const p = copy(original); p.verifications.push({ pointId, actorId, at }); audit(p, actorId, at, 'POINT_VERIFIED', { pointId }); return nextRevision(p);
}
export function checkReadiness(permit, { policy = DEFAULT_POLICY, registerAvailable = true } = {}) {
  const reasons = isolationIssues(permit, policy);
  if (!registerAvailable) reasons.push({ code: 'REGISTER_UNAVAILABLE', message: "Can't confirm readiness (Assets/register unavailable). Retry / Supervisor override (reason) / Warn-only (admins)" });
  if (permit.state !== 'VERIFY') reasons.push({ code: 'INVALID_STATE', message: 'Permit must be in Verify before work can start' });
  for (const point of pointsFor(permit)) {
    const verified = new Set(permit.verifications.filter(v => v.pointId === point.id && permit.verifierIds.includes(v.actorId)).map(v => v.actorId));
    const required = point.highEnergy ? 2 : 1;
    if (verified.size < required) reasons.push({ code: 'VERIFICATION_REQUIRED', pointId: point.id, message: point.id + ' requires ' + required + ' distinct named verifier(s)' });
  }
  // NOT CLEARED never becomes CLEARED merely because warn-only permits an advisory workflow transition.
  const cleared = reasons.length === 0;
  const onlyOutage = reasons.length > 0 && reasons.every(r => r.code === 'REGISTER_UNAVAILABLE');
  const advisoryAllowed = policy.mode === 'WARN_ONLY' || (onlyOutage && policy.failMode === 'FAIL_OPEN_WITH_ALERT');
  return { status: cleared ? 'CLEARED' : 'NOT CLEARED', reasons, transitionAllowed: cleared || advisoryAllowed, alertRequired: !cleared && advisoryAllowed };
}
export function requestActivation(original, { actorId, verifierId, at }) {
  requireValue(original.state === 'VERIFY', 'Activation can only be proposed in Verify');
  requireValue(original.verifierIds.includes(verifierId), 'Activation must be assigned to a named verifier');
  requireValue(!original.activations.some(a => a.status === 'PENDING'), 'An activation is already pending');
  const p = copy(original); const id = p.id + '-activation-' + (p.activations.length + 1);
  p.activations.push({ id, status: 'PENDING', requestedBy: actorId, verifierId, requestedAt: at });
  audit(p, actorId, at, 'ACTIVATION_PROPOSED', { activationId: id, verifierId }); return nextRevision(p);
}
export function confirmActivation(original, { activationId, actorId, at, qrEquipmentId, confirmedAtEquipment }, options = {}) {
  const readiness = checkReadiness(original, options);
  requireValue(readiness.status === 'CLEARED', 'NOT CLEARED: resolve readiness issues; advisory policy does not authorize activation');
  const activation = original.activations.find(a => a.id === activationId && a.status === 'PENDING');
  requireValue(activation && activation.verifierId === actorId, 'Assigned named verifier must confirm pending activation');
  requireValue(confirmedAtEquipment === true && original.equipment.some(e => e.id === qrEquipmentId), 'Equipment QR and on-site human confirmation required');
  const p = copy(original); Object.assign(p.activations.find(a => a.id === activationId), { status: 'CONFIRMED', confirmedAt: at, confirmedBy: actorId });
  p.state = 'ACTIVE'; audit(p, actorId, at, 'ACTIVATION_CONFIRMED', { activationId, qrEquipmentId }); return nextRevision(p);
}
export function beginRelease(original, actorId, at) {
  requireValue(original.state === 'ACTIVE', 'Permit must be Active');
  requireValue(original.workers.includes(actorId), 'Assigned worker required');
  const p = copy(original); p.state = 'RELEASE'; audit(p, actorId, at, 'RELEASE_REQUESTED'); return nextRevision(p);
}
export function removePersonalLock(original, { lockId, actorId, at }) {
  requireValue(['LOCK', 'VERIFY', 'RELEASE'].includes(original.state), 'Cannot remove lock while work is active or permit closed');
  const lock = original.locks.find(l => l.lockId === lockId && !l.removedAt);
  requireValue(lock && lock.actorId === actorId, 'Only the worker who applied this lock may remove it');
  const p = copy(original); p.locks.find(l => l.lockId === lockId && !l.removedAt).removedAt = at;
  p.verifications = []; if (p.state === 'VERIFY') p.state = 'LOCK';
  audit(p, actorId, at, 'PERSONAL_LOCK_REMOVED', { lockId }); return nextRevision(p);
}
export function checkRelease(permit, otherPermits = [], { registerAvailable = true } = {}) {
  // Equipment IDs must be site-wide canonical (Assets workspace/object or register UUID).
  // Project boundaries never clear a lock on shared equipment.
  const pointIds = new Set(pointsFor(permit).map(p => p.equipmentId + ':' + p.id));
  const reasons = [];
  if (!registerAvailable) reasons.push({ code: 'REGISTER_UNAVAILABLE', message: "Can't confirm release (Assets/register unavailable)" });
  if (permit.state !== 'RELEASE') reasons.push({ code: 'INVALID_STATE', message: 'Permit must be in Release' });
  for (const p of [permit, ...otherPermits.filter(p => p.id !== permit.id || p.projectId !== permit.projectId)]) {
    const sharedPointIds = new Set(pointsFor(p).filter(point => pointIds.has(point.equipmentId + ':' + point.id)).map(point => point.id));
    for (const lock of p.locks.filter(l => !l.removedAt && sharedPointIds.has(l.pointId))) reasons.push({ code: 'LOCK_REMAINS', crewId: p.crewId, lockId: lock.lockId, pointId: lock.pointId, message: p.crewId + "'s lock " + lock.lockId + ' is still on ' + lock.pointId });
  }
  return { status: reasons.length ? 'NOT CLEARED' : 'CLEARED', reasons, transitionAllowed: reasons.length === 0 };
}
export function closePermit(original, { actorId, at, otherPermits = [], registerAvailable = true }) {
  requireValue(original.verifierIds.includes(actorId), 'Named verifier required for close-out');
  requireValue(checkRelease(original, otherPermits, { registerAvailable }).status === 'CLEARED', 'Release blocked: a lock remains or readiness is unavailable');
  const p = copy(original); p.state = 'CLOSED'; p.closedAt = at; audit(p, actorId, at, 'PERMIT_ARCHIVED'); return nextRevision(p);
}
export function permitEntityProperty(permit) {
  return { schemaVersion: 1, permitId: permit.id, state: permit.state, crewId: permit.crewId, revision: permit.revision, updatedAt: permit.audit.at(-1)?.at ?? null };
}
