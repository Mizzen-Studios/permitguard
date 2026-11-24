# Owner Linux runbook — one read-only PermitGuard MCP receipt

Authorized 24 November 2026 at 16:57 UTC: maintainer narrows the MCP tools to GET only and deploys Development. **Owner alone** runs Inspector/OAuth/exposure/invocation/cleanup on their own Linux box. No Studio Publish, app sharing/distribution, production, Marketplace, Devpost or public receipt upload. This file is instructions, not a completed tool receipt. [Development deployment receipt](mcp-get-deployment-2026-11-24.md) must say VERIFIED before proceeding.

## 0. Verify the new deployment and capture before state

Open **one-atlas-xitr.atlassian.net → PGSAMPLE-2 → PermitGuard → Refresh**. Record the actual new Forge version/UI label from the linked deployment receipt, phase, **site revision and permit revision separately**, and lock records. The prior accepted baseline was 5.15.0 / UI 4e3335fb30f9; this approved deployment will change the version/build marker, not the UI logic. Don't reset/reseed or modify the permit to match a screenshot.

Admin still shows **Expose tools to MCP-compatible apps OFF** until you enable it below. Native Rovo still has its guarded request_activation CREATE proposal; **MCP must have only check_readiness GET**. This narrows the MCP interface, not all existing app scopes.

## 1. Start the pinned client locally, no shared tokens

Run **on the Linux machine hosting your already-signed-in browser**, not in the Gateway or an unrelated SSH host. No paid AI account/model is required: Inspector manually sends MCP protocol requests without an LLM. It downloads third-party code through npm. No client was installed/run by the maintainer.

Check prerequisites:

~~~sh
node --version
npm --version
~~~

Inspector **2.16.0** requires **Node ^22.23.4 OR ^24.22.1 OR >=26.12.1**. Older patch versions such as 22.23.3 are insufficient. If incompatible, stop; don't upgrade shared/Gateway runtimes or buy anything. Use an already-approved compatible local environment.

Then in that terminal:

~~~sh
umask 077
HOST=127.0.0.1 MCP_INSPECTOR_SECRET_STORE=memory MCP_INSPECTOR_PERSIST_TOKENS=none npx --yes @modelcontextprotocol/inspector@2.16.0 --transport http --server-url https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90
~~~

Leave this process running. This is **web mode** by default; **http** maps to **Streamable HTTP**. Open the **private local URL printed by Inspector** in the browser already signed into Atlassian on this same Linux machine; if a different browser profile opens automatically, use the printed local URL in the signed-in profile instead. Keep any local access token/fragment private. Do not paste startup URLs, callback URLs or tokens into chat/screenshots. Default web port is 6274; use the actual printed address, not a guessed bearer URL. No public tunnel/portal, no 0.0.0.0 bind, no disabled authentication, no remote client service.

Both secret flags are deliberate: Linux without a keychain can otherwise persist secrets in a plaintext file. Memory storage keeps this process's credentials in RAM; persist-tokens=none prevents newly acquired OAuth tokens outliving the process. It does not erase pre-existing client/browser state, registration metadata, logs or data you choose to save. npm cache/config metadata may remain. Do not use DEBUG output or a full debug export for the receipt.

Published 2.16.0 tarball integrity and its web/launcher transport, endpoint and secret-setting source were inspected read-only by the maintainer; **no authenticated client smoke test is claimed**. Leave inherited ports alone; if a port is occupied, stop the unused Inspector you own or report the conflict, not another service.

## 2. Owner temporarily enables this app only

Open **admin.atlassian.com → your organization → Apps → Sites → one-atlas-xitr → Connected apps → PermitGuard (DEV) → View app details**. This is the same page you inspected (site ID **07414114-107c-4823-9f70-ebb38371bbae**, Development connection).

