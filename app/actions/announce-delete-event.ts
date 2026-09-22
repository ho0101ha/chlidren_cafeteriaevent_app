"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export interface DeleteFormState {
    success: boolean;
    error: string | null;
  }
  function purgeCacheTag(tag: string) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      (revalidateTag as (tag: string) => void)(tag);
    }
  }
  export default async function announceDeleteEvent(
    eventId:string,
    prevState:DeleteFormState,
    formData:FormData
  ):Promise<DeleteFormState>{

    const session = await auth();

    if(!session?.user){
        return {success:false,error:"ログインが必要です"};
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "DONOR"){
        return {success:false, error:"この操作を行う権限がありません"};
    }

    const reason = formData.get("reason") as string;
    if((!reason || reason.trim() === "")){
        return {success:false,error:"参加者へ周知するための「中止・削除の理由」を入力してください。"}
    }
    try {
        const threeDaysLater = new Date();
        threeDaysLater.setDate(threeDaysLater.getDate() +3);

        await prisma.$transaction(async(tx)=>{
           await tx.cafeteriaEvent.update({
            where:{id:eventId},
            data:{
                isDeletedSoon:true,
                deletedAt:threeDaysLater,
            },
           });

           await tx.notification.create({
            data:{
                cafeteriaEventId:eventId,
                title:"【重要】このイベントは開催中止となりました",
                content:`【主催者からのご連絡】\n${reason}\n\n※このイベントページおよび予約データは、周知期間として3日後にシステムから自動的に完全削除されます。`
            },
        });
        });
        
       
        purgeCacheTag(`event-${eventId}`);
        purgeCacheTag("events");
    } catch (error) {
        console.error("Announce delete error:", error);
    return { success: false, error: "削除告知の登録に失敗しました。" };
    }
    redirect(`/events/${eventId}`);

  }