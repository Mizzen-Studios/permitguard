> **25 November current entrypoints:** [judge installation plan](judge-access-plan.md), [README fresh-site quickstart](../README.md#judge-installation-and-quickstart), [read-only owner capture checklist](video-capture-list.md) and [priorities](submission-checklist-2026-11-25.md). The operational/version notes below are historical: MCP now has an owner PASS receipt, current demo is DEV 5.16.0, and the new recording plan does **not** authorize seed/phase/lock/roleplay writes. No production deployment, share link or exposure is authorized.

> **Current deployment: 5.16.0 · UI 5f92b0c1b926** — approved GET-only MCP change deployed and metadata/install verified. Native proposal action retained; UI behavior unchanged, new clean source marker. Prior 5.15.0 acceptance is historical. Fresh browser acceptance and authenticated MCP proof remain owner-run. [Deployment receipt](mcp-get-deployment-2026-11-24.md) · [Linux commands and cleanup](mcp-linux-owner-proof.md). Do not toggle exposure or mutate state from this guide.

# Setup and demo preflight

This is a guide, not authorization to deploy, install, provision, enable external tools or mutate the accepted sample. Current development is **5.16.0 / UI 5f92b0c1b926**, following the approved GET-only MCP deployment; earlier owner-accepted core was 5.15.0. UI logic and native proposal behavior are unchanged; a fresh owner browser check is not yet recorded.

## Local verification

Use Node 22+, npm and Python 3 (checker tests). Run npm ci, npm test, npm run test:contracts, python3 -m unittest discover -s tests -p '*_test.py', npm run build, forge lint. CLI 15.1.0 was observed on 22 November. Native SDK/bootstrap tests are part of npm test. Build labels dirty tracked worktrees; don't present such a bundle as the accepted clean source.

## Your own connected installation

- Authenticate through supported Forge CLI/env authentication, with credentials in a private chmod-600 file outside source. Do not copy the maintainer's credentials or app identity.
- Run forge register in your own clone and select your authorized developer space. Confirm app.id is your registration before forge deploy -e development.
- Install only to your authorized Jira site: forge install -e development -s YOUR-SITE.atlassian.net -p Jira; read consent, then forge install list. Jira is sufficient for the JSM agent work-item panel. Do not automatically install Confluence; it previously produced a second legitimate product-owned agent.
- Confirm required site plan/Rovo availability without buying/upgrading anything. A development install is not a production deploy or Marketplace listing. If prompted for new billing terms, card, paid resources or a production change, stop.

## Empty clone versus maintained sample

Storage is installation/environment scoped. Installing a clone does not copy PGSAMPLE-2, equipment, locks or the maintainer's assets IDs. Existing users may open [the maintained sample](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2); don't reset/reseed it.

On a new authorized test site, an administrator may manually create a dedicated company-managed synthetic project with key **PGSAMPLE** and description containing **[PermitGuard dedicated sample project]**. Stop if that key already names operational work. Create a test work item, open **View app actions → PermitGuard**, and inspect the empty state/policy as the actual user. Default is Warn-only.

Only after explicit administrator confirmation, use the panel's guarded sample-equipment loader. It checks both project markers and loads six synthetic equipment items, enabling Enforce only in that verified dedicated project. Do not use the Assets schema/type IDs from the maintainer's site on a clone. The default demo uses the built-in Equipment/Isolation points register. Connected Assets configuration is optional and must use your own exact workspace/schema/type metadata.

**scripts/demo-work-item.py is maintainer-site-specific and can write Jira. Do not run it as a generic setup command.** Other fixture/workflow scripts are also not automatic installer steps. This documentation task ran none of them.

Name actual workers/verifiers; use that installation's displayed/generated QR, not a hard-coded maintainer project ID. File selection is not camera or presence proof. Never treat Warn-only advisory allowance as a cleared safety decision.

## Judge preflight on accepted core

1. Footer **5.16.0 · UI 5f92b0c1b926**; readable labels and release strip above fold; exactly one **PermitGuard Judge**. Stop on a mismatch instead of recording the wrong build.
2. PGSAMPLE-2 is the preserved ACTIVE path at the last accepted report. Verify state/lock records before choosing a recording action; don't repair via raw storage or impersonate people.
3. New chat: **Is PGSAMPLE-2 cleared?** Expected start: **Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE.**
4. Measure reload stopwatch separately from iframe/panel clocks. Owner's 21:00 report: preview ~2.7 s/live ~4.3 s in that run; prior runs varied substantially. Static loading chrome, historical preview and authorized live state are different milestones.
5. For the release-blocker recording, use only the explicit sample Crew B roleplay and remove only your own lock. This is a future human recording plan, not authority for this task to change the permit.
6. MCP bonus remains [unverified](mcp-bonus-readiness.md). No private Studio agent, OAuth grant, external exposure or publication is created by following the read-only checklist. Stop at a login/consent/publish gate and ask the owner.

Connection required; no offline mode. Site procedure remains authoritative. [Shot list](demo-video-script.md) · [submission readiness](submission-readiness-2026-11-22.md).
