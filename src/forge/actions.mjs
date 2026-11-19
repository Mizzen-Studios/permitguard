import { CONSENT_SCOPES } from './scopes.mjs';
import { createWorkflowService, dryRunTransition, requireSiteAdmin } from '../integrations/workflow.mjs';
import { lockBoardSnapshot } from '../integrations/confluence.mjs';

const need = (ok, code) => { if (!ok) throw new Error(code); };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const capabilities = Object.freeze({ archiveConfig: false });
const ruleKeys = ['permitguard-start-validator', 'permitguard-release-validator', 'permitguard-probe-validator'];
const operations = new Set(['get_state', 'check_readiness', 'list_equipment', 'import_assets', 'connect_assets', 'load_sample', 'set_policy', 'register_equipment', 'create_permit', 'begin_lock', 'begin_verify', 'begin_release', 'close_permit', 'apply_lock', 'qr_challenge', 'verify_point', 'request_activation', 'confirm_activation', 'remove_lock', 'play_crew_b', 'remove_sample_lock']);
const aliases = { list_rules: 'list_rules', list_own_rules: 'list_rules', disable_rule: 'disable_rule', disable_own_rule: 'disable_rule', delete_rule: 'delete_rule', delete_own_rule: 'delete_rule', dry_run: 'dry_run', dry_run_transition: 'dry_run' };

// Only explicit adapter errors cross the boundary. SDK/domain exceptions can contain private data.
export function safeError(error) {
  const allowed = new Set(['AUTHENTICATED_ACTOR_REQUIRED', 'ISSUE_CONTEXT_REQUIRED', 'INVALID_ISSUE', 'ISSUE_ACCESS_REQUIRED', 'INVALID_OPERATION', 'INVALID_PAYLOAD', 'INVALID_RULE_SELECTION', 'INVALID_ACTION', 'ARCHIVE_CONFIG_PENDING', 'SITE_ADMIN_REQUIRED']);
  const code = allowed.has(error?.message) ? error.message : 'PERMITGUARD_UNAVAILABLE';
  return { ok: false, status: 'ERROR', code, error: code, message: code === 'PERMITGUARD_UNAVAILABLE' ? 'PermitGuard could not confirm the operation. Refresh current state before retrying; follow the site procedure.' : code, operational: false };
}

