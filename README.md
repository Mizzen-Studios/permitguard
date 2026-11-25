> **MCP owner receipt classified PASS; exposure stays OFF.** Official Rules require a Forge app exposing tools via the Atlassian MCP server using rovo:mcp, matching the deployed interface plus genuine owner-run call. This is technical evidence, not full submission/award signoff. [Rules/source hashes and **Olly’s OK** pre-submission exposure/judge-access gates](docs/codegeist-rules-alignment-2026-11-24.md).

> **24 November 16:57 approval:** MCP narrowed to **check_readiness GET only**; native proposal action retained. **Deployed/verified Development 5.16.0 · UI 5f92b0c1b926**. Deployment/readback: [GET-only development receipt](docs/mcp-get-deployment-2026-11-24.md). [Owner Linux Inspector/OAuth/single-call/OFF/revoke runbook](docs/mcp-linux-owner-proof.md). No exposure or OAuth is performed by the maintainer.

# PermitGuard

**Human-confirmed lockout/tagout permit decision support in Jira.** The site's LOTO procedure remains authoritative; this app is not safety certification, a physical interlock or permission to energize.

**Accepted development core:** Forge **5.15.0**, UI source **4e3335fb30f9**. Owner retest reported 22 November 2026 at 21:00 UTC: one PermitGuard Judge, readable iframe/panel clocks, preview ~2.7 s and live ~4.3 s by reload stopwatch, and release-first scoped Rovo output. These are one observed run, not an SLA or controlled benchmark. [Current pack/readiness](docs/submission-pack-2026-11-24.md).

**Submission status:** repository drafts only. Intended Codegeist 2026 category: Specialized Industries. **MCP technical runtime evidence: PASS (owner receipt, 24 November 21:06:40 UTC).** On Development 5.16.0, Inspector discovered exactly **check_readiness_development** and made one authenticated read returning **ACTIVE / WORK_START / release NOT CLEARED / siteRevision 22 / permitRevision 6 / operational:false**. Native proposal remains outside the GET-only MCP list. OAuth worked with sharing OFF; consent still said **Read, Write, and Search**—this is not a read-only OAuth grant. Owner restored **exposure OFF**, stopped/disconnected Inspector and removed its grant. [Redacted receipt/classification](docs/evidence/mcp-owner-receipt-2026-11-24.md).

## What judges can see

- A Plan → Lock → Verify → Active → Release → Closed clipboard, attributable personal locks and human-only equipment confirmation.
- Separate work-start and release decisions. The accepted ACTIVE sample says:
  > Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE.
- A remaining shared-equipment personal lock blocks release/closure, even after the current worker removes their own lock. Sample Crew B is explicitly simulated, not proof of a second real principal.
- Native Rovo reads the same deterministic service; an activation action can propose **PENDING**, never confirm or activate it. Real native proposal execution and two-person high-energy acceptance remain outside the accepted read-only core.

Demo: [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2). Existing authorized users only; this is not a public anonymous app. Panel: **View app actions → PermitGuard** if not already inline. Do not reset the active sample. Demo site expires 13 February 2027.

## Run locally

Node **22+**; Forge runtime is nodejs22.x. CLI **15.1.0** was checked for this pack. Atlassian account, a site with suitable Jira/Rovo entitlement and administrator install permission are required for connected testing. Local tests do not establish live platform capability.

~~~sh
git clone https://github.com/Mizzen-Studios/permitguard.git
cd permitguard
npm ci
npm test
npm run test:contracts
python3 -m unittest discover -s tests -p '*_test.py'
npm run build
forge lint
~~~

The accepted core has **131 passing tests**: 85 backend/integration/bootstrap, 43 UI contracts, 3 Python checker tests. Python is for optional evidence/admin scripts, not app runtime. No public endpoint, static-only server or offline mode substitutes for a Forge install.

### Install your own development clone

1. Authenticate Forge through supported CLI/environment authentication; keep credentials outside the repository in a private chmod-600 secrets file. Never paste tokens into source, screenshots or issue comments.
2. Run **forge register** in your own clone and select your own authorized developer space. It replaces app.id: **do not deploy to the maintainer's registered UUID**. Review the manifest and all scopes first.
3. Build/lint, then deploy/install only to your explicitly authorized development site:

~~~sh
forge deploy -e development
forge install -e development -s YOUR-SITE.atlassian.net -p Jira
forge install list
~~~

4. Open a company-managed Jira work item and its PermitGuard panel. Start Warn-only. Site/project administrators configure policy and the Equipment/Isolation points register; ordinary workers cannot change policy. Enforce is explicit opt-in, fail-closed by default. Do not attach Preview workflow gates automatically.
5. The existing demo register/sample loader is guarded for the dedicated PGSAMPLE project/description marker. A new installation starts with separate empty storage; it does not inherit the maintainer's fixtures. Follow [setup and demo preflight](docs/setup.md) rather than changing IDs or seeding over an open permit.

