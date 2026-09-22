// app/api/cron/reminder/route.ts

import { sendRemaindEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();

    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        cafeteriaEvent: {
          date: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
        },
      },
      include: {
        user: true,
        cafeteriaEvent: true,
      },
    });

    let sentCount = 0;
    for (const booking of upcomingBookings) {
      if (booking.user.email) {
        await sendRemaindEmail({
          to: booking.user.email,
          eventTitle: booking.cafeteriaEvent.title,
          eventDate: booking.cafeteriaEvent.date,
          guestCount: booking.guestCount,
        });
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sentEmails: sentCount });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}