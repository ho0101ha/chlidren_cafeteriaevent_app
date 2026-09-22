
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getCacheEvents(eventId:string){
 "use cache";

 cacheLife("weeks");
 cacheTag(`event-${eventId}`);

 console.log(`[DB Query Executed] Event ID: ${eventId}`);
return await prisma.cafeteriaEvent.findUnique({
    where:{id:eventId},
    include:{
      bookings:true,
    },
});

}