> **Owner MCP run completed, 24 November 21:06:40 UTC: PASS_OWNER_RECEIPT.** Actual tool **check_readiness_development**, broad Read/Write/Search consent, one scoped read, owner-verified OFF/disconnect/grant cleanup. [Redacted receipt and limitations](evidence/mcp-owner-receipt-2026-11-24.md) · [Official Rules and Olly’s pre-submission OK gates](codegeist-rules-alignment-2026-11-24.md). Exposure stays OFF; do not replay or enable automatically. Earlier NOT_RUN/awaiting-owner statements below are dated history.

# GET-only MCP development deployment — 24 November 2026

Status: **VERIFIED — deployed Development 5.16.0**. Owner approved step 1 at 16:57 UTC. [Exact Linux owner runbook](mcp-linux-owner-proof.md) is ready for the owner-run OAuth/discovery/single-read/OFF/revoke test.

## Identity and actual readback

- App **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**, environment **development**, site **one-atlas-xitr.atlassian.net**.
- Original Jira-only installation **35a88eb5-064f-489a-8a92-9a65a87a7f2a** is **Up-to-date**; no Confluence installation or new site/product install.
- Normal **forge deploy -e development --non-interactive** succeeded: CLI reported **5.16.0**, with ordinary manifest/lint/deploy validation. No --no-verify, no forced rule approval, no sharing/exposure/payment/production changes.
- Clean source deployed: **5f92b0c1b926e35cbdc3f45a3352f76dabfaaf58**. UI build marker **5f92b0c1b926**, without -worktree. Follow-up documentation commits are not new deployed versions.
- Remote **forge version details -e development -v 5 --non-interactive --json** (latest development major-5 metadata) matches source: **one permitguard-mcp with tools [check_readiness]**. Its declaration is **GET**, required issueKey string.
- Native **permitguard-judge-v2** still has **[check_readiness, request_activation]**; CREATE declaration and activation handler remain intact. This is remote metadata confirmation, not a new native-chat/browser acceptance run.
- Major-version metadata readback alone does not identify the minor version; **5.16.0** comes from the successful deploy output. Deployment list confirms success; installation list confirms existing install current.

## Verification

- **134 unique local tests pass:** 88 backend (including new MCP/native boundary, injected-write stripping, ACTIVE-permit no-side-effect checks), 43 UI contracts, 3 Python checker tests. SDK bootstrap imports were also rerun after build.
- npm run check, clean npm run build and forge lint pass. Normal deploy repeats lint and validates manifest.
- Production dependency audit: **0 known vulnerabilities** at verification time. No dependency change was needed.
- Source/generated artifacts checked against private known credential values: **109 files**, no matches. No values included here.
- UI source code/behavior, native agent key/prompt, runtime functions, scopes and permit data model were not changed. The sole manifest delta is removing request_activation from the MCP tool array. The normal clean rebuild changes the UI source marker to identify the deployment; prior **5.15.0 / UI 4e3335fb30f9** remains the earlier owner-accepted baseline, not today's footer.
- Local artifacts/hashes are recorded in [machine receipt](evidence/2026-11-24-mcp-get-deployment.json). **Remote UI bytes were not independently downloaded**, and the owner has not yet browser-accepted 5.16.0. Don't confuse local build/deploy success or metadata with a real MCP invocation.

## Not performed / next owner-only actions

No operational permit, lock, phase, policy, proposal, QR or confirmation call. No Inspector installation/execution, browser OAuth, MCP discovery/call, exposure switch, sharing, Studio Publish, Marketplace or Devpost action by the maintainer. Existing private Forge credentials were used only for normal deploy/lint and metadata reads.

Last exposure observation is the owner's **OFF** at 13:03; not independently rechecked after deployment. Owner must first verify OFF and the new version, then use the [Linux runbook](mcp-linux-owner-proof.md). Authenticated discovery/tool receipt is still **NOT_RUN / AWAITING_OWNER**. No claim of £0 billing policy follows from local tests; owner's no-card report is recorded without independently asserting a hard usage cap.

Expected discovery after the owner enables/authorizes: **only check_readiness**, called once with **{"issueKey":"PGSAMPLE-2"}**. Any extra/write tool, sharing/publication gate, wrong site, auth failure or paid terms is a stop condition followed by OFF/cleanup. Return the redacted actual result and cleanup/state observations before runtime proof is promoted.
