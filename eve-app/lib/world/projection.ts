import type { ExperimentProjection, Scenario } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeScenario(value: Record<string, unknown>): Scenario {
  return {
    id: String(value.id ?? ""),
    price: Number(value.price ?? 0),
    conversion: Number(value.conversion ?? 0),
    units: Number(value.units ?? 0),
    repeatRate: Number(value.repeatRate ?? 0),
    socialReach: Number(value.socialReach ?? 0),
    revenue: Number(value.revenue ?? 0),
    netContribution: Number(value.netContribution ?? 0),
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