/** All context arguments here must come from Forge invocation arguments, never event.payload. */
export function createForgeWiring({ dispatch, requestJira, archive, now = () => new Date().toISOString() }) {
  const activeCapabilities = { ...capabilities, archiveConfig: Boolean(archive) };
  const workflow = createWorkflowService({ requestJira, ruleKeys });
  const actor = context => { const accountId=context?.principal?.accountId || context?.accountId; need(typeof accountId === 'string' && accountId.trim(), 'AUTHENTICATED_ACTOR_REQUIRED'); return accountId; };
  const trustedIssue = context => context?.extension?.issue?.id;
  const cleanContext = context => ({ accountId: actor(context), extension: { issue: { id: trustedIssue(context) } } });
  const guard = fn => async (...args) => { try { return await fn(...args); } catch (error) { return safeError(error); } };
  async function canonicalIssue(input) {
    need(typeof input === 'string' && /^(?:[0-9]+|[A-Za-z][A-Za-z0-9_]*-[1-9][0-9]*)$/.test(input) && input.length <= 100, 'INVALID_ISSUE');
    // User authorization is independent of any agent-supplied issue/project/actor claim.
    const response = await requestJira('user', '/rest/api/3/issue/' + encodeURIComponent(input) + '?fields=project');
    need(response?.ok, 'ISSUE_ACCESS_REQUIRED');
    const issue = await response.json();
    need(typeof issue.id === 'string' && /^[0-9]+$/.test(issue.id) && issue.fields?.project?.id, 'INVALID_ISSUE');
    return issue.id;
  }
  async function noIssueState(context) {
    actor(context);
    // No fake project, permit, readiness or admin authority. UI must render this dedicated view.
    return { kind: 'ADMINISTRATION', view: 'ADMINISTRATION', issueRequired: true, actorId: context.accountId, observedAt: now(), capabilities: activeCapabilities,
      archive: { status: archive ? 'ADMIN_CONFIGURATION_REQUIRED' : 'PENDING', code: 'ARCHIVE_CONFIG_PENDING' },
      scopes: { declared: CONSENT_SCOPES, source: 'manifest-and-installation-consent', verifyActualConsent: true, purposes: ['Jira issue read/write and named-person validation', 'Forge app storage', 'App-owned workflow rule recovery; site-admin permission required'] },
      uninstall: { instructions: 'List and disable app-owned rules, verify recovery, and remove rules in Jira workflow settings before uninstall. Retain/export records under your site policy. Jira properties and Confluence pages are not promised deleted by uninstall.' },
      limitations: ['Open a Jira issue for permit operations.', 'Archive configuration pending; no monthly publication is configured.', 'Decision support only; no safety clearance is asserted.'] };
  }
  const resolver = guard(async request => {
    const context = cleanContext(request?.context);
    need(object(request?.payload), 'INVALID_PAYLOAD');
    let { operation, payload = {} } = request.payload;
    need(object(payload), 'INVALID_PAYLOAD');
    actor(context);
    if (operation === 'get_state' && !trustedIssue(context)) {
      if (request.context?.extension?.type === 'macro' || request.context?.moduleKey === 'permitguard-lockboard') return { ...lockBoardSnapshot({ permits: [], capturedAt: now(), connected: false }), capabilities, limitations: ['No authorized Jira issue context; no permit records loaded.'] };
      return noIssueState(context);
    }
    if (['get_snapshot', 'lock_board_snapshot'].includes(operation)) {
      if(archive) return archive.snapshot(context,payload);
      if (!trustedIssue(context)) return { ...lockBoardSnapshot({ permits: [], capturedAt: now(), connected: false }), capabilities, limitations: ['No authorized Jira issue context; no permit records loaded.'] };
      const state = await dispatch('get_state', {}, context);
      return { ...lockBoardSnapshot({ permits: state.permit ? [state.permit] : [], capturedAt: now(), connected: true }), capabilities };
    }
    if (operation === 'set_archive_config') { need(archive, 'ARCHIVE_CONFIG_PENDING'); return archive.configure(payload, context); }
    if (operation === 'get_archive_config') { need(archive, 'ARCHIVE_CONFIG_PENDING'); return archive.configuration(context); }
    if (operation === 'archive_closed') { need(archive, 'ARCHIVE_CONFIG_PENDING'); need(trustedIssue(context), 'ISSUE_CONTEXT_REQUIRED'); const state=await dispatch('get_state',{},context); return archive.appendClosed(state.permit,context); }
    operation = aliases[operation] || operation;
    if (operation === 'list_rules') return { rules: await workflow.list() };
    if (operation === 'delete_rule') return workflow.delete();
    if (operation === 'disable_rule') {
      const workflowName = payload.workflowName || (typeof payload.workflowId === 'object' ? payload.workflowId?.name : payload.workflowId);
      const ruleId = payload.ruleId || payload.id;
      const expectedName = typeof payload.expectedWorkflowId === 'object' ? payload.expectedWorkflowId?.name : payload.expectedWorkflowId;
      need(typeof workflowName === 'string' && typeof ruleId === 'string' && ruleId && (!payload.expectedRuleId || payload.expectedRuleId === ruleId) && (!expectedName || expectedName === workflowName), 'INVALID_RULE_SELECTION');
      return workflow.disable({ workflowName, ruleId });
    }
    if (operation === 'dry_run') {
      need(trustedIssue(context), 'ISSUE_CONTEXT_REQUIRED');
      need(['START', 'RELEASE'].includes(payload.action), 'INVALID_ACTION');
      // Establish issue permission using trusted context before reading the derived projection.
      const issueId = await canonicalIssue(trustedIssue(context));
      await requireSiteAdmin(requestJira);
      const projection = await dryRunTransition({ requestJira, issueId, action: payload.action, now: Date.parse(now()) });
      const current = await dispatch('gate_dry_run', {}, context);
      return { ...projection, current, limitation:'Projection is nonauthoritative; current.actions reports the app-state gate snapshot, not a reservation or executed Jira transition.' };
    }
    need(operations.has(operation), 'INVALID_OPERATION');
    need(trustedIssue(context), 'ISSUE_CONTEXT_REQUIRED');
    const result = await dispatch(operation, payload, context);
    if (archive && operation==='close_permit') { try { result.archive=await archive.appendClosed(result.permit,context); } catch { result.archive={status:'PENDING_ADMIN_ARCHIVE',message:'Permit closed in Forge. A configured restricted space and an authorized administrator are required to publish the monthly register.'}; } }
    return { ...result, capabilities: activeCapabilities, realtime: { channel: 'permitguard' } };
  });
  function action(operation) {
    return guard(async (event = {}, context = {}) => {
      // Rovo context is server-supplied second argument. Never accept actor/context from inputs.
      const accountId = actor(context);
      const issueInput = context.extension?.issue?.id || event.context?.jira?.issueId || event.context?.jira?.issueKey || event.issueId || event.issueKey;
      need(issueInput, 'ISSUE_CONTEXT_REQUIRED');
      const issueId = await canonicalIssue(Number.isSafeInteger(issueInput) && issueInput>0 ? String(issueInput) : issueInput);
      const payload = operation === 'request_activation' ? { verifierId: event.verifierId } : {};
      const result = await dispatch(operation, payload, { accountId, issueId });
      if(operation==='request_activation'){const pending=result.permit?.activations?.find(a=>a.status==='PENDING');return {...result, status:pending?'PENDING':'NOT CONFIRMED', activationId:pending?.id, assignedVerifierId:pending?.verifierId, humanConfirmationRequired:true, activationAuthority:false, operational:false};}
      return result;
    });
  }
  return { resolver, checkReadiness: action('check_readiness'), requestActivation: action('request_activation'),
    capabilityProbe: guard(async request => { actor(request?.context); await requireSiteAdmin(requestJira); return { ...(await noIssueState(request.context)), checkedAt: now(), rulesChanged: false, limitations: ['Capability information only; no Assets, transition, Realtime, Rovo or device acceptance is asserted.'] }; }) };
}
