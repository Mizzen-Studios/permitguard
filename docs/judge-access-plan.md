> **Current 26-Nov state:** Production **2.1.0 / UI d69b66fe6384**, deployed from exact d69b66f. Owner will fill Distribution on their reported signed-in box; policy URL/privacy handling are unresolved, link not created here. [Current handoff](distribution-handoff-2026-11-26.md). Prior versions/approval/source-only statements below are dated history, not a new permission or current deployment status. Fresh-site/native/two-person acceptance remains NOT_RUN.

> **21:39 approval follow-up:** Production **2.0.0** has now deployed from 713eadc. Private Jira-only distribution is approved but **BLOCKED_CONSOLE_LOGIN**; install link NOT_CREATED, fresh-site NOT_RUN. Earlier source/preparation-only statements below are historical, not the current deployment status. [Current handoff](production-install-rehearsal-2026-11-25.md).

# Judge access plan — preparation only, 25 November 2026

**NOT EXECUTED. No production deploy, distribution/share link, public sharing or MCP exposure change.** Existing demo stays Development 5.16.0 / UI 5f92b0c1b926, Jira only; exposure OFF per owner receipt. £0 constraint: no card, new terms, paid resources, new paid seats or trials requiring payment. If available entitlement/allowance is insufficient, stop. No-card is not independently proven as a hard usage cap.

## Decision: judges install production, not our Development environment

Use the **same registered PermitGuard app**, UUID 60f4bdda-1062-4e5b-aab6-1d9a9cf53a90. Forge's distribution installation link installs its **production** version. Development installs are for contributor testing and are not the judged distribution artifact. Production is a Forge environment, not Marketplace publication or safety certification. Forge assigns its version: **do not predict 5.16.0 in production**.

Storage is environment/installation isolated. Judges will not inherit PGSAMPLE-2, ACTIVE state, lock L-A1, photos, account IDs or site revision 22. Never copy the owner's operational records into another tenant. Jira issue properties are not environment-namespaced backups; avoid co-installing DEV and production on the existing demo issue/site, both to protect derived projections and prevent duplicate native-agent ambiguity. Prefer a separately approved, already-entitled rehearsal site. Do not provision/pay for one without approval.

## Exact maintainer sequence — only after Olly's separate OK

1. Obtain explicit OK covering **production deploy**, named rehearsal Jira site, **external distribution/sharing and link creation**, intended recipient/access window and £0 entitlement. These are separate from preparing this plan. No approval is implied by the checklist.
2. Pin a clean reviewed commit, locked dependencies and local build artifacts. Confirm manifest UUID, one GET MCP tool, native proposal retained, no runtime egress, SQL or schedules, no paid licensing. Run npm ci, npm test, npm run test:contracts, Python checker unit tests, npm run check, clean npm run build, SDK bootstrap import test and normal forge lint. Privately source existing Forge credentials; never put tokens in commands/docs. Read installed CLI --help before execution.
3. After approval, normal command: **forge deploy --environment production --non-interactive**. Never --no-verify or blind policy/rule approval. Record actual version, source/UI marker, artifact hashes and remote module readback. Stop on new terms, permissions, paid prompts, registration/validation failures. Do not forge register a replacement app.
4. In **developer.atlassian.com/console/myapps → PermitGuard (matching UUID) → Distribution → Distribution controls → Edit**, choose **Sharing** for external judges, not Sharing within organization. Fill the required app details truthfully and Save changes. Developer details must come from Olly; no invented address/contact/privacy claims. This control change is **not authorized now**.
5. Select **Jira only** as the install product and Save if requested. Do not select Confluence: selecting both constrains installs to sites supporting both and can duplicate native agents. Existing manifest has optional Confluence modules/scopes; Jira-only scope/installation behavior must be verified in rehearsal, not assumed universal.
6. Copy the generated **installation link**. It is the console's installation URL, not a browse issue link, source repository, Marketplace URL or MCP server URL. **No link exists in this handoff yet.** Do not invent one or paste developer-only dashboard URLs as a judge link. Keep distribution private to approved recipients until publication authorization.
7. Follow that exact link as the authorized administrator of the named clean rehearsal site, choose **Jira**, review actual broad consent and install production. Do not buy seats/upgrade a plan. Record actual installation ID/version, one intended native agent and cold startup. Exercise the README quickstart with actual principals.
8. Separately approve any **MCP exposure enablement**. Verify only the intended GET tool in the actual judge environment, discover its actual name rather than assuming _development or _production. Fresh setup is PLAN/NOT CLEARED, not the historical ACTIVE receipt. Record any new call separately from the owner's single 24-Nov call.
9. Promote setup to **fresh-site tested** only after real browser/install-link acceptance, with UTC, site alias, production version, source marker, role and actual outcomes. Keep tokens/account IDs/installation bearer details out of public evidence. A local mock or console metadata is not this acceptance.
10. Before submission, Olly approves link disclosure, any final judge invitations/configuration, exposure window, public video and final form submission. None is done by executing a local test.

