import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * 定期的に実行させて期限切れデータを完全クリーンアップするAPIジョブ
 */
export async function GET(request: Request) {
  // セキュリティチェック（Cronサービスからの安全な呼び出しを検証）
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  
  // 💡 イベント終了から完全にデータを消去するまでの猶予日数（例: 5日以上経過したもの）
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  try {
    // 条件に合致する不要データをデータベースから一括で物理削除
    const deleteResult = await prisma.cafeteriaEvent.deleteMany({
      where: {
        OR: [
          // ケース①: 主催者が削除告知をして、その期限（3日後）を過ぎたもの
          {
            isDeletedSoon: true,
            deletedAt: { lte: now }
          },
          // ケース②: 通常開催され、イベント終了日時から5日以上が経過したもの
          {
            date: { lte: fiveDaysAgo }
          }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: `データベースのクリーンアップが完了しました。計 ${deleteResult.count} 件のイベント（および付随する予約・通知）を完全消去しました。`
    });
  } catch (error) {
    console.error("Automated cleanup error:", error);
    return NextResponse.json({ success: false, error: "自動クリーンアップ処理中にエラーが発生しました" }, { status: 500 });
  }
}