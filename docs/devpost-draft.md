> **Current submission-form working copy:** [docs/submission/devpost-writeup.md](submission/devpost-writeup.md), with [bonus evidence/target matrix](submission/bonus-targets.md). Older background below is not proof of a deployed candidate or submission.

# Devpost write-up — DRAFT ONLY / DO NOT SUBMIT

Repository text only. No Devpost form was opened, edited, saved or submitted, and no video was recorded/uploaded. Verify the remaining 2026 fields, limits and eligibility before copying; the owner-supplied bonus clause is recorded in the MCP audit. Team names and attestations must be supplied by the actual entrants.

## Project name

PermitGuard

**28Nov2026 update — owner09:05 text, not footage:** Production2.6.0/UI1edb05105874 KAN-1 PLAN/read/reload PASS: Warn-only, Release NOT CLEARED,0 locks,You/You. KAN-2 one EQ-1 create (crew Judge timing demo), pending visible,2.3s click-to-success/1.4s footer; reload single PLAN/siteRevision2/no locks. First live10–14s remains poor; sidebar guide/preview HTTP404/eight unknown console messages unresolved. Development5.16/UI5f92b0c1b926 PGSAMPLE-2 ACTIVE/Enforce native Judge under15s PASS, release NOT CLEARED/work-start-only CLEARED/one caveat; film Rovo with Development label. No raw footage received. Any next Production minor needs new owner native recheck before capture; no future-agent-text or new-feature claim before deployment/native check.

Personal-data reporting/erasure groundwork remains **inactive**, not full compliance. Owner retention: customer-site operational data, closed permits/audits/archive copies and synthetic hackathon photos until admin-arranged deletion or uninstall under standard Atlassian lifecycle; no automatic deletion/anonymisation, never alter active lock ownership. Site admin handles human-reviewed in-site erasure; support routes requests, no operational copies. No further privacy engineering in this preparation.

## Tagline

Personal locks stay personal. Release readiness stays explicit.

## Inspiration

A group lockout permit is a coordination record, not a substitute for the people protecting themselves at equipment. We wanted the most important unresolved question—whose personal-lock record still blocks release—to remain visible where teams already coordinate their work in Jira. We also wanted an assistant that could explain the recorded state without turning a narrow result into an unqualified yes.

## What it does

PermitGuard adds a human-confirmed LOTO clipboard to a Jira work item. The model follows Plan, Lock, Verify, Active, Release and Closed, with attributable personal locks, bounded evidence and named verification. Activation stays pending until its assigned human confirms at equipment; no agent confirmation tool exists.

Work-start readiness and release readiness are deliberately separate. In the accepted active sample, PermitGuard Judge says: “Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE.” The release strip stays at the top of the panel rather than below a long work sheet.

The earlier synthetic Crew B scenario illustrates the shared-equipment rule: removing the current worker's own lock does not clear another remaining lock. Crew B was labelled simulation, not a second real principal. The current read-only video plan inspects actual lock records and a source-labelled guard instead of recreating that mutation. The site's procedure remains authoritative. QR, photos and attestations are recorded inputs, not independent proof of presence, physical isolation or permission to energize.

## How we built it

We used Forge Custom UI, Node.js, user-authorized Jira APIs and a shared deterministic service. Revision-conditional Custom Entity Store writes serialize mutations and shared-equipment release checks. Realtime sends scoped invalidation hints; clients reread authorized state rather than treating a notification as permission to proceed. A derived Jira property can orient the user with a clearly historical, nonactionable preview while fresh checks load.

The native Rovo agent exposes read-only check_readiness and PENDING-only request_activation. The Forge rovo:mcp interface separately exposes **only check_readiness GET**, preserving the native proposal action without exposing it to MCP clients. In an owner-run Development 5.16.0 test, Inspector2.16.0 authenticated with sharing OFF, discovered exactly **check_readiness_development**, and made one read with issueKey PGSAMPLE-2. It returned **WORK_START**, **ACTIVE**, **release NOT CLEARED**, **siteRevision 22**, **permitRevision 6** and **operational:false**. This is a real MCP-path result, not a native Rovo reply or mocked call. Consent displayed **Read, Write, and Search**: the MCP interface is read-only, not the app's entire authorization scope. The owner verified unchanged panel site revision/locks, restored exposure OFF, stopped/disconnected the client and removed its grant. The panel did not expose before/after permit revision, so only the returned value 6 is asserted.

The demo uses a built-in Equipment/Isolation points register. An optional bounded Assets adapter supports only those types. There is no app external runtime/egress, SQL, Forge LLM API or Containers. Optional Confluence/archive code is not part of the current Jira-only accepted demonstration.

## Challenges we ran into

