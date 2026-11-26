import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { posix, join } from 'node:path';

export function loadPack(root) {
  const files = new Set(), documents = {};
  const walk = (dir, relative = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules', '.forge', '.openclaw', 'coverage', 'dist', '__pycache__', 'private-media', 'footage-inbox'].includes(entry.name)) continue;
      const name = posix.join(relative, entry.name);
      if (entry.isDirectory()) walk(join(dir, entry.name), name);
      else if (entry.isFile()) {
        files.add(name);
        if (name === 'README.md' || (name.startsWith('docs/') && name.endsWith('.md'))) documents[name] = readFileSync(join(root, name), 'utf8');
      }
    }
  };
  walk(root);
  const json = name => {
    const text = readFileSync(join(root, name), 'utf8');
    try { return JSON.parse(text); } catch { throw new Error(name + ': invalid JSON (content not echoed)'); }
  };
  const shots = json('docs/demo-shot-list.json'), status = json('docs/submission-status.json');
  const allowedReceipts = ['evidence/2026-11-25-production-deployment.json', 'evidence/2026-11-26-production-deployment.json', 'evidence/2026-11-26-production-discoverability.json'];
  const evidence = status.production?.evidence;
  return { files, documents, ownerRehearsal: files.has('docs/evidence/2026-11-26-owner-fresh-site-rehearsal.json') ? json('docs/evidence/2026-11-26-owner-fresh-site-rehearsal.json') : null, legalPublication: files.has('docs/evidence/2026-11-26-legal-pages.json') ? json('docs/evidence/2026-11-26-legal-pages.json') : null, legalSourceHashes: Object.fromEntries(['privacy','terms'].filter(n=>files.has('docs/'+n+'.html')).map(n=>[n,createHash('sha256').update(readFileSync(join(root,'docs',n+'.html'))).digest('hex')])), shots, capture: json('docs/capture-log.json'), receipt: json('docs/evidence/2026-11-24-mcp-owner-receipt.json'), status, production: allowedReceipts.includes(evidence) && files.has('docs/' + evidence) ? json('docs/' + evidence) : null };
}

