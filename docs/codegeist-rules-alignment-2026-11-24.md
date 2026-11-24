# Official-rule alignment and pre-submission gates — 24 November 2026

**MCP technical evidence: PASS_OWNER_RECEIPT. Overall submission: NOT_READY / NOT_SUBMITTED.** No judge access, sharing/distribution, production, exposure enablement, media upload or Devpost form action is authorized by this document.

## Source provenance — actual owner exports read

Original exports remain private and unchanged in the owner's official-rules-2026-11-24 inbox. File headers say fetched **2026-11-24 21:0x UK**; the minute is not precise. Filesystem save time is not asserted as fetch time. The maintainer inspected the files, not an independently fetched official page. Hashes/line anchors refer to those exact private exports:

| Export / canonical URL | SHA-256 | Relevant lines |
| --- | --- | --- |
| overview-prizes-requirements.md / https://codegeist2026.devpost.com/ | 4696a655bbf74ed17934b3cd7e434062e6be7fddaf152f4c413d5bc83b1c66dc | 93 category; 98 MCP; 106–110 access/video; 157–161 prize |
| rules.md / https://codegeist2026.devpost.com/rules | 27a9253b4ec5e1e9079f98b403acaa1f674ce83e2c3675b7a023a2d89a0ba2a7 | 28–30 dates; 48–65 eligibility; 93 category; 101/240 MCP; 114/132–148 judge access; 126–130 video; 290 precedence |

Only necessary excerpts/summaries are reproduced, not the complete private exports.

## Governing wording and evidence match

Overview line 98: **“6 Best app with Atlassian MCP: $1500 to 6 projects that use a Forge app exposing an MCP server.”**

Official Rules line 101, repeated in prize table line 240: **“All Eligible Submissions that’s a Forge app that exposes tools via the Atlassian MCP server using the rovo:mcp module.”** The next sentence permits combining this with open-source skill.md files; it does not make them mandatory. Rules line 290 says the Official Rules prevail over inconsistent Hackathon materials.

PermitGuard's evidence matches this **technical** route:

1. Registered Forge app, installed Development 5.16.0, with one rovo:mcp declaration exposing only check_readiness GET; native Rovo proposal deliberately remains outside that MCP list. [Normal deployment/readback](mcp-get-deployment-2026-11-24.md).
2. Owner authenticated to the exact registered-app MCP endpoint using local Inspector 2.16.0 while Development sharing stayed OFF. Discovery returned **check_readiness_development**, one required issueKey, READ-ONLY/IDEMPOTENT annotations.
3. One genuine call with PGSAMPLE-2 returned ACTIVE / WORK_START / release NOT CLEARED / siteRevision 22 / permitRevision 6 / operational:false. [Redacted receipt and limitations](evidence/mcp-owner-receipt-2026-11-24.md).
4. Owner observed panel site revision/locks unchanged, restored exposure OFF, stopped/disconnected client and removed its OAuth grant. Permit revision 6 was returned but was not displayed before/after in the panel; no fabricated comparison.

**Conclusion:** authenticated MCP-path proof supplied; not merely a native agent action or a coding-assistance MCP service. The supplied clause does not require both Studio and external-client demos, a Marketplace listing, consumption of a different MCP server, Forge LLM use or Teamwork Graph use for this MCP bonus. Do not claim every Eligible Submission condition is met or any award is guaranteed; Rules make eligibility and judging separate.

Consent displayed **Read, Write, and Search**. The **exposed MCP interface is GET-only**, not the entire OAuth grant or app scopes. The _development suffix is observed environment namespacing; discover the actual name for any other environment rather than hardcoding it.

## Other verified rule text — not automatic signoff

- **Submission deadline:** 22 December 2026, noon Pacific / 3 pm Eastern = **20:00 UTC** (Rules line 28; overview line 51 agrees). Do not infer completion from a prepared draft.
- **Judging window:** 5 January 2027 1 pm Pacific through 3 February 2027 5 pm Pacific (Rules line 30). Access must work when judges test, not only at the instant of submission.
- **Video:** Rules lines 126–130 say less than five minutes, actual functioning footage, public YouTube link, and necessary media rights. Current 180-second script fits the duration plan but **no finished video exists or has been uploaded**. MCP receipt insert must be labelled historical owner-run evidence, not a filmed live interaction; no Inspector screenshots/video were saved.
- **Judge access:** Rules lines 114, 132–133 and 148 require a working installation link and all setup/integration instructions. A private Development demo receipt is not distribution/install-link acceptance. Owner's sharing-disabled app has not completed that gate.
- **Category:** intended **Apps for Specialized Industries**, Rules line 93; industrial LOTO coordination fits the stated audience rationale. It is an entrant selection to make later, not organizer approval.
- **Eligibility/ownership:** Rules 48–65, 116–117, 131 and 154–164 leave age/residency/employment/conflicts, representative authority, ownership/licenses and support attestations to the real entrants. No invented declarations.

## Olly's OK required — pre-submission checklist, not actions to run now

- [ ] **Approve judge distribution/access plan.** Establish the required installation link and supported environment; sharing/developer-console distribution, any production deployment or judge access/invitations require separate explicit OK. Current sharing stays OFF. Do not assume the DEV endpoint alone meets installability in a judge's environment.
- [ ] **Approve enabling MCP exposure for judging.** Current owner demo exposure stays **OFF**. Before submission/judge testing, Olly must explicitly approve the app/site/installations, GET-only tool set, data-access boundaries and availability window. Enable only intended installation(s), verify actual discovery/name, and document admin consent. A judge's own installed site may need its administrator to enable exposure too; enabling only our demo site is not a universal judge-install solution.
- [ ] **Define the approved exposure window and rollback.** Keep access available for the agreed judging test window, not merely a submission-time screenshot; decide who restores OFF/revokes grants afterward. Do not schedule or toggle automatically. Broad Read/Write/Search consent must be disclosed despite the sole GET tool.
- [ ] **Approve final media capture/export/public YouTube publication.** Match actual build/state, label historical receipt insert and edits, verify media rights. Optional future Inspector UI filming requires separate exposure/call approval; no fake UI or screenshots. Current script is preparation only.
- [ ] **Confirm full entrant/category/bonus attestation and complete form fields.** MCP technical match does not sign declarations on anyone's behalf.
- [ ] **Approve Devpost save/submission explicitly.** No form opened/edited/saved/submitted by this task. No Marketplace action; Marketplace bonus is a distinct route not requested here.

Historical proofs remain useful, but **do not re-enable exposure now**. Future approved judge-install discovery/calls must be labelled separately from this owner's single DEV receipt. [Repository-only Devpost draft](devpost-draft.md) · [video script](demo-video-script.md).
