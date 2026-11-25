import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadPack, validatePack } from '../scripts/lib/submission-pack.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = loadPack(root);

test('local pack is consistent but explicitly not submission-ready or authorized', () => {
  const r = validatePack(baseline);
  assert.deepEqual(r.errors, []); assert.equal(r.localConsistency, 'PASS');
  assert.equal(r.targetSeconds, 180); assert.equal(r.shots, 8);
  assert.equal(r.submissionReady, false); assert.equal(r.publicActionsAuthorized, false);
  assert.equal(r.pendingGates.length, 7); assert.ok(r.localReferences > 100);
});

const regressions = [
  ['timeline gap', p => p.shots.shots[2].start++],
  ['duration drift', p => p.shots.shots[0].captureDurationSeconds++],
  ['missing clicks', p => p.shots.shots[0].captureClicks = []],
  ['wrong site', p => p.shots.shots[0].captureUrl = 'https://other.example/issue'],
  ['narration drift', p => p.shots.shots[0].narration = 'Invented replacement narration'],
  ['receipt name guessed without suffix', p => p.receipt.discovery.actualToolName = 'check_readiness'],
  ['broad consent concealed', p => p.receipt.authorization.scopeText = 'Read only'],
  ['release falsely cleared', p => p.receipt.invocation.result.releaseStatus = 'CLEARED'],
  ['operational authority invented', p => p.receipt.invocation.result.operational = true],
  ['permit revision before invented', p => p.receipt.stateComparison.before.permitRevision = 6],
  ['grant cleanup omitted', p => p.receipt.cleanup.newInspectorGrantRemoved = false],
  ['uncaptured image hash invented', p => p.capture.assets[0].sha256 = 'a'.repeat(64)],
  ['media publication silently approved', p => p.capture.assets[0].sharingAuthorized = true],
  ['source receipt link broken', p => p.capture.assets[8].sourceDocument = 'missing-receipt.md'],
  ['production without receipt', p => p.production = null],
  ['production approval invented', p => p.production.approval.productionDeploy = false],
  ['production version mismatch', p => p.status.production.version = '99.0.0'],
  ['distribution falsely complete', p => p.production.distribution.installationLinkCreated = true],
  ['fresh site falsely accepted', p => p.production.acceptance.freshSiteInstall = 'PASS'],
  ['share link fabricated', p => p.status.installationLink = 'https://fake.example/install'],
  ['exposure silently changed', p => p.status.mcpExposure.changedByPreparation = true],
  ['human gate removed', p => p.status.gates.pop()],
  ['human gate silently completed', p => p.status.gates[0].status = 'PASS'],
  ['broken documentation target', p => p.documents['README.md'] += '\n[broken](docs/missing.md)'],
  ['wrong capture build', p => p.capture.coreVersion = '99.0.0'],
  ['new Inspector footage invented', p => p.capture.actualInspectorScreenshotsOrVideo = 1]
];
for (const [name, mutate] of regressions) test('pack rejects ' + name, () => {
  const changed = structuredClone(baseline); mutate(changed);
  const r = validatePack(changed);
  assert.equal(r.localConsistency, 'FAIL'); assert.ok(r.errors.length > 0);
  assert.equal(r.submissionReady, false); assert.equal(r.publicActionsAuthorized, false);
});

test('read-only CLI emits structured local results and pending gates', () => {
  const r = JSON.parse(execFileSync(process.execPath, ['scripts/verify-submission-pack.mjs', '--json'], { cwd: root, encoding: 'utf8' }));
  assert.equal(r.localConsistency, 'PASS'); assert.equal(r.submissionReady, false);
  assert.equal(r.pendingGates.length, 7); assert.ok(r.limitations.some(x => x.includes('No network')));
});


test('footage take-log template does not invent received files, hashes or review', () => {
  const template = JSON.parse(readFileSync(join(root, 'docs/footage-take-log.template.json'), 'utf8'));
  assert.equal(template.status, 'TEMPLATE_NOT_RECORDED'); assert.equal(template.transferApproved, false);
  assert.deepEqual(template.clips.map(c => c.shotId), baseline.shots.shots.map(s => s.id));
  for (const c of template.clips) {
    assert.equal(c.privateFilename, null); assert.equal(c.sha256, null);
    assert.equal(c.actualRawDurationSeconds, null); assert.equal(c.capturedUtc, null);
    assert.equal(c.privacyReviewed, false); assert.equal(c.publicationApproved, false);
  }
});

test('invalid JSON diagnostic never echoes file contents', () => {
  const privateRoot = join(root, '.openclaw'); mkdirSync(privateRoot, { recursive: true });
  const scratch = mkdtempSync(join(privateRoot, 'pack-check-'));
  const dir = join(scratch, 'docs'), file = join(dir, 'demo-shot-list.json');
  const canary = 'CANARY_LOCAL_NOT_A_REAL_TOKEN';
  try {
    mkdirSync(dir); writeFileSync(file, canary);
    assert.throws(() => loadPack(scratch), e => e.message.includes('invalid JSON (content not echoed)') && !e.message.includes(canary));
  } finally { unlinkSync(file); rmdirSync(dir); rmdirSync(scratch); }
});
