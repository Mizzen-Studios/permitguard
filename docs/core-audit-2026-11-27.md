# PermitGuard remaining-core audit — 27 November 2026

## Scope and verdict

Read-only source/test audit; only this new report is authored here. Baseline HEAD **b5955a12be22480866f0dc4aad3de7499e10d5cd**; runtime per existing receipt **e8b95c053254bed5bd2f2ec6a28ff8162a80e3fd**, Production **2.4.0**, UI **e8b95c053254**. No live version/API query, browser session, site write, build, deployment, commit, push, billing, promotion or exposure change.

Owner **09:01 UTC** fresh-judge KAN-1 report accepts precisely the marker/empty-seed flow: cancel leaves zero; confirm six synthetic EQ-1–6, Warn-only, no permit/locks; reload six, no duplicates/button. [Owner receipt](evidence/2026-11-27-owner-2.4-seed-pass.json) is owner-reported native acceptance, not independently inspected media or full lifecycle acceptance. Parent updates status/docs concurrently; old seed NOT_RUN statements are superseded only for this specific flow, not by global ALL PASS.

**Preserve accepted seed behavior.** Core implementation exceeds native acceptance. One reproduced capacity defect warrants a bounded safety-workflow fix before broader multi-photo use. No agent-activation/foreign-lock-removal bypass demonstrated in inspected paths; this is not a comprehensive security certificate. Privacy remains a distribution/Marketplace-readiness blocker.

## Concrete findings

### 1. High: capacity prevents recording removal of an existing personal lock

**Locally reproduced; no site experiment.** Evidence, permits and audits share one 180,000-byte operational row without lifecycle headroom:

- **src/server/store.mjs:5,17–22:** hard serialized-byte cap on every commit.
- **src/server/service.mjs:85–88,165,171,188–191:** photos and removal share that capped row, no recovery reserve.
- **src/domain/permit.mjs:114–120:** removal adds timestamp and audit, increasing row size.

Executed in-memory reproduction using real createService, cloned state and a commit adapter enforcing real MAX_BYTES: register one equipment item with three low-energy points, Enforce, create permit, begin lock, submit three photos with accepted data-URL lengths **64,000 / 64,000 / 50,000**. Stored valid LOCK state: **179,943 bytes**. Authorized remove_lock({lockId:'L1'}) fails **SITE_CAPACITY_REACHED 180052**; stored lock stays unremoved. Inputs exercised accepted byte syntax, not genuine photographic evidence.

**Failing regression sketch:** construct that near-limit state; assert own removal commits while preserving unrelated locks/evidence. Current implementation rejects. Extend to begin-release/close/audit growth and conflicts. Ordinary removal tests use uncapped fixture commits and miss this boundary.

**Bounded fix:** reject new evidence/planning early enough to reserve a measured, provably bounded allowance for remaining lifecycle/audit mutations; test against actual store limit. Do not simply raise cap, discard history/evidence or permit foreign-lock override. If reserve cannot cover current model bounds, separately review transactional evidence separation. No fix applied; no record-erasure authority inferred. Digital workflow availability defect, not proof of physical lock manipulation.

### 2. Medium: derived START dry-run contradicts authoritative state semantics

**src/integrations/workflow.mjs:61–62** requires VERIFY for projected START clearance. Authoritative START in **src/forge/gate.mjs:8–9** requires ACTIVE plus confirmed human activation; projection follows confirmed readiness (**src/server/service.mjs:14–15,38–45,196**). Correct ACTIVE/start.cleared=true therefore reports historical dry-run wouldBlock=true while current authoritative dry-run may allow.

**Failing test sketch:** evaluateProjection with valid current ACTIVE, start.cleared=true and matching timestamp; expect agreement with authoritative START interpretation, currently blocked. Keep VERIFY/PENDING blocked. Live manifest binds forge/validator.js, not createTransitionValidator: this is misleading reporting/helper semantics, not a proven live transition bypass. A bounded reporting alignment is appropriate, never promoting writable properties to authority.

### 3. Privacy/erase/reporting absent despite policy publication

Manifest has no personal-data reporting scope/schedule and no complete report/erase/refresh/retention implementation. Account IDs, names, attributable audits/locks/photos are retained; QR KVS values also retain actor IDs (expiry validation is not deletion). Existing [distribution handoff](distribution-handoff-2026-11-26.md) documents the previously retrieved Atlassian requirement; no fresh legal/network verification here.

