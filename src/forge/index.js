import { kvs, Filter, FilterConditions } from '@forge/kvs';
import { createArchiveRuntime } from './archive.mjs';
import ResolverModule from '@forge/resolver';
// SDK CommonJS default interop differs between native Node and the Forge bundler.
const Resolver = ResolverModule.default ?? ResolverModule;
import api, { assumeTrustedRoute } from '@forge/api';
import { dispatch } from '../server/index.mjs';
import { createForgeWiring } from './actions.mjs';

// Paths originate exclusively in the integration adapters, never in a client URL.
async function requestJira(identity, path, options = {}) {
  const allowedPath = path.startsWith('/rest/api/3/mypermissions?') || path.startsWith('/rest/api/3/issue/') || path.startsWith('/rest/api/3/workflow/rule/config');
  if (!['user', 'app'].includes(identity) || !allowedPath || [...path].some(c => c.charCodeAt(0) < 32 || c === '#')) throw new Error('INVALID_ROUTE');
  const { body, ...rest } = options;
  return (identity === 'user' ? api.asUser() : api.asApp()).requestJira(assumeTrustedRoute(path), {
    ...rest,
    ...(body === undefined ? {} : { headers: { ...rest.headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  });
}
const wiring = createForgeWiring({ dispatch, requestJira, archive: createArchiveRuntime({ kvs, Filter, FilterConditions, api, assumeTrustedRoute }) });
export const checkReadiness = wiring.checkReadiness;
export const requestActivation = wiring.requestActivation;
const resolver = new Resolver();
resolver.define('permitguard', wiring.resolver);
// Compatibility for the disposable capability resource, not agent confirmation endpoints.
resolver.define('capability_probe', wiring.capabilityProbe);
resolver.define('check_readiness', request => wiring.resolver({ ...request, payload: { operation: 'check_readiness', payload: {} } }));
resolver.define('request_activation', request => wiring.resolver({ ...request, payload: { operation: 'request_activation', payload: request.payload || {} } }));
export const handler = resolver.getDefinitions();