**Jira only is the accepted topology.** Jira hosts the JSM agent work-item panel, not a customer-portal companion. Confluence is optional/uninstalled; installing it can register another native agent. Do not add Confluence simply to get Rovo/MCP. Do not accept new billing terms, add a card or select paid resources without separate authorization. Accepted usage terms are not a spending cap.

## Architecture

~~~text
Jira Custom UI ── authorized resolver ── fresh Jira permissions/issue + register checks
                                           │
Native PermitGuard Judge ── action ─────────┤ deterministic service + revision guard
                                           │
rovo:mcp ── same action keys ────────────────┘ Forge Custom Entity Store
  Studio / OAuth client: NOT YET VERIFIED       │
                                     scoped invalidations → authorized reread
                                     derived Jira property → historical preview / JQL
~~~

- **Authority:** trusted invoking principal and current user-authorized issue access, not payload actor IDs, browser preview or writable Jira properties. Fresh register checks and conditional revision writes protect mutations/shared-lock release checks.
- **Human control:** personal locks stay attributable; QR and attestation are not presence proof. Two named verifiers are required by the model for high-energy points; a real two-person demonstration is still pending.
- **UI/data:** bounded photo evidence, in-memory nonactionable preview, no offline cache/authority. Realtime carries invalidation hints, not permit content or permission to proceed. Clock scopes are labelled; panel time is not total Jira navigation.
- **Integration scope:** built-in Equipment/Isolation points register in the demo; configurable Assets adapter/API metadata checks exist. Never instruments/calibration, graph:connector or Teamwork Graph.

## Rovo and the candidate MCP integration

**Native Rovo — accepted:** rovo:agent permitguard-judge-v2 calls Forge **action** handlers. check_readiness is GET and returns one release-first canonical message; request_activation is CREATE and only proposes PENDING for an assigned named human. There is no agent confirm tool. Native action use is **not** MCP transport proof.

**Rovo MCP — declared, runtime proof outstanding:** one Preview rovo:mcp module now exposes only **check_readiness (GET)**; the native Judge still has both actions. It supports Studio custom agents or consented MCP clients. The Atlassian-hosted endpoint pattern is `https://mcp.atlassian.com/forge/<registered-app-UUID>`. Another developer's clone uses its own UUID. Per-installation external exposure is disabled by default; a site/org admin enables app-wide exposure in the observed Forge UI (not per-tool selection), and external clients use OAuth 2.1 with the user's own site permissions. No grants or external-client connections were created for this documentation task.

Intended bonus evidence: show legitimate tool discovery and a **read-only check_readiness** invocation for the synthetic issue, then the same release-blocked result. A native Judge screenshot, manifest, endpoint string or unauthenticated 401 does not prove this. External-client use is optional in the platform docs; the owner-supplied prize clause targets a Forge app exposing an MCP server using rovo:mcp. A different upstream/coding-assistance MCP server is not a substitute for this exposed Forge tool. [Observed exposure OFF and current safety assessment](docs/mcp-exposure-assessment-2026-11-24.md). [MCP audit](docs/mcp-bonus-readiness.md) · [caller contract](skill.md).

## Submission pack

- [Exposure assessment: 5.15 expected; current MCP includes CREATE—leave OFF](docs/mcp-exposure-assessment-2026-11-24.md)
- [MCP owner receipt — redacted, genuine DEV invocation](docs/evidence/mcp-owner-receipt-2026-11-24.md) · [Official Rules alignment / pre-submission gates](docs/codegeist-rules-alignment-2026-11-24.md)
- [Current pack status](docs/submission-pack-2026-11-24.md) · [Screenshot list](docs/screenshots-list.md) · [Capture log](docs/capture-log.json)
- [Optional browser-only catalog discovery — no client/Publish](docs/mcp-browser-discovery-2026-11-24.md)
- [180-second read-only core demo script and shot list](docs/demo-video-script.md) · [machine-readable shots](docs/demo-shot-list.json)
- [Devpost write-up drafts](docs/devpost-draft.md)
- [Acceptance/readiness and evidence index](docs/submission-readiness-2026-11-22.md)
- [MCP bonus requirements/proof audit](docs/mcp-bonus-readiness.md)
- [Production plan — NOT executed](docs/production-deploy-plan.md)
- [Implementation inventory/limits](docs/implementation-notes.md) · [current source/deployment evidence](docs/release-first-timing-2026-11-22.md)

## Permissions, costs and limits

Exact [manifest](manifest.yml) consent controls access. Declared scopes: read:jira-work, write:jira-work, read:jira-user, read:servicedesk-request, read:cmdb-object:jira, read:cmdb-type:jira, manage:jira-configuration, storage:app; optional Confluence read:space:confluence, read:space.permission:confluence, read:page:confluence, write:page:confluence. manage:jira-configuration is broad; own-rule handlers are additionally site-admin-gated. Optional Confluence scopes remain declared even though its installation is absent.

No app external runtime/egress, SQL, Forge LLM API, Containers or schedules. Native Rovo has separate plan/credit limits; free allowances are not hard spending caps. A future consented external MCP client receives its authorized tool results; this is a separate data-sharing decision, not a claim that no data ever leaves Atlassian.

