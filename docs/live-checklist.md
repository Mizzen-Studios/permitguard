# Demo-site live acceptance checklist

Status at 15 November 2026: demo site **active** at https://one-atlas-xitr.atlassian.net (expires 2027-02-13); Assets workspace discovery HTTP 200, 1 workspace. App registration/deployment **BLOCKED by overage-billing agreement**, declined under the zero-cost rule. Interactive checks also require browser sign-in. See [dated check results](demo-site-checks-2026-11-15.md). Read platform-feasibility.md for the Connect-only delete endpoint issue.

## Credential and site handoff

1. Receive the token privately; never repeat in Discord, logs, shell history, screenshots or commits. Use the account email supplied privately by the owner (Google sign-in).
2. Store FORGE_EMAIL and FORGE_API_TOKEN in a private env file outside every repository, chmod 600. Prefer the OpenClaw private secrets directory. Do not place even a real-secret sample in the repo. Avoid command-line token literals and shell tracing.
3. Inspect installed Forge CLI version/help. Use the real supported login flow with private environment input, then forge whoami to verify the intended account without exposing credentials. Google sign-in is not a substitute for an API token.
4. Run forge site provision. Reuse any existing active demo site; collect URL, products and expiry. Provisioning can continue after Ctrl+C; re-run provision to recover status instead of duplicating. Never add a card or enable a paid upgrade. Record actual provisioning result, not just command success.
5. Register app, configure genuine app ID and required scopes, lint, build, deploy development, install. Keep install default Warn-only. Judges likely need site/admin install rights on their own sites. No Marketplace listing, public outreach or Devpost submission.

## Report early: capability matrix

Refer to the dated results above: Assets workspace discovery is PARTIAL; app-level live checks remain blocked by registration/billing terms. This checklist defines remaining acceptance, not completed features.

| Capability | Minimum live proof |
| --- | --- |
| Assets | Discover real workspace; list/read Equipment and Isolation points only; handle missing entitlement and 403 without paid upgrade; built-in fallback stays usable |
| Rovo agent | Installed agent discoverable; check_readiness returns NOT CLEARED for incomplete permit; request_activation creates only PENDING assigned to named verifier |
| Rovo Studio | Add the app's tools to a newly configured custom agent; same deterministic outcomes, identity/permissions and pending-only behavior |
| rovo:mcp Preview | Module deploys; admin-enabled tools shown in Connected apps; where authorized, OAuth external client calls check_readiness and gets NOT CLEARED; disabled exposure is denied |
| Workflow validator Preview | Add to a dedicated company-managed sample workflow; blocked Start and Release cannot transition; own-rule list and disable work; read back disabled state and successfully transition after disable |
| Validator delete | Probe owned test rule only; report documented Connect-only restriction honestly. If unavailable, demonstrate Jira-admin manual remove and keep requirement PARTIAL, not PASS |
| Custom UI camera/QR | Physical tablet/browser iframe permits photo capture; granted/denied/no-device paths; QR identifies expected equipment and expired/wrong-equipment codes are rejected; no fake stream as hardware proof |
| Realtime | Two separate authenticated browser contexts see authorized lock changes without refresh; removed permissions/disconnected clients cannot act on stale readiness |

Do not install gates on real workflows until disable/recovery has been proven in an isolated test workflow. Do not uninstall an enabled gate to discover whether it bricks transitions: document fail-closed behavior and require pre-uninstall cleanup. Any uninstall test needs explicit owner approval and isolated recovery plan.

## Functional and safety acceptance

- [ ] Fresh install Warn-only; only project admin opts that project into Enforce. Default fail-closed; fail-open explicitly selected, visually obvious and audited with alert. Project scope not silently widened.
- [ ] Sample loader asks first and names its writes: six Equipment items plus associated isolation points. Enables Enforce only for its confirmed dedicated sample project. No instruments or calibration schemas/fields/data access.
- [ ] Plan → Lock → Verify → Active → Release → Closed, one primary action per screen. Personal locks include lock ID, accountable identity, timestamp, required Enforce photo; high-energy points require two distinct authorized people.
- [ ] Unavailable Assets/readiness: “Can't confirm readiness (Assets unavailable)” with retry and separately authorized override/reason and admin Warn-only paths. No accidental allow from null/missing state.
- [ ] Assigned verifier scans QR at expected equipment and confirms on tablet. Wrong user, replay, stale permit version and wrong equipment rejected. QR is a presence workflow aid, not irrefutable location proof.
- [ ] Agent cannot confirm onsite, activate, release energy, remove another worker's lock or clear safety blockers. PENDING request, confirmation, reasons and state changes produce audit records.
- [ ] Seeded Crew B produces “Crew B's lock L-07 is still on V-3”; Release blocked across permits/crews. Judge reproduces within two minutes. One-click removal limited to explicitly marked sample data / Play Crew B identity, not a production bypass.
- [ ] Simultaneous lock add vs release and activation vs changed isolation produce no stale allow; enforce server-side atomic revision/concurrency behavior.
- [ ] Automation/JQL derived state reflects permit changes and timestamps; forged/stale issue property cannot clear authoritative readiness. Dry-run reports would-block transitions without altering workflow or permit state.
- [ ] Admin scope list matches actual manifest; app-touched data and uninstall residue documented. Own gates enumerable, disable read-back verified, unsupported delete shown with manual recovery.
- [ ] Closed permits archive once, idempotently, to selected restricted monthly Confluence page. Verify actual ACLs and caller permissions; never publish to an unrestricted space as fallback. Macro prints “snapshot at <time>” including disconnected/stale status.
- [ ] OSHA link resolves to official 1910.147; mapping labeled informational, no compliance claim. Site procedure remains authority; no offline mode.
- [ ] Conflict guard and shift-end suspend remain README-only nice-to-haves unless genuinely implemented and tested; not implied in demo/video.

## Cost evidence for each bounded judge run

Record run ID, app version, site, start/end, query count and query elapsed-ms sum if SQL exists; include platform usage before/after and state any dashboard aggregation delay. SQL compute billing is distinct from client latency. If no SQL is provisioned, report “SQL not provisioned; 0 SQL calls”; do not manufacture a measured SQL time. Capture total app allowance headroom, Rovo credit use separately, storage and logs. No external app egress, paid API, Forge LLM, container, sub-hour schedule or card. Stop if proceeding risks charges or requires new payment authority.

## Completion report

Return demo URL, expiry, actual Forge app version, each early-check PASS/PARTIAL/BLOCKED with evidence, current public commit and remaining blockers. Never mark documentation research or local mocks as live acceptance. Report unavailable features promptly; retain safe register/panel fallback without pretending it is Jira workflow enforcement.
