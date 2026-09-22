
import { prisma } from "@/lib/prisma";
import { cacheTag } from "next/cache";
import { LeaveWaitingListForm } from "./LeaveWaitingListForm";
type WaitingItemWithEvent = {
  id: string;
  userId: string;
  cafeteriaEventId: string;
  createdAt: Date;
  cafeteriaEvent: {
    id: string;
    title: string;
    description: string;
    date: Date;
  };
};

type Props = {
  userId: string;
  // 修正: 親コンポーネントからデータを受け取る型に変更
  myWaitingList: WaitingItemWithEvent[];
};
// async function getUserWaitingList(userId: string) {
//   "use cache";
//   cacheTag(`user-waiting-list-${userId}`);

//   return await prisma.waitingList.findMany({
//     where: { userId },
//     include: {
//       cafeteriaEvent: true,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// }

// type Props = {
//   userId: string;
// };

export async function ProfileWaitingList({ userId, myWaitingList }: Props) {
  // const myWaitingList = await getUserWaitingList(userId);
  const now = new Date();

  // 未来のイベントのみ抽出
  const upcomingWaitingList = myWaitingList.filter(
    (item) => new Date(item.cafeteriaEvent.date) >= now
  );

  if (upcomingWaitingList.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pt-4">
      <h2 className="text-lg md:text-2xl font-bold text-zinc-800 flex items-center gap-2">
        <span className="w-2 h-6 md:h-7 bg-amber-500 rounded-full inline-block shrink-0"></span>
        キャンセル待ち中のイベント（{upcomingWaitingList.length}件）
      </h2>

      <div className="space-y-3">
        {upcomingWaitingList.map((item) => {
          const event = item.cafeteriaEvent;

          return (
            <article
              key={item.id}
              className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs md:text-sm font-mono text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded font-medium">
                    {new Date(event.date).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                    ⏳ キャンセル待ち受付中
                  </span>
                </div>
                <h3 className="font-bold text-lg text-zinc-800">
                  {event.title}
                </h3>
                <p className="text-zinc-600 text-sm line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="shrink-0 pt-2 md:pt-0">
                <LeaveWaitingListForm eventId={event.id} userId={userId} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}