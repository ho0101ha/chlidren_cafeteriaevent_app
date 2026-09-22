import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditEventForm from "./EditEventForm";

interface EditEventContainerProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventContainer({ params }: EditEventContainerProps) {
  // <Suspense> 内で params を待機・取得
  const { id } = await params;

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "DONOR") {
    redirect(`/events/${id}`);
  }

  const event = await prisma.cafeteriaEvent.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">イベント内容を修正、周知</h1>
      <p className="text-sm text-gray-500 mb-6">
        内容を変更すると即座に反映されます。変更内容は自動的にお知らせ通知として参加者へ周知されます。
      </p>

      <EditEventForm id={id} event={event} />
    </main>
  );
}