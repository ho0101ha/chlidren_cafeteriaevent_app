"use client";

import { compareSync } from "bcrypt";
import { useTransition } from "react";

type BookingData = {
    id: string;
    attended: boolean;
    guestCount: number;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  };

  type Props = {
    eventTitle:string;
    bookings:BookingData[];
  }
export default function ExportCsvButton({eventTitle,bookings}:Props) {
    const [isPending, startTransition] = useTransition();
 const handleExportCsv = () =>{
    startTransition(() =>{
      const headers = ["No.", "受付ステータス", "名前", "メールアドレス", "参加人数", "予約日時"];
    const rows = bookings.map((b,index) =>{
        const status =  b.attended ? "受付中" :"未受付";
        const name = b.user.name || "(名称未設定)";
        const email = b.user.email; 
        const count = b.guestCount;
        const date = new Date(b.createdAt).toLocaleString("ja-JP");
        return [
            index + 1,
            `"${status}"`,
            `"${name.replace(/"/g, '""')}"`, // ダブルクォーテーションのエスケープ
            `"${email.replace(/"/g, '""')}"`,
            count,
            `"${date}"`,
          ].join(",");
    });
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

      // 4. Blobの作成とダウンロード処理
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      // ファイル名（危険な文字を除去）
      const sanitizedTitle = eventTitle.replace(/[\/\\?%*:|"<>]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `参加者名簿_${sanitizedTitle}_${dateStr}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
 };
  return (
    <button onClick={handleExportCsv}
    disabled={isPending || bookings.length === 0}

    ><svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
  {isPending ? "出力中..." : "CSVダウンロード"}</button>
  )
}

