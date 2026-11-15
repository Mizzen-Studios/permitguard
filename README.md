# PermitGuard

Human-confirmed lockout/tagout (LOTO) permit **decision support** for Jira work items and Jira Service Management requests, designed for Atlassian Forge and Codegeist 2026 (Specialized Industries, MCP bonus).

**Scaffold in development — not deployed or ready for operational use.** The site's own permit procedure remains the authority. This app does not establish that equipment is physically safe.

## Local scaffold

Requires Node 22+. Run `npm test` (12 pure-domain tests) and `npm run check`. Open `static/permit-panel/index.html` for the dependency-free local tablet sample. Optional `npm run test:ui` requires a locally available Playwright installation and Chromium; it checks the simulated judge path and 1024/768/520/360 widths. No Playwright or browser is bundled as an app runtime dependency.

The domain and UI are deliberately separate at this stage: client-side demo controls are not authorization. Server authentication, atomic persistence, trusted evidence validation and full site-wide shared-equipment lock queries are still required. Project boundaries must not hide another crew's lock.

See [platform feasibility](docs/platform-feasibility.md), [live acceptance checklist](docs/live-checklist.md), and the draft admin-enabled [planning-agent contract](skill.md). A capability-probe manifest now exists with an explicit placeholder app UUID; it is **not registered or deployed**. Run `npm ci` then `npm run build:probe` to bundle its Custom UI. Registration stopped at an overage-billing agreement under the zero-cost rule; never treat the probe modules as completed product features.

## Planned experience
Plan → Lock → Verify → Active → Release → Closed. Select equipment and isolation points from Jira Assets, with a built-in equipment register fallback. Workers record personal locks; named humans verify. A remaining lock from another crew blocks release. Agent-requested activations remain PENDING until an assigned verifier confirms at the equipment.

Warn-only is the install default. Project administrators explicitly opt a project into Enforce (fail-closed default; optional fail-open-with-alert). A confirmed six-equipment sample plant only enables Enforce in the sample project. No instrument/calibration data is read.

## Installation and current status
Judges are expected to install as site administrators on their own Atlassian sites. A 90-day demo site was provisioned on 15 November 2026; authenticated Assets workspace discovery returned HTTP 200 with one workspace. **No Forge app is registered/deployed/installed:** registration requires an overage-billing agreement, declined to preserve the zero-cost constraint. Assets object access, Rovo agents/Studio/MCP, workflow enforcement, Realtime and Custom UI camera remain **unverified**. See [dated check results](docs/demo-site-checks-2026-11-15.md).

The local frontend and pure domain tests are scaffolds, not proof of Forge permissions, physical isolation, real-time concurrency, camera access, or workflow enforcement. Setup and verification instructions will be added alongside working implementations.

## Preview modules and uninstall caution
Planned Preview modules: jira:workflowValidator and rovo:mcp. Official docs warn that expression validators fail closed after uninstall. Forge list/disable is documented, but rule deletion currently remains documented Connect-only: **automatic delete is unresolved**, with admin manual removal as a recovery path. Validator lifecycle must be tested on a disposable workflow before use. The app must provide administrators with list/disable/delete controls for its own transition rules and require rule cleanup before uninstall. The panel Start action is the non-admin fallback; it cannot install workflow rules.

## Scopes and footprint
Current capability-probe manifest scopes (not installed/granted):
- `read:jira-work`: check the invoking user’s admin permission.
- `read:servicedesk-request`: read-only Assets workspace discovery.
- `manage:jira-configuration`: list the app’s own workflow rules; broad configuration scope, admin-gated handler.

Future permit, Assets-object and Confluence scopes will be added only with implemented endpoints and explicit justification. No graph connector, Teamwork Graph, external runtime APIs, or egress.

Planned uninstall footprint: Jira properties, existing workflow rules, and Confluence archives may remain. App-hosted storage follows Atlassian retention policy. Cleanup behavior is a live acceptance gate, not yet implemented.

## Cost and limitations
No paid services, cards, Forge LLM API or Forge Containers. SQL is not provisioned; if introduced, compute per judge path will be measured, writes batched and schedules hourly or slower. The app requires a connection: **no offline mode**. QR/photo evidence is not proof of physical isolation. Availability and entitlements vary by site; fallback register support does not imply Assets is available.

Conflict guard and shift-end suspension are future ideas only, not implemented features or video claims.

## Project milestones
- Now: repository, safety model, tablet scaffold and documented platform feasibility.
- Demo site provisioned; credentials used privately. Next: resolve overage-billing registration terms and browser sign-in, then finish app-level early checks.
- Target feature-complete: 8 December 2026.
- Owner-supplied contest deadline: 22 December 2026, 20:00 UK; confirm against official rules before submission.

No Marketplace publication or Devpost submission is performed by this project automation.

## Maintenance and licence
Maintained via [GitHub Issues](https://github.com/Mizzen-Studios/permitguard/issues). MIT; see [LICENSE](LICENSE).