export function validatePack(pack) {
  const errors = [], check = (ok, message) => { if (!ok) errors.push(message); };
  const { shots, capture, receipt, status, documents, files, production } = pack;
  const owner = pack.ownerRehearsal;
  const ownerPartial = owner?.classification==='OWNER_REPORTED_FRESH_SITE_ACCEPTANCE' && owner?.freshSite===true && owner?.installation?.success===true && owner?.panel?.loaded===true && owner?.panel?.liveUpdatesConnected===true && owner?.panel?.errorsReported===false && owner?.productionBeforeUpdate==='2.1.0';
  const script = documents['docs/demo-video-script.md'] || '';
  const guide = documents['docs/video-capture-list.md'] || '';
  const list = shots.shots || [];
  check(list.length === 8, 'Capture plan must contain eight shots');
  let cursor = 0;
  for (const [i, s] of list.entries()) {
    check(s.id === 'S' + String(i + 1).padStart(2, '0'), 'Shot IDs/order must be S01–S08');
    check(Number.isInteger(s.start) && Number.isInteger(s.end) && s.start === cursor && s.end > s.start, s.id + ': invalid/gapped timeline');
    check(s.captureDurationSeconds === s.end - s.start, s.id + ': capture duration differs from edit slot');
    cursor = s.end;
    check(typeof s.captureUrl === 'string' && s.captureUrl.startsWith('https://') && guide.includes(s.captureUrl), s.id + ': missing documented capture URL');
    check(Array.isArray(s.captureClicks) && s.captureClicks.length > 0 && s.captureClicks.every(x => typeof x === 'string' && x.length > 0), s.id + ': missing clicks');
    check(typeof s.captureExpected === 'string' && s.captureExpected.length > 0, s.id + ': missing expected result');
    check(typeof s.narration === 'string' && script.includes(s.narration), s.id + ': narration differs from script');
    if (i < 5) check(s.captureUrl === 'https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2' && s.captureIssueKey === 'PGSAMPLE-2', s.id + ': wrong demo issue/site');
  }
  check(cursor === 180 && shots.targetSeconds === 180, 'Edit budget must be exactly 180 seconds');
  check(shots.mcpBonusStatus === 'PASS_OWNER_RECEIPT', 'Do not upgrade owner evidence to independent transport acceptance');
  const mcp = list.find(s => s.id === 'S07');
  const mcpText = JSON.stringify(mcp || {});
  check(mcp?.captureDurationSeconds === 30 && mcpText.includes('Historical owner receipt') && mcpText.includes('not live Inspector footage') && mcpText.includes('check_readiness_development'), 'S07 must retain historical label, actual name and 30-second slot');
  check(receipt.classification === 'PASS_OWNER_RECEIPT' && receipt.discovery.count === 1 && receipt.invocation.count === 1 && receipt.discovery.actualToolName === 'check_readiness_development', 'Owner receipt count/name/provenance drift');
  check(receipt.authorization.scopeText === 'Read, Write, and Search', 'Do not present broad consent as a read-only OAuth grant');
  const result = receipt.invocation.result;
  check(result.scope === 'WORK_START' && result.releaseStatus === 'NOT CLEARED' && result.operational === false && result.siteRevision === 22 && result.permitRevision === 6, 'Receipt scope/release/revision boundary drift');
  check(receipt.stateComparison.before.permitRevision === null && receipt.stateComparison.after.permitRevision === null, 'Do not invent before/after permit revision');
  check(receipt.cleanup.exposureOffVerifiedAfterReload && receipt.cleanup.inspectorDisconnected && receipt.cleanup.inspectorStopped && receipt.cleanup.newInspectorGrantRemoved, 'Owner cleanup observations must be retained');
  check(shots.coreVersion === capture.coreVersion && shots.uiSource === capture.uiSource && capture.coreVersion === status.currentDemo.version && capture.uiSource === status.currentDemo.uiSource, 'Capture build/source mismatch');
  const ids = new Set();
  for (const asset of capture.assets || []) {
    check(!ids.has(asset.id), 'Duplicate capture asset ID'); ids.add(asset.id);
    if (asset.status === 'NOT_CAPTURED') check(asset.actualPath === null && asset.sha256 === null && asset.capturedUtc === null && asset.privacyReview === 'NOT_REVIEWED', asset.id + ': invented uncaptured media metadata');
    else check(asset.status === 'CAPTURED' && typeof asset.actualPath === 'string' && /^[a-f0-9]{64}$/.test(asset.sha256 || '') && Number.isFinite(Date.parse(asset.capturedUtc)), asset.id + ': incomplete captured-media metadata');
    if (asset.sourceDocument) check(files.has(posix.join('docs', asset.sourceDocument)), asset.id + ': missing source document');
    check(asset.sharingAuthorized === false, asset.id + ': publication approval is not supplied by this preparation pack');
  }
  check(ids.has('C09') && capture.actualInspectorScreenshotsOrVideo === 0, 'Do not invent Inspector screenshots/video');
  check(status.publicActionsAuthorized === false && status.installationLink === null && (status.judgeBrowserRehearsal === 'NOT_RUN' || status.judgeBrowserRehearsal==='OWNER_REPORTED_PARTIAL' && ownerPartial), 'No public link/publication or fresh-site acceptance may be invented');
  if(status.mode==='PRODUCTION_REHEARSAL_APPROVED') {
    check(status.productionDeployed===true && ['DEPLOYMENT_ONLY_DISTRIBUTION_BLOCKED_LOGIN','DEPLOYMENT_ONLY_DISTRIBUTION_PENDING_OWNER_FORM','DEPLOYMENT_WITH_OWNER_REPORTED_PRIOR_INSTALL'].includes(production?.classification) && production?.approval?.productionDeploy===true && production?.approval?.privateJiraDistribution===true && production?.approval?.mcpExposure===false && production?.approval?.billing===false && production?.approval?.marketplace===false, 'Approved deployment needs its bounded owner request and receipt');
    check(production?.appId==='60f4bdda-1062-4e5b-aab6-1d9a9cf53a90' && production?.environment==='production' && production?.version===status.production?.version && production?.uiSource===status.production?.uiSource && production?.sourceCommit===status.production?.sourceCommit && /^[a-f0-9]{40}$/.test(production?.sourceCommit||'') && Number.isFinite(Date.parse(production?.deployedAt)) && production?.deploymentStatus==='Success', 'Production deployment identity/version/evidence mismatch');
    check(['BLOCKED_CONSOLE_LOGIN','AWAITING_OWNER_FORM_AND_POLICY_URL','OWNER_REPORTED_INSTALL_ONLY'].includes(production?.distribution?.status) && production?.distribution?.status===status.production?.privateDistribution && production?.distribution?.installationLinkCreated===false && production?.distribution?.configurationChanged===false && (production?.acceptance?.freshSiteInstall==='NOT_RUN' || production?.acceptance?.freshSiteInstall==='OWNER_REPORTED_PASS_PREVIOUS_VERSION' && ownerPartial && production?.acceptance?.postUpdateVisualMarkerAndContext==='NOT_RUN'), 'Deployment is not distribution or fresh-site acceptance');
    const legal = pack.legalPublication;
    const legalReady = legal?.classification==='PUBLISHED_HTTP_200' && legal?.approval?.ownerApproved===true && Number.isFinite(Date.parse(legal?.verifiedAt)) && legal?.pages?.length===2 && ['privacy','terms'].every(n=>legal.pages.some(p=>p.url==='https://mizzen-studios.github.io/permitguard/'+n+'.html' && p.status===200 && p.matchesLocal===true && p.sha256===pack.legalSourceHashes?.[n])) && legal?.hosting?.costGBP===0 && legal?.hosting?.billingChanged===false && legal?.limits?.automaticEraseFlowImplemented===false && legal?.limits?.personalDataReportingImplemented===false;
    const legalFieldsValid = status.distributionForm?.newLegalPolicyPublished===true ? legalReady && status.distributionForm?.privacyPolicyUrl==='https://mizzen-studios.github.io/permitguard/privacy.html' && status.distributionForm?.termsUrl==='https://mizzen-studios.github.io/permitguard/terms.html' : status.distributionForm?.privacyPolicyUrl===null && status.distributionForm?.termsUrl===null;
    if(['AWAITING_OWNER_FORM_AND_POLICY_URL','OWNER_REPORTED_INSTALL_ONLY'].includes(production?.distribution?.status)) check(status.distributionForm?.ownerWillComplete===true && legalFieldsValid && status.distributionForm?.personalDataStored===true && status.distributionForm?.externalAppStorage===false && status.distributionForm?.personalDataReportingImplemented===false && production?.dataHandling?.personalDataStored===true && production?.dataHandling?.newLegalPolicyPublished===false, 'Do not invent policy URLs, conceal stored personal data or attest unimplemented reporting');
  } else check(status.mode==='PREPARATION_ONLY' && status.productionDeployed===false && production===null, 'Preparation must not silently become deployed');
  check(status.mcpExposure.lastOwnerObserved === 'OFF' && status.mcpExposure.changedByPreparation === false, 'Exposure state/provenance must stay explicit');
  const required = ['production-and-distribution', 'judge-install-browser-rehearsal', 'raw-footage', 'final-media-review', 'judge-mcp-access-window', 'entrant-attestations', 'publication-and-submission'];
  check(status.gates.length === required.length && new Set(status.gates.map(g => g.id)).size === required.length && required.every(id => status.gates.some(g => g.id === id)), 'Pending human gates must not disappear');
  check(status.gates.every(g => status.mode==='PRODUCTION_REHEARSAL_APPROVED' && g.id==='production-and-distribution' ? g.status===production?.distribution?.status && ['BLOCKED_CONSOLE_LOGIN','AWAITING_OWNER_FORM_AND_POLICY_URL','OWNER_REPORTED_INSTALL_ONLY'].includes(g.status) && g.evidence===status.production?.evidence : g.id==='judge-install-browser-rehearsal' && g.status==='OWNER_REPORTED_PARTIAL' ? ownerPartial && g.evidence==='evidence/2026-11-26-owner-fresh-site-rehearsal.json' : ['WAITING_APPROVAL', 'WAITING_OWNER_INPUT', 'NOT_RUN'].includes(g.status) && g.evidence===null), 'New completion evidence requires deliberate review, not a silent gate flip');
  let localReferences = 0;
  for (const [name, text] of Object.entries(documents)) {
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      localReferences++;
      const file = posix.normalize(posix.join(posix.dirname(name), target.split('#')[0].split('?')[0]));
      check(files.has(file), name + ': missing local target ' + target);
    }
  }
  return { localConsistency: errors.length ? 'FAIL' : 'PASS', errors, localReferences, shots: list.length, targetSeconds: cursor, submissionReady: false, pendingGates: status.gates.map(g => ({ id: g.id, status: g.status })), publicActionsAuthorized: false, limitations: ['No network or browser checks', 'External URLs and fragment anchors not verified', 'Media metadata checked; no actual footage/content/hash review performed', 'Does not grant approval or certify eligibility'] };
}
