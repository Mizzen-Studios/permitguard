# First permit creation fix — 20 November 2026

## Owner browser evidence

On 5.3.0 the PGSAMPLE-1 panel was usable in about five seconds, without consent prompt. Admin/sample setup rendered above Plan and confirmed sample load created EQ-1 through EQ-6 with Enforce / FAIL_CLOSED. This is owner-observed browser evidence, not inferred from local tests. Create permit then failed three times, leaving site storage revision 0 and no permit. The post-load Realtime save banner was misleading.

## Diagnosis and fix

Retrieved development Forge logs since 2026-11-20T08:45:00Z; output was empty. The resolver caught adapter exceptions without logging, so no stack trace was available. Read-only live owner-token REST independently reproduced the root cause: assignable-user search with issueKey=66400 returned HTTP 404; the identical query with issueKey=PGSAMPLE-1 returned HTTP 200 and the active exact account match.

validatePeople now resolves the numeric issue under the same asUser identity, validates its returned ID and canonical key, and uses that key for the bounded exact assignable-user search. Inactive/unavailable/unauthorized people still fail closed. No scope expansion, admin bypass, or fallback to unvalidated identities. Actual corrected adapter run locally with private owner-token REST returned HTTP 200 for canonical issue and assignable search. This is live read-only API evidence, not deployed Forge asUser/browser acceptance. No permit/sample write was made during diagnosis.

Resolver failures now emit a bounded structured event with allowlisted operation and sanitized public error code only. No exception message, payload, actor/issue ID, photo or credential is logged.

Realtime invalidation received during a save is deferred and reconciled with a fresh authoritative state read after successful mutation. It no longer renders the misleading refresh-required banner or rebuilds the form mid-save just because an invalidation arrives. An uncertain/failed mutation remains stale and is never resubmitted or silently hidden by a successful read. This does not prove two-browser delivery.

## Regression and acceptance boundary

- **72 backend/integration tests** passed, including load_sample committing revision 0 then create_permit committing revision 1 with the real Jira adapter contract and explicit expectedRevision=0. Readback persists the PLAN permit; stale revision 0 is refused afterwards.
- Participant denial/inactive/mismatched-issue cases fail closed.
- **11 UI contract tests** passed, including own-save invalidation reconciliation and uncertain-save non-resubmission and preservation of genuine disconnected-subscription status.
- Build and diff checks passed. Local storage and UI tests remain mocks, not deployed persistence/browser acceptance.

Owner next step: reload PGSAMPLE-1 to load the new bundle. Existing six sample records should remain; do NOT reload the sample unnecessarily. Select EQ-1, Crew A, current worker/verifier; click Create permit once. Expect PLAN and site revision 1 (unless another authorized mutation advanced it). Continue Lock → Verify → human activation → Crew B blocked release and Rovo checks. On failure, note exact UTC time and operation; refresh to reconcile before deciding whether to retry.

## Release status — blocked, not ready for browser re-test

- Main code fixes pushed as c5a2ec8069ed861f82dd6cf38c925fd716761f93 and d989804afd60ff6f5e8d08679481dfa474a277cb; remote parity and clean code tree verified.
- Final 72 backend + 11 UI tests passed; build and diff checks passed. Source and final built UI known-credential scans passed. Final app.js SHA-256 d0bb431c29ffeaf60f7f2417cfbd98fa334d1054a713db2549157aad5112a18a; HTML 532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0; CSS 571fcfec77153e860194be7c0ec1e7f9286d25ed730475c3bcc06c28c9332ba9.
- Several normal deployment attempts failed at Agent not allowed. Verbose standalone lint reported Manifest is valid / No issues found, but the diagnostic verbose deployment reached server-side manifest validation and returned **FAILED**, deployment ID **9**, error code **MANIFEST_VALIDATION_FAILED**, message **Agent not allowed**, fields.agents **[permitguard-agent]** at approximately 09:11 UTC.
- Final status read request ID: 45e6733f5d224c75a2b53d614146ba04. App UUID 60f4bdda-1062-4e5b-aab6-1d9a9cf53a90, environment default/development. Raw diagnostic logs remain private because they contain temporary artifact-upload URLs and platform metadata; no credentials or raw logs committed.
- No deployment success receipt exists for this fix. Last confirmed successful deployed version remains **5.3.0**. Install upgrades were not attempted after failure. Do not infer that the new code is running, or retry the owner judge path yet.
- No validation bypass, agent removal/recreation, app re-registration, production deployment, payment change or unrelated source change was attempted. The unchanged existing Rovo module is required by the brief. The platform's underlying reason for denying it is unknown; this is a concrete Atlassian validation gate, not a diagnosed billing/entitlement condition.
- Resume when Atlassian permits the existing agent deployment, or the owner explicitly authorizes an alternative. Use normal validated deployment of the preserved candidate, verify the deployment receipt and installation state, then request owner browser re-test. Do not resubmit a pending/uncertain deployment: deployment 9 has already been reconciled as FAILED.
