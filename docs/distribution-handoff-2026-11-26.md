> **09:43 owner-approved legal publication:** live HTTPS [Privacy policy](https://mizzen-studios.github.io/permitguard/privacy.html) and [Terms](https://mizzen-studios.github.io/permitguard/terms.html), both verified HTTP200 with exact source-byte matches. [Receipt](evidence/2026-11-26-legal-pages.json). These supersede earlier missing-policy statements below. Zero-cost public GitHub Pages; no billing, app deployment, sharing form or MCP change. Personal-data reporting/erase/retention gaps remain, not certified compliant.

# Private Jira Distribution handoff — 26 November 2026

**Production 2.1.0 / UI d69b66fe6384**, exact approved source d69b66fe6384a9a1c238d6a01f70e7d71ea491e9, normal deployment successful at deployment-list timestamp 09:00:08.162 UTC. [Receipt](evidence/2026-11-26-production-deployment.json). 204 local tests, locked install/audit0, build, SDK bootstrap and normal Forge lint passed; by-key index ACTIVE. Development demo unchanged. Major-version metadata timestamp remains its original major-2 creation time; it must not be used as evidence that this minor deployment did not happen. Its readback now shows 3 actions, 1 MCP module, no egress/remotes/services, requiresLicense:false.

Owner reports their own developer-console browser signed in and will fill the form. We did not access that browser, submit the form, create/rotate a link or change sharing. The blocker is now **owner form + a valid policy URL**, not a request to sign the agent's browser in. Never invent an installation URL. Keep it private and send it through the approved conversation, not this repository.

## Copy worksheet — technical facts, NOT a privacy policy or terms

The live form on the owner's box has not been independently observed. Use these values for corresponding labels; do not assume additional/changed labels or attestations have been reviewed.

- App name: **PermitGuard**.
- Vendor: **Mizzen Studios** (owner-approved).
- Contact email: use the exact owner-approved value from the private conversation. It is intentionally not republished here.
- Website/support URL if requested: **https://github.com/Mizzen-Studios/permitguard** / **https://github.com/Mizzen-Studios/permitguard/issues**.
- Distribution: **Sharing** for outside-organization judges, **Jira only**, **Production**. Sharing within organization is insufficient unless all intended judges belong to an organization of the app owner. Sharing is not a Marketplace listing; anyone with the shared link/app ID may be able to install, so keep the link private. Do not rotate an existing link without checking for one first; rotation disables the old link.
- Privacy policy URL: **https://mizzen-studios.github.io/permitguard/privacy.html** — owner-approved, live HTTP200, including current erase/reporting limitations.
- Terms of service URL: **https://mizzen-studios.github.io/permitguard/terms.html** — owner-approved simple evaluation terms, live HTTP200.
- Stores personal data / end-user data: **YES**. Named account IDs, display names when available, crew/permit/lock/verifier/activation/audit links and submitted photos can identify people.
- Stores data on Atlassian / Forge: **YES**. Forge Custom Entity Store/KVS persist records/evidence/challenges; derived Jira properties are stored in Jira. Optional Confluence archive code exists but is not configured for this Jira-only rehearsal.
- Stores/transfers data outside Atlassian (app/vendor runtime): **NO for this configuration**. No external egress/remotes/analytics/services or vendor-operated database are configured; MCP exposure stays OFF and no external client is invoked. User browsers receive authorized UI; native Rovo remains subject to Atlassian's service/privacy terms. If a future external MCP client is enabled this answer must be reassessed.
- AI if asked: **YES — optional native Atlassian Rovo**; no external AI API or Forge LLM API/Containers. Do not promise model-training/retention facts about Atlassian's subprocessors that we have not verified.
- Immediate/automatic deletion on uninstall if asked: **NOT GUARANTEED by this app**. Forge lifecycle is platform-managed; app has no implemented complete erase/retention flow, and derived Jira/Confluence artifacts may survive uninstall. Do not claim automatic removal or a fixed retention period.
- GDPR/privacy compliance certification if asked: **NOT VERIFIED; do not attest**. Reporting/erase/refresh and retention handling are not implemented. This is a demo with actual limitations, not a compliance certificate.

## All 12 declared scope purposes

These are purposes/limitations for the actual pinned manifest, not a claim that all scopes are needed by the minimal Jira-only demo. No scope was added/removed during the exact-source deployment.

| Scope | One-line purpose/limitation |
| --- | --- |
| read:jira-work | Resolve accessible issues/projects and caller permissions; read current issue context and derived readiness. |
| write:jira-work | Write the derived permitguard.snapshot issue property for Automation/JQL; normal human panel writes remain permission checked. |
| read:jira-user | Resolve signed-in display names and validate active/assignable named workers/verifiers in the issue. |
| storage:app | Persist installation/environment-scoped permit/evidence/config records, conditional revisions and bounded QR challenges in Forge CES/KVS. |
| manage:jira-configuration | Broad scope for own workflow-rule inspection/disable, additionally site-admin gated; unsupported deletion remains manual, no project workflow changed by this rehearsal. |
| read:cmdb-object:jira | Optional configured Assets reads of Equipment and Isolation points only; built-in-register demo does not require it. |
| read:cmdb-type:jira | Validate those Assets type/schema/attribute definitions; never enumerate instruments/calibration. |
| read:servicedesk-request | Legacy/optional JSM Assets workspace-access scope; current adapter uses configured IDs, so this is not exercised by the built-in/Jira-only rehearsal. |
| read:space:confluence | Optional archive: inspect the explicitly selected Confluence space; not configured/used by Jira-only rehearsal. |
| read:space.permission:confluence | Optional archive: verify approved restricted-space readers before any publication; not configured/used here. |
| read:page:confluence | Optional archive: find/read the selected monthly page and its version before appending; not used here. |
| write:page:confluence | Optional archive: append closed summary to the explicitly approved restricted page; not used here. |

MCP source/deployed base key is **permitguard_check_readiness**, exactly one GET tool. Native Rovo additionally has **request_activation**, PENDING proposal only; it is NOT an MCP tool. No declared agent/MCP confirmation or activation-completion action. The actual remotely discovered Production name is **NOT_RUN** because no exposure/client call is approved. Read-only tool behavior does not narrow broad platform OAuth consent.

## Personal-data checklist finding — must not conceal

[Atlassian's user privacy guide](https://developer.atlassian.com/platform/forge/user-privacy-guidelines/) requires apps storing personal data to report the account IDs through the Personal data reporting API and handle erase/refresh responses. It explicitly gives a Forge-storage/entity-property example, so Forge-hosted storage alone is not an exemption. The current manifest has no report:personal-data scope or scheduled triggers and the app has no implemented personal-data reporting/retention/erase flow. No new scope/job was silently added and no attributable lock/audit record was deleted. Retention/de-identification must preserve the safety invariant that a remaining personal lock is not treated as removed. Needs an owner-reviewed design, policy and permission change before claiming compliant sharing; simply ticking YES or adding a policy URL does not complete that work.

## Remaining checklist and ownership

- Owner completes truthful policy/declaration/form; sends actual private Jira-only link. Do not represent a maintainer-console URL as the install link.
- Owner uses fresh already-free site/admin and [production quickstart](production-install-rehearsal-2026-11-25.md), expecting **2.1.0 / d69b66fe6384**; no seat purchase, Confluence installation, Marketplace or billing change. Source Crew B helper is now deployed, but [two-person acceptance](second-crew-demo.md) requires two existing signed-in participants and actual normal lock/photo records. Nothing was seeded by this task.
- Native PENDING/confirmation, high-energy distinct-verifier, camera/QR and two-browser Realtime checks remain owner-browser work, NOT_RUN unless evidence is supplied. Production is deployed, not production-qualified.
- Workflow execution/JQL, capacity/recovery/export/retention and archive/uninstall limits remain disclosed. Do not activate/attach rules, select an archive space, delete records or expand scopes to bypass a missing decision.
- Raw footage/take log, final media/privacy/rights review, judge MCP access window, entrant attestations, publication/Devpost are still their separate pending gates. No new publication authority, invitations or synthetic evidence inferred.

Only deployment evidence and this **technical worksheet** are newly public. This is not new legal policy/terms, no approved private contact or install URL is reproduced, and it must not be used in the Privacy policy URL field.
