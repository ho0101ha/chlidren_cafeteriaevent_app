import { prisma } from "@/lib/prisma";

interface EventNotificationsProps {
  eventId: string;
}

export default async function EventNotifications({ eventId }: EventNotificationsProps) {
  // 💡 データベースからこのイベントに関する最新のお知らせを取得
  const latestNotification = await prisma.notification.findFirst({
    where: { cafeteriaEventId: eventId },
    orderBy: { createdAt: "desc" },
  });

  // 周知事項（お知らせ）が1件もなければ何も表示しない
  if (!latestNotification) return null;

  return (
    <div className="bg-rose-50 border-2 border-rose-200 p-4 md:p-5 rounded-xl shadow-sm mb-4 md:mb-6 animate-pulse-once">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
        
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2">
        
            <h3 className="font-bold text-base md:text-lg text-rose-900 leading-snug">
              {latestNotification.title}
            </h3>     
           <span className="text-xs font-medium text-rose-600 bg-white px-2.5 py-0.5 rounded-full border border-rose-100 w-fit shrink-0">
              {new Date(latestNotification.createdAt).toLocaleDateString("ja-JP")} 周知
            </span>
          </div>
          <p className="text-rose-800 text-sm md:text-base bg-white/70 p-3 rounded-lg border border-rose-100 whitespace-pre-wrap leading-relaxed">
            {latestNotification.content}
          </p>
          <p className="text-rose-600 text-sm md:text-base font-medium">
            ※既に予約済みの方、またはこれから参加予定の方は必ず上記の内容をご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}