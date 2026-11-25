import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createForgeWiring } from '../src/forge/actions.mjs';

test('MCP exposes exactly the GET readiness action while native Rovo retains proposal', () => {
  const manifest = readFileSync(new URL('../manifest.yml', import.meta.url), 'utf8');
  const block = name => {
    const start = manifest.indexOf('  ' + name + ':\n');
    assert.ok(start >= 0, name);
    const rest = manifest.slice(start + name.length + 4);
    return rest.split(/(?=^  [a-z][a-zA-Z:]*:|^resources:)/m)[0];
  };
  const mcp = block('rovo:mcp');
  assert.equal([...mcp.matchAll(/^  - key:/gm)].length, 1);
  assert.deepEqual([...mcp.matchAll(/^    - ([a-z_]+)$/gm)].map(m => m[1]), ['permitguard_check_readiness']);
  const actions = block('action');
  assert.match(actions, /key: permitguard_check_readiness[\s\S]*?function: readiness-action[\s\S]*?actionVerb: GET/);
  assert.doesNotMatch(mcp, /request_activation|confirm|apply_lock|create_demo_crew_b|development/i);
  assert.match(actions, /key: check_readiness[\s\S]*?actionVerb: GET/);
  assert.match(actions, /key: request_activation[\s\S]*?actionVerb: CREATE/);
  assert.match(block('rovo:agent'), /actions:\n    - check_readiness\n    - request_activation/);
  assert.match(block('function'), /key: activation-action\n    handler: forge\/index.requestActivation/);
});

test('readiness action cannot dispatch an input-supplied write or identity', async () => {
  const calls = [];
  const wiring = createForgeWiring({
    requestJira: async (who, path, options) => {
      assert.equal(who, 'user');
      assert.equal(path, '/rest/api/3/issue/PGSAMPLE-2?fields=project');
      assert.equal(options, undefined);
      return { ok: true, json: async () => ({ id: '10001', fields: { project: { id: '10' } } }) };
    },
    dispatch: async (...args) => { calls.push(args); return { operational: false }; }
  });
  await wiring.checkReadiness({ issueKey: 'PGSAMPLE-2', operation: 'request_activation', verifierId: 'fake', expectedRevision: 1, actorId: 'fake', context: { accountId: 'fake' } }, { principal: { accountId: 'real-user' } });
  assert.deepEqual(calls, [['check_readiness', {}, { accountId: 'real-user', issueId: '10001' }]]);
});

for (const operation of ['confirm_activation','verify_point','apply_lock','remove_lock','close_permit','create_demo_crew_b']) test('readiness cannot be redirected into '+operation,async()=>{
 const calls=[];const w=createForgeWiring({requestJira:async()=>({ok:true,json:async()=>({id:'10001',fields:{project:{id:'10'}}})}),dispatch:async(...a)=>{calls.push(a);return {};}});
 await w.checkReadiness({issueKey:'PGSAMPLE-2',operation,confirmed:true,confirmedAtEquipment:true,challengeToken:'fake',actorId:'other'}, {principal:{accountId:'actual'}});
 assert.deepEqual(calls,[['check_readiness',{}, {accountId:'actual',issueId:'10001'}]]);
});
test('native proposal cannot turn an injected confirmation into activation',async()=>{
 const calls=[];const w=createForgeWiring({requestJira:async()=>({ok:true,json:async()=>({id:'10001',fields:{project:{id:'10'}}})}),dispatch:async(...a)=>{calls.push(a);return {permit:{state:'VERIFY',activations:[{id:'pending',status:'PENDING',verifierId:'named'}]}};}});
 const r=await w.requestActivation({issueKey:'PGSAMPLE-2',verifierId:'named',operation:'confirm_activation',confirmedAtEquipment:true,challengeToken:'fake',equipmentId:'pump',activationId:'pending'}, {principal:{accountId:'actual'}});
 assert.deepEqual(calls,[['request_activation',{verifierId:'named'},{accountId:'actual',issueId:'10001'}]]);assert.equal(r.permit.state,'VERIFY');assert.equal(r.activationAuthority,false);assert.equal(r.humanConfirmationRequired,true);
 const source=readFileSync(new URL('../src/forge/index.js',import.meta.url),'utf8');assert.doesNotMatch(source,/export (?:const|function) (?:confirmActivation|verifyPoint|applyLock|removeLock)/);
});
