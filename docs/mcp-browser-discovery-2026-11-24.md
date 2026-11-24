> **Owner completed route A at 13:03 UTC:** PermitGuard DEV 5.15.0 Up to date. Actual TOOLS UI shows only an app-wide disabled exposure switch, no tool names or per-tool checkboxes. This establishes exposure OFF, not individual discovery. Do not repeat the inspection or enable it for evidence. [Current assessment](mcp-exposure-assessment-2026-11-24.md) supersedes selective-tool expectations.

# Browser-only PermitGuard tool discovery — optional, no client or Publish

24 November 2026. External OAuth-client invocation is **parked by the owner** and not a core-pack blocker. These steps require only your existing signed-in Atlassian browser session and suitable existing site/Studio permissions. No shared tokens, new client, OAuth grant, operational tool call or public/private agent publication.

**Evidence limit:** an Atlassian app-tool catalog/Studio picker shows discoverability in that UI. It is **not** a raw MCP tools/list receipt, successful tools/call, or proof of runtime principal/permission handling. Even a good screenshot leaves authenticated invocation **NOT_RUN / PARKED**.

## A. Completed read-only route: installed-app exposure screen

Official source: [Configure tools for an external MCP server](https://support.atlassian.com/organization-administration/docs/configure-tools-for-an-external-mcp-server/). This is inspection only; unlike yesterday's external-client handoff, do not enable anything.

1. In your existing signed-in browser, open **admin.atlassian.com** and select the organization containing **one-atlas-xitr.atlassian.net**.
   **Expected:** administration for the correct organization. If you lack administrator access, stop; don't add roles or switch to another identity.
2. Navigate **Apps → Sites → one-atlas-xitr → Connected apps**. Find **PermitGuard** and select **View app details**.
   **Expected:** this existing Forge app, UUID **60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**, Jira install **35a88eb5-064f-489a-8a92-9a65a87a7f2a** where IDs are displayed. No new install/upgrade.
3. Open the actual **TOOLS** section. **Look only**; do not click **Enable tools** or the exposure switch.
   **Observed:** one **Expose tools to MCP-compatible apps** switch, DISABLED, with a broad action-access warning. No individual tool catalog was shown. The earlier expectation of named rows was inaccurate.
4. Capture a cropped screenshot showing app/site and the exposure switch/current state; redact account menus and unrelated apps. Owner already supplied an external screenshot reference. Return the UTC time and which route you inspected.
   **Result:** owner-reported installation/exposure-state evidence only; no individual tool discovery, permit/config changes or tool invocation. If the section is missing or permission-blocked, send that safe observation instead. Do not infer runtime exposure from the deployed manifest alone.

## B. Studio connected-app picker — only with an existing unpublished draft

Official navigation source: [Build a hello world Rovo MCP](https://developer.atlassian.com/platform/forge/build-a-hello-world-rovo-mcp/), retrieved HTTP 200 on 24 November. Its published fresh-agent tutorial goes on to Publish; we stop much earlier.

1. On **one-atlas-xitr**, open **Ask Rovo → agent selector** and your **existing unpublished custom-agent draft** in its configuration editor/Studio. Do not edit the installed PermitGuard Judge or a shared/published agent.
   **Expected:** a draft you already own, not a newly published second Judge. If you have no existing draft, stop here: Create agent can persist a draft, so it is not guaranteed strictly read-only. Do not create one under this checklist.
2. Open **Tools → Add tools → Connected apps → PermitGuard**. Browsing the picker is sufficient; **do not press Add**.
   **Expected:** **Check readiness** offered as a tool from the installed PermitGuard MCP module. Capture its label/description/input schema if the UI offers a non-mutating detail view. Don't substitute built-in Jira tools or the native Forge Judge's actions.
3. Capture the tool list and the visible draft/Publish controls without saving/publishing. Close the picker using Cancel/Back if needed; do not discard someone else's edits.
   **Expected:** Studio-connected-app discovery evidence. No Test/Preview/chat is requested this run, and no actual MCP call is claimed.
4. If the UI requires **Publish**, new app consent, agent creation, role changes or a saved tool addition just to inspect discovery, **stop and send the safe blocker**. The official tutorial does not guarantee a no-Publish draft test path, so do not improvise one.

## Return only

- Route A and/or B, UTC timestamp, correct site/app identity.
- Cropped catalog/picker screenshot and actual listed tool names (plus exposure states if displayed).
- Whether any gate prevented inspection; explicitly **no toggles/Add/Publish/tool invocation**.

No credentials, OAuth codes, tokens, cookies, full account menus or HAR files. Neither route un-parks the bonus proof automatically. No signed-in route is guaranteed for every site permission/rollout; a missing picker/catalog is an honest blocker, not a reason to publish or broaden access. [Bonus audit](mcp-bonus-readiness.md).