**privacy/erasure Marketplace blocker**, also unresolved qualification for compliant distribution; not a claim of Marketplace submission/rejection. Owner-reviewed reporting/retention/de-identification design and permission decisions required. Erasure must never count a remaining personal lock as removed. Restricted archive is closure metadata, not full export, storage reclamation or retention. No GDPR/OSHA certificate.

## Requirement classification

Implemented/localtested means source plus local suite coverage, not native platform proof. Categories can coexist.

| Requirement | Classification / boundary |
| --- | --- |
| Fresh native issue entry, marker, seed cancel/confirm/reload | **nativeowneraccepted onversion:** Production2.4/UIe8b95c053254, owner09:01. Equipment only; no permit/locks. Avoid historical sidebar Apps404. |
| Admin/Edit authority, seed history/revision/isolation guards | **implemented/localtested** adapter→resolver→UI; current native ordinary-member/no-Edit denial **nativeNOTRUN**. |
| PGSAMPLE confirmed Enforce loader vs empty-project seed | **implemented/localtested** distinct flows. KAN synthetic seed cannot enable Enforce until explicit approved-register replacement. No conversion/reseed authorized here. |
| Built-in JSON register / configured Assets Equipment+Isolation points | **implemented/localtested**; not a general equipment wizard. Current Assets full workflow/unavailable/change handling **nativeNOTRUN**; historical metadata discovery is not full acceptance. No instruments/calibration/Graph. |
| Plan→Lock→Verify→Active→Release→Closed | **implemented/localtested**; fresh Production2.4 full lifecycle **nativeNOTRUN**. Capacity defect limits readiness. |
| Two distinct named high-energy verifiers | **implemented/localtested**; two actual humans **nativeNOTRUN**. Same-account roleplay is insufficient. |
| Real Crew B on separate issue, foreign-lock denial and cross-issue redaction | **implemented/localtested** normal per-principal records; two-human native **nativeNOTRUN**. Legacy creator-owned simulated Crew B stays explicitly separate. |
| Photos/camera/resize/limits | **implemented/localtested** submission/storage/bounds; physical native tablet iframe capture, legibility, denial/no-device **nativeNOTRUN**. No implemented photo-review/export gallery: service returns photoRef, not evidence contents. Do not advertise one. |
| Point/equipment QR, expiry/replay/wrong-user/revision checks, human confirm | **implemented/localtested**; native tablet workflow **nativeNOTRUN**. Manual text is explicitly an assertion, not independent presence proof. |
| Native Judge release-first deterministic read | **nativeowneraccepted onversion:** historical DEV5.15/UI4e3335fb30f9, owner22-Nov. Fresh Production2.4 site read **nativeNOTRUN**. |
| Native proposal→PENDING→assigned-human activation | **implemented/localtested**; actual current native execution **nativeNOTRUN**. No agent confirmation tool binding. |
| Studio custom agent / Production MCP | **nativeNOTRUN / blockedplatform/manual:** entitlement, admin exposure/OAuth, separate approval. Historical genuine DEV5.16 GET receipt applies only there; exposure last reported OFF. No invented Production discovery name. |
| Realtime invalidation/authorized reread | **implemented/localtested**; connected status is not delivery proof. Two-browser same/different-issue delivery, revocation/disconnect **nativeNOTRUN**. Module/issue-scoped publishing: retain honest manual Refresh for other contexts. |
| Preview workflow START/RELEASE, dry-run | **implemented/localtested**, reporting inconsistency above. Actual dedicated workflow transitions/recovery **nativeNOTRUN**. No autoattached gates; panel is not workflow bypass. |
| Own-rule list/disable/readback/delete | **implemented/localtested** plus historical adapter evidence; current native **nativeNOTRUN**. Delete **blockedplatform/manual** by documented Forge endpoint restriction; Jira-admin manual removal/publish before uninstall. |
| Entity property / Automation / JQL | **implemented/localtested**; writable property is nonauthoritative. Live indexing/Automation **nativeNOTRUN**. Dry-run is not executed transition/reservation. |
| Restricted monthly Confluence archive / timestamped macro | **implemented/localtested** ACL refusal/idempotence/lease/version logic; **blockedplatform/manual / nativeNOTRUN:** optional Confluence absent, approved space unconfigured. Metadata-only, not complete export/deletion/retention/capacity recovery. |
| Scope inventory / uninstall footprint | **implemented/localtested** inventory/residue warnings. Native recovery **nativeNOTRUN**. Optional declared Confluence scopes remain; no minimal-scope claim. |
| Capacity/recovery/retention/reporting | Hard180KB/60-permit caps **implemented/localtested**, not sustained qualification. Headroom defect reproduced. Full recovery/export/retention absent; reporting/erase separate **privacy/erasure Marketplace blocker**. |
| OSHA official reference / step mapping | **implemented/localtested** source link/caveat; no fresh URL-resolution check or certification. |
| Conflict guard / shift-end suspension | **futureconflict/shift featuresnotimplemented** deliberately per AGENTS. Not mandatory pre-video feature development; no implementation claim. |
| Zero-cost / connected-only boundaries | Source/manifest: no app external egress/remotes, SQL, LLM API, Containers or schedules; no offline mode. No usage dashboard checked. SQL compute measurement inapplicable; Rovo credits separate, no spending guarantee. |

