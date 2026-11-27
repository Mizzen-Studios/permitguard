# Questionnaire gap mapping — draft, not submitted answers

Read 27-Nov-2026. Exact official wording in [Forge/app questions](https://developer.atlassian.com/platform/marketplace/app-security-questionnaires/), [partner questions](https://developer.atlassian.com/platform/marketplace/partner-security-questionnaire/), [public Privacy & Security tab](https://developer.atlassian.com/platform/marketplace/security-privacy-tab/). These are three distinct instruments. UNKNOWN means do not tick Yes; proposed answers require full final source/account/operator review. No security audit or dependency scan was commissioned/performed in this asset-only task. Historical tests/scans below are prior evidence, not fresh certification.

## A. Forge app review questionnaire (official Q1–17)

| Question | Supported draft / gap | Evidence / next gate |
|---|---|---|
| 1 / 1a user interactions / asUser | Yes / Yes where applicable | `src/server/jira.mjs` asUser issue, mypermissions, profile, participants and property write; `src/server/assets.mjs` asUser Assets reads. Native permissions acceptance not complete. |
| 2 / 2a / 2b Forge Remote / FIT / remote user permissions | No Remote; subquestions N/A current manifest | No remotes declared. Do not generalize to optional external MCP clients. |
| 3 permissions before asApp user-context calls | REVIEW, not blanket Yes | Normal issue actions use asUser; workflow/maintenance/archive paths require complete route-by-route review. `src/forge/validator.js`, `src/forge/maintenance.js`, `src/integrations/workflow.mjs`, `src/forge/archive.mjs`. Local permission guards are not full native acceptance. |
| 4 / 4a webtriggers / authentication | No declared webtrigger; N/A | Current manifest, not mere presence of historical maintenance source. |
| 5 / 5a display conditions / sole authorization | No displayConditions declared; no sole UI authorization | Server adapter/service checks are authority, not hidden buttons. |
| 6 / 6a–d egress / wildcards / TLS / renewals / external encryption controls | No configured runtime external egress; dependent external-host questions N/A | Current manifest; approved legal-site/email processing and future MCP client distinct. |
| 7 least-privilege scopes | GAP / do not claim unqualified Yes | 12 scopes declared, including four optional Confluence scopes and legacy/optional read:servicedesk-request. Broad manage:jira-configuration; major-version/Sharing compatibility review required before removal. Scope purposes in existing Distribution handoff. |
| 8 sensitive logs | Intended No; REVIEW actual complete logging paths | Policy minimizes codes, not PII/tokens/photos. No fresh log audit in this task. |
| 9 / 9a validate/sanitize all inputs | Controls exist; absolute “all” requires review | Trusted context, bounded inputs, revisions, named-person checks, output handling in service/UI; QR not presence proof. Existing local tests not complete injection assessment. |
| 10 automated dependency review + maintenance plan | Prior automated dependency checks documented; current scan and operator maintenance commitment REQUIRED | Prior Production2.4 release notes report clean locked install/audit0. Not a fresh dependency scan or guarantee vulnerability-free. |
| 11 user Atlassian passwords/API tokens | No collection in app workflow | Platform authentication. Developer CLI credentials are not customer input. |
| 12 / 12a / 12ai third-party tokens / encrypted Forge / external | No configured third-party credential collection; dependent questions N/A | Current no-egress configuration; future integrations need re-review. |
| 13 plaintext exposed secrets | No intended exposure; full fresh scan REQUIRED | No claim based merely on public source or prior scan. New assets have no credentials. |
| 14 / 14a scans | Prior SCA evidenced; no new scan here | Unit/adapter/UI tests ≠ SAST/DAST/pentest. No current SAST/DAST assurance. |
| 15 bug-fix policy read | OWNER_CONFIRM_REQUIRED | Reading a questionnaire isn't acknowledgement of linked policy. |
| 16 notify customers/Atlassian | OWNER_COMMITMENT_REQUIRED | Define incident owner, routes and response plan; no automatic attestation. |
| 17 security contact + ecosystem account | Public mailbox approved; ecosystem account UNKNOWN | Owner must verify actual account and contact assignment. |

## B. Partner security questionnaire (official Q1–28)

Do not infer company controls from this repository, one host or an assistant's tests. All below require the real owner's answers/evidence.

| Official questions | Draft status / missing evidence |
|---|---|
| 1 employee count; 2 prior bans/revocations | UNKNOWN; vendor display name does not establish legal entity, staff size or account history. |
| 3 endpoint protection; 4 workstation FDE; 5 patch process; 6 universal MFA | UNKNOWN organization-wide; do not assert from this Linux VM. |
| 7 server/backup encryption | Forge platform-managed operational storage; vendor workstation/backups and organizational answer UNKNOWN. Do not invent AES256/backup attestations. |
| 8 timestamped audit categories | Each category UNKNOWN organization-wide: failed logins, sessions, app events, API access, permissions, imports/exports, integrations, config, admins, IP/user agents and MFA device changes. App permit history alone does not cover these. |
| 9 logging sensitive data | App policy intends no unnecessary sensitive logs; actual organization logging UNKNOWN. |
| 10 twelve-month log retention; 11 anomaly alerting | UNKNOWN, not established by Forge logging. |
| 12 SCM MFA; 13 required production PRs; 14 peer approval | UNKNOWN; don't invent branch protection or peer policy. |
| 15 OWASP review; 16 integrated security testing; 17 vulnerable dependencies; 18 key rotation | Local security-oriented tests/prior SCA exist; organization policy, OWASP review, ongoing maintenance and rotation commitments UNKNOWN. Never guarantee libraries free of vulnerabilities. |
| 19 strong passwords; 20 comprehensive incident plan | UNKNOWN; must be operator-owned. |
| 21 Marketplace/other bounty participation + interest; 22 regular pentests | Not evidenced. Do not claim participation/pentest or choose future interest for owner. |
| 23 certifications + list; 24 external regulatory audits + share reports | None evidenced; no ISO/SOC2/PCI/HIPAA/compliance claim or reports invented. |
| 25 scans + SAST/DAST/SCA | Prior app SCA only evidenced; organization practice/current scan coverage UNKNOWN; unit tests aren't SAST/DAST. |
| 26 bug-fix policy; 27 notification plan + guide read; 28 security contact/ecosystem account | OWNER_CONFIRM_REQUIRED; public email alone insufficient. |

## C. Public Privacy & Security tab question groups

| Official topic | Bounded candidate / gap |
|---|---|
| Store/process End-User Data outside Atlassian (excluding logs/browser) | Current operational app: No configured vendor external storage/processing. Disclose native Rovo and future consented MCP separately; broader support-email/legal-host scope needs owner assessment. Personal data is still YES inside Forge. |
| End-User Data logs / outside logs / log sharing / integral sharing | Minimize; no configured external app logging or required third-party log sharing. Actual log content/complete flows require review, not blanket No from architecture alone. |
| Remote REST APIs | No custom remote REST API. Atlassian-hosted Forge MCP declared, exposure OFF; describe this explicitly instead of omitting integration surface. |
| Third parties/subprocessors, names/domains/countries/purpose | No vendor external operational host; support email/GitHub and applicable Atlassian/Rovo providers need scoped inventory. Countries/contractual roles UNKNOWN; don't fabricate. |
| Customer-managed egress | Platform-supplied answer; no configured external egress. |
| Data residency locations + migration | Do not select unsupported countries or migration guarantees. Forge managed storage is not proof all app data/artifacts/Rovo/logs have accepted residency/migration behavior. Needs platform-policy review and native acceptance. |
| Post-uninstall retention min/max days | UNKNOWN, no fixed app deletion interval. Jira artifacts may survive; platform lifecycle applies. Never invent numeric days to satisfy required fields. |
| Custom retention + PETs | No implemented custom retention service established; no anonymization/PET claim. Aggregate blockers/restricted authorization do not establish anonymization. |
| GDPR controller/processor; CCPA business/service provider | LEGAL_REVIEW_REQUIRED for each independently; no automatic N/A/exemption. |
| DPA; EEA transfers + approved mechanism | No customer DPA/SCC schedule evidenced; transfer locations/mechanisms unresolved, legal review required. |
| Marketplace bounty | Platform/account fact UNKNOWN; do not claim badge. |
| Security email / security policy | Approved public mailbox in listing JSON; formal security policy and ecosystem contact operating setup not established. This draft is not that policy. |
| CAIQ Lite | Not completed/evidenced. |
| Outside-host FDE | No vendor external operational storage; support/dev systems need separate review, no organization-wide encryption attestation. |
| Access user PATs/passwords/shared secrets | No Atlassian customer passwords/PAT collection; short-lived app QR challenges exist. Clarify exact shared-secret definition before final field answer. |
| Permissions/justification | Actual 12-scope manifest; see existing Distribution worksheet. Do not call strictly minimal or claim Confluence scopes absent. |
| Certifications | None evidenced; no privacy/safety/security certification claimed. |
| Privacy policy | Existing approved app-specific URL in listing JSON; does not cure reporting/erase/retention implementation gaps. |

Public-tab defaults can show “Response not provided by the partner”; no answer is preferable to an unsupported assurance. Future final form mapping must reconcile actual then-current wording and required fields.
