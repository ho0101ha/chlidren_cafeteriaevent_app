import DeleteAnnounceContainer from "@/app/components/DeleteAnnounceContainer";
import { Suspense } from "react";

interface DeleteAnnouncePageProps {
  params: Promise<{ id: string }>;
}

export default function DeleteAnnouncePage({ params }: DeleteAnnouncePageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">読み込み中...</div>}>
      {/* Promise のまま Suspense 内のコンポーネントへ渡す */}
      <DeleteAnnounceContainer params={params} />
    </Suspense>
  );
}