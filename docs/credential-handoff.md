# Private credential and demo-site handoff

Status: credentials supplied privately and used via environment variables. Demo site provisioned; registration BLOCKED by overage-billing terms, not accepted. See demo-site-checks-2026-11-15.md. Use the account email supplied privately by the owner (Google sign-in). Do not request a Google password.

1. Receive owner-supplied Atlassian API token privately, never in project Discord. Do not include token in logs, commits, screenshots or progress messages.
2. Store FORGE_EMAIL and FORGE_API_TOKEN in a private environment file outside every repository, using the OpenClaw private secrets area where available; chmod 600. Only variable names belong in documentation. Do not persist actual values in shell command history.
3. Verify installed Forge CLI version and current help for login and site provision. Use supported environment-based authentication; run forge login as appropriate to the current CLI, with non-echoing secret input. Never print env or pass credentials into public transcript commands.
4. Run forge site provision for the free 90-day demo site with Rovo. If a card, payment or paid plan is required, stop and report the blocker. Do not substitute a Gmail developer site and assume Rovo exists.
5. Record the actual returned URL and expiry. Register/deploy only this app and grant only reviewed minimum scopes. No Marketplace publication.
6. Run docs/live-checklist.md as soon as the site exists. Report each capability separately as PASS, FAIL, or BLOCKED with evidence; documentation is not proof.
7. Return demo URL and early Assets, Rovo agents, rovo:mcp, workflow-validator, Custom UI camera and Realtime results to the owner and the authorized project channel.

Workflow rule cleanup must be proven on disposable test workflows before operational Enforce. No unattended safety decisions or actual equipment operation is authorized.
