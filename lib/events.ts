import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./prisma";

export async function getCacheAllEvents() {
    "use cache";
    cacheLife("days");
    cacheTag("all-events");
    console.log("[DB Query Executed] Fetching all events for Top Page");
    return await prisma.cafeteriaEvent.findMany({
        orderBy:{
            date:"asc"
        },
    });
    
}