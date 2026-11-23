# PermitGuard

**Human-confirmed lockout/tagout permit decision support in Jira.** The site's LOTO procedure remains authoritative; this app is not safety certification, a physical interlock or permission to energize.

**Accepted development core:** Forge **5.15.0**, UI source **4e3335fb30f9**. Owner retest reported 22 November 2026 at 21:00 UTC: one PermitGuard Judge, readable iframe/panel clocks, preview ~2.7 s and live ~4.3 s by reload stopwatch, and release-first scoped Rovo output. These are one observed run, not an SLA or controlled benchmark. [Evidence and readiness](docs/submission-readiness-2026-11-22.md).

**Submission status:** repository drafts only. Intended Codegeist 2026 category: Specialized Industries. **MCP bonus is NOT yet fully verified**: the owner supplied the official 2026 prize clause on 23 November, and live Forge metadata matches the required rovo:mcp architecture; authenticated MCP discovery/invocation evidence is still missing. [Bonus audit and exact missing proof](docs/mcp-bonus-readiness.md). No production deployment, recording/upload, Marketplace listing, Devpost save or submission is performed here.

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

**Rovo MCP — declared, runtime proof outstanding:** one Preview rovo:mcp module exposes those same two keys for Studio custom agents or consented MCP clients. The Atlassian-hosted endpoint pattern is `https://mcp.atlassian.com/forge/<registered-app-UUID>`. Another developer's clone uses its own UUID. Per-installation external exposure is disabled by default; a site/org admin enables selected tools, and external clients use OAuth 2.1 with the user's own site permissions. No grants or external-client connections were created for this documentation task.

Intended bonus evidence: show legitimate tool discovery and a **read-only check_readiness** invocation for the synthetic issue, then the same release-blocked result. A native Judge screenshot, manifest, endpoint string or unauthenticated 401 does not prove this. External-client use is optional in the platform docs; the owner-supplied prize clause targets a Forge app exposing an MCP server using rovo:mcp. A different upstream/coding-assistance MCP server is not a substitute for this exposed Forge tool. [Exact read-only owner steps](docs/mcp-read-only-proof-2026-11-23.md). [MCP audit](docs/mcp-bonus-readiness.md) · [caller contract](skill.md).

## Submission pack

- [180-second demo script and shot list](docs/demo-video-script.md) · [machine-readable shots](docs/demo-shot-list.json)
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
