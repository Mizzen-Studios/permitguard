# Checked first-party requirements — 27 November 2026

The live official pages were read via web_fetch, then full HTML was independently parsed with Python stdlib HTMLParser (no package installation/browser). Exact retrieval timestamps, response status, HTML hashes and extracted article hashes are in [sources.json](sources.json); complete source articles are retained privately rather than republished in this public repo. These are public documentation checks, not observation of a signed-in listing form.

## Documented asset and text facts
Source: [Build your presence on Marketplace](https://developer.atlassian.com/platform/marketplace/building-your-presence-on-marketplace/).
- App name ≤60; tagline ≤130; legacy summary ≤250; More details ≤1000 characters.
- Three highlights: each title ≤50, summary ≤220, screenshot caption ≤220 characters.
- App logo 144×144 PNG/JPG. Original unique logo; no Atlassian product logo in it. SVG is editable source, not the documented upload format.
- Banner 1120×548 PNG/JPG high-resolution, or 560×274 standard; include app name, partner name and brief functionality text.
- Three full highlight screenshots 1840×900 PNG/JPG (or 920×450 standard), plus three cropped versions 580×330 PNG/JPG. Brand art cannot fill these slots.
- Additional gallery media optional: documented up to five additional screenshots per highlight and explanations up to 220 characters. This pack does not promise dynamic UI upload counts.
- Release summary ≤80; release notes ≤1000.
- Partner logo separately documented 144×144 PNG/JPG/GIF; not created or uploaded here. App logo is not approval of a vendor profile/logo.

## Distribution consequence — decision BEFORE submission
Source: [Distribute your apps](https://developer.atlassian.com/platform/forge/distribute-your-apps/): “Once your app has been submitted for listing on Marketplace, or has a license in the app manifest, it can't be shared via installation link.” The guide says to copy code and create a new unlicensed app for link-based testing. Do not assume this happens only after approval, charging, or public launch.

Existing authorized app: `ari:cloud:ecosystem::app/60f4bdda-1062-4e5b-aab6-1d9a9cf53a90`, from current manifest. Production candidate 2.4.0 / UI e8b95c053254. No new app IDs, listing IDs, URLs or registration requests. No actual private install link copied into this public draft.

**Recommendation:** retain current rehearsal identity and Sharing/link unchanged; ask owner to decide a separately authorized listed/rehearsal identity strategy before any future submission. A future separate app would need a code audit for identity-specific constants/fields/properties, independent environment storage/fixtures, scopes, compatibility, approved builds/deployments and acceptance. Do not edit app.id or register a clone from draft authority. Whether that strategy meets contest rules is a separate organizer/owner decision.

## Dynamic/account facts NOT checked
Signed-in form field inventory/required flags, upload validation, category choices, listing availability, partner/space/admin rights, legal entity, country-specific KYC/KYB, payment/consent state, actual pricing model, billing liability and Marketplace review outcome remain UNKNOWN. Public docs are not current account evidence. Customer-free pricing is not zero Forge operating cost or a billing cap. No-card behavior is not guaranteed.

The public Privacy & Security tab documentation says its questionnaire is not mandatory and evolves over time. Do **not** generalize that to the separate Forge app review questionnaire/security requirements or partner onboarding. Map all three separately in [questionnaire-gaps.md](questionnaire-gaps.md).
