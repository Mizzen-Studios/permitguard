import { requireLifecycleCapacity, lifecycleCapacity } from './store.mjs';
import { validateAssetsConfig } from './assets.mjs';
import { evaluateGate } from '../forge/gate.mjs';
import * as domain from '../domain/permit.mjs';
import { SAMPLE_EQUIPMENT } from '../domain/sample.mjs';
import { randomUUID } from 'node:crypto';
const need = (ok, message) => { if (!ok) throw new Error(message); };
const str = (v, max = 180) => { need(typeof v === 'string' && v.trim() && v.length <= max, 'Invalid text'); return v.trim(); };
const ids = v => { need(Array.isArray(v) && v.length > 0 && v.length <= 20, 'One to twenty named people required'); return [...new Set(v.map(x => str(x)))]; };
const absent = code => ({ status: 'NOT CLEARED', reasons: [{ code, message: code }], transitionAllowed: false });
const projectDefault = () => ({ policy: { ...domain.DEFAULT_POLICY }, equipment: [], sample: false });
function sampleEquipment(projectId) {
  return SAMPLE_EQUIPMENT.map(e => ({ ...structuredClone(e), id: 'register:' + projectId + ':' + e.id }));
}
function projection(p, readiness, release, policy, projectedAt, siteRevision) {
  return { ...domain.permitEntityProperty(p), updatedAt:projectedAt, projectedAt, lastAuditAt:p.audit.at(-1)?.at??null, timestampSource:'POST_COMMIT_PROJECTION', siteRevision, activeLockCount:p.locks.filter(l => !l.removedAt).length, mode: policy.mode, failMode: policy.failMode, start: { cleared: readiness.status === 'CLEARED' }, release: { cleared: release.status === 'CLEARED' }, dryRun: { startBlocked: readiness.status !== 'CLEARED', releaseBlocked: release.status !== 'CLEARED' }, authoritative: false };
}
export function createService({ store, challenges, authorize, projectIsSample, validatePeople, projectProperty, publish, readAssets, now = () => new Date().toISOString(), uuid = randomUUID, clock = Date.now, observeTiming = () => {} }) {
  need(store?.atomic === true, 'ATOMIC_STORAGE_UNAVAILABLE');
  return async function dispatch(operation, payload = {}, context = {}) {
    const started = clock(), timings = {};
    const measured = async (name, fn) => {const at=clock();try{return await fn();}finally{timings[name]=Math.max(0,Math.round(clock()-at));}};
    const auth = await measured('authorizationMs',()=>authorize(context,{includeProfile:!['get_state','check_readiness','list_equipment','create_permit','create_demo_crew_b'].includes(operation)}));
    const actorId = str(auth.actorId), issueId = str(auth.issueId), projectId = str(auth.projectId);
    need(payload && typeof payload === 'object' && !Array.isArray(payload), 'Payload object required');
    need(Buffer.byteLength(JSON.stringify(payload)) <= 90000, 'Payload too large');
    const row = await measured('storageReadMs',()=>store.read()), site = row.data;
    const project = site.projects[projectId] || projectDefault();
    let permit = site.permits[issueId] || null;
    if (permit) need(permit.projectId === projectId, 'Issue moved: supervisor reconciliation required');
    let registerAvailable = true, assetsStatus = project.source === 'ASSETS' ? 'UNAVAILABLE' : 'NOT_CONNECTED';
    if (project.source === 'ASSETS') {
      try {
        need(readAssets, 'ASSETS_UNAVAILABLE');
        const fresh = await measured('assetsMs',()=>readAssets(project.assetsConfig));
        need(JSON.stringify(fresh) === JSON.stringify(project.equipment), 'ASSETS_REGISTER_CHANGED');
        assetsStatus = 'CONNECTED_AS_USER';
      } catch { registerAvailable = false; }
    }
    const all = () => Object.values(site.permits);
    const isolationReadiness = () => permit ? domain.checkReadiness({...permit,state:permit.state==='ACTIVE'?'VERIFY':permit.state}, { policy: project.policy, registerAvailable }) : absent('NO_PERMIT');
    const readiness = () => {
      if(!permit)return absent('NO_PERMIT');
      const isolation=isolationReadiness();
      const confirmed=permit.state==='ACTIVE'&&permit.activations.some(a=>a.status==='CONFIRMED'&&permit.verifierIds.includes(a.confirmedBy));
      const reasons=[...isolation.reasons];
      if(!confirmed)reasons.push({code:'HUMAN_ACTIVATION_REQUIRED',message:permit.activations.some(a=>a.status==='PENDING')?'Activation is pending. The assigned human must confirm at the equipment.':'Work is not active with confirmed named-human activation.'});
      return {status:confirmed&&isolation.status==='CLEARED'?'CLEARED':'NOT CLEARED',reasons,transitionAllowed:confirmed&&isolation.status==='CLEARED',scope:'WORK_START',humanConfirmationRequired:!confirmed,operational:false};
    };
    const release = () => {
      if (!permit) return absent('NO_PERMIT');
      const checked = domain.checkRelease(permit, all(), { registerAvailable });
      // Site-wide locks are checked, but details from unreadable other issues never leave server.
      return { ...checked, reasons: checked.reasons.map(r => r.code === 'LOCK_REMAINS' && !(project.sample && site.permits['sample-crew-b:'+issueId]?.sampleOwner === actorId && r.crewId === 'Crew B (SIMULATED)') ? { code: 'LOCK_REMAINS', message: 'A personal lock remains on shared equipment; check the site lock board.' } : (r.code==='LOCK_REMAINS'&&r.crewId==='Crew B (SIMULATED)'?{...r,message:'Simulated Crew B lock '+r.lockId+' remains on isolation point '+r.pointId+'.'}:r)) };
    };
    const canSeedEmptyDemo = () => auth.isProjectAdmin === true && auth.canEdit === true && !project.equipment.length && !project.assetsConfig && !project.sample && (!project.source || project.source === 'BUILT_IN_REGISTER') && project.policy.mode === 'WARN_ONLY' && project.policy.failMode === 'FAIL_CLOSED' && !all().some(p => p.projectId === projectId);
    const result = () => ({ issueKey:auth.issueKey||null, projectName:auth.projectName||null, projectKey:auth.projectKey||null, permit, sampleCrewB: project.sample && site.permits['sample-crew-b:'+issueId]?.sampleOwner===actorId ? { exists:true, active:site.permits['sample-crew-b:'+issueId].locks.some(l=>!l.removedAt), locks:site.permits['sample-crew-b:'+issueId].locks.filter(l=>!l.removedAt).map(l=>({...l,simulated:true,name:'Crew B (simulated)'})) } : {exists:false}, policy: project.policy, equipment: registerAvailable ? project.equipment : [], assets: { status: assetsStatus, source: project.source || 'BUILT_IN_REGISTER' }, realtime: { channel: 'permitguard' }, syntheticDemoRegister: project.syntheticDemoRegister === true, capabilities: { seedEmptyDemo: canSeedEmptyDemo(), assetsImport: true, sampleRoleplay: project.sample === true && Boolean(permit) && permit.state !== 'CLOSED' }, actorId, actorDisplayName: auth.displayName || permit?.locks.find(l=>l.actorId===actorId&&l.name&&l.name!==actorId)?.name || 'You', isProjectAdmin: auth.isProjectAdmin === true, readiness: readiness(), isolationReadiness: isolationReadiness(), release: release(), revision: row.revision,
      // Never leak another issue/project, actor or crew through the site-wide aggregate.
      board: permit ? permit.equipment.map(e => ({ equipmentId: e.id, activeLockCount: all().reduce((count, p) => count + p.locks.filter(l => !l.removedAt && p.equipment.some(pe => pe.id === e.id && pe.isolationPoints.some(pt => pt.id === l.pointId))).length, 0) })) : [],
      limitations: ['Decision support only; site procedure authoritative.', 'QR challenge and human attestation are not independent proof of physical presence.', ...(project.source === 'ASSETS' ? [registerAvailable ? 'Assets checked as connected user; metadata is not physical isolation evidence.' : 'Assets unavailable or changed: reimport required; no clearance authority.'] : ['Built-in register only; no Assets authority; external changes are not detected.'])] });
    if (operation === 'gate_dry_run') {
      need(auth.isProjectAdmin, 'Project administrator required');
      return { dryRun:true, authoritativeSnapshot:true, observedAt:now(), issueId, actions:['START','RELEASE'].map(action=>{const gate=evaluateGate({data:site,issueId,projectId,action});const outageBlocks=project.policy.mode==='ENFORCE'&&!registerAvailable&&project.policy.failMode!=='FAIL_OPEN_WITH_ALERT';return {action,wouldBlock:!gate.result||outageBlocks,alertRequired:!registerAvailable,registerAvailable,reason:gate.errorMessage || 'Warn-only advisory transition; not activation authority.'};}) };
    }
    if (operation === 'list_equipment') return { equipment: registerAvailable ? project.equipment : [], assets: { status: assetsStatus }, operational: false };
    if (operation === 'get_state') {
      const response=result();
      const serverTiming={authorizationMs:timings.authorizationMs,storageReadMs:timings.storageReadMs,assetsMs:timings.assetsMs??0,totalMs:Math.max(0,Math.round(clock()-started))};
      try{observeTiming({operation,...serverTiming});}catch{}
      return {...response,serverTiming};
    }
    if (operation === 'check_readiness') {
      const scope=permit?.state==='RELEASE'?'RELEASE':'WORK_START',checked=scope==='RELEASE'?release():readiness();
      checked.reasons=checked.reasons.map(r=>({...r,message:r.message&&r.message!==r.code?r.message:({NO_PERMIT:'No permit has been created for this work item. Open its PermitGuard panel; if no equipment is available, ask a project administrator to configure the register.',REGISTER_UNAVAILABLE:'The equipment register could not be confirmed.'}[r.code]||'Recorded prerequisites are incomplete; inspect the permit panel.')}));
      const releaseStatus=release().status,phase=permit?.state||'NO_PERMIT';
      const scopeLine=scope==='WORK_START'?'Workflow start prerequisites: '+(checked.status==='CLEARED'?'met':'not met')+'. This is not work, safety or energization clearance.':
        'Release records are '+checked.status+'. This is not permission to energize equipment.';
      // One complete human response; no competing paraphrases in other display fields.
      const message=[scope==='WORK_START'?'Release: '+releaseStatus+'.':'',scopeLine,checked.status==='NOT CLEARED'?checked.reasons.map(r=>r.message).join(' '):'', 'Phase: '+phase+'. Follow the site procedure.'].filter(Boolean).join(' ');
      return {...checked,scope,message,activationPending:!!permit?.activations.some(a=>a.status==='PENDING'),releaseStatus,phase,permitId:permit?.id??null,revision:row.revision,siteRevision:row.revision,permitRevision:permit?.revision??null,policy:project.policy,observedAt:now(),operational:false};
    }
    need(auth.canEdit === true, 'EDIT_ISSUES permission required');
    if (payload.expectedRevision !== undefined) need(payload.expectedRevision === row.revision, 'CONFLICT: refresh before retrying');
    const at = now();
    const drainingCapacity = ['remove_lock','remove_sample_lock','begin_release','close_permit'].includes(operation);
    const previousBudget = drainingCapacity ? lifecycleCapacity(site) : null;
    const requirePermit = () => need(permit, 'Create permit first');
    const consumeQR = async target => {
      need(payload.confirmedAtEquipment===true,'AT_EQUIPMENT_CONFIRMATION_REQUIRED');
      need(payload.qrValue==='permitguard:'+target,'QR_VALUE_MISMATCH');
      need(challenges,'QR_CHALLENGE_UNAVAILABLE');
      const c=await challenges.get(actorId,issueId);
      need(c&&c.token===payload.challengeToken&&c.actorId===actorId&&c.issueId===issueId&&c.target===target&&c.expires>Date.parse(at)&&c.revision===row.revision,'QR_CHALLENGE_EXPIRED');
    };
    const photo = () => {
      if (!payload.photoData) return null;
      need(typeof payload.photoData === 'string' && new RegExp('^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$').test(payload.photoData) && payload.photoData.length <= 64000, 'Only bounded inline image evidence accepted; external URLs forbidden');
      const id = uuid(); site.evidence[id] = { issueId, actorId, pointId: str(payload.pointId), at, data: payload.photoData }; return 'evidence:' + id;
    };
    switch (operation) {
      case 'import_assets':
      case 'connect_assets':
        need(auth.isProjectAdmin && payload.confirmed === true, 'Project administrator and explicit confirmation required');
        need(!all().some(p => p.projectId === projectId && p.state !== 'CLOSED'), 'Assets import blocked while permits open');
        need(readAssets, 'ASSETS_UNAVAILABLE');
        const assetsConfig = validateAssetsConfig(payload.config);
        project.equipment = await readAssets(assetsConfig); project.assetsConfig = assetsConfig; project.source = 'ASSETS'; project.sample = false; project.syntheticDemoRegister = false;
        registerAvailable = true; assetsStatus = 'CONNECTED_AS_USER'; break;
      case 'seed_empty_demo_register':
        need(auth.isProjectAdmin && payload.confirmed === true, 'Project administrator and explicit confirmation required');
        if (project.syntheticDemoRegister === true) return result(); // Read-only replay; never replace existing demo/permit records.
        need(canSeedEmptyDemo(), 'EMPTY_DEMO_PROJECT_REQUIRED');
        project.equipment = sampleEquipment(projectId); project.source = 'BUILT_IN_REGISTER'; project.sample = false; project.syntheticDemoRegister = true;
        break;
      case 'set_policy':
        need(auth.isProjectAdmin, 'Project administrator required');
        need(!project.syntheticDemoRegister || (payload.mode ?? project.policy.mode) === 'WARN_ONLY', 'SYNTHETIC_DEMO_WARN_ONLY');
        project.policy = domain.configurePolicy(project.policy, { mode: payload.mode ?? project.policy.mode, failMode: payload.failMode ?? project.policy.failMode }, auth); break;
      case 'load_sample':
        need(auth.isProjectAdmin && payload.confirmed === true, 'Project administrator and explicit confirmation required');
        need(await projectIsSample(projectId), 'Verified dedicated sample project required');
        need(!Object.values(site.permits).some(p => p.projectId === projectId && p.state !== 'CLOSED'), 'Sample reload blocked while permits open');
        project.equipment = sampleEquipment(projectId); project.sample = true; project.source = 'SAMPLE'; project.syntheticDemoRegister = false;
        project.policy = domain.configurePolicy(project.policy, { mode: 'ENFORCE', failMode: 'FAIL_CLOSED' }, auth);
        registerAvailable = true; assetsStatus = 'NOT_CONNECTED';
        // Confirmed admin enables Enforce only after both dedicated sample markers.
        break;
      case 'register_equipment': {
        need(auth.isProjectAdmin, 'Project administrator required');
        need(Array.isArray(payload.equipment) && payload.equipment.length > 0 && payload.equipment.length <= 6, 'One to six Equipment records required');
        need(!all().some(p => p.projectId === projectId && p.state !== 'CLOSED'), 'Register edit blocked while permits open');
        const equipment = payload.equipment.map(e => ({ id: 'register:' + projectId + ':' + str(e.id, 80), name: str(e.name), isolationPoints: e.isolationPoints?.map(p => ({ id: str(p.id, 80), energyType: str(p.energyType, 80), highEnergy: p.highEnergy })) }));
        domain.createPermit({ id: 'validation', projectId, equipment, workers: [actorId], verifierIds: [actorId], crewId: 'validation' });
        project.equipment = equipment; project.source = 'BUILT_IN_REGISTER'; project.sample = false; project.syntheticDemoRegister = false; registerAvailable = true; assetsStatus = 'NOT_CONNECTED'; break;
      }
      case 'create_demo_crew_b':
      case 'create_permit': {
        let plan = payload;
        if (operation === 'create_demo_crew_b') {
          need(project.sample === true && project.source === 'SAMPLE' && await projectIsSample(projectId) && payload.confirmed === true, 'Confirmed dedicated sample project only');
          need(project.policy.mode === 'ENFORCE' && project.policy.failMode === 'FAIL_CLOSED', 'DEMO_SECOND_CREW_POLICY_REQUIRED');
          const pumpId = 'register:' + projectId + ':EQ-1';
          const pump = project.equipment.find(e => e.id === pumpId);
          need(pump && pump.isolationPoints.length === 1 && pump.isolationPoints[0].id === 'V-3' && pump.isolationPoints.every(p => p.highEnergy === false), 'DEMO_SECOND_CREW_UNAVAILABLE');
          // Never impersonate Crew A or reuse the synthetic single-person roleplay.
          // Only existence is inspected: no other issue/crew/person details are disclosed.
          const otherLock = p => p.locks.find(l => !l.removedAt && l.actorId !== actorId && p.workers.includes(l.actorId) && l.pointId === 'V-3');
          const source = all().find(p => p.projectId === projectId && p.id !== issueId && /^[0-9]+$/.test(p.id) && !p.sampleOwner && !p.sampleOnly && p.state !== 'CLOSED' && !p.workers.includes(actorId) && p.equipment.some(e => e.id === pumpId) && otherLock(p));
          need(source, 'DEMO_SECOND_CREW_UNAVAILABLE');
          // A historical placeholder ID is not a second real principal. Verify it
          // against native active/assignable people, without disclosing it to the client.
          await measured('sourceParticipantMs',()=>validatePeople([otherLock(source).actorId], issueId, auth));
          plan = { crewId: 'Crew B', equipmentIds: [pumpId], workers: [actorId], verifierIds: [actorId] };
        }
        need(registerAvailable, 'ASSETS_UNAVAILABLE: cannot plan from stale equipment'); need(!permit, 'Permit already exists'); need(all().length < 60, 'SITE_CAPACITY_REACHED');
        const workers = ids(plan.workers || [actorId]), verifierIds = ids(plan.verifierIds || [actorId]);
        need(workers.includes(actorId), 'Creator must be assigned worker');
        await measured('participantsMs',()=>validatePeople([...new Set([...workers, ...verifierIds])], issueId, auth));
        const selected = plan.equipmentIds || project.equipment.slice(0, 1).map(e => e.id);
        need(Array.isArray(selected) && selected.length && selected.length <= 6, 'Select registered equipment');
        const equipment = selected.map(id => { const e = project.equipment.find(e => e.id === id); need(e, 'Unknown equipment; register it first'); return e; });
        if (equipment.some(e => e.isolationPoints.some(p => p.highEnergy))) need(verifierIds.length >= 2, 'High energy requires two named people');
        permit = domain.createPermit({ id: issueId, projectId, crewId: str(plan.crewId || 'Crew A'), workers, verifierIds, equipment }); break;
      }
      case 'qr_challenge': {
        requirePermit(); const target = str(payload.target);
        need(permit.verifierIds.includes(actorId), 'Named verifier required');
        need(permit.equipment.some(e => e.id === target || e.isolationPoints.some(p => p.id === target)), 'Unknown QR target');
        need(challenges,'QR_CHALLENGE_UNAVAILABLE');
        const challengeToken=uuid(),expires=Date.parse(at)+120000;
        await challenges.put({token:challengeToken,actorId,issueId,target,revision:row.revision,expires});
        return {challengeToken,qrValue:'permitguard:'+target,expiresAt:new Date(expires).toISOString(),revision:row.revision,physicalPresenceProven:false};
      }
      case 'begin_lock': requirePermit(); permit = domain.beginLocking(permit, actorId, at); break;
      case 'apply_lock': requirePermit(); permit = domain.applyLock(permit, { pointId: str(payload.pointId), lockId: str(payload.lockId), actorId, name: auth.displayName || actorId, at, photoRef: photo() }, project.policy); break;
      case 'begin_verify': requirePermit(); permit = domain.beginVerification(permit, actorId, at, project.policy); break;
      case 'verify_point': requirePermit(); await consumeQR(str(payload.pointId)); permit = domain.verifyPoint(permit, { pointId: payload.pointId, actorId, at, qrPointId: payload.pointId, confirmedAtEquipment: true }); break;
      case 'request_activation': requirePermit(); need(permit.workers.includes(actorId) || permit.verifierIds.includes(actorId), 'Permit participant required'); permit = domain.requestActivation(permit, { actorId, verifierId: str(payload.verifierId), at }); break;
      case 'confirm_activation': requirePermit(); need(registerAvailable, 'ASSETS_UNAVAILABLE: activation denied'); need(permit.equipment.some(e=>e.id===payload.equipmentId),'ACTIVATION_EQUIPMENT_REQUIRED'); await consumeQR(str(payload.equipmentId)); permit = domain.confirmActivation(permit, { activationId: str(payload.activationId), actorId, at, qrEquipmentId: payload.equipmentId, confirmedAtEquipment: true }, { policy: project.policy }); break;
      case 'begin_release': requirePermit(); permit = domain.beginRelease(permit, actorId, at); break;
      case 'remove_lock': requirePermit(); permit = domain.removePersonalLock(permit, { lockId: str(payload.lockId), actorId, at }); break;
      case 'close_permit': requirePermit(); permit = domain.closePermit(permit, { actorId, at, otherPermits: all(), registerAvailable }); break;
      case 'play_crew_b': {
        requirePermit(); need(project.sample && await projectIsSample(projectId) && payload.confirmed === true, 'Confirmed dedicated sample project only');
        need(auth.isProjectAdmin, 'Project administrator required');
        const id = 'sample-crew-b:' + issueId; need(!site.permits[id], 'Sample Crew B already exists'); need(all().length < 60, 'SITE_CAPACITY_REACHED');
        let b = domain.createPermit({ id, projectId, crewId: 'Crew B (SIMULATED)', equipment: permit.equipment.slice(0,1), workers: [actorId], verifierIds: [actorId] });
        b = domain.beginLocking(b, actorId, at); b = domain.applyLock(b, { pointId: b.equipment[0].isolationPoints[0].id, lockId: 'L-07', actorId, name: 'SIMULATED Crew B', at }, domain.DEFAULT_POLICY);
        b.sampleOwner = actorId; site.permits[id] = b; break;
      }
      case 'remove_sample_lock': {
        requirePermit(); need(project.sample && await projectIsSample(projectId) && payload.confirmed === true, 'Confirmed sample project only');
        const id = 'sample-crew-b:' + issueId, b = site.permits[id]; need(b && b.sampleOwner === actorId, 'Only creator may remove simulated personal lock');
        site.permits[id] = domain.removePersonalLock(b, { lockId: 'L-07', actorId, at }); break;
      }
      default: throw new Error('Unknown operation');
    }
    site.projects[projectId] = project;
    if (permit) site.permits[issueId] = permit;
    // No retry after uncertain commit; return error and require refresh. Domain changes only persist here.
    requireLifecycleCapacity(site,{previousBudget,allowDraining:drainingCapacity});
    const revision = await measured('commitMs',()=>store.commit(row.revision, site));
    const response = { ...result(), revision, projection: { status: 'NOT_ATTEMPTED' } };
    // Independent non-authoritative side effects run together, only AFTER the atomic commit.
    // Both settle before replying; neither is a detached task or a reason to retry a mutation.
    await measured('sideEffectsMs',()=>Promise.all([
      permit&&projectProperty ? Promise.resolve().then(()=>projectProperty(issueId,projection(permit,readiness(),release(),project.policy,now(),revision))).then(()=>{response.projection.status='UPDATED';},()=>{response.projection.status='FAILED_NONAUTHORITATIVE';}) : Promise.resolve(),
      publish ? Promise.resolve().then(()=>publish({revision})).catch(()=>{response.realtime='UNAVAILABLE';}) : Promise.resolve()
    ]));
    // Bounded operation/timing diagnostics only; no issue/account/content/identifiers.
    try{observeTiming({operation,...timings,totalMs:Math.max(0,Math.round(clock()-started))});}catch{}
    return response;
  };
}
