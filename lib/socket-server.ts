import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { NextApiResponse } from 'next';
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: Server;
    };
  };
};
const users = new Map<string, string>();
export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    return res;
  }
  console.log('New Socket.io server...');
  const io = new Server(res.socket.server, {
    path: '/api/socket_io',
    addTrailingSlash: false,
  });
  res.socket.server.io = io;
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);
    socket.on('register', (userId: string) => {
      if (userId) {
        users.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
      }
    });
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      for (const [userId, id] of users.entries()) {
        if (id === socket.id) {
          users.delete(userId);
          break;
        }
      }
    });
  });
  return res;
};
export const getIoInstance = () => {
  if (global.httpServer && global.httpServer.io) {
    return global.httpServer.io as Server;
  }
  return null;
};
export const getConnectedUsers = () => {
  return users;
};
