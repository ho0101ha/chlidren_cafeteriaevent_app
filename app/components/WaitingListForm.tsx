// app/components/WaitingListForm.tsx
"use client";

import {useActionState, startTransition, useState} from "react";
import {useRouter} from "next/navigation";
import {joinWaitingList, leaveWaitingList} from "@/app/actions/waitingList";

interface WaitingListFormProps {
  eventId: string;
  userId: string;
  isWaiting: boolean;
}

export default function WaitingListForm({
  eventId,
  userId,
  isWaiting,
}: WaitingListFormProps) {
  const router = useRouter();
  const [leaveState, leaveDispatch, isLeavePending] = useActionState(
    leaveWaitingList,
    null
  );
  const [isJoinPending, setIsJoinPending] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // 💡【修正箇所】try-catch-finally を追加し、例外発生時や完了時に安全に処理を終了するように変更
  const handleJoin = () => {
    setIsJoinPending(true);
    setJoinError(null);
    startTransition(async () => {
      try {
        const res = await joinWaitingList(eventId, userId);
        if (!res?.success) {
          setJoinError(res?.error || "キャンセル待ちの登録に失敗しました。");
        } else {
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        setJoinError("通信エラーが発生しました。");
      } finally {
        setIsJoinPending(false);
      }
    });
  };

  const handleLeave = (formData: FormData) => {
    if (!window.confirm("キャンセル待ちを解除しますか？")) return;
    startTransition(() => {
      leaveDispatch(formData);
      router.refresh();
    });
  };

  return isWaiting ? (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
      <p className="text-purple-900 text-sm font-medium">
        現在、このイベントのキャンセル待ちに登録されています。空席が発生した際にお知らせ致しますのでログインして予約してください。
      </p>
      <form action={handleLeave}>
        <input type="hidden" name="cafeteriaEventId" value={eventId} />
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={isLeavePending}
          className="cursor-pointer w-full bg-white text-purple-700 border border-purple-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-100 transition text-sm disabled:opacity-50">
          {isLeavePending ? "解除処理中..." : "キャンセル待ち登録を解除する"}
        </button>
      </form>
      {leaveState?.error && (
        <p className="text-xs text-red-600">{leaveState.error}</p>
      )}
    </div>
  ) : (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleJoin}
        disabled={isJoinPending}
        className="w-full  text-black py-3 px-4 rounded-lg font-semibold  hover:bg-purple-700 transition disabled:opacity-50 text-sm md:text-base shadow-sm">
        {isJoinPending
          ? "登録処理中..."
          : "キャンセルが出た時のお知らせが来るように登録する"}
      </button>
      {joinError && <p className="text-xs text-red-600">{joinError}</p>}
    </div>
  );
}
