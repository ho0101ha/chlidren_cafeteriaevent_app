import { resend } from "./resend";

const FROM_EMAIL = "子ども食堂予約 <onboarding@resend.dev>";

export async function sendBookingConfirmationEmail({
  to,
  eventTitle,
  eventDate,
  guestCount,
}: {
  to: string;
  eventTitle: string;
  eventDate: Date;
  guestCount: number;
}) {
  const dateStr = new Date(eventDate).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  await resend.emails.send({
    from:FROM_EMAIL,
    to,
    subject:`[予約完了]${eventTitle}`,
    html:`
      <h2>ご予約ありがとうございます</h2>
      <p>以下の内容で子ども食堂イベントの予約が確定しました。</p>
      <ul>
        <li><strong>イベント名:</strong> ${eventTitle}</li>
        <li><strong>日時:</strong> ${dateStr}</li>
        <li><strong>予約人数:</strong> ${guestCount}名</li>
      </ul>
      <p>キャンセルや人数の変更はマイページより行えます。</p>
    `,
  });
}

export async function sendCancellationEmail({
    to,
    eventTitle,
  }: {
    to: string;
    eventTitle: string;
  }) {
    await resend.emails.send({
        from:FROM_EMAIL,
        to,
        subject:`[予約キャンセル完了]${eventTitle}`,
        html:`
      <h2>予約キャンセルを受け付けました</h2>
      <p>「${eventTitle}」の予約キャンセルが正常に完了いたしました。</p>
      <p>またのご参加をお待ちしております。</p>
    `,
    });
  }


  export async function sendRemaindEmail({
    to,
    eventTitle,
    eventDate,
    guestCount,
  }: {
    to: string;
    eventTitle: string;
    eventDate: Date;
    guestCount: number;
  }) {
    const dateStr = new Date(eventDate).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    await resend.emails.send({
      from:FROM_EMAIL,
      to,
      subject:`[リマインド]${eventTitle}`,
      html:`
      <h2>明日のイベントのご案内</h2>
      <p>明日開催の子ども食堂イベントのリマインドメールです。</p>
      <ul>
        <li><strong>イベント名:</strong> ${eventTitle}</li>
        <li><strong>日時:</strong> ${dateStr}</li>
        <li><strong>予約人数:</strong> ${guestCount}名</li>
      </ul>
      <p>お気をつけてお越しください！</p>
    `,
    });
  }
  

  
  