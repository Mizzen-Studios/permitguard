# Startup review and judge-impact decision — 28 November 2026

## Observed native timings

Source: [owner typed 2.7 report](evidence/2026-11-28-owner-2.7-browser-pass.json), ~13:00 UK; no independently inspected trace or footage.

| Measurement | KAN-2 | KAN-1 |
| --- | --- | --- |
| Navigation → shell | ~2.5 s | ~2.7 s |
| Navigation → live | ~3.5 s | ~3.6 s |
| Iframe → live | 1.1 s | 1.0 s |
| Server total | 0.260 s | 0.238 s |

KAN-2 iframe→panel 0.1 s, browser FCP 0.2 s, snapshot 0.7 s; server auth 0.216 s and storage 0.043 s. Rounding explains small differences. Earlier 2.6 navigation→live was 10–14 s. These samples demonstrate owner-observed improvement, not controlled cold/warm populations or percentiles.

## Source inspection and decision

`static/permit-app/app.js` initializes fresh authorized `get_state` concurrently with context/optional preview. It does not await preview for live rendering. Realtime subscription is deferred until usable state paints. `src/ui-build.cjs` already bundles/minifies the UI; the HTML shell precedes bridge evaluation.

Subtracting reported iframe-live duration from navigation-live suggests roughly 2.4–2.6 s before iframe navigation, subject to separate clocks and rounded operator measurements. This is an inference, not a host trace. App-side module time is only 0.1 s; server authorization/storage are already subsecond. No evidenced serial app wait warrants another release now. Do not cache authorization, promote historical snapshots to live state, remove permission checks or add speculative warm-up polling.

**Decision: preserve accepted Production 2.7.0/UI7aee7ab2f32c. No runtime changes, rebuild or redeployment this pass.** Prioritize readable capture, separate environment labels, and a coherent submission draft. If further latency work becomes necessary, collect matched repeated navigation/iframe/live timings with the same browser and cache conditions first; avoid treating shell paint as live readiness.

## Console classification

Owner attributes all eight errors and one warning to Jira: user-property/preferences and recurrence 404s, JSD Opsgenie-access 401, two unload policy violations from jira-fe, and react-ufo deprecation. Classify this exact set as host noise; do not suppress console output or assume future errors have the same cause. The receipt preserves exact reported sources.

## Recording priorities

1. Accepted Production PLAN inline panel, with readable release answer and current build.
2. Genuine Development Rovo reply if the focused picker works; historical labelled text fallback if not, never a reconstructed live reply.
3. Existing personal-lock barrier and source-labelled human-only activation rule.
4. Historical MCP receipt with actual tool name and scope, not fabricated Inspector footage.

The restored PGSAMPLE-2 assignee blip stays recorded as owner-reported history. No permit writes, assignment edits, Sharing/MCP toggles, billing changes or submission actions are needed for this polish.
