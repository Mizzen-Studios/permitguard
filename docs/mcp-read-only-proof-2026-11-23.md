# One real read-only PermitGuard MCP call — owner handoff

23 November 2026. Target **one-atlas-xitr.atlassian.net**, registered app **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**, existing Jira-only install **35a88eb5-064f-489a-8a92-9a65a87a7f2a**, accepted core **5.15.0 / UI 4e3335fb30f9**. No new app/deployment, operational write, public/private agent publishing, Marketplace/Devpost action or video upload.

## Already verified by the assistant

- Live forge install list: original Jira installation Up-to-date, no Confluence install.
- Live forge version details for development major 5: deployed **permitguard-mcp** properties exactly match source: name PermitGuard; check_readiness / request_activation. The read action's required input is issueKey and its declared actionVerb is GET.
- The supplied official prize clause specifically targets a Forge app exposing an MCP server; Resources says rovo:mcp. [Quote/provenance and matrix](mcp-bonus-readiness.md).
- Existing helper fetched a read-only **derived Jira-property baseline**, not raw CES. No locks/permit/policy/rules were changed. The authoritative comparison still needs a fresh live panel before and after the actual MCP call.
- The normal Forge CLI's developer-skills/MCP features are coding-assistance services, not authenticated execution of this app's exposed tool. A mocked action/CLI function call/native Judge chat will not be substituted for MCP proof.
- Official [Studio tutorial](https://developer.atlassian.com/platform/forge/build-a-hello-world-rovo-mcp/) requires Publish in its documented fresh-agent chat flow. That step is prohibited here; do not follow it. Draft Test/Preview is usable only if the actual UI offers it without publication.

**Current browser blocker:** the default managed profile hit a Playwright initialization timeout. The alternate capture profile successfully opened the target Jira URL; its visible snapshot is **Log in to continue**, with Email/Continue controls. No credential, login, cookie reset, grant or admin toggle was attempted. Thus the remaining browser work is for the owner’s already-authenticated session, not a Forge redeployment.

## Recommended route: admin-selected read tool → existing approved MCP client

This avoids publishing a Studio agent. Steps 2–4 are owner-side access/auth configuration, **not operational permit writes**; the assistant has not performed them. If no approved OAuth-capable client is already available, don't purchase/install one just for this test: use the conditional Studio path or send the blocker.

1. **Capture the before state.** Open [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2), open PermitGuard and Refresh live state. Record footer, phase, **site revision and permit revision separately**, and current release status. Do not change the permit.
   **Expected:** existing accepted build; latest phase/revisions visible. ACTIVE / release NOT CLEARED is the last accepted report, not a state to force by resetting anything.
2. As site/org administrator, open [Atlassian Administration](https://admin.atlassian.com/) → select the correct organization → **Apps → Sites → one-atlas-xitr → Connected apps** → find **PermitGuard** → **View app details**. Confirm the app/site above; don't select the generic Atlassian MCP server or another Forge app.
   **Expected:** this installed app's details, not a Marketplace install/production upgrade. Stop if the app is missing, its environment is unavailable or the UI requests a new install/upgrade/publication.
3. Open **Tools selection** (the tutorial also calls the section **Tools**). Enable/select **Check readiness** (key **check_readiness**) only; leave **Request activation / request_activation** off. If already selected, leave it as is. Use the displayed save control only if required for that tool setting.
   **Expected:** only the read tool exposed for this site installation. This is an explicit admin exposure setting; it does not activate/clear a permit. If the screen offers only all-tools exposure, do not enable it—send a cropped screenshot. [Official admin instructions](https://support.atlassian.com/organization-administration/docs/configure-tools-for-an-external-mcp-server/).
4. In an **existing approved OAuth-capable MCP client**, add/connect a remote HTTP MCP server named **permitguard-proof** with this exact URL:
   **https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**
   Complete its normal Atlassian OAuth consent in your browser and select **one-atlas-xitr**. Review the app's existing scopes/client recipient; stop on unexpected extra access, paid terms or another site. Never paste the Forge/Jira API token as an OAuth token.
   **Expected:** authenticated connection for that app/site; no public URL, new Forge deployment or Studio Publish needed.

   **If your already-approved client is Claude Code**, the official tutorial's command adapted to this app is:

~~~sh
claude mcp add --transport http permitguard-proof https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90
~~~

   Then use **/mcp inside that Claude Code session** to connect/authenticate. This is not an OpenClaw command. Do not install/buy Claude Code if it isn't already your approved client; other clients use their existing remote-server/OAuth UI.

5. Open the client's server/tool list and capture **actual discovery**. Select the tool labelled **Check readiness**, belonging to PermitGuard; its exact transport name may be namespaced by the client/server. Inspect the schema: required issueKey string. Do not guess a namespaced name or substitute a built-in Jira search tool.
   **Expected:** the PermitGuard read tool is listed through this MCP connection. Request activation is not externally enabled; never invoke it even if a stale list shows it. Refresh discovery or stop if the selected exposure doesn't match.
6. Run exactly one call, through that discovered tool:
   **check_readiness({"issueKey":"PGSAMPLE-2"})**
   For a chat-driven client, paste:

   > Use only the PermitGuard MCP server's Check readiness tool, exactly once, with issueKey PGSAMPLE-2. Show the real tool input and result. Do not call native Judge, other connectors/search/Teamwork Graph, request_activation, or any write/repair/confirmation tool. Do not change locks, policy, phase or revisions.

   **Expected:** a genuine tool-call card/receipt with the correct input and successful structured app result, including **phase, scope, releaseStatus, siteRevision/revision, permitRevision, operational:false** and the canonical message. If still ACTIVE, the message begins **Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE.** If the permit has changed legitimately, record its actual current result; don't force this example. **operational:false is expected decision-support metadata, not a failed call.** An ERROR/unavailable/auth response is a blocker, not a clearance result.
7. Refresh the original live panel again without any other permit actions. Compare phase, lock records, **site revision and permit revision** with step 1/the actual tool response.
   **Expected:** no operational changes from the read. Observation timestamps/request IDs can change. A derived Jira property alone cannot prove current CES revisions unchanged; use the live panel/response. If another actor changed state concurrently, report that rather than guessing which request caused it.
8. Send the redacted receipt below in this private conversation. No OAuth codes, access/refresh tokens, browser cookies, HAR dumps or consent/account-menu screenshots.
   **Expected:** enough evidence to distinguish MCP discovery/invocation from native Rovo action use and verify the read-only result.

## Alternative: Studio only if no Publish is needed

1. On the same Jira site, **Ask Rovo → agent selector → Create agent → skip to manual step** (or open an existing approved suitable private custom agent/draft). **Do not edit the installed PermitGuard Judge**, clone/publish a second Judge, or change another shared agent.
2. In configuration, **Tools → Add tools → Connected apps → PermitGuard → Check readiness → Add**. Select only that read tool. A tentative draft name can be **PermitGuard MCP proof (unpublished)**.
   **Expected:** the tool appears under this custom agent's Tools from Connected apps, demonstrating MCP discovery rather than native Forge agent actions.
3. **If an actual Test/Preview chat is available while unpublished**, run the step-6 prompt above and expand the real tool-call result. Capture before/after revisions as above. The published tutorial does not establish that such a draft test exists, so do not assume it.
   **Expected if supported:** one real Check readiness invocation via the selected Connected-app tool, no operational change.
4. **If the only next step is Publish, stop. Do not press it, even if it says private.** Send a screenshot of the tool selection and the Publish/test controls. That is discovery evidence only, not a completed invocation. Use the external route instead if available.

## Receipt to return — fill actual observations, not examples

~~~text
Client/route: [Studio draft Test OR approved client name/version]
Date/time UTC:
Site: one-atlas-xitr.atlassian.net
App/connection: PermitGuard / [app UUID above]
Build shown in panel: [Forge version + UI source]
Discovery: [cropped screenshot or tool list with actual tool name/schema]
Actual MCP tool name:
Actual input: {"issueKey":"PGSAMPLE-2"}
Actual result: [structured JSON or expanded tool-call result, redacted]
Phase / scope / releaseStatus / operational:
Before: site revision __ ; permit revision __ ; phase __
Tool result: site revision __ ; permit revision __ ; phase __
After fresh panel read: site revision __ ; permit revision __ ; phase __
Locks/permit unchanged: [observed / concurrent change / not verified]
Request/call identifier if displayed (no secrets):
No activation/confirmation/write tool invoked: [observed]
~~~

Success requires discovery + a real successful business read via MCP, not just an OAuth 401, a native Judge reply, source declaration or an agent's prose claim that it called a tool. If it fails, send the exact safe error/tool card and the step number; don't repair state or broaden scopes. The assistant will classify the received evidence before promoting runtime proof. No video publication/submission is authorized by this checklist.
