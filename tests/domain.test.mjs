import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../src/domain/permit.mjs';
import { createSamplePlant, SAMPLE_EQUIPMENT } from '../src/domain/sample.mjs';
const at = '2026-11-15T12:00:00.000Z';
const enforce = { mode: 'ENFORCE', failMode: 'FAIL_CLOSED' };
const setup = (highEnergy = false, workers = ['worker']) => d.createPermit({ id: 'P1', projectId: 'SAMPLE', equipment: [{ id: 'EQ-1', isolationPoints: [{ id: 'V-3', energyType: 'HYDRAULIC', highEnergy }] }], crewId: 'Crew A', workers, verifierIds: ['verifier', 'verifier2'] });
const lock = (p, worker = 'worker', lockId = 'L-01') => d.applyLock(p, { actorId: worker, lockId, pointId: 'V-3', name: worker, at, photoRef: 'photo:trusted-storage-reference' }, enforce);
const verify = (p, actorId = 'verifier') => d.verifyPoint(p, { actorId, pointId: 'V-3', at, qrPointId: 'V-3', confirmedAtEquipment: true });
const ready = (high = false) => { let p = lock(d.beginLocking(setup(high), 'worker', at)); p = d.beginVerification(p, 'worker', at, enforce); p = verify(p); return high ? verify(p, 'verifier2') : p; };
const activate = p => { p = d.requestActivation(p, { actorId: 'planning-agent', verifierId: 'verifier', at }); return d.confirmActivation(p, { activationId: p.activations[0].id, actorId: 'verifier', at, qrEquipmentId: 'EQ-1', confirmedAtEquipment: true }, { policy: enforce }); };
test('installation policy is advisory and fail-closed by default; only project admin opts in', () => {
  assert.deepEqual(d.DEFAULT_POLICY, { mode: 'WARN_ONLY', failMode: 'FAIL_CLOSED' });
  assert.throws(() => d.configurePolicy({}, enforce, { isProjectAdmin: false }), /administrator/);
  assert.deepEqual(d.configurePolicy({}, enforce, { isProjectAdmin: true }), enforce);
  assert.throws(() => d.configurePolicy({}, { mode: 'anything' }, { isProjectAdmin: true }), /Invalid/);
});
test('per-worker personal lock evidence and ownership are required', () => {
  const p = d.beginLocking(setup(), 'worker', at);
  assert.throws(() => d.applyLock(p, { actorId: 'worker', pointId: 'V-3', name: 'Worker', lockId: 'L-01', at }, enforce), /photo/);
  assert.throws(() => lock(p, 'stranger'), /assigned/);
  const locked = lock(p);
  assert.equal(p.locks.length, 0);
  assert.throws(() => d.removePersonalLock(locked, { lockId: 'L-01', actorId: 'other', at }), /Only the worker/);
  assert.throws(() => lock(locked), /already/);
  assert.throws(() => d.beginVerification(p, 'worker', at, enforce), /Every assigned worker/);
});
test('each worker must lock every point, not just one crew lock', () => {
  let p = d.beginLocking(setup(false, ['worker', 'worker2']), 'worker', at); p = lock(p);
  assert.throws(() => d.beginVerification(p, 'worker', at, enforce), /Every assigned worker/);
  p = lock(p, 'worker2', 'L-02'); assert.equal(d.beginVerification(p, 'worker', at, enforce).state, 'VERIFY');
});
test('high energy requires two distinct named human verifiers', () => {
  let p = lock(d.beginLocking(setup(true), 'worker', at)); p = d.beginVerification(p, 'worker', at, enforce); p = verify(p);
  assert.equal(d.checkReadiness(p, { policy: enforce }).status, 'NOT CLEARED');
  assert.throws(() => verify(p), /already confirmed/);
  assert.throws(() => verify(p, 'outsider'), /Named verifier/);
  p = verify(p, 'verifier2'); assert.equal(d.checkReadiness(p, { policy: enforce }).status, 'CLEARED');
});
test('QR match and present confirmation required for point verification', () => {
  const p = d.beginVerification(lock(d.beginLocking(setup(), 'worker', at)), 'worker', at, enforce);
  assert.throws(() => d.verifyPoint(p, { actorId: 'verifier', pointId: 'V-3', qrPointId: 'wrong', at, confirmedAtEquipment: true }), /QR/);
  assert.throws(() => d.verifyPoint(p, { actorId: 'verifier', pointId: 'V-3', qrPointId: 'V-3', at, confirmedAtEquipment: false }), /QR/);
});
test('agent proposes pending activation, assigned onsite human confirms', () => {
  const p = d.requestActivation(ready(), { actorId: 'planning-agent', verifierId: 'verifier', at });
  assert.equal(p.state, 'VERIFY'); assert.equal(p.activations[0].status, 'PENDING'); assert.equal(p.audit.at(-1).action, 'ACTIVATION_PROPOSED');
  const args = { activationId: p.activations[0].id, actorId: 'verifier', at, qrEquipmentId: 'EQ-1', confirmedAtEquipment: true };
  assert.throws(() => d.confirmActivation(p, { ...args, actorId: 'planning-agent' }, { policy: enforce }), /Assigned/);
  assert.throws(() => d.confirmActivation(p, { ...args, confirmedAtEquipment: false }, { policy: enforce }), /QR/);
  assert.throws(() => d.confirmActivation(p, { ...args, qrEquipmentId: 'wrong' }, { policy: enforce }), /QR/);
  const active = d.confirmActivation(p, args, { policy: enforce }); assert.equal(active.state, 'ACTIVE'); assert.equal(active.audit.at(-1).action, 'ACTIVATION_CONFIRMED');
  assert.throws(() => d.removePersonalLock(active, { lockId: 'L-01', actorId: 'worker', at }), /active/);
});
test('outages fail closed unless explicit advisory policy; never fabricate clearance', () => {
  const p = ready(); const options = { registerAvailable: false, policy: enforce };
  assert.equal(d.checkReadiness(p, options).transitionAllowed, false);
  const report = d.checkReadiness(p, { ...options, policy: { ...enforce, failMode: 'FAIL_OPEN_WITH_ALERT' } });
  assert.equal(report.status, 'NOT CLEARED'); assert.equal(report.transitionAllowed, true); assert.equal(report.alertRequired, true);
  assert.equal(d.checkReadiness(setup()).status, 'NOT CLEARED');
  assert.equal(d.checkReadiness(setup()).transitionAllowed, true);
  const pending = d.requestActivation(p, { actorId: 'agent', verifierId: 'verifier', at });
  assert.throws(() => d.confirmActivation(pending, { activationId: pending.activations[0].id, actorId: 'verifier', at, qrEquipmentId: 'EQ-1', confirmedAtEquipment: true }, { ...options, policy: d.DEFAULT_POLICY }), /NOT CLEARED/);
});
test('cross-crew locks block release with precise reason; close-out preserves audit', () => {
  const plant = createSamplePlant({ confirmed: true, isProjectAdmin: true, sampleProjectId: 'SAMPLE', projectRegistry: { SAMPLE: { sampleOnly: true } }, at });
  let p = d.beginRelease(activate(ready()), 'worker', at);
  p = d.removePersonalLock(p, { lockId: 'L-01', actorId: 'worker', at });
  const b = plant.permits[1]; const result = d.checkRelease(p, [b]);
  assert.equal(result.status, 'NOT CLEARED'); assert.equal(result.reasons[0].message, "Crew B's lock L-07 is still on V-3");
  assert.throws(() => d.closePermit(p, { actorId: 'verifier', at, otherPermits: [b] }), /Release blocked/);
  const removedB = d.removePersonalLock(b, { lockId: 'L-07', actorId: 'sample-worker-b', at });
  assert.equal(d.checkRelease(p, [removedB]).status, 'CLEARED');
  assert.equal(d.checkRelease(p, [], { registerAvailable: false }).status, 'NOT CLEARED');
  const closed = d.closePermit(p, { actorId: 'verifier', at, otherPermits: [removedB] });
  assert.equal(closed.state, 'CLOSED'); assert.equal(closed.audit.at(-1).action, 'PERMIT_ARCHIVED');
  assert.equal(d.permitEntityProperty(closed).state, 'CLOSED'); assert.equal(p.state, 'RELEASE');
});
test('removing an isolation lock invalidates verification', () => {
  const p = d.removePersonalLock(ready(), { lockId: 'L-01', actorId: 'worker', at });
  assert.equal(p.state, 'LOCK'); assert.equal(p.verifications.length, 0);
});
test('sample loader asks first, creates six equipment, confines Enforce to sample project', () => {
  const registry = { SAMPLE: { sampleOnly: true }, REAL: { sampleOnly: false, policy: { mode: 'WARN_ONLY', failMode: 'FAIL_CLOSED' } } };
  const opts = { confirmed: true, isProjectAdmin: true, sampleProjectId: 'SAMPLE', projectRegistry: registry, at };
  assert.throws(() => createSamplePlant({ ...opts, confirmed: false }), /confirmation/);
  assert.throws(() => createSamplePlant({ ...opts, isProjectAdmin: false }), /administrator/);
  assert.throws(() => createSamplePlant({ ...opts, sampleProjectId: 'REAL' }), /verified sample/);
  const result = createSamplePlant(opts); assert.equal(result.equipment.length, 6); assert.equal(result.projects.SAMPLE.policy.mode, 'ENFORCE');
  assert.deepEqual(result.projects.REAL, registry.REAL); assert.equal(registry.SAMPLE.policy, undefined);
  assert.deepEqual(Object.keys(SAMPLE_EQUIPMENT[0]).sort(), ['id', 'isolationPoints', 'name']);
});
test('release blocks shared equipment across projects but not unrelated equipment', () => {
  let p = d.beginRelease(activate(ready()), 'worker', at);
  p = d.removePersonalLock(p, { lockId: 'L-01', actorId: 'worker', at });
  const other = lock(d.beginLocking(setup(), 'worker', at)); other.id = 'OTHER';
  other.projectId = 'OTHER-PROJECT';
  assert.equal(d.checkRelease(p, [other]).status, 'NOT CLEARED');
  other.projectId = p.projectId; other.equipment[0].id = 'DIFFERENT-EQUIPMENT';
  assert.equal(d.checkRelease(p, [other]).status, 'CLEARED');
  other.equipment[0].id = 'EQ-1'; assert.equal(d.checkRelease(p, [other]).status, 'NOT CLEARED');
});
test('invalid states, empty plans, duplicate identities fail explicitly', () => {
  assert.throws(() => d.beginRelease(setup(), 'worker', at), /Active/);
  assert.throws(() => d.createPermit({ id: 'x', projectId: 'x', crewId: 'x', equipment: [], workers: ['a'], verifierIds: ['b'] }), /Equipment/);
  assert.throws(() => setup(false, ['worker', 'worker']), /Unique/);
  assert.throws(() => d.beginLocking(setup(), 'worker', 'not-a-time'), /timestamp/);
});
