# Release first; distinguish the startup clocks — 5.15.0

## Owner report, 22 November 17:02 UTC

5.14.0 PASS: footer 5.14.0 / UI 99c1ebc8d855, one PermitGuard Judge, native caveat once and release NOT CLEARED. Remaining ambiguity: the response began CLEARED and read like yes. Stopwatch from navigation: **about 17 s to the reported preview and 30 s to live**; panel Startup details said **4.0 s**.

Those clocks have different origins. The panel counter began after app imports and excluded previous Jira/iframe/resource loading. **4.0 s is not total startup.** The earlier ~5–6 s observation must not be selected as proof of consistently fast loading. The latest 17/30-second navigation report is the governing evidence until another measured run. The exact source of the missing interval is not established; do not assert it was all Atlassian host delay. In the next run distinguish a static loading shell from an explicitly labelled historical preview.

## Implemented and deployed

Source **4e3335fb30f98f47ebb8442577d1f5b63dd142f7**, normal development deployment **5.15.0**. Forge lint No issues found; normal deploy passed Manifest is valid and returned success. Correlation IDs: f45a430b13ea42758cbf7bdf6491ae7c, c25a27a4ddd54031b14b25d75385401c, d7244c3cbe834c238c44bc5458c259f4. No production action, verification bypass, card, paid resource, publication or submission.

### Unambiguous first words

Current ACTIVE sample canonical reply:

> Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE. Follow the site procedure.

The machine status remains scoped to WORK_START and is not changed into a false negative to manipulate presentation. Human prose leads with the separate release result, never a bare CLEARED. One caveat remains; the agent still copies only message, and no repeated display fields were reintroduced. The unchanged action keys cannot confirm activation or remove other people's locks. **Actual new word order still needs native browser acceptance.**

### Removed avoidable app-side dependencies

1. get_state / check_readiness / list_equipment now omit the cosmetic /myself profile request. Authorization still reads the current issue and current permissions asUser: **two Jira authorization requests instead of three**, no permission cache or asApp fallback. Read display name falls back to that same actor's stored lock name or You; a name is not identity authority. Writes still fetch profile as before, and all human IDs/permissions/QR/register/CAS checks remain.
2. A valid server-authorized live issue DTO no longer waits for frontend view.getContext. Context still starts in parallel for optional preview and is still awaited when rejecting an early administration fallback. A failed/hanging client context cannot hold up an otherwise authorized issue result. This does not skip server issue authorization.
3. index.html contains a non-actionable **Release unconfirmed** loading shell before bridge evaluation and preloads the same-origin app.js. It is not permit data, a cached decision, or the historical preview. It cannot bypass the host's frame display or asset loading.

The public Forge SDK surface is unchanged; unsupported internal SDK imports/vendor rewrites were not used to shrink the bundle. Local app.js is **130753 bytes**, versus **129976** on 5.14.0: the timing labels make it slightly larger, not smaller. We claim removed requests/dependencies, **not a measured end-to-end speedup**. The live response is never held to manufacture a preview flash.

### Three explicit clock scopes

- **Jira navigation stopwatch:** must be measured externally by the tester. Cross-origin iframe code does not read/invent the parent's navigation origin.
- **Iframe document navigation:** performance.timeOrigin, if available, includes that document's loading before panel code. It is still not the parent Jira clock and may exclude host waiting to create/navigate the frame. Missing data is unavailable, not zero.
- **Panel-code execution:** starts after imports, useful for context/snapshot/live intervals only. Footer labels these explicitly. First state-request round trip records the first attempt even on failure; it is not a successful-live or full-navigation metric.

Startup details prominently says **Jira navigation → live: not measured here**. A synthetic regression demonstrates that panel 4 s and iframe 30 s can coexist; it is not attribution of the owner's particular run. Full-page latency remains unmeasured for 5.15.0.

## Verification

**85 backend/integration/bootstrap + 43 UI + 3 checker = 131 passing**, build/diff/normal lint and credential scan pass. New regressions prove profile-free reads still require issue/permissions and fail closed on 403; mutation auth still requests profile; valid live state can finish with client context hanging; early admin fallback still retries; iframe/panel/unknown navigation labels are distinct; static HTML has no action controls. Existing personal-lock, human QR, replay/cross-actor, Assets freshness and revision tests remain intact.

Original Jira-only install **35a88eb5-064f-489a-8a92-9a65a87a7f2a** is Up-to-date. Remote single agent/full prompt/actions match source. The [post-deploy read-only check](evidence/2026-11-22-release-first-integrity.json) matches the prior derived sample snapshot exactly: ACTIVE, permit revision 6, one lock, start cleared/release not cleared, original description and owner assignee intact. Global site revision 22 is the last owner observation and a different counter. No reset, repair, raw Forge CES read or operational write occurred.

Local hashes (not remote byte readback): app.js **a9eb65c58f313b1bb63c648ed794f413e4abbbdcdc65c30b831e21a7cb322f4f**; index.html **d36fbeedcab05e098fa2c365daec5152d2cac53c4a541013a094647de92ad719**; styles.css **568a6fceb6fd010b42cf41caa6c577275e2cb5960c3d47b89bd836426a70f668**.

## Exact retest — no permit changes needed

1. Hard-reload PGSAMPLE-2. Confirm footer Forge **5.15.0** / UI **4e3335fb30f9**, one agent and the same active permit/lock. Preserve the Devpost session/cookies.
2. Start the stopwatch at Jira navigation. Separately note **unconfirmed loading shell**, **historical preview if it actually renders**, and **live authorized state**. Do not call loading chrome a permit preview. Keep the real waits in evidence.
3. Copy Startup details: iframe-document → panel-code; iframe-document → live; panel-only live; first state request duration; preview status. Keep these beside the navigation stopwatch, never substitute one for another. If values are unavailable, report that rather than inventing missing origins.
4. New native chat: **Is PGSAMPLE-2 cleared?** Expect the release-first message above, a single caveat, release NOT CLEARED and no unqualified yes/paraphrase. Check the top in-panel release blocker remains visible.

[Video script](demo-video-script.md) and [Devpost draft](devpost-draft.md) now disclose the latest navigation measurement and its different clock scope. No new speed claim, recording/export/upload or submission is made. [Production plan](production-deploy-plan.md) remains unexecuted.
