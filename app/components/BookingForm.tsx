// "use client";

// import { useActionState, startTransition, useEffect, useState, ReactNode } from "react";
// import { createPortal } from "react-dom";
// import { useRouter } from "next/navigation";
// import { BookingActionState, controlBooking, deleteBooking } from "../actions/booking";

// // --- 1. ポータル用のコンポーネント ---
// interface ToastPortalProps {
//   children: ReactNode;
// }

// const ToastPortal = ({ children }: ToastPortalProps) => {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // クライアント側でマウントされるまでは何もレンダリングしない（SSRエラー防止）
//   if (!mounted) return null;

//   // ターゲット要素（指定がなければ document.body）
//   const target = document.querySelector(".container.end") || document.body;
//   return createPortal(children, target);
// };

// // --- 2. トースト本体のコンポーネント ---
// interface ToastProps {
//   visible: boolean;
//   message: string;
//   isSuccess: boolean;
//   onClose: () => void;
// }

// const Toast = ({ visible, message, isSuccess, onClose }: ToastProps) => {
//   if (!visible) return null;

//   return (
//     <div
//       className={`fixed bottom-10 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm md:text-base font-medium border transition-all transform duration-300 ${
//         isSuccess
//           ? "bg-zinc-900 text-emerald-400 border-zinc-700"
//           : "bg-zinc-900 text-red-400 border-zinc-700"
//       }`}
//     >
//       <span className="text-lg">{isSuccess ? "✓" : "⚠️"}</span>
//       <span className="text-white">{message}</span>
//       <button
//         type="button"
//         onClick={onClose}
//         className="ml-2 text-zinc-400 hover:text-white font-bold text-xs p-1"
//         aria-label="閉じる"
//       >
//         ✕
//       </button>
//     </div>
//   );
// };

// // --- 3. メインのフォームコンポーネント ---
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

// export function BookingForm({ eventId, maxGuests, defaultGuests, isEdit }: BookingFormProps) {
//   const [controlState] = useActionState(controlBooking, initialState);
//   const [deleteState] = useActionState(deleteBooking, initialState);

//   // トースト状態
//   const [toast, setToast] = useState<{ message: string; isSuccess: boolean } | null>(null);

//   const router = useRouter();
//   const isPending = false; // 必要に応じてローディング状態をバインド

//   // トースト自動消去タイマーのハンドラー
//   const showToast = (message: string, isSuccess: boolean) => {
//     setToast({ message, isSuccess });
//     setTimeout(() => setToast(null), 4000);
//   };

//   // 1. 登録・変更用
//   const handleControlAction = (formData: FormData) => {
//     startTransition(async () => {
//       const res = await controlBooking(controlState, formData);

//       if (res.message) {
//         showToast(res.message, res.success);
//       }

//       if (res.success) {
//         router.refresh();
//       }
//     });
//   };

//   // 2. 削除用
//   const handleDeleteAction = (formData: FormData) => {
//     if (!window.confirm("本当にこの予約をキャンセルしますか？")) {
//       return;
//     }
//     startTransition(async () => {
//       const res = await deleteBooking(deleteState, formData);

//       if (res.message) {
//         showToast(res.message, res.success);
//       }

//       if (res.success) {
//         router.refresh();
//       }
//     });
//   };

//   return (
//     <>
//       {/* 参照例に基づいた ToastPortal & Toast のレンダリング */}
//       {toast && (
//         <ToastPortal>
//           <Toast
//             visible={!!toast}
//             message={toast.message}
//             isSuccess={toast.isSuccess}
//             onClose={() => setToast(null)}
//           />
//         </ToastPortal>
//       )}

//       <form action={handleControlAction} className="space-y-4">
//         <input type="hidden" name="eventId" value={eventId} />

//         <div>
//           <label className="block text-sm md:text-base font-medium text-zinc-700 mb-1">
//             {isEdit ? "変更後の参加人数(ご自身も含む)" : "参加人数(ご自身も含む)"}
//           </label>
//           <select
//             key={defaultGuests}
//             name="guestCount"
//             defaultValue={defaultGuests}
//             disabled={isPending}
//             className="w-full border border-zinc-300 rounded-lg p-3 md:p-3.5 bg-white text-sm md:text-base text-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition"
//           >
//             {[...Array(Math.min(5, maxGuests))].map((_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {i + 1} 名
//               </option>
//             ))}
//           </select>
//           {controlState.errors?.guestCount && (
//             <p className="text-sm text-red-600 mt-1">{controlState.errors.guestCount[0]}</p>
//           )}
//         </div>

//         {/* 変更・確定ボタン */}
//         <button
//           type="submit"
//           className="text-sm md:text-base w-full bg-orange-500 text-white p-3 md:p-3.5 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
//           disabled={isPending}
//         >
//           {isEdit ? "予約内容を変更する" : "予約を確定する"}
//         </button>

//         {/* キャンセルボタン */}
//         {isEdit && (
//           <button
//             type="submit"
//             formAction={handleDeleteAction}
//             className="w-full bg-white text-red-600 border border-red-200 p-3 md:p-3.5 text-sm md:text-base rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
//             disabled={isPending}
//           >
//             この予約をキャンセルする
//           </button>
//         )}
//       </form>
//     </>
//   );
// }
"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation"; // 💡 追加
import {
  BookingActionState,
  controlBooking,
  deleteBooking,
} from "../actions/booking";

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
  const [controlState, controlDispatch, isControlPending] = useActionState(
    controlBooking,
    initialState
  );
  const [deleteState, deleteDispatch, isDeletePending] = useActionState(
    deleteBooking,
    initialState
  );

  const searchParams = useSearchParams();
  const urlMessage = searchParams.get("message");
  const urlStatus = searchParams.get("status");

  const isPending = isControlPending || isDeletePending;

  const handleDeleteSubmit = (formData: FormData) => {
    if (!window.confirm("本当にこの予約をキャンセルしますか？")) {
      return;
    }
    deleteDispatch(formData);
  };

  // URLパラメーターのメッセージ（成功時）を優先し、無ければ ActionState のエラーメッセージを表示
  const displayMessage = urlMessage || deleteState.message || controlState.message;
  const isSuccess = urlStatus === "success" || deleteState.success || controlState.success;

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
          defaultValue={defaultGuests}
          disabled={isPending}
          className="w-full border border-zinc-300 rounded-lg p-3 md:p-3.5 bg-white text-sm md:text-base text-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 transition"
        >
          {[...Array(Math.min(5, maxGuests))].map((_, i) => (
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
        className="text-sm md:text-base w-full bg-orange-500 text-white p-3 md:p-3.5 rounded-lg font-semibold hover:bg-orange-300 transition disabled:opacity-50"
        disabled={isPending}
      >
        {isControlPending
          ? "送信中..."
          : isEdit
          ? "予約内容を変更する"
          : "予約を確定する"}
      </button>

      {/* キャンセルボタン */}
      {isEdit && (
        <button
          type="submit"
          formAction={handleDeleteSubmit}
          className="w-full bg-white text-red-600 border border-red-200 p-3 md:p-3.5 text-sm md:text-base rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
          disabled={isPending}
        >
          {isDeletePending
            ? "キャンセル処理中..."
            : "この予約をキャンセルする"}
        </button>
      )}

      {/* メッセージ表示領域 */}
      {displayMessage && (
        <div
          className={`p-3.5 md:p-4 rounded-lg text-sm md:text-base font-medium transition mt-3 ${
            isSuccess
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {displayMessage}
        </div>
      )}
    </form>
  );
}