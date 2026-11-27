const requireOk = async (response, label) => { if (!response.ok) throw new Error(label + ': access unavailable (' + response.status + ')'); return response.status === 204 ? null : response.json(); };
export function jiraAdapters(api, route) {
  // Per-authorization object capability, never a client issueKey or cross-request cache.
  const authorizedIssues = new WeakMap();
  return {
    async authorize(context,{includeProfile=true}={}) {
      const actorId = context.accountId;
      const issueId = context.extension?.issue?.id || context.issueId;
      if (typeof actorId !== 'string' || !actorId || typeof issueId !== 'string' || !/^[0-9]+$/.test(issueId)) throw new Error('Authenticated account and trusted issue context required');
      const [issue, body, profile] = await Promise.all([
        api.asUser().requestJira(route`/rest/api/3/issue/${issueId}?fields=project`).then(r => requireOk(r, 'Issue')),
        api.asUser().requestJira(route`/rest/api/3/mypermissions?issueId=${issueId}&permissions=ADMINISTER_PROJECTS,ADMINISTER,EDIT_ISSUES`).then(r => requireOk(r, 'Permissions')),
        includeProfile?api.asUser().requestJira(route`/rest/api/3/myself`).then(r => requireOk(r, 'Profile')).catch(() => null):Promise.resolve(null)
      ]);
      const projectId = String(issue.fields?.project?.id || '');
      if (!projectId) throw new Error('Trusted issue project unavailable');
      const auth = { actorId, displayName: profile?.accountId === actorId ? profile.displayName : undefined, issueId: String(issue.id), issueKey:issue.key||null, projectId, projectKey:issue.fields?.project?.key||null, projectName:issue.fields?.project?.name||null, isSiteAdmin: body.permissions?.ADMINISTER?.havePermission === true, isProjectAdmin: body.permissions?.ADMINISTER_PROJECTS?.havePermission === true || body.permissions?.ADMINISTER?.havePermission === true, canEdit: body.permissions?.EDIT_ISSUES?.havePermission === true };
      if(String(issue.id) !== String(issueId)) throw new Error('PARTICIPANT_ISSUE_INVALID');
      authorizedIssues.set(auth, {id:String(issue.id),key:issue.key});
      return auth;
    },
    async projectIsSample(projectId) {
      const project = await requireOk(await api.asUser().requestJira(route`/rest/api/3/project/${projectId}`), 'Sample project');
      // Two explicit project-admin-managed markers, never client assertion or project name alone.
      return project.key === 'PGSAMPLE' && project.description?.includes('[PermitGuard dedicated sample project]') === true;
    },
    async validatePeople(accountIds, issueId, authorization = null) {
      // Jira's assignable search accepts an ISSUE KEY, not a numeric issue ID.
      // Resolve under the same user identity; never trust a client-supplied key.
      const issue = authorizedIssues.get(authorization) || await requireOk(await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}?fields=project`), 'Participant issue');
      if (String(issue.id) !== String(issueId) || typeof issue.key !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*-[1-9][0-9]*$/.test(issue.key)) throw new Error('PARTICIPANT_ISSUE_INVALID');
      const issueKey = issue.key;
      // Assignable-user lookup is bounded and exact; inaccessible/inactive people fail closed.
      if(!Array.isArray(accountIds) || !accountIds.length || accountIds.length>40 || accountIds.some(id=>typeof id!=='string'||!id||id.length>180)) throw new Error('Named person unavailable or not assignable');
      // Bounded batches retain exact active/assignable validation for every person.
      for (let offset=0;offset<accountIds.length;offset+=4) {
       await Promise.all(accountIds.slice(offset,offset+4).map(async accountId => {
        const users = await requireOk(await api.asUser().requestJira(route`/rest/api/3/user/assignable/search?issueKey=${issueKey}&accountId=${accountId}&maxResults=2`), 'Named person');
        if (!Array.isArray(users) || !users.some(u => u.accountId === accountId && u.active === true)) throw new Error('Named person unavailable or not assignable');
       }));
      }
    },
    async projectProperty(issueId, value) {
      await requireOk(await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}/properties/permitguard.snapshot`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) }), 'Property projection');
    }
  };
}
