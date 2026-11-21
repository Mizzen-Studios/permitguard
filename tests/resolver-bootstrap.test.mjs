import test from 'node:test';
import assert from 'node:assert/strict';
test('real Forge entry imports and constructs the installed resolver SDK',async()=>{
 const entry=await import('../src/forge/index.js');
 assert.equal(typeof entry.handler,'function');
 assert.equal(typeof entry.checkReadiness,'function');
 assert.equal(typeof entry.requestActivation,'function');
});
