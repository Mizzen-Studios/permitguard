# Canonical readiness, build footer and preview diagnosis — 5.14.0

## Owner evidence, 22 November ~09:05 UK / 5.13.0

- PASS: Release NOT CLEARED strip visible at the top without scrolling; exactly one PermitGuard Judge.
- Timing: iframe appeared about **3.8 s** after a hard reload, then Loading authenticated state; live state arrived about **1 s** later, estimated **5–6 s total**. This is one owner observation, not a controlled benchmark, an app-only timing or an SLA.
- Historical preview was not noticed. Absence of a visual observation does not establish that it failed, was rejected or never briefly rendered.
- FAIL: new-chat **Is PGSAMPLE-2 cleared?** produced the correct WORK_START-only/no-release boundary and then paraphrased it again. The prior prompt-only change was insufficient; do not mark single-caveat wording accepted.
- Missing version footer prevented easy build identification.

## Implemented and deployed

Source **99c1ebc8d855ffcd6317432e629c61d3d2e1a47c**, normal development deployment **5.14.0**, standalone Forge lint **No issues found**, deployment **Manifest is valid / DONE**, no verification bypass. Receipt correlation IDs: b0ba119d9712437896fce5019c7787ab, 80ba9e0b5d104369bac1f11494c96092, bc5a26370c094fea8f1b8c08b18460e1. No production install/deploy or submission.

### One display message, not competing caveats

The readiness service previously returned the same boundary in **message**, **mandatoryNotice** and **displayStatus**. That redundancy was a source of paraphrasable text; it does not establish the internal model's cause with certainty. The redundant display fields are now removed. Machine status/scope/reasons, revision and activation flags remain; no safety or permission gate is weakened.

**message** is now the complete canonical human response, including the scope/authority boundary once, applicable blockers, phase, release status and site-procedure reminder. For the current ACTIVE sample its expected form is:

> CLEARED for WORK_START only. This is not release clearance. Phase: ACTIVE. Release Status: NOT CLEARED. Follow the site procedure.

For NOT CLEARED, blockers remain human-readable. RELEASE uses its own not-permission-to-energize boundary. The same action key/app identity is retained. The agent prompt and public skill contract say to output this message once with no introduction, paraphrase, repeated caveat, separate Scope field or conclusion. An explanation requested explicitly must use tool facts and not restate the boundary. Rovo cannot confirm or activate; PENDING remains assigned-human-only.

Local service tests verify the canonical message contains the caveat once and the redundant fields are absent. Remote metadata matches the full prompt and unchanged actions. **Actual generated native prose is still an owner acceptance test**, not guaranteed by the template or metadata.

### Why the preview was not noticed

An independent read of the real PGSAMPLE-2 property matched the validator shape (schema 1, numeric string permit ID, ACTIVE, permit revision 6, one lock, valid time, authoritative:false). Therefore no confirmed stored-data mismatch was found. With live state arriving about a second after the frame, a slower property read may simply lose the race; the old UI did not retain enough information to distinguish that from a failed/rejected read. We cannot infer the exact cause of the reported run.

The footer now has **Startup details** recording snapshot response arrival, first preview-render time (or not recorded), first live-state time and a plain lifecycle status: waiting/requesting, unavailable HTTP status, rejected metadata, rendered, or arrived after live/connection attempts. Times start at panel-code execution, not Jira-page navigation. No telemetry is sent or persisted. A late property callback updates only the footer, not form nodes/QR/photo controls. If preview rendered briefly, that fact/time remains visible after live state.

The direct Jira request also supports a native key-only issue context when a numeric ID is absent. This is resilience, not a claim that key-only context caused the owner observation. Numeric-context mismatches still fail validation; current-user issue access controls the key route. All preview data is explicitly historical/untrusted, in memory only, never expectedRevision, positive clearance or actionable state. Failed live reads leave operations disabled. We do not delay live state or force a preview flash just to make it observable.

### Small, truthful version footer

Every normal/admin/snapshot/failure render has a compact footer. The backend reads **getAppContext().appVersion** from the real Forge invocation and exposes only version/environment, not invocation/account/installation identifiers. After live confirmation the footer should identify **PermitGuard 5.14.0** (or the platform's equivalent major/minor format). It also always shows **UI 99c1ebc8d855**, baked from the clean source commit; while connecting, the Forge version is honestly pending. A worktree build is marked worktree rather than falsely claiming clean source.

SDK/reference checked: https://developer.atlassian.com/platform/forge/runtime-reference/app-context-api/ . Bootstrap tests cover the real installed SDK and safe missing-context fallback. The deployed footer's appearance/version still needs owner browser acceptance.

## Verification and data boundaries

**82 backend/integration/bootstrap + 39 UI + 3 checker = 124 passing**, build, normal lint, diff and known-private-credential scans. Regressions cover canonical boundary/count, runtime fallback, source/footer version escaping, all footer render paths, preview paint/race/denial/key-only context and late callbacks without whole-form rerender. Existing wrong/replay/cross-actor QR, stale writes, personal-lock blocking and save-input contracts stay intact.

Original Jira-only installation **35a88eb5-064f-489a-8a92-9a65a87a7f2a** remains Up-to-date; one declared agent with full prompt/actions matching server metadata. This is not a fresh UI picker observation. Post-deploy [read-only check](evidence/2026-11-22-canonical-integrity.json): assignee matches owner, original description and derived snapshot unchanged: ACTIVE, permit rev6, one lock, work-start clear/release blocked. Last owner-reported global site revision is 22, a distinct counter. No reset/repair or raw Forge CES read/write was performed.

Local artifact hashes (not remote byte readback): app.js **ddbd1b8a60ba4f5e2e1061e6a030b99005b19a571250cbc51a888f372902aa2f**; index.html **532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0**; styles.css **568a6fceb6fd010b42cf41caa6c577275e2cb5960c3d47b89bd836426a70f668**.

## Exact next retest — no sample mutation required

1. Hard-reload PGSAMPLE-2 without clearing cookies/Devpost sessions. At the footer, confirm Forge **5.14.0** / UI **99c1ebc8d855** after live state. Pending version before connection is expected. Report any version mismatch rather than assuming the new resource loaded.
2. Note frame and live times from page reload separately. Once loaded, open **Startup details** and copy its plain timing/status line. It answers whether preview actually rendered or lost the race; not recorded is legitimate if live won. Do not expect or require preview before a faster live response.
3. Confirm top release blocker remains above the fold, ACTIVE / one L-A1 / latest revision and exactly one agent. No read should advance operational revision.
4. In a **new** PermitGuard Judge chat ask **Is PGSAMPLE-2 cleared?** Expect the canonical message above, the scope caveat once and release NOT CLEARED, with no follow-up paraphrase. Test the explicit scope/release question too if desired. If still duplicated, preserve the full raw reply; do not edit it into a pass or weaken the boundary.

[Video script](demo-video-script.md) includes real build identification, optional-preview handling and an unfilled private recording log. [Devpost draft](devpost-draft.md) records the measured 5.13.0 result and failed prose acceptance honestly. No recording/export/upload, Devpost save/submission, listing or production deploy was performed; [production plan](production-deploy-plan.md) remains unexecuted and separately gated.
