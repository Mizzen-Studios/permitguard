# Historical external-client handoff — withdrawn operational steps

Originally prepared 23 November; owner parked invocation on 24 November because no approved client was available. The 24 November 13:03 admin observation invalidates the old instruction to select Check readiness individually: the actual Forge UI has one broad app-wide exposure switch and no per-tool names/checkboxes.

**Do not execute the old recipe.** Source/deployed rovo:mcp exposes check_readiness GET and request_activation CREATE. The latter writes PENDING state; human confirmation requirements do not make it read-only. No toggle, client grant, sharing change or deployment is approved.

[Current assessment and conditional plan](mcp-exposure-assessment-2026-11-24.md) covers version identity, a separately authorized GET-only MCP deployment, a proposed local no-LLM Inspector client, discovery allowlisting, one read, OFF/revocation cleanup and cost/development eligibility limitations. It is not a working receipt or assurance of £0.

The accepted development core remains 5.15.0 / UI 4e3335fb30f9; subsequent cf01158 documentation changes did not deploy code. The [browser inspection](mcp-browser-discovery-2026-11-24.md) was completed by the owner and showed exposure OFF, not individual discovery. Bonus runtime proof remains NOT_RUN / parked, not a core-pack blocker. No Studio Publish or public sharing is permitted.
