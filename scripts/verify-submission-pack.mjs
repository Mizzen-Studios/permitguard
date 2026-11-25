import { fileURLToPath } from 'node:url';
import { loadPack, validatePack } from './lib/submission-pack.mjs';

try {
  if (process.argv.slice(2).some(x => x !== '--json')) throw new Error('Supported option: --json');
  const result = validatePack(loadPack(fileURLToPath(new URL('../', import.meta.url))));
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('Local pack consistency: ' + result.localConsistency);
    console.log(result.shots + ' shots / ' + result.targetSeconds + ' seconds; ' + result.localReferences + ' local references checked');
    for (const error of result.errors) console.error('- ' + error);
    console.log('Submission ready: NO. Pending human gates: ' + result.pendingGates.length + '. No public actions authorized.');
    for (const gate of result.pendingGates) console.log('- ' + gate.id + ': ' + gate.status);
    console.log('Read-only local checks only; no site/media/publication acceptance implied.');
  }
  process.exitCode = result.errors.length ? 1 : 0;
} catch (error) {
  console.error('Pack validation failed: ' + error.message);
  process.exitCode = 1;
}
