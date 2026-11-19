// Explicit configured schema/type IDs only. Never enumerate unrelated schemas/types.
export const ASSETS = Object.freeze({ workspaceId: '1db77da0-e980-42be-9efa-3a83dbf05728', schemaId: '16', equipmentTypeId: '147', pointTypeId: '148' });
const need = (ok, message) => { if (!ok) throw new Error('ASSETS_UNAVAILABLE: ' + message); };
export function validateAssetsConfig(config = ASSETS) {
  need(config && typeof config === 'object' && !Array.isArray(config), 'Invalid Assets config');
  need(typeof config.workspaceId === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(config.workspaceId), 'Invalid workspace ID');
  for (const field of ['schemaId','equipmentTypeId','pointTypeId']) need(typeof config[field] === 'string' && /^[1-9][0-9]{0,14}$/.test(config[field]), 'Invalid ' + field);
  need(config.equipmentTypeId !== config.pointTypeId, 'Distinct Equipment and Isolation points types required');
  return Object.fromEntries(['workspaceId','schemaId','equipmentTypeId','pointTypeId'].map(k => [k,config[k]]));
}
export function assetsAdapter(api, route) {
  return async function readAssets(config = ASSETS) {
    const { workspaceId, schemaId, equipmentTypeId, pointTypeId } = validateAssetsConfig(config);
    async function assertType(typeId, name) {
      const response = await api.asUser().requestJira(route`/jsm/assets/workspace/${workspaceId}/v1/objecttype/${typeId}`);
      need(response.ok, 'asUser type access denied (' + response.status + ')');
      const type = await response.json();
      need(String(type.id) === typeId && String(type.objectSchemaId) === schemaId && type.name === name, 'Only exact Equipment and Isolation points types in configured schema are permitted');
    }
    // Establish BOTH type boundaries before issuing ANY object query.
    await assertType(equipmentTypeId, 'Equipment');
    await assertType(pointTypeId, 'Isolation points');
    async function query(typeId) {
      // A bounded complete read, never silently truncate a lock-bearing register.
      const response = await api.asUser().requestJira(route`/jsm/assets/workspace/${workspaceId}/v1/object/aql?includeAttributes=true&maxResults=100`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qlQuery: 'objectSchemaId = ' + schemaId + ' AND objectTypeId = ' + typeId }) });
      need(response.ok, 'asUser access denied (' + response.status + ')');
      const body = await response.json();
      need(Array.isArray(body.values) && body.values.length < 100 && body.isLast !== false && body.last !== false && body.hasMoreResults !== true && !(Number(body.startAt) > 0) && !(Number(body.total) > body.values.length), 'Incomplete register');
      for (const object of body.values) need(String(object.objectType?.id) === typeId && String(object.objectType?.objectSchemaId) === schemaId, 'Unexpected object type/schema');
      need(Array.isArray(body.objectTypeAttributes), 'Missing attribute definitions');
      const definitions = new Map(), names = new Set();
      for (const definition of body.objectTypeAttributes) {
        const id = String(definition.id);
        need(/^[1-9][0-9]{0,14}$/.test(id) && typeof definition.name === 'string' && !definitions.has(id) && !names.has(definition.name), 'Duplicate or invalid attribute definition');
        need(String(definition.objectType?.id) === typeId && String(definition.objectType?.objectSchemaId) === schemaId, 'Attribute definition outside configured type/schema');
        definitions.set(id, definition); names.add(definition.name);
      }
      return body.values.map(object => {
        need(Array.isArray(object.attributes), 'Missing object attributes');
        const used = new Set();
        const attributes = object.attributes.map(attribute => {
          const id = String(attribute.objectTypeAttributeId), definition = definitions.get(id);
          need(definition && !used.has(id), 'Unknown or duplicate object attribute'); used.add(id);
          return { objectTypeAttribute: { name: definition.name }, objectAttributeValues: attribute.objectAttributeValues };
        });
        return { id: object.id, objectKey: object.objectKey, label: object.label, attributes };
      });
    }
    const equipment = await query(equipmentTypeId);
    const points = await query(pointTypeId);
    const scalar = (object, name) => {
      const attrs = object.attributes?.filter(a => a.objectTypeAttribute?.name === name);
      need(attrs?.length === 1 && attrs[0].objectAttributeValues?.length === 1, 'Missing or ambiguous ' + name);
      return attrs[0].objectAttributeValues[0].value;
    };
    const normalized = equipment.map(e => {
      need(/^[0-9]+$/.test(String(e.id)) && typeof e.objectKey === 'string' && typeof e.label === 'string', 'Invalid equipment');
      const isolationPoints = points.filter(p => scalar(p, 'Equipment key') === e.objectKey).map(p => {
        const energyType = scalar(p, 'Energy type'), highEnergy = scalar(p, 'High energy'), lockState = scalar(p, 'Lock state');
        need(/^[0-9]+$/.test(String(p.id)) && typeof energyType === 'string' && energyType.trim() && [true,false,'true','false'].includes(highEnergy) && typeof lockState === 'string' && lockState.trim(), 'Invalid isolation metadata');
        return { id: 'assets:' + workspaceId + ':' + schemaId + ':' + p.id, key: p.objectKey, energyType, highEnergy: highEnergy === true || highEnergy === 'true', lockState };
      });
      need(isolationPoints.length > 0, 'Equipment has no accessible isolation points');
      return { id: 'assets:' + workspaceId + ':' + schemaId + ':' + e.id, key: e.objectKey, name: e.label, isolationPoints };
    });
    need(normalized.length > 0 && normalized.length <= 6, 'Select one to six approved equipment records');
    return normalized;
  };
}
