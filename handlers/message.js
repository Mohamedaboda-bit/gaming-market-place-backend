import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import {convertBigIntsToStrings} from "../Utilities/saveJson.js"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getCanvos = catchAsync(async (req, res, next) => { // / still under development and neeeds testing later
    const userId = BigInt(req.user.id);

    // Get all conversation_participants for this user (client)
    const conversationParticipants = await prisma.conversation_participants.findMany({
        where: { user_id: userId },
        include: {
            conversation: {
                include: {
                    conversation_participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: { sent_at: "desc" },
                        take: 1 // Latest message
                    }
                }
            }
        }
    });

    // Format the result to show conversations with participants and last message
    let  conversations = conversationParticipants.map(cp => {
        const convo = cp.conversation;
        return {
            conversationId: convo.id,
            participants: convo.conversation_participants.map(p => p.user),
            lastMessage: convo.messages[0] || null
        };
    });
    conversations = convertBigIntsToStrings(conversations)
    res.json(conversations);
});

// logic of getting one Conversation and it's messages (last 100)
// you will get the conversation id from the url and the user id from the req.user.id 
// if the user is not a part of the conversation you will return a 403 error
// if the user is admin you will return all the messages in this conversation
export const getACanvo = catchAsync(async (req, res, next) => {
    const conversationId = parseInt(req.params.id);
    const userId = BigInt(req.user.id);
    const userRole = req.user.role;

    // Check if user is a participant in the conversation
    const isParticipant = await prisma.conversation_participants.findFirst({ // still under development and more testing needed
        where: {
            conversation_id: conversationId,
            user_id: userId
        }
    });

    // If not a participant and not admin, deny access
    if (!isParticipant && userRole !== 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Forbidden: Not a participant' });
    }

    // If admin, return all messages
    let messages = await prisma.messages.findMany({
        where: { conversation_id: conversationId },
        orderBy: { sent_at: 'desc' },
        take: userRole === 'admin' ? undefined : 100,
        include: {
            sender: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true
                }
            }
        }
    });

    // Get conversation participants
    let participants = await prisma.conversation_participants.findMany({
        where: { conversation_id: conversationId },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true
                }
            }
        }
    });
    messages = convertBigIntsToStrings(messages)
    participants = convertBigIntsToStrings(participants)
    res.status(200).json({
        status: 'success',
        data: {
            conversationId,
            participants: participants.map(p => p.user),
            messages
        }
    });
});

// logic of getting all Conversations for adimin (latest 100), get one message from each conversation for placeholder
export const getAllConversations = catchAsync(async (req, res, next) => {// still under development and more testing needed

    // Get the latest 100 conversations
    const conversations = await prisma.conversations.findMany({
        orderBy: { created_at: 'desc' },
        take: 100,
        include: {
            conversation_participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            },
            messages: {
                orderBy: { sent_at: 'desc' },
                take: 1 // Latest message as placeholder
            }
        }
    });

    // Format the result
    const result = conversations.map(convo => ({
        conversationId: convo.id,
        participants: convo.conversation_participants.map(p => p.user),
        lastMessage: convo.messages[0] || null
    }));

    res.status(200).json({ status: 'success', data: result });
});

