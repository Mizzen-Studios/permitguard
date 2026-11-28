import test from 'node:test';
import assert from 'node:assert/strict';
import {createService} from '../src/server/service.mjs';
import {emptySite} from '../src/server/store.mjs';
function fixture({projectionFails=false,commitFails=false}={}){
 let row={revision:0,data:emptySite()},writes=0,tick=0;const projected=[],events=[];
 row.data.projects['10']={policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},equipment:[{id:'EQ-1',name:'Pump',isolationPoints:[{id:'V-3',energyType:'HYDRAULIC',highEnergy:false}]}],syntheticDemoRegister:true};
 const call=createService({store:{atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);if(commitFails)throw new Error('CONFLICT');row={revision:expected+1,data:structuredClone(data)};writes++;return row.revision;}},authorize:async()=>({actorId:'human',issueId:'1',projectId:'10',canEdit:true,isProjectAdmin:true}),validatePeople:async()=>{},projectProperty:async(id,p)=>{projected.push({id,p});if(projectionFails)throw new Error('Projection unavailable');},publish:async()=>{},now:()=> '2026-11-28T09:10:00.000Z',clock:()=>tick+=2,observeTiming:e=>events.push(e)});
 return {call:(op,payload={})=>call(op,payload,{}),get row(){return row;},get writes(){return writes;},projected,events};
}
const plan={equipmentIds:['EQ-1'],workers:['human'],verifierIds:['human'],crewId:'Demo',expectedRevision:0};
test('new PLAN projection has truthful projection time, distinct site/permit revisions and no invented audit',async()=>{
 const f=fixture(),result=await f.call('create_permit',plan);
 assert.equal(result.revision,1);assert.equal(result.permit.revision,0);assert.equal(result.projection.status,'UPDATED');
 const p=f.projected[0].p;assert.equal(p.updatedAt,'2026-11-28T09:10:00.000Z');assert.equal(p.projectedAt,p.updatedAt);assert.equal(p.lastAuditAt,null);assert.equal(p.timestampSource,'POST_COMMIT_PROJECTION');assert.equal(p.siteRevision,1);assert.equal(p.revision,0);assert.equal(p.authoritative,false);assert.deepEqual(result.permit.audit,[]);
 const before=structuredClone(f.row),count=f.projected.length;const reread=await f.call('get_state');
 assert.deepEqual(f.row,before);assert.equal(f.writes,1);assert.equal(f.projected.length,count);assert.equal(reread.permit.state,'PLAN');
});
test('old undated PLAN is not repaired or mutated by read; diagnostics are bounded no identity',async()=>{
 const f=fixture();await f.call('create_permit',plan);const p=f.row.data.permits['1'];assert.equal(p.audit.length,0);
 const result=await f.call('get_state');assert.equal(f.writes,1);assert.equal(f.projected.length,1);
 assert.deepEqual(Object.keys(result.serverTiming).sort(),['assetsMs','authorizationMs','storageReadMs','totalMs']);
 for(const v of Object.values(result.serverTiming))assert.ok(Number.isSafeInteger(v)&&v>=0);
 assert.equal(f.events.at(-1).operation,'get_state');assert.ok(!JSON.stringify(f.events).includes('human'));
});
test('projection failure stays non-authoritative, no automatic retry; commit failure never publishes',async()=>{
 const f=fixture({projectionFails:true}),r=await f.call('create_permit',plan);assert.equal(r.projection.status,'FAILED_NONAUTHORITATIVE');assert.equal(f.writes,1);assert.equal(f.projected.length,1);
 const c=fixture({commitFails:true});await assert.rejects(c.call('create_permit',plan),/CONFLICT/);assert.equal(c.writes,0);assert.equal(c.projected.length,0);
});
