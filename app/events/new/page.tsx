"use client";

import { useActionState } from "react";
import createEvent from "@/app/actions/event";
import type { FormState } from "@/app/actions/event";
import Link from "next/link";

const initialState: FormState = {
  success: false,
  error: null,
};

export default function NewEventPage() {
  const [state, formAction, isPending] = useActionState(createEvent, initialState);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">新しい子ども食堂イベントを追加</h1>

      <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">イベント名</label>
          <input
            type="text"
            name="title"
            required
            placeholder="例：みんなで食べる特製カレーライス会"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">イベント説明</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="イベントの詳細や、アレルギー情報を入力してください。"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">定員 (人)</label>
            <input
              type="number"
              name="capacity"
              required
              min="1"
              defaultValue="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開催日時</label>
            <input
              type="datetime-local"
              name="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            キャンセル
          </Link>
          
          <button
            type="submit"
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition shadow-sm ${
              isPending 
                ? "bg-orange-400 cursor-not-allowed" 
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {isPending ? "登録中..." : "イベントを登録する"}
          </button>
        </div>
      </form>
    </main>
  );
}