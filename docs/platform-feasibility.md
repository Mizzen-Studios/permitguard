# Platform feasibility — documentation evidence, not live proof

Checked 15 November 2026 against official Atlassian documentation. No Forge token, registration, deployment, or demo site was available. **Every tenant capability remains live-unverified.**

## Important findings

- **Demo site:** forge site provision requires current Forge CLI and login, returns an existing active demo site rather than duplicating it, and normally lasts **90 days**. The workflow promises enterprise editions of Jira, Confluence, Jira Service Management, and Rovo. This supports using the provisioned demo rather than a traditional Gmail developer site. The reviewed documentation does not establish the Gmail-specific exclusion; that remains owner-provided context. Never add a card or purchase an upgrade. Enterprise entitlement is not proof that Assets is initialized.
- **Workflow validator:** jira:workflowValidator is **Preview**, for company-managed workflows, and supports Jira expressions or lambda functions. The reference explicitly says expression validators return false after uninstall. Warning-only panel behavior does not neutralize a gate after uninstall. Keep gates opt-in and require verified disable-before-uninstall. Do not promise team-managed support.
- **Critical delete limitation:** current Jira OpenAPI supports Forge for **list and update/disable**, but its **delete endpoint says Connect-only**, has no OAuth scopes, and lists basic-auth security only. Do not promise Forge can delete its own rules through that endpoint. This is a documented gap against the requested list/disable/delete requirement; test early and provide Jira-admin manual removal if unavailable. Do not create a Connect app or use personal tokens to conceal the gap.
- **Rovo action naming:** the manifest module is **action**, not rovo:action. It is referenced by rovo:agent.actions and rovo:mcp.tools. rovo:mcp is **Preview**, with at most one module per app. Docs explicitly support Rovo Studio custom agents and external MCP-compatible clients.
- **External planning agent:** exposure is **disabled by default**. A site/org admin enables tools in Connected apps separately per installation. Endpoint format: https://mcp.atlassian.com/forge/<app-UUID>. Clients use OAuth 2.1 consent and caller site permissions. Public skill.md must label this admin-enabled, not an anonymous readiness endpoint. This is Atlassian-hosted connectivity, not app external runtime egress.
- **Automation limitation:** Rovo agents triggered by Automation do not invoke CREATE/UPDATE/DELETE/TRIGGER actions. check_readiness should be GET; request_activation should be CREATE and demonstrated in chat/Studio, not promised from Automation. It creates PENDING only; named verifier QR plus onsite human confirmation stays server-checked.
- **Realtime:** bridge realtime broadcasts across windows/users; resolvers publish but cannot subscribe. Default channel scope includes module and issue context. Use issue-scoped channels or server-signed authorization claims for cross-issue boards. Bare global channels are **not** secured by issue/page permissions. Publish invalidation/version hints, not safety authority.
- **Custom UI camera:** the fixed Custom UI iframe feature policy already allows camera. No invented camera manifest scope is needed. Browser consent, hardware and QR-decoder compatibility still require tablet testing. Bundle decoder locally; no QR service or CDN. Denial/unavailability must produce useful failure and never silently satisfy evidence/presence.
- **Assets:** current Service Collection pricing includes Assets in Standard/Premium/Enterprise (not only Premium, an outdated assumption). Enterprise demo entitlement makes availability plausible, **not proven**. Check workspace/schema permissions; the built-in Equipment + Isolation points register is the no-Assets fallback. No instruments, calibration data, graph:connector, or Teamwork Graph.
- **Entity properties:** JQL fields require jira:entityProperty indexing, not just writing a JSON property. Other authorized clients can write properties; use a derived integration snapshot, never the sole safety authority. Evaluate authoritative app state server-side.

## Transition-rule REST contract

Source: official Jira OpenAPI specification, retrieved successfully; the rendered REST reference extraction failed.

| Operation | Route | Documented authorization |
| --- | --- | --- |
| List | GET /rest/api/3/workflow/rule/config | Calling Connect/Forge app's own rules; manage:jira-configuration classic or read:workflow:jira granular |
| Disable/update | PUT /rest/api/3/workflow/rule/config | Calling Connect/Forge app's own rules; manage:jira-configuration classic or write:workflow:jira granular |
| Delete | PUT /rest/api/3/workflow/rule/config/delete | **Connect-only** in specification, no OAuth scope; Forge unresolved |

