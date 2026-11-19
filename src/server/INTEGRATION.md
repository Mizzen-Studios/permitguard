# Server integration — 19 November 2026

## Parent-owned prerequisites
Install @forge/kvs latest supporting conditional Custom Entity Store transactions. No SQL provisioned or used. Add storage:app, read:jira-work, write:jira-work, read:jira-user (assignable-person validation). Forge lint must confirm scopes. Declare:

    app:
      storage:
        entities:
          - name: permitguard-site
            attributes:
              revision:
                type: integer
              data:
                type: any

No custom query index required: exact site aggregate key site-v1. 180KB encoded aggregate/60 permits hard stop, never truncate or omit paginated locks. Conditional revision transaction serializes ALL projects including close-out. First creation uses revision notExists. SDK missing conditional API => ATOMIC_STORAGE_UNAVAILABLE, never fall back to blind set. Official docs describe conditions atomic with transaction. Live initial-create and concurrent update acceptance remains required before claiming Forge atomic behavior verified.

Sources checked 19 Nov: https://developer.atlassian.com/platform/forge/storage-reference/entities-transactions/ and https://developer.atlassian.com/platform/forge/storage-reference/entities-api-query/ . Plain KVS transactions alone do NOT expose compare-and-swap conditions; use declared CES via @forge/kvs.

## Resolver contract
Import { dispatch } from '../server/index.mjs'. Resolver call: dispatch(request.payload.operation, request.payload.payload || {}, request.context). Never use payload.context, payload.actorId, payload.projectId as trusted identity. Context requires Forge accountId and extension.issue.id; context.issueId is accepted ONLY for a trusted action adapter. Jira asUser GET issue establishes browse/issue-security and canonical project. asUser mypermissions establishes EDIT_ISSUES and ADMINISTER_PROJECTS. Named people must be active and assignable to that issue (deliberately strict first version).

get_state returns {permit,policy,equipment,board,actorId,isProjectAdmin,readiness,release,revision,limitations}. revision is SITE aggregate version, permit.revision is domain-only version: UI MUST send state.revision as expectedRevision, not permit.revision.

Operations/payloads:
- get_state / check_readiness: {}. Readiness deterministic, no actor impersonation.
- load_sample: {confirmed:true}; admin AND project key PGSAMPLE AND description containing [PermitGuard dedicated sample project]. Adds exactly six Equipment/Isolation records; explicit confirmation enables ENFORCE + FAIL_CLOSED only in this verified sample project. Uses domain sample equipment IDs register:projectId:EQ-1…EQ-6, first point V-3; Crew B lock L-07.
- set_policy: {mode,failMode}; admin opt-in only.
- register_equipment: {equipment:[{id,name,isolationPoints:[{id,energyType,highEnergy}]}]}; admin, max six, no open permits; IDs canonicalized register:projectId:id. No Assets/instrument/calibration access.
- create_permit: {equipmentIds,workers:[accountId],verifierIds:[accountId],crewId}; creator worker, two distinct named verifiers required if high-energy.
- begin_lock / begin_verify / begin_release / close_permit: {}.
- apply_lock: {pointId,lockId,photoData?}; inline data:image/(png|jpeg|webp);base64 only, max 64000 characters (~48KB), NOT 750KB. photoRef/name/actorId client claims ignored. Server evidence actor/issue/point/time-bound.
- qr_challenge: {target:pointId OR equipmentId}; named verifier, returns {challengeToken,qrValue,expiresAt,physicalPresenceProven:false}. Two minute one-use actor+issue+target challenge, exact scanned value permitguard:target. QR is human attestation, NOT physical presence proof.
- verify_point: {pointId,challengeToken,qrValue,confirmedAtEquipment:true}.
- request_activation: {verifierId}; participant proposes PENDING, never activates.
- confirm_activation: {activationId,equipmentId,challengeToken,qrValue,confirmedAtEquipment:true}; assigned verifier only; requires actual CLEARED regardless of advisory policy.
- remove_lock: {lockId}; authenticated original owner only.
- play_crew_b / remove_sample_lock: {confirmed:true}; dedicated verified sample only. Crew B explicitly SIMULATED, owner-account attributable, no impersonation. Creator removes own synthetic lock only.

