const clone = (value) => structuredClone(value);

function simulate(input) {
  const scale = input.agents / 100;
  const scenarios = input.prices.map((price, index) => {
    const conversion = Math.max(3, 17 - price * 0.6 - index * 0.1);
    const units = Math.round(input.agents * conversion / 100 * (1 + input.days / 140));
    const socialReach = Math.round(units * (1.7 + (10 - price) * 0.03));
    const repeatRate = Math.max(5, Math.min(45, 19 + price * 1.15));
    const revenue = units * price;
    const variableCost = units * input.unitCost;
    const experimentCost = 42 * scale * input.repetitions;
    return {
      id: String.fromCharCode(65 + index), price,
      conversion: Number(conversion.toFixed(1)), units,
      repeatRate: Number(repeatRate.toFixed(1)), socialReach,
      revenue: Number(revenue.toFixed(2)),
      netContribution: Number((revenue - variableCost - experimentCost).toFixed(2)),
    };
  });
  const winner = [...scenarios].sort((a, b) => b.netContribution - a.netContribution)[0];
  return { scenarios, winner };
}

export function defaultExperimentInput(overrides = {}) {
  return {
    product: '白桃气泡水', prices: [6, 8], unitCost: 2.4, agents: 100,
    days: 14, repetitions: 2, channel: '小红书', creative: '健康轻盈', ...overrides,
  };
}

export function createMockApproval({ decision = 'approve' } = {}) {
  const requests = [];
  let nextDecision = decision;
  return {
    requests,
    async request(payload) {
      requests.push(clone(payload));
      const resolved = nextDecision;
      nextDecision = decision;
      return resolved;
    },
    approveNext() { nextDecision = 'approve'; },
    denyNext() { nextDecision = 'deny'; },
    reset() { requests.length = 0; nextDecision = decision; },
  };
}

export function createMockBusinessWorldService({ repository, approval, ids, clock, telemetry } = {}) {
  const calls = [];
  const record = (tool, input) => { calls.push({ tool, input: clone(input) }); telemetry?.track?.(`tool.${tool}`, input); };
  return {
    calls,
    async plan_experiment(input) {
      record('plan_experiment', input);
      return { calibrated: false, runInput: clone(input), nextAction: 'Call run_experiment with this plan. Eve will request native approval before execution.' };
    },
    async run_experiment(input) {
      record('run_experiment', input);
      const decision = await approval?.request?.({ tool: 'run_experiment', input: clone(input) }) ?? 'approve';
      if (decision !== 'approve') return { status: 'denied', calibrated: false };
      const result = simulate(input);
      const run = {
        runId: ids?.next?.() ?? 'bwm_test_0001', status: 'completed', calibrated: false,
        createdAt: clock?.iso?.() ?? '2026-09-17T00:00:00.000Z', ...result,
        warning: 'Synthetic mechanism demo only; not a real-market forecast.',
      };
      await repository?.saveRun?.(run);
      return clone(run);
    },
    async get_run({ runId }) {
      record('get_run', { runId });
      const run = await repository?.getRun?.(runId);
      if (!run) throw new Error(`Run not found: ${runId}`);
      return run;
    },
    async check_reliability({ runId }) {
      record('check_reliability', { runId });
      const run = await repository?.getRun?.(runId);
      return { runId, calibrated: false, reliableForRealMarketPrediction: false, status: run ? 'synthetic-only' : 'missing-run' };
    },
    reset() { calls.length = 0; },
  };
}
