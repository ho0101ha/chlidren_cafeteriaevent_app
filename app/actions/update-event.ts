"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export interface EditFormState {
  success: boolean;
  error: string | null;
}

function purgeCacheTag(tag: string) {
  try {
    // @ts-ignore
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    (revalidateTag as (tag: string) => void)(tag);
  }
}

export async function updateEvent(
  eventId: string,
  prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const session = await auth();

  if (!session || !session?.user) {
    return { success: false, error: "ログインが必要です" };
  }

  const userRole = session.user.role;

  if (userRole !== "ADMIN" && userRole !== "DONOR") {
    return { success: false, error: "この操作を行う権限がありません" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const capacity = parseInt(formData.get("capacity") as string, 10);
  const dateInput = formData.get("date") as string;

  // 修正: !dateInput に変更（日付が未入力の場合のみエラーにする）
  if (!title || !description || isNaN(capacity) || !dateInput) {
    return { success: false, error: "入力内容に不備があります" };
  }

  try {
    await prisma.cafeteriaEvent.update({
      where: { id: eventId },
      data: {
        title,
        description,
        capacity,
        date: new Date(dateInput),
      },
    });

    await prisma.notification.create({
      data: {
        cafeteriaEventId: eventId,
        title: `【重要】イベント内容が変更されました（${title}）`,
        content: description,
      },
    });

    // 修正: revalidateTag の呼出を修正
    purgeCacheTag(`event-${eventId}`);
    purgeCacheTag(`notifications-${eventId}`);
    purgeCacheTag("events");
  } catch (error) {
    console.error("Update and notification creation error:", error);
    return { success: false, error: "イベント告知の修正に失敗しました" };
  }

  // Next.js の仕様上、try/catch の外側で redirect を呼び出す
  redirect(`/events/${eventId}`);
}