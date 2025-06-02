import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import { PrismaClient } from "@prisma/client"
import { convertBigIntsToStrings } from "../Utilities/saveJson.js"

const prisma = new PrismaClient()

export const getAll = catchAsync(async (req, res, next) => {// needs more testing later
    const userId = BigInt(req.user.id);

    // 1. Get the freelancer profile for this user
    let freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // 2. Get all projects assigned to this freelancer (via Project_freelancer)
    let relatedProjects = await prisma.Project_freelancer.findMany({
        where: { freelancer_id: freelancerProfile.id },
        include: {
            project: true
        }
    });

    // 3. Get all proposals by this freelancer
    let proposals = await prisma.proposals.findMany({
        where: { freelancer_id: freelancerProfile.id },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    status: true
                }
            }
        }
    });

    // 4. Get all available projects (status: waiting)
    let availableProjects = await prisma.project.findMany({
        where: { status: "waiting" }
    });

    // 5. Get latest 5 payments to this freelancer's wallet
    // First, get wallet for this user
    const wallet = await prisma.wallets.findFirst({
        where: { user_id: userId }
    });

    let latestPayments = [];

    if (wallet) {
        latestPayments = await prisma.wallet_transactions.findMany({
            where: { wallet_id: wallet.id },
            orderBy: { created_at: "desc" },
            take: 5
        });
    }

    freelancerProfile = convertBigIntsToStrings(freelancerProfile)
    relatedProjects = convertBigIntsToStrings(relatedProjects)
    proposals = convertBigIntsToStrings(proposals)
    availableProjects = convertBigIntsToStrings(availableProjects)
    latestPayments = convertBigIntsToStrings(latestPayments)

    res.json({
        freelancerProfile,
        relatedProjects,
        proposals,
        availableProjects,
        latestPayments
    });
});

// should return developer avtice project and completed ones and the gaming enginges, rate, completed at cleint name and money in each completed project
// in active projects should return number of complted phases if there is any and the client name 
export const getProjects = catchAsync(async (req, res, next) => { // still needs testing
    const userId = BigInt(req.user.id);

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Active projects (in_progress)
    const activeProjects = await prisma.Project_freelancer.findMany({
        where: {
            freelancer_id: freelancerProfile.id,
            status: "in_progress"
        },
        include: {
            project: {
                include: {
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    },
                    project_game_engines: {
                        include: {
                            game_engine: true
                        }
                    },
                    project_skills: {
                        include: { skill: true }
                    }
                }
            },
            proposal: {
                include: {
                    proposal_timelines: true
                }
            }
        }
    });

    // For each active project, count completed phases (status: 'accepted')
    const activeProjectsFormatted = activeProjects.map(pf => {
        const completedPhases = pf.proposal?.proposal_timelines.filter(
            t => t.status === "accepted"
        ).length || 0;

        return {
            projectId: pf.project.id,
            title: pf.project.title,
            client: pf.project.client,
            status: pf.status,
            assigned_at: pf.assigned_at,
            completedPhases,
            project_game_engines: pf.project.project_game_engines.map(e => e.game_engine),
            project_skills: pf.project.project_skills.map(s => s.skill)
        };
    });

    // Completed projects
    const completedProjects = await prisma.Project_freelancer.findMany({
        where: {
            freelancer_id: freelancerProfile.id,
            status: "completed"
        },
        include: {
            project: {
                include: {
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    },
                    project_game_engines: {
                        include: {
                            game_engine: true
                        }
                    }
                }
            },
            proposal: true
        }
    });

    const completedProjectsFormatted = completedProjects.map(pf => ({
        projectId: pf.project.id,
        title: pf.project.title,
        client: pf.project.client,
        completed_at: pf.completed_at,
        rating: pf.rating_by_client,
        review: pf.review_by_client,
        money_earned: pf.proposal ? pf.proposal.bid_amount : null,
        project_game_engines: pf.project.project_game_engines.map(e => e.game_engine)
    }));

    res.json({
        activeProjects: activeProjectsFormatted,
        completedProjects: completedProjectsFormatted
    });
});

