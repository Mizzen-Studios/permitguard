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
  ['Production PLAN capture silently changed back to DEV',p=>p.shots.shots[1].captureUrl='https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2'],
  ['Production PLAN receipt inflated to footage',p=>p.shots.productionPlan.mediaReceived=true],
  ['Production PLAN recheck waived',p=>p.shots.productionPlan.captureRequires='ACCEPTED_WITHOUT_RECHECK'],
  ['Production PLAN owner build drift',p=>p.shots.productionPlan.versionAtOwnerObservation='2.8.0'],
  ['owner text promoted to independent inspection',p=>p.ownerPlan.independentlyInspected=true],
  ['current runtime drifts from owner acceptance',p=>p.status.currentProduction.uiSource='different'],
  ['seed report missing',p=>p.ownerSeed=null],
  ['seed report wrong version',p=>p.ownerSeed.version='99.0.0'],
  ['seed evidence inflated to inspected media',p=>p.ownerSeed.independentlyInspected=true],
  ['seed duplicates concealed',p=>p.ownerSeed.reload.duplicates=1],
  ['seed lock creation concealed',p=>p.ownerSeed.confirm.locks=1],
  ['narration too fast',p=>{p.shots.shots[0].narration='word '.repeat(100);p.documents['docs/demo-video-script.md']+=p.shots.shots[0].narration}],
  ['Production text receipt promoted to received footage',p=>p.capture.productionOnboarding.mediaReceived=true],
  ['mixed build label omitted',p=>p.shots.productionOnboarding.classification='LIVE_PRODUCTION_FULL_CORE'],
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
  ['owner report absent', p => p.ownerRehearsal = null],
  ['owner report inflated to independent pass', p => p.status.judgeBrowserRehearsal = 'PASS'],
  ['post-update visual acceptance invented', p => p.production.acceptance.postUpdateVisualMarkerAndContext = 'PASS'],
  ['production source mismatch', p => p.status.production.sourceCommit = 'a'.repeat(40)],
  ['legal owner approval missing', p => p.legalPublication.approval.ownerApproved = false],
  ['legal HTTP success invented', p => p.legalPublication.pages[0].status = 404],
  ['legal served content drift', p => p.legalPublication.pages[0].sha256 = 'a'.repeat(64)],
  ['privacy URL invented', p => p.status.distributionForm.privacyPolicyUrl = 'https://example.invalid/README'],
  ['stored personal data concealed', p => p.status.distributionForm.personalDataStored = false],
  ['personal reporting falsely complete', p => p.status.distributionForm.personalDataReportingImplemented = true],
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

test('remaining ledger preserves private link, partial rehearsal and owner approval gates', () => {
  const draft = baseline.documents['docs/submission/devpost-writeup.md'];
  const remaining = baseline.documents['docs/submission/remaining-2026-11-28.md'];
  assert.ok(!draft.includes('NOT_CREATED'));
  for (const value of ['OWNER_REPORTED_PARTIAL', 'inactive', '22 December2026 20:00UTC', 'YouTube', 'explicit Olly approval', 'No new client/tool call']) {
    assert.ok((draft + remaining).toLowerCase().includes(value.toLowerCase()), value);
  }
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

test("historical seed PASS cannot be promoted to a different Production build", () => {
 const p=structuredClone(baseline);
 p.status.ownerFreshSiteRehearsal.postUpdateVisualAcceptance="OWNER_REPORTED_PASS";
 p.status.production.version="2.5.0";
 p.status.production.uiSource="7ceb1ff0f253";
 assert.equal(validatePack(p).localConsistency,"FAIL");
});
