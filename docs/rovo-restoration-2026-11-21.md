# Rovo restoration — 21 November 2026

Owner reports all 5.8.0 auto-load/admin/synthetic release/close and filled-saving fields pass. PGSAMPLE-2 is ACTIVE at revision 22; owner found zero PermitGuard agents and old chats mark the agent deleted. No stale cleanup is needed. The active permit is not reset or mutated by experiments.

Current official rovo:agent docs (updated 2 October 2026) require only unique module key, name (max 30 chars) and prompt; actions/description are optional. Resource prompts need CLI >=10.6.0. Current installed/npm-latest CLI is 15.1.0. Docs note provider safety screening; Agent not allowed alone does not identify its underlying reason. No validation bypass, alternate account/app, paid service or scope expansion is used.

Experiment A uses fresh key permitguard-judge-v2, short ASCII name PermitGuard Judge, short inline prompt retaining WORK_START-only/not-release wording, no actions/description/starters. It is an intermediate diagnostic agent, not a fully working judge assistant until tools and boundaries are restored.

## A-minimal-fresh-key

```json
{
  "experiment": "A-minimal-fresh-key",
  "exitCode": 0,
  "environment": "development",
  "agent": [
    {
      "key": "permitguard-judge-v2",
      "name": "PermitGuard Judge",
      "prompt": "Explain PermitGuard. Do not infer permit state. CLEARED is WORK_START only, not release clearance. Follow the site procedure."
    }
  ],
  "facts": [
    {
      "rule": "MANIFEST_INVALID_RULE",
      "category": "ERROR",
      "value": false,
      "reason": "Manifest is valid",
      "changes": null,
      "errors": null
    },
    {
      "status": "IN_PROGRESS",
      "errorDetails": null
    },
    {
      "status": "DONE",
      "errorDetails": null
    }
  ],
  "receipt": [
    "Deployed PermitGuard to the development environment.",
    "\u2139 The version of your app [5.9.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "05aad4ec090c467aa63ebbec336338ac",
    "fb9ede7e55784e5dad524346f697846b",
    "d4995c18df07424bb859499d7eca0aa3"
  ]
}
```

## B-readiness-action-only

```json
{
  "experiment": "B-readiness-action-only",
  "exitCode": 0,
  "environment": "development",
  "agent": [
    {
      "key": "permitguard-judge-v2",
      "name": "PermitGuard Judge",
      "prompt": "Explain PermitGuard. Do not infer permit state. CLEARED is WORK_START only, not release clearance. Follow the site procedure.",
      "actions": [
        "check_readiness"
      ]
    }
  ],
  "facts": [
    {
      "rule": "MANIFEST_INVALID_RULE",
      "category": "ERROR",
      "value": false,
      "reason": "Manifest is valid",
      "changes": null,
      "errors": null
    },
    {
      "status": "IN_PROGRESS",
      "errorDetails": null
    },
    {
      "status": "DONE",
      "errorDetails": null
    }
  ],
  "receipt": [
    "Deployed PermitGuard to the development environment.",
    "\u2139 The version of your app [5.10.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "a51908bb01004005af6751012abda6c0",
    "766d4698e4e448598c886880e996a817",
    "ab25b53550724e1c98c247a4b446983d"
  ]
}
```

## C-pending-proposal-action

```json
{
  "experiment": "C-pending-proposal-action",
  "exitCode": 0,
  "environment": "development",
  "agent": [
    {
      "key": "permitguard-judge-v2",
      "name": "PermitGuard Judge",
      "prompt": "Explain PermitGuard. Do not infer permit state. CLEARED is WORK_START only, not release clearance. Follow the site procedure.",
      "actions": [
        "check_readiness",
        "request_activation"
      ]
    }
  ],
  "facts": [
    {
      "rule": "MANIFEST_INVALID_RULE",
      "category": "ERROR",
      "value": false,
      "reason": "Manifest is valid",
      "changes": null,
      "errors": null
    },
    {
      "status": "IN_PROGRESS",
      "errorDetails": null
    },
    {
      "status": "DONE",
      "errorDetails": null
    }
  ],
  "receipt": [
    "Deployed PermitGuard to the development environment.",
    "\u2139 The version of your app [5.11.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "6aa186fdf3c04d6c9010327569c9a727",
    "9ab8c87d0be14142821bc1b0cea8d6c1",
    "0d918fb704df4af8bc2b20d7d2bed79a"
  ]
}
```

