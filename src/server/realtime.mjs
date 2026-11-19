// Parent may inject issue-scoped publisher after installing @forge/realtime.
// Official default publish is restricted to frontend-invoked module+issue context.
// Never use publishGlobal for permit data. No browser acceptance is claimed.
export function issueInvalidationPublisher(publish) {
  return async ({ revision }) => {
    const result = await publish('permitguard', { invalidated: true, revision });
    if (result?.errors && (!Array.isArray(result.errors) || result.errors.length)) throw new Error('REALTIME_UNAVAILABLE');
    return result;
  };
}
