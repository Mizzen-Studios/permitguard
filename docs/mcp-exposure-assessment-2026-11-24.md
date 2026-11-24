# Development MCP exposure assessment — 24 November 2026, 13:03 owner report

## Decision: leave the switch OFF for now

**5.15.0 is the expected installed version. Enabling the current app is not a read-only-only exposure.** The broad toggle is a prerequisite for an external connection, not a tool-call receipt, an OAuth client or a guarantee of £0. The bonus remains parked. No manifest edit, deployment, sharing change, toggle, client installation, OAuth grant or operational write is authorized/performed by this assessment.

### Version relationship

- Accepted runtime source: **4e3335fb30f98f47ebb8442577d1f5b63dd142f7**, deployed development **5.15.0**, UI source **4e3335fb30f9**.
- Source HEAD before this assessment: **cf0115814d2c3a3409cf9a2ee451def09016afbc**. All tracked changes from 4e3335f through cf01158 are README/docs only; app source, manifest and dependency/runtime files are unchanged.
- A Git commit hash is not a Forge version. Pushing submission docs does not deploy or increment Forge. Owner-observed **DEV / 5.15.0 / Up to date** is consistent; no reinstall/upgrade is needed just to match the latest documentation hash.

## What the owner actually observed

Source: owner's read-only admin inspection reported at 13:03 UTC; screenshot referenced at **box:/workspace/research/hackathons/codegeist-2026/screens/permitguard-mcp/01-admin-tools.png**. The assistant has not accessed, copied or privacy-reviewed that external image. Treat these as owner-reported observations, not independent screenshot analysis.

- Site one-atlas-xitr, site ID **07414114-107c-4823-9f70-ebb38371bbae**. PermitGuard **DEV, 1 connection**, Manual, installed 19 November, Development, version **5.15.0 Up to date**.
- Sharing banner: still testing; sharing disabled; enabling sharing directs to the developer console. **Do not enable sharing.** That banner is not proof that a development-only external MCP connection is unsupported; nor do current docs establish that this exact install works with sharing off. Verify without changing distribution if a later test is authorized.
- No individual tool names or per-tool checkboxes. TOOLS contains one **Expose tools to MCP-compatible apps = DISABLED** switch and **Enable tools** button, not clicked.
- Warning: **Allow MCP-compatible apps to use this app's tools. Enabling this gives access to perform any action the app is capable of, on behalf of users.** This is broad capability exposure, not read-only attestation.
- Other system apps named GitLab MCP (read-only) / Box MCP (read-only) are unrelated servers, not a client or proof of PermitGuard's exposure. Do not toggle/use them for this proof.

**Correction to earlier guidance:** the generic admin support article describes per-tool selection for external MCP integrations. The actual PermitGuard Forge UI does not show it. Prior instructions to enable only Check readiness in that UI are withdrawn. Owner-observed UI takes precedence. The observed Forge module definition—not nonexistent admin checkboxes—must constrain the MCP tool set.

## Current tools and risk

| Exposed in current rovo:mcp | Verb | Effect |
| --- | --- | --- |
| check_readiness | GET | Current authorized deterministic decision-support read |
| request_activation | CREATE | Can create a PENDING proposal for a named verifier; an operational write, even though it cannot activate equipment |

The [manifest](../manifest.yml) explicitly exposes **both**. The [action wiring](../src/forge/actions.mjs) dispatches request_activation to the mutating service. Human confirmation and permissions reduce risk, but do not make CREATE read-only. Turning exposure back off cannot undo an accidentally created proposal. A prompt saying “read only” is not capability restriction.

Official [module reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/), retrieved HTTP 200 on 24 November, says a connected client can invoke the actions listed in the rovo:mcp tools property, subject to user permissions. It does not turn existing broad Jira/storage app scopes into read-only scopes. A GET-only module would narrow this MCP interface, not the entire app.

## Conditional plan — not approved or executed

