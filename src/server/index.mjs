import { publish } from '@forge/realtime';
import { issueInvalidationPublisher } from './realtime.mjs';
import { assetsAdapter } from './assets.mjs';
import api, { route } from '@forge/api';
import { kvs, Filter, FilterConditions } from '@forge/kvs';
import { forgeStore, storageHealth } from './store.mjs';
import { createService } from './service.mjs';
import { jiraAdapters } from './jira.mjs';
// No SQL, external runtime, or credentials. Errors deliberately propagate fail-closed.
export const dispatch = createService({ store: forgeStore({ kvs, Filter, FilterConditions }), ...jiraAdapters(api, route), readAssets: assetsAdapter(api, route), publish: issueInvalidationPublisher(publish) });

export const testStorageHealth = () => storageHealth({ kvs, Filter, FilterConditions });
