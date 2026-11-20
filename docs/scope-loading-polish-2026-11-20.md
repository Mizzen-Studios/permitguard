> **Current status: development 5.8.0 agent-free fallback.** UI/tool fixes deployed; full-agent/generated-answer naming and wording re-test is blocked pending restoration or a separately configured custom agent.

# Scoped Rovo wording and loading polish — 20 November 2026

Owner's 5.7.0 browser results: pre-activation NOT CLEARED / HUMAN_ACTIVATION_REQUIRED, same-person low-energy activation revision 10→11, release after own L-A1 removal blocked by synthetic L-07, close disabled, second tab about 0.4 seconds behind, Rovo release NOT CLEARED. Current owner-reported 66400 revision 13 / RELEASE / L-07 only is preserved; no app state reset.

## Fixes

1. Tool response has mandatoryNotice, displayStatus and a plain message. CLEARED work-start message explicitly says **CLEARED for WORK_START only. This is not release clearance.** Original agent prompt is retained with additional instruction to start with that message verbatim and explicitly repeat scope, explain codes in words, and avoid crew @mentions/possessive punctuation. Generative text compliance still requires the owner's live re-test.
2. Prepared restored-agent display name **PermitGuard Live Judge 2026** (not live in the fallback); original key permitguard-agent, app UUID and action/MCP contracts retained. This distinguishes it from the two old PermitGuard Demo LOTO picker entries without deleting unidentified agents.
3. Read-only bootstrap awaits bridge view.getContext before loading. Up to three bounded initial read attempts recover transient bridge/context failure; a delayed issue context is not mistaken for an admin view. No client context is used as server authority, and mutations are never retried. refresh promise assignment now handles synchronous bridge failure without wedging future Refresh. Initial UI honestly says Loading authenticated state, not Open the app elsewhere / disconnected. These fixes reproduce initial failure modes in tests; the owner's precise first-load runtime failure was not captured as a live stack trace.
4. Administration uses its dedicated loaded view and skips issue-scoped Realtime subscription. No missing-stream warnings or stale permit labels belong on that page.
5. While saving, existing form DOM nodes are retained and disabled; QR text, checked attestation, selected equipment and file input remain intact. Successful state changes can then replace the form. No caching of photos/QR/permit state in browser storage.
6. Authorized synthetic lock reason reads **Simulated Crew B lock L-07 remains on isolation point V-3.** Missing-permit/activation reasons have plain explanations; technical reason codes remain machine-readable. transitionAllowed remains in the tool output but the agent is told not to surface it unless requested; it is advisory, not work/energization authority.

## Verification

77 backend/integration + 23 UI contract tests (100) passed, build/diff checks passed. Covers explicit ACTIVE scope notice, plain release wording, context-first automatic loading, bounded read retries, recovery from synchronous first invoke failure, delayed issue/admin discrimination, no admin subscription, and preserving filled actual DOM nodes during Saving. Local tests do not prove post-deploy browser behavior, indexed Rovo names or generated-answer wording.

## Admin handoff for stale agent entries

Ask the site/Rovo administrator to inspect each old **PermitGuard Demo LOTO** entry in Rovo Studio's agent details and identify its creator/source app before deleting anything. Archive/delete only a confirmed stale custom agent if that UI offers it. If an entry is app-managed, identify its owning app; do not uninstall the current app **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**. If both old entries belong to that current app, request stale-search/index cleanup from Atlassian rather than destroying the live installation. Exact stale ownership remains unverified because available managed Atlassian browser sessions require login. The new distinct live name is the immediate usable workaround.

## Re-test

Hard-reload Jira, close/reopen PermitGuard; do not click Refresh. Expect automatic authenticated state loading. Hard-reload the Jira PermitGuard admin page; expect Administration loaded, without subscription/disconnected labels.

For a fresh low-energy test, finish existing PGSAMPLE-1 through the owner's sample-only Remove my simulated Crew B lock confirmation and Close permit before reusing EQ-1. Do not remove real workers' locks or reset storage. Then open a new dedicated synthetic work item, create an EQ-1 permit as yourself, apply L-A1 with photo, begin Verify, record point QR **permitguard:V-3**, request human activation, then confirm selected EQ-1 with equipment QR **permitguard:register:10202:EQ-1** and the checked procedure attestation. During Saving, both fields must remain visibly filled/checked and disabled. Ask **PermitGuard Live Judge 2026** before and after activation: pending is NOT CLEARED with plain words; ACTIVE must explicitly say WORK_START only / not release clearance. Play Crew B, begin release, remove only your own L-A1; expect the plain simulated L-07 reason and Rovo release NOT CLEARED. Compare second-tab updates.

