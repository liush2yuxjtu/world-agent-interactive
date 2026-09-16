"use client";
import { useState } from "react";
export function ScenarioTabs() {
  const [active, setActive] = useState("基准");
  return <div className="scenario-tabs" aria-label="场景选择">{["基准", "增长", "下行"].map((label) => <button className={active === label ? "is-active" : ""} key={label} onClick={() => setActive(label)} type="button">{label}</button>)}</div>;
}
