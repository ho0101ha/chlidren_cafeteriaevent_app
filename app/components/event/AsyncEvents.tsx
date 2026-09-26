import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BookingForm } from "../BookingForm";
import { getCacheEvents } from "@/lib/get-event";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import EventNotifications from "../EventNotifications";
import Link from "next/link";
import WaitingListForm from "../WaitingListForm";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function AsyncEvents({ params }: EventPageProps) {
  const { id } = await params;
  
  // 1. イベントデータの取得
  const event = await getCacheEvents(id);
  if (!event) {
    notFound();
  }

  // 2. セッション情報の安全な取得（エラーが起きても画面を落とさない）
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth session retrieval failed:", error);
    // session は null のまま続行（未ログイン扱いにする）
  }

  const isCanceled = event.isDeletedSoon;
  const isOrganizer =
    session?.user?.role === "ADMIN" || session?.user?.role === "DONOR";

  let existingBooking = null;
  let existingWaiting = null;

  if (session?.user?.id) {
    try {
      existingBooking = await prisma.booking.findFirst({
        where: {
          userId: session.user.id,
          cafeteriaEventId: event.id,
        },
      });
      existingWaiting = await prisma.waitingList.findUnique({
        where: {
          userId_cafeteriaEventId: {
            userId: session.user.id,
            cafeteriaEventId: event.id,
          },
        },
      });
    } catch (error) {
      console.error("Database query failed:", error);
    }
  }

  const remainingSeats = event.capacity - event.bookedCount;
  const fillPercentage = (event.bookedCount / event.capacity) * 100;
  const maxGusetAvailable = existingBooking
    ? remainingSeats + existingBooking.guestCount
    : remainingSeats;

  return (
    <>
      <EventNotifications eventId={event.id} />
      {isOrganizer && (
        <div className="mt-2.5 flex gap-1.5">
          <Link
            href={`/events/${event.id}/edit`}
            className="block px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 text-center transition shadow-sm whitespace-nowrap"
          >
            イベント内容を訂正する
          </Link>
          <Link
            href={`/events/${event.id}/delete-announce`}
            className="block px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 text-center transition shadow-sm whitespace-nowrap"
          >
            イベントを中止する
          </Link>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
        <h3 className="text-lg font-medium text-zinc-500 mb-2">
          現在の予約状況
        </h3>
        <div className="flex justify-between text-sm font-semibold mb-1 text-zinc-800">
          <span>予約済み: {event.bookedCount} 名</span>
          <span>定員: {event.capacity} 名</span>
        </div>
        <div className="w-full bg-zinc-100 h-4 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, fillPercentage))}%` }}
          />
        </div>
        <p className="text-right mt-1 text-zinc-500">
          残りあと{" "}
          <span className="font-bold text-emerald-600">{remainingSeats}</span>{" "}
          席
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-800 mb-4">
          {existingBooking
            ? "ご予約内容の確認・変更"
            : existingWaiting
            ? "キャンセル待ち状況の確認"
            : remainingSeats <= 0
            ? "キャンセル待ちの登録"
            : "このイベントを予約する"}
        </h2>

        {isCanceled ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center space-y-3">
            <p className="font-bold">
              このイベントは開催中止（削除予定）となりました
            </p>
            <p className="text-red-600 text-sm">
              すでに削除告知期間に入っているため、新規の参加予約・予約内容の変更・キャンセル等の手続きは受け付けておりません。
            </p>
            <button
              disabled
              className="mt-2 px-6 py-2.5 bg-zinc-200 text-zinc-400 border border-zinc-300 rounded-lg font-semibold cursor-not-allowed shadow-inner"
            >
              予約手続き不可
            </button>
          </div>
        ) : !session ? (
          <div className="bg-zinc-50 text-zinc-600 p-6 rounded-lg text-center border border-dashed border-zinc-300">
            <p className="text-sm">
              予約の手続きを行うにはログインが必要です。
            </p>
          </div>
        ) : existingBooking ? (
          <div>
            <div className="mb-4 text-sm text-zinc-700">
              <p>
                このイベントは <span className="font-bold text-emerald-600">{existingBooking.guestCount}名</span> で予約されています。
              </p>
            </div>
            <Suspense fallback={<div className="text-sm text-gray-500">フォーム読み込み中...</div>}>
              <BookingForm
                eventId={event.id}
                key={`booking-form-${event.id}`}
                maxGuests={maxGusetAvailable}
                defaultGuests={existingBooking.guestCount}
                isEdit={true}
              />
            </Suspense>
          </div>
        ) : remainingSeats <= 0 ? (
          <div className="space-y-4">
            {!existingWaiting && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-medium text-sm">
                満席のため、今回の受付は終了いたしました。
              </div>
            )}
            <WaitingListForm
              eventId={event.id}
              userId={session.user.id}
              isWaiting={!!existingWaiting}
            />
          </div>
        ) : (
          <Suspense fallback={<div className="text-sm text-gray-500">フォーム読み込み中...</div>}>
            <BookingForm eventId={event.id} maxGuests={remainingSeats} />
          </Suspense>
        )}
      </div>
    </>
  );
}