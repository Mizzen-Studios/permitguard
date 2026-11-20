# Rovo development deployment experiments — 20 November 2026

Owner authorized neutral prompt, resource prompt, fresh identity and agent-removal fallback. Validation is always enabled; action/MCP contracts and deterministic authorization stay intact. Forge CLI 15.1.0 equals npm latest 15.1.0. Current official docs support prompt: resource:agent-resource;prompts/agent-prompt.txt with a declared resource directory. Raw verbose logs stay private (signed upload URLs). A failed/neutral experiment is not a browser-qualified safety agent. No sample/permit writes made.

## 01-neutral-inline-ascii

```json
{
  "attempt": "01-neutral-inline-ascii",
  "exitCode": 0,
  "outcome": "SUCCESS",
  "environment": "development",
  "appId": "ari:cloud:ecosystem::app/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90",
  "agent": [
    {
      "key": "permitguard-agent",
      "name": "PermitGuard Demo LOTO",
      "description": "LOTO permit decision support. Proposes activation; a named person at equipment must confirm.",
      "prompt": "Answer questions about LOTO permits using check_readiness.",
      "conversationStarters": [
        "Check permit readiness"
      ],
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
  "receiptLines": [
    "Deployed PermitGuard to the development environment.",
    "ℹ The version of your app [5.4.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "3aabb50207ba4c0d8af64b77098c08da",
    "d8af9ad8be284410b53833b63bec5ba8",
    "defb1b8dd7fb4629a94563cf8a7e593d"
  ]
}
```

## 02-role-human-confirmation

```json
{
  "attempt": "02-role-human-confirmation",
  "exitCode": 0,
  "outcome": "SUCCESS",
  "environment": "development",
  "appId": "ari:cloud:ecosystem::app/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90",
  "agent": [
    {
      "key": "permitguard-agent",
      "name": "PermitGuard Demo LOTO",
      "description": "LOTO permit decision support. Proposes activation; a named person at equipment must confirm.",
      "prompt": "Provide LOTO permit decision support only. The site procedure remains authoritative. Always call check_readiness; report NOT CLEARED and its blockers verbatim. request_activation proposes PENDING only, assigned to a named verifier. A human at equipment confirms using QR and tablet.",
      "conversationStarters": [
        "Check permit readiness"
      ],
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
  "receiptLines": [
    "Deployed PermitGuard to the development environment.",
    "ℹ The version of your app [5.5.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "483afa30e33d42d0b7c65bdc5528ad96",
    "5b47f749ebd64b498c01e6b6fca96b80",
    "24d7d75ff4f044aaa9b9f1a4e0591da9"
  ]
}
```

## 03-full-safety-prompt

```json
{
  "attempt": "03-full-safety-prompt",
  "exitCode": 0,
  "outcome": "SUCCESS",
  "environment": "development",
  "appId": "ari:cloud:ecosystem::app/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90",
  "agent": [
    {
      "key": "permitguard-agent",
      "name": "PermitGuard Demo LOTO",
      "description": "LOTO permit decision support. Proposes activation; a named person at equipment must confirm.",
      "prompt": "Provide LOTO permit decision support only. The site procedure remains authoritative. Always call check_readiness; report NOT CLEARED and its blockers verbatim. request_activation proposes PENDING only, assigned to a named verifier. A human at equipment confirms using QR and tablet. Never invent clearance, locks, verification, presence or activation. Never read instruments or calibration data. Never claim QR proves presence. Do not bypass other crews' personal locks.",
      "conversationStarters": [
        "Check permit readiness"
      ],
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
  "receiptLines": [
    "Deployed PermitGuard to the development environment.",
    "ℹ The version of your app [5.6.0] that was just deployed to [development] is eligible for the Runs on Atlassian program."
  ],
  "requestIds": [
    "beed9671430d41a5a33c60f323233b3f",
    "eaa0251149e4494eb19986e8e4237f92",
    "d4372aea1a87406498b1eb32ac8cc3ff"
  ]
}
```
