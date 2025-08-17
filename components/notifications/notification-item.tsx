'use client';
import { Notification } from '@/lib/realtime-notifications';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';
interface NotificationItemProps {
  notification: Notification;
}
export function NotificationItem({ notification }: NotificationItemProps) {
  useEffect(() => {
    console.log('Rendering notification:', notification);
  }, [notification]);
  const formattedDate = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'just now';
  return (
    <div 
      className={`p-4 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{notification.message}</p>
          {notification.link && (
            <a 
              href={notification.link} 
              className="text-blue-600 hover:underline mt-1 inline-block"
              onClick={(e) => {
              }}
            >
              View details
            </a>
          )}
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {formattedDate}
      </div>
    </div>
  );
}