- Record OFF first. Read the broad warning. Only after the linked deployed module is verified GET-only, click **Enable tools** / the **Expose tools to MCP-compatible apps** switch. Confirm only the requested existing app/site if prompted.
- Expected: **ON**. There are **no per-tool checkboxes** here. The deployed module limits the advertised tool set, not the switch.
- **Stop/cancel** on any request for sharing in the developer console, Studio Publish, new install, production, additional roles, payment, new paid terms or another app/site. Development OAuth with sharing OFF is not yet proven; do not enable sharing to make it work.
- Do not touch GitLab/Box system MCP apps. Enabling exposure alone is not a successful connection or tool call.

If anything fails after exposure is enabled, perform section 5 before debugging further.

## 3. OAuth and actual discovery in Inspector

The command configures the exact endpoint:

**https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**

In the Inspector web UI, select the configured remote connection, or enter:

- Transport: **Streamable HTTP** (not SSE/stdio).
- Server URL: the exact URL above.
- Select **Connect**. When authentication is required, use Inspector's **OAuth/authenticate** control and follow its normal browser authorization flow (labels may differ; do not manually invent tokens).
- In the Atlassian authorization page use your signed-in account, select **one-atlas-xitr**, review the tool/scope/client recipient, and authorize this local Inspector client only. Record the new client/authorization identity privately so it can be distinguished during revocation. Existing app scopes may include writes; the MCP tool list is narrowed, not the whole app's scopes.
- Complete the normal loopback callback back to this local client; do not paste a Forge API token, callback code or access token anywhere. If not signed in, use normal Atlassian browser login, never your Forge API token as a password.
- If DCR/OAuth rejects this client, asks for a secret you don't have, cannot select the installed development site, requires sharing/publication or requests unrecognized extra access, **stop and turn exposure OFF**. A 401/403 is a blocker, not proof of a successful business read. Don't add credentials/scopes, switch to a generic Atlassian server or use a different site as a workaround.

Open the **Tools** view and trigger **List Tools** / refresh discovery. Expected **one callable tool**, representing **check_readiness / Check readiness**, with required string input **issueKey**. Client/server display names may namespace the tool; use the actual returned name rather than guessing. Record the actual schema and connection identity.

**request_activation, confirm_activation, lock/policy/load/reset/close tools must NOT be discoverable through this PermitGuard MCP connection.** If any extra/write tool appears, do not call anything: disconnect, set exposure OFF and return the redacted list. Native Judge retaining its proposal action is expected and unrelated to this MCP tool list.

A genuine tools/list result is protocol discovery proof. The admin switch screenshot or model text alone is not.

## 4. Exactly one manual business invocation

In **Tools**, select the actual discovered readiness tool, enter the issueKey field as **PGSAMPLE-2** (or the JSON input editor below), and select **Call Tool / Run** exactly once:

~~~json
{"issueKey":"PGSAMPLE-2"}
~~~

Do not add actorId, verifierId, operation, confirm, expectedRevision or made-up context. Do not use Load Test, replay, Run as task, automatic retries, an agent loop or a second invocation for cleanup.

Expected: a real tool call/result with **phase**, **scope**, **releaseStatus**, **revision/siteRevision**, **permitRevision**, **operational:false**, and the canonical human message. If the permit is still ACTIVE, expect release **NOT CLEARED**, work-start-only **CLEARED** and the scope caveat. If its legitimate phase changed, record that actual result; don't force or edit it. **operational:false** is the intended decision-support flag, not an error. Authentication/permission/handler errors remain a failed business read even if the transport connected.

Save a redacted discovery list and the real expanded tool card/JSON with UTC time, client version, exact server/tool/input, and before/returned revisions. Exclude auth headers, cookies, tokens, consent/account menus and private worker identifiers where not necessary. Keep the evidence private; no automatic GitHub upload. If you accidentally called twice, disclose it; don't label it a single-call receipt.

## 5. Always restore exposure OFF, even after errors

