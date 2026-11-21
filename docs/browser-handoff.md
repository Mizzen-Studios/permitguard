> Latest owner results and integrity check: [21 November ~13:05 UK](judge-evidence-2026-11-21.md). Native Rovo scoped reply and readable UI/admin passed; two same-name agents remain an explicit blocked cleanup. [Current test instructions](judge-test-instructions.md), [private recording script](demo-video-script.md).

> Current release: **development 5.12.0**, executable candidate `32efded`; Rovo **PermitGuard Judge** restored with full boundaries and both actions. [Current exact retest](rovo-restoration-2026-11-21.md). PGSAMPLE-2’s ACTIVE permit is preserved.

# Owner browser acceptance — 19 November 2026

Development app installed on https://one-atlas-xitr.atlassian.net in Jira and Confluence. Owner browser results at ~21:00 UK: PGSAMPLE-1 and issue panel rendered; Warn-only / FAIL_CLOSED and empty equipment were correct; no per-user consent prompt appeared; Rovo returned NOT CLEARED / NO_PERMIT. The sample loader was blocked by the prior site-admin permission bug. Remaining physical/device, Studio and Realtime acceptance is still unrun.

## First open

1. Sign in as the site administrator on the demo site.
2. Open https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-1 . Use the issue toolbar **View app actions → PermitGuard** (DEV badge). Accept the app's per-user access consent if Jira asks.
3. The connected clipboard should show Warn-only / FAIL_CLOSED and no permit or equipment yet. If it cannot confirm state, use Refresh; do not treat a blank/stale view as clearance.
4. For a server-verified Jira site administrator OR project administrator, **Project administration** is now expanded directly in the empty issue panel, before the planning form. **Load a dedicated sample plant** is also expanded. Read and tick the confirmation, then Load confirmed sample. This creates six built-in sample equipment records and enables Enforce ONLY in PGSAMPLE. The provisioning script did not do this for you. Do not enable real-project gates as part of this test.

Secondary entry points: `jira:adminPage` remains declared and `jira:projectSettingsPage` is now declared (it was absent before this fix). Both use the dedicated administration view with scopes/uninstall guidance; actual permit/project configuration lives in the issue panel, not an issue-less settings page. Do not rely on `/jira/settings/apps` or the previously supplied deep link: the owner observed 404. Business-space sidebar placement and page rendering still need signed-in UI verification; manifest validation/deployment is not rendering proof. Own-rule recovery remains available from issue-panel administration with server-verified site-admin permission.

## One-person judge path

- In Plan select the first low-energy sample equipment (EQ-1 / point V-3), Crew A; leave your authenticated account ID as worker and named verifier. Create permit, then Begin locking.
- Record your lock (for example L-01) and a readable photo. In Enforce, an absent photo must be refused. Test camera permission on the actual tablet/browser; a file picker or local contract test is not camera proof.
- Begin verification. Expand V-3. QR text is **permitguard:V-3**. Try native camera/image QR decoding if supported; manual entry is explicitly a human assertion, not hardware/presence proof. Tick the at-equipment procedure confirmation and record your verification.
- Request human activation assigned to yourself. The permit must remain VERIFY with PENDING activation, not Active.
- For activation, the equipment QR is permitguard: followed by the exact equipment ID displayed in the plan (sample first item: **permitguard:register:10202:EQ-1** on this demo site). Confirm at equipment; only the assigned verifier can activate.
- In the lock rail's Judge sample roleplay, click **Play Crew B**, confirm the synthetic-only change. Begin release checks and remove your own L-01. Release must remain NOT CLEARED with simulated Crew B L-07 still on V-3. Close must not succeed.
- Click **Remove my simulated Crew B lock**, confirm. Release can now clear, and the named verifier can close. Synthetic roleplay is not principal impersonation and cannot remove real workers' locks.

The under-two-minute target applies to reproducing Crew B's blocked release after initial setup. It has not been timed in the owner's browser. For high-energy tests, choose the high-energy sample and use TWO genuinely different active, assignable users; do not impersonate a second person.

## Assets path / fallback

Use a separate new work item/project before creating a permit. Import is blocked while project permits are open. Under Project administration, **Import demo Assets equipment** reads the approved PGTEST schema (one synthetic Equipment/Isolation pair). Other judge sites use **Connect this site's Assets types** with their own workspace UUID, schema ID, Equipment type ID and Isolation points type ID. Types must be exactly named Equipment and Isolation points and belong to the selected schema.

Required point attributes: Equipment key text matching the equipment object's Assets key, Energy type text, Lock state text, High energy boolean. Access denial, malformed metadata, changed configuration or truncated results must not create CLEARED. A built-in register JSON form is the explicit fallback. It is not automatic stale-Assets substitution.

## Two-browser Realtime

Open the SAME work item / PermitGuard panel in two supported browsers. Record a sample lock in one; the other should invalidate and fetch current state. Confirm both the displayed lock count and state revision update without manual Refresh. Also test network loss: stale actions should block. Default channels are module/issue-scoped, not a cross-issue public broadcast. Record this as NOT_RUN until observed; a subscription message alone is insufficient.

## Rovo, Studio and external MCP

