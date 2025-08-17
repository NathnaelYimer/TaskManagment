import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { Notification } from '@/lib/realtime-notifications';
import { verifyAuth } from '@/lib/api-auth';
interface DbNotification {
  id: string;
  user_id: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: Date;
}
export async function GET(req: NextRequest) {
  console.log('[Notifications API] GET request received');
  const auth = await verifyAuth(req);
  if (auth.error) {
    console.error('[Notifications API] Authentication failed:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    console.log(`[Notifications API] Fetching notifications for user: ${auth.user?.id}`);
    const query = `
      SELECT id, user_id, message, link, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    console.log('[Notifications API] Executing query:', query);
    const notifications = await sql.query(query, [auth.user?.id]);
    if (!Array.isArray(notifications)) {
      console.error('[Notifications API] Unexpected query result format:', notifications);
      return NextResponse.json({ error: 'Unexpected response from database' }, { status: 500 });
    }
    console.log(`[Notifications API] Found ${notifications.length} notifications`);
    const formattedNotifications: Notification[] = (notifications as DbNotification[]).map(n => {
      const notification: Notification = {
        id: n.id,
        userId: n.user_id,
        message: n.message,
        link: n.link || undefined,
        isRead: n.is_read,
        createdAt: n.created_at,
      };
      console.log('[Notifications API] Notification:', notification);
      return notification;
    });
    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
