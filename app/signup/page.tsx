// app/signup/page.tsx
"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/signup";
import type { SignupState } from "@/app/actions/signup";
import Link from "next/link";

const initialState: SignupState = {
  success: false,
  error: null,
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-800 text-center mb-1">アカウント作成</h1>
        <p className=" text-zinc-500 text-center mb-6">子ども食堂イベントアプリへようこそ</p>

        <form action={formAction} className="space-y-4">
          {/* エラーメッセージ表示 */}
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">
               {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">お名前</label>
            <input
              type="text"
              name="name"
              required
              placeholder="山田 太郎"
              disabled={isPending}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              required
              placeholder="example@email.com"
              disabled={isPending}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">パスワード </label>
            <input
              type="password"
              name="password"
              required
              minLength={1}
              placeholder="••••••••"
              disabled={isPending}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">パスワード（確認用）</label>
            <input
              type="password"
              name="passwordConfirm"
              required
              placeholder="••••••••"
              disabled={isPending}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2.5 text-white font-medium rounded-md transition shadow-sm mt-2 ${
              isPending
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-300"
            }`}
          >
            {isPending ? "登録中..." : "アカウントを登録する"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-zinc-600">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-orange-600 hover:underline font-medium">
            ログインはこちら
          </Link>
        </div>
      </div>
    </main>
  );
}