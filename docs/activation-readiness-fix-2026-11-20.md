# Activation, readiness and QR revisions — 20 November 2026

## Live evidence and limits

Owner 17:05–17:08 UTC browser test on 5.6.0 passed first permit create (revision 1), locking, L-A1 with inline photo, beginning Verify, and second-tab Realtime lock-count update (~3 seconds after Play Crew B). File chooser/capture=environment is not physical camera decoding proof. Owner reports current permit 66400 is VERIFY, with pending activation and L-A1.

Development Forge logs confirm verify_point failed at 17:06:21.543 and confirm_activation at 17:07:08.125; the previous sanitized log only says PERMITGUARD_UNAVAILABLE, so it is not an exception-stack diagnosis. Matching input scenarios reproduce deterministically in service tests: equipment QR used for point verification is wrong, and V-3 used as activation equipment is wrong. EQ-1 is low-energy and permits the same actual authenticated worker/verifier to confirm. No second identity or impersonation is required. High-energy points still require two genuinely distinct named verifiers.

## Corrected invariants

- Verification expects **permitguard:V-3**. Activation expects the selected equipment QR, on this site **permitguard:register:10202:EQ-1**. Exact hints are shown, and activation uses an equipment selector instead of deriving equipment identity from arbitrary QR input.
- Challenges now live in a dedicated KV namespace: one latest record per hashed authenticated actor/issue pair. They do not commit operational site state, project properties or Realtime revisions. A token is bound to actor, issue, target, operational revision and 120-second expiry. Every successful operational CAS write invalidates the old token; replay/concurrent duplicate attempts cannot make another operational write. New challenges replace old challenges for the same pair; old aggregate challenges are not consulted.
- Wrong target/QR, expired/revision-changed/cross-actor token and missing at-equipment confirmation fail before operational commit. Specific safe errors replace generic rejection messages. Unknown SDK/network/commit responses still require readback: an uncertain transport failure cannot promise that a remote commit never happened and is never automatically retried.
- Internal isolation evidence and public work-start readiness are separate. VERIFY / PENDING always yields **NOT CLEARED**, transitionAllowed false, HUMAN_ACTIVATION_REQUIRED even with complete isolation checks. The read-only Rovo tool returns siteRevision, permitRevision, phase, scope, activationPending and releaseStatus. It never advances revision. ACTIVE work-start readiness is not release clearance; RELEASE checks include every shared-equipment lock.
- Synthetic Crew B's L-07/V-3 details are returned only to that synthetic record's authenticated owner. Unreadable real/other-issue locks remain aggregate-only. No removal of another person's real lock is enabled.
- Ordinary successful mutations render their authoritative returned state instead of issuing a redundant GET. QR actions use challenge + mutation (two calls, no intermediate refresh). Same/older revision invalidations are deduplicated; newer or unversioned invalidations still force readback. This is a call-count improvement, not a measured live timing claim.
- UI distinguishes current-state freshness from subscription connection, uses singular/plural personal-lock wording and friendly known names/localized audit times, and replaces Server processed with action-specific messages. Participant account IDs remain canonical underlying/form values; unknown other participant names are not invented.

## Local verification

77 backend/domain/integration tests plus 17 UI contract tests pass. New coverage includes exact owner failure inputs, no revision change on bad QR/challenge issuance, same-person low-energy activation, QR expiry/cross-actor/revision/replay/concurrent-write rejection, actual Rovo wiring read-only NOT CLEARED while pending, Crew B release blocking, sample-detail privacy, two-call UI activation, and newer/unversioned invalidation reconciliation. These are mocks/contracts, not post-release browser acceptance or live dedicated-KV acceptance.

## Resume the existing permit — do not reset it

1. Reload PGSAMPLE-1 and reopen View app actions → PermitGuard. Keep its existing sample records and permit. Confirm VERIFY and the pending activation.
2. If V-3 verification is absent, use **permitguard:V-3**, tick the procedure attestation and Record my verification once. Do not re-record an existing verification.
3. Before activation, ask **PermitGuard Demo LOTO** to check PGSAMPLE-1. Expect NOT CLEARED, VERIFY, activation pending, transitionAllowed false; a read must not advance site revision.
4. In the pending activation form select EQ-1. Enter **permitguard:register:10202:EQ-1**, tick the at-equipment procedure attestation and Confirm at equipment and activate. Expect ACTIVE and exactly one operational revision increment, not one increment for the challenge plus another for confirmation.
5. After activation, Rovo may report CLEARED for scope WORK_START only when isolation and named-human confirmation pass. Its releaseStatus must remain NOT CLEARED while locks remain. That is not release authorization.
6. Ensure Play Crew B is active (do not add again if L-07 is already shown). Begin release checks, remove your own **L-A1** only. Expect NOT CLEARED with the simulated Crew B L-07 / V-3 reason. Ask Rovo again: RELEASE / NOT CLEARED, transitionAllowed false.
7. The owning human may use Remove my simulated Crew B lock (explicit confirmation); this is sample-only. After it clears, named-human close-out can succeed. Never remove or impersonate a real other worker's lock.
8. Repeat a lock-count change in the other tab and note delivery timing; backend/UI tests do not substitute for that browser evidence.

## Fresh full-path test (only a genuinely new dedicated sample work item)

Do not try to create a second permit on 66400 or reset its open permit. On an owner-created new work item in the dedicated PGSAMPLE project, the six existing project equipment records remain reusable. Create Crew A with EQ-1 and your actual worker/verifier identity → Begin locking → Record L-A1 with a bounded photo → Begin verification → verify V-3 with point QR → request pending activation assigned to yourself → confirm with equipment QR → Rovo scoped status → Play Crew B → Begin release → remove only your own lock → observe Crew B blocking. Do not open that same equipment on a second permit while this existing permit is open: shared locks must still block release. Finish the existing permit first for an isolated fresh run.

## Outstanding boundaries

Development-only release was authorized: DEV badge stays until a separately authorized production deployment. No production deployment, Marketplace/Devpost, promotion, card or real-data operation. Duplicate Rovo agent cleanup remains blocked on identifying the stale agent in a signed-in administrative session: both available Atlassian browser tabs show login; no unidentified agent or app was deleted. Existing original agent key/name and action/MCP contracts are preserved.

## Release receipt — 20 November ~21:06 UTC

- Code **e34d2aeb0896b0b563a64b9d190dd9f8f0f09e0a** pushed before release; clean candidate.
- Validated **development 5.7.0** deployment succeeded with the full original Rovo agent retained. No fallback removal was needed and no manifest validation bypass used.
- Jira and Confluence upgrade checks each returned **Site is already at the latest version** for one-atlas-xitr.atlassian.net. Installation list confirms development major 5 / Up-to-date in both products.
- Final gates: **77 backend + 17 UI tests (94 total)**, connected build, diff checks and known-private-credential source/artifact scan passed. Local app.js SHA-256 **41406c473bd94c89811448cf44b6d99aeeca7dd65dfc45f7404a9f1fab8d6f7f**; HTML 532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0; CSS 571fcfec77153e860194be7c0ec1e7f9286d25ed730475c3bcc06c28c9332ba9.
- Deployment receipt/configuration checks do not prove byte-for-byte remote bundle readback or post-release browser/KV-runtime acceptance. Owner re-test remains required. No live permit/sample reset or synthetic lock change was made during this release.
- Challenge expiry is enforced logically; the dedicated namespace retains the latest record per actor/issue rather than claiming automatic physical TTL deletion. Replay authorization is prevented by expiry plus operational revision binding and final site CAS.