## Controlled key-only lint comparison

After C, restored the full original safety prompt inline. Ran normal verbose lint with the same name/prompt/actions and only the key changed, old first then fresh. No old-key deployment occurred. Results:

```json
[
  {
    "key": "permitguard-agent",
    "exitCode": 0,
    "agentNotAllowed": false,
    "noIssuesFound": true,
    "requestIds": [
      "a9a22ec50d8645b0a61e33cc6d59d2f8",
      "0f69ef16fea44cee890fdaf2e4a3d4aa"
    ]
  },
  {
    "key": "permitguard-judge-v2",
    "exitCode": 1,
    "agentNotAllowed": true,
    "noIssuesFound": false,
    "requestIds": [
      "260768a2b6584c539145caa795b8e780",
      "6d31734ec3884fe795338de21ed7513a"
    ]
  }
]
```

## D-full-original-safety-prompt

```json
{
  "experiment": "D-full-original-safety-prompt",
  "exitCode": 0,
  "environment": "development",
  "agent": [
    {
      "key": "permitguard-judge-v2",
      "name": "PermitGuard Judge",
      "prompt": "Provide LOTO permit decision support only. The site procedure remains authoritative. Always call check_readiness; report NOT CLEARED and its blockers verbatim. request_activation proposes PENDING only, assigned to a named verifier. A human at equipment confirms using QR and tablet. Never invent clearance, locks, verification, presence or activation. Never read instruments or calibration data. Never claim QR proves presence. Do not bypass other crews' personal locks. Always start your response with the check_readiness message field verbatim. For every WORK_START result, explicitly state: CLEARED is scoped to WORK_START only and is not release clearance. Include this limitation even in a short answer. Explain blockers in plain language; codes may appear in parentheses only alongside their explanation. Use the plain crew label Simulated Crew B, without an @mention or possessive punctuation. Do not show transitionAllowed unless asked; it is an advisory machine field, not work or energization authority.",
      "actions": [
        "check_readiness",
        "request_activation"
      ]
    }
  ],
  "facts": [
    {
      "rule": "MANIFEST_INVALID_RULE",
      "category": "ERROR",
      "value": false,
      "reason": "Manifest is valid",
      "changes": null,
      "errors": null
    },
    {
      "status": "IN_PROGRESS",
      "errorDetails": null
    },
    {
      "status": "DONE",
      "errorDetails": null
    }
  ],
  "receipt": [
    "Deployed PermitGuard to the development environment.",
    "\u2139 The version of your app [5.12.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "8c5c06abcc3245fd81eb4f7d8c6e7910",
    "f1996061c43e4f0fa9e7953012df87ad",
    "adac01b58fcc4f918ff4acc57f061b35"
  ]
}
```

## Interpretation — what is and is not established

The same full fresh-key agent definition was rejected by standalone lint and then accepted by normal deployment validation. Both logs target the same app UUID 60f4bdda-1062-4e5b-aab6-1d9a9cf53a90 and internal environmentKey default (development). The old-key comparison also passed. This rules out a reliably reproducible bad-word/key diagnosis from these tests; provider validation is inconsistent/state-dependent in this observed sequence, and the hidden internal reason is not returned. No policy exemption, key/account/app churn loop, validation bypass or weakened final safety prompt was used. Request IDs above permit Atlassian to correlate server logs if a definitive internal diagnosis is needed; no external support post was submitted.

## Final development release and verification

- **5.12.0** deployed successfully: minimal agent 5.9.0 → readiness only 5.10.0 → pending activation tool 5.11.0 → full original safety prompt + tested UI/performance improvements 5.12.0.
- Final executable candidate **32efdede912c7e77926bf6efa783272fecf63702**. Per-attempt record commit **6b881fb**. All attempts and outcomes pushed.
- **PermitGuard Judge**, key **permitguard-judge-v2**. Server-reported major-5 metadata confirms exactly one agent with the complete prompt matching source and both action input schemas matching source. MCP remains declared. Jira and Confluence each report Site is already at the latest version on one-atlas-xitr.atlassian.net in development.
- **80 backend/integration + 27 UI contract tests (107)**, build and diff checks passed. Known-private-credential scan passed across source/generated artifacts. Local app.js SHA-256 **238ebde660911c7df205093bd365ab07d19bd8b4d0d2e3b22382eab38bcf0a5a**, HTML 532e4f6c5aa5bcb1131bdfa7581881725bd0b362c07faef18b74ce015daa19f0, CSS 571fcfec77153e860194be7c0ec1e7f9286d25ed730475c3bcc06c28c9332ba9. Remote bundle byte readback is unavailable; deployment metadata is not live Rovo/generated-answer acceptance.
- No permit/sample/lock/policy was mutated. PGSAMPLE-2 remains at the owner's reported ACTIVE revision 22 unless another authorized user changed it. No new app/site/identity, card, paid resource, production deployment, publication or contest submission.

