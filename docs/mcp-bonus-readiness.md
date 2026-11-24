# MCP bonus readiness — technical evidence PASS, submission gated

Updated after the owner-run receipt, 24 November 2026. **PASS_OWNER_RECEIPT** for authenticated Forge MCP discovery and one successful read. **NOT_SUBMITTED / overall eligibility not signed off. Exposure stays OFF.** [Redacted receipt](evidence/mcp-owner-receipt-2026-11-24.md) · [Official Rules/hash/line alignment and Olly gates](codegeist-rules-alignment-2026-11-24.md).

## Evidence matrix

| Requirement / observation | Evidence | Classification |
| --- | --- | --- |
| Forge app exposing tools through rovo:mcp | Development 5.16.0, registered app endpoint, exact remote GET-only module readback | IMPLEMENTED / DEPLOYED |
| Actual discovery | Owner Inspector 2.16.0, exactly check_readiness_development, required issueKey, READ-ONLY/IDEMPOTENT | PASS_OWNER_RECEIPT |
| One authenticated business read | PGSAMPLE-2 call logged 21:06:40 UTC, ACTIVE / WORK_START / release NOT CLEARED / siteRevision 22 / permitRevision 6 / operational:false | PASS_OWNER_RECEIPT |
| Development OAuth with sharing OFF | Owner completed normal OAuth, consent Read, Write, and Search | PASS for this app/site/client, not universal grant-scope restriction |
| Cleanup | Owner reloaded OFF state, disconnected/stopped Inspector, removed its grant | PASS_OWNER_RECEIPT |
| Operational no-change observation | Panel siteRevision 22 and lock L-A1 unchanged; permitRevision not displayed before/after | Supported to this stated limit |
| Native Rovo proposal retained | Source and remote agent/actions metadata; proposal not in MCP tools | RETAINED; no new proposal call |
| Governing MCP technical clause | Actual private Rules export lines 101/240 plus overview 98, hashes recorded | TECHNICAL_MATCH |
| Judge installability/access/exposure window | Installation link and approved judge configuration not established | NOT_READY; Olly's OK required |
| Full entrant eligibility / publication / submission | Not attested, no finished video/public YouTube or form submission | NOT_COMPLETED |

## What this proves and does not

The technical route is a **Forge app exposing tools via the Atlassian MCP server using rovo:mcp**. It is not consuming an unrelated upstream server or merely using a coding-assistance MCP. One qualifying actual route suffices for this evidence plan; both Studio and external-client demonstrations are not required by the supplied clause.

Source key **check_readiness** was discovered as **check_readiness_development**. Use the actual discovered name for an environment. Consent was broad **Read, Write, and Search**; the MCP interface itself was GET-only. Native request_activation CREATE remains available to the guarded native Judge, not to this MCP connection.

Owner text is actual accessible evidence, not a maintainer replay or raw signed transport log. No Inspector screenshots/video exist. Internal permit ID/personal/local-path details are redacted; source file hashes preserve provenance. Before/after permit revision was not visible—do not infer 6→6 solely from the result. Scoped CLEARED is never release clearance or physical safety proof.

## Next authorized scope

This documentation task does not toggle exposure, replay the tool, change code/deployment, enable sharing, publish an agent/video or submit Devpost. Owner already completed the Linux run; do not rerun it automatically. [Linux runbook](mcp-linux-owner-proof.md) is reference for later separately approved use, not a command queue.

**Exposure stays OFF.** Olly must approve judge installation/distribution/access, enabling exposure on intended installation(s) before actual judging tests, its availability window and later rollback. Sharing-disabled DEV proof is not the required judge installation link. [Pre-submission gates](codegeist-rules-alignment-2026-11-24.md) control. No prize or full eligibility guarantee.

## History

- 23 November: declared two-tool module matched source, authenticated call missing; official overview excerpt supplied.
- 24 November 13:03: owner observed broad app-wide OFF switch, no per-tool selector. Selective-checkbox instructions withdrawn; GET+CREATE exposure was not read-only-only.
- 16:57 approval → normal **5.16.0** GET-only MCP deployment from **5f92b0c1b926**; native proposal retained, 134 local tests. [Deployment receipt](mcp-get-deployment-2026-11-24.md).
- 21:06:40: actual owner read; 21:10 private receipt delivered and then classified. OFF cleanup preserved. Rules exports read; technical claim updated, other submission gates retained.