// should return developer proposals 
export const getProposals = catchAsync(async (req, res, next) => {//still needs testing
    const userId = BigInt(req.user.id);

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Get all proposals by this freelancer, include project info and proposal timelines
    const proposals = await prisma.proposals.findMany({
        where: { freelancer_id: freelancerProfile.id },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            },
            proposal_timelines: true
        }
    });

    res.json(proposals);
});


// should return developer spacific proposal
export const getOneProposal = catchAsync(async (req, res, next) => {//still needs testing
    const userId = BigInt(req.user.id);
    const proposalId = BigInt(req.params.id);

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Get the proposal by id, only if it belongs to this freelancer
    const proposal = await prisma.proposals.findFirst({
        where: {
            id: proposalId,
            freelancer_id: freelancerProfile.id
        },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            },
            proposal_timelines: true
        }
    });

    if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
    }

    res.json(proposal);
});

// should return developer active project
export const ActiveProjects = catchAsync(async (req, res, next) => { //still needs testing
    const userId = BigInt(req.user.id);

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Get all active projects (status: in_progress) for this freelancer
    const activeProjects = await prisma.Project_freelancer.findMany({
        where: {
            freelancer_id: freelancerProfile.id,
            status: "in_progress"
        },
        include: {
            project: {
                include: {
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    },
                    project_game_engines: {
                        include: { game_engine: true }
                    },
                    project_skills: {
                        include: { skill: true }
                    }
                }
            },
            proposal: {
                include: {
                    proposal_timelines: true
                }
            }
        }
    });

    // Format the result to include number of completed phases
    const formatted = activeProjects.map(pf => {
        const completedPhases = pf.proposal?.proposal_timelines.filter(
            t => t.status === "accepted"
        ).length || 0;

        return {
            projectId: pf.project.id,
            title: pf.project.title,
            client: pf.project.client,
            status: pf.status,
            assigned_at: pf.assigned_at,
            completedPhases,
            project_game_engines: pf.project.project_game_engines.map(e => e.game_engine),
            project_skills: pf.project.project_skills.map(s => s.skill)
        };
    });

    res.json(formatted);
});