Proceed only after the owner separately approves **a GET-only MCP manifest change/development redeploy**, an exact local client, and the billing assumptions. Do not simply run yesterday's external-client handoff.

1. **Capability prerequisite (assistant, only after approval):** remove request_activation **only from modules.rovo:mcp[0].tools**. Retain its native Rovo action/agent use; don't silently remove an accepted core capability. Keep check_readiness as the sole MCP action. Add a regression check that the MCP-exposed action set is exactly that GET key and that the path performs no operational write. Run normal tests/bootstrap/lint/build/security scan, commit, deploy development normally and read back the module/install. No production or sharing change.
   **Expected:** a new actual Forge version (record it, don't predict the number), sole deployed MCP tool check_readiness; core/native functionality rechecked. This changes the accepted deployment, so it requires explicit authorization. It has NOT been done here.
2. **Owner preflight:** inspect current billing/usage allowances and choose an approved client. No new card, subscription, paid API, hosted callback or AI provider. Agree that no hard £0 guarantee has yet been established. Capture fresh PGSAMPLE-2 phase, site revision, permit revision and lock records.
   **Expected:** known remaining allowance and an approved bounded one-call test; otherwise stay parked. Do not create a proposal or change policy to prepare evidence.
3. **Candidate no-LLM client:** official open-source **MCP Inspector**, running locally on the owner's own computer, can inspect/call a tool without paying an LLM provider. It is a proposal for approval, not an already-approved client or a verified Atlassian integration. Registry checked 24 November: **@modelcontextprotocol/inspector 2.16.0**, Node **^22.23.4 || ^24.22.1 || >=26.12.1**. Its software being free does not guarantee free Forge/Rovo usage or DCR/OAuth acceptance. Don't change the Gateway's Node installation for this.
   **Expected:** private loopback-only inspector, no paid plan, no app publication. An approved alternative client may be used instead; don't install either automatically.

   Only after client approval, on the owner's local compatible machine, the documented command-line settings are:

~~~sh
HOST=127.0.0.1 MCP_INSPECTOR_SECRET_STORE=memory MCP_INSPECTOR_PERSIST_TOKENS=none npx --yes @modelcontextprotocol/inspector@2.16.0 --transport http --server-url https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90
~~~

   This command is sourced from upstream options/package metadata, **not locally smoke-tested**. It downloads/runs third-party code and may create local nonsecret configuration and OAuth registration metadata; the version is pinned. Keep its generated local authentication URL/token private, leave auth enabled, bind loopback only, and do not create a public portal/tunnel. Memory storage avoids the documented plaintext-secret-file fallback on machines without an OS keychain; it does not prove every browser/server log is empty. No credentials in shell arguments, project files or chat. Stop on an unsupported engine/flag rather than improvising or upgrading shared runtime.
4. **Owner temporary exposure:** on the existing PermitGuard DEV app's actual admin details, record OFF, then click **Enable tools** / the broad exposure switch. Read any confirmation before accepting.
   **Expected:** ON for this app/site only, after GET-only deployment has been verified. If it asks for sharing, publication, reinstall, role expansion, paid terms or a different site, cancel and stop. Do not touch the GitLab/Box servers.
5. **OAuth and discovery:** in Inspector select/connect the configured HTTP server, use its normal OAuth flow in the owner's browser, select **one-atlas-xitr** and review scopes/tools. Do not enter a Forge/Jira API token. If OAuth/DCR rejects the client, no installed site is selectable, Development is unsupported, or sharing is demanded, stop; don't enable developer-console sharing or deploy production as a workaround.
   **Expected:** authenticated tools/list for this exact app/site. **Only check_readiness** may be present as a callable PermitGuard tool; capture the real schema/name. If request_activation or any other write tool appears, **disconnect and turn exposure OFF immediately without calling anything**. Do not trust the prompt or a cached list.
6. **One manual call, no agent loop:** select that discovered read tool and enter **{"issueKey":"PGSAMPLE-2"}**. Invoke once using the client's Tools/Call form. Do not use Load test, replay, retries, task loops, generic search/TWG or another server.
   **Expected:** genuine tools/call result with phase, scope/release status, revision/siteRevision, permitRevision, operational:false and canonical message. If still ACTIVE: release NOT CLEARED / work-start-only CLEARED; record actual current state if different. An auth/permission error is evidence of a blocker, not a passed business read. Save only redacted discovery and tool receipt—not OAuth headers, cookies, full debug exports or account menus.
7. **Always cleanup, including any failure after step 4:** return to the same admin page and set **Expose tools to MCP-compatible apps OFF** using its actual disable control. Refresh the page and verify DISABLED / Enable tools is back. If the off control is absent or fails, stop the client, revoke that new client's grant if available, report the unresolved exposure immediately; do not claim cleanup success.
   **Expected:** same observed OFF state as before. Don't uninstall the app, change sharing or remove workflow gates. A subsequent new connection/discovery should be denied/unavailable, but the platform's revocation delay/session behavior is unverified; don't assume an existing connection was instantly revoked or issue another business call merely to check.
8. **Client cleanup and state comparison:** disconnect, clear this server's OAuth state via the client's supported controls and revoke this newly granted client in Atlassian account/security controls if offered (do not revoke existing app installations or unrelated grants). Stop the local inspector; its memory store ends with the process. Local nonsecret config/DCR metadata may remain—inspect approved client controls rather than deleting guessed files. Refresh the live panel and compare both revisions/phase/locks to baseline.
   **Expected:** no operational changes, exposure OFF, client stopped, reviewed receipt. Concurrent changes must be disclosed. Disabling exposure does not erase data already returned, downloaded screenshots, server logs or OAuth registration metadata. Do not post/share the receipt publicly automatically.

## What can and cannot be promised

- **Reversible configuration:** OFF → temporary ON → verified OFF is the intended lifecycle. Actual disable UI, existing-session invalidation and OAuth cleanup must be observed; they are not yet tested.
- **Read-only:** current deployment fails the capability-level requirement because CREATE is exposed. A later GET-only module plus actual discovery allowlist/manual call is the proposed narrower interface; existing app scopes remain broader. No arbitrary action surface or prompt-only assurance is accepted.
- **£0:** no paid service is proposed. Nevertheless Forge calls/resources are metered and the admin guide discusses Rovo-credit usage; its generic/TWG discussion does not establish PermitGuard's exact tariff. External AI clients can also cost money. Remaining allowances/no-overage policy have not been verified. A strict hard £0 requirement therefore remains an unresolved gate, not a guarantee.
- **Unpublished:** normal private development deployment and OAuth are not Marketplace publication, but development sharing/OAuth eligibility is unverified. No developer-console sharing, Studio Publish, production install, Marketplace or Devpost action is permitted.
- **Evidence:** the owner report establishes exposure OFF, not successful discovery/call. The external-off gate explains why an unauthenticated external route cannot be treated as ready; it does not establish the cause of every missing Studio/runtime test. Native Judge and unrelated system MCP apps are not substitutes.

## Sources checked

- [Rovo MCP reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/): listed action keys bound the exposed tool set; OAuth/site permissions; Preview.
- [Admin guide](https://support.atlassian.com/organization-administration/docs/configure-tools-for-an-external-mcp-server/): generic selection/cost discussion; actual observed Forge UI differs.
- [Inspector README](https://github.com/modelcontextprotocol/inspector/blob/main/README.md), [server configuration](https://github.com/modelcontextprotocol/inspector/blob/main/docs/mcp-server-configuration.md), [secret storage](https://github.com/modelcontextprotocol/inspector/blob/main/docs/secret-storage.md), [environment variables](https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md). Mutable upstream docs are reference material, not proof of a working installed client.

Separate future maintenance note: today's module reference says app.rovo metadata becomes required for deployments from **5 January 2027**. No manifest migration was made for this assessment.
