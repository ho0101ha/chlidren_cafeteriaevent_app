// app/components/CheckInForm.tsx
"use client";

import { useActionState, useTransition } from "react";
import { toggleCheckIn, CheckInState } from "@/app/actions/attendee";

type CheckInFormProps = {
  bookingId: string;
  eventId: string;
  initialAttended: boolean;
  labelNumber: number;
  userName: string;
};

const initialState: CheckInState = {
  success: false,
  error: null,
};

export function CheckInForm({
  bookingId,
  eventId,
  initialAttended,
  labelNumber,
  userName,
}: CheckInFormProps) {
  const [state, formAction, isPending] = useActionState(toggleCheckIn, initialState);
  const [, startTransition] = useTransition();

  // return の上に onChange ハンドラーを定義
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.target.form;
    if (form) {
      startTransition(() => {
        form.requestSubmit();
      });
    }
  };

  return (
    <form action={formAction} className="inline-flex items-center">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="attended" value={(!initialAttended).toString()} />

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={initialAttended}
          disabled={isPending}
          onChange={handleChange}
          className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer disabled:opacity-50"
        />
        {labelNumber > 0 && (
          <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
            No.{labelNumber}
          </span>
        )}
        {userName && (
          <span
            className={`font-bold text-sm truncate transition-colors ${
              initialAttended ? "text-blue-900 line-through opacity-75" : "text-zinc-900"
            }`}
          >
            {userName}
          </span>
        )}
      </label>

      {isPending && (
        <span className="ml-2 text-xs text-zinc-400 animate-pulse">更新中...</span>
      )}

      {state.error && (
        <span className="ml-2 text-xs text-red-500">{state.error}</span>
      )}
    </form>
  );
}