board contains [{equipmentId,activeLockCount}] summaries, NOT other-issue locks/names (privacy). UI must render summaries, current permit.locks for own rail, and generic release blockers. release checks ALL site aggregate permits, cross-project, no pagination. Additional crew/project identifiers are redacted from response.

Property projection: PUT issue property permitguard.snapshot. Fields schemaVersion,permitId,state,crewId,revision,updatedAt,mode,failMode,start:{cleared},release:{cleared},dryRun:{startBlocked,releaseBlocked},authoritative:false. Aligned integration workflow.mjs. Property failure does not undo committed permit; response projection.status=FAILED_NONAUTHORITATIVE. Property can be stale/reordered, so NEVER sole workflow safety authority. Server live dispatch get_state/readiness/release stays authority.

## Rovo/actions
Main action adapters must derive actor from authenticated platform context and issue from trusted event context; call same dispatch. Missing account/issue fails closed, never asApp impersonation. Request creates pending only, no confirm action exposed. Studio/Rovo/MCP acceptance not run.

## Realtime
Wired src/server/realtime.mjs issueInvalidationPublisher(publish) uses installed @forge/realtime publish('permitguard',{invalidated:true,revision}) default module+issue scoping. No publishGlobal or sensitive data. index.mjs injects installed SDK publisher. get_state advertises realtime.channel=permitguard, matching current UI default. UI subscribe same channel. Docs: https://developer.atlassian.com/platform/forge/runtime-reference/realtime-events-api/ . Only frontend-invoked functions supported; action publishing may fail harmlessly. Two-browser acceptance skipped, NOT tested.

## Verification and limits
node --test tests/server.test.mjs: local mocks only. Full 29 model/integration/server checks passed at first integration check. No credentials read, register/deploy/install or commit executed here. Browser camera, 2-browser Realtime, Studio not run. No external egress, SQL, LLM or Containers. Photo byte syntax accepted as submitted evidence; does not prove real capture. Bounded aggregate is initial-demo scale, not unlimited production storage. Archive/export retention/capacity needs future design. No live claims.

## Assets integration update
Explicit admin + confirmed import_assets (alias connect_assets) reads only workspace 1db77da0-e980-42be-9efa-3a83dbf05728 schema16 type147 Equipment + type148 Isolation points through api.asUser().requestJira /jsm/assets/workspace/{id}/v1/object/aql. No external fetch or schema discovery. list_equipment is issue-authorized read-only. Built-in fallback limitations remain explicit; import never enables Enforce. Import requires no open project permits.

Every connected Assets request (including get_state at Plan) rereads asUser and compares normalized metadata with imported snapshot. Inaccessible, malformed, truncated or changed register suppresses equipment selection, adds REGISTER_UNAVAILABLE readiness/release, denies planning, activation and close. WARN_ONLY may still permit advisory transitionAllowed but never CLEARED. Lock-state metadata is displayed, never physical isolation proof. Approved fixture keys PGTEST-4666/PGTEST-4667 map to assets:workspace:4666/4667. Reads are bounded complete <=6 equipment, <100 rows/type; excess fails rather than silently truncates. Changed metadata while permits open requires supervisor reconciliation (no repair flow yet). Live asUser Assets acceptance remains NOT_RUN.

## Isolated storage maintenance probe
index.mjs exports testStorageHealth(), callable by separately authorized maintenance adapter. This invokes store.storageHealth on fixed CES health-v1, not site-v1, leaves one bounded synthetic row and reads NO operational permits. Conditional initial/update, readback, then expected-stale conditional attempt must reject; unknown errors do not count as proof. Caller must enforce maintenance authorization; this export is not exposed through UI dispatch. No automatic retries or blind writes. Installed @forge/kvs2.1.2 declarations and request builder inspected: transact().set(key,value,{entityName,conditions:new Filter().and('revision',FilterConditions.equalTo(expected))}).execute(); initial notExists supported. Actual cloud behavior remains unverified until parent invokes probe.

Verification update: npm test passed 42/42 local model/mock tests on 19 Nov, including Assets asUser route/metadata/denial/Plan checks and synthetic health probe. No deployment, credentials, CLI mutations or live checks executed by this worker.
