import test from 'node:test';
import assert from 'node:assert/strict';
import { assetsAdapter } from '../src/server/assets.mjs';
import { createService } from '../src/server/service.mjs';
import { emptySite, storageHealth } from '../src/server/store.mjs';
const attrNames=['Equipment key','Energy type','Lock state','High energy'];
const attr = (name,value) => ({objectTypeAttributeId:String(1100+attrNames.indexOf(name)),objectAttributeValues:[{value}]});
const equipment = {id:'4666',objectKey:'PGTEST-4666',label:'Synthetic equipment',objectType:{id:'147',objectSchemaId:'16'},attributes:[]};
const point = {id:'4667',objectKey:'PGTEST-4667',objectType:{id:'148',objectSchemaId:'16'},attributes:[attr('Equipment key','PGTEST-4666'),attr('Energy type','HYDRAULIC'),attr('Lock state','ISOLATION_REQUIRED'),attr('High energy',false)]};
const route = (p,...a) => p.reduce((s,v,i)=>s+v+(a[i]??''),'');
function adapter(transform=x=>x) {
 const requests=[];
 const readAssets=assetsAdapter({asUser:()=>({requestJira:async(path,opts)=>{requests.push({path,...opts});if(!opts?.body){const id=path.split('/').at(-1);return {ok:true,json:async()=>({id,name:id==='147'?'Equipment':'Isolation points',objectSchemaId:'16'})};}const type=JSON.parse(opts.body).qlQuery.endsWith('147');const objectType={id:type?'147':'148',objectSchemaId:'16'};return {ok:true,json:async()=>transform({values:[structuredClone(type?equipment:point)],objectTypeAttributes:type?[]:attrNames.map((name,i)=>({id:String(1100+i),name,objectType})),total:1,isLast:true},type)};}})},route);
 return {readAssets,requests};
}
test('asUser Assets uses only approved Equipment + Isolation AQL and canonical IDs',async()=>{
 const a=adapter(), rows=await a.readAssets();assert.equal(a.requests.length,4);
 assert.ok(a.requests.every(r=>r.path.startsWith('/jsm/assets/workspace/1db77da0-e980-42be-9efa-3a83dbf05728/v1/')));
 assert.deepEqual(a.requests.filter(r=>r.body).map(r=>JSON.parse(r.body).qlQuery),['objectSchemaId = 16 AND objectTypeId = 147','objectSchemaId = 16 AND objectTypeId = 148']);
 assert.equal(rows[0].key,'PGTEST-4666');assert.match(rows[0].id,/:4666$/);assert.match(rows[0].isolationPoints[0].id,/:4667$/);assert.equal(rows[0].isolationPoints[0].highEnergy,false);
});
test('incomplete, malformed, unrelated metadata never becomes usable register',async()=>{
 for(const transform of [b=>({...b,total:101}),b=>({...b,isLast:false}),(b,t)=>{if(!t)b.values[0].attributes.pop();return b;},b=>{b.values[0].objectType.objectSchemaId='99';return b;}])await assert.rejects(adapter(transform).readAssets(),/ASSETS_UNAVAILABLE/);
 await assert.rejects(assetsAdapter({asUser:()=>({requestJira:async()=>({ok:false,status:403})})},route)(),/403/);
});
test('explicit import is admin only; live authority checked early and fails closed at Plan',async()=>{
 let row={revision:null,data:emptySite()},denied=false;
 const store={atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);row={revision:(row.revision??-1)+1,data:structuredClone(data)};return row.revision;}};
 const a=adapter();const dispatch=createService({store,authorize:async c=>({actorId:'alice',issueId:'1',projectId:'10',canEdit:true,isProjectAdmin:c.admin!==false}),readAssets:async()=>{if(denied)throw Error('403');return a.readAssets();},validatePeople:async()=>{}});
 await assert.rejects(dispatch('import_assets',{confirmed:true},{admin:false}),/administrator/);
 await assert.rejects(dispatch('import_assets'),/confirmation/);
 let s=await dispatch('import_assets',{confirmed:true});assert.equal(s.policy.mode,'WARN_ONLY');assert.equal(s.assets.status,'CONNECTED_AS_USER');
 assert.equal((await dispatch('list_equipment')).equipment.length,1);
 denied=true;s=await dispatch('get_state');assert.equal(s.assets.status,'UNAVAILABLE');assert.deepEqual(s.equipment,[]);assert.equal(s.readiness.status,'NOT CLEARED');await assert.rejects(dispatch('create_permit'),/ASSETS_UNAVAILABLE/);
 denied=false;await dispatch('create_permit');denied=true;s=await dispatch('check_readiness');assert.ok(s.reasons.some(r=>r.code==='REGISTER_UNAVAILABLE'));
 await assert.rejects(dispatch('confirm_activation'),/ASSETS_UNAVAILABLE/);
});
test('synthetic CES health probe never uses operational aggregate, rejects stale conditions',async()=>{
 let row;const keys=[];class Filter{and(k,v){this.condition=v;return this;}}
 const FilterConditions={notExists:()=>null,equalTo:x=>x};
 const kvs={entity:()=>({get:async key=>{keys.push(key);return structuredClone(row);}}),transact:()=>({set(key,value,opts){keys.push(key);this.value=value;this.expected=opts.conditions.condition;return this;},async execute(){if((row?.revision??null)!==this.expected)throw Error('CONDITION_FAILED');row=this.value;}})};
 const r=await storageHealth({kvs,Filter,FilterConditions});assert.equal(r.staleWriteRejected,true);assert.ok(keys.every(k=>k==='health-v1'));await storageHealth({kvs,Filter,FilterConditions});assert.equal(row.revision,1);
});
