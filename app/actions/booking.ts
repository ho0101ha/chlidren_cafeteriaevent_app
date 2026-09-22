// app/actions/booking.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sendBookingConfirmationEmail, sendCancellationEmail } from "@/lib/mail";

export type BookingActionState = {
  success: boolean;
  message: string | null;
  errors?: {
    guestCount?: string[];
  };
};

function purgeCacheTag(tag: string) {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    (revalidateTag as (tag: string) => void)(tag);
  }
}

export async function controlBooking(
  prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, message: "予約を確定するにはログインが必要です。" };
  }

  const userId = session.user.id;
  const eventId = formData.get("eventId") as string;
  const newGuestCount = parseInt(formData.get("guestCount") as string, 10);

  if (!eventId || isNaN(newGuestCount) || newGuestCount <= 0) {
    return {
      success: false,
      message: "入力内容に不備があります。",
      errors: { guestCount: ["正しい人数を選択してください。"] },
    };
  }

  let isSuccess = false;

  try {
    let targetEvent: { title: string; date: Date } | null = null;
    await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findFirst({
        where: { userId: userId, cafeteriaEventId: eventId },
      });

      const event = await tx.cafeteriaEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("指定されたイベントが存在しません。");
      }
      targetEvent = { title: event.title, date: event.date };

      const seatDifference = existingBooking
        ? newGuestCount - existingBooking.guestCount
        : newGuestCount;

      if (event.bookedCount + seatDifference > event.capacity) {
        throw new Error("申し訳ありません。定員に達しました。");
      }

      if (existingBooking) {
        await tx.booking.update({
          where: { id: existingBooking.id },
          data: { guestCount: newGuestCount },
        });
      } else {
        await tx.booking.create({
          data: {
            userId,
            cafeteriaEventId: eventId,
            guestCount: newGuestCount,
          },
        });
      }

      await tx.cafeteriaEvent.update({
        where: { id: eventId },
        data: { bookedCount: { increment: seatDifference } },
      });

      await tx.waitingList.deleteMany({
        where: { userId, cafeteriaEventId: eventId },
      });
    });

    if (session.user.email && targetEvent) {
      sendBookingConfirmationEmail({
        to: session.user.email,
        eventTitle: (targetEvent as { title: string; date: Date }).title,
        eventDate: (targetEvent as { title: string; date: Date }).date,
        guestCount: newGuestCount,
      }).catch((err) => console.error("Email send error:", err));
    }

    purgeCacheTag(`user-bookings-${userId}`);
    purgeCacheTag(`user-waiting-list-${userId}`);
    purgeCacheTag(`event-${eventId}`);
    purgeCacheTag("events");

    revalidatePath("/profile");
    revalidatePath("/");
    
    isSuccess = true;
  } catch (error: any) {
    console.error("Booking transaction error:", error);
    return {
      success: false,
      message: error.message || "予期せぬエラーで予約に失敗しました。",
    };
  }

  // 💡 ポイント: redirect は必ず try-catch の外側で呼ぶ
  if (isSuccess) {
    redirect(`?status=success&message=${encodeURIComponent("参加予約が正常に確定しました！")}`);
  }

  return { success: false, message: "処理を完了できませんでした。" };
}

export async function deleteBooking(
  prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "ログインが必要です。" };
  }

  const userId = session.user.id;
  const eventId = formData.get("eventId") as string;

  if (!eventId) {
    return { success: false, message: "イベントIDが正しくありません。" };
  }

  let isSuccess = false;

  try {
    let canceledEventTitle: string | null = null;
    await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findFirst({
        where: { userId: userId, cafeteriaEventId: eventId },
        include: { cafeteriaEvent: true },
      });

      if (!existingBooking) {
        throw new Error("キャンセルする予約が見つかりませんでした。");
      }
      canceledEventTitle = existingBooking.cafeteriaEvent.title;

      await tx.booking.delete({
        where: { id: existingBooking.id },
      });

      await tx.cafeteriaEvent.update({
        where: { id: eventId },
        data: { bookedCount: { decrement: existingBooking.guestCount } },
      });
    });

    if (session.user.email && canceledEventTitle) {
      sendCancellationEmail({
        to: session.user.email,
        eventTitle: canceledEventTitle,
      }).catch((err) => console.error("Email send error:", err));
    }

    purgeCacheTag(`user-bookings-${userId}`);
    purgeCacheTag(`event-${eventId}`);
    purgeCacheTag("events");

    revalidatePath("/profile");
    revalidatePath("/");

    isSuccess = true;
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return {
      success: false,
      message: error.message || "予期せぬエラーでキャンセルの処理に失敗しました。",
    };
  }

  // 💡 ポイント: try-catch の外側で呼ぶ
  if (isSuccess) {
    redirect(`?status=success&message=${encodeURIComponent("予約をキャンセルしました。")}`);
  }

  return { success: false, message: "処理を完了できませんでした。" };
}