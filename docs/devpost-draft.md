# Devpost text — DRAFT ONLY / DO NOT SUBMIT

Prepared privately in the repository as requested. No Devpost page was edited, saved, uploaded, listed or submitted. Reconcile the final accepted build, official contest rules/categories/field limits and actual team details before copying anything into Devpost. The existing signed-in Devpost browser session must be preserved.

## Project name

PermitGuard

## Tagline

Personal-lock accountability and human-confirmed LOTO permit decision support in Jira.

## Inspiration

In group lockout/tagout work, a permit record must never obscure the people whose personal locks still protect them. We wanted the remaining-lock question to be visible where a team coordinates the work, with a conversational assistant that reports recorded state rather than claiming safety authority.

## What it does

PermitGuard adds a Plan → Lock → Verify → Active → Release → Closed clipboard to Jira work items. Workers record their own attributable locks and bounded photo evidence. Named verifiers record checks, and activation stays pending until its assigned human confirms at equipment. High-energy points require two distinct named verifiers in the implemented domain rules; the real two-person browser acceptance is still outstanding.

Release checking includes remaining personal-lock records on shared equipment. The synthetic judge scenario lets a permitted user finish their own lock removal while simulated Crew B's L-07 on V-3 still blocks release and closure. The roleplay is labelled simulation, not another real principal or permission to remove another person's lock.

The native PermitGuard Judge Rovo agent reads deterministic readiness. Its essential distinction is **CLEARED for WORK_START only. This is not release clearance.** An agent can propose a PENDING activation, but it cannot confirm or activate it. Site procedures remain authoritative; QR/photo/checkbox records do not independently prove presence, isolation or safe energization.

## How we built it

The development app uses Forge Custom UI, Jira user-authorized APIs, Forge app storage with conditional revision checks, and app-scoped Realtime invalidations that make authorized clients re-read state. Native Rovo exposes Check readiness and Request activation. A declared Forge MCP module is present; external OAuth MCP-client and Studio custom-agent acceptance remain separate, incomplete checks and are not being represented as demonstrated.

The current demo uses a preloaded Equipment/Isolation points register. A configurable Assets adapter is limited to those types and has API/metadata and local test evidence, not a claim that the judge's built-in-register journey is a fully accepted connected Assets workflow. Instruments, calibration and Teamwork Graph are excluded.

The runtime has no external service/egress, SQL, Forge LLM API or Containers. No scheduled jobs are configured. Optional Confluence macro/archive code exists but Confluence is uninstalled for this Jira-only demo; archive publication/compliance retention is not part of the accepted claim.

## Challenges

Readiness has different meanings at work start and release. We separated the machine fields and made Rovo explicitly say WORK_START is not release clearance. We preserved user-entered QR/checkbox/file controls while saving, reconciled versioned invalidations without resubmitting uncertain mutations, and kept permission/register checks fail-closed.

Two same-name Rovo agents turned out to be legitimate registrations from Jira and Confluence installs of the same app—not stale agents. Removing only the optional Confluence installation restored the one-agent picker while preserving Jira. A separate opaque Agent not allowed validation failure was intermittent in the observed CLI/deployment sequence; we do not claim a proven internal provider cause or a verification bypass.

The current startup candidate begins issue-context and live-state reads together and may show a clearly labelled historical Jira-property preview before cold Forge authorization finishes. Preview is never live clearance or an action source. The owner’s single 5.13.0 run is reported below; repeat measurements and preview diagnostics are still needed. Local tests are not a latency benchmark.

## Accomplishments and evidence

Owner browser checks on 21 November ~21:05 UK confirmed one PermitGuard Judge, a new-chat WORK_START-only/non-release answer, and inline cold-loaded PGSAMPLE-2 with readable labels, ACTIVE/site revision 22 and one L-A1 lock. Earlier dated owner tests covered photo/QR activation, preserved Saving inputs and the simulated other-crew release barrier. Read-only Jira history checks confirmed accidental assignee shortcut edits were restored without a description change. See the dated evidence documents for exact versions and limitations.

On 22 November ~09:05 UK, the owner retested **5.13.0**: the release blocker was above the fold and one agent remained. A reported cold reload showed the frame at about 3.8 seconds and live state about one second later, estimated 5–6 seconds total. No historical preview was noticed. This single observation is not a controlled latency benchmark or proof of preview rendering. The agent still repeated its caveat, so single-caveat prose was a failed acceptance item—not a shipped success.

The follow-up source **99c1ebc** consolidates redundant caveat strings into one canonical display message and directs Rovo to copy only that message. It adds a real Forge-version/UI-source footer and per-panel preview/live startup diagnostics, with 124 local tests. It is deployed as development **5.14.0** through normal verification; actual generated prose is still pending owner acceptance in the [current release note](preview-and-rovo-2026-11-22.md). Do not claim that a test count, metadata receipt or script alone proves a live feature or a recorded video.

## What we learned

A historical preview can improve orientation if it arrives first, but it should never delay a faster live response or enable safety-related actions. Those still need current authorized server state. A live-update subscription is not a physical safety signal, and an assistant's confident prose must not broaden the scope of a deterministic result. Clear human attribution and explicit failure are more important than making every screen green.

## What's next

Confirm the canonical one-caveat response and preview lifecycle from actual browser diagnostics, repeat cold-load measurements, complete real Rovo proposal/Studio/external MCP and high-energy two-person checks, validate actual workflow/JQL behavior and capacity/recovery, and design the optional restricted archive with an administrator. Conflict guard and shift-end suspension remain future work, not implemented demo claims. Production is a separate gated plan, not a publication or qualification completed here.

## Submission fields still requiring verification

- Official contest category/bonus eligibility and deadlines; Specialized Industries/MCP are the intended targets, not a claim of eligibility or completion.
- Actual team members and roles, ownership/rights to media and open-source dependency attribution.
- Final accepted source/release hashes, repository URL https://github.com/Mizzen-Studios/permitguard and a real privacy-reviewed video link. No video has been recorded/exported/uploaded by this task.
- Any word/character limits and required attestations. No made-up visitor numbers, safety outcomes, ROI, certifications, customer deployments or latency improvements.
