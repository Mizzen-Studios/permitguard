import { publish } from '@forge/realtime';
import { issueInvalidationPublisher } from './realtime.mjs';
import { assetsAdapter } from './assets.mjs';
import api, { route } from '@forge/api';
import { kvs, Filter, FilterConditions } from '@forge/kvs';
import { forgeStore, forgeChallenges, storageHealth } from './store.mjs';
import { createService } from './service.mjs';
import { jiraAdapters } from './jira.mjs';
// No SQL, external runtime, or credentials. Errors deliberately propagate fail-closed.
export const dispatch = createService({ challenges: forgeChallenges(kvs), store: forgeStore({ kvs, Filter, FilterConditions }), ...jiraAdapters(api, route), readAssets: assetsAdapter(api, route), publish: issueInvalidationPublisher(publish), observeTiming: timing => console.info('PG_SAVE_TIMING',JSON.stringify(timing)) });

export const testStorageHealth = () => storageHealth({ kvs, Filter, FilterConditions });
