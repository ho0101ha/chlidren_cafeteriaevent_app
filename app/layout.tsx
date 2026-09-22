import type { Metadata } from "next";

import "./globals.css";
// 💡 { Navbar } から Navbar に修正

import { Suspense } from "react";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "子ども食堂ポータル",
  description: "地域の子ども食堂イベント予約・管理プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-zinc-50 min-h-screen flex flex-col text-zinc-900 antialiased">
       <Suspense>
       <Navbar />
       </Suspense>
      
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
          {children}
        </div>
      </body>
    </html>
  );
}