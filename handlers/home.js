import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const TOP3 = catchAsync(async (req, res, next)=>{
    //should return top freelancers, lastest projects, gaming engines in case of guest or admin
    //should return lastest projects, gaming engines in case of freelancer
    //should return top freelancers, gaming engines in case of cleint
    const topFreelancers = await prisma.Freelancer_profile.findMany({
        orderBy: { experience_years: "desc" },
        take: 3,
        include: { user: true }
    })
    const latestProjects = await prisma.project.findMany({
        orderBy: { created_at: "desc" },
        take: 3
    })
    const engines = await prisma.gaming_engines.findMany({ take: 3 })
    res.json({ topFreelancers, latestProjects, engines })
})
