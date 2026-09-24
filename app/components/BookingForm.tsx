"use client";

import { useActionState } from "react";
import { BookingActionState, controlBooking, deleteBooking } from "../actions/booking";

interface BookingFormProps {
  eventId: string;
  maxGuests: number;
  defaultGuests?: number;
  isEdit?: boolean;
}

const initialState: BookingActionState = {
  success: false,
  message: null,
};

export function BookingForm({
  eventId,
  maxGuests,
  defaultGuests,
  isEdit,
}: BookingFormProps) {
  // 予約作成・変更用の action state
  const [controlState, controlDispatch, isControlPending] = useActionState(
    controlBooking,
    initialState
  );

  // 予約削除・キャンセル用の action state
  const [deleteState, deleteDispatch, isDeletePending] = useActionState(
    deleteBooking,
    initialState
  );

  const isPending = isControlPending || isDeletePending;

  // キャンセル実行時の確認ダイアログハンドラー
  const handleDeleteAction = (formData: FormData) => {
    if (window.confirm("本当にこの予約をキャンセルしますか？")) {
      deleteDispatch(formData);
    }
  };

  // アクションからの応答メッセージを表示用に取得（最後に呼び出された方のステートを判定）
  const activeState = deleteState.message ? deleteState : controlState;

  return (
    <form action={controlDispatch} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />

      <div>
        <label className="block text-sm md:text-base font-medium text-zinc-700 mb-1">
          {isEdit
            ? "変更後の参加人数(ご自身も含む)"
            : "参加人数(ご自身も含む)"}
        </label>
        <select
          key={defaultGuests}
          name="guestCount"
          defaultValue={defaultGuests || 1}
          disabled={isPending}
          className="w-full border border-zinc-300 rounded-lg p-3 md:p-3.5 bg-white text-sm md:text-base text-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition"
        >
          {[...Array(Math.min(5, Math.max(1, maxGuests)))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} 名
            </option>
          ))}
        </select>
        {controlState.errors?.guestCount && (
          <p className="text-sm text-red-600 mt-1">
            {controlState.errors.guestCount[0]}
          </p>
        )}
      </div>

      {/* 変更・確定ボタン */}
      <button
        type="submit"
        className="text-sm md:text-base w-full bg-orange-500 text-white p-3 md:p-3.5 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
        disabled={isPending}
      >
        {isControlPending
          ? "処理中..."
          : isEdit
          ? "予約内容を変更する"
          : "予約を確定する"}
      </button>

      {/* キャンセルボタン */}
      {isEdit && (
        <button
          type="submit"
          formAction={handleDeleteAction}
          className="w-full bg-white text-red-600 border border-red-200 p-3 md:p-3.5 text-sm md:text-base rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
          disabled={isPending}
        >
          {isDeletePending ? "キャンセル処理中..." : "この予約をキャンセルする"}
        </button>
      )}

      {/* アクション完了時のインラインメッセージ表示領域 */}
      {activeState.message && (
        <div
          className={`p-3.5 md:p-4 rounded-lg text-sm md:text-base font-medium transition mt-3 ${
            activeState.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {activeState.message}
        </div>
      )}
    </form>
  );
}




// "use client";

// import { useActionState } from "react";
// import { useSearchParams } from "next/navigation"; // 💡 追加
// import {
//   BookingActionState,
//   controlBooking,
//   deleteBooking,
// } from "../actions/booking";

// interface BookingFormProps {
//   eventId: string;
//   maxGuests: number;
//   defaultGuests?: number;
//   isEdit?: boolean;
// }

// const initialState: BookingActionState = {
//   success: false,
//   message: null,
// };

// export function BookingForm({
//   eventId,
//   maxGuests,
//   defaultGuests,
//   isEdit,
// }: BookingFormProps) {
//   const [controlState, controlDispatch, isControlPending] = useActionState(
//     controlBooking,
//     initialState
//   );
//   const [deleteState, deleteDispatch, isDeletePending] = useActionState(
//     deleteBooking,
//     initialState
//   );

//   const searchParams = useSearchParams();
//   const urlMessage = searchParams.get("message");
//   const urlStatus = searchParams.get("status");

//   const isPending = isControlPending || isDeletePending;

//   const handleDeleteSubmit = (formData: FormData) => {
//     if (!window.confirm("本当にこの予約をキャンセルしますか？")) {
//       return;
//     }
//     deleteDispatch(formData);
//   };

//   // URLパラメーターのメッセージ（成功時）を優先し、無ければ ActionState のエラーメッセージを表示
//   const displayMessage = urlMessage || deleteState.message || controlState.message;
//   const isSuccess = urlStatus === "success" || deleteState.success || controlState.success;

//   return (
//     <form action={controlDispatch} className="space-y-4">
//       <input type="hidden" name="eventId" value={eventId} />

//       <div>
//         <label className="block text-sm md:text-base font-medium text-zinc-700 mb-1">
//           {isEdit
//             ? "変更後の参加人数(ご自身も含む)"
//             : "参加人数(ご自身も含む)"}
//         </label>
//         <select
//           key={defaultGuests}
//           name="guestCount"
//           defaultValue={defaultGuests}
//           disabled={isPending}
//           className="w-full border border-zinc-300 rounded-lg p-3 md:p-3.5 bg-white text-sm md:text-base text-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition"
//         >
//           {[...Array(Math.min(5, maxGuests))].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {i + 1} 名
//             </option>
//           ))}
//         </select>
//         {controlState.errors?.guestCount && (
//           <p className="text-sm text-red-600 mt-1">
//             {controlState.errors.guestCount[0]}
//           </p>
//         )}
//       </div>

//       {/* 変更・確定ボタン */}
//       <button
//         type="submit"
//         className="text-sm md:text-base w-full bg-orange-500 text-white p-3 md:p-3.5 rounded-lg font-semibold hover:bg-orange-300 transition disabled:opacity-50"
//         disabled={isPending}
//       >
//         {isControlPending
//           ? "送信中..."
//           : isEdit
//           ? "予約内容を変更する"
//           : "予約を確定する"}
//       </button>

//       {/* キャンセルボタン */}
//       {isEdit && (
//         <button
//           type="submit"
//           formAction={handleDeleteSubmit}
//           className="w-full bg-white text-red-600 border border-red-200 p-3 md:p-3.5 text-sm md:text-base rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
//           disabled={isPending}
//         >
//           {isDeletePending
//             ? "キャンセル処理中..."
//             : "この予約をキャンセルする"}
//         </button>
//       )}

//       {/* メッセージ表示領域 */}
//       {displayMessage && (
//         <div
//           className={`p-3.5 md:p-4 rounded-lg text-sm md:text-base font-medium transition mt-3 ${
//             isSuccess
//               ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
//               : "bg-red-50 text-red-800 border border-red-200"
//           }`}
//         >
//           {displayMessage}
//         </div>
//       )}
//     </form>
//   );
// }