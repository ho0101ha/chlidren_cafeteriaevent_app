"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function EventFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // フォームの開閉状態（初期値は非表示）
  const [isOpen, setIsOpen] = useState(false);

  // フォーム内の入力値をローカルstateで保持
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "date_asc");

  // 活性中のフィルターがあるかどうかの判定
  const hasActiveFilter =
    Boolean(searchParams.get("search")) ||
    (searchParams.get("status") && searchParams.get("status") !== "all") ||
    (searchParams.get("sort") && searchParams.get("sort") !== "date_asc");

  // 🔍 検索ボタン押下時に URL パラメータを更新
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);
    if (sort !== "date_asc") params.set("sort", sort);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // 🔄 リセットボタン押下時
  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setSort("date_asc");

    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="space-y-2">
      {/* 🔘 トグル表示用ボタン */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-700 bg-white border border-zinc-200 px-3.5 py-2 rounded-lg hover:bg-zinc-50 active:scale-95 transition shadow-sm"
        >
          <span>イベントを条件で絞り込む</span>
          {hasActiveFilter && (
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          )}
          <span className="text-xs text-zinc-400">
            {isOpen ? "▲ 閉じる" : "▼ 開く"}
          </span>
        </button>

        {hasActiveFilter && !isOpen && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-orange-600 font-semibold hover:underline"
          >
            条件をクリア
          </button>
        )}
      </div>

      {/* 📦 アコーディオン形式の検索フォーム */}
      {isOpen && (
        <form
          onSubmit={handleSearch}
          className="bg-white p-3 sm:p-4 rounded-lg border border-zinc-200 shadow-sm space-y-3 transition-all duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* キーワード検索 */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">
                キーワード検索
              </label>
              <input
                type="text"
                placeholder="タイトルで検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* ステータス絞り込み */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              >
                <option value="all">すべて表示</option>
                <option value="upcoming">開催予定</option>
                <option value="available">空席あり</option>
                <option value="full">満席</option>
                <option value="ended">終了済み</option>
              </select>
            </div>

            {/* ソート順 */}
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">
                並び替え
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              >
                <option value="date_asc">開催日時が近い順</option>
                <option value="date_desc">開催日時が遠い順</option>
                <option value="booked_desc">予約数が多い順</option>
              </select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition"
            >
              リセット
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-md transition shadow-sm disabled:opacity-50"
            >
              {isPending ? "検索中..." : "この条件で検索"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useState, useTransition } from "react";

// export function EventFilterForm() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const [search,setSearch] = useState(searchParams.get("search") ?? "");
//   const [status,setStatus] = useState(searchParams.get("status") ?? "");
//   const [sort,setSort] = useState(searchParams.get("sort") ?? "");

//  const handleSearch = (e:React.FormEvent)=>{
//   const params = new URLSearchParams();

//   if(search.trim()) {params.set("search",search.trim());}
//   if(status ===  "all") {params.set("status",status.trim());}
//   if(sort === "date_asc") {params.set("sort",search.trim());}
//   startTransition(() => {
//     router.push(`${pathname}?${params.toString()}`);
//   });
//  }

//   const handleFilterChange = (key: string, value: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (value) {
//       params.set(key, value);
//     } else {
//       params.delete(key);
//     }

//     startTransition(() => {
//       router.push(`${pathname}?${params.toString()}`);
//     });
//   };

//   return (
//     <div className="bg-white p-3 sm:p-4 rounded-lg border border-zinc-200 shadow-sm space-y-2.5">
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//         {/* キーワード検索 */}
//         <div>
//           <label className="block text-xs font-bold text-zinc-600 mb-1">
//             キーワード検索
//           </label>
//           <input
//             type="text"
//             placeholder="タイトルで検索..."
//             defaultValue={searchParams.get("search") ?? ""}
//             onChange={(e) => handleFilterChange("search", e.target.value)}
//             className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
//           />
//         </div>

//         {/* ステータス絞り込み */}
//         <div>
//           <label className="block text-xs font-bold text-zinc-600 mb-1">
//             ステータス
//           </label>
//           <select
//             defaultValue={searchParams.get("status") ?? "all"}
//             onChange={(e) => handleFilterChange("status", e.target.value)}
//             className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
//           >
//             <option value="all">すべて表示</option>
//             <option value="upcoming">開催予定</option>
//             <option value="available">空席あり</option>
//             <option value="full">満席</option>
//             <option value="ended">終了済み</option>
//           </select>
//         </div>

//         {/* ソート順 */}
//         <div>
//           <label className="block text-xs font-bold text-zinc-600 mb-1">
//             並び替え
//           </label>
//           <select
//             defaultValue={searchParams.get("sort") ?? "date_asc"}
//             onChange={(e) => handleFilterChange("sort", e.target.value)}
//             className="w-full text-xs sm:text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
//           >
//             <option value="date_asc">開催日時が近い順</option>
//             <option value="date_desc">開催日時が遠い順</option>
//             <option value="booked_desc">予約数が多い順</option>
//           </select>
//         </div>
//       </div>

//       {isPending && (
//         <p className="text-xs text-orange-600 font-semibold animate-pulse">
//           更新中...
//         </p>
//       )}
//     </div>
//   );
// }