## Judge-facing changes

- Admin What this app touches now groups declared permissions in readable Jira/people, Assets, JSM, Forge storage, workflow and Confluence explanations. It explicitly distinguishes declared scope from actual consent/user permissions; no raw arrays/source/verifyActualConsent flags are shown.
- Permit heading uses the authorized Jira project name/key and work-item key (not 10202 / 66400). These labels come from the existing issue authorization read, not client claims or extra directory requests.
- Enforce outage label reads **Block while the register is unavailable**. Policy dropdowns use plain wording; machine enum values and fail-closed semantics are unchanged.
- Saving shows observed elapsed seconds and the current client stage (preparing QR confirmation versus waiting for Forge permissions/save/view updates), with keep-open/no-resubmission guidance. It retains filled/checked disabled fields. Each stage timer is stopped on success or failure; no fake percentage/ETA or mutation retry.
- Issue-property projection and Realtime notification now run concurrently **after** the operational atomic commit and both settle before returning. Failure stays nonauthoritative, with no repeated commit. Fresh permission checks and conditional-write guards remain. Tests prove concurrency/order/warnings, not a measured production latency reduction.

## Open the panel — documented platform behavior

Current official Jira issue-panel docs say the panel is added when its configured button is clicked; it is not necessarily inline on a fresh issue. Judges: open the work item → **View app actions** icon → **PermitGuard**. The panel appears above Activity. Only users with edit permission see the button. A Jira administrator can optionally use the issue panel menu → **Show for all work items**; the docs say this option is admin-only. No global visibility preference was changed or auto-open implementation claimed.

Source checked: https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-issue-panel/ (current page updated 9 October 2026).

## Exact owner re-test

1. Hard-reload [PGSAMPLE-2](https://one-atlas-xitr.atlassian.net/browse/PGSAMPLE-2), then View app actions → PermitGuard. Do not reset/create over the ACTIVE permit. Expect automatic load, friendly project/work-item heading and Enforce / Block while the register is unavailable.
2. Open Rovo chat, search/select **PermitGuard Judge**, and ask **Check readiness for the permit on PGSAMPLE-2. State its scope and release status.** Expect live tool-backed ACTIVE data, with **CLEARED for WORK_START only. This is not release clearance.** Release remains NOT CLEARED while personal locks remain. The read must not advance operational revision. Ask **Does that mean I may release or energize?** Expect no: release is separate and site procedure governs; even closure records are not energization authority.
3. Hard-reload the PermitGuard Jira admin page: expect permission paragraphs/groups, no raw scope JSON or metadata flags.
4. When ready to finish this synthetic sample, Play Crew B if absent, Begin release checks, remove **only your own** L-A1. During save observe elapsed seconds/stage and preserved disabled controls; measure actual time separately. Expect NOT CLEARED / Simulated Crew B lock L-07 remains on isolation point V-3, close disabled, second tab updates. Ask the same agent again: RELEASE / NOT CLEARED with plain reasons, not an @mention or bare code. The owner may then explicitly remove their simulated L-07 and close, but no real other worker's lock may be removed.
5. A fresh Verify/QR save can be retested later on a genuinely new dedicated sample work item after finishing existing EQ-1 permits. Equipment is intentionally pre-provisioned: the judge path selects EQ-1; there is no general create-equipment wizard. Assets configuration and the advanced admin built-in register fallback are separate from the walkthrough.

Owner's read-only zero-agent observation supersedes the earlier stale-duplicate hypothesis: no stale cleanup/admin deletion is requested. Search indexing and generated text remain browser acceptance checks; the agent definition is verified deployed, not claimed observed in the picker here.
