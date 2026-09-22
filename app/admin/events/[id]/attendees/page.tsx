import AsyncEventAtendees from "@/app/components/AsyncEventAtendees";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EventAttendeesPage({ params }: PageProps) {
  return (
    <main className="max-w-5xl mx-auto p-3 sm:p-6 print:max-w-none print:w-full print:p-0 print:m-0 print:overflow-visible">
      <Suspense
        fallback={
          <div className="p-12 text-center text-sm text-zinc-500 print:hidden">
            名簿データを読み込み中...
          </div>
        }
      >
        <AsyncEventAtendees params={params} />
      </Suspense>
    </main>
  );
}