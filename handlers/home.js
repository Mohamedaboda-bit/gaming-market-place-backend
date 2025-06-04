import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import { PrismaClient } from "@prisma/client"
import {convertBigIntsToStrings} from "../Utilities/saveJson.js"

const prisma = new PrismaClient()

//should return top freelancers, lastest projects, gaming engines in case of guest or admin
//should return lastest projects, gaming engines in case of freelancer
//should return top freelancers, gaming engines in case of cleinty
// you will check vie the role of the user from req.body 
export const TOP3 = catchAsync( async (req, res) => {  // edit to send proposels of each prject
    const userRole = req.body?.role || 'guest';
    let response = {};

    if (userRole === 'freelancer') {
        // Only query latest projects and gaming engines
        const [latestProjects, gamingEngines] = await Promise.all([
            prisma.project.findMany({
                take: 3,
                orderBy: { created_at: 'desc' },
                include: {
                    project_skills: { include: { skill: true } },
                    project_game_engines: { include: { game_engine: true } }
                }
            }),
            prisma.gaming_engines.findMany()
        ]);
        response = { latestProjects, gamingEngines };
    } else if (userRole === 'client') {
        // Only query top freelancers and gaming engines
        const [topFreelancers, gamingEngines] = await Promise.all([
            prisma.freelancer_stats.findMany({
                take: 3,
                orderBy: [
                    { average_rating: 'desc' },
                    { completed_projects_count: 'desc' }
                ],
                include: {
                    freelancer: {
                        include: {
                            user: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.gaming_engines.findMany()
        ]);
        response = { topFreelancers, gamingEngines };
    } else {
        // guest or admin: query all three
        const [topFreelancers, latestProjects, gamingEngines] = await Promise.all([
            prisma.freelancer_stats.findMany({
                take: 3,
                orderBy: [
                    { average_rating: 'desc' },
                    { completed_projects_count: 'desc' }
                ],
                include: {
                    freelancer: {
                        include: {
                            user: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.project.findMany({
                take: 3,
                orderBy: { created_at: 'desc' },
                include: {
                    project_skills: { include: { skill: true } },
                    project_game_engines: { include: { game_engine: true } }
                }
            }),
            prisma.gaming_engines.findMany()
        ]);
        response = { topFreelancers, latestProjects, gamingEngines };
    }
    response = convertBigIntsToStrings(response)
    res.status(200).json({ status: 'success', data: response });
});
  
  
export const getSkills = catchAsync(async (req, res) => {
    const skills = await prisma.skills.findMany()
    res.status(200).json({ status: 'success', data: skills })
})

