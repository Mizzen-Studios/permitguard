const requireOk = async (response, label) => { if (!response.ok) throw new Error(label + ': access unavailable (' + response.status + ')'); return response.status === 204 ? null : response.json(); };
export function jiraAdapters(api, route) {
  return {
    async authorize(context) {
      const actorId = context.accountId;
      const issueId = context.extension?.issue?.id || context.issueId;
      if (typeof actorId !== 'string' || !actorId || typeof issueId !== 'string' || !/^[0-9]+$/.test(issueId)) throw new Error('Authenticated account and trusted issue context required');
      const [issue, body, profile] = await Promise.all([
        api.asUser().requestJira(route`/rest/api/3/issue/${issueId}?fields=project`).then(r => requireOk(r, 'Issue')),
        api.asUser().requestJira(route`/rest/api/3/mypermissions?issueId=${issueId}&permissions=ADMINISTER_PROJECTS,ADMINISTER,EDIT_ISSUES`).then(r => requireOk(r, 'Permissions')),
        api.asUser().requestJira(route`/rest/api/3/myself`).then(r => requireOk(r, 'Profile')).catch(() => null)
      ]);
      const projectId = String(issue.fields?.project?.id || '');
      if (!projectId) throw new Error('Trusted issue project unavailable');
      return { actorId, displayName: profile?.accountId === actorId ? profile.displayName : undefined, issueId: String(issue.id), projectId, isSiteAdmin: body.permissions?.ADMINISTER?.havePermission === true, isProjectAdmin: body.permissions?.ADMINISTER_PROJECTS?.havePermission === true || body.permissions?.ADMINISTER?.havePermission === true, canEdit: body.permissions?.EDIT_ISSUES?.havePermission === true };
    },
    async projectIsSample(projectId) {
      const project = await requireOk(await api.asUser().requestJira(route`/rest/api/3/project/${projectId}`), 'Sample project');
      // Two explicit project-admin-managed markers, never client assertion or project name alone.
      return project.key === 'PGSAMPLE' && project.description?.includes('[PermitGuard dedicated sample project]') === true;
    },
    async validatePeople(accountIds, issueId) {
      // Assignable-user lookup is bounded and exact; inaccessible/inactive people fail closed.
      for (const accountId of accountIds) {
        const users = await requireOk(await api.asUser().requestJira(route`/rest/api/3/user/assignable/search?issueKey=${issueId}&accountId=${accountId}&maxResults=2`), 'Named person');
        if (!Array.isArray(users) || !users.some(u => u.accountId === accountId && u.active === true)) throw new Error('Named person unavailable or not assignable');
      }
    },
    async projectProperty(issueId, value) {
      await requireOk(await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}/properties/permitguard.snapshot`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) }), 'Property projection');
    }
  };
}