To disable, preserve configuration.value and explicitly set configuration.disabled: true. Omission enables a rule. Paginate, ignore empty optimized results, target owned validator IDs, read back and surface partial errors. Do not send workflowId.draft: announced removal date was 2 November 2026. Require site-admin authorization on management handlers in addition to platform ownership checks. Non-admin panel Start is app-state fallback, not a bypass for an installed Jira gate.

## Recommended manifest and scopes

Stage jira:issuePanel, jira:adminPage, jira:projectSettingsPage, function/resolver and local resources first. Add jira:workflowValidator only with tested cleanup; then rovo:agent, **action**, rovo:mcp, jira:entityProperty and Confluence **macro** as real handlers land. No graph, connector, remote, LLM, container or external-fetch permissions. A registered app ID must replace any scaffold placeholder before deploy. An issuePanel covers Jira agent/work-item view; it does not alone supply an unlicensed JSM customer portal panel.

Candidate scopes, to add only with implemented endpoints and confirm using Forge lint:
- storage:app for app storage.
- read:jira-work and write:jira-work for relevant issue/property/transition operations; stage write when needed.
- manage:jira-configuration for owned-rule list/disable (documented current classic scope); explain its breadth. Consider granular read:workflow:jira/write:workflow:jira after live validation.
- read:cmdb-object:jira for Assets objects/AQL; read:cmdb-schema:jira, read:cmdb-type:jira and read:cmdb-attribute:jira when browsing metadata. Confirm workspace discovery scope separately.
- Sample Assets schema loader additionally needs write:cmdb-schema:jira, write:cmdb-type:jira, write:cmdb-attribute:jira and write:cmdb-object:jira. Do not add until explicit loader confirmation works.
- Derive exact Confluence page/space/restriction scopes from chosen APIs when implemented rather than pre-requesting broad admin/write. Validate selected space restrictions, not only its stored ID.

## Zero-cost storage and SQL measurement

Official pricing lists **SQL compute duration 1 hour/app/month**, 100,000 compute requests/month and 730 GB-hours storage/month free. Excess can incur charges: free allowance is not a spending guarantee. No card or paid resource may be added. Rovo credits are separate; avoid unbounded conversations and never call Forge LLM APIs (zero free allowance).

Prefer app storage without SQL initially; report **SQL not provisioned / 0 SQL calls**, not a measured runtime of zero. Choose persistence with real atomic revision/concurrency guarantees; read-modify-write lock races are unacceptable. If SQL is introduced, centralize query instrumentation with judge-run ID, query count and summed client elapsed milliseconds. Client latency is **not billed compute**. Capture Forge SQL execution/usage metrics before/after a bounded judge path and reconcile platform compute separately. Batch writes, cache schema metadata, send version invalidations, avoid polling, schedule no faster than hourly (prefer none), and keep logs minimal and non-PII. Establish a conservative stop threshold before repeated demos.

## OSHA reference

Verified HTTP 200 on 15 November 2026: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147 — “The control of hazardous energy (lockout/tagout).” Informational mapping only: **not compliance certification**, legal advice or replacement for the site's authorized procedure.

Suggested mapping: Plan (c)(4), (d)(1); Lock (d)(2)-(5); Verify (d)(6); Active continuing site controls; Release (e), personal device removal (e)(3); group locks (f)(3); shift handover nice-to-have (f)(4). Two-person high-energy verification and photos are PermitGuard policies, not claimed universal OSHA requirements. No instrument data is read.

## Official sources

- https://developer.atlassian.com/platform/forge/cli-reference/site-provision/
- https://developer.atlassian.com/platform/forge/provision-a-demo-development-site/
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-workflow-validator/
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflow-transition-rules/
- https://developer.atlassian.com/cloud/jira/platform/swagger-v3.v3.json
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/
- https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/realtime/
- https://developer.atlassian.com/platform/forge/custom-ui/iframe/
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-entity-property/
- https://developer.atlassian.com/platform/forge/manifest-reference/scopes-product-jsm/
- https://developer.atlassian.com/cloud/assets/rest/api-group-object/
- https://www.atlassian.com/software/jira/service-management/pricing
- https://developer.atlassian.com/platform/forge/forge-platform-pricing/
- https://developer.atlassian.com/platform/forge/monitor-sql-metrics/
