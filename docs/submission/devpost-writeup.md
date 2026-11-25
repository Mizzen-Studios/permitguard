# PermitGuard — Devpost working draft

**Repository draft only. Not saved to a Devpost form, published or submitted.** Actual form limits/entrant declarations still need checking. Intended category: **Apps for Specialized Industries**. Production 2.0.0 now contains the UX/agent polish; new-site install/browser acceptance is NOT_RUN and private link creation is BLOCKED_CONSOLE_LOGIN. Existing owner demo evidence remains Development 5.16.0. [Readiness and evidence](README.md).

## Tagline

Release-first lockout/tagout decision support in Jira, with attributable personal locks and human-confirmed activation.

## Inspiration

A maintenance work item can say the job is ready while a personal lock is still recorded against shared equipment. We wanted the answer to a simple question—“Is this cleared?”—to distinguish work-start readiness from release, instead of flattening both into a reassuring green status. The app keeps that distinction inside the work item while leaving the site's physical isolation procedure authoritative.

## What it does

PermitGuard puts a connected isolation clipboard into a Jira work item. A team plans equipment and isolation points, records each worker's own personal locks, collects named verification and follows Plan → Lock → Verify → Active → Release → Closed. High-energy points require two distinct named verifiers. A remaining personal lock on shared equipment blocks release; one worker cannot remove another worker's record.

The native **PermitGuard Judge** agent reads current readiness. An ACTIVE work item can return **Work start only: CLEARED** while **Release: NOT CLEARED** remains explicit. The native agent can propose **PENDING** activation only when explicitly requested; an assigned named human must confirm at the equipment using the QR/tablet flow. A QR, photo or checkbox is an assertion/evidence record, not independent proof of physical presence or zero energy.

The Forge **rovo:mcp** interface exposes **only the GET readiness tool**, not the proposal. In an owner-run Development test, Inspector discovered exactly **check_readiness_development** and made one authenticated read for PGSAMPLE-2. It returned ACTIVE / WORK_START / release NOT CLEARED / siteRevision 22 / permitRevision 6 / operational:false. The owner restored exposure OFF, disconnected/stopped the client and removed its OAuth grant. Consent still said **Read, Write, and Search**: a read-only MCP interface does not mean a read-only app-wide OAuth grant.

Optional Assets integration reads Equipment and Isolation points, with an explicit built-in register for a synthetic demo. A changed/unavailable connected register must not be silently replaced with samples. The app is decision support, not a safety interlock, physical isolation proof, legal advice or OSHA certification.

## How we built it

The app is built on **Atlassian Forge**, using JavaScript, a Custom UI work-item panel, resolver functions, Jira asUser permission checks and Forge storage. The server establishes the actor and canonical issue independently of tool-supplied identity claims. Conditional site-revision writes reject stale changes, and each personal lock stays attributable to its authenticated worker.

A deterministic domain/service layer generates one release-first human message and scoped machine fields. The Rovo agent uses Forge actions; MCP exposes the same bounded readiness read through rovo:mcp. Native proposal and assigned-human confirmation remain separate operations. Forge Realtime sends invalidations; authorized server rereads determine the current state. Refresh is an honest fallback, not a filmed demonstration of automatic cross-browser delivery.

The app has no external runtime service, SQL, Forge LLM API, Containers or scheduled polling job. That limits infrastructure and avoids introducing a paid model API for this demo, but free allowances are not a spending cap. Optional workflow gates and a restricted Confluence archive have their own permission/configuration boundaries; they are not prerequisites for the minimal Jira sample and are not represented as fully accepted integrations.

## Challenges

Keeping **work start**, **release records** and **physical energization authority** separate was the central challenge. A workflow allowance or agent sentence must never erase an outstanding lock or substitute for a named person's confirmation.

Platform discovery also mattered. MCP's console switch was app-wide rather than a per-tool picker. We narrowed the exposed module to GET-only, then used a real owner-operated OAuth/discovery/read instead of treating a manifest or unauthenticated response as proof. Its Development tool name included an environment suffix, and its consent wording was broader than the sole tool's interface.

