import catchAsync from "../Utilities/wrapperAsyncCatch.js"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//should return last 10 noticaftions for this user
export const getLastTen = catchAsync(async (req, res, next)=>{
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const notifications = await prisma.notifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 10
    });

    res.status(200).json({ status: 'success', data: notifications });
});

// should update the notification to read
export const isRead = catchAsync(async (req, res, next)=>{
    const userId = req.user?.id;
    const notificationId  = req.params.id;
    if (!notificationId) {
        return res.status(400).json({ status: 'fail', message: 'notificationId is required' });
    }

    // Fetch the notification to check ownership
    const notification = await prisma.notifications.findUnique({
        where: { id: BigInt(notificationId) }
    });
    if (!notification) {
        return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    }
    if (BigInt(notification.user_id) !== BigInt(userId)) {
        return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this notification' });
    }

    // Update the notification to read
    await prisma.notifications.update({
        where: { id: BigInt(notificationId) },
        data: { is_read: true }
    });

    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
});