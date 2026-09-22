import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DeleteAnnounceForm from "./DeleteAnnounceForm";

interface DeleteAnnounceContainerProps {
  id: string;
}

export default async function DeleteAnnounceContainer({ id }: DeleteAnnounceContainerProps) {
  const session = await auth();

  // 未ログイン
  if (!session?.user) {
    redirect("/login");
  }

  // 権限チェック
  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "DONOR") {
    redirect(`/events/${id}`);
  }

  // イベント存在チェック
  const event = await prisma.cafeteriaEvent.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <div className="mb-4">
        <span className="bg-rose-100 text-rose-800 text-sm font-semibold px-2.5 py-0.5 rounded shadow-sm border border-rose-200">
          ⚠️ 運営者・寄付者専用 中止手続き
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-gray-800">イベントの開催中止・削除告知</h1>
      <p className="text-gray-500 mb-6">
        この手続きを行うとイベントは即座に「削除告知状態」となり、参加者全員の画面に変更通知がポップします。周知期間として**3日後**にデータベースから全データが自動的に完全削除されます。
      </p>

      {/* Client Componentのフォーム */}
      <DeleteAnnounceForm id={id} />
    </main>
  );
}