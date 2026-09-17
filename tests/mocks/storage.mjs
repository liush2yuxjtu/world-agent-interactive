export function createMockStorage(seed = {}) {
  const map = new Map(Object.entries(seed).map(([k, v]) => [String(k), String(v)]));
  let failNext = null;
  const maybeFail = () => {
    if (failNext) {
      const error = failNext;
      failNext = null;
      throw error;
    }
  };
  return {
    get length() { return map.size; },
    key(index) { return [...map.keys()][index] ?? null; },
    getItem(key) { maybeFail(); return map.get(String(key)) ?? null; },
    setItem(key, value) { maybeFail(); map.set(String(key), String(value)); },
    removeItem(key) { maybeFail(); map.delete(String(key)); },
    clear() { maybeFail(); map.clear(); },
    entries: () => Object.fromEntries(map),
    failOnce(error = new Error('mock storage failure')) { failNext = error; },
    reset(nextSeed = seed) {
      map.clear();
      for (const [key, value] of Object.entries(nextSeed)) map.set(String(key), String(value));
      failNext = null;
    },
  };
}
