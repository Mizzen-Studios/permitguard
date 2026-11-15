# PermitGuard planning-agent contract

**ADMIN-ENABLED ONLY — draft interface, not a deployed MCP endpoint.**

A site/project administrator must enable and authorize this integration. No public unauthenticated endpoint is provided. Do not scrape Jira or infer physical safety. No instruments or calibration data may be requested.

## check_readiness (read-only)
Intended input: work-item identifier and permit identifier in the authorized project.
Output contract: CLEARED or NOT_CLEARED, explicit reasons, permit revision, policy mode, observation timestamp. Missing/stale data or unavailable backing services returns NOT_CLEARED/unknown, never an inferred clearance. CLEARED means recorded prerequisites are satisfied, not that equipment is physically safe. Warn-only mode must remain visible.

If NOT_CLEARED, a planning agent may propose rescheduling a crew through its separately authorized planning workflow. PermitGuard does not grant permission to edit schedules or call external services. Preserve the blocking reason, such as “Crew B's lock L-07 is still on V-3”. Do not remove locks, override policy, or request release to resolve a schedule conflict.

## request_activation (human confirmation required)
Intended input: permit identifier, expected revision, named verifier, proposal reason and idempotency key. The server must derive requester identity and project permissions from authenticated context, not agent-provided roles.
Output: PENDING activation assigned to the named verifier, or denial with reasons. This tool MUST NOT activate work. Assigned verifier must scan the equipment QR and confirm on the tablet; high-energy requirements still require two distinct human verifiers. Keep the proposal and confirmation audit trail.

## Example planning exchange (illustrative, not live evidence)
Agent: check_readiness for permit PG-DEMO-1.
Tool: NOT_CLEARED — Crew B's lock L-07 is still on V-3.
Agent: propose moving Crew A's work slot; ask the authorized scheduler to apply it. Do not claim the reschedule occurred without that tool's confirmed result.

Actual schemas, MCP registration, Rovo Studio compatibility and live verification will be published after the Forge demo-site checks. This file does not itself enable an integration.
