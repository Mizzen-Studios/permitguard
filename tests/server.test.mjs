import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/server/service.mjs';
import { emptySite, forgeStore, forgeChallenges } from '../src/server/store.mjs';
import { jiraAdapters } from '../src/server/jira.mjs';
import { createForgeWiring } from '../src/forge/actions.mjs';
import { issueInvalidationPublisher } from '../src/server/realtime.mjs';
// All storage/Jira checks below are local mocks, NOT Forge/site acceptance.
function fixture({projectProperty,publish}={}) {
  let row = { revision: null, data: emptySite() }, seq = 0;
  const store = { atomic: true, async read() { return structuredClone(row); }, async commit(expected, data) { assert.equal(expected, row.revision, 'CONFLICT'); row = { revision: row.revision === null ? 0 : row.revision + 1, data: structuredClone(data) }; return row.revision; } };
  const challengeRows=new Map();
  const dispatch = createService({ projectProperty,publish,challenges:{put:async c=>challengeRows.set(c.actorId+':'+c.issueId,structuredClone(c)),get:async(a,i)=>structuredClone(challengeRows.get(a+':'+i))}, store, authorize: async c => { if (!c.accountId) throw new Error('AUTH'); return { actorId: c.accountId, issueId: c.issueId || '1', projectId: c.projectId || '10', isProjectAdmin: c.admin !== false, canEdit: c.edit !== false }; }, projectIsSample: async p => p === '10', validatePeople: async people => assert.ok(people.every(x => ['alice','bob'].includes(x))), now: () => '2026-11-19T18:00:00Z', uuid: () => 'token-' + ++seq });
  const ctx = { accountId: 'alice' };
  const call = (op,p = {},c = ctx) => dispatch(op,p,c);
  return { call, store, dispatch, challengeRows, get row() { return row; } };
}
async function created(f, equipmentIds) { await f.call('load_sample',{ confirmed: true }); return f.call('create_permit', { equipmentIds }); }
async function verified(f) {
  let s = await created(f); const pointId = s.permit.equipment[0].isolationPoints[0].id;
  await f.call('begin_lock'); await f.call('apply_lock', { pointId, lockId: 'A', actorId: 'bob', photoRef: 'https://evil', photoData: 'data:image/png;base64,YQ==' }); await f.call('begin_verify');
  const challenge = await f.call('qr_challenge',{ target: pointId });
  await f.call('verify_point', { pointId, ...challenge, confirmedAtEquipment: true });
  return { pointId, equipmentId: s.permit.equipment[0].id };
}
test('defaults, authenticated actor, sample requires confirmation and real-project guard',async () => {
  const f = fixture(); assert.equal((await f.call('get_state')).policy.mode,'WARN_ONLY');
  await assert.rejects(f.call('load_sample'),/confirmation/);
  await assert.rejects(f.call('load_sample',{confirmed:true},{accountId:'alice',projectId:'20'}),/sample project/);
  await assert.rejects(f.call('set_policy',{mode:'ENFORCE'},{accountId:'alice',admin:false}),/administrator/);
  await assert.rejects(f.call('get_state',{},{}),/AUTH/);
  await created(f); assert.equal(f.row.data.projects['10'].equipment.length,6); assert.equal(f.row.data.projects['10'].policy.mode,'ENFORCE');
  await f.call('begin_lock'); const s = await f.call('apply_lock',{pointId:'V-3',lockId:'A',actorId:'bob',photoData:'data:image/png;base64,YQ=='}); assert.equal(s.permit.locks[0].actorId,'alice');
  await assert.rejects(f.call('remove_lock',{lockId:'A'},{accountId:'bob'}),/Only the worker/);
});
test('full pending activation, human challenge, sample Crew B release blocks then clears',async () => {
  const f = fixture(); const {equipmentId} = await verified(f);
  let s = await f.call('request_activation',{verifierId:'alice'}); assert.equal(s.permit.state,'VERIFY'); assert.equal(s.permit.activations[0].status,'PENDING');
  await assert.rejects(f.call('confirm_activation',{activationId:s.permit.activations[0].id,equipmentId,confirmedAtEquipment:true}),/QR_VALUE_MISMATCH/);
  const challenge = await f.call('qr_challenge',{target:equipmentId});
  s = await f.call('confirm_activation',{activationId:s.permit.activations[0].id,equipmentId,...challenge,confirmedAtEquipment:true}); assert.equal(s.permit.state,'ACTIVE');
  await f.call('play_crew_b',{confirmed:true}); await f.call('begin_release'); s = await f.call('remove_lock',{lockId:'A'}); assert.equal(s.release.status,'NOT CLEARED');
  await assert.rejects(f.call('close_permit'),/Release blocked/);
  await f.call('remove_sample_lock',{confirmed:true}); s = await f.call('close_permit'); assert.equal(s.permit.state,'CLOSED');
});
test('external images denied and enforce cannot accept caller photoRef',async () => {
 const f = fixture(); await created(f); await f.call('set_policy',{mode:'ENFORCE'}); await f.call('begin_lock');
 await assert.rejects(f.call('apply_lock',{pointId:'V-3',lockId:'a',photoRef:'fake'}),/photo required/);
 await assert.rejects(f.call('apply_lock',{pointId:'V-3',lockId:'a',photoData:'https://evil'}),/inline image/);
 const s = await f.call('apply_lock',{pointId:'V-3',lockId:'a',photoData:'data:image/png;base64,YQ=='}); const ref=s.permit.locks[0].photoRef.split(':')[1]; assert.equal(f.row.data.evidence[ref].issueId,'1'); assert.equal(f.row.data.evidence[ref].actorId,'alice');
});
test('high energy needs distinct named verifiers; spoofed verification rejected',async () => {
 const f = fixture(); await f.call('load_sample',{confirmed:true});
 await assert.rejects(f.call('create_permit',{equipmentIds:['register:10:EQ-2']}),/two named/);
 await f.call('create_permit',{equipmentIds:['register:10:EQ-2'],verifierIds:['alice','bob']}); await f.call('begin_lock'); await f.call('apply_lock',{pointId:'E-2',lockId:'a',photoData:'data:image/png;base64,YQ=='}); await f.call('begin_verify');
 await assert.rejects(f.call('verify_point',{pointId:'E-2',qrPointId:'E-2',confirmedAtEquipment:true}),/QR_VALUE_MISMATCH/);
 const c=await f.call('qr_challenge',{target:'E-2'}); let s=await f.call('verify_point',{pointId:'E-2',...c,confirmedAtEquipment:true}); assert.equal(s.readiness.status,'NOT CLEARED');
 await assert.rejects(f.call('verify_point',{pointId:'E-2',...c,confirmedAtEquipment:true}),/QR_CHALLENGE_EXPIRED/);
 const b=await f.call('qr_challenge',{target:'E-2'},{accountId:'bob'}); s=await f.call('verify_point',{pointId:'E-2',...b,confirmedAtEquipment:true},{accountId:'bob'}); assert.equal(s.isolationReadiness.status,'CLEARED');assert.equal(s.readiness.status,'NOT CLEARED');
});
test('concurrent operations cannot overwrite; stale revision rejects',async () => {
 const f = fixture(); await created(f); const results=await Promise.allSettled([f.call('begin_lock'),f.call('begin_lock')]); assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 await assert.rejects(f.call('apply_lock',{pointId:'V-3',lockId:'a',expectedRevision:-1}),/CONFLICT/);
});
test('CES adapter uses conditional creation and revision compare, never blind overwrite',async () => {
 const seen=[]; class Filter { and(key,value){ this.key=key;this.value=value;return this; } }
 const FilterConditions={notExists:()=>({absent:true}),equalTo:v=>({eq:v})}; const kvs={entity:()=>({get:async()=>undefined}),transact:()=>({set(...args){seen.push(args);return this;},async execute(){}})};
 const store=forgeStore({kvs,Filter,FilterConditions}); await store.commit(null,emptySite()); await store.commit(7,emptySite()); assert.deepEqual(seen[0][2].conditions.value,{absent:true});assert.deepEqual(seen[1][2].conditions.value,{eq:7});
 await assert.rejects(store.commit(1,{large:'x'.repeat(180001)}),/CAPACITY/); assert.throws(()=>forgeStore({}),/ATOMIC/);
});
test('Jira denies missing trusted context and inaccessible issue before storage',async () => {
 const route=(parts,...args)=>parts.reduce((s,p,i)=>s+p+(args[i]??''),''); let requests=0;
 const a=jiraAdapters({asUser:()=>({requestJira:async()=>{ requests++; return {ok:false,status:403}; }})},route);
 await assert.rejects(a.authorize({accountId:'alice'}),/trusted issue/); assert.equal(requests,0);
 await assert.rejects(a.authorize({accountId:'alice',extension:{issue:{id:'1'}}}),/403/); assert.equal(requests,3);
});
test('realtime carries only invalidation and revision',async()=>{
 let args; await issueInvalidationPublisher(async(...a)=>{args=a;return {errors:[]};})({revision:4,secret:'no'}); assert.deepEqual(args,['permitguard',{invalidated:true,revision:4}]);
});

