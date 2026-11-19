"""Idempotent dedicated demo project shell; does not load equipment or enable Enforce."""
import os,json,base64,urllib.request,urllib.error
BASE='https://one-atlas-xitr.atlassian.net'
AUTH='Basic '+base64.b64encode((os.environ['FORGE_EMAIL']+':'+os.environ['FORGE_API_TOKEN']).encode()).decode()
def request(path,body=None):
 req=urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers={'Authorization':AUTH,'Accept':'application/json','Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=30) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:
  if e.code==404:return 404,{}
  raise RuntimeError('Atlassian HTTP '+str(e.code)+': '+e.read().decode()[:500]) from None
status,p=request('/rest/api/3/project/PGSAMPLE')
if status==404:
 _,me=request('/rest/api/3/myself')
 _,p=request('/rest/api/3/project',{'key':'PGSAMPLE','name':'PermitGuard Sample','projectTypeKey':'business','projectTemplateKey':'com.atlassian.jira-core-project-templates:jira-core-simplified-task-tracking','leadAccountId':me['accountId'],'description':'[PermitGuard dedicated sample project] Synthetic judge testing only. Not operational equipment.','assigneeType':'PROJECT_LEAD'})
 _,p=request('/rest/api/3/project/PGSAMPLE')
assert '[PermitGuard dedicated sample project]' in p.get('description','')
_,found=request('/rest/api/3/search/jql',{'jql':'project = PGSAMPLE AND summary ~ "PermitGuard judge walkthrough"','fields':['summary'],'maxResults':10})
issues=found.get('issues',[])
if issues:issue=issues[0]
else:
 types=[t for t in p['issueTypes'] if not t.get('subtask')]
 task=next((t for t in types if t['name']=='Task'),types[0])
 _,issue=request('/rest/api/3/issue',{'fields':{'project':{'id':p['id']},'issuetype':{'id':task['id']},'summary':'PermitGuard judge walkthrough — synthetic equipment only'}})
print(json.dumps({'projectId':p['id'],'projectKey':p['key'],'issueId':issue['id'],'issueKey':issue['key'],'url':BASE+'/browse/'+issue['key'],'equipmentLoaded':False,'enforceEnabledByScript':False},indent=2))
