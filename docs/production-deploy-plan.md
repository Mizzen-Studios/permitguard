# Production deployment plan — DRAFT, NOT EXECUTED

Owner requested a plan only. **No production deploy/install, app distribution, Marketplace listing, Devpost upload or submission is authorized by this document.** Keep development app/site/permit intact. Owner-provided contest dates and categories must be checked against current official rules before any later submission; this plan does not establish eligibility.

## Scope and target decision

- Existing app: PermitGuard, UUID **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**. Current accepted demo is development on one-atlas-xitr.atlassian.net, **Jira only**. Confluence was deliberately uninstalled; do not restore it by default.
- A Forge **production environment** is a technical runtime target, not publication or a production-safety certification. A private install still needs separate owner authorization and a named site/project.
- Prefer a separately authorized dedicated production-test site rather than adding production alongside DEV on the judging site. Each product/environment installation can register a Rovo agent; no automatic DEV/STAGING name label may be assumed. Plan agent naming/discovery explicitly and verify exactly the intended picker results. Do not remove working agents through Rovo UI.
- State is installation/environment scoped. No production permit data or migration is assumed. Never seed over existing permits, copy personal photos/accounts casually or use uninstall as rollback/data reset.

## Go/no-go gates before authorization

1. Pin the exact source hash and dependencies; pass all backend/UI/checker tests, build, real resolver import/constructor and normal Forge lint/deploy verification. Resolve any provider Agent not allowed rejection through normal validation, never a verification bypass or repeated key/app churn.
2. Owner browser acceptance of cold startup: historical issue-property preview is explicitly nonauthoritative, never actionable/green clearance; live state replaces it; failed authorization keeps actions disabled. Measure preview/live/Realtime times separately. Recheck release banner above fold and filled disabled QR/photo forms.
3. Preserve named-worker locks, wrong/replayed/expired/cross-actor QR rejection, revision conflict failure, assigned-human-only activation, and two distinct humans for high energy. Native Rovo must keep WORK_START-only/no-release wording once. Actual Rovo PENDING proposal and external OAuth MCP/Studio acceptance remain separate gates; declaration is not proof.
4. Execute native Jira transition/JQL and recovery checks in an explicitly authorized synthetic workflow before advertising enforcement. Preview validator status/unsupported rule deletion remain limitations. No production workflow attachment or fail-open policy change without specific admin confirmation.
5. Data controls: approved readers/retention/incident/export/backup-and-restore procedure, photo legibility/bounds, bounded 180 KB site-store model and capacity tests. There is no verified complete compliance archive/export or production recovery mechanism yet; block production qualification until these requirements are met. A Jira property is derived, not a backup.
6. Confirm free-plan eligibility and actual remaining Forge/Rovo/Atlassian allowances. Free allowances are not hard spending caps. No card, new billing/overage terms, paid resources, external runtime/egress, Forge LLM API, Containers or SQL. No schedules exist; any future schedule requires its own review and hourly-or-slower cadence. If the available plan cannot meet the no-paid-use constraint, stop.
7. Product review: maintain decision-support/site-procedure language; no OSHA compliance certification or physical isolation/presence proof. Optional Confluence macro/archive is unavailable in the Jira-only topology and excluded from this production candidate.

## Proposed commands — only after explicit owner approval

Use approved private environment credentials with tracing disabled. Confirm the app manifest identity first, record existing installations and protect active development records. These examples are not an instruction to run now:

~~~sh
forge install list
forge deploy --environment production --non-interactive
# Only to the separately named and explicitly authorized Jira site:
forge install --environment production --site <authorized-production-test-site> --product Jira --non-interactive --confirm-scopes
forge install list
~~~

Read any CLI/permission/terms prompt before continuing; do not accept new billing terms or add a card. Record the successful deployment version and installation ID, exact scopes, candidate hash and local artifact hashes. Use the installed CLI's supported version-details/deploy-list commands to compare agent key/full prompt/actions, but do not equate metadata with functioning generated answers. Do not automatically upgrade another site or install Confluence.

## Private acceptance and rollback

- Open a newly authorized synthetic project/work item as the actual permitted person; no app/agent impersonation. Verify the native panel, admin/nonadmin boundaries, Rovo scoped read and shared-lock release barrier. A fresh production install must not magically contain development permits. Inspect the Rovo picker by stable IDs/source installation, not icons.
- Start Warn-only by default. Enforce only after explicit project-admin approval and negative checks. Keep fail-closed; never turn unavailable preview/cache into authority. Do not execute real equipment procedures from the app demo.
- Keep owner-approved audit/backup evidence before any schema/operational migration. Roll back executable code by re-building/re-deploying a known compatible source revision through normal verification; Forge produces a new version. Do not uninstall, blindly downgrade schema or overwrite operational state to imitate rollback. If compatibility/recovery is unproved, stop and retain the working development release.
- Production installation/acceptance, release approval and publication/submission are three separate decisions. This task completes none of them.
