import {convertBigIntsToStrings} from "../Utilities/saveJson.js"
import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
   // should return :
    // 1.number of all current users and created at (for the number of users joined past week)
    // 2.number of pending and active projects
    // 3.all the current money in the website ( in ecrows table)
    // 4.number of all projects
    // 5.number of completed projects
    // number of freelancers
    // number of cleints
    // number of used gaming engines in all project for example : 100 project used utlity gaming engine should perview utilty : 100
    // latest 3 notifcations
    // all the pending projects for review
    // latest users joined
    // latest in and out from ecrows
export const getWebsiteData = catchAsync(async (req, res, next) => {
    // 1. Number of all current users and created at (and number joined past week)
    const totalUsers = await prisma.users.count();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const usersJoinedPastWeek = await prisma.users.count({
        where: { created_at: { gte: oneWeekAgo } }
    });

    // 2. Number of pending and active projects
    const pendingProjectsCount = await prisma.project.count({ where: { status: 'pending' } });
    const activeProjectsCount = await prisma.project.count({ where: { status: 'assigned' } });

    // 3. All the current money in the website (in escrows table)
    const escrows = await prisma.escrows.findMany({
        where: { status: { in: ['pending', 'funded'] } },
        select: { amount: true }
    });
    const totalEscrowMoney = escrows.reduce((sum, e) => sum + Number(e.amount), 0);

    // 4. Number of all projects
    const totalProjects = await prisma.project.count();

    // 5. Number of completed projects
    const completedProjectsCount = await prisma.project.count({ where: { status: 'completed' } });

    // 6. Number of freelancers
    const freelancerCount = await prisma.users.count({ where: { role: 'freelancer' } });

    // 7. Number of clients
    const clientCount = await prisma.users.count({ where: { role: 'client' } });

    // 8. Number of used gaming engines in all projects
    const engineUsage = await prisma.project_game_engines.groupBy({
        by: ['game_engine_id'],
        _count: { project_id: true }
    });
    const engineNames = await prisma.gaming_engines.findMany();
    const engineStats = engineUsage.map(eu => {
        const engine = engineNames.find(en => en.id === eu.game_engine_id);
        return {
            engine_id: eu.game_engine_id,
            engine_name: engine ? engine.engine_name : 'Unknown',
            used_in_projects: eu._count.project_id
        };
    });

    // 9. Latest 3 notifications
    let latestNotifications = await prisma.notifications.findMany({
        orderBy: { created_at: 'desc' },
        take: 3
    });

    // 10. All the pending projects for review
    let pendingProjects = await prisma.project.findMany({
        where: { status: 'pending' },
        orderBy: { created_at: 'desc' }
    });

    // 11. Latest users joined
    let latestUsers = await prisma.users.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    });

    // 12. Latest in and out from escrows
    const latestEscrowFunded = await prisma.escrows.findMany({
        where: { status: 'funded' },
        orderBy: { funded_at: 'desc' },
        take: 5
    });
    const latestEscrowReleased = await prisma.escrows.findMany({
        where: { status: 'released' },
        orderBy: { released_at: 'desc' },
        take: 5
    });
    latestNotifications = convertBigIntsToStrings(latestNotifications)
    latestUsers = convertBigIntsToStrings(latestUsers)
    pendingProjects = convertBigIntsToStrings(pendingProjects)
    res.status(200).json({
        totalUsers,
        usersJoinedPastWeek,
        pendingProjectsCount,
        activeProjectsCount,
        totalEscrowMoney,
        totalProjects,
        completedProjectsCount,
        freelancerCount,
        clientCount,
        engineStats,
        latestNotifications,
        pendingProjects,
        latestUsers,
        latestEscrowFunded,
        latestEscrowReleased
    });
});

// should return all the clients infos from 
export const getClients = catchAsync(async (req, res, next) => {
    let clients = await prisma.users.findMany({
        where: { role: 'client' },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            client_profile: true
        }
    });
    clients = convertBigIntsToStrings(clients);
    res.status(200).json({ status: 'success', data: clients });
});

export const getFreelancers = catchAsync(async (req, res, next) => {
    let freelancers = await prisma.users.findMany({
        where: { role: 'freelancer' },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            Freelancer_profile: true
        }
    });
    freelancers = convertBigIntsToStrings(freelancers);
    res.status(200).json({ status: 'success', data: freelancers });
});

export const getProject = catchAsync(async (req, res, next) => {
    let projects = await prisma.project.findMany({
        orderBy: { created_at: 'desc' },
        take: 100,
        include: {
            client: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            },
            Project_freelancer: {
                include: {
                    freelancer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            project_skills: { include: { skill: true } },
            project_game_engines: { include: { game_engine: true } }
        }
    });
    projects = convertBigIntsToStrings(projects);
    res.status(200).json({ status: 'success', data: projects });
});

// should handle pending projects approving or canceling
export const handleProject = catchAsync(async (req, res, next) => {
    const { action } = req.body;
    const projectId = req.params.id;
    if (!projectId || !['approve', 'cancel'].includes(action)) {
        return res.status(400).json({ status: 'fail', message: 'projectId and valid action (approve/cancel) are required.' });
    }
    const project = await prisma.project.findUnique({ where: { id: BigInt(projectId) } });
    if (!project) {
        return res.status(404).json({ status: 'fail', message: 'Project not found.' });
    }
    if (project.status !== 'pending') {
        return res.status(400).json({ status: 'fail', message: 'Only pending projects can be approved or canceled.' });
    }
    let newStatus = action === 'approve' ? 'waiting' : 'rejected';
    let updatedProject = await prisma.project.update({
        where: { id: BigInt(projectId) },
        data: { status: newStatus }
    });
    updatedProject = convertBigIntsToStrings(updatedProject);

    res.status(200).json({ status: 'success', data: updatedProject });
});

export const addSkill = catchAsync(async (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ status: 'fail', message: 'Skill name is required and must be at least 2 characters.' });
    }
    const skill = await prisma.skills.create({ data: { name } });
    res.status(201).json({ status: 'success', data: skill });
});

export const addEngine = catchAsync(async (req, res, next) => {
    const { engine_name } = req.body;
    if (!engine_name || typeof engine_name !== 'string' || engine_name.trim().length < 2) {
        return res.status(400).json({ status: 'fail', message: 'Engine name is required and must be at least 2 characters.' });
    }
    const engine = await prisma.gaming_engines.create({ data: { engine_name } });
    res.status(201).json({ status: 'success', data: engine });
});

export const deleteProject = catchAsync(async (req, res, next) => {
    // should delete a project by id
});

export const editProject = catchAsync(async (req, res, next) => {
    // should edit a project by id
});

export const getOneProject = catchAsync(async (req, res, next) => {
    // should get a project by id
});


