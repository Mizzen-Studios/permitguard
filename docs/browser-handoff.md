# Owner browser acceptance — 19 November 2026

Development app installed on https://one-atlas-xitr.atlassian.net in Jira and Confluence. Browser-only acceptance was intentionally NOT run at the owner's request. Installation and CLI/API success do not prove rendering, user consent, device access, Studio or Realtime.

## First open

1. Sign in as the site administrator on the demo site.
2. Open https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-1 . From the issue's Apps / app-panel menu, choose **PermitGuard**. Accept the app's per-user access consent if Jira asks.
3. The connected clipboard should show Warn-only / FAIL_CLOSED and no permit or equipment yet. If it cannot confirm state, use Refresh; do not treat a blank/stale view as clearance.
4. Under **Project administration → Load a dedicated sample plant**, read and tick the confirmation, then Load confirmed sample. This creates six built-in sample equipment records and enables Enforce ONLY in PGSAMPLE. The provisioning script did not do this for you. Do not enable real-project gates as part of this test.

Admin page: https://one-atlas-xitr.atlassian.net/jira/settings/apps/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90/0961c77d-9025-4a19-bf3e-10a64e3cb7ff . It lists declared scopes and uninstall footprint. Own-rule recovery is also exposed in issue-panel administration; server requires site-admin permission.

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

- In Rovo Chat choose **PermitGuard**. Ask it to check PGSAMPLE-1, then request activation with a named verifier only when the permit is in Verify. It must call deterministic tools, never invent clearance or activate work.
- In **Rovo Studio**, create/select a custom agent and add the installed PermitGuard check_readiness and request_activation tools. Repeat the same checks. Tool selection visibility and execution remain unverified until you try them.
- For an external planner, a site/org admin must enable the app's tools in **Connected apps**. Use Atlassian OAuth consent and the skill.md contract. Request_activation only proposes PENDING; there is deliberately no agent confirmation endpoint.
- During Release with seeded Crew B, check_readiness should return NOT CLEARED. A planning agent may propose rescheduling through its own authorized scheduler, never remove another crew's lock.

## Workflow recovery

The unassigned workflow **PermitGuard UNASSIGNED API recovery fixture** contains two already-disabled app validators. Live app-identity list and disable/readback passed. Delete returned HTTP 401 (scope does not match), so automatic Forge deletion is unresolved. No project workflow was changed. Actual Jira transition execution remains unverified. Do not attach gates to operational workflows for a demonstration. Before uninstall, list/disable/read back, then manually remove app rules in Jira workflow settings and publish changes.

## Confluence and JQL

No archive destination is selected. Choose a restricted space as administrator; currently every permission assignment must be for an explicitly allowlisted named user. Group, role and anonymous permissions are refused. In issue-panel administration enter its numeric space ID and approved user account IDs, tick confirmation and save. Close/retry monthly archive publication only after restrictions validate. A non-admin close remains stored in Forge even if publication needs an administrator retry.

In Confluence insert the **PermitGuard lock-board snapshot** macro, enter an authorized Jira work item key and Load authorized snapshot. It must print Snapshot at <time>, never imply live clearance. Snapshot is a derived observation, not workflow authority. Page publication and macro rendering have not been live-accepted.

After creating a permit, test JQL **permitguardState = "ACTIVE"** and Automation reading issue.properties["permitguard.snapshot"]. Indexing/Automation outcomes have not been live-accepted. Dry-run reports the open work item's current start/release app-state decisions plus the nonauthoritative projection, not a site-wide report.
