import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookingForm } from "./BookingForm";
import { cacheTag } from "next/cache";
import { generateGoogleCalenderUrl } from "@/lib/calendar";
import Link from "next/link";
import { ProfileWaitingList } from "./ProfileWaitingList";

async function getUserBookings(userId: string) {
  "use cache";
  cacheTag(`user-bookings-${userId}`);

  return await prisma.booking.findMany({
    where: { userId },
    include: {
      cafeteriaEvent: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
async function getUserWaitingList(userId:string) {
  "use cache";
  cacheTag(`user-waiting-list-${userId}`);
  return await prisma.waitingList.findMany({
    where:{userId},
    include:{
      cafeteriaEvent:true
    },
    orderBy:{
      createdAt:"desc"
    },
  });
}
export async function ProfileSection() {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/login");
  }

const [myBookings,myWaitingList] = await Promise.all([
  getUserBookings(session.user.id),
  getUserWaitingList(session.user.id),
]);
  // const myBookings = await getUserBookings(session.user.id);
  const now = new Date();

  // 今後の予約
  const upcomingBookings = myBookings.filter(
    (booking) => new Date(booking.cafeteriaEvent.date) >= now
  );

  // 過去の参加歴
  const pastBookings = myBookings
    .filter((booking) => new Date(booking.cafeteriaEvent.date) < now)
    .sort(
      (a, b) =>
        new Date(b.cafeteriaEvent.date).getTime() -
        new Date(a.cafeteriaEvent.date).getTime()
    );

  return (
    <main className="px-3 md:px-0 space-y-6 md:space-y-8">
      {/* ページヘッダーセクション */}
      <section className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-800">
          マイページ
        </h1>
        <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
          ご予約中の子ども食堂イベントの確認・変更・キャンセルや、過去の参加履歴の確認ができます。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <span className="w-2 h-6 md:h-7 bg-blue-500 rounded-full inline-block shrink-0"></span>
          現在の予約一覧（{upcomingBookings.length}件）
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="bg-white p-8 md:p-12 text-center rounded-xl border border-zinc-100 text-sm md:text-base text-zinc-500">
            現在予約している今後のイベントはありません。
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => {
              const event = booking.cafeteriaEvent;
              const isCanceled = event.isDeletedSoon;

              const remainingSeats = event.capacity - event.bookedCount;
              const maxGuestsAvailable = remainingSeats + booking.guestCount;

              // Googleカレンダー登録用URLの生成
              const calendarUrl = generateGoogleCalenderUrl({
                title: event.title,
                description: `${event.description}\n予約人数: ${booking.guestCount}名`,
                startDate: event.date,
              });

              return (
                <article
                  key={booking.id}
                  className={`bg-white rounded-xl border p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 transition ${
                    isCanceled
                      ? "border-red-200 bg-red-50/10"
                      : "border-zinc-200/80"
                  }`}
                >
                  {/* 左側：イベント情報 */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs md:text-sm font-mono text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded font-medium">
                        {new Date(event.date).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isCanceled && (
                        <span className="text-xs md:text-sm font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                          開催中止
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-bold text-lg md:text-xl leading-snug ${
                        isCanceled
                          ? "text-zinc-400 line-through"
                          : "text-zinc-800"
                      }`}
                    >
                      {event.title}
                    </h3>

                    <p className="text-zinc-500 text-sm md:text-base line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                    {!isCanceled && (
                      <div className="pt-2">
                        <Link
                          href={calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-2 rounded-lg transition active:scale-[0.98]"
                        >
                          📅 Googleカレンダーに追加
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 右側：変更・キャンセルエリア */}
                  <div className="w-full md:w-72 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-3 shrink-0">
                    {isCanceled ? (
                      <div className="text-center py-2 space-y-1">
                        <p className="text-sm md:text-base font-bold text-red-600">
                          手続き不可
                        </p>
                        <p className="text-sm text-zinc-500">
                          このイベントは中止されたため操作できません。
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm md:text-base font-bold text-zinc-700">
                          現在の予約人数: {booking.guestCount}名
                        </label>
                        <BookingForm
                          eventId={event.id}
                          maxGuests={maxGuestsAvailable}
                          defaultGuests={booking.guestCount}
                          isEdit={true}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <ProfileWaitingList userId={session.user.id} myWaitingList={myWaitingList}/>

      {/* 🔶 2. 過去の参加履歴セクション */}
      <section className="space-y-4 pt-6 border-t border-zinc-200">
        <h2 className="text-lg md:text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <span className="w-2 h-6 md:h-7 bg-zinc-400 rounded-full inline-block shrink-0"></span>
          過去の参加履歴（{pastBookings.length}件）
        </h2>

        {pastBookings.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-zinc-100 text-sm md:text-base text-zinc-500">
            過去の参加履歴はありません。
          </div>
        ) : (
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const event = booking.cafeteriaEvent;

              return (
                <article
                  key={booking.id}
                  className="bg-zinc-50/70 rounded-xl border border-zinc-200/60 p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs md:text-sm font-mono text-zinc-600 bg-zinc-200/60 px-2.5 py-0.5 rounded font-medium">
                        {new Date(event.date).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                        参加完了
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg text-zinc-800">
                      {event.title}
                    </h3>
                    <p className="text-zinc-500 text-sm md:text-base line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}