## Accomplishments

The owner-run MCP receipt supplies real authenticated-path evidence, separately from native Rovo and local fixtures. The observed ACTIVE response preserved blocked release and operational:false, and the owner confirmed unchanged visible site revision/locks before disabling exposure again. Before/after permit revision was not displayed in the panel; returned 6 is not a fabricated 6→6 comparison.

Local tests exercise stale writes, identity/permission boundaries, named verification, QR challenge binding, shared-equipment lock blocking, read-only readiness and truthful submission-pack claims. New first-run/error polish makes empty, unavailable and uncertain-save states actionable without silently retrying writes. It has local synthetic-browser coverage, not new live production acceptance.

## What we learned

A trustworthy answer is more useful than an optimistic one. Putting release status first, retaining scope in the canonical response and making unknown state visibly unconfirmed reduces ambiguity. We also learned to distinguish implementation, local contract tests, an owner's live receipt and a judge's fresh-site installation rather than calling them all “verified.”

## What's next

The owner is recording the existing 180-second demo plan. Production deploy and a private Jira-only link were approved in the owner request at 21:39 UTC. Production 2.0.0 is deployed; generating the link is blocked by developer-console sign-in. The next gates are that private link and clean-site browser rehearsal, footage review, entrant/media-rights attestations and a separately agreed judge MCP window. Marketplace, MCP exposure, billing and publication remain unapproved.

Recovery/capacity/retention/export and broader live workflow/JQL, automatic Realtime, two-human high-energy and device validation remain separately scoped work before production qualification. Conflict guard and shift-end suspension remain future ideas, not implemented demo claims.

## Bonus prize target — proposed field text

**Primary intended bonus: Best app with Atlassian MCP** (six awards of $1,500 in the supplied Rules). The overview describes projects that “use a Forge app exposing an MCP server”; the governing Rules require tools exposed through the Atlassian MCP server using **rovo:mcp**. PermitGuard implements that module and has the genuine owner-run discovery/read receipt described above. Its public skill.md is supplementary, not a replacement for the module or authenticated tool evidence.

This is a technical fit, not organizer approval, full entrant eligibility or an award guarantee. **Best Agents** is a technically plausible alternative because the app includes rovo:agent, but it is **not added to the selected target by this draft**. The Rules permit at most one Grand Prize and one Bonus Prize for the same submission; do not promise stacked bonus awards. Teamwork Graph and Marketplace bonuses are **not targeted**: no graph integration, listing or Marketplace submission is authorized.

[Prize matrix and source clauses](bonus-targets.md).

## Built with — proposed form values

Atlassian Forge; Jira; JavaScript; Custom UI; Forge app storage; Forge Realtime; native Rovo agent/actions; Preview rovo:mcp; optional Assets Equipment/Isolation points integration. No Forge LLM API or external runtime.

## Links and still-missing fields — preparation notes, not completed URLs

- Source: https://github.com/Mizzen-Studios/permitguard
- License: [MIT](../../LICENSE); public [skill.md](../../skill.md).
- MCP evidence: [redacted owner receipt](../evidence/mcp-owner-receipt-2026-11-24.md), [Rules/hash alignment](../codegeist-rules-alignment-2026-11-24.md).
- Video: **NOT_RECORDED/NOT_RECEIVED** at this draft milestone; do not invent a public YouTube link.
- Judge installation link: **NOT_CREATED**; the demo browse URL is not an installation link. [Plan and tested-to-date limits](../judge-access-plan.md).
- Production/judge-install browser rehearsal: **NOT_RUN**. UX/agent candidate: **DEPLOYED_PRODUCTION_2.0.0**, not yet fresh-site accepted.
- Entrant names/eligibility, team authority, media rights, app contact/privacy details, exact form field/character limits and final selected bonus/category require the actual owner's verification; none is fabricated.
