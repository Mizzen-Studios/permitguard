import test from 'node:test';
import assert from 'node:assert/strict';
import {jiraAdapters} from '../src/server/jira.mjs';
import {createService} from '../src/server/service.mjs';
import {emptySite} from '../src/server/store.mjs';
const route=(parts,...args)=>parts.reduce((s,p,i)=>s+p+(args[i]??''),'');
function native({denied=false,inactive=false}={}){
 const calls=[];let inFlight=0,maxConcurrent=0;
 const adapter=jiraAdapters({asUser:()=>({requestJira:async path=>{
  calls.push(path);
  if(path.includes('mypermissions'))return {ok:!denied,status:denied?403:200,json:async()=>({permissions:{EDIT_ISSUES:{havePermission:true},ADMINISTER_PROJECTS:{havePermission:true}}})};
  if(path.includes('assignable')){inFlight++;maxConcurrent=Math.max(maxConcurrent,inFlight);await new Promise(r=>setTimeout(r,2));inFlight--;const id=new URL('https://local'+path).searchParams.get('accountId');return {ok:true,status:200,json:async()=>[{accountId:id,active:!inactive}]};}
  if(path.endsWith('/myself'))throw new Error('Unneeded profile call');
  return {ok:true,status:200,json:async()=>({id:'1',key:'KAN-1',fields:{project:{id:'10'}}})};
 }})},route);
 return {adapter,calls,get maxConcurrent(){return maxConcurrent;}};
}
test('same authorization capability reuses trusted key; cloned/client key never qualifies',async()=>{
 const f=native(),a=await f.adapter.authorize({accountId:'alice',issueId:'1'},{includeProfile:false});
 await f.adapter.validatePeople(['alice'],'1',a);
 assert.equal(f.calls.filter(s=>s.includes('?fields=project')).length,1);
 await f.adapter.validatePeople(['alice'],'1',{...a,issueKey:'EVIL-1'});
 assert.equal(f.calls.filter(s=>s.includes('?fields=project')).length,2);
 assert.ok(f.calls.filter(s=>s.includes('assignable')).every(s=>s.includes('issueKey=KAN-1')));
 await assert.rejects(f.adapter.validatePeople(['alice'],'2',a),/ISSUE_INVALID/);
});
test('participant validation is exact and bounded to four concurrent native reads',async()=>{
 const f=native(),a=await f.adapter.authorize({accountId:'alice',issueId:'1'},{includeProfile:false});
 await f.adapter.validatePeople(Array.from({length:9},(_,i)=>'worker'+i),'1',a);
 assert.equal(f.maxConcurrent,4);
 assert.equal(f.calls.filter(s=>s.includes('assignable')).length,9);
 const bad=native({inactive:true});await assert.rejects(bad.adapter.validatePeople(['alice'],'1'),/unavailable or not assignable/);
 await assert.rejects(f.adapter.validatePeople(Array(41).fill('alice'),'1',a),/unavailable/);
});
test('fresh denied authorization prevents any operational read or write',async()=>{
 const f=native({denied:true});let reads=0;
 const dispatch=createService({...f.adapter,store:{atomic:true,read:async()=>{reads++;throw new Error('MUST_NOT_READ');}}});
 await assert.rejects(dispatch('create_permit',{}, {accountId:'alice',issueId:'1'}),/403/);assert.equal(reads,0);
});
test('create commits once; profile omitted; fresh participant checks; timings contain no identities',async()=>{
 const f=native(),timings=[];let row={revision:null,data:emptySite()},writes=0,tick=0;
 const dispatch=createService({...f.adapter,store:{atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);row={revision:expected===null?0:expected+1,data:structuredClone(data)};writes++;return row.revision;}},clock:()=>tick+=3,observeTiming:t=>timings.push(t),now:()=> '2026-11-27T21:00:00Z'});
 const c={accountId:'alice',issueId:'1'};
 // Preconfigured synthetic register; this test never contacts an actual site.
 row={revision:0,data:emptySite()};row.data.projects['10']={policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},equipment:[{id:'EQ-1',name:'Pump',isolationPoints:[{id:'V-3',highEnergy:false,energyType:'HYDRAULIC'}]}],syntheticDemoRegister:true};
 const result=await dispatch('create_permit',{equipmentIds:['EQ-1'],workers:['alice'],verifierIds:['alice'],crewName:'Judge demo',expectedRevision:0},c);
 assert.equal(result.permit.state,'PLAN');assert.equal(result.revision,1);assert.equal(writes,1);
 assert.equal(f.calls.length,4); // issue + permission + one deduplicated person + property PUT
 assert.ok(!f.calls.some(s=>s.includes('/myself')));
 assert.equal(timings.length,1);assert.equal(timings[0].operation,'create_permit');
 for(const key of ['authorizationMs','storageReadMs','participantsMs','commitMs','sideEffectsMs','totalMs'])assert.ok(timings[0][key]>=0,key);
 assert.ok(!JSON.stringify(timings).includes('alice'));assert.ok(!JSON.stringify(timings).includes('KAN'));
 await assert.rejects(dispatch('create_permit',{equipmentIds:['EQ-1'],expectedRevision:0},c),/CONFLICT|revision|already/i);assert.equal(writes,1);
});
