"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarClientProps {
  user: {
    name?: string | null;
    role?: string | null;
  } | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isOrganizer = user?.role === "ADMIN" || user?.role === "DONOR";

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* 💻 PC・タブレット用 (md以上) */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-2 lg:gap-3">
          <li>
            <Link
              href="/"
              className="text-sm md:text-base font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-50 transition block"
            >
              イベント一覧
            </Link>
          </li>

          {user ? (
            <>
              {isOrganizer && (
                <li>
                  <Link
                    href="/events/new"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="font-bold text-sm md:text-base">+</span> イベント作成
                  </Link>
                </li>
              )}

              <li>
                <Link
                  href="/profile"
                  className="text-sm md:text-base font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <span>{user.name || "マイページ"}</span>
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/login"
                className="text-xs md:text-sm font-semibold text-white bg-[#005088] hover:bg-[#003b66] px-4 py-2 rounded-lg shadow-sm transition block active:scale-[0.98]"
              >
                ログイン
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* 📱 スマホ用 (md未満) - 右端固定のコンテナ */}
      <div className="md:hidden flex items-center ml-auto">
        {/* ハンバーガー / ✕ ボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={`p-2 rounded-lg transition focus:outline-none z-50 relative ${
            isOpen
              ? "text-zinc-800 bg-zinc-100"
              : "text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200"
          }`}
          aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* 画面全体幅で開くドロップダウンメニュー */}
        {isOpen && (
          <div className="fixed top-14  right-0 w-full bg-white border-b border-zinc-200 shadow-xl px-6 py-4 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
            <nav className="w-full max-w-md mx-auto">
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="block px-4 py-3 text-base font-medium text-zinc-700 rounded-xl hover:bg-zinc-50 active:bg-zinc-100 transition"
                  >
                    イベント一覧
                  </Link>
                </li>

                {user ? (
                  <>
                    {isOrganizer && (
                      <li>
                        <Link
                          href="/events/new"
                          onClick={closeMenu}
                          className="flex items-center gap-2 px-4 py-3 text-base font-semibold text-amber-800 bg-amber-50 rounded-xl active:bg-amber-100 transition"
                        >
                          <span className="font-bold text-lg">+</span> イベント作成
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-4 py-3 text-base font-medium text-zinc-800 bg-zinc-100 rounded-xl active:bg-zinc-200 transition"
                      >
                        <span>{user.name || "マイページ"}</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="pt-1">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="block text-center text-base font-semibold text-white bg-[#005088] active:bg-[#003b66] px-4 py-3 rounded-xl transition shadow-sm"
                    >
                      ログイン
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}