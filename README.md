# PermitGuard

Human-confirmed lockout/tagout (LOTO) permit **decision support** for Jira work items and JSM agent requests. Atlassian Forge / Codegeist 2026: Specialized Industries + MCP bonus.

**Development app, not safety-certified or production-qualified. The site's permit procedure remains authoritative.** A QR, photo or confirmation does not establish physical safety.

- [Public MIT repository](https://github.com/Mizzen-Studios/permitguard)
- [Development site](https://one-atlas-xitr.atlassian.net), provisioned 15 November 2026, expires 13 February 2027.
- [Judge work item PGSAMPLE-1](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-1)
- [Dated CLI/API evidence](docs/demo-site-checks-2026-11-19.md), [browser guide](docs/browser-handoff.md), [admin-enabled planning contract](skill.md).

## Connected development features

Plan → Lock → Verify → Active → Release → Closed in a Custom UI tablet clipboard. Workers apply their own personal locks to every point. Enforce requires bounded inline photo evidence. Named human verification requires two distinct people for high-energy points. Agent requests remain **PENDING** until the assigned person confirms using an actor/issue-bound QR challenge and explicit at-equipment attestation.

Warn-only is the installation default. A project administrator opts into Enforce, with fail-closed default or explicit fail-open-with-alert. Advisory allowance never means CLEARED or activation authority. The confirmed six-equipment sample loader checks PGSAMPLE and its project-description marker, then enables Enforce **only in that sample project**. Provisioning did not load equipment or enable enforcement automatically.

Assets imports use an explicitly configured workspace/schema/type pair. Exact type names Equipment and Isolation points and schema IDs are checked before object queries. AQL is generated server-side. Isolation point attributes: Equipment key (text), Energy type, Lock state, High energy (boolean). The demo default is PGTEST schema 16 / types 147 and 148; judges enter their own IDs. Import is bounded to six equipment and fewer than 100 objects/type; incomplete results fail explicitly. Changed/unavailable connected metadata blocks planning, activation and close. A built-in register is available, but does not detect physical changes. No instruments, calibration data, graph:connector or Teamwork Graph.

Site-wide revision-conditional Custom Entity Store transactions serialize mutations and shared-equipment release checks. Crew B roleplay seeds L-07 on sample V-3, explicitly simulated and removable only by its creator. Other crews' locks block release across projects. Other issues' personal details are redacted; the creator's sample Crew B blocker remains specific.

Forge Realtime publishes only module/issue-scoped invalidation/revision hints. Browsers re-fetch authorized state; Refresh is the fallback. Subscription success is **not** cross-browser acceptance.

## Workflow gates, property/JQL and recovery

Preview **jira:workflowValidator** start/release lambda gates consult current app state, not a writable issue property alone. No gates attach automatically to existing project workflows. Panel activation is the non-admin fallback, not a bypass for an installed Jira gate.

Own-rule list/disable preserves configuration and verifies readback. **Delete remains blocked:** live Forge deletion returned HTTP 401, scope does not match; official documentation describes Connect-only deletion. The app returns UNSUPPORTED with manual admin removal instructions. This requested feature is unresolved; personal-token deletion is not used to conceal the gap.

An **unassigned** synthetic workflow was created for API recovery tests. Both app rules were disabled and verified; no project workflow changed. Actual transition execution/after-uninstall behavior remains unverified. **Before uninstall: list, disable, verify recovery, manually remove rules and publish workflow changes.** Official docs warn expression validators fail closed after uninstall; clean up every installed gate.

Derived issue property permitguard.snapshot supports Automation and JQL aliases permitguardState, permitguardMode and permitguardUpdatedAt. Example: permitguardState = "ACTIVE". Other authorized clients can alter properties; they are nonauthoritative. Dry-run reports the selected projection plus current START/RELEASE app-state decisions for the open issue, not a site-wide search or reservation. Live indexing acceptance remains unconfirmed.

## Rovo / Studio / MCP

Manifest modules are rovo:agent, **action** (not rovo:action), and Preview **rovo:mcp**. check_readiness accepts issueKey; request_activation accepts issueKey and verifierId. Caller identity comes from the platform principal; issue access is checked as that user. No agent confirmation tool exists.

Studio and external MCP acceptance are left for owner browser testing. An administrator enables tools in Connected apps; external clients use Atlassian OAuth consent, not an anonymous endpoint. CREATE actions are not promised from Rovo Automation triggers. A planner may report NOT CLEARED and propose rescheduling through its own separately authorized scheduler. PermitGuard does not edit schedules or call external APIs.

## Confluence

The macro prints **Snapshot at <time>**, never live or safety-authoritative. A selected Jira work item is independently authorized; a derived property can bridge product storage partitions.

Monthly registers require a site administrator to select and confirm a restricted space. This conservative implementation accepts explicitly allowlisted **named-user permissions only**; group, role, anonymous and unknown assignments, including non-read permissions, are refused. There is no unrestricted fallback. A durable bounded lease, idempotent record marker and page-version retries preserve existing content.

Only permit ID/project/closure-time metadata is appended, not photos. Forge close-out persists even if publication is unavailable; an authorized administrator can retry. **No restricted space has been selected or live archive publication verified.** This is not a complete compliance export/retention system.

## Install and develop

Judges are expected to install as administrators on their own sites. Use Node 22+ and current Forge CLI:

~~~sh
npm ci
npm test
npm run test:contracts
npm run build
forge lint
forge deploy -e development
forge install -e development -s your-site.atlassian.net -p Jira
forge install -e development -s your-site.atlassian.net -p Confluence
~~~

Register a separate app ID for a new developer; do not deploy to the maintainer's app without permission. Jira installation covers the JSM **agent** work-item panel, not an unlicensed customer-portal panel. Review consent/version changes. Credentials stay outside the repo in a private chmod-600 environment file. The maintainer accepted usage/overage terms with explicit owner approval; **no card/payment method was added**.

## Scopes / uninstall footprint

Exact manifest and installation consent are authoritative:

- read:jira-work — authorized issue/project context and snapshots.
- write:jira-work — derived properties and explicit outage alerts.
- read:jira-user — active named assignable-person validation.
- read:servicedesk-request — JSM/Assets capability boundary.
- read:cmdb-object:jira — Equipment/Isolation objects.
- read:cmdb-type:jira — exact configured type/schema validation.
- manage:jira-configuration — own workflow list/disable; site-admin-gated handlers. Broad scope, no arbitrary workflow editor.
- storage:app — bounded state, photo evidence, archive config and leases.
- read:space:confluence, read:space.permission:confluence — validate restricted archive space.
- read:page:confluence, write:page:confluence — read/append the monthly register.

Jira properties, synthetic Assets objects, sample project/work item, workflow rules and Confluence pages may remain after uninstall. Forge storage follows Atlassian retention policy; no immediate-purge/permanent-retention promise. Retain/export records under the site's procedure before uninstall.

## Cost and honest limits

No Forge SQL, LLM API, Containers, paid services, external runtime fetch permissions or scheduled triggers. **SQL not provisioned: 0 SQL calls; compute measurement not applicable.** Client latency is not billed compute. Writes are batched; minimal diagnostic logging contains no private permit content. Check Forge usage before repeated demos; accepted terms are not a hard spending cap. Never add a card.

**Connection required; no offline mode.** QR/manual assertion is not independent location proof. Photos are locally resized, max 64,000 data-URL characters each. The aggregate is limited to 180 KB / 60 permits and fails explicitly when full. Capacity and retention need further production design. Workflow decisions are observations, not physical interlocks. Changed Assets metadata with open permits requires supervisor reconciliation; no automated repair/bypass.

Conflict guard and shift-end suspension are README-only future ideas, not video implementation claims. No invented stats, quotes or certification. Feature-complete target: about 8 December 2026. Owner-supplied deadline: 22 December 2026 20:00 UK, to verify against Devpost rules. No Marketplace publication, promotion or Devpost submission by this automation.

## Maintenance and licence

Maintained through [GitHub Issues](https://github.com/Mizzen-Studios/permitguard/issues). MIT; see [LICENSE](LICENSE).
