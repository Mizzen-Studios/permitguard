import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const policy=readFileSync(new URL('../docs/privacy.html',import.meta.url),'utf8');
const status=JSON.parse(readFileSync(new URL('../docs/submission-status.json',import.meta.url),'utf8'));
test('agreed policy keeps retention human-controlled and uninstall platform-qualified',()=>{
 for(const wording of ['administrator-controlled, with no automatic expiry','no automatic deletion or anonymisation','synthetic demo evidence only for the hackathon','soft-deletion and recovery periods','does not mean immediate permanent erasure','separate site-administrator cleanup','only routes requests and holds no copies','never authorizes changing active personal-lock ownership']) assert.ok(policy.includes(wording),wording);
 assert.ok(policy.includes("customer's Atlassian site administrator"));
 assert.equal(status.privacyReadiness.status,'DEFERRED_BY_OWNER_GROUNDWORK_INACTIVE');
 for(const key of ['reportingActive','erasureActive','retentionDeletionActive']) assert.equal(status.privacyReadiness[key],false);
 const manifest=readFileSync(new URL('../manifest.yml',import.meta.url),'utf8');
 assert.ok(!manifest.includes('report:personal-data'));
 assert.ok(!manifest.includes('scheduledTrigger'));
});
