import {convertBigIntsToStrings} from "../Utilities/saveJson.js"
import catchAsync from "../Utilities/wrapperAsyncCatch.js"

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()


// logic of getting all client related projects, proposesl, latest payments, latest noticcations
export const getAll = catchAsync(async (req, res, next) => { // still under development and neeeds testing later
    const userId = BigInt(req.user.id);

    // Get all projects for this client (from users.project relation)
    const projects = await prisma.project.findMany({
        where: { client_id: userId }
    });

    // Get all proposals for this client's projects
    const projectIds = projects.map(p => p.id);
    const proposals = await prisma.proposals.findMany({
        where: {
            project_id: { in: projectIds }
        }
    });

    // Get latest 5 payments where this user is the payer
    const payments = await prisma.payments.findMany({
        where: { payer_id: userId },
        orderBy: { created_at: "desc" },
        take: 5
    });

    // Get latest 5 notifications for this client
    const notifications = await prisma.notifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 5
    });

    res.json({
        projects,
        proposals,
        payments,
        notifications
    });
});


// logic of getting all client related projects
export const getAllProjects = catchAsync(async (req, res, next) => {// still under development and neeeds testing later
    const userId = BigInt(req.user.id);

    // Get all projects for this client (from users.project relation)
    const projects = await prisma.project.findMany({
        where: { client_id: userId },
        include: {
            project_game_engines: {
                include: {
                    game_engine: true
                }
            },
            project_skills: {
                include: {
                    skill: true
                }
            },
            proposals: true,
            escrows: true
        }
    });

    res.json(projects);
});

export const createProject = catchAsync(async (req, res, next) => {
    const userId = BigInt(req.user.id);
    const {
        title,
        description,
        type, // should match ProjectTypeEnum
        expected_duration,
        project_game_engines, // array of engine IDs
        project_skills,       // array of skill IDs
        number_of_phases,     // should match PhaseNumberEnum
        is_moderated,
        experience_needed,    // should match ExperienceLevelEnum
        budget_type,          // should match BudgetTypeEnum
        min_budget,
        max_budget,
        attachment_url
    } = req.body;

    // Basic validation
    if (
        !title || !description || !type || !expected_duration ||
        !Array.isArray(project_game_engines) || !Array.isArray(project_skills) ||
        !number_of_phases || typeof is_moderated !== "boolean" ||
        !experience_needed || !budget_type || min_budget === undefined || max_budget === undefined
    ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Transaction to create project and related records
    let result = await prisma.$transaction(async (tx) => {
        // Create the project
        const project = await tx.project.create({
            data: {
                title,
                description,
                type,
                expected_duration: Number(expected_duration),
                status: "pending", // default status
                client_id: userId,
                number_of_phases,
                is_moderated,
                experience_needed,
                budget_type,
                min_budget: Number(min_budget),
                max_budget: Number(max_budget),
                attachment_url
            }
        });

        // Create project_game_engines entries
        for (const engineId of project_game_engines) {
            await tx.project_game_engines.create({
                data: {
                    project_id: project.id,
                    game_engine_id: Number(engineId)
                }
            });
        }

        // Create project_skills entries
        for (const skillId of project_skills) {
            await tx.project_skills.create({
                data: {
                    project_id: project.id,
                    skill_id: Number(skillId)
                }
            });
        }

        return project;
    });

    result = convertBigIntsToStrings(result);
    res.status(201).json({
        message: "Project created successfully and is pending approval.",
        project: result
    });
});


export const getPayments = catchAsync(async (req, res, next) => { // still under development and needs testing later
    const userId = BigInt(req.user.id);

    // 1. Get all payments where this user is the payer
    const payments = await prisma.payments.findMany({
        where: { payer_id: userId },
        orderBy: { created_at: "desc" }
    });

    // 2. Get all wallet transactions for this user (assuming one wallet per user)
    const wallet = await prisma.wallets.findFirst({ where: { user_id: userId } });
    let moneyTransactions = [];
    if (wallet) {
        moneyTransactions = await prisma.wallet_transactions.findMany({
            where: { wallet_id: wallet.id },
            orderBy: { created_at: "desc" }
        });
    }

    // 3. Get all active projects for this client
    const activeProjects = await prisma.project.findMany({
        where: {
            client_id: userId,
            status: "assigned"
        }
    });

    // 4. Get total worth of active projects (sum of accepted proposal amounts)
    let totalActiveWorth = 0;
    for (const project of activeProjects) {
        const acceptedProposal = await prisma.proposals.findFirst({
            where: {
                project_id: project.id,
                status: "accepted"
            }
        });
        if (acceptedProposal && acceptedProposal.amount) {
            totalActiveWorth += Number(acceptedProposal.amount);
        }
    }

    // 5. Get number of completed projects
    const completedProjectsCount = await prisma.project.count({
        where: {
            client_id: userId,
            status: "completed"
        }
    });

    // 6. Get payment methods (only id and provider)
    const paymentMethods = await prisma.user_payment_methods.findMany({
        where: { user_id: userId },
        select: {
            id: true,
            provider: true
        }
    });

    res.json({
        payments,
        moneyTransactions,
        activeProjectsCount: activeProjects.length,
        totalActiveWorth,
        completedProjectsCount,
        paymentMethods
    });
});



