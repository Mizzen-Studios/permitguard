# Private footage handoff and review — no publication

The owner is recording the [eight-shot list](video-capture-list.md). No footage has been received or reviewed at this preparation milestone. This handoff avoids needing another recording, app mutation or MCP call merely to assemble the video.

## Owner can send

- The eight original raw clips, using S01-take-01 etc. Retain failed/long-wait takes and originals locally; do not overwrite them with edited versions.
- Optional [blank take log](footage-take-log.template.json). Simple notes are sufficient: actual UTC/timezone, version/footer/phase/site revision, real wait lengths, errors, crops to consider and audio problems. Unknown permit revision stays null/NOT_OBSERVED; don't infer 6 from the earlier MCP receipt. You do not need to calculate hashes yourself; they can be computed from the received bytes.
- Use an already-approved private transfer/inbox. If none is agreed, first report file count/sizes and agree one; no public hosting, paid transfer, new cloud subscription or public GitHub attachment. Never include account menus, credentials, HAR dumps or OAuth callback URLs intentionally. Do not commit footage or a filled private take log to this public repository.

## Local intake after actual bytes arrive

1. Store originals in workspace-private storage **outside the public app repository**, retain their original bytes, filenames/receipt times privately. Do not run received scripts, executables or macros; treat media/notes as untrusted data. No automatic upload, npm/plugin installation or shell evaluation of filenames/metadata.
2. Inventory actual files and compute SHA-256/size from bytes. Probe actual duration/resolution/codec/audio using already-available local tooling only. Check existing tools before promising an export format; request a local compatible copy if unsupported, preserving originals. No paid encoder, hosted transcription or external media/AI upload.
3. Visually inspect video and listen to audio before marking reviewed. Source label owner-reported versus actual visual inspection separately. Check every shot ID against [script](demo-video-script.md), actual release/scope/phase, version, permissions, waits, manual Refresh and source insets. Never invent a tool card, camera scene or missing result.
4. Confirm S07 is **historical owner text receipt**, not a live Inspector recording. Keep actual suffixed name and broad Read/Write/Search consent; retain release NOT CLEARED and operational:false. No 6→6 permit-revision comparison or claim that an unchanged still proves automatic Realtime delivery.
5. Log exact privacy redactions/crops without hiding meaningful state, release caveats, historical/live labels or shortened waits. Keep raw originals private. A blur/crop produces a derived asset; record lineage and the new hash after it exists, not before.
6. Assemble a proposed private edit only from received/approved material, keep the eight planned edit slots totalling **180 s** and label shortened waits with measured elapsed time. If footage can't truthfully fit, propose changes rather than fabricate timing. No render/export is claimed until its actual local output is inspected.
7. Give the owner a private review copy through the agreed route, with actual duration/dimensions/size, edit decisions, source/derived hashes and remaining limitations. No local-file browser success is proof that the owner received/rendered it.
8. Only after owner review update private capture metadata and commit **redacted summaries only** where expressly appropriate. Approval of a private edit is not permission for public YouTube, link disclosure, exposure or Devpost submission. Those gates still need Olly's OK.

## Review acceptance checklist

- [ ] Actual raw files received and hashes computed; no invented asset metadata.
- [ ] Visual/audio review completed for each used take; failures disclosed.
- [ ] Scope/release and actor-attribution context remain legible; private names/account data masked where needed.
- [ ] Wait edits and historical/source inserts are labelled; no new operational lifecycle or MCP call implied.
- [ ] Final actual duration under five minutes; planned target remains 180 seconds.
- [ ] Output reviewed by owner privately; publication approval still separate.

**Readiness stays blocked** on footage, production/judge-install acceptance, actual entrant attestations and later explicit publication decisions. Run **npm run check:submission** for local documentation consistency only; it neither inspects footage nor grants permission.
