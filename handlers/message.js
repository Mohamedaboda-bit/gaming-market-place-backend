import catchAsync from "../Utilities/wrapperAsyncCatch.js"
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
    const conversations = conversationParticipants.map(cp => {
        const convo = cp.conversation;
        return {
            conversationId: convo.id,
            participants: convo.conversation_participants.map(p => p.user),
            lastMessage: convo.messages[0] || null
        };
    });

    res.json(conversations);
});

export const getACanvo =catchAsync(async (req, res, next)=>{
    // logic of getting one Conversation and it's messages
})

export const getAllConversations =catchAsync(async (req, res, next)=>{
    // logic of getting all Conversations for adimin
})

