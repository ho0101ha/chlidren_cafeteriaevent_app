
"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-medium rounded-lg transition shadow-sm print:hidden"
    >
      🖨️ 名簿を印刷する
    </button>
  );
}