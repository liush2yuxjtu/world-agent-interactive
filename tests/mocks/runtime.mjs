export function createMockEnv(seed = {}) {
  let values = { ...seed };
  return {
    get: (key, fallback = undefined) => values[key] ?? fallback,
    has: (key) => Object.hasOwn(values, key),
    set: (key, value) => { values[key] = String(value); },
    unset: (key) => { delete values[key]; },
    all: () => ({ ...values }),
    reset: () => { values = { ...seed }; },
  };
}

export function createMockLogger() {
  const entries = [];
  const logger = {};
  for (const level of ['debug', 'info', 'warn', 'error']) {
    logger[level] = (message, meta = undefined) => entries.push({ level, message, meta: structuredClone(meta) });
  }
  logger.entries = entries;
  logger.reset = () => { entries.length = 0; };
  return logger;
}

export function createMockTelemetry() {
  const events = [];
  return {
    events,
    track(name, properties = {}) { events.push({ name, properties: structuredClone(properties) }); },
    reset() { events.length = 0; },
  };
}
