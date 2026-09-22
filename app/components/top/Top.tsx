import {auth} from "@/lib/auth";
import {getCacheAllEvents} from "@/lib/events";
import {prisma} from "@/lib/prisma";
import {cacheTag} from "next/cache";
import Link from "next/link";
import {EventFilterForm} from "../EventFilterForm";

async function getUserBookingEventIds(userId: string) {
  "use cache";
  cacheTag(`user-bookings-${userId}`);

  const userBooking = await prisma.booking.findMany({
    where: {userId},
    select: {cafeteriaEventId: true},
  });
  return new Set(userBooking.map((b) => b.cafeteriaEventId));
}

async function getUserWaitingEventIds(userId: string) {
  "use cache";
  cacheTag(`user-waiting-list-${userId}`);

  const userWaiting = await prisma.waitingList.findMany({
    where: {userId},
    select: {cafeteriaEventId: true},
  });
  return new Set(userWaiting.map((w) => w.cafeteriaEventId));
}
// ユーザーのロール情報を取得する関数
async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {role: true},
  });
  return user?.role;
}

export default async function Top({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const {search, status, sort} = resolvedSearchParams;
  const allEvents = await getCacheAllEvents();
  const session = await auth();
  const userId = session?.user?.id;

  // ADMIN 権限チェックと予約済みID一覧の取得
  const [isAdmin, myBookingEventIds, myWaitingEventIds] = await Promise.all([
    userId ? (await getUserRole(userId)) === "ADMIN" : false,
    userId ? await getUserBookingEventIds(userId) : new Set<string>(),
    userId ? await getUserWaitingEventIds(userId) : new Set<string>(),
  ]);

  const now = new Date();
  const filteredEvents = allEvents.filter((event) => {
    if (search && !event.title.toLowerCase().includes(search)) {
      return false;
    }
    const remainingSeats = event.capacity - event.bookedCount;
    const isEnded = new Date(event.date) < now;
    const isFulled = remainingSeats <= 0;

    if (status === "upcoming" && isEnded) return false;
    if (status === "available" && (isEnded || isFulled)) return false;
    if (status === "full" && (isEnded || !isFulled)) return false;
    if (status === "ended" && !isEnded) return false;
    return true;
  });
  const events = [...filteredEvents].sort((a, b) => {
    if (sort === "date_desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sort === "isAlreadyBooked") {
      return b.bookedCount - a.bookedCount;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  return (
    <div className="px-3 md:px-0 space-y-4 md:space-y-6">
      {/* ヘッダータイトル領域 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 pb-2 border-b border-zinc-100">
        <h2 className="text-lg md:text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <span className="w-2 h-6 md:h-7 bg-emerald-500 rounded-full inline-block shrink-0"></span>
          イベント一覧
          {/* （{events.length}件） */}
        </h2>
      </div>
      <EventFilterForm />
      {events.length === 0 ? (
        /* 該当なし時の空表示 */
        <div className="bg-white p-8 md:p-12 text-center rounded-xl border border-zinc-100 text-sm md:text-base text-zinc-500">
          現在、予定されている子ども食堂イベントはありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {events.map((event) => {
            const remainingSeats = event.capacity - event.bookedCount;
            const isFull = remainingSeats <= 0;
            const isAlreadyBooked = myBookingEventIds.has(event.id);
            const isWaiting = myWaitingEventIds.has(event.id);
            const isCanceled = event.isDeletedSoon;

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-zinc-300 transition duration-200">
                {/* 🏷️ カード上部：イベント情報 */}
                <div className="p-4 md:p-5 space-y-3">
                  {/* ADMIN用名簿リンク */}
                  {isAdmin && (
                    <div className="mb-2">
                      <Link
                        href={`/admin/events/${event.id}/attendees`}
                        className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 transition active:bg-blue-100">
                        📋 管理者用名簿を見る →
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* 日時バッジ */}
                    <span className="text-xs font-mono text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md font-medium">
                      {new Date(event.date).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </span>

                    {/* 残席・状態バッジ */}
                    {isCanceled ? (
                      <span className="text-sm font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                        開催中止
                      </span>
                    ) : isAlreadyBooked ? (
                      <span className="text-sm font-bold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                        予約済み
                      </span>
                    ) : isWaiting ? (
                      <span className="text-sm font-bold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                      キャンセル待ち中
                    </span>
                    ) : isFull ? (
                      <span className="text-sm font-bold bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full border border-zinc-200">
                        満席
                      </span>
                    ) : (
                      <span className="text-sm font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        残り {remainingSeats} 席
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg md:text-xl text-zinc-800 line-clamp-1 leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-zinc-500 text-sm md:text-base line-clamp-2 min-h-[2.75rem] leading-relaxed">
                    {isCanceled
                      ? "⚠️ このイベントは中止が決定いたしました。詳細は個別のご案内をご確認ください。"
                      : event.description}
                  </p>
                </div>

                {/* 🔘 カード下部：ボタン */}
                <div className="p-4 md:p-5 pt-0">
                  <Link
                    href={`/events/${event.id}`}
                    className={`w-full block text-center py-3 px-4 rounded-lg text-sm md:text-base font-semibold transition duration-150 active:scale-[0.99] ${
                      isCanceled
                        ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 border border-zinc-200"
                        : isAlreadyBooked
                        ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                        : isFull
                        ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                    }`}>
               {isCanceled
                      ? "詳細を確認する"
                      : isAlreadyBooked
                      ? "予約を確認・変更する"
                      : isWaiting
                      ? "キャンセル待ち状況の確認"
                      : isFull
                      ? "詳細を見る（満席:キャンセルが出た時のお知らせを受け取る）"
                      : "詳細・参加予約へ →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
