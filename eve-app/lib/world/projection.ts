import type { ExperimentProjection, Scenario } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeScenario(value: Record<string, unknown>): Scenario {
  return {
    id: String(value.id ?? ""),
    price: finiteNumber(value.price),
    conversion: finiteNumber(value.conversion),
    units: finiteNumber(value.units),
    repeatRate: finiteNumber(value.repeatRate),
    socialReach: finiteNumber(value.socialReach),
    revenue: finiteNumber(value.revenue),
    netContribution: finiteNumber(value.netContribution),
  };
}

export function projectRunOutput(value: unknown): ExperimentProjection | null {
  if (!isRecord(value) || !Array.isArray(value.scenarios) || !isRecord(value.winner)) return null;
  const scenarios = value.scenarios.filter(isRecord).map(normalizeScenario);
  if (scenarios.length < 2) return null;
  return {
    runId: String(value.runId ?? ""),
    status: String(value.status ?? ""),
    calibrated: false,
    scenarios,
    winner: normalizeScenario(value.winner),
  };
}
