# Judge discoverability — 26 November 2026

[Owner report](evidence/2026-11-26-owner-fresh-site-rehearsal.json): fresh-site install about 40s; KAN-1 panel 5–10s, Release NOT CLEARED — no permit, live updates connected, no errors. Owner-reported, not independently inspected or full-lifecycle/two-browser acceptance.

## First run

**Open an issue → click the apps icon under the title (sometimes “View app actions”) → choose PermitGuard.** The new right-side **Open PermitGuard** context expands a static navigation guide. It has no resolver, permit writes or readiness claim. Jira controls placement/collapse; this does not auto-open the main panel or prove host placement.

The panel mirrors actual server-reported version/environment and compiled UI source beside its header and in its footer. Pending/unavailable remains explicit, no guessed release. Header avoids scrolling long forms, without fixed overlays on controls. Major-only versions are shown as reported.

## Preserve compatibility

The four Confluence scopes are unused by this Jira-only rehearsal but used by the shipped optional macro/archive. [Forge versioning](https://developer.atlassian.com/platform/forge/versions/) explicitly makes **removing a scope** a major-version change. Dropping them is not a transparent minor update and alone would disable optional archive code. Keep the working major2 installation, app ID and sharing setup intact for this fix. A separately reviewed Jira-only major could retire the macro/archive and reduce scopes; not silently done. The current12 are not claimed minimal.

Use supported [issueContext](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-issue-context/) for a tiny guide, not a legacy glance or duplicate editor in a narrow sidebar. Existing [issuePanel](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-issue-panel/) remains the full app. No new scope, egress, resolver, model call, schedule, workflow or guide storage write.

No link generation/rotation, Marketplace, billing, MCP exposure, Dev deployment, Confluence install or site-data mutation. After the minor Production update, refresh/reopen KAN-1 and check version/environment/header and context placement. Post-update owner browser acceptance remains NOT_RUN until reported.
