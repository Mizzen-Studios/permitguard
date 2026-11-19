import test from 'node:test';
import assert from 'node:assert/strict';
import { assetsAdapter, ASSETS, validateAssetsConfig } from '../src/server/assets.mjs';
import { createService } from '../src/server/service.mjs';
import { emptySite } from '../src/server/store.mjs';
const config={workspaceId:'11111111-2222-3333-4444-555555555555',schemaId:'72',equipmentTypeId:'801',pointTypeId:'802'};
const route=(p,...a)=>p.reduce((s,v,i)=>s+v+(a[i]??''),'');
const attribute=(name,value)=>({objectTypeAttribute:{name},objectAttributeValues:[{value}]});
function fixture(c=config,transform=x=>x, transformBody=x=>x){
 const requests=[];
 const readAssets=assetsAdapter({asUser:()=>({requestJira:async(path,opts)=>{
  requests.push({path,opts});let value;
  if(!opts){const equipment=path.endsWith('/'+c.equipmentTypeId);value=transform({id:equipment?c.equipmentTypeId:c.pointTypeId,name:equipment?'Equipment':'Isolation points',objectSchemaId:c.schemaId});}
  else {const equipment=JSON.parse(opts.body).qlQuery.endsWith(' '+c.equipmentTypeId);value={isLast:true,total:1,values:[{id:equipment?'4666':'4667',objectKey:equipment?'TEST-4666':'TEST-4667',label:'Synthetic only',objectType:{id:equipment?c.equipmentTypeId:c.pointTypeId,objectSchemaId:c.schemaId},attributes:equipment?[]:[attribute('Equipment key','TEST-4666'),attribute('Energy type','HYDRAULIC'),attribute('High energy',false),attribute('Lock state','ISOLATION_REQUIRED')]}]};}
  if(opts){
    const object=value.values[0];value.objectTypeAttributes=object.attributes.map((a,i)=>({id:String(100+i),name:a.objectTypeAttribute.name,objectType:object.objectType}));
    object.attributes=object.attributes.map((a,i)=>({objectTypeAttributeId:String(100+i),objectAttributeValues:a.objectAttributeValues}));
    value=transformBody(value);
  }
  return {ok:true,json:async()=>value};
 }})},route);return {requests,readAssets};
}
test('arbitrary configured judge site verifies exact types before bounded object reads',async()=>{
 const f=fixture();const rows=await f.readAssets(config);assert.equal(f.requests.length,4);
 assert.deepEqual(f.requests.slice(0,2).map(r=>r.path),[config.equipmentTypeId,config.pointTypeId].map(id=>'/jsm/assets/workspace/'+config.workspaceId+'/v1/objecttype/'+id));
 assert.deepEqual(f.requests.slice(2).map(r=>JSON.parse(r.opts.body).qlQuery),['objectSchemaId = 72 AND objectTypeId = 801','objectSchemaId = 72 AND objectTypeId = 802']);
 assert.equal(rows[0].id,'assets:'+config.workspaceId+':72:4666');assert.equal(rows[0].isolationPoints[0].id,'assets:'+config.workspaceId+':72:4667');
});
test('unrelated names, wrong schema or type abort before ANY object data',async()=>{
 for(const transform of [t=>({...t,name:'Instruments'}),t=>({...t,name:'Calibration'}),t=>({...t,name:'equipment'}),t=>({...t,objectSchemaId:'999'}),t=>({...t,id:'999'}),t=>t.name==='Isolation points'?{...t,name:'Calibration'}:t]){
 const f=fixture(config,transform);await assert.rejects(f.readAssets(config),/ASSETS_UNAVAILABLE/);assert.ok(f.requests.every(r=>!r.opts));}
});
test('malformed config fails before metadata or object calls; unknown client AQL ignored',async()=>{
 for(const bad of [null,[],{}, {...config,workspaceId:'../escape'}, {...config,schemaId:'72 OR 1=1'}, {...config,equipmentTypeId:801}, {...config,pointTypeId:'0'}, {...config,pointTypeId:'801'}, {...config,schemaId:'1234567890123456'}]){
 const f=fixture();await assert.rejects(f.readAssets(bad),/ASSETS_UNAVAILABLE/);assert.equal(f.requests.length,0);}
 assert.deepEqual(validateAssetsConfig({...config,qlQuery:'read everything'}),config);
});
test('approved demo remains default and verifies metadata',async()=>{const f=fixture(ASSETS);const rows=await f.readAssets();assert.equal(rows.length,1);assert.equal(f.requests.length,4);});
test('confirmed admin import stores sanitized config and every reread receives it',async()=>{
 let row={revision:null,data:emptySite()};const seen=[];
 const store={atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);row={revision:(row.revision??-1)+1,data:structuredClone(data)};return row.revision;}};
 const f=fixture();const dispatch=createService({store,authorize:async c=>({actorId:'alice',issueId:'1',projectId:'10',canEdit:true,isProjectAdmin:c.admin!==false}),readAssets:async c=>{seen.push(c);return f.readAssets(c);}});
 await assert.rejects(dispatch('import_assets',{confirmed:true,config},{admin:false}),/administrator/);assert.equal(seen.length,0);
 await dispatch('import_assets',{confirmed:true,config:{...config,qlQuery:'forbidden'}});assert.deepEqual(row.data.projects['10'].assetsConfig,config);
 await dispatch('get_state');await dispatch('list_equipment');assert.equal(seen.length,3);assert.ok(seen.every(c=>JSON.stringify(c)===JSON.stringify(config)));
});

test('real AQL attribute joins reject duplicate definitions, attributes, and foreign schemas',async()=>{
 for(const change of [b=>{b.objectTypeAttributes.push(b.objectTypeAttributes[0]);return b;},b=>{b.objectTypeAttributes[0].objectType={id:'802',objectSchemaId:'999'};return b;},b=>{b.values[0].attributes.push(b.values[0].attributes[0]);return b;},b=>{b.values[0].attributes[0].objectTypeAttributeId='999';return b;},b=>({...b,hasMoreResults:true}),b=>({...b,startAt:1})]){
 const f=fixture(config,x=>x,b=>b.objectTypeAttributes.length?change(b):b);await assert.rejects(f.readAssets(config),/ASSETS_UNAVAILABLE/);}
});
