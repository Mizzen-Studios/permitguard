# PermitGuard — unsubmitted Marketplace draft pack

Prepared 27 November 2026. **Local draft only; no listing, upload, form edit, account registration, billing or deployment performed. Repository integration/push is preparation, not Marketplace publication.** Parent owns repository integration. Vendor: Mizzen Studios. This is not a readiness/compliance attestation.

## Contents
- [Listing fields and three highlights](listing-copy.json) — bounded draft copy, not a saved Marketplace form.
- [Support, privacy and operations](support-privacy.md).
- [Security questionnaires and gaps](questionnaire-gaps.md).
- [Checked requirements and identity decision](requirements.md); [dated first-party sources](sources.json).
- [Separate screenshot-slot manifest](screenshot-slots.json) — every actual screenshot is `MISSING_NOT_CAPTURED`.
- [Original brand-art provenance and dimensions](../../assets/marketplace/README.md). Brand artwork is not UI evidence.
- [Local validation script](validate.py).

## Evidence boundary
Current authorized app is the existing manifest identity; no new identity created. Production **2.4.0 / UI e8b95c053254**. Owner report, **27-Nov-2026 09:01 UTC**, says seed UI ALL PASS: Cancel 0 writes; Confirm six EQ-1–EQ-6, Warn-only, no permit/locks; reload six/no duplicates/no seed button. This report is task-supplied, not independently observed or captured here. The main README and owner receipt describe the bounded current acceptance. Full lifecycle, distinct-two-human and cross-browser Realtime browser acceptance remain unaccepted. Historical DEV/MCP receipts do not prove current Production acceptance.

## Hard stops before any future submission
1. Obtain separate explicit publication/agreement/account authorization. Current authority covers repo code/docs only, not listing actions.
2. Owner27-Nov13:04 resolved the strategy: current app stays Sharing for judges; plan a separate app ID for any listing, free tier only/no card. No second registration authorized. Preserve this decision: submission of this same Forge app can remove installation-link eligibility **before approval/go-live**. Preserve current Sharing/link; do not experiment on it.
3. Resolve personal-data reporting/erase/refresh/retention gaps and operating/legal/security declarations; a public privacy URL is not implementation compliance.
4. Capture genuine authorized UI originals and derivatives with privacy/rights review; all screenshot slots remain missing. Accept remaining native workflows independently.
5. Owner verifies actual signed-in fields, company controls, KYC/KYB, pricing/billing and agreements. No legal entity, SLA, certification, training policy or no-cost guarantee invented here.

Reproduce draft-only validation from repository root: `python3 docs/marketplace/validate.py`.
