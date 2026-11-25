> **21:39 approval follow-up:** Production **2.0.0** has now deployed from 713eadc. Private Jira-only distribution is approved but **BLOCKED_CONSOLE_LOGIN**; install link NOT_CREATED, fresh-site NOT_RUN. Earlier source/preparation-only statements below are historical, not the current deployment status. [Current handoff](../production-install-rehearsal-2026-11-25.md).

# Unreleased judge-facing polish - 25 November 2026

**SOURCE ONLY - NOT DEPLOYED.** No change to the owner demo, accepted MCP receipt or recording baseline. Later deployment and native-agent acceptance need a separate decision.

## First-run and recovery UX

- Empty register shows role-specific guidance before advanced administration; no inert worker/create form appears before equipment exists. An empty register/lock rail is explicitly not clearance.
- A disconnected/changed register is distinguished from a new empty project. Reconcile it; never bypass it with sample data.
- Unavailable state offers sign-in/work-item/installation recovery without tokens or billing changes. Unexpected read/save exception text is not echoed. Uncertain saves are never automatically resubmitted.
- Synthetic roleplay is hidden without a server-owned sample capability or existing own sample. This hint does not replace backend authorization.

## Verification scope

Local UI VM contracts and server setup tests passed. Isolated **Chromium synthetic fixtures** covered seven states at **320, 390, 768 and 1280 px**: 28 renders, no page overflow, Refresh touch target >=44 px, keyboard skip and no page errors. Network was blocked: no analytics, Atlassian session, live tenant or physical-device validation. Representative desktop outage/mobile empty/error screenshots were visually inspected privately; none committed/published.

First browser harness attempt retained old script bindings across setContent calls. Fresh page per viewport fixed the harness; this is not a product defect. Task-owned browser/context closed in finally after both attempts.

Real fresh-install and native Rovo browser acceptance remain **NOT_RUN for this candidate**. Prior live evidence stays dated; local fixtures do not upgrade it.


## Rovo source candidate

[Answer contracts and evaluation limits](agent-answer-quality.md): safe actionable failures, malformed-response guards, unchanged ACTIVE canonical message and one bounded PENDING proposal reply. Removed the misleading register-outage suggestion of an unimplemented supervisor override. No new native acceptance or Forge action is claimed.


## Repeatable optional browser check

Run **npm run test:ui:local-browser** only with an already-installed Playwright module and Chromium. Set **PERMITGUARD_PLAYWRIGHT_PATH** to the existing module when it is not resolvable normally, **PERMITGUARD_CHROMIUM_PATH** to the existing executable, and **PERMITGUARD_BROWSER_QA_OUT** to private workspace storage outside the public app repository. The harness refuses output inside this repo, uses fresh pages, blocks network and closes its own context/browser in finally. It does not install tools, log in, use the real Forge bridge or touch a tenant. This optional developer command is not judge setup and is not part of the credential-free default unit suite.

[Verification record](verification-2026-11-25.json). Normal Forge lint passed with CLI 15.1.0; its 16.0.0 update notice was recorded, not acted on. Candidate production build/SDK constructor checks ran in an isolated private copy, preserving the original demo bundle hashes. Local Node 24.22.1 satisfies package >=22; exact Forge nodejs22.x execution remains part of later authorized deployment validation. SDK import emitted a MODULE_TYPELESS_PACKAGE_JSON warning; no package-type migration was attempted in this polish task.
