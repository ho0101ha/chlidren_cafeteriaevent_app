import { auth } from "@/lib/auth";
import Link from "next/link";
import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 md:px-4 py-3 flex items-center justify-between relative">
        {/* ロゴ / タイトル */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg md:text-2xl text-zinc-800 hover:opacity-80 transition"
        >
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full shrink-0"></span>
          子ども食堂ポータル
        </Link>

        {/* クライアント対応ナビゲーション */}
        <NavbarClient user={user} />
      </div>
    </header>
  );
}