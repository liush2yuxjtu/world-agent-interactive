export * from './core.mjs';
export * from './clock.mjs';
export * from './storage.mjs';
export * from './repository.mjs';
export * from './network.mjs';
export * from './runtime.mjs';
export * from './business-world.mjs';

import { createIdSource, createMockRandom } from './core.mjs';
import { createMockClock } from './clock.mjs';
import { createMockStorage } from './storage.mjs';
import { createMockWorldRepository } from './repository.mjs';
import { createMockEnv, createMockLogger, createMockTelemetry } from './runtime.mjs';
import { createMockApproval, createMockBusinessWorldService } from './business-world.mjs';

export function createBusinessWorldTestHarness(options = {}) {
  const clock = createMockClock(options.now);
  const ids = createIdSource('bwm_test');
  const random = createMockRandom(options.randomSequence ?? [0.1, 0.5, 0.9]);
  const localStorage = createMockStorage(options.localStorage);
  const sessionStorage = createMockStorage(options.sessionStorage);
  const repository = createMockWorldRepository(options.repository);
  const env = createMockEnv(options.env);
  const logger = createMockLogger();
  const telemetry = createMockTelemetry();
  const approval = createMockApproval(options.approval);
  const businessWorld = createMockBusinessWorldService({ repository, approval, ids, clock, telemetry });
  const reset = () => {
    clock.reset(); ids.reset(); random.reset(); localStorage.reset(); sessionStorage.reset();
    repository.reset(); env.reset(); logger.reset(); telemetry.reset(); approval.reset(); businessWorld.reset();
  };
  return { clock, ids, random, localStorage, sessionStorage, repository, env, logger, telemetry, approval, businessWorld, reset };
}