Development only. No card, external runtime, production deployment, publication or real operational data. DEV badge remains intentional.

## Deployment attempts

Inline prompt/name candidate 5578e4a failed manifest lint with Agent not allowed. An unchanged standalone-lint retry also failed definitively; no deployment was created. Next attempt uses the official file-backed syntax prompt: resource:agent-resource;prompts/permitguard.txt and declared resource/agent directory, keeping the full same prompt, distinct display name, original key and actions. No validation bypass.

Provisioned one empty synthetic Jira work item **PGSAMPLE-2** (HTTP 201) after checking project 10202 / PGSAMPLE and its dedicated sample marker, an exact-summary duplicate search, and Task type. No app permit, lock, policy or PGSAMPLE-1 record was written. Finish the existing L-07/close sample path before reusing EQ-1 on this new work item.

## Authorized agent fallback

File-backed full prompt attempt 7e89558 also failed at manifest lint with Agent not allowed. Using the owner-authorized fallback: remove ONLY rovo:agent from the development manifest, preserving both action modules, handlers, rovo:mcp, app UUID, scopes and the full prompt resource. The proposed distinct agent name and prompt were NOT deployed and are not claimed live. Restore only the agent module from 7e89558 when validation accepts it, not an old entire source tree. No validation bypass.

Also guarded a QR-preparation race: an external state update during the read-only challenge call causes readback and a specific no-confirmation-submitted message; it never silently drops submission or leaves Saving stuck, and never resubmits a mutation.

## Release receipt and next acceptance

Validated development **5.8.0** deployed from executable candidate **bc6ecb4fdfa502238ed81da342b1e312e559f9d7**, preserving actions/MCP and removing only the agent declaration after both inline and file-backed agent attempts failed. Full prompt remains in `resource/agent/prompts/permitguard.txt`; original proposed module is in commit 7e89558 for targeted restoration, not whole-tree rollback. No validation bypass or production deployment.

Final local gates: **77 backend + 23 UI contract tests (100)**, build, diff and known-private-credential source/artifact scans passed. The form-node preservation test uses a UI harness, not physical/live browser proof. Final app.js SHA-256 **0d7ed1446ec3c34222856f918bf183d095d29b3533418c8f38bed3d2030357be**; HTML 532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0; CSS 571fcfec77153e860194be7c0ec1e7f9286d25ed730475c3bcc06c28c9332ba9. The deployment receipt is not remote byte-for-byte bundle readback.

Re-test the UI now: hard-reload PGSAMPLE-1 (no Refresh click), confirm RELEASE/revision13-or-later and plain synthetic L-07 blocker; hard-reload administration and confirm no missing-subscription warning. Finish only your own synthetic L-07 and close. Then use [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2) for a fresh EQ-1 photo/verify/activation flow and inspect filled/disabled QR/checkbox during Saving. No app permit/lock records were changed by provisioning/release.

Rovo admin handoff: inspect creator/source-app details of both old picker entries and delete/archive only a confirmed stale custom agent; ask Atlassian to clean stale indexed app-backed entries if they both belong to the current app. Do not uninstall the current app. If Studio exposes these installed action tools, an authorized admin may configure a distinct custom agent **PermitGuard Live Judge 2026**, attach `check_readiness` and `request_activation`, and use the saved prompt file; this Studio configuration is not performed or verified here. Then test that ACTIVE output explicitly says **WORK_START only; not release clearance**, pending output explains the human confirmation requirement in words, and RELEASE gives the plain L-07/V-3 reason without @mention. Otherwise this generated-answer acceptance remains blocked until the Forge agent can be restored through normal validation.

Final installation verification: Jira and Confluence each returned **Site is already at the latest version** in development on one-atlas-xitr.atlassian.net. Server-reported major-5 metadata confirms `rovo:agent` absent and both action schemas plus `rovo:mcp` retained. This verifies deployment configuration, not end-to-end MCP/Studio execution.
