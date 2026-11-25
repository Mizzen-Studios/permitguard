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
