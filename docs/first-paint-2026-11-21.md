> **Owner retest 22 Nov ~09:05 UK:** top blocker and one-agent picker PASS; frame ~3.8 s, live ~1 s later, estimated 5–6 s total. No preview noticed; Rovo caveat still duplicated. [5.14.0 follow-up evidence/retest](preview-and-rovo-2026-11-22.md). Earlier pending checks below are historical, not current acceptance claims.

# First useful render — development 5.13.0

## Baseline accepted by owner at ~21:05 UK

Development 5.12.0 / 267c2f1: exactly one PermitGuard Judge in search; new chat correctly states WORK_START-only / not release clearance and release NOT CLEARED; inline PGSAMPLE-2 loads without manual Refresh, readable labels, ACTIVE / global site revision 22 / one L-A1 Crew A lock on V-3. Owner measured roughly **10–20 seconds** on Loading PermitGuard / Connecting automatically. Rovo caveat repeated twice. This is owner browser evidence, not our benchmark.

## Candidate and deployment

**299644f797cc9e7ba692bd581fde90bb1812974e**, deployed **5.13.0** to development through normal verification. Standalone lint returned Agent not allowed; the single subsequent normal deploy returned Manifest is valid and appDeployment DONE, without a bypass, new app/key, alternate identity or repeated identical deploy loop. Correlation request IDs: 7037e1e82aea445aafc8aed4cc766b78, bc1303c74ddf4d0a8fac5b5ad9fc692c, 484048613a6348ea8e4c50ac27ee541e. Provider internal reason remains unknown; it is separate from the resolved per-product duplicate-registration cause.

- Context lookup and the current-state resolver start concurrently, not serially. Three read-only retries remain bounded, and delayed issue context cannot misrender as administration.
- In parallel, Custom UI may read the current issue's permitguard.snapshot with **@forge/bridge requestJira**, which operates as the current user. This bypasses no permissions and does not use asApp. Source docs checked: https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/requestJira/ (updated 27 May 2026).
- Preview is a separate in-memory object, never the authoritative state or a source of expectedRevision. Only bounded phase/count/time/permit-revision metadata is retained; photos/identities/other property fields are ignored. Issue ID/schema/phase/revision/date/authoritative:false are checked; denied, malformed, wrong-issue or future properties are ignored. No localStorage/sessionStorage or offline permit mode.
- **Historical preview — not live or actionable** may show the last recorded phase/lock count and last release blocker while cold authorization continues. A positive projection flag never displays live clearance. Actions remain disabled until the authenticated resolver confirms current state. Failure retains the no-authority warning; late property responses cannot replace live state.
- Realtime connection is scheduled after the first authorized render rather than awaited by initialization. It remains best-effort invalidation, not a reservation or proof of physical safety. CAS/current permission/register checks still protect every write.
- Release status is the first main section, before connection/permit header/work sheet/rail. Compact sticky styling keeps the release reason prominent. DOM-order/CSS contracts passed; actual above-fold fit still needs the owner's viewport check.
- Rovo keeps its full safety boundaries and message-verbatim instruction. It now says to give the WORK_START caveat exactly once, without a second Scope field. Server metadata matches the revised prompt and unchanged key/actions. Generated wording still needs the browser check.
- Real resolver smoke import found native Node/CommonJS default-export interop; constructor selection now supports both the Forge bundler and installed native SDK. An actual entry-import regression was added; no claim is made that the already-working installed UI had been broken.

## Verification

**81 backend/integration/bootstrap + 34 UI contracts + 3 checker tests = 118 passing**; build, real resolver import, diff and known-private-credential scan pass. UI regressions cover preview while resolver hangs, parallel context/read start, hanging Realtime, denied/malformed/other-issue projections, never promoting positive property flags, failed live reads, top banner order, late preview suppression and existing QR/file/checkbox preservation.

Jira-only installation **35a88eb5-064f-489a-8a92-9a65a87a7f2a** remains development / major 5 / Up-to-date; no Confluence reinstall or Rovo UI deletion. Agent **permitguard-judge-v2**, full prompt/actions match remote metadata. Read-only [post-deploy sample check](evidence/2026-11-21-first-paint-integrity.json) exactly matches the prior derived snapshot: ACTIVE, permit revision 6, one lock, start cleared/release not cleared; original description and restored owner assignee intact. Raw Forge CES was not read or mutated. Permit revision 6 is not site revision 22.

Local bundle SHA-256: app.js **dc05229af80dfb4ea8cad2b6dd7bad5ec7c698f489cbb868fa7384ea52739ab6**; index.html **532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0**; styles.css **a3c84531d294ede5505f48c9e34d8345850393a69593619625e7098e47e7e3eb**. These are local hashes, not a remote byte readback or live performance test.

## Exact retest — current ACTIVE sample, no reset

1. Hard-reload PGSAMPLE-2. Do not clear browser cookies or disturb the Devpost session. Time three milestones separately from panel load: **historical preview if available**, **authorized live state/actions**, **live updates connected**. Preview may be absent if live state wins the race or the property is unavailable; it is optional, not a second required wait. Compare with the observed 10–20-second baseline; no new measured speed is claimed yet.
2. Before live state arrives, any preview must say historical/not live/not actionable, and must never enable operations or show live CLEARED. Its old timestamp is deliberate. After load expect ACTIVE, latest site revision (last observed 22), one L-A1 and the same permit, without Refresh. No read should mutate operational revision.
3. At normal panel size, **Release NOT CLEARED** and its personal-lock reason should be visible at the top without scrolling and remain prominent when scrolling. Record viewport size if it clips.
4. Search should still show one PermitGuard Judge. In a new chat ask **Check readiness for PGSAMPLE-2. State its scope and release status.** Expect exactly one clear WORK_START-only/not-release caveat and release NOT CLEARED. No output is permission to energize.
5. When the owner is ready for synthetic release testing: Play Crew B only if absent → Begin release checks → remove only your own L-A1. Observe elapsed Saving and preserved disabled inputs, top L-07/V-3 blocker and second-tab re-read. Do not remove a real other worker's lock or reset the active sample just to obtain a timing.

Current release changes do not shorten/skip authoritative safety checks. If preview remains blank until live state, record the three milestones/any safe displayed error; do not cache a previous user's live permit or weaken permission/register checks to make it look fast.
