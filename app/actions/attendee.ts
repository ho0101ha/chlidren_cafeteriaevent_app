// app/actions/attendee.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdmin } from "@/app/actions/admin";

export type CheckInState = {
  success: boolean;
  error: string | null; // 変更点: message から error に変更
  bookingId?: string;
};

function purgeCacheTag(tag: string) {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    (revalidateTag as (tag: string) => void)(tag);
  }
}

/**
 * 出席/欠席チェックイン切り替え Server Action (useActionState 用)
 */
export async function toggleCheckIn(
  prevState: CheckInState,
  formData: FormData
): Promise<CheckInState> {
  const authResult = await verifyAdmin();
  if (!authResult.success) {
    // 変更点: error プロパティにエラーメッセージをセット
    return { success: false, error: authResult.error ?? "管理者権限がありません。" };
  }

  const bookingId = formData.get("bookingId") as string;
  const eventId = formData.get("eventId") as string;
  const attendedStr = formData.get("attended") as string;

  if (!bookingId || !eventId) {
    // 変更点: error プロパティにエラーメッセージをセット
    return { success: false, error: "パラメータが不正です。" };
  }

  const targetAttended = attendedStr === "true";

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { attended: targetAttended },
    });

    purgeCacheTag(`event-${eventId}`);
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/events/${eventId}/attendees`);

    // 変更点: 成功時は error: null を返す
    return {
      success: true,
      error: null,
      bookingId,
    };
  } catch (err: any) {
    console.error("Toggle check-in error:", err);
    // 変更点: エラー発生時に error プロパティにメッセージをセット
    return {
      success: false,
      error: err.message || "チェックイン状態の更新に失敗しました。",
      bookingId,
    };
  }
}