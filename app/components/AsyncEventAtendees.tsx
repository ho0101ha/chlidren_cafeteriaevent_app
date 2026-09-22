import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "./PrintButton";
import { CheckInForm } from "./CheckInForm";
import ExportCsvButton from "./ExportCsvButton";

async function getEventWithAttendees(eventId: string) {
  if (!eventId) return null;

  return await prisma.cafeteriaEvent.findUnique({
    where: { id: eventId },
    include: {
      bookings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

type ComponentProps = {
  params: Promise<{ id: string }>;
};

export default async function AsyncEventAtendees({ params }: ComponentProps) {
  const { id: eventId } = await params;

  // 1. 認証チェック
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. 管理者権限（ADMIN）の確認
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    redirect("/");
  }

  // 3. イベントと予約情報の取得
  const event = await getEventWithAttendees(eventId);
  if (!event) {
    notFound();
  }

  // 4. 集計処理
  const totalGuests = event.bookings.reduce(
    (sum, booking) => sum + booking.guestCount,
    0
  );
  const attendedBookingsCount = event.bookings.filter((b) => b.attended).length;
  const attendedGuestsCount = event.bookings
    .filter((b) => b.attended)
    .reduce((sum, b) => sum + b.guestCount, 0);

  const attendanceRate =
    event.bookings.length > 0
      ? Math.round((attendedBookingsCount / event.bookings.length) * 100)
      : 0;

  const formattedEventDate = new Date(event.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4 md:space-y-6 px-0 print:px-0 print:space-y-2 print:w-full print:text-black">
      {/* ナビゲーション（印刷時は非表示） */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <Link
            href="/"
            className="inline-block mb-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            ← イベント一覧へ戻る
          </Link>
        </div>
        <div className="self-start md:self-auto flex items-center gap-2"> {/* 変更: CSVボタンを併設できるように flex gap-2 を設定 */}
          <ExportCsvButton eventTitle={event.title} bookings={event.bookings} /> {/* 追加: CSVダウンロードボタン */}
          <PrintButton />
        </div>
      </section>

      {/* イベント概要 */}
      <section className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 print:border-none print:shadow-none print:p-0 print:m-0">
        <div className="border-b border-zinc-200 pb-3 md:pb-4 print:border-b-2 print:border-black print:pb-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded inline-block mb-2 print:bg-transparent print:p-0 print:text-black print:font-sans">
                開催日時: {formattedEventDate}
              </span>
              <h1 className="text-lg md:text-xl font-bold text-zinc-800 print:text-2xl print:text-black">
                {event.title} 参加者名簿
              </h1>
            </div>
            <span className="hidden print:inline-block text-xs font-mono">
              印刷日時: {new Date().toLocaleDateString("ja-JP")}
            </span>
          </div>
          {event.description && (
            <p className="text-sm text-zinc-600 mt-1 print:hidden">
              {event.description}
            </p>
          )}
        </div>

        {/* 集計サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-1 print:flex print:gap-6 print:pt-2 print:border-b print:border-zinc-300 print:pb-2">
          <div className="bg-zinc-50 p-2.5 sm:p-4 rounded-lg border border-zinc-100 print:border-none print:p-0 print:bg-transparent">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 print:text-zinc-700">
              定員
            </p>
            <p className="text-sm sm:text-lg font-bold text-zinc-800 print:text-black">
              {event.capacity} 名
            </p>
          </div>
          <div className="bg-zinc-50 p-2.5 sm:p-4 rounded-lg border border-zinc-100 print:border-none print:p-0 print:bg-transparent">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 print:text-zinc-700">
              予約組数
            </p>
            <p className="text-sm sm:text-lg font-bold text-zinc-800 print:text-black">
              {event.bookings.length} 組
            </p>
          </div>
          <div className="bg-blue-50 p-2.5 sm:p-4 rounded-lg border border-blue-100 print:border-none print:p-0 print:bg-transparent">
            <p className="text-xs sm:text-sm font-medium text-blue-600 print:text-zinc-700">
              合計人数
            </p>
            <p className="text-sm sm:text-lg font-bold text-blue-800 print:text-black">
              {totalGuests} 名
            </p>
          </div>
          <div className="bg-emerald-50 p-2.5 sm:p-4 rounded-lg border border-emerald-100 print:border-none print:p-0 print:bg-transparent">
            <p className="text-xs sm:text-sm font-medium text-emerald-700 print:text-zinc-700">
              受付済
            </p>
            <p className="text-sm sm:text-lg font-bold text-emerald-800 print:text-black">
              {attendedGuestsCount} 名{" "}
              <span className="text-xs font-normal print:text-zinc-600">
                ({attendanceRate}%)
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 参加者名簿一覧 */}
      <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:bg-transparent print:overflow-visible">
        <div className="p-3.5 md:p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center print:hidden">
          <h3 className="text-sm md:text-base font-bold text-zinc-800">
            参加者名簿一覧（全{event.bookings.length}件）
          </h3>
        </div>

        {event.bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            現在このイベントの予約はありません。
          </div>
        ) : (
          <div className="w-full overflow-x-auto print:overflow-visible">
            <table className="min-w-full text-left border-collapse print:border print:border-black text-xs sm:text-sm print:text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100/70 font-bold text-zinc-600 print:bg-zinc-100 print:text-black print:border-b-2 print:border-black">
                  <th className="py-2 px-1.5 sm:px-3 w-10 sm:w-12 text-center print:border-r print:border-black">
                    受付
                  </th>
                  <th className="py-2 px-1.5 sm:px-3 w-8 sm:w-10 text-center print:border-r print:border-black">
                    No.
                  </th>
                  <th className="py-2 px-2 sm:px-3 print:border-r print:border-black min-w-[90px]">
                    お名前
                  </th>
                  <th className="py-2 px-2 sm:px-3 print:border-r print:border-black min-w-[120px]">
                    メールアドレス
                  </th>
                  <th className="py-2 px-1.5 sm:px-3 text-center w-12 sm:w-16 print:border-r print:border-black">
                    人数
                  </th>
                  <th className="py-2 px-2 sm:px-3 w-20 sm:w-28 print:text-center">
                    予約日時
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 print:divide-black">
                {event.bookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className={`transition print:break-inside-avoid ${
                      booking.attended
                        ? "bg-emerald-50/40 print:bg-transparent"
                        : "hover:bg-zinc-50/80"
                    }`}
                  >
                    <td className="py-2 px-1.5 sm:px-3 text-center print:border-r print:border-black">
                      <span className="print:hidden">
                        <CheckInForm
                          bookingId={booking.id}
                          eventId={eventId}
                          initialAttended={booking.attended}
                          labelNumber={0}
                          userName=""
                        />
                      </span>
                      <span className="hidden print:inline-block font-bold">
                        {booking.attended ? "✓" : "□"}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 text-center font-mono text-zinc-500 print:text-black print:border-r print:border-black">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 sm:px-3 font-semibold break-words max-w-[120px] sm:max-w-none print:text-black print:border-r print:border-black">
                      {booking.user.name || booking.user.email || "（名称未設定）"}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-zinc-600 font-mono break-all max-w-[140px] sm:max-w-none print:text-black print:border-r print:border-black">
                      {booking.user.email}
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 text-center font-bold text-blue-700 print:text-black print:border-r print:border-black">
                      {booking.guestCount} 名
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-zinc-500 font-mono text-[10px] sm:text-xs print:text-black print:text-center whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("ja-JP", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}