- In Rovo Chat choose **PermitGuard Demo LOTO**. The current installed agent has been renamed to distinguish it from the other reported PermitGuard entry; the unidentified other agent was not deleted. Ask it to check PGSAMPLE-1, then request activation with a named verifier only when the permit is in Verify. It must call deterministic tools, never invent clearance or activate work.
- In **Rovo Studio**, create/select a custom agent and add the installed PermitGuard check_readiness and request_activation tools. Repeat the same checks. Tool selection visibility and execution remain unverified until you try them.
- For an external planner, a site/org admin must enable the app's tools in **Connected apps**. Use Atlassian OAuth consent and the skill.md contract. Request_activation only proposes PENDING; there is deliberately no agent confirmation endpoint.
- During Release with seeded Crew B, check_readiness should return NOT CLEARED. A planning agent may propose rescheduling through its own authorized scheduler, never remove another crew's lock.

## Workflow recovery

The unassigned workflow **PermitGuard UNASSIGNED API recovery fixture** contains two already-disabled app validators. Live app-identity list and disable/readback passed. Delete returned HTTP 401 (scope does not match), so automatic Forge deletion is unresolved. No project workflow was changed. Actual Jira transition execution remains unverified. Do not attach gates to operational workflows for a demonstration. Before uninstall, list/disable/read back, then manually remove app rules in Jira workflow settings and publish changes.

## Confluence and JQL

No archive destination is selected. Choose a restricted space as administrator; currently every permission assignment must be for an explicitly allowlisted named user. Group, role and anonymous permissions are refused. In issue-panel administration enter its numeric space ID and approved user account IDs, tick confirmation and save. Close/retry monthly archive publication only after restrictions validate. A non-admin close remains stored in Forge even if publication needs an administrator retry.

In Confluence insert the **PermitGuard lock-board snapshot** macro, enter an authorized Jira work item key and Load authorized snapshot. It must print Snapshot at <time>, never imply live clearance. Snapshot is a derived observation, not workflow authority. Page publication and macro rendering have not been live-accepted.

After creating a permit, test JQL **permitguardState = "ACTIVE"** and Automation reading issue.properties["permitguard.snapshot"]. Indexing/Automation outcomes have not been live-accepted. Dry-run reports the open work item's current start/release app-state decisions plus the nonauthoritative projection, not a site-wide report.

## Re-test after the 21:00 blocker fix

Reload the Jira work item (not only the in-panel Refresh) so the new Custom UI bundle loads. The account label should read **Olly**, not an account ID. While equipment is empty, sample setup is expanded above Plan. Tick confirmation and click **Load confirmed sample** once; expect six equipment and Enforce only in PGSAMPLE. No loader invocation was made during this fix, preserving the first-run test. Continue the one-person judge path above.

The UI now says **Live updates connected** only when subscribed; that is connection state, not evidence of two-browser acceptance. Test-status notes are documentation-only. Initial authorization now fetches issue, permissions and display name concurrently; there is no artificial skeleton timer. Forge/Jira cold-start duration remains unmeasured after deployment.

## 20 November first-create re-test

Owner confirmed the 5.3.0 sample loader works, six equipment records exist, Enforce / FAIL_CLOSED is active, and initial usable panel time was about five seconds. First permit creation then failed due to the assignable-person numeric-ID/issue-key adapter bug, now corrected; see [diagnosis and evidence](create-permit-fix-2026-11-20.md).

Reload the work item for the updated bundle. **Skip sample loading if EQ-1..EQ-6 are already present.** Select EQ-1 and Crew A; keep yourself as worker and verifier. Create permit once: expect PLAN and site revision 0 → 1 if no intervening mutation. Then continue the existing Lock / Verify / activation / Crew B / Rovo path. Save-time invalidations are now reconciled automatically after success; uncertain mutation failures still require readback and never auto-resubmit.

**Release hold resolved:** validated development deployment **5.6.0** includes the first-create and save-invalidation fixes, with the full original safety prompt and original agent key. The display name is now ASCII **PermitGuard Demo LOTO**. Experiments first deployed neutral/ASCII as 5.4.0, role rules as 5.5.0, then the full prompt as 5.6.0. See [per-attempt results](rovo-deploy-experiments-2026-11-20.md). Reload the issue before re-testing; retain the existing six sample records rather than loading them again. Actual first-create/lock/verify/activation/release/Realtime browser acceptance is still yours, not inferred from deployment.

## Latest re-test: activation and readiness correction

Use [the preserved-permit steps and exact QR formats](activation-readiness-fix-2026-11-20.md). Owner already passed first-create, photo upload and second-tab Realtime on 5.6.0. Do not recreate/reset permit 66400; resume pending activation with the **equipment** QR `permitguard:register:10202:EQ-1`, not point QR `permitguard:V-3`. Before activation Rovo must be NOT CLEARED; after Begin release and removing your own L-A1 it must still be NOT CLEARED while synthetic L-07 remains. Deployment receipt/version is recorded in that evidence document when available.

## Latest polish re-test

**PermitGuard Live Judge 2026** is the proposed restored name, NOT a live agent in the 5.8.0 fallback. See [scoped wording, automatic loading, filled Saving fields and stale-agent admin handoff](scope-loading-polish-2026-11-20.md). The current RELEASE permit is preserved; finish its synthetic-only L-07/close path before a fresh EQ-1 test.

Fresh synthetic work item: [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2), provisioned empty (no permit/locks). Finish PGSAMPLE-1’s sample-only L-07/close path before reusing EQ-1 there.

## 21 November current re-test and panel opening

The 5.8.0 agent-free fallback is superseded by **5.12.0**, agent **PermitGuard Judge**. No stale agent cleanup is needed; owner found zero remaining agents before restoration. Open any fresh issue using **View app actions → PermitGuard**; default inline visibility is not promised. Admin optional panel-menu **Show for all work items** is documented by Atlassian. Use [the preserved ACTIVE-permit, scoped Rovo, readable admin and elapsed-save re-test](rovo-restoration-2026-11-21.md).
