import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Twin — デジタルの安全を、構造から確かめる",
  description: "端末やメールを失ったとき、どのログイン・復旧経路が残るか。架空の構成で試すセキュリティシミュレーション。",
  applicationName: "Security Twin",
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#091116",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
