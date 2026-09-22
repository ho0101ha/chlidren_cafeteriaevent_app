"use server";

import { auth } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {revalidatePath, revalidateTag} from "next/cache";
import {redirect} from "next/navigation";
export type FormState = {
  success: boolean;
  error: string | null;
};

function purgeCacheTag(tag: string) {
  try {
    // @ts-ignore
    revalidateTag(tag, {expire: 0});
  } catch (error) {
    (revalidateTag as (tag: string) => void)(tag);
  }
}
export default async function createEvent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です。ログインしてください。" };
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "DONOR") {
    return { success: false, error: "イベントを作成する権限がありません。" };
  }
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const capacityInput = formData.get("capacity") as string;

  const dateInput = formData.get("date") as string;
  if (!title || !description || !capacityInput || !dateInput) {
    return {success: false, error: "全ての項目を記述してください"};
  }
  const capacity = parseInt(capacityInput,10);
  
  if (isNaN(capacity) || capacity <= 0) {
    return { success: false, error: "定員は1以上の正しい数値を入力してください。" };
  }
  try {
    await prisma.cafeteriaEvent.create({
      data: {
        title,
        description,
        date: new Date(dateInput),
        capacity: parseInt(capacityInput, 10),
        bookedCount: 0,
      },
    });
    purgeCacheTag("all-events");
    purgeCacheTag("events");
    revalidatePath("/");
  } catch (error) {
    // 修正: ログ出力のタイポ（console.error; -> console.error(error)）を修正
    console.error("Create event error:", error);
    return { success: false, error: "データベースへの保存に失敗しました。" };
  }

  // 修正: try/catch 外で redirect を実行（Next.js の内部例外を正しく発生させるため）
  redirect("/");
}