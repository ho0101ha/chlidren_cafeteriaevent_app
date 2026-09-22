"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export type AdminActionState = {
  success: boolean;
  error: string | null;
};

function purgeCacheTag(tag: string) {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    (revalidateTag as (tag: string) => void)(tag);
  }
}
/**
 * 管理者権限の検証処理
 */
export async function verifyAdmin(): Promise<AdminActionState & { user?: any }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です。ログインしてください。" };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return { success: false, error: "管理者権限が必要です。" };
  }

  return { success: true, error: null, user: session.user };
}

/**
 * イベント即時削除処理 Action (useActionState 用)
 */
export async function deleteEventImmediately(
  eventId: string,
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const authResult = await verifyAdmin();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const targetId = eventId || (formData.get("eventId") as string);

    if (!targetId) {
      return { success: false, error: "イベントIDが不正です。" };
    }
    
    await prisma.$transaction(async(tx) =>{
      await tx.booking.deleteMany({where:{cafeteriaEventId:targetId}});
      await tx.waitingList.deleteMany({where:{cafeteriaEventId:targetId}});
      await tx.notification.deleteMany({where:{cafeteriaEventId:targetId}});
      await tx.cafeteriaEvent.delete({ where: { id: targetId } });
    })
    // await prisma.cafeteriaEvent.delete({
    //   where: { id: targetId },
    // });

    // キャッシュの破棄と再検証
    purgeCacheTag("admin-stats");
    purgeCacheTag("admin-events");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "削除処理中にエラーが発生しました。",
    };
  }
}