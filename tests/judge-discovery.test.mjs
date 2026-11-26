import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('discoverable context is a static navigation guide, never a second editable or positive status panel',()=>{
 const manifest=read('manifest.yml'),section=manifest.split('  jira:issueContext:')[1].split('  jira:adminPage:')[0];assert.match(section,/label: Open PermitGuard/);assert.doesNotMatch(section,/resolver:|dynamicProperties:|status:/);const html=read('static/permit-entry/index.html');assert.match(html,/apps icon under the issue title/);assert.match(html,/navigation guide, not a live readiness result/);assert.doesNotMatch(html,/<script|<form|https?:/i);
});
test('rehearsal-safe update retains original scope contract and main issue panel',()=>{
 const manifest=read('manifest.yml');assert.match(manifest,/jira:issuePanel:[\s\S]*?key: permitguard-panel/);const scopes=manifest.split('  scopes:')[1].split('app:')[0].match(/^  - /gm);assert.equal(scopes.length,12);for(const scope of ['read:space:confluence','read:space.permission:confluence','read:page:confluence','write:page:confluence'])assert.ok(manifest.includes(scope));
});
