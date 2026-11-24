# Redacted owner MCP receipt — 24 November 2026

**Classification: PASS_OWNER_RECEIPT** for the requested authenticated Forge MCP read. Owner-operated Linux run, not a maintainer replay or an independently captured raw transport trace. [Structured transcription](2026-11-24-mcp-owner-receipt.json).

## Provenance and redaction

Original private text: receipt-2026-11-24.txt, SHA-256 **84bcf38d38beecb8e71ae5d8b44d81ff872926574e40e8bb68b7deac9c581d3d**. Maintainer read the actual file; original remains outside Git unchanged. This public transcription omits the operator's personal name, local paths and internal permit ID. No tokens, codes, cookies, secrets or full consent/callback URLs are included. No screenshot/video/raw MCP log was supplied; no screenshot hashes are invented.

## Actual run

- Inspector **2.16.0**, Node **24.22.1**, npm **11.21.1**, on owner's Linux box; loopback, memory secret store, token persistence none.
- Development **5.16.0 / UI 5f92b0c1b926**, one-atlas-xitr.atlassian.net; exact registered-app endpoint **https://mcp.atlassian.com/forge/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90**. Streamable HTTP, reported MCP protocol 2025-03-26.
- Exposure **OFF → ON** for PermitGuard DEV only. OAuth succeeded with **sharing OFF**, no new sharing/payment/roles. Consent said **“Read, Write, and Search”**: this is broad app-level authorization, **not** a read-only OAuth scope grant.
- At **21:06:16 UTC**, exactly one discovered tool: **check_readiness_development**, labelled **READ-ONLY, IDEMPOTENT**, with required string **issueKey**. The source declaration is check_readiness; **_development is part of the actual discovered name**. Future environments may name differently; discover rather than guess.
- Exactly one business call, input **{"issueKey":"PGSAMPLE-2"}**, sent ~21:06:39.9/logged **21:06:40 UTC**, returned OK in owner-reported **3.77 seconds**. A preceding field-fill locator error sent no request and is not a second call. Duration is one observation, not an SLA.

### Structured result — internal permit ID redacted, other fields preserved

~~~json
{
  "status": "CLEARED",
  "reasons": [],
  "transitionAllowed": true,
  "scope": "WORK_START",
  "humanConfirmationRequired": false,
  "operational": false,
  "message": "Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE. Follow the site procedure.",
  "activationPending": false,
  "releaseStatus": "NOT CLEARED",
  "phase": "ACTIVE",
  "permitId": "[REDACTED internal synthetic permit ID]",
  "revision": 22,
  "siteRevision": 22,
  "permitRevision": 6,
  "policy": {
    "failMode": "FAIL_CLOSED",
    "mode": "ENFORCE"
  },
  "observedAt": "2026-11-24T21:06:43.899Z"
}
~~~

**Interpretation:** status CLEARED, transitionAllowed:true and humanConfirmationRequired:false are scoped to **WORK_START** in the already ACTIVE record. They do not override **releaseStatus NOT CLEARED**, do not authorize release/energization, and do not prove physical isolation or presence. operational:false remains explicit.

## State and cleanup

Before panel **21:03:55 UTC**: site revision **22**, ACTIVE, release NOT CLEARED, lock **L-A1**. After fresh panel **21:09:18 UTC**: same site revision, phase, release result and lock, same version/footer. **The panel did not display permitRevision before/after**; returned **6** is known, but a before=6/after=6 comparison was not observed and is not asserted.

Owner verified exposure **OFF after reload** (Disabled / Enable tools), disconnected Inspector and stopped it with SIGINT, and removed the new **MCP Inspector** grant at id.atlassian.com/manage-profile/apps. Other apps were untouched. Sharing remains OFF. Cleanup is owner-observed, not a guarantee that all platform logs or earlier copied data were erased.

## Classification boundary

This supplies the missing genuine MCP-path evidence, distinct from native Rovo action use, a manifest declaration, an unauthenticated 401 or an app-catalog screenshot. Combined with deployed GET-only rovo:mcp metadata, it supports the official MCP **technical** clause. It is not full contest eligibility, production qualification, a judge-install acceptance, submission or award confirmation.

**Exposure stays OFF.** Any future judge-access exposure requires **Olly's explicit OK** and an approved supported installation/access plan. [Official-rule alignment and pre-submission gates](../codegeist-rules-alignment-2026-11-24.md). No automatic toggle or publication is authorized by this receipt.
