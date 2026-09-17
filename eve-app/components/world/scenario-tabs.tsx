"use client";

export type ScenarioName = "基准" | "增长" | "下行";

const scenarios: ScenarioName[] = ["基准", "增长", "下行"];

export function ScenarioTabs({
  value,
  onChange,
}: {
  value: ScenarioName;
  onChange: (scenario: ScenarioName) => void;
}) {
  return (
    <div className="scenario-tabs" aria-label="场景选择" role="group">
      {scenarios.map((label) => (
        <button
          aria-pressed={value === label}
          className={value === label ? "is-active" : ""}
          key={label}
          onClick={() => onChange(label)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
