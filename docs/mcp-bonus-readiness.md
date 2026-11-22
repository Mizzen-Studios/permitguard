# MCP bonus audit — NOT FULLY VERIFIED

Checked 22 November 2026. **Do not claim bonus requirements are fully met.** The core native Rovo path is owner-accepted. The candidate MCP implementation is present, but authenticated MCP discovery/call evidence and the official 2026 contest wording are missing. This is an evidence/eligibility gap, not a conclusion that the app is ineligible.

## Sources and authority

1. **Platform specification, retrieved HTTP 200:** [Rovo MCP module](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/), page updated 29 October 2026. It specifies at most one rovo:mcp, a name up to 30 characters, up to 50 referenced action keys under 64 characters, Studio custom-agent use and optional third-party MCP-compatible clients. External exposure is disabled by default, administrator-enabled per installation, and external clients use OAuth 2.1/user permissions.
2. **Action contract:** [Forge action reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/). [Source manifest](../manifest.yml), [handlers](../src/forge/index.js), [tool/caller contract](../skill.md) are implementation evidence, not a contest rulebook.
3. **Contest prize wording: NOT_VERIFIED.** Candidate URLs https://codegeist2026.devpost.com/ and https://codegeist2026.devpost.com/rules returned HTTP 403 verification pages; their canonical 2026 identity is not established. Another candidate https://codegeist.devpost.com/ also returned the gate. No authenticated Codegeist rules tab was found in the inspected managed profiles; the unrelated Devpost session/tabs were left untouched. Do not treat an inferred URL or another year's rules as official evidence.
4. The owner requests a three-minute script; that is our editorial target, **not a verified contest video limit**. Owner-supplied deadline 22 December 2026 20:00 UK/category/bonus wording and eligibility/format requirements must be checked against the actual 2026 rules before any later submission.

**Important interpretation risk:** exposing Forge app actions through rovo:mcp is not automatically the same as consuming a different Atlassian remote MCP server or using a developer-assistance MCP server while coding. The official prize wording must identify which use qualifies. Do not add external runtime egress, paid services or a different architecture just to satisfy an unverified interpretation.

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
| External client OAuth + discovery + actual tool call | Optional platform route; contest necessity unknown | No grant or authenticated client receipt | NOT_RUN |
| Official bonus interpretation and all eligibility/submission requirements | Contest rules | Canonical 2026 rule text unavailable | NOT_VERIFIED |
| Actual MCP proof shown in final video/write-up | Our submission evidence gate | Conditional shot allocated; no video or authenticated receipt | NOT_READY |

**Do not silently require both Studio and an external client:** platform docs support both paths; the unknown contest wording determines which evidence is sufficient. Nor should native rovo:agent invocation be counted as the Studio MCP route: it references action directly.

## Transport observation, not an invocation receipt

Observed candidate endpoint: https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90 . Clone registrations have different UUIDs. No credentials or API token were sent. Only GET and an unauthenticated protocol initialize (no tools/list, no tools/call) were attempted. GET 404 versus POST 401 reflects request-path/method/auth handling; it neither proves exposure is disabled nor that this app is usable after consent. Generic authentication responses do not bind tools to a particular installation.

## Proof to capture once the owner authorizes/accesses it

Prefer an already authorized private Studio/draft test route if it satisfies the rules, avoiding unnecessary third-party data sharing. An existing consented external client is an alternative if required/approved. Do not publish a Studio agent, create a new OAuth grant, enable exposure, change accounts or buy a client merely to get a screenshot. The current managed Atlassian profiles show login gates; no login, grant, toggle or new agent was performed.

1. Record the canonical official rules URL, access date and verbatim bonus clause, plus applicable video/repo/eligibility conditions. Map each clause to evidence; don't guess the deadline.
2. Identify the actual site/installation/environment and the chosen approved client/Studio agent. Avoid credentials/account menus in captures. For an external route, show selected tools enabled and the OAuth-consented site without token/secret screens. If new consent/exposure/publish is needed, stop for the owner's specific decision.
3. Capture actual MCP discovery/tool selection showing the PermitGuard tools. Do not relabel native Judge actions as MCP. A screenshot of source or an endpoint URL is insufficient.
4. Invoke **check_readiness({issueKey:"PGSAMPLE-2"})** read-only using the real user. Capture the tool receipt/call and its current scoped result: release NOT CLEARED / work-start-only CLEARED / ACTIVE at this sample state. Record time, build, client, tool name, returned scope/release status and a privacy-reviewed receipt reference. Check no operational revision changes. Do not infer this path from mocks.
5. Verify no agent confirmation/lock-removal/policy-bypass tool is exposed. A permission-denied/unavailable case must not invent clearance. Real second-user isolation remains separate from synthetic tests.
6. request_activation is declared but not required for our read-only evidence plan unless official wording says otherwise. If ever demonstrated, use a separate explicitly authorized suitable Verify-stage scenario; it must stop at PENDING. Never invoke it on the accepted ACTIVE sample just for a bonus clip.
7. Link the reviewed proof to shot S07 and the matching Devpost paragraph. Only then promote the relevant NOT_RUN row; full bonus signoff also requires the official clause match. Do not mark the entire submission ready from one screenshot.

## What we show today

Native Rovo release-first response, real accepted clipboard/locks, architecture and source declaration. MCP shot is clearly labelled **Declared MCP tools; authenticated runtime evidence pending**. The draft does not claim bonus completion. [180-second script](demo-video-script.md) · [readiness](submission-readiness-2026-11-22.md).
