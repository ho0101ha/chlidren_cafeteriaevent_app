"use client";

import { useActionState } from "react";
import announceDeleteEvent from "@/app/actions/announce-delete-event";
import type { DeleteFormState } from "@/app/actions/announce-delete-event";
import Link from "next/link";

interface DeleteAnnounceFormProps {
  id: string;
}

const initialState: DeleteFormState = {
  success: false,
  error: null,
};

export default function DeleteAnnounceForm({ id }: DeleteAnnounceFormProps) {
  const announceDeleteWithId = announceDeleteEvent.bind(null, id);
  const [state, formAction, isPending] = useActionState(announceDeleteWithId, initialState);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md font-medium">
          ⚠️ {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          中止・削除の理由（参加者へ周知されます）
        </label>
        <textarea
          name="reason"
          required
          rows={4}
          placeholder="（例）食材の調達スケジュール変更のため、誠に勝手ながら今回の開催は中止とさせていただきます。次回のご参加をお待ちしております。"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 shadow-sm"
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Link
          href={`/events/${id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          戻る
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className={`px-4 py-2 text-white font-medium rounded-md transition shadow-sm ${
            isPending ? "bg-rose-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {isPending ? "処理を実行中..." : "開催を中止して告知を開始する"}
        </button>
      </div>
    </form>
  );
}