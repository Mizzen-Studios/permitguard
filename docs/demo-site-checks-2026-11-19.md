# Development acceptance evidence — 19 November 2026

Site: https://one-atlas-xitr.atlassian.net . Repo: https://github.com/Mizzen-Studios/permitguard . App UUID 60f4bdda-1062-4e5b-aab6-1d9a9cf53a90. Owner explicitly approved usage/overage terms; no card/payment method added. Existing private credentials were sourced, never committed or echoed.

## Passed CLI / API checks

- Registration in Mizzen Studios developer space; development deployment and confirmed Jira + Confluence installations.
- JSM API HTTP 200; Jira installation supplies the JSM agent work-item panel, not a customer-portal module.
- Dedicated PGSAMPLE project 10202 / PGSAMPLE-1 issue 66400 created with synthetic-only description marker. Loader was NOT invoked; provisioning did NOT enable Enforce.
- Owner-token REST created/read back PGTEST schema16 with only Equipment147 and Isolation points148. Synthetic objects PGTEST-4666 and PGTEST-4667, linked through Equipment key text. Energy HYDRAULIC, lock state ISOLATION_REQUIRED, High energy false. No instruments/calibration objects read.
- **Forge app identity** at 18:44 UTC: exact type validation and full normalized Equipment + Isolation metadata passed, one Equipment and one point. Basic object and Confluence space API reads returned HTTP 200. This is not per-user browser consent/asUser acceptance.
- Custom Entity Store live synthetic health-v1 row: conditional write, readback and stale-update rejection passed. No operational permit records were read or mutated by the probe.
- App-owned transition rule list HTTP 200. Created a completely UNASSIGNED API recovery workflow with two PermitGuard validators. Forge update/disable HTTP 200, both disabled flags read back true. No project workflow changed.
- Unauthenticated diagnostic request refused HTTP 401. Diagnostic URL/key were kept private.
- Local regression: 69 backend/domain/integration tests + 7 connected UI contract tests passed. These are model/mock/static tests, not physical/device or executed-transition evidence.

## Concrete unresolved platform gap

Forge transition-rule DELETE returned **HTTP 401: Unauthorized; scope does not match** after verified disable. Both rules remain disabled in the unassigned fixture. Documentation describes the deletion endpoint as Connect-only. The app returns UNSUPPORTED with manual administrator removal instructions; it does not use the owner's API token to fake Forge deletion support. This requested requirement remains blocked by the current Forge API contract.

## Not live-accepted / owner handoff

- Rovo Chat/agent tools, Rovo Studio custom agent, external MCP enablement/OAuth.
- Custom UI rendering and per-user consent; actual camera/photo/QR decoding.
- Two-browser Realtime delivery and timing of the under-two-minute Crew B path.
- Actual Jira transition gate execution and after-uninstall behavior.
- Live JQL indexing / Automation outcomes.
- Monthly archive publication: admin-chosen restricted space missing. No Confluence register page written or user space permissions changed.
- Confluence macro rendering and cross-product snapshot behavior.

See browser-handoff.md for exact clicks. No browser acceptance was performed, per owner request. The app is not production-qualified, safety certified, or feature-complete merely because deployment succeeded.

## Recovered failures

- Personal-app registration flag was incompatible with the developer space; normal registration succeeded.
- forge install list does not accept -e; corrected list confirmed installation.
- Major-version approval gate initially stopped deployment; explicitly understood version approval was used, without a payment method.
- An intermediate bundle read a file during editing; syntax/build was subsequently checked before successful deployment.
- A transient Agent not allowed pre-deployment response cleared on validation retry; no validation bypass used.
- Initial Assets mocks assumed nested attribute names. The live response uses objectTypeAttributes definitions + objectTypeAttributeId; normalization was corrected, regression mocks updated to the real shape, and the full app-identity read passed.

## Cost / artifacts

No SQL provisioned or invoked (0 SQL calls; compute measurement not applicable), no scheduled triggers, LLM API, Containers, paid service or external fetch permission. Conditional writes are batched and logs minimal. Free allowance is not a hard spending cap; monitor usage before repeating demos. Retained synthetic artifacts are explicitly documented in README. No Marketplace publication, promotion or Devpost submission.
