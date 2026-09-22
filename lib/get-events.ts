import { prisma } from "./prisma";

export async function getActiveEevent() {
    const now = new Date();
   const threeDaysAgo = new Date();
   threeDaysAgo.setDate(threeDaysAgo.getDate() -3);

   return await prisma.cafeteriaEvent.findMany({
    where:{
        AND:[
            {
                OR:[
                    {deletedAt:null},
                    {deletedAt:{gt:now}}
                ]
            },
            {date:{gte:threeDaysAgo}}
        ]
    },
    orderBy:{
        date:"asc"
    }
   });
    
}