Connection required. Aggregate state is bounded to 180 KB/60 permits, photos to 64,000 data-URL characters each. Capacity/recovery/retention and production qualification remain incomplete. Preview workflow execution/uninstall behavior and JQL indexing still need live acceptance. Own-rule disable is tested; Forge deletion is unsupported/manual. Confluence restricted archive is not configured/verified. Conflict guard and shift-end suspension are future work, not video claims.

Before uninstall, list/disable/verify and manually remove installed workflow gates; don't leave fail-closed validators behind. Jira properties, fixtures, rules/pages may survive uninstall; follow the site's retention procedure. [Detailed limits](docs/implementation-notes.md).

MIT · [LICENSE](LICENSE) · Maintainer contact: [GitHub Issues](https://github.com/Mizzen-Studios/permitguard/issues). Site procedures remain authoritative; no OSHA compliance certification is claimed.


## Judge installation and quickstart

**Plan only: installation link NOT_CREATED; production NOT_DEPLOYED; fresh-site browser rehearsal NOT_RUN.** [Exact distribution plan](docs/judge-access-plan.md). Setup guards/sequence are locally contract-tested, not a completed production installation test. Existing DEV MCP has a separate real owner receipt. Do not treat those as equivalent.

1. **Later, using the approved console-generated installation link:** site administrator selects an already-entitled Jira site and installs **production, Jira only** after reviewing actual scopes. No Forge CLI/API token, repository clone, forge register, Confluence install or payment is needed by a judge. The production version/source will be recorded after deployment; do not expect the demo's 5.16.0 footer or its records.
2. Jira administrator creates a **new dedicated synthetic project with key PGSAMPLE** and description containing the exact marker **[PermitGuard dedicated sample project]** (Project settings → Details). Use no real plant/personnel data. If PGSAMPLE already exists for real work or has open permits, stop; do not relabel it or reset it. This exact key+marker restriction is intentional.
3. Create a task/work item there, record its actual key **PGSAMPLE-N**, and open it. The judge must have Browse/Edit Issues, be active/assignable on that issue, and have project-admin permission for sample loading. In the issue choose **View app actions → PermitGuard** if not already inline. Allow normal first-run app consent; no credential sharing. Wait for live authenticated state, not historical preview. Verify intended production footer and exactly one intended native Judge.
4. Fresh installation: no equipment/permit, policy **Warn only / block if register unavailable**. Expand **Project administration → Load a dedicated sample plant**. Read and explicitly tick the confirmation, then **Load confirmed sample**. This creates six Equipment records and Isolation points and enables **Enforce / fail-closed only in this verified synthetic project**. No Assets subscription, external service, workflow rule, archive space or paid resource is required for this built-in sample path.
5. Under **Plan an isolation permit**, tick **Cooling-water pump** only (EQ-1, namespaced to this project; low energy). Enter **Crew name** as **Judge demo**. Keep **Worker account IDs** and **Named verifier account IDs** prefilled with your actual authenticated ID; do not enter another person's ID. Click **Create permit**. Expect **PLAN**, review of the isolation plan, **Release NOT CLEARED**. Do not expect ACTIVE or revision 22: storage is fresh. One user cannot demonstrate the distinct-two-human high-energy case.
6. Read-only checkpoint: choose **Refresh**, inspect the equipment and release strip. In **Rovo/Chat → agent picker**, find the one intended production **PermitGuard Judge**, start a **new chat**, ask **Is PGSAMPLE-N cleared?** using the actual key. Expect **Release: NOT CLEARED**, **Work start only: NOT CLEARED**, **Phase: PLAN** and site-procedure caveat. If Rovo is unavailable under the existing plan, record the limitation; do not upgrade/buy access or substitute a mocked response.
7. **Stop here for the minimal judge quickstart.** Begin locking/Record my lock/verification/activation/release are writes and not needed to prove initial installation. A fuller synthetic lifecycle needs explicitly agreed data/participants and photo/QR assertions; it never proves physical safety. Never remove others' locks or seed over an existing permit.
8. **MCP — NEEDS OLLY OK AT SUBMISSION / BEFORE JUDGE TESTS.** Exposure stays OFF now. With separate approval, the administrator enables the intended installed app, judge uses an approved MCP client/normal OAuth, discovers the actual environment-named readiness tool and reads the actual PGSAMPLE-N once. The historical name check_readiness_development is not a promised production name. Consent may say **Read, Write, and Search** despite the GET-only MCP interface. See [exposure/window/cleanup steps](docs/judge-access-plan.md#mcp--needs-olly-ok-at-submission--before-judge-testing).

**Rehearsal record required before calling this fully tested:** generated-link install by intended admin, production version/source, fresh project marker/issue, actual footer/one agent, PLAN response, role/permission checks, optional approved MCP response and cleanup, errors/elapsed times. No raw tokens or personal identifiers in published evidence. We will replace NOT_RUN only with that real acceptance record. [Existing owner demo script](docs/demo-video-script.md).
