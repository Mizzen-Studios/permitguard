/** Authenticated API adapter: requestJira must use Forge route + asUser/asApp, never tokens. */
export const PROPERTY_KEY = 'permitguard.snapshot';
const assert = (ok, code) => { if (!ok) throw new Error(code); };
async function body(response) {
  assert(response?.ok, 'JIRA_HTTP_' + response?.status);
  return response.status === 204 ? {} : response.json();
}
export async function requireSiteAdmin(requestJira) {
  const result = await body(await requestJira('user', '/rest/api/3/mypermissions?permissions=ADMINISTER'));
  assert(result.permissions?.ADMINISTER?.havePermission === true, 'SITE_ADMIN_REQUIRED');
}
export function createWorkflowService({ requestJira, ruleKeys = ['permitguard-start-validator', 'permitguard-release-validator'] }) {
  const keys = new Set(ruleKeys);
  async function owned() {
    const result = []; let startAt = 0;
    for (let page = 0; page < 100; page++) {
      const data = await body(await requestJira('app', '/rest/api/3/workflow/rule/config?types=validator&expand=transition&maxResults=50&startAt=' + startAt));
      assert(Array.isArray(data.values) && data.startAt === startAt, 'INVALID_RULE_PAGE');
      for (const workflow of data.values) {
        const validators = (workflow.validators ?? []).filter(rule => keys.has(rule.key));
        if (validators.length) result.push({ workflowId: { name: workflow.workflowId.name }, validators });
      }
      if (data.isLast === true || (Number.isInteger(data.total) && startAt + data.values.length >= data.total)) return result;
      assert(data.values.length > 0 && Number.isInteger(data.maxResults) && data.maxResults > 0, 'INCOMPLETE_RULE_PAGINATION');
      startAt += data.maxResults;
    }
    throw new Error('RULE_PAGE_LIMIT');
  }
  return {
    async list() { await requireSiteAdmin(requestJira); return owned(); },
    async disable({ workflowName, ruleId }) {
      await requireSiteAdmin(requestJira);
      const workflows = await owned();
      const rule = workflows.find(w => w.workflowId.name === workflowName)?.validators.find(r => r.id === ruleId);
      assert(rule && typeof rule.configuration?.value === 'string', 'OWN_RULE_NOT_FOUND');
      const configuration = { ...rule.configuration, disabled: true };
      const response = await body(await requestJira('app', '/rest/api/3/workflow/rule/config', {
        method: 'PUT', body: { workflows: [{ workflowId: { name: workflowName }, validators: [{ id: rule.id, configuration }] }] }
      }));
      const errors = (response.updateResults ?? []).filter(r => r.updateErrors?.length || Object.values(r.ruleUpdateErrors ?? {}).some(e => e.length));
      if (errors.length) return { status: 'PARTIAL_FAILURE', errors };
      const readback = (await owned()).find(w => w.workflowId.name === workflowName)?.validators.find(r => r.id === ruleId);
      return { status: readback?.configuration?.disabled === true ? 'DISABLED' : 'UNCONFIRMED', workflowName, ruleId };
    },
    async delete() {
      await requireSiteAdmin(requestJira);
      return { status: 'UNSUPPORTED', code: 'FORGE_DELETE_NOT_SUPPORTED', instructions: 'Disable and verify each PermitGuard rule first. In Jira settings > Work items > Workflows, edit the named company-managed workflow, open its transition validators, remove PermitGuard rules, and publish the workflow changes. Re-list before uninstall. Do not uninstall enabled gates; expression validators fail closed after uninstall.' };
    }
  };
}
/** Derived issue property, NOT safety authority. Missing/unknown policy blocks even though a fresh project defaults Warn-only. */
export function evaluateProjection(property, action, { now = Date.now(), maxAgeMs = 300000 } = {}) {
  const reasons = [];
  if (!['START', 'RELEASE'].includes(action)) reasons.push('INVALID_ACTION');
  if (!property || property.schemaVersion !== 1 || !Number.isInteger(property.revision) || property.revision < 0 || !property.permitId || !['PLAN', 'LOCK', 'VERIFY', 'ACTIVE', 'RELEASE', 'CLOSED'].includes(property.state)) reasons.push('INVALID_PROJECTION');
  const at = Date.parse(property?.updatedAt);
  if (!Number.isFinite(at) || at > now || now - at > maxAgeMs) reasons.push('STALE_PROJECTION');
  if (!['WARN_ONLY', 'ENFORCE'].includes(property?.mode) || !['FAIL_CLOSED', 'FAIL_OPEN_WITH_ALERT'].includes(property?.failMode)) reasons.push('INVALID_POLICY');
  const structurallyValid = reasons.length === 0;
  const gate = action === 'START' ? property?.start : property?.release;
  const expectedState = action === 'START' ? 'VERIFY' : 'RELEASE';
  const cleared = structurallyValid && property.state === expectedState && gate?.cleared === true;
  if (!cleared) reasons.push('NOT_CLEARED');
  // Fail-open is never inferred from outage text or a client-supplied flag.
  const allowed = structurallyValid && (cleared || property.mode === 'WARN_ONLY');
  return { action, allowed, wouldBlock: !allowed, status: cleared ? 'CLEARED' : 'NOT CLEARED', alertRequired: allowed && !cleared, reasons, authoritative: false, dryRun: true };
}
export async function dryRunTransition({ requestJira, issueId, action, now }) {
  await requireSiteAdmin(requestJira);
  assert(/^[A-Za-z0-9_-]+$/.test(issueId), 'INVALID_ISSUE_ID');
  const response = await requestJira('user', '/rest/api/3/issue/' + issueId + '/properties/' + PROPERTY_KEY);
  if (response.status === 404) return evaluateProjection(null, action, { now });
  return evaluateProjection((await body(response)).value, action, { now });
}
/** Function validator factory. Authoritative adapter must check issue permission, project admin-owned policy,
 * atomic current permit state and all shared equipment locks. A projection can only veto, never grant safety. */
export function createTransitionValidator({ loadProjection, evaluateAuthoritative, now = Date.now }) {
  return async event => {
    try {
      const action = event.configuration?.action;
      const issueId = event.issue?.id;
      assert(issueId && ['START', 'RELEASE'].includes(action), 'INVALID_CONTEXT');
      const projection = evaluateProjection(await loadProjection(issueId), action, { now: now() });
      if (!projection.allowed) return { result: false, errorMessage: 'PermitGuard: NOT CLEARED or snapshot unavailable.' };
      const trusted = await evaluateAuthoritative({ issueId, action, event });
      return { result: trusted?.transitionAllowed === true, errorMessage: 'PermitGuard: NOT CLEARED. Check current locks and named verification.' };
    } catch { return { result: false, errorMessage: 'PermitGuard unavailable: fail-closed. Contact a project administrator.' }; }
  };
}