// should send a message to a conversation
// should send a notification to the other participant
// should update the conversation with the new message
// should return the new message
// should check if the user is a participant in the conversation
// should check if the message is not empty
// should check if the message is not too long
// should check if the message is not too short
export const sendMessage = catchAsync(async (req, res, next) => {
    const userId = BigInt(req.user.id);
    const { message ,conversationId} = req.body;

    // Validate input
    if (!conversationId || !message || typeof message !== 'string' || message.trim().length < 1 || message.length > 2000) {
        return res.status(400).json({ status: 'fail', message: 'Invalid conversationId or message format' });
    }

    // Check if conversation exists
    const conversation = await prisma.conversations.findUnique({
        where: { id: Number(conversationId) }
    });
    if (!conversation) {
        return res.status(404).json({ status: 'fail', message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = await prisma.conversation_participants.findFirst({
        where: {
            conversation_id: Number(conversationId),
            user_id: userId
        }
    });
    if (!isParticipant) {
        return res.status(403).json({ status: 'fail', message: 'You are not a participant in this conversation' });
    }

    // Create the message
    let newMessage = await prisma.messages.create({
        data: {
            conversation_id: Number(conversationId),
            sender_id: userId,
            message,
            has_attachment: false
        },
        include: {
            sender: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true
                }
            }
        }
    });

    // Update conversation's updated_at
    await prisma.conversations.update({
        where: { id: Number(conversationId) },
        data: { updated_at: new Date() }
    });

    // Notify other participants
    const participants = await prisma.conversation_participants.findMany({
        where: {
            conversation_id: Number(conversationId),
            user_id: { not: userId }
        }
    });
    const notifications = participants.map(p =>
        prisma.notifications.create({
            data: {
                user_id: p.user_id,
                type: 'new_message',
                title: 'New Message',
                message: `You have a new message in conversation #${conversationId}`
            }
        })
    );
    await Promise.all(notifications);
    newMessage = convertBigIntsToStrings(newMessage)
    res.status(201).json({ status: 'success', data: newMessage });
});

// if client/admin/moderator sned a message to a freelancer it's okey
//  but if a freelancer send a message to a client it's not okey (freelcaner can not start a canvo with a client direclty or admin or moderator because thier will be an  endpoint for this)
// should start a new conversation with a freelancer and send one message
// should check if the user we send the message to is a freelancer and he has a propossel on one the client projects we can do this vie the proposal id in the body of the request
// should create a new conversation in the database
// should return the new conversation
// should send a notification to the freelancer
export const startConversation = catchAsync(async (req, res, next) => {
    // Only client, admin, or moderator can start a conversation
    const senderId = BigInt(req.user.id);
    const senderRole = req.user.role;
    const { freelancerId, message, proposalId } = req.body;

    if (!proposalId || !freelancerId || !message || typeof message !== 'string' || message.trim().length < 1 || message.length > 2000) {
        return res.status(400).json({ status: 'fail', message: 'proposalId, freelancerId, and valid message are required' });
    }

    // Fetch proposal, project, and moderators
    const proposal = await prisma.proposals.findUnique({
        where: { id: BigInt(proposalId) },
        include: {
            project: {
                include: {
                    project_moderators: true
                }
            }
        }
    });
    if (!proposal) {
        return res.status(404).json({ status: 'fail', message: 'Proposal not found' });
    }
    const project = proposal.project;
    if (!project) {
        return res.status(404).json({ status: 'fail', message: 'Project not found' });
    }
    const isModerated = project.is_moderated;
    const projectId = project.id;
    const moderatorParticipants = isModerated
        ? project.project_moderators.map(m => ({ user_id: m.moderator_id, role: 'moderator' }))
        : [];

    // Check that the freelancer exists
    const freelancerProfile = await prisma.Freelancer_profile.findUnique({
        where: { id: BigInt(freelancerId) },
        include: { user: true }
    });
    if (!freelancerProfile) {
        return res.status(404).json({ status: 'fail', message: 'Freelancer not found' });
    }

    // Only client, admin, or moderator can start a conversation
    if (!['client', 'admin', 'moderator'].includes(senderRole)) {
        return res.status(403).json({ status: 'fail', message: 'Freelancers cannot start a conversation with a client/admin/moderator directly.' });
    }

    // If client, check that the freelancer has a proposal on this project
    if (senderRole === 'client' && proposal.freelancer_id !== BigInt(freelancerId)) {
        return res.status(403).json({ status: 'fail', message: 'Freelancer does not have a proposal on this project' });
    }

    // Prevent duplicate conversation for the same project between client and freelancer
    const existingConvos = await prisma.conversations.findMany({
        where: { project_id: projectId },
        include: {
            conversation_participants: true
        }
    });
    const convoExists = existingConvos.some(convo => {
        const participantIds = convo.conversation_participants.map(p => String(p.user_id));
        return participantIds.includes(String(senderId)) && participantIds.includes(String(freelancerProfile.user_id));
    });
    if (convoExists) {
        return res.status(409).json({ status: 'fail', message: 'A conversation for this project between you and this freelancer already exists.' });
    }

    // Create the conversation, participants, and initial message in a transaction
    let result = await prisma.$transaction(async (tx) => {
        // 1. Create conversation
        const conversation = await tx.conversations.create({
            data: {
                is_moderated: isModerated,
                project_id: projectId
            }
        });
        // 2. Add participants (sender, freelancer, and moderators if any)
        const participants = [
            { conversation_id: conversation.id, user_id: senderId, role: senderRole },
            { conversation_id: conversation.id, user_id: freelancerProfile.user_id, role: 'freelancer' },
            ...moderatorParticipants.map(m => ({ conversation_id: conversation.id, user_id: m.user_id, role: m.role }))
        ];
        await tx.conversation_participants.createMany({ data: participants });
        // 3. Create initial message
        const newMessage = await tx.messages.create({
            data: {
                conversation_id: conversation.id,
                sender_id: senderId,
                message,
                has_attachment: false
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        // 4. Notify freelancer
        await tx.notifications.create({
            data: {
                user_id: freelancerProfile.user_id,
                type: 'new_message',
                title: 'New Conversation',
                message: `You have a new conversation from ${req.user.first_name} ${req.user.last_name}`
            }
        });
        // 5. Notify moderators if any
        await Promise.all(moderatorParticipants.map(m =>
            tx.notifications.create({
                data: {
                    user_id: m.user_id,
                    type: 'new_message',
                    title: 'New Conversation',
                    message: `You have been added as a moderator to a new conversation for project '${project.title}'`
                }
            })
        ));
        return { conversation, newMessage };
    });
    result = convertBigIntsToStrings(result)
    res.status(201).json({ status: 'success', data: result });
});