test('site administrator can configure a business-space project; ordinary viewer cannot',async()=>{
 const route=(parts,...args)=>parts.reduce((s,p,i)=>s+p+(args[i]??''),'');
 for(const siteAdmin of [true,false]) {
  const api={asUser:()=>({requestJira:async path=>({ok:true,status:200,json:async()=>path.includes('mypermissions')?{permissions:{ADMINISTER:{havePermission:siteAdmin},ADMINISTER_PROJECTS:{havePermission:false},EDIT_ISSUES:{havePermission:true}}}:path.includes('myself')?{accountId:'alice',displayName:'Alice Admin'}:{id:'1',fields:{project:{id:'10'}}}})})};
  const auth=await jiraAdapters(api,route).authorize({accountId:'alice',issueId:'1'});
  assert.equal(auth.isProjectAdmin,siteAdmin);assert.equal(auth.displayName,'Alice Admin');assert.equal(auth.actorId,'alice');
 }
});

test('load sample revision 0 -> first permit revision 1 uses canonical Jira issue key for named people',async()=>{
 let row={revision:null,data:emptySite()};const calls=[];
 const route=(p,...a)=>p.reduce((s,t,i)=>s+t+(a[i]??''),'');
 const api={asUser:()=>({requestJira:async path=>{
  calls.push(path);
  if(path.includes('assignable/search')) {assert.match(path,/issueKey=PGSAMPLE-1&/);assert.doesNotMatch(path,/issueKey=66400/);return {ok:true,status:200,json:async()=>[{accountId:'alice',active:true}]};}
  return {ok:true,status:200,json:async()=>path.includes('mypermissions')?{permissions:{ADMINISTER:{havePermission:true},EDIT_ISSUES:{havePermission:true}}}:path.includes('myself')?{accountId:'alice',displayName:'Alice'}:path.includes('/project/')?{key:'PGSAMPLE',description:'[PermitGuard dedicated sample project]'}:{id:'66400',key:'PGSAMPLE-1',fields:{project:{id:'10202'}}}};
 }})};
 const store={atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);row={revision:expected===null?0:expected+1,data:structuredClone(data)};return row.revision;}};
 const dispatch=createService({store,...jiraAdapters(api,route)});const context={accountId:'alice',issueId:'66400'};
 const loaded=await dispatch('load_sample',{confirmed:true,expectedRevision:null},context);
 assert.equal(loaded.revision,0);assert.equal(loaded.equipment.length,6);assert.equal(loaded.policy.mode,'ENFORCE');
 const created=await dispatch('create_permit',{expectedRevision:0,equipmentIds:['register:10202:EQ-1'],crewId:'Crew A',workers:['alice'],verifierIds:['alice']},context);
 assert.equal(created.revision,1);assert.equal(created.permit.state,'PLAN');assert.equal(created.permit.crewId,'Crew A');assert.equal(created.permit.workers[0],'alice');
 assert.equal(calls.filter(p=>p.includes('assignable/search')).length,1);
 const readback=await dispatch('get_state',{},context);assert.equal(readback.revision,1);assert.equal(readback.permit.id,'66400');
 await assert.rejects(dispatch('create_permit',{expectedRevision:0},context),/CONFLICT/);
});
test('participant validation rejects inactive, inaccessible or mismatched canonical issue without writes',async()=>{
 const route=(p,...a)=>p.reduce((s,t,i)=>s+t+(a[i]??''),'');
 for(const scenario of ['inactive','denied','mismatch']) {
  let searches=0;const api={asUser:()=>({requestJira:async path=>{
   if(path.includes('assignable/search')){searches++;return {ok:scenario!=='denied',status:scenario==='denied'?403:200,json:async()=>[{accountId:'alice',active:false}]};}
   return {ok:true,status:200,json:async()=>({id:scenario==='mismatch'?'999':'66400',key:'PGSAMPLE-1'})};
  }})};
  await assert.rejects(jiraAdapters(api,route).validatePeople(['alice'],'66400'),/Named person|PARTICIPANT_ISSUE_INVALID/);
  assert.equal(searches,scenario==='mismatch'?0:1);
 }
});

