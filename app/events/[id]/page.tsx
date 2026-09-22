import AsyncEventAttendees from "@/app/components/AsyncEventAtendees";
import EditEventContainer from "@/app/components/EditEventContainer";
import AsyncEvents from "@/app/components/event/AsyncEvents";
import { Suspense } from "react";


interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">読み込み中...</div>}>
      {/* Promiseのまま非同期コンポーネントへ渡す */}
      <AsyncEvents params={params} />
    </Suspense>
  );
}