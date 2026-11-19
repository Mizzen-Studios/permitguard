#!/usr/bin/env python3
"""Explicit synthetic fixture setup; never invokes the six-item sample loader or enables Enforce.
Credentials from environment only. Reads/creates only PermitGuard-owned schema/types/objects.
"""
import os,json,base64,urllib.request,urllib.error
CLOUD='07414114-107c-4823-9f70-ebb38371bbae'
AUTH='Basic '+base64.b64encode((os.environ['FORGE_EMAIL']+':'+os.environ['FORGE_API_TOKEN']).encode()).decode()
def call(method,url,data=None):
 req=urllib.request.Request(url,data=None if data is None else json.dumps(data).encode(),headers={'Authorization':AUTH,'Accept':'application/json','Content-Type':'application/json'},method=method)
 try:
  with urllib.request.urlopen(req,timeout=45) as r:return json.load(r)
 except urllib.error.HTTPError as e:
  raise RuntimeError(f'{method} {url.split("?")[0]} HTTP {e.code}: '+e.read(1200).decode()) from None
j='https://api.atlassian.com/ex/jira/'+CLOUD
w=call('GET',j+'/rest/servicedeskapi/assets/workspace')['values'][0]['workspaceId']
a='https://api.atlassian.com/jsm/assets/workspace/'+w+'/v1'
schemas=call('GET',a+'/objectschema/list').get('values',[])
schema=next((s for s in schemas if s.get('objectSchemaKey')=='PGTEST'),None)
if not schema:schema=call('POST',a+'/objectschema/create',{'name':'PermitGuard REST Test','objectSchemaKey':'PGTEST','description':'Synthetic Equipment + Isolation points only. No operational plant, no Enforce.'})
sid=str(schema['id'])
types=call('GET',a+'/objectschema/'+sid+'/objecttypes/flat')
if isinstance(types,dict):types=types.get('values',[])
ids={}
for name in ['Equipment','Isolation points']:
 t=next((t for t in types if t.get('name')==name),None)
 if not t:t=call('POST',a+'/objecttype/create',{'name':name,'objectSchemaId':sid,'iconId':'1','description':'PermitGuard synthetic REST fixture'})
 ids[name]=str(t['id'])
objects=[]
for name,label in [('Equipment','PG-REST-EQ-1'),('Isolation points','PG-REST-V-3')]:
 tid=ids[name]
 attrs=call('GET',a+'/objecttype/'+tid+'/attributes')
 attr=next(x for x in attrs if x.get('name')=='Name')
 q='objectSchemaId = '+sid+' AND objectTypeId = '+tid+' AND Name = "'+label+'"'
 found=call('POST',a+'/object/aql?includeAttributes=true&maxResults=10',{'qlQuery':q}).get('values',[])
 obj=found[0] if found else call('POST',a+'/object/create',{'objectTypeId':tid,'attributes':[{'objectTypeAttributeId':str(attr['id']),'objectAttributeValues':[{'value':label}]}]})
 fetched=call('GET',a+'/object/'+str(obj['id']))
 objects.append({'type':name,'id':str(obj['id']),'key':fetched.get('objectKey'),'readback':fetched.get('label')==label})
# Add only PermitGuard LOTO metadata, never operational telemetry.
point_type=ids['Isolation points']
attrs=call('GET',a+'/objecttype/'+point_type+'/attributes')
fields=[('Equipment key',0,objects[0]['key']),('Energy type',0,'HYDRAULIC'),('Lock state',0,'ISOLATION_REQUIRED'),('High energy',2,False)]
values=[]
for name,kind,value in fields:
 attr=next((x for x in attrs if x.get('name')==name),None)
 if not attr:attr=call('POST',a+'/objecttypeattribute/'+point_type,{'name':name,'type':0,'defaultTypeId':kind})
 values.append({'objectTypeAttributeId':str(attr['id']),'objectAttributeValues':[{'value':value}]})
call('PUT',a+'/object/'+objects[1]['id'],{'objectTypeId':point_type,'attributes':values})
point=call('GET',a+'/object/'+objects[1]['id'])
metadata={x.get('objectTypeAttribute',{}).get('name'):x.get('objectAttributeValues',[{}])[0].get('value') for x in point['attributes'] if x.get('objectAttributeValues')}
print(json.dumps({'isolationMetadata':metadata,'workspaceId':w,'schemaId':sid,'schemaKey':'PGTEST','types':ids,'objects':objects,'enforceEnabled':False,'sampleLoaderCalled':False,'instrumentDataRead':False},indent=2))
