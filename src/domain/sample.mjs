import { createPermit, beginLocking, applyLock, DEFAULT_POLICY } from './permit.mjs';
/** Synthetic sample IDs only; persisted adapters must namespace by installation/project. */
export const SAMPLE_EQUIPMENT = Object.freeze([
  { id: 'EQ-1', name: 'Cooling-water pump', isolationPoints: [{ id: 'V-3', energyType: 'HYDRAULIC', highEnergy: false, lockState: 'UNKNOWN' }] },
  { id: 'EQ-2', name: 'Conveyor drive', isolationPoints: [{ id: 'E-2', energyType: 'ELECTRICAL', highEnergy: true, lockState: 'UNKNOWN' }] },
  { id: 'EQ-3', name: 'Air receiver', isolationPoints: [{ id: 'P-1', energyType: 'PNEUMATIC', highEnergy: true, lockState: 'UNKNOWN' }] },
  { id: 'EQ-4', name: 'Mixer', isolationPoints: [{ id: 'M-4', energyType: 'MECHANICAL', highEnergy: false, lockState: 'UNKNOWN' }] },
  { id: 'EQ-5', name: 'Steam line', isolationPoints: [{ id: 'T-5', energyType: 'THERMAL', highEnergy: true, lockState: 'UNKNOWN' }] },
  { id: 'EQ-6', name: 'Gravity-fed hopper', isolationPoints: [{ id: 'G-6', energyType: 'GRAVITATIONAL', highEnergy: true, lockState: 'UNKNOWN' }] },
]);
/** Project identity and sample-only flag must be established by trusted admin adapter. */
export function createSamplePlant({ confirmed, isProjectAdmin, sampleProjectId, projectRegistry, at }) {
  if (confirmed !== true) throw new Error('Ask for confirmation before creating the sample plant');
  if (isProjectAdmin !== true) throw new Error('Project administrator required');
  if (!sampleProjectId || projectRegistry[sampleProjectId]?.sampleOnly !== true) throw new Error('Enforce can only be enabled in a verified sample project');
  const projects = structuredClone(projectRegistry);
  projects[sampleProjectId].policy = { ...DEFAULT_POLICY, mode: 'ENFORCE' };
  const crewA = createPermit({ id: 'SAMPLE-A', projectId: sampleProjectId, equipment: [SAMPLE_EQUIPMENT[0]], crewId: 'Crew A', workers: ['sample-worker-a'], verifierIds: ['sample-verifier-1', 'sample-verifier-2'] });
  let crewB = createPermit({ id: 'SAMPLE-B', projectId: sampleProjectId, equipment: [SAMPLE_EQUIPMENT[0]], crewId: 'Crew B', workers: ['sample-worker-b'], verifierIds: ['sample-verifier-1'] });
  crewB = beginLocking(crewB, 'sample-worker-b', at);
  crewB = applyLock(crewB, { pointId: 'V-3', lockId: 'L-07', actorId: 'sample-worker-b', name: 'Sample Crew B', at, photoRef: 'sample-only:lock-L-07' }, projects[sampleProjectId].policy);
  return { projects, equipment: structuredClone(SAMPLE_EQUIPMENT), permits: [crewA, crewB], sampleOnly: true };
}