## Tests actually run

Node **v24.22.1** (package >=22; Forge nodejs22.x). No Node22 rerun and no runtime failure alleged.

- npm test: **177/177 PASS**.
- npm run test:contracts: **59/59 PASS**.
- python3 -m unittest discover -s tests -p '*_test.py': **3/3 PASS**.
- npm run check:submission -- --json: **localConsistency PASS**, **280 references**, submissionReady **false**. Not media/native/legal acceptance.
- Inline node --input-type=module service/capped-store reproduction: **179943 persisted; removal rejected at180052**. No temporary source retained.
- No npm install/build/lint/browser/network test. No runtime/artifact modifications. Parent's concurrent status/checker/test/owner-receipt changes preserved.

## Next five prioritized owner browser checks

Each requires explicit synthetic-write/site/participant authorization. Do not mutate accepted KAN-1 merely for a green checklist.

1. **Roles/defaults:** existing ordinary member/no-Edit account cannot seed/configure/Enforce; admin cannot enable Enforce on synthetic seed. Denial plus reload/no unintended writes. No invitations/paid seats.
2. **Low-energy lifecycle:** after headroom fix or strictly small agreed isolated run: PLAN→own lock/legible synthetic photo→point verification→native PENDING→assigned human equipment QR→ACTIVE→RELEASE→own removal→CLOSED, with reloads. Reject wrong point/equipment, absent attestation, expired QR; inspect uncertain writes before retry.
3. **Two-human/high-energy plus real Crew B:** existing entitled humans, separate contexts/issues; distinct second verifier required; A cannot remove B's normal lock; release stays blocked until B's own permitted removal. Legacy simulation stays separate, other-issue details redacted.
4. **Cross-browser/stale authorization:** same-issue delivery vs different-issue shared equipment, explicit Refresh fallback, disconnected/revoked-access client cannot act on stale state. Compare server revisions/counts. Connected alone is insufficient.
5. **Isolated workflow/JQL recovery:** approved dedicated workflow only; observe START/RELEASE denials, compare current/derived dry-run, actual JQL update, list/disable/readback/successful recovery. Manually remove/publish before any separately approved uninstall. Never operational workflows.

Full Assets, archive, Studio and Production MCP remain separate later platform checks, not covert additions to these five.

## Authority / submission blockers

No authority inferred for deploy/site writes/erasure/new scopes or jobs/workflow attachment/archive selection/MCP exposure or OAuth/billing/Marketplace/promotion/Devpost. Native camera needs authorized device/browser; two-human proof needs actual already-entitled people. Privacy design/attestation needs owner review. Listing/media/raw footage/rights/submission are parent/helper-owned. This report supplies no global signoff, safety certificate or organizer acceptance.

## Parent source mitigation after this read-only audit

The findings above remain the baseline reproduction, not current-source pass claims. A subsequent **unreleased** source candidate adds per-outstanding-lock removal and ACTIVE→RELEASE/close-out byte reservation before growth commits, with UTF-8/current-ID sizing and conservative timestamp/revision allowance. New near-cap evidence is refused atomically before it consumes that reserve; no existing lock/evidence is removed. Already-authorized legacy drain operations can reduce a reserve deficit only while staying below180KB; a legacy row whose removal itself exceeds the hard cap still fails and needs separate owner-reviewed recovery. This prevents new admission reproducing the specific bug, **not full recovery/retention/capacity qualification**.

[Hard-cap regressions](../tests/lifecycle-capacity.test.mjs) test refusal/no-write, retained evidence, own/foreign ownership, release/removal/close growth, legacy draining and explicitly unrecovered full rows. Projected START reporting is aligned to ACTIVE; VERIFY/PENDING stay not cleared and current authoritative denial still wins. No production deployment is performed in this preparation milestone. Native seed receipt remains2.4; no new lifecycle acceptance.
