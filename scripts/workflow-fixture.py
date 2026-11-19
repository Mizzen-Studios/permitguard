"""Create/reuse an UNASSIGNED workflow for app-owned recovery API tests only."""
import os,json,base64,urllib.request,urllib.error,urllib.parse,uuid
BASE='https://one-atlas-xitr.atlassian.net'; NAME='PermitGuard UNASSIGNED API recovery fixture'
AUTH='Basic '+base64.b64encode((os.environ['FORGE_EMAIL']+':'+os.environ['FORGE_API_TOKEN']).encode()).decode()
def call(path,body=None):
 try:
  r=urllib.request.urlopen(urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers={'Authorization':AUTH,'Content-Type':'application/json','Accept':'application/json'}),timeout=30);return r.status,json.load(r)
 except urllib.error.HTTPError as e:raise RuntimeError('HTTP '+str(e.code)+' '+e.read().decode()[:1500]) from None
_,found=call('/rest/api/3/workflow/search?queryString='+urllib.parse.quote(NAME))
existing=[x for x in found['values'] if x['id']['name']==NAME]
if existing:print(json.dumps({'status':'EXISTS','workflow':existing[0]['id'],'assigned':False}));raise SystemExit
_,source=call('/rest/api/3/workflow/search?queryString=PGSAMPLE&expand=statuses')
statuses=source['values'][0]['statuses']; states=[]
for s in statuses:
 _,d=call('/rest/api/3/status/'+s['id']);cat={'new':'TODO','indeterminate':'IN_PROGRESS','done':'DONE'}[d['statusCategory']['key']];states.append({'id':d['id'],'name':d['name'],'statusCategory':cat,'statusReference':d['id']})
assert len(states)>=2
_,cap=call('/rest/api/3/workflows/capabilities?workflowId=673bbde3-77b1-432e-8950-b74d0d6b37ba')
rules=[r for r in cap['forgeRules'] if 'PermitGuard' in r['name']];assert len(rules)==2
trans=[{'id':'1','name':'Create','type':'INITIAL','toStatusReference':states[0]['id'],'links':[],'validators':[],'actions':[],'triggers':[],'properties':{}}]
for i,r in enumerate(rules):
 trans.append({'id':str(11+i*10),'name':'PermitGuard '+('Start' if 'start' in r['name'] else 'Release'),'type':'GLOBAL','toStatusReference':states[(i+1)%len(states)]['id'],'links':[],'validators':[{'ruleKey':r['ruleKey'],'parameters':{'key':r['id'],'id':str(uuid.uuid5(uuid.NAMESPACE_URL,NAME+r['id'])),'config':'{}','disabled':'false','tag':'permitguard-unassigned-api-fixture'}}],'actions':[],'triggers':[],'properties':{}})
status,result=call('/rest/api/3/workflows/create',{'scope':{'type':'GLOBAL'},'statuses':states,'workflows':[{'name':NAME,'description':'Unassigned synthetic API rule recovery fixture. Never associate to real project.','statuses':[{'statusReference':s['id'],'properties':{}} for s in states],'transitions':trans}]})
print(json.dumps({'http':status,'workflows':[{'id':x.get('id'),'name':x.get('name')} for x in result.get('workflows',[])],'assigned':False,'projectWorkflowChanged':False},indent=2))
