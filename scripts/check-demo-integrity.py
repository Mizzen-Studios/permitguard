#!/usr/bin/env python3
"""Read-only check of the dedicated PGSAMPLE-2 fixture; no Forge CES access."""
import base64
import hashlib
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

BASE = 'https://one-atlas-xitr.atlassian.net'
ISSUE = 'PGSAMPLE-2'
FIXTURE_TEXT = ('Synthetic PermitGuard judge re-test only. No real operational data. '
                'Finish the existing PGSAMPLE-1 sample L-07 release/close before reusing EQ-1. '
                'No permit, locks or policy have been created or changed on this work item by provisioning.')
EXPECTED_DESCRIPTION = {'type':'doc','version':1,'content':[{'type':'paragraph','content':[{'type':'text','text':FIXTURE_TEXT}]}]}

def summarize(issue, events, snapshot, owner):
    if issue['key'] != ISSUE or issue['fields']['project']['key'] != 'PGSAMPLE':
        raise ValueError('Dedicated sample context mismatch')
    changes = []
    for event in events:
        for item in event.get('items', []):
            if item['field'] in ('assignee', 'description', 'status'):
                changes.append({'atUtc':datetime.fromisoformat(event['created']).astimezone(timezone.utc).isoformat(),
                                'field':item['field'],
                                'from':('assigned account' if item.get('fromString') else None) if item['field']=='assignee' else item.get('fromString'),
                                'to':('assigned account' if item.get('toString') else None) if item['field']=='assignee' else item.get('toString')})
    description = issue['fields'].get('description')
    assignee = issue['fields'].get('assignee') or {}
    return {'issueKey':ISSUE, 'readOnly':True, 'historyComplete':True,
            'assigneeMatchesAuthenticatedOwner':assignee.get('accountId') == owner['accountId'],
            'descriptionMatchesProvisionedFixture':description == EXPECTED_DESCRIPTION,
            'descriptionSha256':hashlib.sha256(json.dumps(description,sort_keys=True).encode()).hexdigest(),
            'descriptionChangeCount':sum(c['field']=='description' for c in changes),
            'jiraStatus':issue['fields']['status']['name'], 'changes':changes,
            'derivedPermitSnapshot':{k:snapshot.get(k) for k in ('state','revision','updatedAt','activeLockCount','mode','failMode','start','release','authoritative')},
            'rawForgeCesRead':False, 'siteRevision':None,
            'limit':'Jira issue property is nonauthoritative; permit revision is not site revision. This is not an exhaustive stored-state audit.'}

def main():
    email, token = os.environ.get('FORGE_EMAIL'), os.environ.get('FORGE_API_TOKEN')
    if not email or not token:
        raise ValueError('Load the approved private credential environment; never put credentials in arguments.')
    headers = {'Authorization':'Basic '+base64.b64encode((email+':'+token).encode()).decode()}
    def get(path):
        with urllib.request.urlopen(urllib.request.Request(BASE+path,headers=headers,method='GET'),timeout=30) as response:
            return json.load(response)
    issue = get('/rest/api/3/issue/'+ISSUE+'?fields=assignee,description,status,project')
    events, start = [], 0
    for _ in range(5):
        page = get('/rest/api/3/issue/'+ISSUE+'/changelog?startAt='+str(start)+'&maxResults=100')
        values = page.get('values', []); events.extend(values); start += len(values)
        if page.get('isLast') is True or start >= page.get('total', 10**9):
            break
        if not values:
            raise ValueError('Incomplete changelog; no integrity claim made')
    else:
        raise ValueError('Bounded changelog limit reached; no complete-history claim made')
    snapshot = get('/rest/api/3/issue/'+ISSUE+'/properties/permitguard.snapshot')['value']
    result = summarize(issue, events, snapshot, get('/rest/api/3/myself'))
    result['checkedAt'] = datetime.now(timezone.utc).isoformat()
    print(json.dumps(result,indent=2))

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Read-only integrity check failed: '+str(error),file=sys.stderr)
        sys.exit(1)
