"use client";

import { useActionState } from "react";
import { BookingActionState, deleteBooking } from "../actions/booking";



const initialState: BookingActionState = {
  success: false,
  message: "",
};

interface CancelBookingButtonProps {
  eventId: string;
}

export function CancelBookingButton({ eventId }: CancelBookingButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteBooking, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("この予約をキャンセルしてもよろしいですか？")) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      {state.message && (
        <p
          className={`text-sm md:text-base font-medium p-1.5 md:p-2 rounded border ${
            state.success
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-100"
          }`}
        >
          {state.message}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="eventId" value={eventId} />

        <button
          type="submit"
          disabled={isPending}
          className={`w-full text-center py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition ${
            isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "キャンセル中..." : "予約をキャンセルする"}
        </button>
      </form>
    </div>
  );
}