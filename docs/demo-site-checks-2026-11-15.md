# Demo-site early checks — 15 November 2026

## Site and authentication
- Demo site: https://one-atlas-xitr.atlassian.net
- Forge reports active; expiry 2027-02-13.
- Forge CLI 15.1.0; authenticated through private environment variables. The VM has no working credential keychain; login could not persist credentials, but forge whoami and provisioning authenticate successfully through the env file. No credentials are in this repository.
- Tenant discovery HTTP 200. Jira authenticated-user API HTTP 200; ADMINISTER permission HTTP 200 and true.
- No card added, paid plan selected, or overage agreement accepted. A Mizzen Studios Developer Space was created by the registration flow; app registration was declined at its billing terms. No app registered, deployed or installed. Manifest app UUID is an explicit placeholder.

## Capability results
| Capability | Result | Observed evidence / remaining gate |
| --- | --- | --- |
| Assets | PARTIAL | Authenticated Assets workspace discovery HTTP 200 with 1 workspace. No object data, schemas, instruments or calibration data read. Equipment/Isolation point access via Forge remains untested. |
| Rovo agent | BLOCKED | Forge app registration/deployment blocked by billing terms; agent not installed or invoked. Provisioning documentation is not live agent proof. |
| Rovo Studio custom agent | BLOCKED | Same deployment blocker; browser also redirects to Atlassian login. No custom-agent tool execution tested. |
| rovo:mcp Preview | BLOCKED | Manifest passes offline schema validation; not deployed/admin-enabled or called over MCP. |
| jira:workflowValidator Preview | BLOCKED | Manifest passes offline schema validation; no rule attached, transitions tested or disable/delete run. Always-false probe is for disposable workflows only. |
| Custom UI camera/QR | BLOCKED | Local probe bundles a real-device camera request with track cleanup. No installed Forge iframe/hardware test; QR decoder not implemented. Browser requires sign-in. |
| Forge Realtime | NOT IMPLEMENTED / NOT RUN | No cross-browser live-board proof. |

The three product API probes used the owner's authenticated operator token, **not app permissions**, and do not prove a Forge app can call those endpoints. Workspace discovery is not Assets schema/object access acceptance.

## Exact registration blocker
The CLI requires agreement that if any Forge app in the Developer Space exceeds its free allowance, the account agrees to be billed for excess usage at current prices. This conflicts with the explicit zero-cost requirement; answered No. No attempt was made to bypass the agreement or to add a payment method.

Proceeding requires an owner-approved registration path consistent with the cost rule, or an explicit owner decision changing that constraint. Browser sign-in is separately needed for interactive checks. Do not mark unavailable/unverified features as platform failures.

## Local probe verification
- Build passed; 12 pure-domain tests passed; original UI syntax and browser judge-path/responsive checks passed.
- Full offline Forge manifest validation passed. Authenticated forge lint reaches app lookup but cannot find the placeholder app; this is **not** a deployed/lint acceptance pass.
- Dependency audit: zero known vulnerabilities at verification time. Overrides are pinned in package.json; compatibility still requires live deployment tests.
- No SQL provisioned, 0 SQL calls. No SQL compute measurement is claimed. No persistence, scheduled jobs, external runtime egress, Forge LLM API or Containers.
- check_readiness safely returns NOT CLEARED / NOT_YET_CONFIGURED; request_activation returns DENIED / NOT_CONFIGURED and creates nothing. They are probes, not the finished activation flow.

## Next safe sequence
1. Resolve registration billing terms with the owner; do not auto-accept or add a card.
2. Register a genuine app ID, lint/build/deploy/install development on the demo site; review the three current scopes first.
3. Sign into Atlassian in the operator browser; run installed read-only admin probe, discover agent/Studio/MCP, test real camera with hardware, then disposable workflow gate/list/disable/recovery.
4. Keep documented Connect-only rule-delete limitation unresolved until supported live evidence exists. No real workflow gates or operational equipment use.
