import { checkReadiness, checkRelease, DEFAULT_POLICY } from '../domain/permit.mjs';
export function evaluateGate({ data, issueId, projectId, action }) {
  const policy = data.projects[projectId]?.policy || DEFAULT_POLICY;
  if (policy.mode === 'WARN_ONLY') return { result: true, advisory: true, status: 'NOT CLEARED' };
  if (policy.mode !== 'ENFORCE') return { result: false, errorMessage: 'PermitGuard: unknown project policy. Contact an administrator.' };
  const permit = data.permits[issueId];
  if (!permit || permit.projectId !== projectId) return { result: false, errorMessage: 'PermitGuard: no current permit. Open the PermitGuard panel.' };
  const result = action === 'START' ? checkReadiness({ ...permit, state: 'VERIFY' }, { policy }) : checkRelease({ ...permit, state: 'RELEASE' }, Object.values(data.permits));
  const correctState = action === 'START' ? permit.state === 'ACTIVE' && permit.activations.some(a => a.status === 'CONFIRMED' && permit.verifierIds.includes(a.confirmedBy)) : permit.state === 'RELEASE' || permit.state === 'CLOSED';
  return { result: correctState && result.status === 'CLEARED', errorMessage: 'PermitGuard: NOT CLEARED. Open the panel; named human activation or remaining personal locks require attention.' };
}
