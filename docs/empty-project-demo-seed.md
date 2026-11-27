> **27-Nov fix:** Production **2.4.0 · UI e8b95c053254**. Prior2.3 seed button failed in the native owner check because Forge response mapping dropped the eligibility flag. Fixed without weakening guards; [root cause/regressions](seed-capability-fix-2026-11-27.md), [current receipt](evidence/2026-11-27-production-seed-capability-fix.json). Native2.4 rerun remains NOT_RUN. Prior dated deployment statements below are history, not accepted seed results.

# Empty-project demo seed — Production2.4.0

Historical Production2.2 already had confirmed **Load dedicated sample plant**, restricted to verified PGSAMPLE with Enforce. That is not a seed for arbitrary empty KAN projects. Production2.3.0 adds **Load six demo equipment items (Warn-only)** inside an empty issue panel, only when the server reports native project-admin + Edit Issues and safe empty-project eligibility. A native confirmation is required; no action runs on load/refresh.

One batched conditional Forge commit creates six synthetic Equipment/Isolation-point records, project scoped. No permit, worker, verifier, photo, lock, activation, workflow rule, new scope, schedule or external resource. Defaults stay Warn-only/fail-closed. It refuses an existing register/Assets connection (including unavailable), any permit history (including closed issues), Enforce/fail-open policy, non-admin and stale revision. A confirmed repeat on this exact synthetic seed is read-only, never overwrites. Concurrent creation is conditional; no retries after uncertain writes.

Seeded data is labelled synthetic and cannot enable Enforce using set_policy. Replace explicitly with an approved real register before enabling Enforce; normal open-permit replacement guards stay in place. Verified dedicated PGSAMPLE Enforce loading remains separate and unchanged. This does not implement real physical setup, prove isolation or seed the two-human Enforce Crew B scenario.

Judge route: **open issue → existing PermitGuard section, or apps icon under the title → PermitGuard**. Do not use the site sidebar Apps entry: owner reported404.

Owner21:05 approved the existing public-repo code/docs push and Production deployment; promotion/social/Marketplace/Devpost remain excluded. Source bd1d3977a97de6650b34b31bc1d11f85b11fb974 / UI bd1d3977a97d, normal deployment success21:06:24.324UTC, [receipt](evidence/2026-11-26-production-empty-demo.json). 232 tests/build/normal lint/SDKbootstrap/secretscan PASS. Sharing configuration/link unchanged; no actual judge-site register seeded by this release.

## Owner browser checks — not yet accepted

Use an existing project administrator with Edit Issues. Do not reset or overwrite a register, connect new Assets, invite users, create a permit, apply locks or enable Enforce for this check. If the seed button is absent, stop and report current register/policy/warning; do not bypass emptiness checks.

1. Fully reload the existing judge issue. Open its PermitGuard section; if collapsed/absent, use the **apps icon under the issue title → PermitGuard**. Do not use site-sidebar Apps (reported404). The optional right-side Open PermitGuard guide should describe this issue-level route, not show readiness.
2. Header and footer should match **2.4.0 · Production · UI e8b95c053254**. Before setup expect Release NOT CLEARED — no permit, empty-register message, no error, live updates connected. Report approximate load time separately, not a synthetic benchmark.
3. Click **Load six demo equipment items (Warn-only)**, then **Cancel** the confirmation. Nothing should change: empty register, no permit/locks. Refresh/reopen to confirm no automatic setup.
4. Click the same button again and confirm. Expect six equipment checkboxes, the explicit synthetic/Warn-only notice, policy Warn-only and success text **Six synthetic demo equipment items loaded. Warn-only; no permits or locks were created.** Release must remain NOT CLEARED — no permit. Do not click Create permit.
5. Reload/reopen the issue. Expect exactly six items, no duplicates, same synthetic/Warn-only state and no permit/locks. Empty-setup seed button should no longer be offered. If a request fails or is uncertain, read/refresh before another attempt; do not reset to force a retry.
6. Optional only if an existing non-admin account is already available: open the same accessible issue; register may be readable, but no seed control should be offered. No invitations/role/seat changes. Skip and report if unavailable.

Return PASS/FAIL for route, matching marker, cancel, confirm/count, persistence/no duplicates, Warn-only/no permit and errors/latency. Native seed acceptance stays NOT_RUN until owner report. This is not camera, physical isolation, real Crew B, workflow or two-browser Realtime acceptance.
