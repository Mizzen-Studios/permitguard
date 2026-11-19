import { assetsAdapter } from '../server/assets.mjs';
import { testStorageHealth } from '../server/index.mjs';
import api,{route} from '@forge/api';
import {timingSafeEqual} from 'node:crypto';
export async function handler(request){
 const supplied=(request.headers?.authorization||request.headers?.Authorization||[])[0]||'';
 const expected=process.env.PERMITGUARD_SMOKE_TOKEN;
 const a=Buffer.from(supplied),b=Buffer.from('Bearer '+(expected||''));
 const response=(statusCode,value)=>({statusCode,headers:{'Content-Type':['application/json'],'Cache-Control':['no-store']},body:JSON.stringify(value)});
 if(!expected||a.length!==b.length||!timingSafeEqual(a,b))return response(401,{error:'UNAUTHORIZED'});
 if(!['GET','POST'].includes(request.method))return response(405,{error:'UNSUPPORTED_METHOD'});
 if(request.method==='POST'){
  let input;try{input=JSON.parse(request.body||'{}')}catch{return response(400,{error:'INVALID_JSON'})}
  if(input.operation!=='disable_and_test_delete_unassigned_fixture')return response(400,{error:'FIXED_FIXTURE_ONLY'});
  const getRules=async()=>{const r=await api.asApp().requestJira(route`/rest/api/3/workflow/rule/config?types=validator&startAt=0&maxResults=50`);if(!r.ok)throw new Error('RULE_LIST_'+r.status);const b=await r.json();if(b.isLast!==true)throw new Error('INCOMPLETE_RULE_LIST');return b.values;};
  const name='PermitGuard UNASSIGNED API recovery fixture';
  const own=await getRules();const fixture=own.find(w=>w.workflowId.name===name);
  if(!fixture)return response(404,{error:'FIXTURE_NOT_FOUND',ownedWorkflowCount:own.length});
  const permitted=new Set(['permitguard-start-validator','permitguard-release-validator']);
  const rules=fixture.validators.filter(r=>permitted.has(r.key)||[...permitted].some(k=>r.key.endsWith('/'+k)));
  if(rules.length!==2)return response(409,{error:'EXPECTED_TWO_APP_RULES',keys:fixture.validators.map(r=>r.key)});
  const update=await api.asApp().requestJira(route`/rest/api/3/workflow/rule/config`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({workflows:[{workflowId:{name},validators:rules.map(r=>({id:r.id,configuration:{...r.configuration,disabled:true}}))}]})});
  const after=(await getRules()).find(w=>w.workflowId.name===name);
  const disabled=rules.every(r=>after?.validators.some(a=>a.id===r.id&&a.configuration.disabled===true));
  if(!disabled)return response(409,{updateHttp:update.status,disabled:false});
  const deletion=await api.asApp().requestJira(route`/rest/api/3/workflow/rule/config/delete`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({workflows:[{workflowId:{name},validatorIds:rules.map(r=>r.id)}]})});
  const db=await deletion.json().catch(()=>({}));
  const remaining=(await getRules()).find(w=>w.workflowId.name===name);
  return response(200,{identity:'FORGE_APP',fixture:name,updateHttp:update.status,disabled,deleteHttp:deletion.status,deleteResponse:db,remainingRules:remaining?.validators.map(r=>({id:r.id,key:r.key,disabled:r.configuration.disabled}))||[],projectWorkflowsChanged:false});
 }
 let storage;try { storage=await testStorageHealth(); } catch(e) { storage={status:'FAILED',code:String(e.message).slice(0,300)}; }
 let assetsMetadata;try { const objects=await assetsAdapter({asUser:()=>api.asApp()},route)(); assetsMetadata={status:'VERIFIED_APP_IDENTITY',equipment:objects.length,points:objects.reduce((n,e)=>n+e.isolationPoints.length,0)}; } catch(e) { assetsMetadata={status:'FAILED',message:String(e.message).slice(0,200)}; }
 const confluence=await api.asApp().requestConfluence(route`/wiki/api/v2/spaces?limit=1`);
 const rules=await api.asApp().requestJira(route`/rest/api/3/workflow/rule/config?types=validator&startAt=0&maxResults=50`);
 const rb=await rules.json().catch(()=>({}));
 const workspace='1db77da0-e980-42be-9efa-3a83dbf05728';
 const assets=await api.asApp().requestJira(route`/jsm/assets/workspace/${workspace}/v1/object/aql?includeAttributes=false&maxResults=10`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({qlQuery:'objectSchemaId = 16 AND objectTypeId = 147'})});
 const ab=await assets.json().catch(()=>({}));
 return response(200,{checkedAt:new Date().toISOString(),identity:'FORGE_APP',storage,assetsMetadata,confluence:{httpStatus:confluence.status},ownRules:{httpStatus:rules.status,count:rb.values?.length??null,lastPage:rb.isLast??null,error:rules.ok?null:(rb.errorMessages||rb.message),rulesChanged:false,rules:rb.values},equipment:{httpStatus:assets.status,count:ab.values?.length??null,keys:(ab.values||[]).map(x=>x.objectKey),error:assets.ok?null:(ab.errorMessages||ab.message),schemaId:'16',typeId:'147'},sql:{calls:0},noOperationalDataRead:true});
}
