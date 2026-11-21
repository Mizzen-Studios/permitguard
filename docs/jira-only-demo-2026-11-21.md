# Jira-only development demo — 21 November 2026

## Confirmed cause and choice

Owner inspection at ~17:12 UTC identified two legitimate registrations of the same app: Jira and Confluence each registered PermitGuard Judge. Observed agent IDs: **6b727d70-da26-4c22-b404-75b0822bffbf** and **897fb48c-0369-4aea-b28b-11093d09d2c4**. Both had Check readiness / Request activation. Neither was proven stale and neither was deleted in Rovo UI. Do not infer which ID corresponds to a product from icon color.

Core permit planning, photos, locks, human verification/activation, native Rovo and release checking are Jira features. Confluence hosts the optional snapshot macro and future restricted archive integration. No restricted archive space was configured/accepted in this demo. The Jira-only judge story does not require that product installation; macro/archive publication is explicitly unavailable/unverified here. Source support and scopes remain, not a claim that Confluence APIs work after removal.

## Authorized operation and verification

Before: two development installations, both major 5 / Up-to-date on one-atlas-xitr.atlassian.net:

- Jira **35a88eb5-064f-489a-8a92-9a65a87a7f2a** — preserved.
- Confluence **f76354f0-51c4-4115-8063-5d2e7ba2b83d** — removed.

Executed with credentials loaded privately, tracing disabled:

~~~sh
forge uninstall --installation-id f76354f0-51c4-4115-8063-5d2e7ba2b83d --environment development --site one-atlas-xitr.atlassian.net --product Confluence
forge install list
~~~

CLI exited 0 and confirmed Uninstalled from the development environment in Confluence on one-atlas-xitr.atlassian.net. The follow-up list shows **exactly one installation**, the original Jira ID above, still **development / major 5 / Up-to-date**. Executable release stays **5.12.0**; no manifest change or deployment was needed, and the full safe agent definition is unchanged. Do not use uninstall/reinstall as a data reset or assume indefinite data recovery: reinstalling product access and retaining old storage are different guarantees.

Repeatable read-only integrity check after uninstall: description matches original fixture, current assignee matches owner, and the derived permit snapshot is exactly unchanged from the earlier evidence: ACTIVE, permit revision 6, one lock, work-start cleared, release not cleared. This is a nonauthoritative Jira property, not raw Forge storage. Owner previously reported global site revision 22, a distinct counter. See [post-operation JSON](evidence/2026-11-21-jira-only-integrity.json).

## Remaining polish and evidence

Owner already accepted inline placement on PGSAMPLE-2, readable header/policy/admin and explicit native Rovo WORK_START-only wording in 5.12.0. Preserve those working changes rather than redeploying to chase installation duplication. Saving retains filled disabled inputs, observed elapsed seconds and client-stage/no-resubmit guidance. Non-authoritative projection and Realtime work already run together after the atomic commit. Permission checks, register freshness and conditional writes remain intact. No new live latency reduction is claimed; measure actual timings in the next test.

On a fresh work item, Jira still controls placement: **View app actions → PermitGuard**; a Jira admin may optionally choose **Show for all work items** in the panel menu. Do not invent an auto-open flag or claim current per-issue inline placement applies to every new issue. Equipment EQ-1 remains intentionally preloaded; no general equipment-creation wizard is part of this demo.

## Exact re-test

1. Reload Rovo search and search **PermitGuard**. Expect **one PermitGuard Judge** after removal/index propagation. Installation count is verified; the final picker count is still an owner browser check. If two persist, capture both detail IDs/source installations; do not delete either through Rovo UI or uninstall Jira.
2. Ask the remaining agent **Check readiness for PGSAMPLE-2. State its scope and release status.** Expect ACTIVE and **CLEARED for WORK_START only. This is not release clearance**, plus release NOT CLEARED. A read does not advance revision.
3. Hard-reload PGSAMPLE-2. Keep its active permit; expect inline panel as previously observed (or View app actions → PermitGuard), friendly names, Block while the register is unavailable, one lock. Admin permissions should remain readable, without raw JSON/consent flags.
4. If ready to finish the synthetic sample: Play Crew B only if absent → Begin release checks → remove only your own L-A1. Observe real elapsed save/stage and second-tab delivery; expect simulated L-07/V-3 blocking closure and Rovo release NOT CLEARED. No removal of a real other person's lock.

Do not reinstall Confluence for this judge run. If future acceptance requires its macro/archive, separately authorize the product dependency and an architecture/agent-discovery plan; a second product install will otherwise register another agent again. No paid resource/card, app listing, publication or submission. The distinct Agent not allowed validation behavior is not diagnosed by this installation-duplication finding.
