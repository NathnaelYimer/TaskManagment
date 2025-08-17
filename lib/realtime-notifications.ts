import { sql } from '@/lib/database';
const getIO = () => {
  if (typeof window === 'undefined') {
    return (global as any).io;
  }
  return null;
};
export interface Notification {
  id?: string;
  userId: string;
  message: string;
  link?: string;
  isRead?: boolean;
  createdAt?: Date;
}
interface DbNotification {
  id: string;
  user_id: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: Date;
}
class RealtimeNotificationService {
  public async createNotification(notification: Notification): Promise<Notification | null> {
    console.log('[RealtimeNotificationService] Creating notification:', notification);
    try {
      const query = `
        INSERT INTO notifications (user_id, message, link)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, message, link, is_read, created_at
      `;
      const params = [
        notification.userId, 
        notification.message, 
        notification.link || null
      ];
      console.log('[RealtimeNotificationService] Executing database query:', { query, params });
      const result = await sql.query(query, params);
      if (!Array.isArray(result) || result.length === 0) {
        console.error('[RealtimeNotificationService] Failed to save notification to database - no rows returned');
        return null;
      }
      const dbNotification = result[0] as DbNotification;
      console.log('[RealtimeNotificationService] Saved notification to database:', dbNotification);
      const savedNotification: Notification = {
        id: dbNotification.id,
        userId: dbNotification.user_id,
        message: dbNotification.message,
        link: dbNotification.link || undefined,
        isRead: dbNotification.is_read,
        createdAt: dbNotification.created_at,
      };
      const io = getIO();
      if (io) {
        const userId = notification.userId;
        console.log(`[RealtimeNotificationService] Sending notification to user ${userId}:`, savedNotification);
        const rooms = io.sockets.adapter.rooms;
        console.log(`[RealtimeNotificationService] Active rooms:`, Array.from(rooms.keys()));
        io.to(userId).emit('new_notification', savedNotification);
        console.log(`[RealtimeNotificationService] Emitted to user room: ${userId}`);
        const notificationRoom = `notifications_${userId}`;
        io.to(notificationRoom).emit('new_notification', savedNotification);
        console.log(`[RealtimeNotificationService] Emitted to notification room: ${notificationRoom}`);
        console.log(`[RealtimeNotificationService] User room exists:`, rooms.has(userId));
        console.log(`[RealtimeNotificationService] Notification room exists:`, rooms.has(notificationRoom));
      } else {
        console.error('[RealtimeNotificationService] IO instance not available for sending notification');
      }
      return savedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
}
export const realtimeNotificationService = new RealtimeNotificationService();
