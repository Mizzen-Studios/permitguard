# Site-admin judge-path fix — 19 November 2026

## Owner-observed baseline

At ~21:00 UK the BUSINESS project PGSAMPLE issue panel rendered and Rovo returned NOT CLEARED / NO_PERMIT. The owner could not access sample setup. No per-user consent prompt appeared. This supersedes the earlier blanket browser-not-run note for those specific observations only.

## Root cause and fix

Live owner-token REST returned HTTP 200 with ADMINISTER_PROJECTS=false, ADMINISTER=true and EDIT_ISSUES=true for issue 66400. Project 10202 is business and retains the dedicated sample description marker. The old adapter checked ADMINISTER_PROJECTS only. The corrected adapter accepts server-verified ADMINISTER OR ADMINISTER_PROJECTS; issue access and EDIT_ISSUES remain independently required. No payload-provided admin or actor claim is accepted. The sample loader still requires explicit confirmation, exact PGSAMPLE key and description marker, and no open project permits. It enables Enforce only in that dedicated project.

Running the actual corrected adapter locally against live REST (using the existing private owner token, not Forge asUser) returned isSiteAdmin=true, isProjectAdmin=true, canEdit=true and displayName=Olly. No sample/register/permit write was performed; the owner's first-run test is preserved.

Issue, permissions and current-user profile requests now run concurrently. Profile failure falls back to a friendly label, never invented identity or authority. Account IDs remain authoritative form values for named participants; the signed-in identity label uses the server-returned display name. No measured post-fix browser-load improvement is claimed.

Empty equipment plus verified admin now expands setup above the Plan form. Both sample confirmation and Load confirmed sample are visible without finding settings. Acceptance-test copy was removed from the UI; Realtime says Live updates connected only after subscription, not verified delivery.

Current Forge agent renamed **PermitGuard — Demo LOTO**. No unidentified other agent was deleted. The manifest contained one agent in this app; renaming distinguishes this installed development agent from the other reported search entry.

## Page modules and evidence boundary

jira:adminPage was already declared. jira:projectSettingsPage was missing; it is now declared using the same dedicated administration resource/resolver. Issue-less pages display scopes and uninstall guidance; permit setup stays in the issue panel. Official module documentation states projectSettingsPage supports Jira and JSM, but business-space sidebar placement/rendering is not proven by that documentation or deployment. The earlier manually constructed admin URL was withdrawn after the owner's 404.

Live browser checks in both available managed profiles (capture and openclaw) reached Atlassian **Log in to continue**, not the owner's signed-in browser. No login bypass, session copying, or password reset was attempted. Therefore post-fix issue-panel rendering, admin/project-settings rendering, renamed-agent search appearance and cold-start timing require the owner's signed-in re-test. Local UI tests are not substituted for live rendering.

## Regression

70 backend/integration tests and 8 UI contract tests passed; build and diff checks passed. Includes site-admin-without-project-admin and ordinary-viewer denial regressions, plus expanded first-run setup and display-name/copy assertions. Source and built UI scans for private credential/debug-key values passed. No card, paid resource, promotion, Marketplace or Devpost action.