test('wrong point/equipment QR never changes operational revision; same-person low-energy activation succeeds',async()=>{
 const f=fixture();await verified(f);await f.call('play_crew_b',{confirmed:true});let state=await f.call('request_activation',{verifierId:'alice'});
 const baseline=structuredClone(f.row), equipmentId=state.permit.equipment[0].id, activationId=state.permit.activations[0].id;
 const wrong=await f.call('qr_challenge',{target:'V-3',expectedRevision:baseline.revision});assert.deepEqual(f.row,baseline);
 await assert.rejects(f.call('confirm_activation',{equipmentId:'V-3',activationId,...wrong,confirmedAtEquipment:true,expectedRevision:baseline.revision}),/ACTIVATION_EQUIPMENT_REQUIRED/);assert.deepEqual(f.row,baseline);
 const good=await f.call('qr_challenge',{target:equipmentId,expectedRevision:baseline.revision});assert.deepEqual(f.row,baseline);
 await assert.rejects(f.call('confirm_activation',{equipmentId,activationId,...good,qrValue:'permitguard:V-3',confirmedAtEquipment:true,expectedRevision:baseline.revision}),/QR_VALUE_MISMATCH/);assert.deepEqual(f.row,baseline);
 const ctx={accountId:'alice'}, wiring=createForgeWiring({dispatch:f.dispatch,requestJira:async()=>({ok:true,json:async()=>({id:'1',fields:{project:{id:'10'}}})})});
 const pending=await wiring.checkReadiness({issueId:'1'},ctx);assert.equal(pending.status,'NOT CLEARED');assert.equal(pending.transitionAllowed,false);assert.equal(pending.phase,'VERIFY');assert.ok(pending.reasons.some(r=>r.code==='HUMAN_ACTIVATION_REQUIRED'));assert.equal(pending.siteRevision,baseline.revision);assert.deepEqual(f.row,baseline);
 state=await f.call('confirm_activation',{equipmentId,activationId,...good,confirmedAtEquipment:true,expectedRevision:baseline.revision});assert.equal(state.permit.state,'ACTIVE');assert.equal(state.revision,baseline.revision+1);assert.equal(state.permit.activations[0].confirmedBy,'alice');
 const activeReport=await wiring.checkReadiness({issueId:'1'},ctx);assert.equal(activeReport.status,'CLEARED');assert.equal(activeReport.scope,'WORK_START');assert.match(activeReport.message,/WORK_START only.*not release clearance/);assert.equal('mandatoryNotice' in activeReport,false);assert.equal('displayStatus' in activeReport,false);assert.equal(activeReport.message.split('This is not release clearance.').length-1,1);assert.match(activeReport.message,/Phase: ACTIVE\. Release Status: NOT CLEARED/);assert.equal(activeReport.releaseStatus,'NOT CLEARED');
 await assert.rejects(f.call('confirm_activation',{equipmentId,activationId,...good,confirmedAtEquipment:true}),/QR_CHALLENGE_EXPIRED/);assert.equal(f.row.revision,state.revision);
 await f.call('begin_release');state=await f.call('remove_lock',{lockId:'A'});assert.equal(state.release.status,'NOT CLEARED');assert.ok(state.release.reasons.some(r=>r.lockId==='L-07'&&r.pointId==='V-3'));
 const release=await wiring.checkReadiness({issueId:'1'},ctx);assert.equal(release.status,'NOT CLEARED');assert.equal(release.transitionAllowed,false);assert.ok(release.reasons.some(r=>r.lockId==='L-07'));assert.match(release.message,/Simulated Crew B lock L-07 remains on isolation point V-3/);assert.doesNotMatch(release.message,/@Crew|SIMULATED.*'s|LOCK_REMAINS/);await f.call('remove_sample_lock',{confirmed:true});assert.equal((await f.call('close_permit')).permit.state,'CLOSED');
});
test('bad verification QR, expired/revision-changed/cross-actor challenge never advances revision',async()=>{
 const f=fixture();await created(f);await f.call('begin_lock');await f.call('apply_lock',{pointId:'V-3',lockId:'A',photoData:'data:image/png;base64,YQ=='});await f.call('begin_verify');
 let baseline=structuredClone(f.row);const challenge=await f.call('qr_challenge',{target:'V-3'});assert.deepEqual(f.row,baseline);
 await assert.rejects(f.call('verify_point',{pointId:'V-3',...challenge,qrValue:'permitguard:register:10:EQ-1',confirmedAtEquipment:true}),/QR_VALUE_MISMATCH/);assert.deepEqual(f.row,baseline);
 await assert.rejects(f.call('verify_point',{pointId:'V-3',...challenge,confirmedAtEquipment:false}),/AT_EQUIPMENT_CONFIRMATION_REQUIRED/);assert.deepEqual(f.row,baseline);
 await assert.rejects(f.call('verify_point',{pointId:'V-3',...challenge,confirmedAtEquipment:true},{accountId:'bob'}),/QR_CHALLENGE_EXPIRED/);assert.deepEqual(f.row,baseline);
 f.challengeRows.get('alice:1').expires=0;await assert.rejects(f.call('verify_point',{pointId:'V-3',...challenge,confirmedAtEquipment:true}),/QR_CHALLENGE_EXPIRED/);assert.deepEqual(f.row,baseline);
 const fresh=await f.call('qr_challenge',{target:'V-3'});await f.call('play_crew_b',{confirmed:true});baseline=structuredClone(f.row);await assert.rejects(f.call('verify_point',{pointId:'V-3',...fresh,confirmedAtEquipment:true}),/QR_CHALLENGE_EXPIRED/);assert.deepEqual(f.row,baseline);
 const current=await f.call('qr_challenge',{target:'V-3'});const results=await Promise.allSettled([f.call('verify_point',{pointId:'V-3',...current,confirmedAtEquipment:true}),f.call('verify_point',{pointId:'V-3',...current,confirmedAtEquipment:true})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(f.row.revision,baseline.revision+1);
});
test('dedicated Forge challenge records are bounded per actor/issue and never use site transaction',async()=>{
 const rows=new Map();const kvs={set:async(k,v)=>rows.set(k,structuredClone(v)),get:async k=>structuredClone(rows.get(k))};const c=forgeChallenges(kvs);
 await c.put({token:'one',actorId:'alice',issueId:'1',revision:9,expires:100});await c.put({token:'two',actorId:'alice',issueId:'1',revision:9,expires:200});assert.equal(rows.size,1);assert.equal((await c.get('alice','1')).token,'two');assert.equal(await c.get('bob','1'),undefined);assert.ok(![...rows.keys()][0].includes('alice'));
});
test('sample lock details are returned only to the synthetic owner',async()=>{
 const f=fixture();await created(f);await f.call('play_crew_b',{confirmed:true});const mine=await f.call('get_state');assert.equal(mine.sampleCrewB.locks[0].lockId,'L-07');assert.equal(mine.sampleCrewB.locks[0].simulated,true);
 const other=await f.call('get_state',{}, {accountId:'bob'});assert.equal(other.sampleCrewB.exists,false);assert.equal(other.sampleCrewB.locks,undefined);assert.ok(other.board[0].activeLockCount>0);
});

test('projection and Realtime run concurrently only after the atomic commit',async()=>{
 let block=false,releaseProperty,notifyStarted;const propertyWait=new Promise(r=>releaseProperty=r),notification=new Promise(r=>notifyStarted=r);
 const f=fixture({projectProperty:async()=>{if(block)await propertyWait;},publish:async()=>{if(block)notifyStarted();}});await created(f);const before=f.row.revision;block=true;
 const saving=f.call('begin_lock');await notification;assert.equal(f.row.revision,before+1);assert.equal(f.row.data.permits['1'].state,'LOCK');releaseProperty();const result=await saving;assert.equal(result.projection.status,'UPDATED');assert.equal(result.revision,before+1);
});
test('parallel post-commit failures remain nonauthoritative and never repeat a mutation',async()=>{
 let properties=0,notifications=0;const f=fixture({projectProperty:async()=>{properties++;throw new Error('private projection failure');},publish:async()=>{notifications++;throw new Error('private notification failure');}});await created(f);const before=f.row.revision,p=properties,n=notifications;const result=await f.call('begin_lock');assert.equal(result.revision,before+1);assert.equal(properties,p+1);assert.equal(notifications,n+1);assert.equal(result.projection.status,'FAILED_NONAUTHORITATIVE');assert.equal(result.realtime,'UNAVAILABLE');assert.equal(result.permit.state,'LOCK');
});
test('friendly issue/project labels come from the authorized Jira issue, not client claims',async()=>{
 const route=(p,...a)=>p.reduce((s,t,i)=>s+t+(a[i]??''),'');const api={asUser:()=>({requestJira:async path=>({ok:true,status:200,json:async()=>path.includes('mypermissions')?{permissions:{EDIT_ISSUES:{havePermission:true}}}:path.includes('myself')?{accountId:'alice',displayName:'Alice'}:{id:'66401',key:'PGSAMPLE-2',fields:{project:{id:'10202',key:'PGSAMPLE',name:'PermitGuard Sample Plant'}}}})})};
 const auth=await jiraAdapters(api,route).authorize({accountId:'alice',extension:{issue:{id:'66401'}},projectName:'forged'});assert.equal(auth.issueKey,'PGSAMPLE-2');assert.equal(auth.projectName,'PermitGuard Sample Plant');assert.equal(auth.projectKey,'PGSAMPLE');
});
