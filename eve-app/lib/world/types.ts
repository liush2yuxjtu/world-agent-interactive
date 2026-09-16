export type Scenario = {
  id: string;
  price: number;
  conversion: number;
  units: number;
  repeatRate: number;
  socialReach: number;
  revenue: number;
  netContribution: number;
};

export type ExperimentProjection = {
  runId: string;
  status: string;
  calibrated: false;
  scenarios: Scenario[];
  winner: Scenario;
};
