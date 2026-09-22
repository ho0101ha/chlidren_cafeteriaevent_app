import DeleteAnnounceContainer from "@/app/components/DeleteAnnounceContainer";
import { Suspense, use } from "react";


interface DeleteAnnouncePageProps {
  params: Promise<{ id: string }>;
}

// 修正: async を使用しない同期関数コンポーネント
export default function DeleteAnnouncePage({ params }: DeleteAnnouncePageProps) {
  // React の `use` フックを使って Promise である params から id を取得
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">読み込み中...</div>}>
      <DeleteAnnounceContainer id={id} />
    </Suspense>
  );
}