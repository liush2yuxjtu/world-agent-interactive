import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eve × Business World Model",
  description: "用真实 Vercel Eve durable agent 驱动的 Business World Model 实验对话。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
