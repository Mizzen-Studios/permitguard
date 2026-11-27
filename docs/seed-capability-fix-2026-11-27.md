# Seed button forwarding fix — 27 November 2026

[Owner report](evidence/2026-11-27-owner-2.3-seed-blocked.json):2.3 header/footer/route connected, about8s, but missing seed control. Cancel/confirm/persistence blocked, not passed; no sample-loader click/site write inferred.

## Confirmed root cause

Service returns capabilities.seedEmptyDemo from native project/site admin + Edit Issues and safe empty-app-project guards. createForgeWiring rebuilt the capability response with assetsImport/sampleRoleplay but omitted seedEmptyDemo. Renderer requires the positive flag, hiding the button. Earlier backend tests asserted service eligibility and mutation separately; UI fixtures supplied the flag. Neither covered eligibility through the real response adapter.

Fix: explicitly forward **seedEmptyDemo: result.capabilities?.seedEmptyDemo === true**, retaining the whitelist and archive adapter authority. No permission, emptiness, revision, history or Enforce guard weakened. Ordinary Jira issues do not block setup: no issue search/enumeration is an eligibility input, only PermitGuard project permit history.

UI promises a below button only when eligible; false eligibility explains no-overwrite/permission/policy constraints, absent metadata asks for read/refresh instead of promising a control. No extra API calls, egress, scopes, modules, workflow, schedule or schema.

## Regression evidence

Native Jira permission/issue adapter → service → actual Forge response → real UI/DOM-handler tests fail before fix (flag undefined). After fix: project-admin and site-admin, Cancel zero writes, Confirm one conditional write/six items/Warn-only/no permit, reread persistence/no repeat button. Member/no Edit Issues/closed app-permit history stay nonwriting/hidden. Fixture refuses Jira search; ordinary issues are not counted. Strict-boolean/untrusted-capability tests preserve archive authority. These are local executable integrations with fake Jira transport, NOT live Forge/browser acceptance.

Owner rerun after release: fully reload issue → PermitGuard section or issue apps icon under title, never site-sidebar Apps. Check latest marker; Cancel keeps0; Confirm gives6synthetic/Warn-only/no permit/locks; reload stays6/no duplicates, seed button absent. Do not use Load confirmed sample, reset data, create permit or enable Enforce. If still unavailable, send exact new empty-state wording and policy without bypassing guards.