## What “tested setup” means today

| Path | Evidence | Status |
| --- | --- | --- |
| Existing demo panel/native read | Earlier owner browser checks; 5.16 footer/panel in 24-Nov receipt | OWNER_OBSERVED |
| DEV MCP | Owner Inspector 2.16.0, one check_readiness_development read, sharing OFF; cleanup verified | PASS_OWNER_RECEIPT |
| Fresh sample quickstart, guards, UI label contracts | Local in-memory service and adapter tests in tests/judge-setup.test.mjs; no network/site writes | LOCAL_CONTRACT_TESTED |
| Generated distribution URL → production install → fresh tenant browser quickstart | No link or production deployment authorized | **NOT_RUN — blocks submission-ready claim** |

[README quickstart](../README.md#judge-installation-and-quickstart) is the proposed tested-to-this-limit procedure. The owner demo recording is separate from fresh judge installation.

## MCP — NEEDS OLLY OK AT SUBMISSION / BEFORE JUDGE TESTING

**Do not turn it on now.** On each intended installed site: admin.atlassian.com → organization → Apps → Sites → selected site → Connected apps → intended PermitGuard production app → View app details → **Expose tools to MCP-compatible apps**. Verify the app/environment/site before approving Enable tools. The switch is app-wide, not per-tool checkboxes; deployed module must remain GET-only. Consent can say **Read, Write, and Search**, not a read-only grant.

Approve the exact installations, tenant data boundaries, client and availability window. Judges must be able to use it during their actual tests, not merely while a submission screenshot is captured. The Rules' judging period is 5 Jan–3 Feb 2027; agree a narrower/whole-window availability policy explicitly. A judge's own installed site needs its own administrator's configuration; enabling our demo site alone is not a general install solution. Decide who returns OFF and revokes new client grants afterward. No automatic toggle, scheduled enablement or blanket OAuth grant is authorized.

## Failure and rollback

Missing Jira admin, Rovo/Assets entitlement or free allowance → document the blocker; don't purchase. Sample loader rejected → check exact project markers and open permits; don't weaken the guard or reseed the demo. Multiple agents → identify product/environment installations, don't delete agents through Rovo UI. Bad deployment → use compatible known source through normal new deployment after approval; uninstall is not a rollback/data reset. Stop distribution using console controls only after understanding existing-install effects; never promise revoking a link uninstalls apps or erases records.

## Official references checked 25 November

- https://developer.atlassian.com/platform/forge/distribute-your-apps/ — production prerequisite; Distribution/Edit/Sharing; required app details; product selection; generated installation link; licensing restrictions.
- https://developer.atlassian.com/platform/forge/environments-and-versions/ — development/staging/production and environment-isolated storage.
- [Owner-exported official Rules, hashes and line anchors](codegeist-rules-alignment-2026-11-24.md) — installation link, integration instructions, video, deadline and judging window. Changes to licensing/Marketplace eligibility require rechecking the distribution route; they are not approved here.
