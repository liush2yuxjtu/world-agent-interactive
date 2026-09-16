import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "商业世界 · Eve", description: "面向中文业务团队的可审计 Business World Model 与 Eve 实验操作员。" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