// should return one of the develpoer related project project
export const getOneProjects = catchAsync(async (req, res, next) => {// still needs testing
    const userId = BigInt(req.user.id);
    const projectId = BigInt(req.params.id);

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Check if this project is assigned to the freelancer
    const projectFreelancer = await prisma.Project_freelancer.findFirst({
        where: {
            freelancer_id: freelancerProfile.id,
            project_id: projectId
        },
        include: {
            project: {
                include: {
                    client: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    },
                    project_game_engines: {
                        include: { game_engine: true }
                    },
                    project_skills: {
                        include: { skill: true }
                    },
                    proposals: {
                        include: {
                            freelancer: {
                                select: {
                                    id: true,
                                    user: {
                                        select: {
                                            first_name: true,
                                            last_name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            proposal: {
                include: {
                    proposal_timelines: true
                }
            }
        }
    });

    if (!projectFreelancer) {
        return res.status(404).json({ message: "Project not found or not assigned to this freelancer" });
    }

    res.json(projectFreelancer);
});

// logic of getting current balance in wallet, total earining(developr), pinding money in escrows pinding money from transtionss and all transtions histroy
export const getDetails = catchAsync(async (req, res, next) => { // still needs testing
    const userId = BigInt(req.user.id);

    // 1. Get wallet and current balance
    const wallet = await prisma.wallets.findFirst({
        where: { user_id: userId }
    });

    // 2. Get total earnings (sum of completed payments where this user is payee)
    const totalEarningsResult = await prisma.payments.aggregate({
        where: {
            payee_id: userId,
            status: "completed"
        },
        _sum: {
            amount: true
        }
    });
    const totalEarnings = totalEarningsResult._sum.amount || 0;

    // 3. Get pending money in escrows (status: pending or funded)
    const pendingEscrows = await prisma.escrows.findMany({
        where: {
            freelancer_id: userId,
            status: { in: ["pending", "funded"] }
        }
    });
    const pendingEscrowAmount = pendingEscrows.reduce((sum, e) => sum + Number(e.amount), 0);

    // 4. Get all wallet transactions (history)
    let walletTransactions = [];
    if (wallet) {
        walletTransactions = await prisma.wallet_transactions.findMany({
            where: { wallet_id: wallet.id },
            orderBy: { created_at: "desc" }
        });
    }

    // 5. Get pending money from wallet transactions (if you have a status field)
    // If not, you can skip or filter by type/direction if needed
    // Example: pending withdrawals
    const pendingWithdrawals = wallet
        ? await prisma.wallet_transactions.findMany({
            where: {
                wallet_id: wallet.id,
                type: "withdrawal",
                // Add status: "pending" if you have such a field
            }
        })
        : [];
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
        wallet: wallet ? {
            id: wallet.id.toString(),
            balance: wallet.balance.toString(),
            currency: wallet.currency
        } : null,
        totalEarnings: totalEarnings.toString(),
        pendingEscrowAmount: pendingEscrowAmount.toString(),
        pendingWithdrawalsAmount: pendingWithdrawalsAmount.toString(),
        walletTransactions: walletTransactions.map(tx => ({
            ...tx,
            id: tx.id.toString(),
            wallet_id: tx.wallet_id.toString(),
            amount: tx.amount.toString()
        }))
    });
});


export const apply = catchAsync(async (req, res, next) => {// need more testing
    const userId = BigInt(req.user.id);
    const { project_id, cover_letter, bid_amount, estimated_days, proposal_timelines } = req.body;

    // Validate input
    if (!project_id || !cover_letter || !bid_amount || !estimated_days || !Array.isArray(proposal_timelines) || proposal_timelines.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate each proposal_timeline object
    const allowedPhases = ["one", "two", "three", "four"];
    for (const [i, timeline] of proposal_timelines.entries()) {
        if (
            !timeline.description ||
            timeline.estimated_days === undefined ||
            timeline.estimated_days === null ||
            !timeline.phase_number
        ) {
            return res.status(400).json({
                message: `Invalid proposal_timelines at index ${i}: description, estimated_days, and phase_number are required.`
            });
        }
        if (typeof timeline.estimated_days !== "number" || timeline.estimated_days <= 0) {
            return res.status(400).json({
                message: `Invalid estimated_days at index ${i}: must be a positive number.`
            });
        }
        if (!allowedPhases.includes(timeline.phase_number)) {
            return res.status(400).json({
                message: `Invalid phase_number at index ${i}: must be one of ${allowedPhases.join(", ")}.`
            });
        }
    }

    // Get freelancer profile
    const freelancerProfile = await prisma.Freelancer_profile.findFirst({
        where: { user_id: userId }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Check if project is in 'waiting' status
    const project = await prisma.project.findUnique({ where: { id: BigInt(project_id) } });
    if (!project || project.status !== 'waiting') {
        return res.status(400).json({ message: "You can only apply to projects with status 'waiting'." });
    }

    // Check if already applied
    const existingProposal = await prisma.proposals.findFirst({
        where: {
            project_id: BigInt(project_id),
            freelancer_id: freelancerProfile.id
        }
    });
    if (existingProposal) {
        return res.status(409).json({ message: "You have already applied to this project." });
    }

    // Create proposal and proposal_timelines in a transaction
    let result = await prisma.$transaction(async (tx) => {
        const proposal = await tx.proposals.create({
            data: {
                project_id: BigInt(project_id),
                freelancer_id: freelancerProfile.id,
                cover_letter,
                bid_amount: Number(bid_amount),
                estimated_days: Number(estimated_days),
                status: "pending"
            }
        });

        // Create proposal_timelines
        for (const timeline of proposal_timelines) {
            await tx.proposal_timelines.create({
                data: {
                    proposal_id: proposal.id,
                    description: timeline.description,
                    estimated_days: Number(timeline.estimated_days),
                    phase_number: timeline.phase_number, // should be PhaseNumberEnum
                    status: "pending"
                }
            });
        }

        return proposal;
    });

    result = convertBigIntsToStrings(result);
    res.status(201).json({
        message: "Proposal submitted successfully.",
        proposal: result
    });
});


export const deleteProposal = catchAsync(async (req, res, next) => {
    // should delete a proposal by id and make sure the freelancer is the owner of the proposal
});

export const editProposal = catchAsync(async (req, res, next) => {
    // should edit a proposal by id and make sure the freelancer is the owner of the proposal
});

