import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

// Capability-only actions: no persistence, evidence, or operational authorisation.
export async function checkReadiness() {
  return { status: 'NOT CLEARED', code: 'NOT_YET_CONFIGURED', mode: 'WARN_ONLY', reasons: ['Permit persistence and trusted human evidence are not configured.'], operational: false };
}
export async function requestActivation() {
  return { status: 'DENIED', code: 'NOT_CONFIGURED', activationCreated: false, reasons: ['This capability probe cannot create or confirm activations.'], operational: false };
}
const resolver = new Resolver();
resolver.define('check_readiness', checkReadiness);
resolver.define('request_activation', requestActivation);
resolver.define('capability_probe', async () => {
  // Check the invoking user's ADMINISTER permission, never trust client-supplied roles.
  const permission = await api.asUser().requestJira(route`/rest/api/3/mypermissions?permissions=ADMINISTER`);
  if (!permission.ok || !(await permission.json()).permissions?.ADMINISTER?.havePermission) {
    return { status: 'DENIED', code: 'SITE_ADMIN_REQUIRED' };
  }
  const assets = await api.asUser().requestJira(route`/rest/servicedeskapi/assets/workspace?start=0&limit=50`);
  let workspaceCount = null;
  if (assets.ok) { const body = await assets.json(); workspaceCount = Array.isArray(body.values) ? body.values.length : null; }
  const rules = await api.asApp().requestJira(route`/rest/api/3/workflow/rule/config?types=validator&startAt=0&maxResults=50`);
  let workflowCount = null;
  if (rules.ok) { const body = await rules.json(); workflowCount = Array.isArray(body.values) ? body.values.length : null; }
  return { checkedAt: new Date().toISOString(), mode: 'WARN_ONLY', assets: { httpStatus: assets.status, workspaceCount, objectDataRead: false }, ownWorkflowRules: { httpStatus: rules.status, workflowCount, firstPageOnly: true, rulesChanged: false }, sql: { provisioned: false, calls: 0 }, limitations: ['Workspace discovery is not Equipment/Isolation point access proof.', 'Rule list is not disable/delete or transition gate proof.', 'No gate is automatically installed. No permit state is persisted.'] };
});
export const handler = resolver.getDefinitions();
