import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { privacyInventory, inventoryPage, privacyPlan, reportPrivacyBatch, validAccount } from '../src/server/privacy.mjs';
import { createPrivacyAdmin } from '../src/forge/privacy.mjs';
const at = '2026-11-01T00:00:00.000Z';
const site = () => ({schemaVersion:1,permits:{one:{state:'ACTIVE',workers:['worker:1'],verifierIds:['verifier-2'],locks:[{actorId:'worker:1',name:'Private Name',appliedAt:at,removedAt:null}],verifications:[{actorId:'verifier-2',at}],activations:[{requestedBy:'requester',verifierId:'verifier-2',confirmedBy:'verifier-2'}],audit:[{actorId:'auditor',at}],sampleOwner:'owner'}},evidence:{one:{actorId:'photographer',at,data:'data:image/jpeg;PRIVATE'}},projects:{}});
const batch = () => [{accountId:'worker:1',updatedAt:at}];

test('inventory covers current structured identities, deduplicates and never invents retrieval dates',()=>{
 const s=site(), before=JSON.stringify(s);
 const inv=privacyInventory({site:s,archiveConfig:{allowedUserIds:['archive-reader'],confirmedBy:'archive-admin',confirmedAt:at}});
 assert.deepEqual(inv.accounts.map(a=>a.accountId),['archive-admin','archive-reader','auditor','owner','photographer','requester','verifier-2','worker:1']);
 assert.equal(inv.unknownAgeCount,8); assert.equal(inv.complete,false);
 assert.equal(JSON.stringify(s),before); assert.ok(!JSON.stringify(inv).includes('Private Name')); assert.ok(!JSON.stringify(inv).includes('data:image'));
});
test('only explicit provenance timestamps accepted, oldest date is caller contract not event inference',()=>{
 const inv=privacyInventory({site:site(),retrievalAges:{'worker:1':at,'verifier-2':'not-a-date'}});
 assert.equal(inv.accounts.find(a=>a.accountId==='worker:1').updatedAt,at);
 assert.equal(inv.accounts.find(a=>a.accountId==='verifier-2').updatedAt,null);
});
test('unknown omitted; malformed accounts counted, never reported as valid',()=>{
 assert.equal(validAccount('unknown'),false); assert.equal(validAccount('person@example.test'),false);
 const inv=privacyInventory({site:{schemaVersion:1,workers:['unknown','bad/id','ok']}});
 assert.deepEqual(inv.accounts,[{accountId:'ok',updatedAt:null}]); assert.equal(inv.invalidIdentityCount,1);
});
test('bounded inventory fails closed on excessive size/depth or invalid identity array',()=>{
 assert.throws(()=>privacyInventory({site:{schemaVersion:1,x:'x'.repeat(220000)}}),/LIMIT/);
 let s={schemaVersion:1}; let child=s; for(let i=0;i<34;i++){child.x={};child=child.x;}
 assert.throws(()=>privacyInventory({site:s}),/LIMIT/);
 assert.throws(()=>privacyInventory({site:{schemaVersion:1,workers:'actor'}}),/STORAGE_INVALID/);
});
test('90 bounded pages stable order, complete continuation and stale rejection',()=>{
 const s={schemaVersion:1,workers:Array.from({length:181},(_,i)=>'actor-'+String(i).padStart(3,'0'))};
 const inv=privacyInventory({site:s}); const a=inventoryPage(inv),b=inventoryPage(inv,{cursor:a.nextCursor}),c=inventoryPage(inv,{cursor:b.nextCursor});
 assert.deepEqual([a.accounts.length,b.accounts.length,c.accounts.length,c.nextCursor],[90,90,1,null]);
 assert.equal(new Set([...a.accounts,...b.accounts,...c.accounts].map(a=>a.accountId)).size,181);
 assert.throws(()=>inventoryPage(inv,{limit:91}),/BATCH_LIMIT/);
 assert.throws(()=>inventoryPage(inv,{cursor:'bad'}),/CURSOR_INVALID/);
 s.workers.push('new'); assert.throws(()=>inventoryPage(privacyInventory({site:s}),{cursor:a.nextCursor}),/CURSOR_STALE/);
});
test('legacy unknown age blocked before any SDK request',async()=>{
 let calls=0; await assert.rejects(()=>reportPrivacyBatch({accounts:privacyInventory({site:site()}).accounts,reportPersonalData:async()=>{calls++;return [];}}),/INPUT_INVALID/); assert.equal(calls,0);
});
test('batch input rejects too many, duplicates, unknown and malformed times before request',async()=>{
 for(const accounts of [Array.from({length:91},()=>batch()[0]),[...batch(),...batch()],[{accountId:'unknown',updatedAt:at}],[{accountId:'ok',updatedAt:'2026-11-01'}]]) await assert.rejects(()=>reportPrivacyBatch({accounts,reportPersonalData:async()=>assert.fail('must not request')}),/INPUT_INVALID/);
});
test('SDK request is one bounded projected call, never includes names/photos',async()=>{
 let calls=0; const accounts=[{...batch()[0],name:'SECRET',photo:'SECRET'}];
 const result=await reportPrivacyBatch({accounts,reportPersonalData:async sent=>{calls++; assert.deepEqual(sent,batch()); return [{accountId:'worker:1',status:'closed'}];}});
 assert.equal(calls,1);assert.equal(result.actions[0].requiredAction,'ERASURE_REVIEW_REQUIRED'); assert.equal(result.erasurePerformed,false);assert.equal(result.cycleHeaderAvailable,false);
});
test('updated means review not completed refresh; 204-style empty update list not erasure proof',async()=>{
 const result=await reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>[{accountId:'worker:1',status:'updated'}]}); assert.equal(result.actions[0].requiredAction,'ERASE_OR_REFRESH_REVIEW_REQUIRED');
 const empty=await reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>[]}); assert.deepEqual(empty.actions,[]);assert.equal(empty.erasurePerformed,false);
 const noRequest=await reportPrivacyBatch({accounts:[],reportPersonalData:async()=>assert.fail()});assert.equal(noRequest.status,'EMPTY');
});
test('rate limits preserve Retry-After and cursor; no retry or sensitive error propagation',async()=>{
 let calls=0; const r=await reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>{calls++;throw {status:429,headers:{get:()=> '120'},message:'PRIVATE ACCOUNT'};}});
 assert.equal(calls,1);assert.equal(r.retryAfterSeconds,120);assert.equal(r.advanceCursor,false);assert.ok(!JSON.stringify(r).includes('PRIVATE'));
 for(const status of [400,500,503]) {const r=await reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>{throw {status};}});assert.equal(r.advanceCursor,false);}
});
test('malformed, unrelated, duplicated and unknown provider results rejected',async()=>{
 for(const updates of [{},[{accountId:'other',status:'closed'}],[{accountId:'worker:1',status:'surprise'}],[{accountId:'worker:1',status:'closed'},{accountId:'worker:1',status:'closed'}]]) await assert.rejects(()=>reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>updates}),/RESPONSE_INVALID/);
});
test('active and malformed closed rows with remaining locks never become deletion candidates',()=>{
 for(const state of ['ACTIVE','CLOSED']) {const s=site();s.permits.one.state=state;const before=JSON.stringify(s);const p=privacyPlan(s,'worker:1',{closedBefore:at});assert.equal(p.reviewCandidates,0);assert.equal(p.activeLocks,1);assert.equal(p.mutationSupported,false);assert.match(p.disposition,/SAFETY_HOLD/);assert.equal(JSON.stringify(s),before);}
});
test('closed older than chosen cutoff is review only, missing age never assumed expired',()=>{
 const s=site(); const p=s.permits.one;p.state='CLOSED';p.locks[0].removedAt=at;p.audit.push({actorId:'worker:1',action:'PERMIT_ARCHIVED',at});
 const plan=privacyPlan(s,'worker:1',{closedBefore:'2026-11-02T00:00:00Z'});assert.equal(plan.reviewCandidates,1);assert.equal(plan.erasurePerformed,false);assert.equal(plan.retentionPolicyApproved,false);
 p.audit=[];assert.equal(privacyPlan(s,'worker:1',{closedBefore:at}).missingCloseAge,1);
});
function adminFixture(...args){const permission=args.length?args[0]:true;let reads=0,calls=0;const handler=createPrivacyAdmin({api:{asUser:()=>({requestJira:async path=>{calls++; assert.equal(path,'/rest/api/3/mypermissions?permissions=ADMINISTER');return {ok:true,json:async()=>({permissions:{ADMINISTER:{havePermission:permission}}})};}})},route:strings=>strings.join(''),store:{read:async()=>{reads++;return {revision:4,data:site()};}},readArchiveConfig:async()=>({allowedUserIds:['archive-reader']})});return {handler,reads:()=>reads,calls:()=>calls};}
test('native site admin check is strict, precedes reads, cannot be forged by payload',async()=>{
 for(const permission of [false,undefined,'true',1]){const f=adminFixture(permission);const r=await f.handler({context:{accountId:'actor'},payload:{operation:'inventory_summary',isSiteAdmin:true}});assert.equal(r.code,'SITE_ADMIN_REQUIRED');assert.equal(f.reads(),0);}
 const f=adminFixture();assert.equal((await f.handler({payload:{accountId:'actor',operation:'inventory_summary'}})).ok,false);assert.equal(f.calls(),0);
});
test('site admin summary returns only counts; candidate erasure endpoint is plan-only',async()=>{
 const f=adminFixture();const context={accountId:'actor'};const summary=await f.handler({context,payload:{operation:'inventory_summary'}});assert.equal(summary.ok,true);assert.equal(summary.accountCount,7);assert.equal(summary.reportingActivated,false);assert.ok(!JSON.stringify(summary).includes('worker:1'));assert.ok(!Object.hasOwn(summary,'fingerprint'));
 const plan=await f.handler({context,payload:{operation:'erasure_plan',accountId:'worker:1'}});assert.equal(plan.ok,true);assert.equal(plan.erasurePerformed,false);assert.equal(plan.activeLocks,1);
 assert.equal((await f.handler({context,payload:{operation:'delete_all'}})).code,'PRIVACY_OPERATION_INVALID');
});
test('candidates are not runtime activated; operational domain/store/manifest unchanged',()=>{
 const entry=readFileSync(new URL('../src/forge/index.js',import.meta.url),'utf8');const manifest=readFileSync(new URL('../manifest.yml',import.meta.url),'utf8');
 assert.ok(!entry.includes('./privacy.mjs'));assert.ok(!manifest.includes('report:personal-data'));assert.ok(!manifest.includes('scheduledTrigger'));
});

