import { NextResponse } from 'next/server';
import { initSocketServer } from '@/lib/socket-server';
import { Server as HttpServer } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
declare global {
  var httpServer: HttpServer;
}
class MockSocket extends Socket {
  server: any;
  constructor() {
    super();
    this.server = global.httpServer;
  }
}
export async function GET() {
  if (!global.httpServer) {
    return NextResponse.json(
      { error: 'HTTP server not initialized' },
      { status: 500 }
    );
  }
  const mockRes = {
    socket: new MockSocket(),
    status: function() { return this; },
    json: function() { return this; },
    send: function() { return this; },
    setHeader: function() { return this; },
    end: function() { return this; },
  };
  initSocketServer(mockRes as any);
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
