# PermitGuard

**Release-first lockout/tagout (LOTO) decision support inside Jira.** Named people retain control of personal-lock records and equipment confirmation. **The site procedure remains authoritative: this app is not a safety certification, physical interlock or authorization to energize.**

## Current state — 27 November 2026

- **Production2.5.0 · UI 7ceb1ff0f253**, deployed from [7ceb1ff](https://github.com/Mizzen-Studios/permitguard/commit/7ceb1ff0f253ce7200caae24dc5cc032ba896bc1). [Deployment receipt](docs/evidence/2026-11-27-production-core.json). Native2.5 acceptance pending; historical Production2.4.0 seed PASS below does not transfer automatically.
- **Fresh-site onboarding/seed: OWNER-REPORTED PASS**,27-Nov09:01. Issue panel/header/footer/live connection; Cancel leaves zero; Confirm creates six synthetic Equipment records (EQ-1–EQ-6), Warn-only, no permit/locks; reload preserves exactly six/no duplicates/seed button gone. [Exact receipt and limits](docs/evidence/2026-11-27-owner-2.4-seed-pass.json). No screenshots/video received or independently reviewed. “A few seconds” is one observation, not an SLA.
- **Broader fresh-site lifecycle remains NOT_RUN**: Plan/locks/verification/PENDING/QR/activation/release, real second crew, two-browser automatic invalidation, workflow/JQL and archive are not established by onboarding.
- **Preparation only / NOT_SUBMITTED.** Repository code/docs pushes are authorized. No Marketplace form/listing change, public promotion/social post, video upload, Devpost submission, Sharing change or MCP exposure is authorized by this pack.
- Development5.16.0 / UI5f92b0c1b926 remains a separate historical ACTIVE-fixture and MCP evidence baseline. Do not represent it as the Production build. [Evidence index](docs/submission-readiness-2026-11-22.md).

## Judge: install and open the app

1. Site admin uses the **existing private Production/Jira-only Sharing link**, reviews the actual12 scopes and selects an already-entitled Jira site. The link is not reproduced in this public repo and was not generated/rotated by these updates. No repository clone, Forge CLI/token or Confluence install is required for a judge. Never add a card or buy seats/features to complete this rehearsal.
2. Open an accessible Jira issue. Use its inline **PermitGuard** section, or **apps icon under the issue title → PermitGuard** (sometimes labelled View app actions). **Do not rely on the site's sidebar Apps entry**: it returned404 in the owner rehearsal. Optional right-side Open PermitGuard is a navigation guide, not live readiness or a second editor.
3. Check header/footer **2.5.0 · Production · UI 7ceb1ff0f253**, live state and no errors. Fresh empty storage must say **Release NOT CLEARED — no permit**. An empty register is not clearance.
4. For a completely empty synthetic demo project, a project/site admin with Edit Issues may click **Load six demo equipment items (Warn-only)** and explicitly confirm. Existing register/Assets connections, any PermitGuard permit history, unsafe policy and stale revisions are rejected. Ordinary Jira issues alone do not block setup. This creates equipment only: no permits, workers, locks, verification, activation or workflow rules. Enforce is not available on this synthetic register. [Accepted seed flow](docs/empty-project-demo-seed.md).
5. Stop at this accepted onboarding checkpoint unless following the [next bounded browser checks](docs/remaining-browser-checks-2026-11-27.md). Do not click Load confirmed sample as a substitute. The advanced Enforce loader is a separate verified **PGSAMPLE** key+description-marker path, not a requirement for ordinary Warn-only onboarding.

If setup is ineligible, read the displayed reason/permissions/policy and report it; never reset data, overwrite an Assets connection or bypass history guards.

## Implemented, and what evidence supports it

| Area | Connected implementation | Native acceptance boundary |
| --- | --- | --- |
| Plan → Lock → Verify → Active → Release → Closed | Authenticated Custom UI, named workers/verifiers, per-worker lock ownership | Earlier DEV core observations; fresh Production full lifecycle pending |
| Release first | Separate work-start versus release decisions; remaining shared-equipment locks block release/closure | Native DEV read accepted; fresh seeded Production has no permit, so NOT CLEARED |
| Human-only activation | Native agent can propose PENDING only; assigned person QR/tablet confirms; two distinct verifiers for high-energy points | Model/UI/adapter tests; full two-person/device/native proposal acceptance pending |
| Registers | Built-in synthetic setup and explicitly configured Assets Equipment/Isolation points; changed/unavailable connected register fails closed | Production built-in seed PASS; historical Assets asApp read, not all customer Assets configuration |
| Concurrency/Realtime | Conditional site-revision writes; invalidation hints trigger authorized reread | Storage stale-write live probe; connected subscription is not two-browser delivery proof |
| Workflow/JQL | Preview validators/dry-run, own-rule list/disable, derived issue property/JQL aliases | Own-rule list/disable live; actual transitions/indexing/uninstall pending; delete unsupported/manual |
| Optional Confluence | Restricted-space config, bounded idempotent closed-register append, timestamped snapshot macro | Not installed/configured/accepted on the Jira-only judge site |

Never read instruments/calibration, graph:connector or Teamwork Graph. QR/photo/checkbox evidence does not independently establish physical presence or zero energy. Conflict guard and shift-end suspension are future ideas, not implemented video claims.

## Native Rovo and GET-only MCP

**PermitGuard Judge** uses the same deterministic service as the panel. check_readiness returns a release-first scoped result. Native request_activation can propose **PENDING**, never complete activation. No agent confirmation, verification, lock-removal or activation-completion tool is declared.

Production's declared MCP base key is **permitguard_check_readiness**, GET only. Do not guess its remotely discovered name. The genuine owner-run24-Nov Development receipt discovered **check_readiness_development**, made one scoped read returning ACTIVE / WORK_START / release NOT CLEARED / siteRevision22 / permitRevision6 / operational:false, then restored exposure OFF and removed the grant. It is historical text evidence, not Inspector video or current Production transport acceptance. OAuth consent said **Read, Write, and Search**, not read-only. [Receipt](docs/evidence/mcp-owner-receipt-2026-11-24.md) · [caller contract](skill.md) · [judge MCP approval gate](docs/judge-access-plan.md#mcp--needs-olly-ok-at-submission--before-judge-testing).

No new exposure/client/OAuth call is part of readiness preparation. Optional Rovo must already be entitled; do not upgrade plans to complete a check.

## Architecture and developer checks

~~~text
Custom UI / native Judge / GET MCP
             ↓ authenticated principal + fresh Jira permissions
      deterministic bounded service + revision guards
             ↓ Forge Custom Entity Store/KVS
   scoped invalidation hints → authorized server reread
   derived Jira property → nonauthoritative history/JQL
~~~

Node22+; Forge runtime nodejs22.x. Developer clone needs its **own app registration**; never deploy a clone to the maintainer UUID. Credentials stay outside Git in a private environment file.

~~~sh
npm ci
npm test
npm run test:contracts
python3 -m unittest discover -s tests -p '*_test.py'
npm run build
forge lint
npm run check:submission
~~~

Default tests include domain, native authorization/response adapter, UI contracts, SDK bootstrap and claim/timing checks. Local Jira transports/synthetic UI are not customer browser acceptance. Before any authorized release, pin clean source, scan generated artifacts for secrets and verify actual deployment/install metadata. [Developer setup](docs/setup.md) · [root cause lesson](docs/seed-capability-fix-2026-11-27.md).

## Deployed core mitigation — native acceptance pending

The current readiness branch adds conservative lifecycle byte admission headroom and aligns projected START reporting with confirmed ACTIVE. This does not raise storage limits, erase evidence/locks, weaken actor/QR gates or recover legacy-full rows. Only already-authorized legacy drain writes that reduce the reserve deficit and remain below the unchanged hard cap may proceed. [Audit and mitigation](docs/core-audit-2026-11-27.md). Production2.5.0 contains this mitigation; deployment/tests are not native lifecycle acceptance.

## Privacy, scopes, costs and honest limits

Vendor **Mizzen Studios**. [Privacy policy](https://mizzen-studios.github.io/permitguard/privacy.html) · [Terms](https://mizzen-studios.github.io/permitguard/terms.html) · Support [GitHub Issues](https://github.com/Mizzen-Studios/permitguard/issues) (no personal data/tokens); private contact is on the policy.

Personal data, attributable locks and photos are stored in Forge; derived data can be stored in Jira, optional archives in Confluence. No vendor external operational store, external runtime egress, Forge SQL/LLM API/Containers or scheduled jobs. Optional consented MCP clients receive authorized results under their own policies. Hosting/email-provider handling is described separately in the policy. **Automatic personal-data reporting/refresh/erasure, capacity recovery/export/retention and production qualification are incomplete. Published policies are not implementation or compliance certification.**

Exact12 scopes in [manifest](manifest.yml): read:jira-work, write:jira-work, read:jira-user, read:servicedesk-request, read:cmdb-object:jira, read:cmdb-type:jira, manage:jira-configuration, storage:app; optional Confluence read:space:confluence, read:space.permission:confluence, read:page:confluence, write:page:confluence. The four Confluence scopes remain because the macro/archive is shipped; scope removal triggers a major upgrade, not a transparent fix. No scope changes in2.4. Broad management permission is additionally app/site-admin guarded.

Connection required; no offline authority. Aggregate store cap180KB/60permits; photos64,000data-URL characters each. Free allowances are not a spending cap; accepted terms are not a new billing/card authorization. Jira hosts the JSM **agent** work-item panel, not a customer portal app. Before uninstall, list/disable/verify/manually remove workflow gates so fail-closed rules are not stranded. Properties/rules/pages may survive uninstall; Forge storage follows platform lifecycle, not promised instant erasure.

## Preparation pack

- [Current priorities and owner inputs](docs/readiness-2026-11-27.md) · [browser checks](docs/remaining-browser-checks-2026-11-27.md) · [machine ledger](docs/submission-status.json)
- [Marketplace draft pack](docs/marketplace/README.md) — drafts/assets only; no listing change or submission
- [180-second demo script](docs/demo-video-script.md) · [shot list](docs/demo-shot-list.json) · [recording checklist](docs/video-capture-list.md) · [footage intake](docs/footage-handoff.md)
- [Devpost draft](docs/submission/devpost-writeup.md) · [Rules/eligibility evidence](docs/codegeist-rules-alignment-2026-11-24.md)
- [Two-person shared-lock scenario](docs/second-crew-demo.md) — distinct existing accounts, dedicated synthetic project, not roleplay/live-accepted

MIT · [LICENSE](LICENSE). No Marketplace/Devpost publication or award eligibility is established by this repository.
