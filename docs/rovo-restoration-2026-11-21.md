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
