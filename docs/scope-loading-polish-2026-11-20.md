# Scoped Rovo wording and loading polish — 20 November 2026

Owner's 5.7.0 browser results: pre-activation NOT CLEARED / HUMAN_ACTIVATION_REQUIRED, same-person low-energy activation revision 10→11, release after own L-A1 removal blocked by synthetic L-07, close disabled, second tab about 0.4 seconds behind, Rovo release NOT CLEARED. Current owner-reported 66400 revision 13 / RELEASE / L-07 only is preserved; no app state reset.

## Fixes

1. Tool response has mandatoryNotice, displayStatus and a plain message. CLEARED work-start message explicitly says **CLEARED for WORK_START only. This is not release clearance.** Original agent prompt is retained with additional instruction to start with that message verbatim and explicitly repeat scope, explain codes in words, and avoid crew @mentions/possessive punctuation. Generative text compliance still requires the owner's live re-test.
2. Live agent display name **PermitGuard Live Judge 2026**; original key permitguard-agent, app UUID and action/MCP contracts retained. This distinguishes it from the two old PermitGuard Demo LOTO picker entries without deleting unidentified agents.
3. Read-only bootstrap awaits bridge view.getContext before loading. Up to three bounded initial read attempts recover transient bridge/context failure; a delayed issue context is not mistaken for an admin view. No client context is used as server authority, and mutations are never retried. refresh promise assignment now handles synchronous bridge failure without wedging future Refresh. Initial UI honestly says Loading authenticated state, not Open the app elsewhere / disconnected. These fixes reproduce initial failure modes in tests; the owner's precise first-load runtime failure was not captured as a live stack trace.
4. Administration uses its dedicated loaded view and skips issue-scoped Realtime subscription. No missing-stream warnings or stale permit labels belong on that page.
5. While saving, existing form DOM nodes are retained and disabled; QR text, checked attestation, selected equipment and file input remain intact. Successful state changes can then replace the form. No caching of photos/QR/permit state in browser storage.
6. Authorized synthetic lock reason reads **Simulated Crew B lock L-07 remains on isolation point V-3.** Missing-permit/activation reasons have plain explanations; technical reason codes remain machine-readable. transitionAllowed remains in the tool output but the agent is told not to surface it unless requested; it is advisory, not work/energization authority.

## Verification

77 backend/integration + 22 UI contract tests (99) passed, build/diff checks passed. Covers explicit ACTIVE scope notice, plain release wording, context-first automatic loading, bounded read retries, recovery from synchronous first invoke failure, delayed issue/admin discrimination, no admin subscription, and preserving filled actual DOM nodes during Saving. Local tests do not prove post-deploy browser behavior, indexed Rovo names or generated-answer wording.

## Admin handoff for stale agent entries

Ask the site/Rovo administrator to inspect each old **PermitGuard Demo LOTO** entry in Rovo Studio's agent details and identify its creator/source app before deleting anything. Archive/delete only a confirmed stale custom agent if that UI offers it. If an entry is app-managed, identify its owning app; do not uninstall the current app **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**. If both old entries belong to that current app, request stale-search/index cleanup from Atlassian rather than destroying the live installation. Exact stale ownership remains unverified because available managed Atlassian browser sessions require login. The new distinct live name is the immediate usable workaround.

## Re-test

Hard-reload Jira, close/reopen PermitGuard; do not click Refresh. Expect automatic authenticated state loading. Hard-reload the Jira PermitGuard admin page; expect Administration loaded, without subscription/disconnected labels.

For a fresh low-energy test, finish existing PGSAMPLE-1 through the owner's sample-only Remove my simulated Crew B lock confirmation and Close permit before reusing EQ-1. Do not remove real workers' locks or reset storage. Then open a new dedicated synthetic work item, create an EQ-1 permit as yourself, apply L-A1 with photo, begin Verify, record point QR **permitguard:V-3**, request human activation, then confirm selected EQ-1 with equipment QR **permitguard:register:10202:EQ-1** and the checked procedure attestation. During Saving, both fields must remain visibly filled/checked and disabled. Ask **PermitGuard Live Judge 2026** before and after activation: pending is NOT CLEARED with plain words; ACTIVE must explicitly say WORK_START only / not release clearance. Play Crew B, begin release, remove only your own L-A1; expect the plain simulated L-07 reason and Rovo release NOT CLEARED. Compare second-tab updates.

Development only. No card, external runtime, production deployment, publication or real operational data. DEV badge remains intentional.
