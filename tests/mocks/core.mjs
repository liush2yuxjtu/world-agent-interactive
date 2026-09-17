export function deepClone(value) {
  return value == null ? value : structuredClone(value);
}

export function createMockFunction(implementation = () => undefined) {
  let defaultImpl = implementation;
  const once = [];
  const calls = [];
  const fn = async (...args) => {
    calls.push(deepClone(args));
    const impl = once.length ? once.shift() : defaultImpl;
    return await impl(...args);
  };
  fn.calls = calls;
  fn.mockImplementation = (next) => { defaultImpl = next; return fn; };
  fn.mockImplementationOnce = (next) => { once.push(next); return fn; };
  fn.mockResolvedValue = (value) => fn.mockImplementation(async () => deepClone(value));
  fn.mockResolvedValueOnce = (value) => fn.mockImplementationOnce(async () => deepClone(value));
  fn.mockRejectedValue = (error) => fn.mockImplementation(async () => { throw error; });
  fn.mockRejectedValueOnce = (error) => fn.mockImplementationOnce(async () => { throw error; });
  fn.reset = () => { calls.length = 0; once.length = 0; defaultImpl = implementation; };
  return fn;
}

export function createSequence(values, fallback) {
  const queue = values.map(deepClone);
  return () => queue.length ? deepClone(queue.shift()) : deepClone(fallback);
}

export function createIdSource(prefix = 'test', start = 1) {
  let current = start;
  return {
    next: () => `${prefix}_${String(current++).padStart(4, '0')}`,
    reset: () => { current = start; },
  };
}

export function createMockRandom(sequence = [0.5]) {
  let index = 0;
  return {
    next: () => {
      const value = sequence[index % sequence.length];
      index += 1;
      return value;
    },
    reset: () => { index = 0; },
  };
}
