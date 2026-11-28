import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createForgeWiring} from '../src/forge/actions.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('issue context opens the same live app and authenticated resolver, not a guide or copied state',()=>{
 const manifest=read('manifest.yml'),section=manifest.split('  jira:issueContext:')[1].split('  jira:adminPage:')[0];assert.match(section,/key: permitguard-open-guide/);assert.match(section,/label: Open PermitGuard/);assert.match(section,/resource: permit-app/);assert.match(section,/resolver:\n      function: probe-resolver/);assert.doesNotMatch(section,/permit-entry|dynamicProperties:|status:/);
});
test('original issue panel, agent identity and scope contract stay unchanged',()=>{
 const manifest=read('manifest.yml');assert.match(manifest,/jira:issuePanel:[\s\S]*?key: permitguard-panel/);assert.match(manifest,/key: permitguard-judge-v2/);const scopes=manifest.split('  scopes:')[1].split('app:')[0].match(/^  - /gm);assert.equal(scopes.length,12);for(const scope of ['read:space:confluence','read:space.permission:confluence','read:page:confluence','write:page:confluence'])assert.ok(manifest.includes(scope));
 // Current official issuePanel reference and installed schema expose no default-visible property.
 assert.doesNotMatch(manifest.split('  jira:issueContext:')[0],/isDefault|defaultVisible|defaultVisibility/);
});
test('sidebar context uses trusted issue identity through the same resolver without implicit writes',async()=>{
 const calls=[];const wiring=createForgeWiring({requestJira:async()=>assert.fail('not a workflow action'),dispatch:async(...args)=>{calls.push(args);return {permit:null,revision:7,capabilities:{}};}});
 const context={accountId:'human',moduleKey:'permitguard-open-guide',extension:{type:'jira:issueContext',issue:{id:'10001',key:'KAN-2'},project:{id:'10'}}};
 const r=await wiring.resolver({context,payload:{operation:'get_state'}});assert.equal(r.revision,7);assert.equal(calls.length,1);assert.equal(calls[0][0],'get_state');assert.equal(calls[0][2].extension.issue.id,'10001');assert.equal(calls[0][2].accountId,'human');
 const denied=await wiring.resolver({context:{accountId:'human',moduleKey:'permitguard-open-guide'},payload:{operation:'get_state',issueId:'10001'}});assert.equal(denied.kind,'ADMINISTRATION');assert.equal(calls.length,1);
});
