# MCP bonus audit — NOT FULLY VERIFIED

Updated 23 November 2026. **Official bonus architecture clarified; authenticated call proof still pending.** The core remains accepted development 5.15.0 / UI 4e3335fb30f9. The owner supplied the official excerpt below; live Forge metadata now confirms the deployed rovo:mcp definition equals source. Do not claim the real MCP invocation has passed. [Exact read-only browser/client handoff](mcp-read-only-proof-2026-11-23.md).

## Sources and authority

1. **Platform specification, retrieved HTTP 200:** [Rovo MCP module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/), page updated 29 October 2026. It specifies at most one rovo:mcp, a name up to 30 characters, up to 50 referenced action keys under 64 characters, Studio custom-agent use and optional third-party MCP-compatible clients. External exposure is disabled by default, administrator-enabled per installation, and external clients use OAuth 2.1/user permissions.
2. **Action contract:** [Forge action reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/). [Source manifest](../manifest.yml), [handlers](../src/forge/index.js), [tool/caller contract](../skill.md) are implementation evidence, not a contest rulebook.
3. **Official prize wording — owner-retrieved 23 November 2026**, from [Codegeist 2026, Prizes](https://codegeist2026.devpost.com/), supplied at 08:59 UTC and reconfirmed at 21:05 UTC:

   > Best app with Atlassian MCP: $1500 to 6 projects that use a Forge app exposing an MCP server.

   The owner also reports that Resources specifies a **Forge app exposing tools via the Rovo MCP server using rovo:mcp**. That Resources description is owner-supplied context, not an independently captured verbatim quote. Our earlier direct-fetch verification gate is historical and no longer makes the bonus wording unknown: provenance is the owner's official-page reading, not an independent assistant retrieval.
4. **Interpretation resolved:** the relevant candidate is this Forge app's rovo:mcp exposure. Consuming a different remote server, using a developer-assistance MCP server while coding, external app egress and both Studio plus external-client demonstrations are not established requirements of the supplied clause. A genuine call through one qualifying MCP route is our requested proof. Other eligibility, deadline and final submission conditions are separate; prize selection is discretionary, not guaranteed.

### 23 November live read-only checks

- Forge install list: original Jira-only installation **35a88eb5-064f-489a-8a92-9a65a87a7f2a** Up-to-date; no Confluence installation.
- Forge version details for development major 5: exactly one **permitguard-mcp**, name **PermitGuard**, tools **check_readiness / request_activation**; all properties match local manifest. This is deployment/configuration evidence, not a tool receipt.
- Root CLI help advertises Forge developer skills/MCP servers for coding assistance, not invocation of this installed app's OAuth MCP tool. A developer-assistance MCP connection would not prove this route.
- A read-only derived Jira snapshot baseline was fetched with the existing checker. It is not raw CES authority or a substitute for recording live site/permit revisions around the actual tool call. No permit action or new deployment was performed.
- Official Studio tutorial's documented fresh-agent path requires **Publish** before chatting. Do not execute that path under the no-publication restriction. A genuine draft Test/Preview or an existing suitable private custom agent may be used only if available; otherwise use the external route below.
- Preferred no-publication route: site admin selects **Check readiness only** for external exposure, then an already-approved OAuth-capable client invokes that tool. Leave **Request activation** disabled. The owner performs required browser/admin/consent steps; no toggles/grants were changed by the assistant.

## Requirement/evidence matrix

| Check | Authority | Current evidence | Status |
| --- | --- | --- | --- |
| Exactly one app MCP module; valid name/tool limits | Platform spec | permitguard-mcp, name PermitGuard, two tools | CONFIG_PASS |
| Tools resolve to declared action/function handlers | Platform spec/source | check_readiness → readiness-action; request_activation → activation-action; implemented handlers | CONFIG_PASS |
| Caller-scoped authorization; GET read versus PENDING-only CREATE | Source/local tests | trusted principal, asUser issue/permission checks, no confirm tool; local positive/negative tests | LOCAL_PASS; MCP identity path NOT_RUN |
| Native PermitGuard Judge action use | Owner browser | 5.15.0, one agent, release-first reply and one caveat passed at 21:00 report | NATIVE_PASS, NOT MCP proof |
| Current declared module accepted in development deployment | Existing release evidence | 5.15.0 source 4e3335f, normal deployment/metadata checks | DEPLOYMENT_PASS, NOT transport proof |
| Protocol authentication boundary | Noncredentialed probe this task | GET endpoint 404; POST JSON-RPC initialize returned 401 with OAuth challenge | AUTH_BOUNDARY_ONLY |
| Admin-selected tools exposed for the intended installation | Platform external path requirement | Not inspected under authenticated admin; no toggles changed | NOT_VERIFIED |
| Studio custom-agent MCP discovery + actual tool call | Proposed platform proof route | No receipt/recording yet | NOT_RUN |
| External client OAuth + discovery + actual tool call | Alternative qualifying exposure route under supplied clause | No grant or authenticated client receipt | NOT_RUN |
| Official bonus architecture wording | Owner-retrieved official Prizes/Resources | Forge app exposing an MCP server using rovo:mcp; matches deployed definition | CLAUSE_RECORDED / ARCHITECTURE_MATCH |
| Other eligibility/submission conditions | Full contest rules | Not assessed by this read-only proof task | NOT_VERIFIED |
| Actual MCP proof shown in final video/write-up | Our submission evidence gate | Conditional shot allocated; no video or authenticated receipt | NOT_READY |

**Do not silently require both Studio and an external client:** platform docs support both paths; the supplied clause concerns a Forge app exposing MCP tools; one actual qualifying route is sufficient for this proof plan. Nor should native rovo:agent invocation be counted as the Studio MCP route: it references action directly.

## Transport observation, not an invocation receipt

Observed candidate endpoint: https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90 . Clone registrations have different UUIDs. No credentials or API token were sent. Only GET and an unauthenticated protocol initialize (no tools/list, no tools/call) were attempted. GET 404 versus POST 401 reflects request-path/method/auth handling; it neither proves exposure is disabled nor that this app is usable after consent. Generic authentication responses do not bind tools to a particular installation.

## Proof to capture once the owner authorizes/accesses it

Prefer an already authorized private Studio/draft test route if it permits a real MCP call without Publish, avoiding unnecessary third-party data sharing. An existing consented external client is an alternative if required/approved. Do not publish a Studio agent, create a new OAuth grant, enable exposure, change accounts or buy a client merely to get a screenshot. No login, grant, toggle or new agent was performed. Current browser availability is recorded in the dated handoff, not inferred from yesterday’s session.

1. Bonus clause/source/provenance are now recorded above. Other contest/video/eligibility conditions remain separate; do not guess them.
2. Identify the actual site/installation/environment and the chosen approved client/Studio agent. Avoid credentials/account menus in captures. For an external route, show selected tools enabled and the OAuth-consented site without token/secret screens. If new consent/exposure/publish is needed, stop for the owner's specific decision.
3. Capture actual MCP discovery/tool selection showing the PermitGuard tools. Do not relabel native Judge actions as MCP. A screenshot of source or an endpoint URL is insufficient.
4. Invoke **check_readiness({issueKey:"PGSAMPLE-2"})** read-only using the real user. Capture the tool receipt/call and its current scoped result: release NOT CLEARED / work-start-only CLEARED / ACTIVE at this sample state. Record time, build, client, tool name, returned scope/release status and a privacy-reviewed receipt reference. Check no operational revision changes. Do not infer this path from mocks.
5. Verify no agent confirmation/lock-removal/policy-bypass tool is exposed. A permission-denied/unavailable case must not invent clearance. Real second-user isolation remains separate from synthetic tests.
6. request_activation is declared but not required for our read-only evidence plan unless official wording says otherwise. If ever demonstrated, use a separate explicitly authorized suitable Verify-stage scenario; it must stop at PENDING. Never invoke it on the accepted ACTIVE sample just for a bonus clip.
7. Link the reviewed proof to shot S07 and the matching Devpost paragraph. Only then promote the relevant NOT_RUN row; the supplied official clause already matches the deployed architecture; do not infer broader qualification from that alone. Do not mark the entire submission ready from one screenshot.

## What we show today

Native Rovo release-first response, real accepted clipboard/locks, architecture and source declaration. MCP shot is clearly labelled **Declared MCP tools; authenticated runtime evidence pending**. The draft does not claim bonus completion. [180-second script](demo-video-script.md) · [readiness](submission-readiness-2026-11-22.md).
