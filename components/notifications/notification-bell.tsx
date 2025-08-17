'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Notification } from '@/lib/realtime-notifications';
import { NotificationItem } from '@/components/notifications/notification-item';
import { getSocket, SocketWithEmit } from '@/lib/socket';
import { useAuthStore } from '@/lib/store';
export function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<SocketWithEmit | null>(null);
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${user.id}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setHasUnread(data.some((n: Notification) => !n.isRead));
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user?.id]);
  const handleNewNotification = useCallback((newNotification: Notification) => {
    console.log('[NotificationBell] New notification received:', newNotification);
    setNotifications(prev => [newNotification, ...prev]);
    setHasUnread(true);
    console.log('New notification:', newNotification.message);
  }, []);
  useEffect(() => {
    if (!user?.id) {
      console.log('[NotificationBell] No user ID, skipping socket setup');
      return;
    }
    if (!socketRef.current) {
      socketRef.current = getSocket() as SocketWithEmit;
    }
    const socket = socketRef.current;
    if (!socket) return;
    let isMounted = true;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    console.log('[NotificationBell] Setting up socket connection for user:', user.id);
    const registerUser = async () => {
      if (!isMounted || !user?.id) return;
      try {
        console.log(`[NotificationBell] Registering user ${user.id}`);
        const registerResponse = await new Promise<{ success: boolean; error?: string }>((resolve) => {
          socket.emit('register', user.id, (response?: { success: boolean; error?: string }) => {
            resolve(response || { success: false, error: 'No response from server' });
          });
        });
        if (!isMounted) return;
        if (registerResponse.success) {
          console.log('[NotificationBell] Successfully registered with socket server');
          console.log(`[NotificationBell] Subscribing to notifications for user ${user.id}`);
          const subscribeResponse = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            socket.emit('subscribe_to_notifications', user.id, (response?: { success: boolean; error?: string }) => {
              resolve(response || { success: false, error: 'No response from server' });
            });
          });
          if (!isMounted) return;
          if (subscribeResponse.success) {
            console.log('[NotificationBell] Successfully subscribed to notifications');
            await fetchNotifications();
          } else {
            console.error('[NotificationBell] Failed to subscribe to notifications:', subscribeResponse.error || 'Unknown error');
          }
        } else {
          console.error('[NotificationBell] Failed to register with socket server:', registerResponse.error || 'Unknown error');
        }
      } catch (error) {
        console.error('[NotificationBell] Error during registration:', error);
      }
    };
    const onConnect = () => {
      console.log('[NotificationBell] Socket connected');
      if (!isMounted) return;
      setSocketConnected(true);
      registerUser().catch(console.error);
    };
    const onDisconnect = (reason: string) => {
      console.log('[NotificationBell] Socket disconnected:', reason);
      if (!isMounted) return;
      setSocketConnected(false);
      if (reason !== 'io client disconnect' && isMounted) {
        console.log('[NotificationBell] Attempting to reconnect...');
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        const attemptReconnect = (attempt = 1) => {
          if (!isMounted) return;
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          console.log(`[NotificationBell] Reconnect attempt ${attempt} in ${delay}ms`);
          reconnectTimeout = setTimeout(() => {
            if (!isMounted) return;
            if (!socket.connected) {
              console.log(`[NotificationBell] Attempting to reconnect (attempt ${attempt})`);
              socket.connect();
              if (!socket.connected) {
                attemptReconnect(attempt + 1);
              }
            }
          }, delay);
        };
        attemptReconnect();
      }
    };
    const onConnectError = (error: Error) => {
      console.error('[NotificationBell] Socket connection error:', error);
      if (!isMounted) return;
      setSocketConnected(false);
    };
    const onError = (error: Error) => {
      console.error('[NotificationBell] Socket error:', error);
      if (!isMounted) return;
      if ('message' in error && error.message.includes('authentication')) {
        console.error('[NotificationBell] Authentication error - user may need to re-authenticate');
      }
    };
    const setupEventListeners = () => {
      if (!socket) return;
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);
      socket.on('error', onError);
      socket.on('new_notification', handleNewNotification);
      socket.on('reconnect_attempt', (attempt: number) => {
        console.log(`[NotificationBell] Reconnection attempt ${attempt}`);
      });
      socket.on('reconnect_failed', () => {
        console.error('[NotificationBell] Failed to reconnect after multiple attempts');
      });
    };
    const initializeConnection = () => {
      if (!socket) return;
      setupEventListeners();
      if (!socket.connected) {
        console.log('[NotificationBell] Connecting to socket...');
        socket.connect();
      } else if (socket.connected) {
        console.log('[NotificationBell] Socket already connected, initializing...');
        onConnect();
      }
    };
    initializeConnection();
    return () => {
      console.log('[NotificationBell] Cleaning up socket connection...');
      isMounted = false;
      if (socket) {
        try {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('connect_error');
          socket.off('error');
          socket.off('new_notification');
          socket.off('reconnect_attempt');
          socket.off('reconnect_failed');
          if (user?.id) {
            console.log(`[NotificationBell] Unsubscribing from notifications for user ${user.id}`);
            socket.emit('unsubscribe_from_notifications', user.id, (response?: { success: boolean }) => {
              if (response?.success) {
                console.log('[NotificationBell] Successfully unsubscribed from notifications');
              } else {
                console.error('[NotificationBell] Failed to unsubscribe from notifications:', response || 'No response');
              }
            });
          }
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
          }
          console.log('[NotificationBell] Cleanup complete');
        } catch (error) {
          console.error('[NotificationBell] Error during cleanup:', error);
        }
      }
    };
  }, [user?.id, fetchNotifications, handleNewNotification]);
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen && hasUnread) {
      setHasUnread(false);
    }
  };
  return (
    <div className="relative">
      <button onClick={toggleNotifications} className="relative">
        {hasUnread ? (
          <BellRing className="h-6 w-6 text-yellow-500" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4 font-bold">Notifications</div>
          <div className="divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
