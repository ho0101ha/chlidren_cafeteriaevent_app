import { Suspense } from "react";
import Link from "next/link";
import { DashboardStatsSection } from "../components/admin/DashboardStatsSection";
import { EventsListSection } from "../components/admin/EventsListSection";

interface PageProps  {
  searchParams: Promise<{ page?: string }>;
};

export default function AdminDashboardPage({searchParams}:PageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー・タイトル部分 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-800">
                管理ダッシュボード
              </h1>
              <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded border border-rose-200">
                管理者専用
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1.5">
              イベントの作成・編集、参加者名簿の確認、中止手続きを一括で管理できます。
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/"
              className="flex-1 md:flex-initial text-center text-base font-medium text-zinc-600 hover:text-zinc-900 transition py-2.5"
            >
              ← 一般画面
            </Link>
          </div>
        </div>

        {/* 統計カードセクション */}
        <Suspense >
          <DashboardStatsSection />
        </Suspense>

        {/* イベント一覧セクション */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="font-bold text-zinc-800 text-base">
              全イベント一覧・管理操作
            </h2>
          </div>

          <Suspense >
            <EventsListSection searchParams={searchParams}/>
          </Suspense>
        </section>
      </div>
    </div>
  );
}