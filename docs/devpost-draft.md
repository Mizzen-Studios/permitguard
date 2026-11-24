# Devpost write-up — DRAFT ONLY / DO NOT SUBMIT

Repository text only. No Devpost form was opened, edited, saved or submitted, and no video was recorded/uploaded. Verify the remaining 2026 fields, limits and eligibility before copying; the owner-supplied bonus clause is recorded in the MCP audit. Team names and attestations must be supplied by the actual entrants.

## Project name

PermitGuard

## Tagline

Personal locks stay personal. Release readiness stays explicit.

## Inspiration

A group lockout permit is a coordination record, not a substitute for the people protecting themselves at equipment. We wanted the most important unresolved question—whose personal-lock record still blocks release—to remain visible where teams already coordinate their work in Jira. We also wanted an assistant that could explain the recorded state without turning a narrow result into an unqualified yes.

## What it does

PermitGuard adds a human-confirmed LOTO clipboard to a Jira work item. The model follows Plan, Lock, Verify, Active, Release and Closed, with attributable personal locks, bounded evidence and named verification. Activation stays pending until its assigned human confirms at equipment; no agent confirmation tool exists.

Work-start readiness and release readiness are deliberately separate. In the accepted active sample, PermitGuard Judge says: “Release: NOT CLEARED. Work start only: CLEARED. This is not release clearance. Phase: ACTIVE.” The release strip stays at the top of the panel rather than below a long work sheet.

The synthetic Crew B scenario makes the distinction concrete: removing the current worker's own lock does not clear a remaining shared-equipment lock. Crew B is visibly labelled simulation, not a second real principal. The site's procedure remains authoritative. QR, photos and attestations are recorded inputs, not independent proof of presence, physical isolation or permission to energize.

## How we built it

We used Forge Custom UI, Node.js, user-authorized Jira APIs and a shared deterministic service. Revision-conditional Custom Entity Store writes serialize mutations and shared-equipment release checks. Realtime sends scoped invalidation hints; clients reread authorized state rather than treating a notification as permission to proceed. A derived Jira property can orient the user with a clearly historical, nonactionable preview while fresh checks load.

The native Rovo agent exposes read-only check_readiness and PENDING-only request_activation. Both preserve human control. The same two actions are declared through the Preview rovo:mcp module for Studio/custom-agent or consented MCP clients. **The owner-supplied official bonus wording targets this Forge rovo:mcp exposure, and deployed metadata matches it. The route is implemented but not yet authenticated end-to-end. Native Rovo action use is not MCP discovery proof.** We do not claim the bonus is complete.

The demo uses a built-in Equipment/Isolation points register. An optional bounded Assets adapter supports only those types. There is no app external runtime/egress, SQL, Forge LLM API or Containers. Optional Confluence/archive code is not part of the current Jira-only accepted demonstration.

## Challenges we ran into

The hardest presentation issue was that a technically scoped CLEARED could still sound like yes. We consolidated competing display strings into one canonical message and led with release status. We kept entered QR/photo controls intact while saving and kept every mutation behind current permission, register and revision checks.

Startup also needed honest measurement. A panel-only four-second counter had excluded earlier loading while a navigation stopwatch showed a much longer wait. We labelled iframe and panel clocks separately, stopped presenting partial timing as total load, removed a cosmetic profile lookup from reads and stopped waiting for frontend context after an authorized server response arrived. We did not trade away safety checks to improve a timer.

## Accomplishments we're proud of

The owner accepted development 5.15.0 / UI 4e3335fb30f9 on 22 November: one Judge agent, readable clock scopes and release-first, single-caveat Rovo output. In that reload, preview was about 2.7 seconds and live state about 4.3 seconds by stopwatch. Those are one observed run, not an SLA or a controlled performance claim; previous runs varied.

The release-barrier scenario and earlier human QR/photo checks have dated evidence. The current source has 131 local tests, including permission/revision failures and preserved-input contracts. We keep these categories separate: local tests, deployment metadata and actual browser acceptance do not prove the same thing.

## What we learned

A useful assistant needs a precise boundary more than a confident answer. A fast historical preview should never hold up a fresher response or become authority. A status notification is not a physical interlock, and a scheduling change would not remove a personal lock. Human attribution and explicit failure matter more than making every screen green.

## What's next

The official MCP bonus clause is recorded from the owner’s 23 November reading. Authenticated MCP invocation is parked at the owner’s request because no approved OAuth client is available this run; it is not a gate for preparing the core demonstration. Optional browser-only catalog discovery is not a substitute for runtime proof. Complete separate extended checks for native proposals, real two-person high-energy verification, workflow/JQL behavior and recovery/capacity before production qualification. Conflict guard and shift-end suspension remain future work, not demo claims. Production, publication and submission are separate decisions.

## Built with — draft field

Atlassian Forge · Custom UI · JavaScript / Node.js 22 runtime · Jira REST APIs · Forge Custom Entity Store · Forge Realtime · native Rovo actions · Preview rovo:mcp (runtime acceptance pending).

## Links — not new publication

- Existing public MIT source: https://github.com/Mizzen-Studios/permitguard
- Setup/architecture: [README](../README.md)
- Evidence: [submission readiness](submission-readiness-2026-11-22.md)
- Demo video URL: **NOT RECORDED / NOT UPLOADED**

## Internal submission gates — not claims to paste as completed

- [MCP audit](mcp-bonus-readiness.md): current default paragraph above is truthful. Replace it with a demonstrated-use paragraph only after the qualifying authenticated receipt and official clause are linked. Do not claim both Studio and an external client are mandatory unless rules say so.
- Verify canonical 2026 rules URL, category, remaining full-rule conditions, deadline, exact form/character/video limits and team eligibility. Intended Specialized Industries/MCP targets are not organizer confirmation.
- Confirm actual team identities/roles, media rights, dependency attribution and truthful entrant attestations. Do not invent customers, ROI, safety outcomes, certifications or production deployments.
- Match the final video to its actual build and phase. Label shortened waits/earlier inserts; do not show a native action or a mock as an MCP call.
- New exposure/OAuth consent, Studio publishing, production deploy, recording/export/share/upload and Devpost save/submission need the owner's separate decision. None was performed here.
