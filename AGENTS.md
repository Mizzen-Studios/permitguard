# PermitGuard development contract

Public MIT repo: https://github.com/Mizzen-Studios/permitguard
Target: Codegeist 2026 Specialized Industries + MCP bonus. Feature-complete target 8 December 2026; owner-provided deadline 22 December 2026 20:00 UK (verify contest rules before submission).

## Non-negotiable boundaries
- LOTO decision support only. Site permit procedure remains authoritative; no claim of safety certification.
- Equipment and Isolation points only. Never read instruments/calibration; no instrument rules, graph:connector, or Teamwork Graph.
- Zero-cost runtime: no external APIs/egress, paid services, cards, Forge LLM API or Forge Containers. No scheduled jobs faster than hourly. Batch writes, minimal logs; measure actual SQL compute per judge run if SQL is used. Prefer no SQL until justified.
- No Marketplace publication, public promotion, or Devpost submission. Public repository updates are authorized.
- Default Warn-only. Enforce opt-in by project admin only; fail-closed default; explicit fail-open-with-alert policy. Sample loader requires confirmation, six equipment items, Enforce only in its sample project.
- Named human verification; two distinct people for high-energy points. Every worker's personal lock stays attributable; never bypass another crew's remaining lock.
- Rovo proposes PENDING activation; assigned human confirms at equipment via QR then tablet. Agent cannot authorize activation.
- Credentials outside repository in private env chmod 600. Never print secrets. Token supplied by owner only.
- Small working commits; push at milestones, session end and at least hourly during active work. No secrets committed.

## Work priorities
1. Safe defaults, Assets and built-in register fallback.
2. Tablet Custom UI Plan > Lock > Verify > Active > Release > Closed; camera/photo/QR.
3. Preview workflow validator start/release gates and list/disable/delete own transition rules; panel non-admin fallback.
4. Forge Realtime cross-browser board.
5. Seeded Crew B judge path, release blocker in under 2 minutes.
6. Rovo agent/action/MCP deterministic check_readiness and request_activation; test Rovo Studio custom agents.
7. Public admin-enabled skill.md contract.
8. Admin scopes and uninstall footprint.
9. Work-item entity property/custom field for Automation/JQL; dry-run blocked transitions.
10. Monthly Confluence closed register in chosen restricted space; snapshot macro.
11. Verified OSHA 1910.147 reference and on-screen mapping.
Conflict guard and shift-end suspension are future/README-only, never video implementation claims.

## Verification
Separate local model/UI checks from actual Forge/site tests. Never infer Assets/Rovo/MCP/validator/Realtime/camera availability from a mock or documentation. README must list actual scopes, Preview modules, admin installation, connection required/no offline, truthful GitHub Issues maintainer contact.
