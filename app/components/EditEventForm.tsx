"use client";

import { useActionState } from "react";
import { updateEvent } from "@/app/actions/update-event";
import type { FormState } from "@/app/actions/event";
import Link from "next/link";
import type { CafeteriaEvent } from "@prisma/client";

interface EditEventFormProps {
  id: string;
  event: CafeteriaEvent;
}

const initialState: FormState = {
  success: false,
  error: null,
};

export default function EditEventForm({ id, event }: EditEventFormProps) {
  const updateEventWithId = updateEvent.bind(null, id);
  const [state, formAction, isPending] = useActionState(updateEventWithId, initialState);

  const formattedDate = event.date
    ? new Date(event.date).toISOString().slice(0, 16)
    : "";

  return (
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
          defaultValue={event.title}
          placeholder="訂正後のイベント名を入力"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">イベント説明</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={event.description}
          placeholder="変更になった点や、アレルギー情報の更新、参加者に必ず周知したい連絡事項を詳しく記述してください。"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            defaultValue={event.capacity}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開催日時</label>
          <input
            type="datetime-local"
            name="date"
            required
            defaultValue={formattedDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Link
          href={`/events/${id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          キャンセル
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className={`px-4 py-2 text-white font-medium rounded-md transition shadow-sm ${
            isPending ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isPending ? "内容を訂正中..." : "訂正して参加者に周知する"}
        </button>
      </div>
    </form>
  );
}