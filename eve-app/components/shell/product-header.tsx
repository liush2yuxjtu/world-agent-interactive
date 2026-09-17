"use client";

import { useEffect } from "react";

function focusEveComposer() {
  const input = document.querySelector<HTMLInputElement>('[aria-label="告诉 Eve 你想测试什么"]');
  input?.focus();
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function ProductHeader({
  title = "商业世界 · 华东企业",
  eyebrow = "业务总览",
}: {
  title?: string;
  eyebrow?: string;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusEveComposer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="product-header">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p>截至 9月16日 · 演示数据源 · 模型状态可审计</p>
      </div>
      <div className="header-actions">
        <span className="source-status"><i />18 个演示来源</span>
        <button aria-label="聚焦 Eve 输入框" onClick={focusEveComposer} title="聚焦 Eve（⌘/Ctrl K）" type="button">⌘ K</button>
      </div>
    </header>
  );
}
