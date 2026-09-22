"use client";

import React, { useActionState } from "react";
import { leaveWaitingList } from "@/app/actions/waitingList";

type Props = {
  eventId: string;
  userId: string;
};

export function LeaveWaitingListForm({ eventId, userId }: Props) {
  const [state, formAction, isPending] = useActionState(leaveWaitingList, null);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="cafeteriaEventId" value={eventId} />
      <input type="hidden" name="userId" value={userId} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "処理中..." : "キャンセル待ちを解除"}
      </button>

      {state?.error && (
        <p className="text-xs text-red-500 font-medium">{state.error}</p>
      )}
    </form>
  );
}