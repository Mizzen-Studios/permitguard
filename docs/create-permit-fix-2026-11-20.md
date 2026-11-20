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
- **10 UI contract tests** passed, including own-save invalidation reconciliation and uncertain-save non-resubmission.
- Build and diff checks passed. Local storage and UI tests remain mocks, not deployed persistence/browser acceptance.

Owner next step: reload PGSAMPLE-1 to load the new bundle. Existing six sample records should remain; do NOT reload the sample unnecessarily. Select EQ-1, Crew A, current worker/verifier; click Create permit once. Expect PLAN and site revision 1 (unless another authorized mutation advanced it). Continue Lock → Verify → human activation → Crew B blocked release and Rovo checks. On failure, note exact UTC time and operation; refresh to reconcile before deciding whether to retry.
