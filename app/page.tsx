import Link from "next/link";
import { Suspense } from "react";
import Top from "./components/top/Top";

export default function TopPage({searchParams,}:{searchParams:Promise<{
  search?:string;
  status?:string;
  sort?:string;

}>}) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6 sm:p-6 space-y-6 sm:space-y-8 bg-[#f3f0df]/20 min-h-screen -z-10">
      {/* 📱 ヘッダーエリア：スマホ(縦並び) → タブレット・PC(横並び) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5 sm:pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-400 leading-tight">
            子ども食堂 予約プラットフォーム
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm">
            地域のあたたかい食卓を、デジタルとプロボノの力でつなぐ。
          </p>
        </div>

        {/* ログイン・新規登録ボタン */}
        <div className="shrink-0">
          <Link
            href="/login"
            className="inline-block w-full sm:w-auto text-center border border-orange-500 text-orange-500 hover:text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-orange-500 transition duration-150 shadow-sm"
          >
            ログイン / 登録
          </Link>
        </div>
      </div>

      {/* イベント一覧セクション */}
      <Suspense >
        <Top searchParams={searchParams}/>
      </Suspense>
    </main>
  );
}

// 💡 イベント一覧読み込み用の骨組み（スケルトンUI）
