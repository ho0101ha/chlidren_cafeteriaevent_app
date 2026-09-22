import { prisma } from "@/lib/prisma";
import { cacheTag } from "next/cache";

/**
 * 統計データの取得（キャッシュ対象）
 */
async function getDashboardStats() {
  "use cache";
  cacheTag("admin-stats");

  const totalEvents = await prisma.cafeteriaEvent.count();
  const aggregateBookings = await prisma.booking.aggregate({
    _sum: { guestCount: true },
  });
  const totalUsers = await prisma.user.count();

  return {
    totalEvents,
    totalGuests: aggregateBookings._sum.guestCount ?? 0,
    totalUsers,
  };
}

export async function DashboardStatsSection() {
  const stats = await getDashboardStats();

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex justify-between md:block items-center">
        <p className="text-sm font-medium text-zinc-500">総イベント数</p>
        <p className="text-xl font-bold text-zinc-800 md:mt-1">
          {stats.totalEvents} 件
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex justify-between md:block items-center">
        <p className="text-sm font-medium text-zinc-500">累計予約参加人数</p>
        <p className="text-xl font-bold text-blue-700 md:mt-1">
          {stats.totalGuests} 名
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex justify-between md:block items-center">
        <p className="text-sm font-medium text-zinc-500">登録ユーザー数</p>
        <p className="text-xl font-bold text-zinc-800 md:mt-1">
          {stats.totalUsers} 名
        </p>
      </div>
    </section>
  );
}