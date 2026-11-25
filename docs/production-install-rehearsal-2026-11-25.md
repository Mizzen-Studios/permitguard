# Production installation handoff - 25 November 2026

## Actual result

Owner authorized Production and private Jira-only distribution at 21:39 UTC. **Production 2.0.0 deployed successfully at 21:42:12.849 UTC**, from clean source **713eadc3dfbccd2458453f0c0c02ebcfab9bb721**; UI marker **713eadc3dfbc**. [Deployment receipt](evidence/2026-11-25-production-deployment.json). Normal deployment validation and Forge lint passed; storage index permitguard-site/by-key is ACTIVE. Preflight: 134 backend + 50 UI contracts + 3 Python tests, real SDK bootstrap, clean locked install/audit (0 vulnerabilities), source/build known-secret scan. This does not prove fresh-tenant operation.

**Private install link: NOT_CREATED — BLOCKED_CONSOLE_LOGIN.** The managed openclaw browser reached an actual Atlassian sign-in page when opening the developer console. No sharing form was submitted or distribution setting changed. No replacement/developer URL is represented as an installation link. No production site was installed; owner will choose the new free site. Development demo installation remains unchanged.

## Exact remaining maintainer action

Sign in to the approved developer-console browser (or use the owner's already-authenticated box), then open:

https://developer.atlassian.com/console/myapps/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90/manage/distribution

This is a **maintainer console URL, NOT an installation link**. Confirm PermitGuard/app UUID. Distribution controls → Edit → Sharing (not organization-only). Use truthful existing/owner-supplied developer/contact/privacy details; do not invent missing required fields. Select **Jira only**, save and copy the generated installation URL. Return it only to the approved private conversation, never this public repository. Do not make a Marketplace listing or enable MCP. If new terms, card/payment, paid licensing or a required missing identity detail appears, stop and report it.

## Judge steps after the private link is available

1. Sign in as an administrator of a **new, already-free Jira site**. Do not use the existing Development demo site, add paid seats, upgrade, enter a card or enable a trial requiring payment.
2. Open the actual private installation link, select that site and **Jira only**, review the real permissions/consent and install. No Forge CLI, source clone, API token or Confluence installation is needed. Broad app consent is not a read-only OAuth grant. Keep **Expose tools to MCP-compatible apps OFF**.
3. Create a new **dedicated synthetic** Jira project with exact key **PGSAMPLE**. In Project settings → Details, set its description to include **[PermitGuard dedicated sample project]**. Do not relabel a real project or reset existing permits. Create a task and retain its actual key **PGSAMPLE-N**; do not assume -1 or -2.
4. Ensure your account can Browse/Edit Issues, is active/assignable, and is a project administrator for sample setup. Open the task → **View app actions → PermitGuard** (if not already inline). Complete normal app consent. Wait for authenticated current state; check footer **2.0.0 / UI 713eadc3dfbc**, not the DEV 5.16.0 recording footer. Fresh state has no equipment/permit and is Warn-only/fail-closed.
5. Follow **Open project administration below → Load a dedicated sample plant**. Read/tick its confirmation and choose **Load confirmed sample**. Expect six Equipment items and Isolation points; **Enforce/fail-closed only in the verified synthetic project**. This built-in path does not need Assets, a paid subscription, workflow attachment or Confluence archive.
6. Select **Cooling-water pump (EQ-1)** only, enter crew **Judge demo**, and keep the actual signed-in account ID prefilled for worker and named verifier. **Create permit**. Expect **PLAN / Release NOT CLEARED**. Do not copy account IDs or records from the owner's demo. High-energy examples require two distinct named people and are outside this single-user quickstart.
7. Choose **Refresh** and confirm current PLAN state. If native Rovo is included in the site's existing entitlement, open a new chat with the single intended production **PermitGuard Judge** and ask **Is PGSAMPLE-N cleared?** using the actual key. Expected canonical answer starts **Release: NOT CLEARED. Work start only: NOT CLEARED.** and reports **Phase: PLAN**, with site-procedure caveat. If Rovo is unavailable, record the limitation; do not purchase/upgrade or substitute a fake answer. MCP is not part of this rehearsal.
8. Stop at this minimal installation checkpoint. Record actual UTC, installed version/source, permissions, sample/equipment count, issue/phase and errors. Installation acceptance remains **NOT_RUN** until that real browser result is supplied. Lock/photo/verification/activation/release are further writes, not automatic setup; physical safety is never established by this app.

No Marketplace, MCP exposure/client call, billing/payment method, external promotion, Devpost or video publication was performed. Sharing/install-link generation remains incomplete, not silently marked done.