The hardest presentation issue was that a technically scoped CLEARED could still sound like yes. We consolidated competing display strings into one canonical message and led with release status. We kept entered QR/photo controls intact while saving and kept every mutation behind current permission, register and revision checks.

Startup also needed honest measurement. A panel-only four-second counter had excluded earlier loading while a navigation stopwatch showed a much longer wait. We labelled iframe and panel clocks separately, stopped presenting partial timing as total load, removed a cosmetic profile lookup from reads and stopped waiting for frontend context after an authorized server response arrived. We did not trade away safety checks to improve a timer.

## Accomplishments we're proud of

Historically, the owner accepted development 5.15.0 / UI 4e3335fb30f9 on 22 November (superseded by the bounded5.16/28Nov evidence above): one Judge agent, readable clock scopes and release-first, single-caveat Rovo output. In that reload, preview was about 2.7 seconds and live state about 4.3 seconds by stopwatch. Those are one observed run, not an SLA or a controlled performance claim; previous runs varied.

The release-barrier scenario and earlier human QR/photo checks have dated evidence. Local tests cover permission/revision failures, preserved-input contracts, fresh judge setup and submission-pack consistency. Counts are reported by the actual test run, not treated as a safety or production certification. We keep these categories separate: local tests, deployment metadata and actual browser acceptance do not prove the same thing.

## What we learned

A useful assistant needs a precise boundary more than a confident answer. A fast historical preview should never hold up a fresher response or become authority. A status notification is not a physical interlock, and a scheduling change would not remove a personal lock. Human attribution and explicit failure matter more than making every screen green.

## What's next

The MCP technical proof is now documented against the owner-supplied official Rules exports. Remaining submission work is judge installability/access, final media and entrant attestations—not another unapproved exposure test. Exposure currently stays OFF; Olly must approve enabling it for the intended judge installation(s) and test window before submission/judging. Current sharing-disabled Development access is not the required judge installation link. Complete separate extended checks for native proposals, real two-person high-energy verification, workflow/JQL behavior and recovery/capacity before production qualification. Conflict guard and shift-end suspension remain future work, not demo claims. Publication and submission are separate decisions.

## MCP bonus — proposed field text, not submitted

The official overview asks for projects that **“use a Forge app exposing an MCP server.”** The governing Rules specify tools exposed via the Atlassian MCP server using **rovo:mcp**. PermitGuard implements that Forge module with a GET-only readiness tool and has an owner-run authenticated discovery/invocation receipt from the exact registered-app endpoint. The discovered Development tool was **check_readiness_development**; its single PGSAMPLE-2 call preserved the distinction between work-start readiness and blocked release. Exposure was disabled and the OAuth grant removed afterward. This supports the MCP technical requirement; entrant eligibility, judge installation access and final submission remain separate.

## Built with — draft field

Atlassian Forge · Custom UI · JavaScript / Node.js 22 runtime · Jira REST APIs · Forge Custom Entity Store · Forge Realtime · native Rovo actions · Preview rovo:mcp (owner-run authenticated MCP read verified).

## Links — not new publication

- Existing public MIT source: https://github.com/Mizzen-Studios/permitguard
- Setup/architecture: [README](../README.md)
- Evidence: [redacted MCP receipt](evidence/mcp-owner-receipt-2026-11-24.md) · [official-rule alignment](codegeist-rules-alignment-2026-11-24.md) · [core readiness history](submission-readiness-2026-11-22.md)
- Demo video URL: **NOT RECORDED / NOT UPLOADED**

## Internal submission gates — not claims to paste as completed

- MCP technical clause/evidence is now linked. Preserve limits: owner textual receipt, one DEV call, broad consent, returned permit revision only; no Studio test or prize confirmation is invented. [Current audit](mcp-bonus-readiness.md).
- [Owner-supplied Rules exports](codegeist-rules-alignment-2026-11-24.md) establish the MCP clause, deadline (22 Dec 2026 20:00 UTC), under-five-minute public YouTube requirement and judge installation link. Still confirm actual form/character limits and entrant eligibility; intended Specialized Industries/MCP selections are not organizer confirmation.
- Confirm actual team identities/roles, media rights, dependency attribution and truthful entrant attestations. Do not invent customers, ROI, safety outcomes, certifications or production deployments.
- Match the final video to its actual build and phase. Label shortened waits/earlier inserts; do not show a native action or a mock as an MCP call.
- The owner’s documented DEV OAuth/read/cleanup is complete. Future exposure for judge access needs **Olly’s OK** and a supported installation plan; sharing/distribution, production, media publication and Devpost save/submission remain unapproved. This repository preparation opened no Devpost form and performs no new toggle or call.

Current essential gates: [remaining28Nov](submission/remaining-2026-11-28.md). Intended selection remains Specialized Industries + MCP only.
