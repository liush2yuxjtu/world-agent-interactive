const clone = (value) => value == null ? value : structuredClone(value);

export function createMockWorldRepository(seed = {}) {
  const state = {
    entities: new Map((seed.entities ?? []).map((item) => [item.id, clone(item)])),
    runs: new Map((seed.runs ?? []).map((item) => [item.runId, clone(item)])),
    audit: (seed.audit ?? []).map(clone),
  };
  let failNext = null;
  const guard = () => {
    if (failNext) {
      const error = failNext;
      failNext = null;
      throw error;
    }
  };
  const audit = (type, payload) => state.audit.push({ type, payload: clone(payload) });
  return {
    async getEntity(id) { guard(); return clone(state.entities.get(id) ?? null); },
    async listEntities() { guard(); return [...state.entities.values()].map(clone); },
    async upsertEntity(entity) { guard(); state.entities.set(entity.id, clone(entity)); audit('entity.upserted', entity); return clone(entity); },
    async deleteEntity(id) { guard(); const existed = state.entities.delete(id); audit('entity.deleted', { id, existed }); return existed; },
    async saveRun(run) { guard(); state.runs.set(run.runId, clone(run)); audit('run.saved', run); return clone(run); },
    async getRun(runId) { guard(); return clone(state.runs.get(runId) ?? null); },
    async listAudit() { guard(); return state.audit.map(clone); },
    failOnce(error = new Error('mock repository failure')) { failNext = error; },
    snapshot() {
      return {
        entities: [...state.entities.values()].map(clone),
        runs: [...state.runs.values()].map(clone),
        audit: state.audit.map(clone),
      };
    },
    reset() {
      state.entities.clear(); state.runs.clear(); state.audit.length = 0; failNext = null;
      for (const item of seed.entities ?? []) state.entities.set(item.id, clone(item));
      for (const item of seed.runs ?? []) state.runs.set(item.runId, clone(item));
      for (const item of seed.audit ?? []) state.audit.push(clone(item));
    },
  };
}