test('installed Forge SDK transport contract: 200/204, <=90 request and hidden Cycle-Period',async()=>{
 const {createRequire}=await import('node:module'); const require=createRequire(import.meta.url);
 const {createReportPersonalData,LIMIT,URL}=require('@forge/api/out/privacy/index.js');
 assert.equal(LIMIT,90);assert.equal(URL,'/app/report-accounts');
 for(const status of [200,204]) {
  let requests=0, headerReads=0;
  const sdkReport=createReportPersonalData(async(path,options)=>{
   requests++;assert.equal(path,'/app/report-accounts');assert.equal(options.method,'POST');assert.deepEqual(JSON.parse(options.body),{accounts:batch()});
   return {status,headers:{get:()=>{headerReads++;return '604800';}},json:async()=>({accounts:[{accountId:'worker:1',status:'updated'}]})};
  });
  const result=await reportPrivacyBatch({accounts:batch(),reportPersonalData:sdkReport});
  assert.equal(requests,1);assert.equal(headerReads,0);assert.equal(result.advanceCursor,false);assert.equal(result.requiresDurableCheckpoint,true);assert.equal(result.cycleHeaderAvailable,false);
 }
});
test('candidate admin retention plan, provider failure and missing archive are sanitized',async()=>{
 const f=adminFixture();const result=await f.handler({context:{accountId:'actor'},payload:{operation:'retention_plan',accountId:'worker:1',closedBefore:at}});assert.equal(result.ok,true);assert.equal(result.dryRun,true);
 const handler=createPrivacyAdmin({api:{asUser:()=>({requestJira:async()=>{throw new Error('SECRET USER');}})}});
 const denied=await handler({context:{accountId:'actor'},payload:{operation:'inventory_summary'}});assert.deepEqual(denied,{ok:false,code:'PRIVACY_UNAVAILABLE',erasurePerformed:false});
});

test('null provider entries and non-existent calendar dates fail closed',async()=>{
 await assert.rejects(()=>reportPrivacyBatch({accounts:batch(),reportPersonalData:async()=>[null]}),/RESPONSE_INVALID/);
 for(const updatedAt of ['2026-02-30T00:00:00Z','2026-11-01T24:00:00Z','2026-11-01T00:00:60Z']) await assert.rejects(()=>reportPrivacyBatch({accounts:[{accountId:'ok',updatedAt}],reportPersonalData:async()=>assert.fail('no request')}),/INPUT_INVALID/);
});
test('oversized admin payload rejected before operational storage reads',async()=>{
 const f=adminFixture();const r=await f.handler({context:{accountId:'actor'},payload:{operation:'inventory_summary',irrelevant:'x'.repeat(1024)}});assert.equal(r.code,'PRIVACY_OPERATION_INVALID');assert.equal(f.reads(),0);
});
