const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;
const connectedUsers = new Map();
const userSockets = new Map();   
app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  const io = new Server(httpServer, {
    path: '/api/socket_io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });
  io.engine.on('initial_headers', (headers, request) => {
    console.log('[Socket.IO] Setting initial headers for connection');
  });
  io.engine.on('headers', (headers, request) => {
    console.log('[Socket.IO] Setting headers for connection');
  });
  global.io = io;
  function getUserId(socket) {
    return connectedUsers.get(socket.id);
  }
  function trackUserSocket(userId, socketId) {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socketId);
    console.log(`[Socket.IO] User ${userId} now has ${userSockets.get(userId).size} active connections`);
  }
  function untrackUserSocket(userId, socketId) {
    if (userSockets.has(userId)) {
      const sockets = userSockets.get(userId);
      sockets.delete(socketId);
      if (sockets.size === 0) {
        userSockets.delete(userId);
        console.log(`[Socket.IO] User ${userId} has no more active connections`);
      } else {
        console.log(`[Socket.IO] User ${userId} has ${sockets.size} remaining connections`);
      }
    }
  }
  io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log(`[Socket.IO] New connection: ${clientId} (total connections: ${io.engine.clientsCount})`);
    console.log(`[Socket.IO] Transport: ${socket.conn.transport.name}`);
    socket.conn.on('upgrade', (transport) => {
      console.log(`[Socket.IO] Transport upgraded to: ${transport.name}`);
    });
    socket.on('register', (userId, ack) => {
      if (!userId) {
        const error = 'No userId provided for registration';
        console.error(`[Socket.IO] ${error}`);
        return ack?.({ success: false, error });
      }
      console.log(`[Socket.IO] Registering user ${userId} with socket ${clientId}`);
      connectedUsers.set(clientId, userId);
      trackUserSocket(userId, clientId);
      socket.join(userId);
      console.log(`[Socket.IO] User ${userId} joined room ${userId} (rooms: ${Array.from(socket.rooms).join(', ')})`);
      ack?.({ 
        success: true,
        message: `Successfully registered for user ${userId}`
      });
    });
    socket.on('subscribe_to_notifications', (userId, ack) => {
      if (!userId) {
        const error = 'No userId provided for notification subscription';
        console.error(`[Socket.IO] ${error}`);
        return ack?.({ success: false, error });
      }
      console.log(`[Socket.IO] User ${userId} (socket ${clientId}) subscribed to notifications`);
      const notificationRoom = `notifications_${userId}`;
      socket.join(notificationRoom);
      console.log(`[Socket.IO] User ${userId} joined notification room ${notificationRoom} (rooms: ${Array.from(socket.rooms).join(', ')})`);
      ack?.({ success: true });
    });
    socket.on('unsubscribe_from_notifications', (userId, ack) => {
      if (!userId) {
        const error = 'No userId provided for notification unsubscription';
        console.error(`[Socket.IO] ${error}`);
        return ack?.({ success: false, error });
      }
      const notificationRoom = `notifications_${userId}`;
      socket.leave(notificationRoom);
      console.log(`[Socket.IO] User ${userId} left notification room ${notificationRoom}`);
      ack?.({ success: true });
    });
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected (${socket.id}):`, reason);
      const rooms = Array.from(socket.rooms);
      if (rooms.length > 1) {
        console.log(`Cleaning up ${rooms.length - 1} rooms for disconnected socket ${socket.id}`);
      }
    });
  });
  const originalEmit = io.emit;
  io.emit = function(event, ...args) {
    if (event === 'new_notification') {
      console.log('Emitting notification to room:', args[0]);
    }
    return originalEmit.apply(this, [event, ...args]);
  };
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
