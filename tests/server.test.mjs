import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/server/service.mjs';
import { emptySite, forgeStore } from '../src/server/store.mjs';
import { jiraAdapters } from '../src/server/jira.mjs';
import { issueInvalidationPublisher } from '../src/server/realtime.mjs';
// All storage/Jira checks below are local mocks, NOT Forge/site acceptance.
function fixture() {
  let row = { revision: null, data: emptySite() }, seq = 0;
  const store = { atomic: true, async read() { return structuredClone(row); }, async commit(expected, data) { assert.equal(expected, row.revision, 'CONFLICT'); row = { revision: row.revision === null ? 0 : row.revision + 1, data: structuredClone(data) }; return row.revision; } };
  const dispatch = createService({ store, authorize: async c => { if (!c.accountId) throw new Error('AUTH'); return { actorId: c.accountId, issueId: c.issueId || '1', projectId: c.projectId || '10', isProjectAdmin: c.admin !== false, canEdit: c.edit !== false }; }, projectIsSample: async p => p === '10', validatePeople: async people => assert.ok(people.every(x => ['alice','bob'].includes(x))), now: () => '2026-11-19T18:00:00Z', uuid: () => 'token-' + ++seq });
  const ctx = { accountId: 'alice' };
  const call = (op,p = {},c = ctx) => dispatch(op,p,c);
  return { call, store, get row() { return row; } };
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
  await assert.rejects(f.call('confirm_activation',{activationId:s.permit.activations[0].id,equipmentId,confirmedAtEquipment:true}),/Invalid text/);
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
 await assert.rejects(f.call('verify_point',{pointId:'E-2',qrPointId:'E-2',confirmedAtEquipment:true}),/Invalid text/);
 const c=await f.call('qr_challenge',{target:'E-2'}); let s=await f.call('verify_point',{pointId:'E-2',...c,confirmedAtEquipment:true}); assert.equal(s.readiness.status,'NOT CLEARED');
 await assert.rejects(f.call('verify_point',{pointId:'E-2',...c,confirmedAtEquipment:true}),/Fresh/);
 const b=await f.call('qr_challenge',{target:'E-2'},{accountId:'bob'}); s=await f.call('verify_point',{pointId:'E-2',...b,confirmedAtEquipment:true},{accountId:'bob'}); assert.equal(s.readiness.status,'CLEARED');
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
 await assert.rejects(a.authorize({accountId:'alice',extension:{issue:{id:'1'}}}),/403/); assert.equal(requests,1);
});
test('realtime carries only invalidation and revision',async()=>{
 let args; await issueInvalidationPublisher(async(...a)=>{args=a;return {errors:[]};})({revision:4,secret:'no'}); assert.deepEqual(args,['permitguard',{invalidated:true,revision:4}]);
});
