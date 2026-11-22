> **Latest retest is 5.14.0:** [footer version/UI hash, preview lifecycle and literal “Is PGSAMPLE-2 cleared?” question](preview-and-rovo-2026-11-22.md). Single-caveat prose failed in 5.13.0; do not mark it passed from prompt metadata alone.

> **Start here for 5.13.0:** [cold-load preview/live/Realtime milestones, top release banner and one-time caveat](first-paint-2026-11-21.md). The earlier one-picker gate passed in the owner browser at ~21:05 UK on 5.12.0. Do not reset PGSAMPLE-2.

> Current demo is Jira-only after the authorized Confluence uninstall. [Current operation and retest](jira-only-demo-2026-11-21.md). Do not delete product-owned agents through Rovo UI.

# Judge test instructions and release gates

## Current sample — no reset needed

Development 5.12.0, [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2), latest owner-observed ACTIVE/site revision 22, derived permit revision 6. Read the [dated evidence](judge-evidence-2026-11-21.md) first. Jira assignee is restored; description unchanged. Jira To Do and app ACTIVE are separate state machines.

1. Hard-reload. If not inline, **View app actions → PermitGuard**. Expect readable project/work-item names, Enforce / Block while the register is unavailable, live authenticated state and one personal-lock record. Do not change mode or reseed equipment.
2. Rovo search must ultimately show **exactly one verified live** PermitGuard Judge. The two valid product-owned entries were traced to Jira and Confluence installs. Confluence is now removed; verify one entry after reload/index propagation, with Jira preserved. Do not remove agents through Rovo UI. Test the known live entry: “Check readiness for PGSAMPLE-2. State its scope and release status.” Expect **CLEARED for WORK_START only. This is not release clearance** and release NOT CLEARED. A read must not increment operational revision.
3. Administration: readable permission groups, no raw JSON/consent metadata or issue-subscription warning. Declared scope text does not prove every capability is currently configured.
4. When the owner is ready to finish the synthetic scenario: Play Crew B only if absent → Begin release checks → remove own L-A1. Expect NOT CLEARED / Simulated Crew B lock L-07 remains on isolation point V-3, Close disabled, and another browser re-reads current state. Rovo must report release NOT CLEARED in plain words. Note actual save/delivery durations; do not substitute older timing evidence.
5. Only the sample's creator may explicitly Remove my simulated Crew B lock. After all personal locks are gone and named-human close-out passes, Close can succeed with the not-permission-to-energize warning. Do not remove any real other worker's lock or claim physical safety.

## Fresh lifecycle and negative controls

After finishing existing EQ-1 permits, create a new synthetic PGSAMPLE work item rather than resetting a closed/existing permit. Use actual authenticated worker/verifier identities, EQ-1, L-A1/photo, V-3 point QR **permitguard:V-3**, then equipment QR **permitguard:register:10202:EQ-1** for the pending named-human activation. Pre-activation is NOT CLEARED. During Saving the fields must remain filled/checked and disabled; show elapsed time, not an ETA. Local tests cover wrong QR, replay, expired/revision-changed tokens, cross-actor tokens and stale writes, but these are not all accepted browser cases. Never fake a second person's identity for a high-energy test.

## Local verification (no site writes)

~~~sh
npm ci
npm test
npm run test:contracts
python3 -m unittest discover -s tests -p '*_test.py'
npm run build
git diff --check
~~~

For the separately authorized **read-only** site check, load credentials from the already-approved private environment (never arguments/chat/repository), then:

~~~sh
python3 scripts/check-demo-integrity.py
~~~

The checker only performs GETs against the fixed synthetic issue, complete bounded changelog, derived property and authenticated-user identity. It emits no account IDs/tokens and generalizes assignee history labels. It does not query raw Forge storage or assert a global site revision. No deployment is needed for docs/checker updates. Do not rerun deployments to clear picker duplicates blindly.

## Explicit remaining acceptance gates

- Verify one-result picker after the Confluence-only uninstall, with the working scoped reply; no Rovo UI deletion.
- On a new Verify permit, request_activation via the actual Rovo agent creates PENDING only; same assigned human confirms. No activation tool or unassigned-human bypass.
- Studio custom-agent and external OAuth MCP client: real end-to-end checks, not manifest inference.
- High energy: two distinct consenting named humans; negative one-person test, no impersonation.
- Jira workflow Preview gate execution, JQL indexing and administrator/uninstall recovery; deletion is currently unsupported and manual recovery must be retained.
- Optional Confluence macro/archive is unavailable with this Jira-only installation. Any later archive test requires separate authorization to restore the product dependency, address per-install agent registration and select a restricted space. No live archive/export/compliance retention claim yet.
- Video: actual private recording, measured real timings, privacy check and source evidence. Script alone is NOT a video. Confirm official contest rules before any later owner-authorized upload/submission.

Do not add a card, paid resource, external runtime, listing, publication or submission. Keep native Jira/Forge identities, issue permissions and site procedure authoritative.
