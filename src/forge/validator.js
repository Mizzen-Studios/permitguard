import { assetsAdapter } from '../server/assets.mjs';
import api, { route } from '@forge/api';
import { kvs, Filter, FilterConditions } from '@forge/kvs';
import { forgeStore } from '../server/store.mjs';
import { evaluateGate } from './gate.mjs';
const store = forgeStore({ kvs, Filter, FilterConditions });
async function gate(event, action) {
  try {
    if (!event.issue?.key) throw new Error('INVALID_CONTEXT');
    const response = await api.asApp().requestJira(route`/rest/api/3/issue/${event.issue.key}?fields=project`);
    if (!response.ok) throw new Error('ISSUE_UNAVAILABLE');
    const issue = await response.json();
    const row = await store.read();
    const projectId = String(issue.fields.project.id), issueId = String(issue.id);
    const project = row.data.projects[projectId];
    const decision = evaluateGate({ data: row.data, issueId, projectId, action });
    if (!decision.result || project?.policy?.mode !== 'ENFORCE' || project?.source !== 'ASSETS') return decision;
    try {
      const equipment = await assetsAdapter({ asUser: () => api.asApp() }, route)(project.assetsConfig);
      if (JSON.stringify(equipment) !== JSON.stringify(project.equipment)) throw new Error('REGISTER_CHANGED');
      return decision;
    } catch {
      if (project.policy.failMode === 'FAIL_OPEN_WITH_ALERT') {
        const alert = await api.asApp().requestJira(route`/rest/api/3/issue/${issueId}/properties/permitguard.alert`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ code:'REGISTER_UNAVAILABLE', action, at:new Date().toISOString(), mode:'FAIL_OPEN_WITH_ALERT', authoritative:false }) });
        if (alert.ok) return { result:true, alertRequired:true };
      }
      return { result:false, errorMessage:'PermitGuard cannot confirm readiness (Assets unavailable or changed). Retry or contact a project administrator.' };
    }
  } catch {
    return { result: false, errorMessage: 'PermitGuard cannot confirm readiness. Fail-closed: retry or ask an administrator to disable this app-owned rule before uninstalling.' };
  }
}
export const start = event => gate(event, 'START');
export const release = event => gate(event, 'RELEASE');
