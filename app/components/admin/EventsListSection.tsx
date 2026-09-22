import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { DeleteEventButton } from "./DeleteEventButton";

/**
 * イベント一覧データの取得（キャッシュ対象）
 */
async function getAdminEvents() {
  "use cache";
  cacheTag("admin-events");

  return await prisma.cafeteriaEvent.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: {
        select: { bookings: true },
      },
      bookings: {
        select: { guestCount: true },
      },
    },
  });
}

// 追加: イベントのステータス判定（開催前/終了/キャンセル済）を行う関数
function getEventStatus(event: { date: Date; isCanceled?: boolean }) {
  if (event.isCanceled) {
    return {
      label: "キャンセル済",
      className: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }
  const isPast = new Date(event.date) < new Date();
  if (isPast) {
    return {
      label: "終了",
      className: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
  }
  return {
    label: "開催前",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
}

export async function EventsListSection() {
  // 1. 管理者認証チェック
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    redirect("/");
  }

  // 2. イベントデータの取得
  const events = await getAdminEvents();

  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500">
        登録されているイベントはありません。
      </div>
    );
  }

  return (
    <>
      {/* スマホ標準レイアウト: カードリスト（md 未満で表示） */}
      <div className="block md:hidden divide-y divide-zinc-200">
        {events.map((event) => {
          const eventTotalGuests = event.bookings.reduce(
            (sum, b) => sum + b.guestCount,
            0
          );
          const status = getEventStatus(event); // // 追加: 各イベントのステータスを取得

          return (
            <div key={event.id} className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2"> {/* // 変更: 日時とバッジを横並びにするため flex を付与 */}
                  <div className="text-sm font-mono text-zinc-500">
                    {new Date(event.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="font-bold text-zinc-900 text-base mt-0.5">
                  {event.title}
                </h3>
              </div>

              <div className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex justify-between items-center">
                <span>予約状況</span>
                <span>
                  <strong className="text-blue-700 font-bold text-base">
                    {eventTotalGuests}
                  </strong>{" "}
                  / {event.capacity} 名
                  <span className="text-xs text-zinc-400 ml-1">
                    ({event._count.bookings}組)
                  </span>
                </span>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 justify-end items-center">
                <Link
                  href={`/admin/events/${event.id}/attendees`}
                  className="px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
                >
                  名簿
                </Link>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="px-3.5 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition"
                >
                  編集
                </Link>
                <Link
                  href={`/events/${event.id}/delete-announce`}
                  className="px-3.5 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition"
                >
                  中止告知
                </Link>
                <DeleteEventButton eventId={event.id} />
              </div>
            </div>
          );
        })}
      </div>

      {/* デスクトップ拡張レイアウト: テーブル（md 以上で表示） */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-base">
          <thead>
            {/* // 変更: <tr> タグ内のコメント位置を修正（<th> 内または <tr> の外に移動） */}
            <tr className="border-b border-zinc-200 bg-zinc-100/70 text-zinc-600 font-semibold text-sm">
              <th className="py-3.5 px-4 w-28">ステータス</th>
              <th className="py-3.5 px-4">開催日時</th>
              <th className="py-3.5 px-4">イベント名</th>
              <th className="py-3.5 px-4 text-center">定員 / 予約人数</th>
              <th className="py-3.5 px-4 text-right">管理アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-800">
            {events.map((event) => {
              const eventTotalGuests = event.bookings.reduce(
                (sum, b) => sum + b.guestCount,
                0
              );
              const status = getEventStatus(event);

              return (
                <tr key={event.id} className="hover:bg-zinc-50/80 transition">
                  {/* // 変更: <tr> 直下のコメントを排除し <td> に集約 */}
                  <td className="py-4 px-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded border whitespace-nowrap ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-zinc-600">
                    {new Date(event.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-4 font-semibold text-zinc-900 text-base">
                    {event.title}
                  </td>
                  <td className="py-4 px-4 text-center text-sm">
                    <span className="font-bold text-blue-700 text-base">
                      {eventTotalGuests}
                    </span>{" "}
                    / {event.capacity} 名
                    <span className="text-xs text-zinc-400 ml-1">
                      ({event._count.bookings}組)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/events/${event.id}/attendees`}
                      className="inline-block px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition"
                    >
                      名簿
                    </Link>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="inline-block px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/events/${event.id}/delete-announce`}
                      className="inline-block px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition"
                    >
                      中止告知
                    </Link>
                    <DeleteEventButton eventId={event.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}