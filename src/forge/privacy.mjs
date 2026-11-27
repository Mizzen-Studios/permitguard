import { privacyInventory, privacyPlan } from '../server/privacy.mjs';
/** Site-admin-only read-only candidate. Not registered in resolver/manifest. */
export function createPrivacyAdmin({ api, route, store, readArchiveConfig }) {
  return async function privacyAdmin(request) {
    try {
      if (typeof request?.context?.accountId !== 'string' || !request.context.accountId.trim()) throw new Error('SITE_ADMIN_REQUIRED');
      const response = await api.asUser().requestJira(route`/rest/api/3/mypermissions?permissions=ADMINISTER`);
      if (!response?.ok || (await response.json()).permissions?.ADMINISTER?.havePermission !== true) throw new Error('SITE_ADMIN_REQUIRED');
      const payload = request.payload;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Buffer.byteLength(JSON.stringify(payload)) > 1024 || !['inventory_summary','erasure_plan','retention_plan'].includes(payload.operation)) throw new Error('PRIVACY_OPERATION_INVALID');
      const row = await store.read();
      if (payload.operation === 'inventory_summary') {
        const archiveConfig = await readArchiveConfig();
        const {accounts, fingerprint, ...summary} = privacyInventory({site:row.data,archiveConfig});
        return {ok:true,dryRun:true,revision:row.revision,accountCount:accounts.length,...summary,reportingActivated:false,erasurePerformed:false};
      }
      return {ok:true,revision:row.revision,...privacyPlan(row.data,payload.accountId,{closedBefore:payload.operation==='retention_plan'?payload.closedBefore:null})};
    } catch (error) {
      const allowed = new Set(['SITE_ADMIN_REQUIRED','PRIVACY_OPERATION_INVALID','PRIVACY_ACCOUNT_INVALID','PRIVACY_RETENTION_INVALID','PRIVACY_INVENTORY_LIMIT','PRIVACY_STORAGE_INVALID']);
      return {ok:false,code:allowed.has(error?.message)?error.message:'PRIVACY_UNAVAILABLE',erasurePerformed:false};
    }
  };
}
