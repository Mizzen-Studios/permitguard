# PermitGuard planning-agent skill

**ADMIN-ENABLED ONLY.** This file does not enable an integration. A site/org administrator must enable PermitGuard tools in Connected apps, and each external client must complete Atlassian OAuth consent. No anonymous readiness endpoint. No instruments/calibration queries, physical-safety inference or schedule-edit authority.

Modules: rovo:agent + action + Preview rovo:mcp. Atlassian-hosted MCP endpoint pattern: https://mcp.atlassian.com/forge/<registered-app-UUID>. Registered app UUID (shared across its environments): 60f4bdda-1062-4e5b-aab6-1d9a9cf53a90. Another site's separately registered clone uses its own UUID. Studio/custom-agent and external-client acceptance remain owner browser tests, not claimed passed.

## permitguard_check_readiness — candidate MCP GET / read-only

**SOURCE_ONLY / NOT_DEPLOYED:** this branded base key replaces only the MCP binding in the new candidate; the native GET remains check_readiness. Production 2.0.0 and the historical DEV receipt still use the prior base key. Discover actual installed tool names only after separately approved exposure; never hardcode the historical _development suffix for Production. Private distribution installs the same registered UUID; judges do not register a clone. [Two-person candidate guide](docs/second-crew-demo.md).

Input: {"issueKey":"PGSAMPLE-1"}. Caller identity comes from the trusted Forge principal; issue access is independently checked as that caller. No actor/project override inputs.

Output: status "CLEARED" or "NOT CLEARED", reasons, phase, permitId, revision, policy, observedAt, operational:false. Missing authorization/unsupported invocation returns an explicit ERROR, never clearance. In Verify or while activation is pending, status is always NOT CLEARED and transitionAllowed is false: only the assigned human can confirm at equipment. Output also includes siteRevision, permitRevision, scope, activationPending and releaseStatus. In Release, reasons report shared-lock release blockers. In Active, scope WORK_START readiness concerns confirmed work prerequisites only; it is not release clearance. A read never advances operational revision. CLEARED means recorded prerequisites satisfy the model, **not physical safety or permission to work**. Warn-only advisory transitionAllowed:true is not CLEARED.

If NOT CLEARED, report the reason and propose rescheduling through a separately authorized scheduler. Do not remove locks or change policy to resolve a schedule conflict. A simulated sample reason can be: "Crew B (SIMULATED)'s lock L-07 is still on V-3". Private other-issue details can be redacted. Never invent a successful reschedule without that scheduler's receipt.

## request_activation — native Rovo CREATE / proposal only; NOT AN MCP TOOL

Input: {"issueKey":"PGSAMPLE-1","verifierId":"<named human account ID>"}. The caller must be a permit participant and the verifier already named on the permit. It proposes PENDING activation; it does not activate, verify, or remove locks.

The assigned human scans the equipment QR and confirms on the tablet. All personal locks and one/two-person point verification must already satisfy the model; advisory policy never bypasses this. The server records proposal/confirmation actors and timestamps in the audit trail. QR and explicit user attestation are not independent location proof.

No confirm_activation tool is exposed to agents. No agent override. Do not blindly retry uncertain CREATE calls: inspect the permit/PENDING request first. No arbitrary idempotency-key or scheduling input is currently implemented. CREATE invocation from Rovo Automation triggers is not promised; use the supported native Rovo action path only. MCP exposes no CREATE tool; do not attempt request_activation through MCP.

## Planning example — illustrative, not live evidence

1. Planner calls check_readiness for PGSAMPLE-1 during Release.
2. Tool reports NOT CLEARED with the actual shared-lock blocker (private other-issue details may be redacted). A legacy simulated example must be labeled as such, never presented as a second authenticated person.
3. Planner proposes moving Crew A's slot through its separately authorized scheduling workflow, preserving the blocking reason.
4. A human deals with locks through the site's procedure. The planner never treats a calendar change as isolation clearance.

## Required user-facing presentation

For a readiness answer, copy the complete tool **message** exactly once, with no introduction, paraphrase, separate Scope field, repeated caveat or summary. It already includes the WORK_START-only/no-release-clearance boundary, phase, release status and blockers. The redundant mandatoryNotice/displayStatus display strings are removed; machine status/scope/reasons remain data, not extra prose. Never drop the boundary or treat machine CLEARED as standalone work/release/energization authority. Explain reason codes in plain words; never emit a bare code as the explanation. Use plain **Simulated Crew B** only when the returned record is explicitly simulated, not an @mention or possessive. Never relabel actual second-crew records as simulated. transitionAllowed is an advisory machine field and may be omitted from ordinary prose; show/explain it only if requested.
