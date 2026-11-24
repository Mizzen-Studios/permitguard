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
  assert.deepEqual([...mcp.matchAll(/^    - ([a-z_]+)$/gm)].map(m => m[1]), ['check_readiness']);
  const actions = block('action');
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
