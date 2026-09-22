"use client";

import { useActionState } from "react";
import { deleteEventImmediately, type AdminActionState } from "@/app/actions/admin";

interface DeleteEventButtonProps {
  eventId: string;
}

const initialState: AdminActionState = {
  success: false,
  error: null,
};

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  // 第一引数に eventId をバインドして Action に渡す
  const deleteWithId = deleteEventImmediately.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(deleteWithId, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm("警告: 参加者データも含めて即時削除されます。本当に実行しますか？")) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="inline-block">
      {state.error && (
        <span className="text-xs text-red-600 block mb-1">{state.error}</span>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-2.5 py-1.5 text-sm md:text-base font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition disabled:opacity-50"
      >
        {isPending ? "削除中..." : "即時削除"}
      </button>
    </form>
  );
}