import { io, Socket, ManagerOptions, SocketOptions, Manager } from 'socket.io-client';
export type SocketWithEmit = Socket & {
  emitWithAck: <T = any>(event: string, ...args: any[]) => Promise<T>;
};
let socket: SocketWithEmit;
const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  return window.location.origin;
};
type CustomSocketOptions = Partial<ManagerOptions & SocketOptions> & {
  pingTimeout?: number;
  pingInterval?: number;
};
const SOCKET_CONFIG: CustomSocketOptions = {
  path: '/api/socket_io',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  pingTimeout: 10000,
  pingInterval: 25000,
};
export const getSocket = (): Socket => {
  if (!socket) {
    const url = getBaseUrl();
    console.log('[Socket] Initializing socket connection to:', url);
    socket = io(url, SOCKET_CONFIG);
    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      console.log('[Socket] Will attempt to reconnect automatically');
    });
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });
    socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket] Reconnection attempt ${attempt}`);
    });
    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
    });
    socket.on('ping', () => {
      console.log('[Socket] Ping received');
    });
    socket.on('pong', (latency) => {
      console.log(`[Socket] Pong received (latency: ${latency}ms)`);
    });
  }
  return socket;
};
export const ensureSocketConnection = (): void => {
  const socket = getSocket();
  if (!socket.connected) {
    console.log('[Socket] Manually connecting socket...');
    socket.connect();
  }
};
export const safeEmit = <T = any>(
  event: string, 
  data?: any, 
  callback?: (response: T) => void
): void => {
  try {
    const socket = getSocket();
    if (!socket.connected) {
      console.warn(`[Socket] Not connected, queuing event: ${event}`);
      socket.once('connect', () => {
        console.log(`[Socket] Processing queued event: ${event}`);
        socket.emit(event, data, callback);
      });
      if (socket.disconnected) {
        socket.connect();
      }
    } else {
      socket.emit(event, data, callback);
    }
  } catch (error) {
    console.error(`[Socket] Error emitting event ${event}:`, error);
  }
};
