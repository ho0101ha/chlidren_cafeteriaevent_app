"use server";

import {prisma} from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {revalidatePath, revalidateTag} from "next/cache";

export async function joinWaitingList(
  cafeteriaEventId: string,
  userId: string
) {
  try {
    const existingBooking = await prisma.booking.findUnique({
      where: {userId_cafeteriaEventId: {userId, cafeteriaEventId}},
    });
    if (existingBooking) {
      return {success: false, error: "すでに予約済みのイベントです。"};
    }

    await prisma.waitingList.create({
      data: {
        cafeteriaEventId,
        userId,
      },
    });
    revalidatePath(`/events/${cafeteriaEventId}`);
    revalidatePath("/");
    // 💡【修正箇所】第2引数に "default" を追加して型エラーを回避
    revalidateTag(`user-waiting-list-${userId}`, "default");
    return { success: true };
  } catch (error) {
    console.error("Failed to join waiting list:", error);
    return {success: false, error: "キャンセル待ち登録に失敗しました。"};
  }
}

export async function leaveWaitingList(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const cafeteriaEventId = formData.get("cafeteriaEventId") as string;
  const userId = formData.get("userId") as string;
  if (!cafeteriaEventId || !userId) {
    return { success: false, error: "パラメーターが不足しています。" };
  }
  try {
    await prisma.waitingList.delete({
      where: {userId_cafeteriaEventId: {userId, cafeteriaEventId}},
    });
 // 💡【修正箇所】第2引数に "default" を追加
 revalidateTag(`user-waiting-list-${userId}`, "default");
 revalidatePath(`/events/${cafeteriaEventId}`);
 revalidatePath("/profile");
    return {success:true};
  } catch (error) {
    console.error("Failed to leave waiting list:", error);
    return { success: false, error: "キャンセル待ちの解除に失敗しました。" };
  }
}

export async function notifyNextInWaitingList(cafeteriaEventId: string,
  txClient?: Prisma.TransactionClient | typeof prisma
) {
  const db = txClient || prisma;
    const nextInLine = await db.waitingList.findFirst({
        where:{cafeteriaEventId},
        orderBy:{createdAt:"asc"},
        include:{user:true,cafeteriaEvent:true},
    });
    if(!nextInLine)return;

    await db.notification.create({
        data:{
            cafeteriaEventId,
            title:"【空席発生】キャンセル待ちのイベントに空きが出ました",
            content:`「${nextInLine.cafeteriaEvent.title}」に空席が出ました。お早めに予約を行ってください。`,
        },
    });
    revalidateTag(`user-notifications-${nextInLine.userId}`, "default"); 
}