In the **same PermitGuard DEV app details**, set **Expose tools to MCP-compatible apps OFF**, using the actual disable/switch control. Refresh the page and verify **DISABLED / Enable tools** is back. Capture that safe final state.

- Don't uninstall PermitGuard, remove workflow rules, change sharing or modify the permit.
- If the switch/control is missing or disable fails, immediately disconnect/stop the client, attempt revocation of only its new grant as below, and report **exposure cleanup unverified**. Do not pretend the app is OFF.
- The intended OFF setting is reversible configuration, not rollback of an accidental operational write or data already returned. Existing-token/session invalidation timing is unverified; don't run another business tool just to test it.

## 6. Disconnect and revoke the new client grant

1. In Inspector, **Disconnect** this connection; use its supported OAuth clear/logout controls if offered. Don't export its auth configuration.
2. In your Atlassian browser, open **https://id.atlassian.com/manage-profile/apps** (**Manage account → Connected apps**). Find the **new OAuth authorization/client from section 3**, matching its actual identity/time. Use its displayed **Revoke/Remove access** control and confirm that grant only. This is not the Jira Connected apps uninstall page: **do not uninstall the Forge app or revoke unrelated pre-existing clients**.
3. If the new grant is not listed or cannot be identified uniquely, don't guess. Exposure OFF + disconnected client remain required; report **OAuth revocation NOT_VERIFIED** with the safe screen observation. Deleting an Inspector profile alone is not server-side revocation; stopping the process alone does not revoke a grant at Atlassian.
4. Return to the Inspector terminal and press **Ctrl+C**. The per-process memory secret store ends with it. No rm command is supplied: don't delete guessed global config/token files or other clients' credentials.
5. Refresh the original Jira panel. Compare **site and permit revisions**, phase and locks to the pre-call baseline. Observation timestamps may change; operational state should not. Report concurrent activity rather than attributing it automatically to the read.

## Return the private receipt

~~~text
UTC / Linux Node + Inspector version:
Actual Development version / UI source:
Site: one-atlas-xitr.atlassian.net
Server: https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90
Discovery: [actual tool name/schema; only check_readiness]
Invocation input: {"issueKey":"PGSAMPLE-2"}
Actual structured result / redacted tool card:
Before site revision / permit revision / phase:
Returned site revision / permit revision / phase:
After fresh panel site revision / permit revision / phase:
Exposure OFF verified after refresh: yes/no
Client disconnected/stopped: yes/no
New Atlassian OAuth grant revoked: yes/no/not visible
Locks/operational state unchanged: observed / concurrent change / not verified
Any error, extra invocation or cleanup limitation:
~~~

No tokens/codes/cookies/HAR dumps. No native Judge action, screenshot of source or admin OFF observation substitutes for the actual MCP result. The maintainer will classify the returned receipt before marking runtime proof passed. A failed call/cleanup must be recorded honestly.

## Cost and publication boundary

Owner reports the account has no card. No card/subscription/paid client or hosted resource is requested. This fact alone is **not independently verified billing/overage policy or a guarantee that usage cannot accrue**. Forge usage is still metered; exact Rovo-credit applicability and hard caps are not established. Inspector itself needs no LLM provider. If you require an independently demonstrated hard £0 ceiling, verify account policy/allowance before enabling; otherwise stop without a call. No new payment or usage terms may be accepted by these instructions.

No Studio Publish is required by this client route. If the development sharing-disabled install is unsupported by OAuth, stop and report it—no sharing/distribution/publication workaround.

Sources: [Inspector 2.16.0 npm metadata](https://registry.npmjs.org/@modelcontextprotocol%2finspector/2.16.0), [Inspector source](https://github.com/modelcontextprotocol/inspector), [Forge module reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/), [earlier observed exposure assessment](mcp-exposure-assessment-2026-11-24.md). Inspector UI wording is not claimed personally observed; protocol flags/transport/options were inspected in the pinned published package without executing a client on the Gateway.
